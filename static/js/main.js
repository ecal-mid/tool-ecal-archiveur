'use strict';

let appEl = document.querySelector('.app');
let mainEl = appEl.querySelector('.app main');
let assignment = new Assignment();
let assignmentEntriesRef;
let entriesRef;
let database = firebase.database();

/**
 * Setup the application.
 */
function setup() {
  let avatarEl = document.querySelector('.avatar');
  avatarEl.addEventListener('click', () => window.location.href = '/logout');
  window.addEventListener('popstate', onPopState, false);
  window.onpopstate = onPopState;
  //
  let year = document.body.dataset['year'];
  let docId = document.body.dataset['assignment'];
  let groupId = document.body.dataset['group'];
  if (!year || !docId) {
    return;
  }
  setNav(year, docId, groupId);
}

/**
 * Load a new document (if needed) and group and update render.
 */
function load() {
  // Year
  assignment.year = document.body.dataset['year'];
  if (!assignment.year) {
    return;
  }

  // Group
  assignment.groupId = document.body.dataset['group'];

  if (assignment.docId &&
      document.body.dataset['assignment'] == assignment.docId) {
    assignment.renderEntries(assignment.entries, false);
    // Update selected group in menu for admins.
    let gps = document.body.querySelectorAll('.groups .group');
    if (gps.length) {
      for (let g of gps) {
        g.classList.remove('selected');
      }
      gps[assignment.groupId].classList.add('selected');
    }
    // Update list of group names.
    let groupNames = document.body.querySelector('.group-names');
    let groups = assignment.data.assignment.groups;
    let names = groups[assignment.groupId].map((g) => g.name);
    groupNames.innerHTML = names.join(', ');
    return;
  } else {
    assignment.docId = document.body.dataset['assignment'];
    if (!assignment.docId) {
      return;
    }
  }

  mainEl.classList.add('loading');

  // retrieve assignment description
  let url = `/api/a/${assignment.year}/${assignment.docId}`;
  qwest.get(url)
      .then((xhr, data) => {
        data = JSON.parse(data)[assignment.year][assignment.docId];
        // Render assignment.
        assignment.render(data);
        // connect to firebase entries endpoints
        connectFirebase();
        // Add view if not added yet.
        if (!assignment.el.parentNode) {
          mainEl.append(assignment.el);
        }
        // Show left menu
        appEl.classList.remove('fold');
        // Redirect to correct group if user is not admin and in the wrong
        // group.
        let userId = document.body.dataset.userId;
        if (!isAdmin(userId, data)) {
          let g = getUserGroup(userId, data);
          if (assignment.groupId != g) {
            setNav(assignment.year, document.body.dataset['assignment'], g);
          }
        }
      })
      .catch((e) => console.error(e));
}

/**
 * Connect to firebase endpoints.
 */
function connectFirebase() {
  assignmentEntriesRef =
      database.ref(`${assignment.year}/${assignment.docId}/assignment/entries`);
  assignmentEntriesRef.off();
  assignmentEntriesRef.on('value', (data) => {
    // Remove loader.
    mainEl.classList.remove('loading');
    // Render entries.
    assignment.renderEntries(data.val(), true);
  });
  entriesRef = database.ref(`${assignment.year}/${assignment.docId}/entries`);
  entriesRef.off();
  entriesRef.on('value', (data) => {
    // Render entries.
    assignment.renderEntries(data.val(), false);
  });
}

/**
 * Returns the first group found in this assignment with the input user
 * @param  {String} userId The user id.
 * @param  {Object} data The data object.
 * @return {Int}           The group id.
 */
function getUserGroup(userId, data) {
  for (let i = 0; i < data.assignment.groups.length; i++) {
    const g = data.assignment.groups[i];
    for (let u of g) {
      if (u.id == userId) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Returns true if the user is admin.
 * @param  {String} userId The user id.
 * @param  {Object} data The data object.
 * @return {Int}           The group id.
 */
function isAdmin(userId, data) {
  for (let u of data.assignment.admins) {
    if (u.id == userId) {
      return true;
    }
  }
  return false;
}

/**
 * Temporary util to push data to firebase.
 * @param  {Object} entry the entry data.
 */
function pushEntry(entry) {
  if (entry.is_assignment) {
    assignment.assignmentEntries.push(entry);
    updateAssignmentEntries();
  } else {
    assignment.entries.push(entry);
    updateEntries();
  }
}

/**
 * Updates assignment entries on firebase.
 */
function updateAssignmentEntries() {
  assignmentEntriesRef.set(assignment.assignmentEntries);
}

/**
 * Updates entries on firebase.
 */
function updateEntries() {
  entriesRef.set(assignment.entries);
}

/**
 * Event handler for window pop state event. Handles navigation update.
 * @param  {PopStateEvent} ev The popstate event.
 */
function onPopState(ev) {
  // ev.preventDefault();
  setNav(ev.state.year, ev.state.assignment, ev.state.group);
}


/**
 * Update navigation.
 * @param {String} year       The current academic year.
 * @param {String} assignment The assignment id.
 * @param {String} group      The group id.
 */
function setNav(year, assignment, group) {
  document.body.dataset['year'] = year;
  document.body.dataset['assignment'] = assignment;
  document.body.dataset['group'] = group;
  window.history.pushState(
      {year: year, assignment: assignment, group: group},
      year + assignment + group, `/a/${year}/${assignment}/${group}`);
  load();
}

let foldEl = document.body.querySelector('#toggle-menu');
foldEl.addEventListener('click', () => appEl.classList.toggle('fold'), false);

setup();

'use strict';

let mainEl = document.querySelector('.app main');
let assignment = new Assignment();
let assignmentRef;
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
  let year = document.body.dataset['year'];
  if (!year) {
    return;
  }
  // Assignment
  let docId = document.body.dataset['assignment'];
  if (!docId) {
    return;
  }
  // Group
  let groupId = document.body.dataset['group'];
  if (!groupId) {
  }

  if (document.body.dataset['assignment'] == assignment.docId) {
    assignment.render(assignment.data, docId, groupId);
    return;
  }

  mainEl.classList.add('loading');

  assignmentRef = database.ref(`${year}/${docId}`);
  assignmentRef.off();
  assignmentRef.on('value', (data) => {
    mainEl.classList.remove('loading');

    let val = data.val();
    if (val == null) {
      console.error('Assignment not found.');
      return;
    }

    // We need to refresh the closure variables
    docId = document.body.dataset['assignment'];
    groupId = document.body.dataset['group'];

    // Redirect to correct group if user is not admin and in the wrong group.
    let userId = document.body.dataset.userId;
    if (!isAdmin(userId, val)) {
      let g = getUserGroup(userId, val);
      if (groupId != g) {
        setNav(year, docId, g);
        return;
      }
    }

    // Render the template
    assignment.render(data.val(), docId, groupId);
  });

  if (!assignment.el.parentNode) {
    mainEl.append(assignment.el);
  }
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
 * @param  {Object} data the full assignment data.
 */
function pushData(data) {
  assignmentRef.set(assignment.data);
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


setup();

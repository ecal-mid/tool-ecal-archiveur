'use strict';

let appEl = document.querySelector('.app');
let mainEl = appEl.querySelector('.app main');
let assignment = new Assignment();
let assignmentEntriesRef;
let entriesRef;
let database = firebase.database();

// Build full users by id dictionary
let usersById = {};
for (let u in users) {
  if (u) {
    let user = usersById[u] = users[u];
    user.id = u;
    if (user.img == '?') {
      user.img = '/static/res/user.svg';
    } else {
      user.img = 'https://intranet.ecal.ch/img/photo/' + user.img;
    }
  }
}

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
  if (!docId) {
    appEl.classList.remove('fold');
    return;
  }
  setNav(year, docId, groupId);
}

/**
 * Load a new document (if needed) and group and update render.
 * @param  {Boolean} force Force re-rendering of the assignment.
 */
function load(force) {
  // Year
  assignment.year = document.body.dataset['year'];
  if (!assignment.year) {
    return;
  }

  // Group
  assignment.groupId = document.body.dataset['group'];

  if (!force && assignment.docId &&
      document.body.dataset['assignment'] == assignment.docId) {
    assignment.renderEntries(assignment.entries, false);
    // Update selected group in menu for admins.
    let gps = document.body.querySelectorAll('.groups .group');
    if (gps.length) {
      for (let g of gps) {
        if (g.dataset['id'] == assignment.groupId) {
          g.classList.add('selected');
        } else {
          g.classList.remove('selected');
        }
      }
    }
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
        if (window.innerWidth > 800) {
          appEl.classList.remove('fold');
        }
        // Redirect to correct group if user is not admin and in the wrong
        // group.
        let userId = document.body.dataset.userId;
        if (!document.body.dataset.admin) {
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
      if (u == userId) {
        return Groups.getGroupId(g);
      }
    }
  }
  return -1;
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
  // if (year) {
  document.body.dataset['year'] = year;
  // }
  // if (assignment) {
  document.body.dataset['assignment'] = assignment;
  // }
  if (group) {
    document.body.dataset['group'] = group;
  } else {
    delete document.body.dataset['group'];
  }
  let state = {year: year, assignment: assignment, group: group};
  let url = `/a/${year}/${assignment}` + (group ? '/' + group : '');
  window.history.pushState(state, url, url);
  window.parent.postMessage({a: state, b: url, c: url}, '*');
  load();
}

let foldEl = document.body.querySelector('#toggle-menu');
foldEl.addEventListener('click', () => appEl.classList.toggle('fold'), false);

setup();

window.addEventListener('resize', () => {
  if (window.innerWidth < 800 && !appEl.classList.contains('fold')) {
    appEl.classList.add('fold');
  } else if (window.innerWidth > 800 && appEl.classList.contains('fold')) {
    appEl.classList.remove('fold');
  }
});

MobileDragDrop.polyfill({
  dragImageTranslateOverride:
      MobileDragDrop.scrollBehaviourDragImageTranslateOverride,
});

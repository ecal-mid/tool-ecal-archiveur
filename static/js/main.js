'use strict';

let mainEl = document.querySelector('.app main');
let assignment = new Assignment();

/**
 * Setup the application.
 */
function setup() {
  let avatarEl = document.querySelector('.avatar');
  avatarEl.addEventListener('click', () => window.location.href = '/logout');
  window.addEventListener('popstate', onPopState, false);
  window.onpopstate = onPopState;
  load();
}

/**
 * Load a new document (if needed) and group and update render.
 */
function load() {
  // Assignment
  let docId = document.body.dataset['assignment'];
  if (!docId) {
    return;
  }
  // Group
  let groupId = document.body.dataset['group'];
  if (!groupId) {
  }

  if (docId == assignment.docId) {
    assignment.render(assignment.data, docId, groupId);
    return;
  }

  // Load document file.
  let url = `/static/data/${docId}.json`;
  qwest.get(url)
      .then((xhr, data) => {
        assignment.render(data, docId, groupId);
        if (!assignment.el.parentNode) {
          mainEl.append(assignment.el);
        }
      })
      .catch((e) => console.error(e));
}

/**
 * Event handler for window pop state event. Handles navigation update.
 * @param  {PopStateEvent} ev The popstate event.
 */
function onPopState(ev) {
  // ev.preventDefault();
  setNav(ev.state.assignment, ev.state.group);
}


/**
 * Update navigation.
 * @param {String} assignment The assignment id.
 * @param {String} group      The group id.
 */
function setNav(assignment, group) {
  document.body.dataset['assignment'] = assignment;
  document.body.dataset['group'] = group;
  window.history.pushState(
      {assignment: assignment, group: group}, assignment + group,
      `/a/${assignment}/${group}`);
  load();
}

setup();

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
  // Load document file.
  let url = `/static/data/${docId}.json`;
  qwest.get(url)
      .then((xhr, data) => {
        assignment.render(data, docId, groupId);
        mainEl.append(assignment.el);
      })
      .catch((e) => console.error(e));
}

function onPopState(ev) {
  ev.preventDefault();
  console.log(ev);
}


function setNav(assignment, group) {
  document.body.dataset['assignment'] = assignment;
  document.body.dataset['group'] = group;
  window.history.pushState(
      {assignment: assignment, group: group}, assignment + group,
      `/a/${assignment}/${group}`);
  load();
}

setup();

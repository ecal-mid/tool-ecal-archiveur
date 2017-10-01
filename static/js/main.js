'use strict';

let mainEl = document.querySelector('.app main');

/**
 * Setup the application.
 */
function setup() {
  // api.ls('/').then((data) => console.log(data));
  let avatarEl = document.querySelector('.avatar');
  avatarEl.addEventListener('click', () => window.location.href = '/logout');
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
        let a = new Assignment(data, groupId);
        a.render();
        mainEl.append(a.el);
      })
      .catch((e) => console.error(e));
}

setup();

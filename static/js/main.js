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
  let url = '/static/data/test_assignment.json';
  qwest.get(url)
      .then((xhr, data) => {
        let a = new Assignment();
        a.render(data);
        mainEl.append(a.el);
      })
      .catch((e) => console.error(e));
}

setup();

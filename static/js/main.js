'use strict';


/**
 * Setup the application.
 */
function setup() {
  // api.ls('/').then((data) => console.log(data));
  let avatarEl = document.querySelector('.avatar');
  avatarEl.addEventListener('click', () => window.location.href = '/logout');
  let formEl = document.querySelector('.box');
  let uploadBox = new UploadBox(formEl);
}

setup();

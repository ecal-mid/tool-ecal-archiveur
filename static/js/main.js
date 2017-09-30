'use strict';


/**
 * Setup the application.
 */
function setup() {
  // api.ls('/').then((data) => console.log(data));
  let formEl = document.querySelector('.box');
  let uploadBox = new UploadBox(formEl);
}

setup();

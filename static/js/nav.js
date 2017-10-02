let navEl = document.body.querySelector('nav');

/**
 * Setup the navigation
 */
function setupNav() {
  let els = navEl.querySelectorAll('li a');
  for (let a of els) {
    a.addEventListener('click', onNavItemClicked, false);
  }
}

/**
 * Nav item click handler.
 * @param  {MouseEvent} ev The mouse event.
 */
function onNavItemClicked(ev) {
  ev.preventDefault();
  let els = navEl.querySelectorAll('li a');
  for (let a of els) {
    a.classList.remove('selected');
  }
  // console.log(ev.currentTarget.href);
  let a = ev.currentTarget;
  a.classList.add('selected');

  console.log(window.innerWidth);
  if (window.innerWidth < 800) {
    appEl.classList.add('fold');
  }

  setNav(a.dataset['year'], a.dataset['assignmentId'], 0);
}


setupNav();

let newAEl = document.querySelector('.app nav .btn-new');
newAEl.addEventListener('click', startNewAssignment);


/**
 * Starts creation of new assignment.
 */
function startNewAssignment() {
  let aEl = mainEl.querySelector('.assignment');
  if (aEl) {
    aEl.style.display = 'none';
  }

  let formEl = mainEl.querySelector('.new-assignment-form');
  formEl.style.display = 'block';

  let btEl = mainEl.querySelector('.new-assignment-form .btn');
  btEl.addEventListener('click', () => {
    formEl.style.display = 'none';
    document.body.classList.add('loading');
  })
}

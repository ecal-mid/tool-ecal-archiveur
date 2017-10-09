let newAEl = document.querySelector('.app nav .btn-new');
if (newAEl) {
  newAEl.addEventListener('click', startNewAssignment);
}

/**
 * Checks validity of the form.
 */
function checkAssignment() {
  let formEl = mainEl.querySelector('.new-assignment-form');
  let courseEl = formEl.querySelector('[name="course-id"]');
  let groupEl = formEl.querySelector('[name="class-id"]');
  let nameEl = formEl.querySelector('[name="assignment-name"]');
  let createBtn = formEl.querySelector('[value="submit"]');

  // Disable all items.
  courseEl.disabled = true;
  nameEl.classList.add('disabled');
  createBtn.classList.add('disabled');

  // Progressively check and enable items.
  if (groupEl.value == '') {
    return;
  }
  courseEl.disabled = false;

  if (courseEl.value == '') {
    return;
  }
  nameEl.classList.remove('disabled');

  if (nameEl.value.length == 0) {
    return;
  }
  createBtn.classList.remove('disabled');
}

/**
 * Starts creation of new assignment.
 */
function startNewAssignment() {
  let aEl = mainEl.querySelector('.assignment');
  if (aEl) {
    aEl.classList.add('hidden');
  }

  let formEl = mainEl.querySelector('.new-assignment-form');
  formEl.classList.remove('hidden');

  let cancelBtn = formEl.querySelector('.btn-cancel');
  cancelBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (aEl) {
      aEl.classList.remove('hidden');
    }
    formEl.classList.add('hidden');
  });

  let courseEl = formEl.querySelector('[name="course-id"]');

  let groupEl = formEl.querySelector('[name="class-id"]');
  groupEl.addEventListener('change', (ev) => {
    let group = groupEl.value;
    for (let el of courseEl.children) {
      if (el.value == 'other' || el.value == '') {
        continue;
      }
      el.style.display = (el.value.indexOf(group) != -1) ? '' : 'none';
    }
    courseEl.value = '';
    checkAssignment();
  });

  courseEl.addEventListener('change', checkAssignment, false);

  let nameEl = formEl.querySelector('[name="assignment-name"]');
  nameEl.addEventListener('change', checkAssignment, false);

  let btEl = mainEl.querySelector('.new-assignment-form [value="submit"]');
  btEl.addEventListener('click', () => {
    formEl.style.display = 'none';
    document.body.classList.add('loading');
  }, false);
}

'use strict';

const UserFinder = (function() {
  let el = null;
  let users = null;
  let year = document.body.dataset['year'];
  let template = document.getElementById('user-card-tpl');
  if (template) {
    template = template.innerHTML;
  };
  let inputEl;
  let listEl;
  let callback = null;

  /**
   * Event handler for click on list item
   * @param  {MouseEvent} evt The MouseEvent object.
   */
  function onLiClicked(evt) {
    // evt.stopPropagation();
    // evt.preventDefault();
    if (callback) {
      let uid = evt.currentTarget.dataset['id'];
      callback(uid);
    }
    inputEl.value = null;
    hideList();
  }

  /**
   * Resets the the current selected user.
   */
  function resetFinder() {
    inputEl.value = '';
  }

  /**
   * Event Handler for focus on input item.
   * @param  {Event} evt The Event object.
   */
  function onInputFocus(evt) {
    resetFinder();
    showList();
  }

  /**
   * Event Handler for blur of input item.
   * @param  {Event} evt The Event object.
   */
  function onInputBlur(evt) {
    hideList();
  }

  /**
   * Event Handler for change of input value.
   * @param  {Event} evt The Event object.
   */
  function onInputChange(evt) {
    const val = inputEl.value;
    filterList(val);
  }

  /**
   * Shows the list of filtered users according to current input.
   */
  function showList() {
    listEl.style.display = 'block';
    filterList(inputEl.value);
  }

  /**
   * Shows the list of filtered users.
   */
  function hideList() {
    listEl.style.display = 'none';
  }

  /**
   * Performs filtering of the list according to current input.
   * @param {String} text Part of the name text to filter users with.
   */
  function filterList(text) {
    text = text.toLowerCase();
    let i = 0;
    while (listEl.hasChildNodes()) {
      listEl.removeChild(listEl.lastChild);
    }

    for (let u of users) {
      const name = u.name.toLowerCase();
      if (i < 5 && name.indexOf(text) != -1) {
        let output = ejs.render(template, u);
        let li = document.createElement('li');
        li.classList.add('user');
        li.addEventListener('click', onLiClicked, false);
        li.innerHTML = output;
        li.dataset['id'] = u.id;
        li.dataset['name'] = u.name;
        listEl.appendChild(li);
        i++;
      }
    }
  }

  /**
   * Setup the user finder input item.
   */
  function setupFinder() {
    // setup autocomplete list
    listEl = el.querySelector('ul.student-list');
    inputEl = el.querySelector('input.student-input');
    // setup input text
    inputEl.addEventListener('focus', onInputFocus);
    // inputEl.addEventListener('blur', onInputBlur);
    inputEl.addEventListener('input', onInputChange);
  }

  /**
   * Loads the finder
   * @param  {DomElement} containerEl The container
   * @param  {Function} cb Function called when a user is selected;
   */
  function setup(containerEl, cb) {
    if (!template) {
      return;
    }
    el = containerEl;
    callback = cb;
    // request the users list then setup the finder.
    qwest.get('/static/data/' + year + '/users.json')
        .then(function(xhr, data) {
          users = data;
          // Extend the global usersById object
          for (let u of users) {
            if (u.img == '?') {
              u.img = '/static/res/user.svg';
            } else {
              u.img = USER_PHOTOS_URL + u.img;
            }
            usersById[u.id] = {
              id: u.id,
              img: u.img,
              name: u.name,
            };
          }
          setupFinder();
        })
        .catch(function(e) {
          console.error(e);
        });
  }

  return {setup: setup, users: users};
})();

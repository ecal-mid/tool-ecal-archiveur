const Groups = (function() {
  let tpl = document.getElementById('edit-groups-tpl').innerHTML;
  let el = document.createElement('div');
  el.classList.add('modal-container');
  let hasChanged = false;

  /**
   * Compute a group id from the names.
   * @param  {Array} group An array of user ids.
   * @return {String}      An id based on the user ids
   */
  function getGroupId(group) {
    let gid = '';
    for (let u of group) {
      let firstName = u.split('.')[0];
      let lastName = u.split('.')[1];
      gid += firstName[0] + lastName[0] + lastName.substr(1) + '_';
    }
    gid = gid.substr(0, gid.length - 1);
    return gid;
  }

  /**
   * Preprocess groups data.
   * @param  {Object} data Assignment data object.
   * @return {Array}      The preprocessed groups data array
   */
  function preprocess(data) {
    let groups = [];
    for (let i = 0; i < data.assignment.groups.length; i++) {
      let group = {classes: [], users: [], name: '', id: ''};
      let g = data.assignment.groups[i];
      for (let u of g) {
        group.users.push(usersById[u]);
        let firstName = u.split('.')[0];
        let lastName = u.split('.')[1];
        group.name += firstName[0].toUpperCase() + '.' +
            lastName[0].toUpperCase() + lastName.substr(1, 2) + ' ';
      }
      group.name = group.name.substr(0, group.name.length - 1);
      group.id = getGroupId(g);
      if (group.id == assignment.groupId) {
        group.classes.push('selected');
      }
      groups.push(group);
    }
    return groups;
  }

  /**
   * Groups Editor.
   * @param  {Object} data Assignment data object.
   */
  function edit(data) {
    // Render the template.
    let groups = preprocess(data);
    el.innerHTML = ejs.render(tpl, {groups: groups});
    let groupsEl = el.querySelector('.groups-list');
    // Add interaction.
    let current = null;
    let groupsEls = el.querySelectorAll('.group');
    for (let gEl of groupsEls) {
      let avs = gEl.querySelectorAll('.avatar');
      for (let av of avs) {
        av.addEventListener('drag', () => {
          el.classList.add('dragging');
          av.classList.add('dragged-out');
          current = av;
        }, false);
        av.addEventListener('dragend', () => {
          el.classList.remove('dragging');
          av.classList.remove('dragged-out');
          current = null;
        }, false);
      }
      gEl.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        if (current) {
          gEl.classList.add('dragover');
        }
      }, false);
      gEl.addEventListener('dragleave', () => {
        gEl.classList.remove('dragover');
      }, false);
      gEl.addEventListener('dragenter', (ev) => {
        ev.preventDefault();
      }, false);
      gEl.addEventListener('drop', (ev) => {
        gEl.classList.remove('dragover');
        if (current && current.parentNode != gEl) {
          hasChanged = true;
          // Remove from group.
          let sourceId = Array.prototype.indexOf.call(
              groupsEl.children, current.parentNode);
          let sourceG = data.assignment.groups[sourceId];
          let userId = current.dataset['id'];
          let index = sourceG.indexOf(userId);
          sourceG.splice(index, 1);
          // Remove group if empty.
          if (sourceG.length == 0) {
            data.assignment.groups.splice(sourceId, 1);
            // Remove node to get proper indexing if we're adding the user to
            // another group.
            current.parentNode.remove();
          }
          // Now move the user.
          if (gEl.classList.contains('group-remove')) {
            // Do nothing. We're just removing the user.
          } else if (gEl.classList.contains('group-new')) {
            // Create a new group.
            data.assignment.groups.push([userId]);
          } else {
            // Add to existing group.
            let destId = Array.prototype.indexOf.call(groupsEl.children, gEl);
            let destG = data.assignment.groups[destId];
            destG.push(userId);
          }
          // Re-render.
          edit(data);
        }
      }, false);
    }
    // Show.
    mainEl.append(el);
    UserFinder.setup(el.querySelector('.student-finder'), (userId) => {
      hasChanged = true;
      // Add user to a new group.
      data.assignment.groups.push([userId]);
      // Re-render.
      edit(data);
    }, false);

    let cancelBt = el.querySelector('.btn-cancel');
    cancelBt.addEventListener('click', (ev) => {
      ev.preventDefault();
      el.remove();
    }, false);

    let submitBt = el.querySelector('[value="submit"]');
    submitBt.addEventListener('click', onValidateClicked, false);
  }

  /**
   * onValidateClicked.
   * @param  {MouseEvent} ev Event
   */
  function onValidateClicked(ev) {
    el.remove();
    if (hasChanged) {
      mainEl.classList.add('loading');
      api.update(assignment.year, assignment.docId, assignment.data)
          .then((data) => {
            load(true);
            hasChanged = false;
          });
    }
  }

  return {edit: edit, preprocess: preprocess, getGroupId: getGroupId};
})();

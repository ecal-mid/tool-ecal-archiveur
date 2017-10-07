const Groups = (function() {
  let tpl = document.getElementById('edit-groups-tpl').innerHTML;
  let el = document.createElement('div');
  el.classList.add('modal-container');
  let hasChanged = false;

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
        group.id += firstName[0] + lastName[0] + lastName.substr(1) + '_';
      }
      group.name = group.name.substr(0, group.name.length - 1);
      group.id = group.id.substr(0, group.id.length - 1);
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
  }

  el.addEventListener('click', (ev) => {
    if (ev.target.classList.contains('modal-container')) {
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
  }, false);

  return {edit: edit, preprocess: preprocess};
})();

/**
 * Class that manages data cleansing and preprocessing to render sssignments.
 */
class Assignment {
  /**
   * Constructor.
   */
  constructor() {
    this.data = null;
    this.docId = null;
    this.groupId = null;
    this.el = document.createElement('div');
    this.el.classList.add('assignment');
    this.user = {
      id: document.body.dataset['userId'],
      // img: document.body.querySelector('.avatar img').src,
    };
    this.tpls = {};
    for (let tpl of ['assignment-tpl', 'entry-tpl', 'new-entry-tpl']) {
      this.tpls[tpl] = document.getElementById(tpl).innerHTML;
    }
  }

  /**
   * Renders the assignment template using provided data.
   * @param  {object} data    A data object. The rendering pipeline shouldnt
   *                          make modification to this object.
   * @param  {[type]} docId   The document id being rendered.
   * @param  {[type]} groupId The group id requested
   */
  render(data, docId, groupId) {
    this.data = data;
    this.docId = docId;
    this.groupId = groupId;
    let processed = this.preprocess(data, docId, groupId);
    // Compile templates recursively
    let fn = ejs.compile(this.tpls['assignment-tpl'], {client: true});
    let html = fn(processed, null, (path, d) => {
      let pTplData = this.preprocessTemplateData(path, processed, d, groupId);
      if (pTplData) {
        return ejs.render(this.tpls[path], pTplData);
      }
    });
    this.el.innerHTML = html;
    // activate group toggles
    let groupEls = this.el.querySelectorAll('.groups .group');
    for (let el of groupEls) {
      el.addEventListener('click', this.onGroupClicked.bind(this), false);
    }
    // activate entries
    let entryEls = this.el.querySelectorAll('.entry-editable');
    for (let el of entryEls) {
      new Entry(el);
    }
    // activate new entry forms
    let newEntryEls = this.el.querySelectorAll('.new-entry');
    for (let el of newEntryEls) {
      new NewEntry(el);
    }
    // activate forms
    let formEls = this.el.querySelectorAll('.box');
    for (let el of formEls) {
      new UploadBox(el);
    }
  }

  /**
   * Preprocess data to simplify the template rendering.
   * @param  {object} data    The data to render.
   * @param  {String} docId   Current document id.
   * @param  {String} groupId Current group id.
   * @return {object}         An extended version of the input data
   */
  preprocess(data, docId, groupId) {
    // Build a dictionnary with details of all active users details
    let users = {};
    for (let u of data.assignment.admins) {
      users[u.id] = u;
      users[u.id].is_admin = true;
    }
    for (let g of data.assignment.groups) {
      for (let u of g) {
        users[u.id] = u;
      }
    }
    this.user = users[this.user.id];
    // Build custom group object with extra info such as progress.
    let groups = [];
    for (let i = 0; i < data.assignment.groups.length; i++) {
      let g = data.assignment.groups[i];
      let group = {classes: [], users: []};
      for (let u of g) {
        group.users.push(u);
      }
      if (i == groupId) {
        group.classes.push('selected');
      }
      groups.push(group);
    }
    // Better date formatting.
    let due =
        new Date(data.assignment['due-date']).toISOString().substring(0, 10);
    // Return our processed data object
    return {
      assignment: data.assignment,
      entries: data.entries,
      groups: groups,
      group: data.assignment.groups[groupId].map((g) => g.name),
      user: this.user,
      users: users,
      due: due,
    };
  }

  /**
   * Preprocess a template data to simplify the its rendering.
   * @param  {String} tpl         The template being rendered.
   * @param  {Object} processed   The preprocessed assignment data object.
   * @param  {Object} data        The template data.
   * @param  {String} groupId     The current group id.
   * @return {Object}         An extended version of the input data
   */
  preprocessTemplateData(tpl, processed, data, groupId) {
    switch (tpl) {
      case 'new-entry-tpl':
        let classe = [];
        if (data.is_assignment) {
          classe.push('is-assignment');
        }
        if (this.user.is_admin) {
          classe.push('admin-entry');
        }
        return {user: data.user, classes: classe};

      case 'entry-tpl':
        if (groupId && data.entry.group != groupId && !data.is_assignment) {
          return;
        }
        // Date
        let date = new Date(data.entry.date).toISOString().substring(0, 10);
        let classes = [];
        let result = {
          entry: data.entry,
          date: date,
          classes: classes,
          user: processed.users[data.entry.user],
        };
        // Status
        classes.push(data.entry.status);
        if (result.user.id == this.user.id) {
          classes.push('entry-editable');
        }
        if (data.is_assignment) {
          classes.push('is-assignment');
        }
        if (result.user.is_admin) {
          classes.push('admin-entry');
        }
        if (data.entry.file) {
          result.filename =
              data.entry.file.substr(data.entry.file.lastIndexOf('/') + 1);
          classes.push('file-entry');
        }
        return result;
      default:
    }
    return data;
  }

  /**
   * Handles clicks on group button.
   * @param  {MouseEvent} ev The MouseEvent object.
   */
  onGroupClicked(ev) {
    let year = document.body.dataset['year'];
    let groupId = ev.currentTarget.dataset['id'];
    let docId = document.body.dataset['assignment'];
    setNav(year, docId, groupId);
  }
}

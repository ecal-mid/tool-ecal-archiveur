/**
 * Class that manages data cleansing and preprocessing to render sssignments.
 */
class Assignment {
  /**
   * Constructor.
   */
  constructor() {
    this.data = null;
    this.year = null;
    this.docId = null;
    this.groupId = null;
    this.entries = [];
    this.assignmentEntries = [];
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
   */
  render(data) {
    this.data = data;
    let processed = this.processed = this.preprocess(data);
    // Compile templates recursively
    let fn = ejs.compile(this.tpls['assignment-tpl'], {client: true});
    let html = fn(processed, null, (path, d) => {
      let pTplData = this.preprocessTemplateData(path, d);
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
   * @return {object}         An extended version of the input data
   */
  preprocess(data) {
    // Build a dictionnary with details of all active users details
    let users = {};
    for (let u of data.assignment.admins) {
      users[u.id] = u;
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
      if (i == this.groupId) {
        group.classes.push('selected');
      }
      groups.push(group);
    }
    // Better date formatting.
    let due;
    if (data.assignment['due-date']) {
      due =
          new Date(data.assignment['due-date']).toISOString().substring(0, 10);
    }
    // Return our processed data object
    return {
      assignment: data.assignment,
      module: this.docId.split('-')[0],
      entries: data.entries,
      groups: groups,
      group: data.assignment.groups[this.groupId].map((g) => g.name),
      user: this.user,
      users: users,
      due: due,
    };
  }

  /**
   * Preprocess a template data to simplify the its rendering.
   * @param  {String} tpl         The template being rendered.
   * @param  {Object} data        The template data.
   * @return {Object}         An extended version of the input data
   */
  preprocessTemplateData(tpl, data) {
    switch (tpl) {
      case 'new-entry-tpl':
        let classe = [];
        if (data.is_assignment) {
          classe.push('is-assignment');
        }
        return {user: data.user, classes: classe};

      case 'entry-tpl':
        if (data.group != this.groupId && !data.is_assignment) {
          return;
        }
        // Date
        let date = new Date(data.date).toISOString().substring(0, 10);
        let classes = [];
        let result = {
          entry: data,
          date: date,
          classes: classes,
          user: this.processed.users[data.user],
        };
        // Status
        classes.push(data.status);
        if (result.user.id == this.user.id) {
          classes.push('entry-editable');
        }
        if (data.is_assignment) {
          classes.push('is-assignment');
        }
        if (data.is_admin) {
          classes.push('entry-align-alt');
        }
        if (data.file) {
          result.filename = data.file.substr(data.file.lastIndexOf('/') + 1);
          if (result.filename.length > 30) {
            let ext = result.filename.substr(result.filename.lastIndexOf('.'));
            result.filename = result.filename.substr(0, 30 - ext.length);
            result.filename += '...' + ext;
          }
          classes.push('file-entry');
        }
        return result;
      default:
    }
    return data;
  }

  /**
   * Renders the assignment entries.
   * @param  {Object} data The entries data array.
   * @param  {Boolean} isAssignment If these entries are part of the assignment.
   */
  renderEntries(data, isAssignment) {
    if (!data) {
      data = [];
    }
    let el;
    if (isAssignment) {
      this.assignmentEntries = data;
      el = this.el.querySelector('.assignment-entries .entries-list');
    } else {
      this.entries = data;
      el = this.el.querySelector('.assigned-entries .entries-list');
    }
    let tpl = 'entry-tpl';
    let render = '';
    for (let d of data) {
      if (!d) {
        continue;
      }
      d.is_assignment = isAssignment;
      let processed = this.preprocessTemplateData(tpl, d);
      if (processed) {
        render += ejs.render(this.tpls[tpl], processed);
      }
    }
    el.innerHTML = render;

    // activate entries
    let entryEls = el.querySelectorAll('.entry-editable');
    for (let eel of entryEls) {
      new Entry(eel);
    }
  }

  /**
   * Handles clicks on group button.
   * @param  {MouseEvent} ev The MouseEvent object.
   */
  onGroupClicked(ev) {
    let groupId = ev.currentTarget.dataset['id'];
    setNav(this.year, this.docId, groupId);
  }
}

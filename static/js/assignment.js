class Assignment {
  constructor() {
    this.data = null;
    this.docId = null;
    this.groupId = null;
    this.el = document.createElement('div');
    this.el.classList.add('assignment');
    this.user = {
      id: document.body.dataset['userId'],
      img: document.body.querySelector('.avatar img').src,
    };
    this.tpls = {};
    for (let tpl of ['assignment-tpl', 'entry-tpl', 'new-entry-tpl']) {
      this.tpls[tpl] = document.getElementById(tpl).innerHTML;
    }
  }

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
    // activate forms
    let formEls = this.el.querySelectorAll('.box');
    for (let el of formEls) {
      let uploadBox = new UploadBox(el);
    }
  }

  preprocess(data, docId, groupId) {
    let user = this.user;
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
      user: user,
      users: users,
      due: due,
    };
  }

  preprocessTemplateData(tpl, processed, data, groupId) {
    switch (tpl) {
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

  remove() {
    this.el.remove();
  }

  onGroupClicked(ev) {
    let groupId = ev.currentTarget.dataset['id'];
    let docId = document.body.dataset['assignment'];
    setNav(docId, groupId);
  }
}

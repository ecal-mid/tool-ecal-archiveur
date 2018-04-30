""" API """

from flask import (Blueprint, request, current_app, render_template)
from flask_uploads import (UploadSet, configure_uploads, UploadNotAllowed)
from flask_mail import Mail, Message
import flask_login
import os
import json
import login
from .config import config

bp = Blueprint('api', __name__, url_prefix='/api')

uploaded_files = UploadSet('uploads', ('zip', 'pdf', 'jpg', 'png', 'mov',
                                       'mp4'))

mail = Mail(current_app)


def setup():
    configure_uploads(current_app, uploaded_files)


@bp.route('/upload', methods=['POST'])
def upload():
    """Upload a file."""
    if 'file' in request.files:
        rfile = request.files['file']
        try:
            folder = request.form.get('path')
            result_filename = uploaded_files.save(rfile, folder=folder)
            url = uploaded_files.url(result_filename)
            return json.dumps({'success': True, 'url': url})
        except UploadNotAllowed as err:
            ext = os.path.splitext(rfile.filename)[1][1:]
            return json.dumps({'error': '{} file not allowed'.format(ext)})
    return json.dumps({'error': 'Missing img parameter.'})


@bp.route('/a/<year>/<assignment_id>')
def get_assignment(year, assignment_id):
    """Return assignment data."""
    full_path = os.path.join(config['root_path'], 'assignments', year,
                             assignment_id + '.json')
    if os.path.exists(full_path):
        return open(full_path).read()
    else:
        return json.dumps({'error': 404})


@bp.route('/a/<year>/<assignment_id>', methods=['POST'])
@flask_login.login_required
def update_assignment(year, assignment_id):
    """Creates a new assignment."""
    user = login.get_current_user_infos()
    # Look if user is admin
    is_admin = user['id'] in config['admins']
    if not is_admin:
        return redirect('/a/' + year)
    # Load the dest assignment
    full_path = os.path.join(config['root_path'], 'assignments', year,
                             assignment_id + '.json')
    assignment = json.load(open(full_path))
    assignment[year][assignment_id] = request.get_json()
    json.dump(assignment, open(full_path, 'w'), indent=2)
    return json.dumps({'status': 'success.'})


@bp.route('/notify/<notification_type>', methods=['POST'])
@flask_login.login_required
def mail_test(notification_type):
    """Mail."""
    resp = request.get_json()
    assignment_id = resp['assignment']
    year = resp['year']
    entry = resp['entry']
    # if resp['user'] == entry['user']:
    #     user_name = 'You'
    # else:
    user_name = config['users'][resp['user']]['name']
    file_name = entry['file'].split('/')[-1]
    # load the assignment infos
    a_path = os.path.join(config['root_path'], 'assignments', year,
                          assignment_id + '.json')
    assignment = json.load(open(a_path))[year][assignment_id]['assignment']
    assignment_name = assignment['name']
    assignment_creator = assignment['creator']
    # Set recipients
    if current_app.debug:
        recipients = ['cyril.diagne']
    else:
        # retrieve entry group ids
        uids = entry['group'].split('_')
        group = []
        for g in assignment['groups']:
            for u in g:
                fname = u.split('.')[0]
                lname = u.split('.')[1]
                uid = fname[0] + lname
                if uid in uids and u not in group:
                    group.append(u)
        if notification_type == 'new_file_pending':
            # Send to assignment creator and group members
            recipients = [assignment_creator] + group
        elif notification_type == 'entry_reviewed':
            # Send to group members
            recipients = group
    recipients = [e + '@ecal.ch' for e in recipients]

    # Set title
    title = 'New activity'
    if notification_type == 'new_file_pending':
        title = u'{} added a file for {}'.format(user_name, assignment_name)
    elif notification_type == 'entry_reviewed':
        title = u'{} has reviewed your entry'.format(user_name)
    # Render message
    msg = Message(title, recipients=recipients)
    url = os.path.join(config['app_url'], 'a', year, assignment_id,
                       entry['group'])
    msg.html = render_template(
        'emails/' + notification_type + '.html',
        user=user_name,
        entry=entry,
        assignment=assignment_name,
        file_name=file_name,
        url=url)
    msg.send(mail)
    # print(msg.html)
    return json.dumps({'status': 'success.'})

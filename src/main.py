""" Main """

from flask import Blueprint, render_template, url_for, redirect, request, current_app
import flask_login
import login
import os
import re
import json
from .config import config, users_dict

bp = Blueprint(
    'index',
    __name__,
    static_folder='../static',
    template_folder='../templates')


@bp.route('/a/<year>')
@bp.route('/a/<year>/<assignment_id>')
@bp.route('/a/<year>/<assignment_id>/<group_id>')
@flask_login.login_required
def assignment(year, assignment_id=None, group_id=None):
    """Return a specific assignment."""
    user = login.get_current_user_infos()
    # Look if user is admin
    is_admin = user['id'] in config['admins']

    assignments = config['assignments']

    # Detect if assignment exists
    if assignment_id and assignment_id not in assignments:
        return redirect('/a/' + year)
    # Add a few restrictions if the user is not admin
    if not is_admin:
        # Filter accessible assignments using the assignments_access dict
        assignments = [
            a for a in assignments
            if user['id'] in config['assignments_access'][a]
        ]
        # Discard assignment if it's not accessible by this user
        if assignment_id and assignment_id not in assignments:
            return redirect('/a/' + year)
    # Process the template
    return render_template(
        'index.html',
        # is_dev=current_app.debug,
        is_dev=False,
        year=year,
        user=user,
        users_dict=config['users'],
        static_files=config['static_files'],
        users_img_prefix=config['users_img_prefix'],
        courses=config['courses'],
        is_admin=is_admin,
        assignment=assignment_id,
        group=group_id,
        assignments=assignments)


@bp.route('/new/<year>', methods=['POST'])
@flask_login.login_required
def create_new(year):
    """Creates a new assignment."""
    user = login.get_current_user_infos()
    # Look if user is admin
    is_admin = user['id'] in config['admins']
    if not is_admin:
        return redirect('/a/' + year)
    # Create default groups
    classe_id = request.form['course-id'].split('_')[0]
    if classe_id == 'other':
        groups = []
    else:
        groups = [[u] for u in config['classes'][classe_id]]
    # Create the assignment
    a_id = request.form['course-id'] + '-' + request.form['assignment-name']
    a_id = re.sub('[^a-z0-9 -]+', '', a_id.lower())
    a_id = a_id.replace(' ', '-')
    template = json.load(open('config/empty_assignment.json'))
    template['assignment']['name'] = request.form['assignment-name']
    template['assignment']['groups'] = groups
    template['assignment']['creator'] = request.form['creator']
    assignment = {year: {a_id: template}}
    full_path = os.path.join(config['root_path'], 'assignments', year,
                             a_id + '.json')
    if os.path.exists(full_path):
        return 'assignment already exists'
    json.dump(assignment, open(full_path, 'w'), indent=2)
    # Reload list of assignments
    load_assignments()
    return redirect('/a/' + year + '/' + a_id)


@bp.route('/robots.txt')
def robots():
    """Prevents search engine from indexing the page."""
    return 'User-agent: * \nDisallow: /'


@bp.route('/')
@flask_login.login_required
def index():
    """Return the homepage."""
    return redirect('/a/2017-2018')

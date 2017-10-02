""" Main """

from flask import Blueprint, render_template, url_for, redirect
import flask_login
import login
import os
from .config import config

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
    if group_id is None:
        group_id = 0
    # Look if user is admin
    is_admin = user['id'] in config['admins']
    # Retrieve list of assignments available on the server
    full_path = os.path.join(config['root_path'], 'assignments', year)
    assignments = os.listdir(full_path)
    # Remove extensions
    assignments = [a[:-5] for a in assignments]
    # Add a few restrictions if the user is not admin
    if not is_admin:
        # Filter accessible assignments using the assignments_access dict
        assignments = [
            a for a in assignments
            if user['id'] in config['assignments_access'][a]
        ]
        # Discard assignment if it's not accessible by this user
        if assignment_id and assignment_id not in assignments:
            return redirect('/a/2017-2018')

    return render_template(
        'index.html',
        year=year,
        user=user,
        is_admin=is_admin,
        assignment=assignment_id,
        group=group_id,
        assignments=assignments)


@bp.route('/')
@flask_login.login_required
def index():
    """Return the homepage."""
    return redirect('/a/2017-2018')

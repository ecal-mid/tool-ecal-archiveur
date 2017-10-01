""" Main """

from flask import Blueprint, render_template
import flask_login
import login

bp = Blueprint(
    'index',
    __name__,
    static_folder='../static',
    template_folder='../templates')


@bp.route('/a/<a_id>')
@bp.route('/a/<a_id>/<g_id>')
@flask_login.login_required
def assignment(a_id, g_id=None):
    """Return a specific assignment."""
    user = login.get_current_user_infos()
    print(a_id)
    return render_template('index.html', user=user, assignment=a_id, group=g_id)


@bp.route('/')
@flask_login.login_required
def index():
    """Return the homepage."""
    user = login.get_current_user_infos()
    return render_template('index.html', user=user)

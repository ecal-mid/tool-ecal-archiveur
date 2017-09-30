""" Main """

from flask import Blueprint, render_template
import flask_login
import login

bp = Blueprint(
    'index',
    __name__,
    static_folder='../static',
    template_folder='../templates')


@bp.route('/')
@flask_login.login_required
def index():
    """Return the homepage."""
    user = login.get_current_user_infos()
    return render_template('index.html', user=user)

from flask import (Blueprint, request, redirect, current_app, url_for,
                   render_template)
import flask_login
import ldap3
import yaml
from .config import config

bp = Blueprint('login', __name__)

# Login Manager
login_manager = flask_login.LoginManager()
ldap_server = ldap3.Server(config['ldap_server'], get_info=ldap3.ALL)


def setup():
    login_manager.init_app(current_app)


# silly user model
class User(flask_login.UserMixin):
    pass


def get_current_user_infos():
    uid = flask_login.current_user.id
    if uid in config['short_ids']:
        uid = config['short_ids'][uid]
    infos = config['users'][uid]
    # url = config['users_img_prefix'] + '/' + infos['img']
    return {'name': infos['name'], 'img': infos['img'], 'id': uid}


@login_manager.user_loader
def user_loader(user_id):
    if user_id is None:
        return
    user = User()
    user.id = user_id
    return user


@login_manager.request_loader
def request_loader(request):
    user_id = request.form.get('id')
    user = user_loader(user_id)
    if user is None:
        return None
    try:
        if not current_app.debug:
            # Make sure the id matches what ECAL rules:
            # No _ or - characters
            firstname, lastname = [
                x.replace('_', '') for x in user_id.split('.')
            ]
            # Lastname or firstname can't be longer than 8 characters
            user_id = firstname[:8] + '.' + lastname[:8]
            # Connect to LDAP
            conn = ldap3.Connection(
                ldap_server,
                'ade\\' + user_id,
                request.form.get('pw'),
                auto_bind=True)
            print user_id + ' succesfully logged in.'
        return user
    except ldap3.core.exceptions.LDAPBindError as e:
        print(e)
        print user_id + ' could not log in.'
        return None


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template(
            'login.html', static_files=config['static_files'])

    user = request_loader(request)
    if user is not None:
        flask_login.login_user(user)
        return redirect(url_for('index.index'))
    return render_template(
        'login.html',
        static_files=config['static_files'],
        error='Invalid login/password.')


@bp.route('/logout')
def logout():
    flask_login.logout_user()
    return redirect(url_for('index.index'))


@login_manager.unauthorized_handler
def unauthorized_handler():
    return redirect(url_for('login.login'))

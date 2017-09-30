from flask import Flask

app = Flask(__name__)

with app.app_context():
    from src import config, main, api, login

    app.secret_key = config.config['key']
    app.config['ROOT_PATH'] = config.config['root_path']
    app.config['UPLOADS_DEFAULT_DEST'] = config.config['root_path']
    app.config['UPLOADS_DEFAULT_URL'] = config.config['nginx_url']

    # Initialises app's Blueprints
    app.register_blueprint(api.bp)
    app.register_blueprint(main.bp)
    app.register_blueprint(login.bp)

    api.setup()
    login.setup()

from flask import current_app
import yaml
import os
import json

# Load configuration file.
CONFIG_FILE = 'config/prod.yaml'
if current_app.debug:
    CONFIG_FILE = 'config/dev.yaml'

config = yaml.load(open(CONFIG_FILE))

current_app.config.update(config)

config_folder = config['config_folder']
config_file = os.path.join(config_folder, 'config.yaml')
config.update(yaml.load(open(config_file)))
users_file = os.path.join(config_folder, 'users.yaml')
config.update(yaml.load(open(users_file)))

# Replace user ids by dicts with full data
users_dict = {}
for k, v in config['classes'].iteritems():
    users_dict[k] = {u: config['users'][u] for u in v}
users_dict['admins'] = {u: config['users'][u] for u in config['admins']}


# Load assignments
def load_assignments(year):
    """Retrieves list of assignments available on the server."""
    full_path = os.path.join(config['root_path'], 'assignments', year)
    assignments_files = os.listdir(full_path)
    config['assignments'] = {}
    for a_file in assignments_files:
        if a_file == '.DS_Store': continue
        a = json.load(open(os.path.join(full_path, a_file)))
        a_id = a_file[:-5]
        a_data = a[year][a_id]['assignment']
        # Retrieve access list
        access = []
        groups = a_data['groups']
        for g in groups:
            for u in g:
                access.append(u)
        access = sorted(set(access))  # Remove duplicates
        # set in global object
        config['assignments'][a_id] = {
            'id': a_id,
            'access': access,
            'data': a_data
        }


load_assignments('2017-2018')

from flask import current_app
import yaml
import os
import json

# Load configuration file.
CONFIG_FILE = 'config/prod.yaml'
if current_app.debug:
    CONFIG_FILE = 'config/dev.yaml'

config = yaml.load(open(CONFIG_FILE))

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


def load_users_assignments_access(year):
    full_path = os.path.join(config['root_path'], 'assignments', year)
    assignments = os.listdir(full_path)

    config['assignments_access'] = cfg = {}

    for a_file in assignments:
        a = json.load(open(os.path.join(full_path, a_file)))
        a_id = a[year].keys()[0]
        cfg[a_id] = []
        groups = a[year][a_id]['assignment']['groups']
        for g in groups:
            for u in g:
                cfg[a_id].append(u)
        cfg[a_id] = sorted(set(cfg[a_id]))


load_users_assignments_access('2017-2018')

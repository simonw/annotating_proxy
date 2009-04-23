import os, sys
os.chdir('/home/simon/sites/annotated-dip3.simonwillison.com/annotated_dip3')

# Get rid of 'sys.stdout access restricted by mod_wsgi' error
sys.stdout = sys.stderr

paths = (
    '/home/simon/sites/annotated-dip3.simonwillison.com',
    '/home/simon/sites/annotated-dip3.simonwillison.com/annotated_dip3',
    '/home/simon/pythonmods',
)
for path in paths:
    if not path in sys.path:
        sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'annotated_dip3.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()


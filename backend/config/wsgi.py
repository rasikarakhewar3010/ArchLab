"""
WSGI config for ArchLab.
WSGI = Web Server Gateway Interface.
It's how production web servers (like Gunicorn, uWSGI) talk to Django.
You rarely need to edit this file.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()

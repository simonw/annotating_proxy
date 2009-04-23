from django.conf.urls.defaults import *
from django.contrib import admin
from proxy import views as proxy
from annotations import views as annotations
import os

admin.autodiscover()

urlpatterns = patterns('',
    (r'^admin/(.*)', admin.site.root),
    (r'^annotations/$', annotations.index),
    (r'^annotations/add/$', annotations.add),
    (r'^annotations/recent/$', annotations.recent),
    (r'^annotations/static/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': os.path.join(
            os.path.dirname(__file__), 'annotations/static'
        ),
    }),
    (r'^(.*)$', proxy.proxy, {
        'base_url': 'http://diveintopython3.org/',
        'annotations_selector': ':header[id]',
        #'base_url': 'http://localhost/',
        #'annotations_selector': 'td has(a)',
    }),
)

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.utils import simplejson
import itertools, cgi

from models import Annotation

def json_response(obj):
    return HttpResponse(
        simplejson.dumps(obj, indent=4), content_type='text/javascript'
    )

def index(request):
    url = request.GET.get('url', '')
    if not url:
        return json_response({'sections': {}});
    
    sections = {}
    for selector, annotations in itertools.groupby(
        Annotation.objects.filter(url = url), lambda a: a.selector
    ):
        sections[selector] = [
            dict([
                (key, cgi.escape(unicode(value)).replace('\n', '<br>')) 
                for key, value in a.__dict__.items()
                if key not in ('selector', 'url')
            ]) for a in annotations
        ]
    
    return json_response({'sections': sections})

def add(request):
    body = request.POST.get('body', '')
    selector = request.POST.get('selector', '')
    url = request.POST.get('url', '')
    author = request.POST.get('author', '')
    if body and selector and url and author:
        Annotation.objects.create(
            body = body,
            selector = selector,
            url = url,
            author = author,
        )
        return HttpResponse('ok')
    else:
        return HttpResponse('error: fields are required')

def recent(request):
    return render_to_response('annotations/recent.html', {
        'annotations': Annotation.objects.all().order_by('-created')[0:50],
    })


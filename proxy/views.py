from django.http import HttpResponseForbidden, HttpResponse
import urlparse, httplib2
from os import path

SCRIPT = '/annotations/static/annotations.js'
OVERRIDES = path.join(path.dirname(__file__), '../overrides/')
OVERRIDE_INDEX = '_special_index.html'

def proxy(request, request_path, base_url, annotations_selector):
    url = urlparse.urljoin(base_url, request_path)
    if not url.startswith(base_url):
        return HttpResponseForbidden('Forbidden URL to proxy: %s' % url)
    
    if not request_path:
        override_path = path.realpath(path.join(OVERRIDES, OVERRIDE_INDEX))
    else:
        override_path = path.realpath(path.join(OVERRIDES, request_path))
    
    if path.exists(override_path):
        return HttpResponse(open(override_path).read(), content_type = {
            'txt': 'text/plain',
            'html': 'text/html',
            'xml': 'application/xml',
        }.get(override_path.split('.')[-1].lower(), 'text/html'))
    
    headers, content = httplib2.Http().request(url, 'GET')
    
    if headers['content-type'].startswith('text/html'):
        extra = '\n'.join([
            '<script type="text/javascript">',
            "var annotations_selector = '%s';" % annotations_selector,
            '</script>',
            '<script type="text/javascript" src="%s"></script>' % SCRIPT
        ])
        if '</body>' in content:
            content = content.replace('</body>', '</body>' + extra)
        else:
            content += extra
    
    response = HttpResponse(content)
    response.status_code = headers['status']
    response['Content-Type'] = headers['content-type']
    return response
        
from django.db import models

class Annotation(models.Model):
    url = models.CharField(max_length=255)
    selector = models.CharField(max_length=100)
    author = models.CharField(max_length=30)
    created = models.DateTimeField(auto_now_add = True)
    body = models.TextField()
    
    class Meta:
        ordering = ('selector', 'created',)
    
    def __unicode__(self):
        return u'%s on %s' % (self.author, self.url)

function add_annotations() {
    // This function can safely be called multiple times to update counters
    var $ = jQuery;
    var annotation_link_css = {
        'font-family': 'courier',
        'font-size': '12px',
        'font-weight': 'bold',
        'color': 'red',
        'text-decoration': 'none',
        'border-bottom': 'none'
    };
    if (!window.annotations_selector) {
        alert('annotations_selector not set!');
        return;
    }
    var url = '/annotations/?url=' + encodeURIComponent(location.pathname);
    $.getJSON(url, function(json) {
        window.annotations_json = json.sections;
        $.each(json.sections, function(selector, annotations) {
            var section = $(selector);
            var count = annotations.length;
            if (section.find('a.annotations-link').length) {
                // Update existing link with accurate number
                section.find('a.annotations-link').text('[' + count + ']');
            } else {
                var a = $(
                    '<a class="annotations-link" href="#">[' + count + ']</a>'
                ).css(annotation_link_css);
                a.click(function(ev) {
                    display_annotations(ev, selector);
                    return false;
                })
                $(selector).append(' ');
                $(selector).append(a);
            }
        });
        // Now add empty annotation links
        $(annotations_selector).each(function() {
            var section = $(this);
            if (!section.find('a.annotations-link').length) {
                var a = $('<a class="annotations-link" href="#">[#]</a>').css(
                    annotation_link_css
                );
                var selector = getSelectorForElement(section);
                a.click(function(ev) {
                    display_annotations(ev, selector);
                    return false;
                })
                section.append(' ');
                section.append(a);
            }
        });
    });
}

function getSelectorForElement(el, suffix) {
    var $ = jQuery;
    suffix = suffix || '';
    if (el.attr('id')) {
        return $.trim('#' + el.attr('id') + (suffix ? (' ' + suffix) : ''));
    } else if (el.is('body') || el.parent().length == 0) {
        return $.trim(suffix);
    }
    else {
        var tag = el[0].tagName.toLowerCase();
        var position = el.parent().children(tag).index(el);
        var relative_selector = tag + ':eq(' + position + ')';
        return $.trim(
            getSelectorForElement(
                el.parent(), relative_selector + ' ' + suffix
            )
        );
    }
}

function display_annotations(ev, selector) {
    var $ = jQuery;
    var annotations = window.annotations_json[selector] || [];
    // Show them in a div at that point on the page
    var div = $('div#annotationsDiv');
    if (!div.length) {
        div = $('<div id="annotationsDiv"></div>').css({
            'position': 'absolute',
            'width': '350px',
            'background-color': '#ddd',
            'border': '1px solid #aaa',
            'padding': '5px',
            'top': '0',
            'left': '0'
        });
        div.appendTo(document.body);
        var a = $('<a href="#">X</a>').css({
            'color': 'red',
            'text-decoration': 'none',
            'border-bottom': 'none',
            'position': 'absolute',
            'top': '3px',
            'right': '3px'
        }).click(function() {
            $('div#annotationsDiv').hide();
            return false;
        })
        div.append(a);
    }
    div.css('left', ev.pageX);
    div.css('top', ev.pageY);
    div.find('div').remove();
    $.each(annotations, function() {
        var note = $([
            '<div><small><strong>' + this.author + '</strong>',
            ' on <strong>' + this.created + '</strong></small><br>',
            this.body,
            '</div>'
        ].join('\n')).appendTo(div);
    });
    // Now add the form for creating a new annotation
    var form = $([
        '<form action="/annotations/add/" method="POST">',
        '<div><small>Name:</small><br><input type="text" name="author"></div>',
        '<div><small>Comment:</small><br>',
        '<textarea name="body" rows="6"></textarea></div>',
        '<div><input type="submit" value="Submit"></div>',
        '<input type="hidden" name="selector" value="' + selector + '">',
        '<input type="hidden" name="url" value="' + location.pathname + '">',
        '</form>'
    ].join('\n')).find(':text,textarea').css({
        'width': '98%'
    }).end().appendTo(div);
    form.submit(function() {
        document.cookie = 'annotation-name=' + form.find(':text:first').val();
        $.post(form.attr('action'), form.serialize(), function(data) {
            data = $.trim(data);
            if (data == 'ok') {
                form.find('div.error').remove();
                add_annotations(); // To refresh the counters
                div.hide();
            } else {
                var error = data.replace('error: ', '');
                var errorDiv = form.find('div.e');
                if (!errorDiv.length) {
                    form.prepend($('<div class="e">' + error + '</div>').css({
                        'background-color': 'red',
                        'padding': '2px'
                    }));
                } else {
                    errorDiv.text(error);
                }
            }
        });
        return false;
    });
    div.find('*').css('float', 'none');
    div.show();
    var match = (/annotation-name=([^;]+)/).exec(document.cookie);
    if (match && match[1]) {
        form.find(':text:first').val(match[1]);
        form.find('textarea').focus();
    } else {
        form.find(':text:first').focus();
    }
}

if (!window.jQuery) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = '/annotations/static/jquery.js';
    document.getElementsByTagName('head')[0].appendChild(s);
    s.onload = add_annotations;
} else {
    add_annotations();
}



function add_annotations() {
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
            var a = $('<a href="#">[' + annotations.length + ']</a>').css(
                annotation_link_css
            );
            a.click(function(ev) {
                display_annotations(ev, selector, annotations);
                return false;
            })
            $(selector).append(' ');
            $(selector).append(a);
            $(selector).data('has-annotations', 1);
        });
        // Now add empty annotation links
        $(annotations_selector).each(function() {
            var section = $(this);
            if (!section.data('has-annotations')) {
                var a = $('<a href="#">[#]</a>').css(
                    annotation_link_css
                );
                var selector = getSelectorForElement(section);
                a.click(function(ev) {
                    display_annotations(ev, selector, []);
                    return false;
                })
                section.append(' ');
                section.append(a);
            }
        });
    });
}

function getSelectorForElement(el) {
    if (el.attr('id')) {
        return '#' + el.attr('id');
    }
    throw "No ID on this element!"
}

function display_annotations(ev, selector, annotations) {
    // Show them in a div at that point on the page
    var div = $('div#annotationsDiv');
    if (!div.length) {
        div = $('<div id="annotationsDiv"></div>').css({
            'position': 'absolute',
            'width': '300px',
            'background-color': '#ccc',
            'border': '1px solid black',
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
    div.find('*').css('float', 'none');
    div.show();
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

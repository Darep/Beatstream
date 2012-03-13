//= require jquery.fancybox.pack
/*!
 * Routing
 * Route hash changes to different actions.
 */

var Routing = {
    ResolveCurrent: function () {
        var route = window.location.hash.replace('#!/', '');

        switch (route) {
            case 'settings':
                $.fancybox({ href: '/settings' });
                break;
        }
    }
};

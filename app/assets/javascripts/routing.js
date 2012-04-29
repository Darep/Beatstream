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
                var href = window.location.href.replace('#!/', '');
                
                $.fancybox({
                    type: 'ajax',
                    href: href,
                    
                    modal: true,
                    padding: 0,

                    afterClose: function () {
                        window.location.hash = '';
                    },
                    beforeShow: function () {
                        var $this = $('.fancybox-inner');

                        $this.find('.close').click(function () {
                            $.fancybox.close();

                            return false;
                        });
                    }
                });
                break;
        }
    }
};

$(document).ready(function () {
    window.location.hash = '';
});
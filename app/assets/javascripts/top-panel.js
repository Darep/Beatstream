/*!
 * Beatstream top panel
 */

$(document).ready(function () {

    var panel = $('#user-panel > a'),
        menu = $('#user-menu');

    panel.click(function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);

        panel.toggleClass('act');
        menu.toggle();
    });

    menu.click(function (e) {
        e.stopPropagation();
    });

    menu.find('a').click(function () {
        panel.removeClass('act');
        menu.hide();
    });

    $(document).click(function () {
        panel.removeClass('act');
        menu.hide();
    });
});

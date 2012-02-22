/*!
 * Drag tooltip
 *
 */

var DragTooltip = {

    options: {
        topMargin: -20
    },

	draginfo: $('#draginfo'),

	show: function (x, y, text) {
        
        if (!this.draginfo.length) {
            this.draginfo = $('<div id="draginfo"></div>');
            $('body').append(this.draginfo);
        }

        this.draginfo.text(text)
                .css({
                    position: 'absolute',
                    left: x,
                    top: y + this.options.topMargin,
                    zIndex: 9001
                })
                .show();
	},

    update: function (x, y) {
        this.draginfo.css({
            left: x,
            top: y + this.options.topMargin
        });
    },

    hide: function() {
        this.draginfo.hide();
    }
};

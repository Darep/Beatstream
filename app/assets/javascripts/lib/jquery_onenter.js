//= require ./key_codes

jQuery.fn.onEnter = function(callback) {
    return this.each(function () {
        $(this).keyup(function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);

            if (code == keyCode.ENTER || code == keyCode.NUMPAD_ENTER) {
                if (callback) {
                    callback.call(this);
                }
            }
        });
    });
};

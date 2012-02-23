/*!
 * Helper functions
 *
 */

var keyCode = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    BACKSPACE: 8,
    TAB: 9,
    DELETE: 46,
    ENTER: 13,
    ESCAPE: 27
};


// function to get random number from 1 to n
function randomToN(maxVal,floatVal)
{
   var randVal = Math.random()*maxVal;
   return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}


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

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


// function to get random number from 1 to n
function randomToN(maxVal,floatVal)
{
   var randVal = Math.random()*maxVal;
   return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}


// function: naturalsort(a, b)
function naturalsort(a, b) {
  function chunkify(t) {
    var tz = [], x = 0, y = -1, n = 0, i, j;

    while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      var m = (i == 46 || (i >=48 && i <= 57));
      if (m !== n) {
        tz[++y] = "";
        n = m;
      }
      tz[y] += j;
    }
    return tz;
  }

  var aa = chunkify(a.toLowerCase());
  var bb = chunkify(b.toLowerCase());

  for (x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      var c = Number(aa[x]), d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else return (aa[x] > bb[x]) ? 1 : -1;
    }
  }
  return aa.length - bb.length;
}

// function: window.template(selector)
(function (document, window) {

    var templates = null;

    $(document).ready(function () {
        templates = $('#templates');
    });


    function template(selector) {
        var tmpl = templates.find(selector);
        return tmpl;
    }

    window.template = template;

})(document, window);


// Returns a plural or singular text based on the count
// function: pluralize(count, singular_text, plural_text = undefined)
(function (window) {

    function pluralize(count, singular_text, plural_text) {
        if (count === 1) {
            return singular_text;
        }
        else {
            if (!plural_text) {
                return singular_text + 's';
            }
            return plural_text;
        }
    }

    window.pluralize = pluralize;

}(window));

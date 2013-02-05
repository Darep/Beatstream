// beatstream.js
// www.beatstream.fi

(function () {

    // hook manual toggle button
    var theManual = document.getElementById('the-manual'),
        theManualToggleButton = document.getElementById('the-manual-toggle');

    theManualToggleButton.addEventListener('click', function (e) {
        e.preventDefault();
        toggleClass(theManual, 'show');
    });


    // control tab clicks
    var tabs = document.getElementById('tabs').children,
        active_tab = tabs[0],
        active_guide_id;

    for (var i = 0; i < tabs.length; ++i) {
        tabs[i].addEventListener('click', didClickTab);
    }

    function didClickTab(e) {
        e.preventDefault();

        var guide_id = this.getAttribute('href').substr(1),
            active_guide_id = active_tab.getAttribute('href').substr(1);

        removeClass(active_tab, 'act');
        hideGuide(active_guide_id);
        viewGuide(guide_id);

        addClass(this, 'act');
        active_tab = this;
    }

    function viewGuide(guide_id) {
        var guide = document.getElementById(guide_id);
        addClass(guide, 'show');
    }

    function hideGuide(guide_id) {
        var guide = document.getElementById(guide_id);
        removeClass(guide, 'show');
    }


    // helpers
    function toggleClass(elem, cl) {
        if (elem.className.indexOf(cl) != -1) {
            elem.className = elem.className.replace(cl, '');
        } else {
            elem.className += ' ' + cl;
        }
    }

    function addClass(elem, cl) {
        if (elem.className.indexOf(cl) == -1) {
            elem.className += ' ' + cl;
        }
    }

    function removeClass(elem, cl) {
        if (elem.className.indexOf(cl) != -1) {
            elem.className = elem.className.replace(cl, '');
        }
    }
}());


//addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function(win, doc){
    if(win.addEventListener)return;     //No need to polyfill

    function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v));};}
    function addEvent(on, fn, self){
        return (self = this).attachEvent('on' + on, function(e){
            var e = e || win.event;
            e.preventDefault  = e.preventDefault  || function(){e.returnValue = false;};
            e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true;};
            fn.call(self, e);
        });
    }
    function addListen(obj, i){
        if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
        else obj.addEventListener = addEvent;
        return obj;
    }

    addListen([doc, win]);
    if('Element' in win)win.Element.prototype.addEventListener = addEvent;          //IE8
    else{       //IE < 8
        doc.attachEvent('onreadystatechange', function(){addListen(doc.all);});      //Make sure we also init at domReady
        docHijack('getElementsByTagName');
        docHijack('getElementById');
        docHijack('createElement');
        addListen(doc.all);
    }
})(window, document);

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

var tabs = document.getElementById('tabs').children;
var contents = [];

for (var i = tabs.length; i--;) {
    var tab = tabs[i];
    var id = tab.getAttribute('href').substr(1);

    var content = document.getElementById(id);
    if (content === null) continue;

    contents.push(content);

    tab.addEventListener('click', showTab);
}

function showTab(e, dontSetHash) {
    if (e) {
        e.preventDefault();
    }

    var tab = this;
    var id = tab.getAttribute('href').substr(1);

    if (!dontSetHash) {
        window.location.hash = id;
    }

    var content = document.getElementById(id);

    for (var k = tabs.length; k--;) {
        tabs[k].setAttribute('class', '');
    }

    tab.setAttribute('class', 'act');

    for (var j = contents.length; j--;) {
        contents[j].style.display = 'none';
    }
    content.style.display = 'block';
}

showTab.call(tabs[0], undefined, true);


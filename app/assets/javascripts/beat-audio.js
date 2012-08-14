//= require audio-modules/html5audio
//= require audio-modules/soundmanager2

(function (window, undefined) {

    function BeatAudio (eventHandlers) {
        if (location.search == '?a=html5') {
            return HTML5Audio(eventHandlers);
        }
        else {
            return SM2Audio(eventHandlers);
        }
    }

    window.BeatAudio = BeatAudio;

})(window);

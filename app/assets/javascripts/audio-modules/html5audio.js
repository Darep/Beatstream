/*!
 * Beatstream HTML5 <audio> module
 */

(function ($, window, document, undefined) {

    function AudioModule(events_in) {
        var audio = $('<audio />');
        
        var events = $.extend({
            onPlay : function () {},
            onPaused : function () {},
            onSongEnd : function () {},
            onTimeChange : function (elapsed_in_seconds) {},
            onDurationParsed : function (duration_in_seconds) {},
            onError : function () {}
        }, events_in);

        // <audio> events
        audio.bind('play', function() {
            events.onPlay();
        });

        audio.bind('pause', function() {
            events.onPaused();
        });

        audio.bind('ended', function () {
            events.onSongEnd();
        });

        audio.bind('timeupdate', function () {
            var elaps = parseInt(audio[0].currentTime, 10);
            events.onTimeChange(elaps);
        });

        audio.bind('durationchange', function () {
            var dur = parseInt(audio[0].duration, 10);
            events.onDurationParsed(dur);
        });

        audio.bind('error', function () {
            events.onError();
        });


        this.audio = audio;
        this.events = events;
    }

    AudioModule.prototype.setVolume = function (volume) {
        volume = parseFloat(volume/100);
        this.audio[0].volume = volume;
    };

    AudioModule.prototype.play = function (uri) {
        this.audio.attr('src', uri);
        this.audio[0].play();
    };

    AudioModule.prototype.togglePause = function () {
        if (this.audio[0].paused) {
            this.audio[0].play();
        }
        else {
            this.audio[0].pause();
        }
    };

    AudioModule.prototype.stop = function () {
        if (!this.audio[0].paused) {
            this.audio[0].pause();
            this.audio[0].src = '';
        }
    };

    AudioModule.prototype.seekTo = function (seconds) {
        this.audio[0].currentTime = seconds;
    };


    // reveal
    window.HTML5Audio = AudioModule;

})(jQuery, window, document);

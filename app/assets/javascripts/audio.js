//= require soundmanager2/soundmanager2
/*!
 * Beatstream Audio module
 */

(function ($, window, document, undefined) {

    var HTML5Audio = {
        audio: $('<audio />'),

        init : function () {

        },

        setVolume : function (volume) {
            volume = parseFloat(volume/100);
            this.audio[0].volume = volume;
        },

        play : function (uri) {
            this.audio.attr('src', uri);
            this.audio[0].play();
        },

        togglePause : function () {
            if (this.audio[0].paused) {
                this.audio[0].play();
            }
            else {
                this.audio[0].pause();
            }
        },

        stop : function () {
            if (!this.audio[0].paused) {
                this.audio[0].pause();
                this.audio[0].src = '';
            }
        },

        seekTo : function (seconds) {
            this.audio[0].currentTime = seconds;
        },

        // events
        onPlay : function () {},
        onPaused : function () {},
        onSongEnd : function () {},
        onTimeChange : function () {},
        onDurationParsed : function () {}
    };

    var SMAudio = {
        song : null,

        init : function () {

        },

        setVolume : function (volume) {
            if (this.song == null) return;
            
            this.song.setVolume(volume);
        },

        play : function (uri) {
            if (this.song != null) {
                this.song.destruct();
            }
            this.song = soundManager.createSound('mySound', uri);
            this.song.play();
        },

        togglePause : function () {
            if (this.song == null) return;
            
            this.song.togglePause();
        },

        stop : function () {
            if (this.song == null) return;

            // TODO: this
        },

        seekTo : function (seconds) {
            if (this.song == null) return;

            // TODO: this
        }
    };

    window.BeatAudio = HTML5Audio;
    window.BeatAudio.init();


/*
var audio = (function () {

    var audio = $('#player audio');
    audio.css('display', 'none');

    // audio player events

    audio.bind('play', function() {
        mediator.publish('audioPlaying', true);
    });

    audio.bind('pause', function() {
        mediator.publish('audioPlaying', false);
    });

    audio.bind('ended', function () {
        mediator.publish('songEnded');
    });

    audio.bind('timeupdate', function () {
        var elaps = parseInt(audio[0].currentTime);

        mediator.publish('elapsedTimeChanged', elaps);
    });

    audio.bind('durationchange', function () {
        var dur = parseInt(audio[0].duration);
        durationChanged(dur);
        seekbar.slider('option', 'disabled', false);
    });

    var error_counter = 0;

    audio.bind('error', function () {
        if (error_counter > 2) {
            audio[0].pause();
            error_counter = 0;
            return;
        }

        grid.nextSong();
        error_counter = error_counter + 1;
    });
});
*/

})(jQuery, window, document);

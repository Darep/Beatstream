//= require soundmanager2/soundmanager2-nodebug-jsmin
/*!
 * Beatstream HTML5 <audio> module
 */

(function ($, window, document, undefined) {

    // SoundManager 2

    function AudioModule(events_in) {
        var events = $.extend({
            onPlay : function () {},
            onPaused : function () {},
            onSongEnd : function () {},
            onTimeChange : function (elapsed_in_seconds) {},
            onDurationParsed : function (duration_in_seconds) {},
            onError : function () {}
        }, events_in);

        this.song = null;
        this.events = events;
        this.volume = 0;
    }

    AudioModule.prototype.setVolume = function (volume) {
        this.volume = volume;

        if (this.song == null) return;
        this.song.setVolume(volume);
    };

    AudioModule.prototype.play = function (uri) {
        if (this.song != null) {
            this.song.destruct();
        }
        var song = soundManager.createSound('mySound', uri);
        
        var self = this;
        soundManager.play('mySound', {
            volume: self.volume,

            // register events
            onplay: function () {
                self.events.onPlay();
            },
            onresume: function () {
                self.events.onPlay();
            },
            onpause: function () {
                self.events.onPaused();
            },
            onfinish: function () {
                self.events.onSongEnd();
            },
            onload: function (success) {
                var duration_in_seconds = parseInt(song.duration / 1000);
                self.events.onDurationParsed(duration_in_seconds);
            },
            whileplaying: function () {
                var elapsed_in_seconds = parseInt(song.position / 1000);
                self.events.onTimeChange(elapsed_in_seconds);
            }
        });

        this.song = song;
    };

    AudioModule.prototype.togglePause = function () {
        if (this.song == null) return;
        
        this.song.togglePause();
    };

    AudioModule.prototype.stop = function () {
        if (this.song == null) return;

        this.song.stop();
    };

    AudioModule.prototype.seekTo = function (seconds) {
        if (this.song == null) return;

        this.song.setPosition(seconds * 1000);
    };


    // reveal the modules
    window.SM2Audio = AudioModule;

})(jQuery, window, document);

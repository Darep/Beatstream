//= require soundmanager2/soundmanager2-nodebug
//= require lib/mediator
//= require lib/mediator_events

;(function ($, window, document, undefined) {

    // SoundManager 2 options
    soundManager.url = '/swf/';
    soundManager.flashVersion = 9;
    soundManager.useFlashBlock = true;
    soundManager.useHTML5Audio = true;

    var soundManagerIsReady = false;

    soundManager.onready(function() {
        soundManagerIsReady = true;
        App.Mediator.publish(MediatorEvents.SM2_READY);
    });

    soundManager.ontimeout(function (status) {
        App.Mediator.publish(MediatorEvents.SM2_TIMED_OUT);
    });


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

        if (this.song === null) return;
        this.song.setVolume(volume);
    };

    AudioModule.prototype.play = function (uri) {
        if (!soundManagerIsReady) {
            return;
        }

        if (this.song !== null) {
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
                var duration_in_seconds = parseInt(song.duration / 1000, 10);
                self.events.onDurationParsed(duration_in_seconds);
            },
            whileplaying: function () {
                var elapsed_in_seconds = parseInt(song.position / 1000, 10);
                self.events.onTimeChange(elapsed_in_seconds);
            }
        });

        this.song = song;
    };

    AudioModule.prototype.togglePause = function () {
        if (this.song === null) return;

        this.song.togglePause();
    };

    AudioModule.prototype.stop = function () {
        if (this.song === null) return;

        this.song.stop();
    };

    AudioModule.prototype.seekTo = function (seconds) {
        if (this.song === null) return;

        this.song.setPosition(seconds * 1000);
    };


    // reveal the modules
    window.SM2Audio = AudioModule;

})(jQuery, window, document);

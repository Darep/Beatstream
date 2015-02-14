//= require audio-modules/html5audio
//= require audio-modules/soundmanager2

var App = window.App || {};

(function () {

  var error_counter = 0;
  var audio = null;

  audio = location.search === '?a=html5' ? HTML5Audio : SM2Audio;

  audio = new audio({
    onPlay: function () {
      App.Mediator.publish(MediatorEvents.AUDIO_PLAYING);
    },
    onPaused: function () {
      App.Mediator.publish(MediatorEvents.AUDIO_PAUSED);
    },
    onSongEnd: function () {
      App.Mediator.publish(MediatorEvents.AUDIO_STOPPED);
    },
    onTimeChange: function (elapsed) {
      App.Mediator.publish(MediatorEvents.AUDIO_TIME, elapsed);
    },
    onDurationParsed: function (duration) {
      App.Mediator.publish(MediatorEvents.AUDIO_DURATION_PARSED, duration);
    },
    onError: function () {
      if (error_counter > 2) {
        App.Audio.pause();
        error_counter = 0;
        return;
      }

      error_counter = error_counter + 1;

      App.Mediator.publish(MediatorEvents.AUDIO_ERROR);
    }
  });

  App.Audio = audio;

})();

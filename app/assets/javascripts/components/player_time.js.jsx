//= require lib/mediator
//= require lib/mediator_events
/** @jsx React.DOM */

var App = window.App || {};

App.PlayerTime = React.createClass({
  getInitialState: function () {
    return {
      duration: 0,
      elapsed: 0
    }
  },

  componentDidMount: function () {
    App.Mediator.subscribe(MediatorEvents.AUDIO_DURATION_PARSED, this.updateDuration);
    App.Mediator.subscribe(MediatorEvents.AUDIO_TIME, this.updateElapsed);
    App.Mediator.subscribe(MediatorEvents.AUDIO_STOPPED, this.updateElapsed);
  },

  componentWillUnmount: function() {
    App.Mediator.unsubscribe(MediatorEvents.AUDIO_DURATION_PARSED, this.updateDuration);
    App.Mediator.unsubscribe(MediatorEvents.AUDIO_TIME, this.updateElapsed);
    App.Mediator.unsubscribe(MediatorEvents.AUDIO_STOPPED, this.updateElapsed);
  },

  render: function() {
    var duration = this.formattedTime(this.state.duration);
    var elapsed = this.formattedTime(this.state.elapsed);

    return (
      <div id="player-time">
        <span className="elapsed">{elapsed}</span>
        <span className="separator"> / </span>
        <span className="duration">{duration}</span>
      </div>
    );
  },

  formattedTime: function (milliseconds) {
    var mins = Math.floor(milliseconds/60, 10),
        secs = milliseconds - mins*60;

    return (mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs);
  },

  updateDuration: function (duration) {
    this.setState({ duration: parseInt(duration, 10) || 0 });
    this.render();
  },

  updateElapsed: function (elapsed) {
    this.setState({ elapsed: parseInt(elapsed, 10) || 0 });
    this.render();
  }
});

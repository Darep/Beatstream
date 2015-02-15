/** @jsx React.DOM */

var App = window.App || {};

App.PlaybackControls = React.createClass({
  getInitialState: function () {
    return {
      enabled: false,
      playing: false
    }
  },

  componentDidMount: function () {
    App.Mediator.subscribe(MediatorEvents.AUDIO_PLAYING, this.handlePlaying);
    App.Mediator.subscribe(MediatorEvents.AUDIO_PAUSED, this.handlePaused);

    // TODO: this should be done only after the initial playlist has been loaded
    this.setState({ enabled: true });
  },

  componentWillUnmount: function() {
  },

  render: function() {
    var playClassName = this.state.playing ? 'playing' : '';

    return (
      <div>
        <button id="prev" type="button" disabled={this.state.enabled ? "" : "disabled"} onClick={this.playPrevious}>Prev</button>
        <button id="play-pause" className={playClassName} type="button" disabled={this.state.enabled ? "" : "disabled"} onClick={this.playPause}>Play/pause</button>
        <button id="next" type="button" disabled={this.state.enabled ? "" : "disabled"} onClick={this.playNext}>Next</button>
      </div>
    );
  },

  handlePaused: function () {
    this.setState({ playing: false });
  },

  handlePlaying: function () {
    this.setState({ playing: true });
  },

  playPrevious: function () {
    this.props.previous();
  },

  playPause: function () {
    this.props.playPause();
  },

  playNext: function () {
    this.props.next();
  }
});

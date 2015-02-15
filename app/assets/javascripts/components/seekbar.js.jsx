//= require jquery-ui-1.8.17.custom.min
//= require lib/mediator
//= require lib/mediator_events
/** @jsx React.DOM */

var App = window.App || {};

App.Seekbar = React.createClass({
  getInitialState: function() {
    return {
      userSeeking: false
    };
  },

  componentDidMount: function () {
    this.slider = $('#seekbar-slider').slider({
        orientation: 'horizontal',
        disabled: true,
        value: 0,
        max: 100,
        min: 0,
        range: 'min',
        start: this.handeStart,
        stop: this.handleStop
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_DURATION_PARSED, this.setMax);
    App.Mediator.subscribe(MediatorEvents.AUDIO_TIME, this.updatePosition);
    App.Mediator.subscribe(MediatorEvents.AUDIO_STOPPED, this.stopSlider);
  },

  componentWillUnmount: function() {
    App.Mediator.unsubscribe(MediatorEvents.AUDIO_DURATION_PARSED, this.setMax);
    App.Mediator.unsubscribe(MediatorEvents.AUDIO_TIME, this.updatePosition);
    App.Mediator.unsubscribe(MediatorEvents.AUDIO_STOPPED, this.stopSlider);
  },

  render: function() {
    return (
      <div id="seekbar-slider"></div>
    );
  },

  handeStart: function (e, ui) {
    this.setState({ userSeeking: true });
  },

  handleStop: function (e, ui) {
    this.props.seekTo(ui.value);
    this.setState({ userSeeking: false });
  },

  setMax: function (duration) {
    this.slider.slider('option', 'max', duration);
    this.slider.slider('option', 'disabled', false);
  },

  updatePosition: function (elapsed) {
    if (!this.state.userSeeking) {
      this.slider.slider('option', 'value', elapsed);
    }
  },

  stopSlider: function () {
    this.slider.slider('option', 'value', 0);
    this.slider.slider('option', 'disabled', true);
  }
});

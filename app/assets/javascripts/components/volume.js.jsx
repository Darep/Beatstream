//= require jquery-ui-1.8.17.custom.min
/** @jsx React.DOM */

var App = window.App || {};

App.Volume = React.createClass({
  getInitialState: function () {
    return {
      volume: parseFloat(store.get('volume')) || 20
    };
  },

  componentDidMount: function () {
    this.props.updateVolume(this.state.volume);

    this.slider = $('#player-volume-slider').slider({
        orientation: 'horizontal',
        value: this.state.volume,
        range: 'min',
        max: 100,
        min: 0,
        slide: this.handleSlide,
        stop: this.handleStop
    });
  },

  render: function() {
    return (
      <div>
        <label id="player-volume-label" title={this.state.volume}>Volume</label>
        <div id="player-volume-slider-wrapper">
          <div id="player-volume-slider"></div>
        </div>
      </div>
    );
  },

  handleSlide: function (e, ui) {
    // Change volume in real-time
    this.props.updateVolume(ui.value);
  },

  handleStop: function (e, ui) {
    // Persist the volume that the user settled on
    store.set('volume', ui.value);
    this.setState({ volume: ui.value });
  }
});

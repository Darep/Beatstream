//= require store.min
/** @jsx React.DOM */

var App = window.App || {};

App.PlayerOptions = React.createClass({
  render: function() {
    var repeatClassName = '';
    var shuffleClassName = '';

    if (this.props.shuffle) {
      shuffleClassName += ' enabled';
    }

    if (this.props.repeat) {
      repeatClassName += ' enabled';
    }

    return (
      <div id="player-buttons-2">
        <button id="repeat" type="button" onClick={this.toggleRepeat} className={repeatClassName}>
          <span className="label">Repeat</span>
          <span className="status">{this.statusText('repeat')}</span>
        </button>
        <button id="shuffle" type="button" onClick={this.toggleShuffle} className={shuffleClassName}>
          <span className="label">Shuffle</span>
          <span className="status">{this.statusText('shuffle')}</span>
        </button>
      </div>
    );
  },

  statusText: function (key) {
    if (this.props[key]) {
      return 'On';
    } else {
      return 'Off';
    }
  },

  toggleRepeat: function (e) {
    this.props.onChange(!this.props.repeat, this.props.shuffle)
  },

  toggleShuffle: function (e) {
    this.props.onChange(this.props.repeat, !this.props.shuffle)
  }
});

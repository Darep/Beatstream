//= require store.min
/** @jsx React.DOM */

var App = window.App || {};

App.PlayerOptions = React.createClass({
  render: function() {
    var repeatClassName = 'player__toggle-button player__toggle-button--repeat';
    var shuffleClassName = 'player__toggle-button player__toggle-button--shuffle';

    if (this.props.shuffle) {
      shuffleClassName += ' enabled';
    }

    if (this.props.repeat) {
      repeatClassName += ' enabled';
    }

    return (
      <div className="player__buttons player__buttons--right">
        <button type="button" onClick={this.toggleRepeat} className={repeatClassName}>
          <span className="player__toggle-button__label">Repeat</span>
          <span className="player__toggle-button__status">{this.statusText('repeat')}</span>
        </button>
        <button type="button" onClick={this.toggleShuffle} className={shuffleClassName}>
          <span className="player__toggle-button__label">Shuffle</span>
          <span className="player__toggle-button__status">{this.statusText('shuffle')}</span>
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
    this.props.onChange(!this.props.repeat, this.props.shuffle);
  },

  toggleShuffle: function (e) {
    this.props.onChange(this.props.repeat, !this.props.shuffle);
  }
});

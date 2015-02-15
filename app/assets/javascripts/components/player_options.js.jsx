//= require store.min
/** @jsx React.DOM */

var App = window.App || {};

App.PlayerOptions = React.createClass({
  getInitialState: function () {
    console.log(store.get('repeat'));
    return {
      repeat: store.get('repeat') || false,
      shuffle: store.get('shuffle') || false
    };
  },

  render: function() {
    var repeatClassName = '';
    var shuffleClassName = '';

    if (this.state.shuffle) {
      shuffleClassName += ' enabled';
    }

    if (this.state.repeat) {
      repeatClassName += ' enabled';
    }

    return (
      <div>
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
    if (this.state[key]) {
      return 'On';
    } else {
      return 'Off';
    }
  },

  toggleRepeat: function (e) {
    var val = !this.state.repeat;
    this.setState({ repeat: val });
    store.set('repeat', val);
  },

  toggleShuffle: function (e) {
    var val = !this.state.shuffle;
    this.setState({ shuffle: val });
    store.set('shuffle', val);
  }
});

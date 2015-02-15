//= require jquery.cookie
//= require store.min
//= require lib/audio
//= require ./playback_controls
//= require ./volume
//= require ./player_time
//= require ./seekbar
//= require ./player_options
/** @jsx React.DOM */

var App = window.App || {};

App.Player = React.createClass({
  getInitialState: function() {
    return {
      repeat: store.get('repeat') || false,
      shuffle: store.get('shuffle') || false
    };
  },

  render: function() {
    var songlist = this.props.songlist;

    var playPause = function () {
      if (!songlist.isPlaying()) {
        songlist.nextSong(this.state.shuffle, this.state.repeat);
        $.cookie('isPlaying', true);
      } else {
        App.Audio.togglePause();
        $.cookie('isPlaying', ($.cookie('isPlaying') == 'false'));
      }
    }.bind(this);

    var next = function () {
      songlist.nextSong(this.state.shuffle, this.state.repeat, true);
    }.bind(this);

    var previous = function () {
      songlist.prevSong(this.state.shuffle);
    }.bind(this);

    var updateVolume = App.Audio.setVolume.bind(App.Audio);
    var seekTo = App.Audio.seekTo.bind(App.Audio);

    return (
      <div>
        <App.PlaybackControls previous={previous} playPause={playPause} next={next} />
        <App.Volume updateVolume={updateVolume} />
        <App.PlayerTime />
        <App.Seekbar seekTo={seekTo} />
        <App.PlayerOptions repeat={this.state.repeat} shuffle={this.state.shuffle} onChange={this.onOptionsChange} />
      </div>
    );
  },

  onOptionsChange: function (repeat, shuffle) {
    this.setState({
      repeat: repeat,
      shuffle: shuffle
    });
    store.set('repeat', repeat);
    store.set('shuffle', shuffle);
  }
});

/** @jsx React.DOM */

var App = window.App || {};

App.CurrentSong = React.createClass({
  render: function() {
    var song = this.props.song;
    var track = song ? this.getFormattedSongTitle(song) : 'None';

    return (
      <div>
        <span className="label">Current song:</span>
        <span className="track" onDoubleClick={this.showActiveSong}>{track}</span>
      </div>
    );
  },

  showActiveSong: function (e) {
    console.log('TODO: scroll active song into view');
  },

  getFormattedSongTitle: function (song) {
    return song.nice_title;
  }
});

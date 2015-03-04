/** @jsx React.DOM */

var App = window.App || {};

App.Songlist = React.createClass({
  getInitialState: function () {
    return {
      selectedSong: null,
      scrollY: 0,
      pageHeight: 526
    };
  },

  render: function() {
    var lineHeight = 16;
    var scrollY = this.state.scrollY;
    var begin = scrollY / lineHeight | 0;
    var end = begin + (this.state.pageHeight / lineHeight | 0 + 2);
    var offset = scrollY % lineHeight;
    var numItems = this.props.songs.length;
    var songlistStyles = {
      background: '#f1f1f1',
      height: '526px',
      overflow: 'auto'
    };
    var containerStyles = {
      height: (numItems * lineHeight) + 'px',
      position: 'relative'
    };
    var songsStyles = {
      position: 'absolute',
      top: scrollY + 'px',
      left: 0,
      right: 0
    };

    var songs = this.props.songs.slice(begin, end);

    return (
      <div className="songlist" style={songlistStyles} onScroll={this.handleScroll}>
        <div className="songs-container" style={containerStyles}>
          <ol className="songs" style={songsStyles}>
            {songs.map(this.renderSong)}
          </ol>
          <div id="slickgrid" style={ {display: 'none !important'} }></div>
        </div>
      </div>
    );
  },

  handleScroll: function (e) {
    this.setState({
      scrollY: Math.max(e.target.scrollTop, 0)
    });
  },

  renderSong: function (song) {
    var className = 'song';
    var style = {};
    var selectedSong = this.state.selectedSong;

    if (selectedSong && selectedSong.id == song.id) {
      className += ' song--selected';
      style.background = '#4c96e5';
      style.color = '#fff';
    }

    return (
      <li key={song.id} className={className} style={style}
        onClick={this.selectSong.bind(this, song)}
        onDoubleClick={this.playSong.bind(this, song)}
      >
        <span className="song__artist">{song.artist}</span>
        <span className="song__title">{song.title}</span>
        <span className="song__album">{song.album}</span>
        <span className="song__length">{song.length}</span>
      </li>
    );
  },

  selectSong: function (song) {
    // TODO: pass this all the way to the main store/state
    this.setState({
      selectedSong: song
    });
  },

  playSong: function (song) {
    // TODO: pass this all the way to the main store/state
    this.setState({
      playingSong: song
    });
  }
});

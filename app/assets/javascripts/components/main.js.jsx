//= require components/header
//= require components/player
//= require components/playlist_header
//= require components/sidebar
/** @jsx React.DOM */

var App = window.App || {};

App.Main = React.createClass({
  render: function() {
    var user = this.props.user;
    var count = this.props.songs.length;
    var songlist = this.props.songlist;

    var filter = function (filter) {
      songlist.setFilter(filter);
    };

    return (
      <div id="wrap">
        <App.Header user={user} />

        <div id="main">
          <App.Sidebar count={count} />

          <div id="content">
              <div id="content-wrap">
                  <App.PlaylistHeader count={count} filter={filter} />

                  <div className="grid-container">
                      <div id="slickgrid"></div>
                  </div>
              </div>
          </div>
        </div>

        <App.Player songlist={songlist} />
      </div>
    );
  }
});

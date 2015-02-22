/** @jsx React.DOM */

var App = window.App || {};

App.SettingsModal = React.createClass({
  componentDidMount: function() {
    var modal = document.getElementById('modal');

    if (modal.className.indexOf('show') <= -1) {
      modal.className += ' show';
    }
  },

  render: function () {
    var user = this.props.user;
    var username = user.username;
    var email = user.email || '';
    var lastfmConnected = (user.lastfm_session_key && user.lastfm_username);

    return (
      <div id="settings-modal" className="modal">
        <div className="modal__content">
          <header className="modal__header">
            <button type="button" className="plain-btn close" onClick={this.close}>
              <span aria-hidden="true">&times;</span>
            </button>
            <h1 className="modal__title">Settings</h1>
            <p className="modal__subtitle">Here are the settings you ordered</p>
          </header>
          <main className="modal__body">

            <form>
              <fieldset>
                <div className="form-row form-row--inline">
                  <label>Username</label>
                  <input type="text" value={username} onChange={this.handleChange} />
                </div>

                <div className="form-row form-row--inline">
                  <label>Email</label>
                  <input type="text" value={email} onChange={this.handleChange} />
                </div>
              </fieldset>

              <fieldset>
                <div className="form-row form-row--inline">
                  <label>Last.fm</label>
                  {!lastfmConnected &&
                    <a href="/settings/lastfm_connect" target="_blank" className="btn btn--primary" onClick={this.connectLastfm}>
                      Connect Last.fm
                    </a>
                  }

                  {lastfmConnected &&
                    <div className="margins-off">
                      <span>Logged in as <strong>{user.lastfm_username}</strong></span>
                      <a href="/settings/lastfm_disconnect" className="btn btn--dangerous btn--inline" onClick={this.disconnectLastfm}>
                        Disconnect Last.fm
                      </a>
                    </div>
                  }
                </div>

                <div className="form-row form-row--inline">
                  <label>MP3 Library</label>
                  <a href="/songs?refresh=1" className="btn btn--primary">
                    Search for new MP3s
                  </a>
                </div>
              </fieldset>
            </form>

          </main>
          <footer className="modal__footer">
            <button className="btn btn--big" onClick={this.close}>Close</button>
            <button className="btn btn--big btn--primary" onClick={this.save}>Save changes</button>
          </footer>
        </div>
      </div>
    );
  },

  handleChange: function () {

  },

  connectLastfm: function (e) {
    e.preventDefault();

    var w = 800;
    var h = 650;
    var left = (window.screen.width/2) - (w/2);
    var top = (window.screen.height/2) - (h/2);

    window.open('/settings/lastfm_connect',
      'LastFmConnect_Window',
      'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left +
      ',toolbar=0,menubar=0,location=0,status=0');
  },

  disconnectLastfm: function (e) {
    e.preventDefault();
    alert('TODO: disconnect last fm');
  },

  close: function (e) {
    var modal = document.getElementById('modal');
    modal.className = modal.className.replace('show', '');
  },

  save: function (e) {
    alert('TODO: save');
  }
});

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
                <div className="form-row">
                  <label>Username</label>
                  <input value="darep" />
                </div>

                <div className="form-row">
                  <label>Email</label>
                  <input value="dareppi@gmail.com" />
                </div>
              </fieldset>

              <fieldset>
                <div className="form-row form-row--inline">
                  <label>Last.fm</label>
                  {true &&
                    <a href="/settings/lastfm_connect" target="_blank" className="btn btn--primary">
                      Connect Last.fm
                    </a>
                  }

                  {false &&
                    <div>
                      <p className="lastfm-logged-in">Logged in</p>
                      <a href="/settings/lastfm_disconnect" className="btn btn--dangerous">
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
            <button className="btn btn--big btn--primary">Save changes</button>
          </footer>
        </div>
      </div>
    );
  },

  close: function (e) {
    var modal = document.getElementById('modal');
    modal.className = modal.className.replace('show', '');
  }
});

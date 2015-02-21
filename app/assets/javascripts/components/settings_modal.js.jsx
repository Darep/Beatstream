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
            <button type="button" className="close" onClick={this.close}>
              <span aria-hidden="true">&times;</span>
            </button>
            <h1 className="modal__title">Settings</h1>
          </header>
          <main className="modal__body">
            <p>Here's the modal you ordered</p>
          </main>
          <footer className="modal__footer">
            <button type="button" className="btn" onClick={this.close}>Close</button>
            <button type="button" className="btn btn--primary">Save changes</button>
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

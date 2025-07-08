import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App.tsx';
import './styles/globals.css';
import './styles/reset.css';
import { init } from './utils/AppAudio-store-adapter.ts';

// @ts-expect-error: we'll just boldly assume #root always exists
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// initialize the app audio, store, and their connection
init();

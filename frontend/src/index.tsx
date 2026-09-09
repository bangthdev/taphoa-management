import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { injectColorVariables } from './theme/colors';
import { injectTypographyVariables } from './theme/typography';

// Phải chạy trước lần render đầu, để CSS có sẵn biến --c-*/--t-* khi khung hình đầu tiên vẽ.
injectColorVariables();
injectTypographyVariables();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

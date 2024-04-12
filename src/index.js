import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { GlobalStyle } from './GlobalStyle.tsx';

// Типографика, имеющая размеры, зависимые от типа устройства
import { DeviceThemeProvider } from '@salutejs/plasma-ui/components/Device';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <DeviceThemeProvider>
      <GlobalStyle />
      <App />
  </DeviceThemeProvider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


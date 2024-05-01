import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter as Router } from 'react-router-dom/server';
import App from './App'

export function render(url) {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <Router location={url}>
        <App />
      </Router>
    </React.StrictMode>
  )
  // console.log(html);
  // console.log(url);
  
  return { html: html }
}

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter as Router } from 'react-router-dom/server';
import { AuthProvider } from './auth_components/AuthContext'
import App from './App'

export function render(url) {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <Router location={url}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </React.StrictMode>
  )
  // console.log(html);
  // console.log(url);
  
  return { html: html }
}

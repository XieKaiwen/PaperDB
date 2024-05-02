import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from './auth_components/AuthContext'
import App from './App'



ReactDOM.hydrateRoot(
  document.getElementById('root'),
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)



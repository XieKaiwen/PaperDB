import {Routes, Route, Link} from "react-router-dom";
import {useContext, useEffect, useState, createContext} from "react"
import axios from 'axios';
// Pages
import HomePage from "./pages/HomePage"
import IndexPage from './pages';
import NotFoundPage from "./pages/NotFoundPage";
// Components
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
// Layouts
import AuthLayout from "./layouts/AuthLayout";

import "./index.css"


// let auth_info;
// try{
//   const {data:authentication_info} = axios.get("/_auth/check")
//   auth_info = authentication_info;
//   console.log()
// }catch(err){
//   const {data: authentication_info, status} = err.response;
//   auth_info = authentication_info;
// }
// const [userAuthStatus, setUserAuthStatus] = useState(auth_info)
// const UserAuth = createContext([userAuthStatus, setUserAuthStatus])

function App() {
  // Add in context provider for authentication

  return (
    <>
      {/* <UserAuth> */}
        <Routes>
          <Route path="/">
            <Route index element={<IndexPage />}  />
            <Route path="auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginForm />}  />
              <Route path="signup" element={<SignUpForm />}  />
            </Route>
            <Route path="home" element={<HomePage/>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      {/* </UserAuth> */}
    </>
  )
}

export default App

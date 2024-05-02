import {Routes, Route, Link, useLocation} from "react-router-dom";
import {useContext, useEffect} from "react"
import RouteGuard from "./auth_components/RouteGuard";
import axios from "axios"
// Pages
import HomePage from "./pages/HomePage"
import IndexPage from './pages';
import NotFoundPage from "./pages/NotFoundPage";
import SomeOtherPage from "./pages/SomeOtherPage";
// Components
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
// Layouts
import AuthLayout from "./layouts/AuthLayout";
import Layout from "./layouts/Layout";

import "./index.css"
import { AuthContext } from "./auth_components/AuthContext";


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
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />}  />
            <Route path="login" element={<LoginForm />}  />
            <Route path="signup" element={<SignUpForm />}  />
            <Route path="home" element={
              <RouteGuard>
                <HomePage/>
              </RouteGuard>
            } />
            <Route path="other" element={
              <RouteGuard>
                <SomeOtherPage/>
              </RouteGuard>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      {/* </UserAuth> */}
    </>
  )
}

export default App

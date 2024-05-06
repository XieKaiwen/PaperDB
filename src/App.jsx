import {Routes, Route, Link, useLocation, Await} from "react-router-dom";
import {useContext, useEffect} from "react"
import RouteGuard from "./auth_components/RouteGuard";
// Pages
import HomePage from "./pages/HomePage"
import IndexPage from './pages';
import NotFoundPage from "./pages/NotFoundPage";
import SomeOtherPage from "./pages/SomeOtherPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import AwaitVerificationPage from "./pages/AwaitVerificationPage";
// Components
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
// Layouts
import Layout from "./layouts/Layout";

import "./index.css"



function App() {
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
            <Route path="await-confirmation" element={<AwaitVerificationPage />}/>
            <Route path="verify" element={<EmailConfirmationPage />}/>
            <Route path="*" element={<NotFoundPage />} replace/>
          </Route>
        </Routes>
      {/* </UserAuth> */}
    </>
  )
}

export default App

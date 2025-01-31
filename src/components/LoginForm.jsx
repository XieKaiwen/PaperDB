import AccountFormInputText from "./FormInputArea"
import FormSubmitButton from "./FormSubmitButton";
import Checkbox from "./Checkbox";
import {useContext, useState, useEffect} from "react"
import {Link, useNavigate, useLocation} from "react-router-dom"
import { validateAuthInputs } from "../../helperfunctions";
import axios from "axios";
import qs from 'qs';
import { AuthContext } from "../auth_components/AuthContext";
export default LoginForm;
// Component to be used for Login and Signin Forms only


function LoginForm() {
  const {userInfo: {isAuthenticated}, login} = useContext(AuthContext)
  const navigate = useNavigate();
  useEffect(()=>{
    if(isAuthenticated){
      navigate("/home")
    } 
  }, [])

  const {state} = useLocation() //If reached here from a protected route, redirect to the original route
  let from = "";
  if(state){
    from = state.from;
  }
  // checkRemember is to determine whether or not to save session for the user
  const [fieldInputs, setFieldInputs] = useState(
    {
      email:"",
      password: "",
      checkRemember: false
    }
  )

  function formChange(name, newValue){
    //console.log(name, newValue)
    setFieldInputs((prevItem) => {
      return {
        ...prevItem,
        [name]:newValue
      }
    })
    // console.log(fieldInputs)
  }

  // Validate field inputs
  const [formErrors, setFormErrors] = useState({emailError:"", loginError:""})
  const {email} = fieldInputs;

  async function handleFormSubmit(event){
    event.preventDefault();
    let valStatus = {
      error: false,
      emailError:"", 
      loginError:""
    }
    valStatus = validateAuthInputs("login", valStatus, email);
    if(!valStatus.error){
      const formData = qs.stringify(fieldInputs); //turn the form data into something to pass into axios
      const options = {
        method: "POST",
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: formData,
        url: "/_auth/login",
      }
      try{
        const {data: serverAuth} = await axios(options);
        console.log(serverAuth)
        console.log("Successfully logged in")
        login(serverAuth)
        navigate(`${from || "/home"}`)
        
        //Change the response to something related to the user info
      } catch(err){
        //if an error hapened when trying to reach the login API
        console.error(err)
        const {status: errStatus, data: errData} = err.response;
         // errData contains the authStatus sent from the server, mainly validation 
        const {emailError, loginError} = errData
        if(errStatus === 400 || errStatus === 401){
          setFormErrors((prev) => {
            return(
              {
                ...prev,
                emailError: emailError,
                loginError: loginError
              }
            )
          })
          console.log("Unsuccessful login")
        }else{
          alert('An error occured in the login process')
        }
      }
    } else{
      // If there is an input error in the form
      setFormErrors((prev) => {
        return({
          ...prev,
          emailError: valStatus.emailError,
          loginError: ""
        })
      })
    }
  }

  return (
    <>
      <div className="flex h-screen">
        <div className="my-auto mx-auto sm:ml-auto sm:mr-6 md:mr-8 lg:mr-10">
          <h2 className="text-4xl font-extrabold dark:text-white mb-4">
            Login
          </h2>
          <form onSubmit={handleFormSubmit} className="max-w-md mb-2">
            {/* need to add in post route */}
            <AccountFormInputText type="email" fieldName="email" label="Email Address" isRequired={true} onInputChange={formChange}/>
            {formErrors.emailError && <p className="-mt-3.5 mb-5 text-xs text-red-600 dark:text-red-400">{formErrors.emailError}</p>}
            <AccountFormInputText type="password" fieldName="password" label="Password" isRequired={true} onInputChange={formChange}/>
            {formErrors.loginError && <p className="-mt-3 mb-2.5 text-xs text-red-600 dark:text-red-400">{formErrors.loginError}</p>}
            
            <Checkbox extraClass="-mt-1 mb-3.5" label="Remember Me" fieldName="checkRemember" onCheckClick={formChange}/>
            
            <FormSubmitButton value="Login" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Don't have an account? Create one{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                here
              </Link>
              .
            </p>
          </form>
          <Link to="/forgot-password" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Forgot password?</Link>
        </div>
      </div>
    </>
  );
}

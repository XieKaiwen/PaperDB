import AccountFormInputText from "./FormInputArea"
import FormSubmitButton from "./FormSubmitButton";
import SignUpRadio from "./SignUpRadio";
import SignUpSelect from "./SignUpSelect";
import {useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import axios from "axios";
import qs from 'qs';
import { validateInputs } from "../../helperfunctions";
export default SignUpForm;
// Component to be used for Login and Signin Forms only


function SignUpForm() {
  const [fieldInputs, setFieldInputs] = useState(
    {
      email:"",
      password: "",
      confirmPassword:"",
      username: "",
      levelRange: "",
      level:"",
    }
  )
  const navigate = useNavigate()

  const [levelRange, setLevelRange] = useState("")



  function formChange(name, newValue){
    setFieldInputs((prevItem) => {
      return {
        ...prevItem,
        [name]: newValue
      }
    })
    //console.log(fieldInputs)
    if (name==="levelRange"){
        setLevelRange(newValue)
    }
  }

  // Validating the fields
  // const [passwordInvalid, setPasswordInvalid] = useState(false);
  // const [selectValid, setSelectValid] = useState(true);

  const [fieldErrors, setfieldErrors] = useState({
    passwordError: "",
    levelError: "",
    usernameError: "",
    emailError: ""
  })

  async function handleFormSubmit(event){
    const {email, password, username, confirmPassword, level} = fieldInputs;
    event.preventDefault();
    let valStatus = {
      error: false,
      passwordError: "",
      levelError: "",
      usernameError: "",
      emailError: ""
    }
    valStatus = validateInputs("register", valStatus, email, password, confirmPassword, username, level)
 
    if(!valStatus.error){
      const formData = qs.stringify(fieldInputs);
      const options = {
        method: "POST",
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: formData,
        url: "/_auth/register",
      }
      try{
        const {data:serverAuth} = await axios(options);
        console.log(serverAuth);
        // TODO: navigate to homepage if no errors in the serverAuth
        try{
          const {data:user_info} = await axios.get("/_auth/check")
          console.log(user_info);
        }catch(err){
          console.error(err);
        }
        console.log("Successfully registered")
        navigate("/home");
        
      }catch(err){
        console.error(err);
        if(err.response.status === 400){
          setfieldErrors((prev) => {
            return(
              {
                ...prev,
                passwordError: err.response.data.passwordError,
                emailError: err.response.data.emailError,
                levelError: err.response.data.levelError,
                usernameError:err.response.data.usernameError
              }
            )
          })
          console.log("Unsuccessful registration")
        }else{
          alert("An error occurred in the registering process");
        }

      }
    } else{
      setfieldErrors((prev) => {
        return(
          {
            ...prev,
            passwordError: valStatus.passwordError,
            emailError: valStatus.emailError,
            levelError: valStatus.levelError,
            usernameError:valStatus.usernameError
          }
        )
    })}
  }





  return (
    <>
      <div className="flex min-h-screen">
        <div className="my-auto mx-auto sm:ml-auto sm:mr-6 md:mr-8 lg:mr-10">
          <h2 className="text-4xl font-extrabold dark:text-white mb-4">
            Sign Up
          </h2>
          <form onSubmit={handleFormSubmit} className="max-w-md">
            {/* need to add in post route */}
            {/* Only Password will have the valid attribute */}
            <AccountFormInputText type="email" fieldName="email" label="Email Address" isRequired={true} onInputChange={formChange} error={fieldErrors.emailError}/>
            {fieldErrors.emailError && <p className="-mt-3.5 mb-5 text-xs text-red-600 dark:text-red-400">{fieldErrors.emailError}</p>}

            <AccountFormInputText type="password" fieldName="password" label="Password" isRequired={true} onInputChange={formChange} error={fieldErrors.passwordError}/>
            <AccountFormInputText type="password" fieldName="confirmPassword" label="Confirm password" isRequired={true} onInputChange={formChange} error={fieldErrors.passwordError}/>
            {fieldErrors.passwordError && <p className="-mt-3.5 mb-5 text-xs text-red-600 dark:text-red-400">{fieldErrors.passwordError}</p>}
            
            <AccountFormInputText type="text" fieldName="username" label="Username" isRequired={true} onInputChange={formChange} error={fieldErrors.usernameError}/>
            {fieldErrors.usernameError && <p className="-mt-3.5 mb-5 text-xs text-red-600 dark:text-red-400">{fieldErrors.usernameError}</p>}


            {/* Dropdown for level */}
            <SignUpRadio onInputChange={formChange}/>
            <label htmlFor="level" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select your level (Changeable)</label>
            
            {/* level range */}
            <SignUpSelect level={levelRange} onInputChange={formChange} />
            {fieldErrors.levelError && <p className="-mt-3 mb-3 text-xs text-red-600 dark:text-red-400">{fieldErrors.levelError}</p>}
            
            
            <FormSubmitButton value="Sign Up" />
            
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Already have an account? Login{" "}
              <Link
                to="/auth/login"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                here
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

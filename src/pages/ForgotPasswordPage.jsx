import axios from "axios";
import FormSubmitButton from "../components/FormSubmitButton";
import qs from "qs"
import { useState, useEffect } from "react";

// Hardcoding most of this part instead of using components is because of the simplicity of the page

export default function ForgotPasswordPage(){
    const resendTimer = 10;
    const [sentEmail, setSentEmail] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");
    const [seconds, setSeconds] = useState(resendTimer);

    useEffect(() => {
        if(sentEmail){
            // Timer logic
            const interval = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds > 0 ? prevSeconds - 1 : 0);
                // Decrease until 0 and remain at 0
            }, 1000); // Update every second
        
            // Clean up interval on component unmount
            return () => clearInterval(interval);    
        }
        
    }, [sentEmail]); // Run whenever 'seconds' state changes

    async function handleFormSubmit(event){
        event.preventDefault()
        // 1. Validate the email input (will be repeated on the server as well)
        let isError = false;
        const emailRegex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
        if(!emailRegex.test(emailInput) || emailInput.length > 320){ 
            //if email does not follow the regex pattern, or longer than 320 characters (maximum length of an email)
            setEmailError("Email entered is not valid");
            isError = true;
            console.log("Email is not valid");
        }else{
            setEmailError("");
        }
        if(!isError){
            // Trigger API to the endpoint ("/forgot_password")
            const formData = qs.stringify({email: emailInput}); //turn the form data into something to pass into axios
            const options = {
                method: "POST",
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                data: formData,
                url: "/forgot-password",
            }
            try{                
                // 2. Send out email
                const {data} = await axios(options);        
                console.log(data);
                 // 3. After successfully sending out an email, set state for sentEmail to true and rerender the other component
                setSentEmail(true);
            }catch(err){
                const {status: errStatus, data:errData} = err.response;
                if(errStatus === 400){
                    setEmailError(errData.emailError);
                    console.log("Email sending unsuccessful"); 
                }else{
                    console.error(err);
                    alert("An error occurred when sending the email")
                }    
            }
        }     

    }

    async function handleResendClick(){
        setSeconds(resendTimer); // Reset seconds to 60
        // Trigger API to send email again
        const formData = qs.stringify({email: emailInput});
        const options = {
          method: "POST",
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          data: formData,
          url: "/forgot-password",
        }
        try{
          // hit the API endpoint for resending email
          const {data:responseMessage} = await axios(options)
          console.log(responseMessage)
        }catch(err){
          console.error(err);
          alert("Error in resending verification email...")
        }
      };
    

    function handleEmailChange(event){
        const {value} = event.target;
        setEmailInput(value);
    }

    const inputClassString = emailError ? "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-red-300 appearance-none dark:text-white dark:border-red-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer":
    "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
    if(!sentEmail){
        return (
            <>
              <div className="flex h-screen">
                <div className="my-auto mx-auto ">
                  <h2 className="text-4xl font-extrabold dark:text-white mb-4">
                    Forgot Password?
                  </h2>
                  <form onSubmit={handleFormSubmit} className="max-w-md mb-2">
                    <p className="mt-2 mb-2 text-md text-gray-500 dark:text-gray-400">
                      Enter your username or email and we will send you a link to reset your password.
                    </p>
                    {/* Not going to use the component because of simplicity reasons, only one field needed: email */}
                    <div className="relative z-0 w-full mb-5 group">
                        <input
                        id= "email"
                        type="email"
                        name="email"
                        className={inputClassString}
                        placeholder=" "
                        value={emailInput}
                        required
                        onChange={handleEmailChange}
                        autoComplete="on"
                        />
                        <label
                        htmlFor= "email"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Email *
                        </label>
                    </div>
                    {emailError && <p className="-mt-3.5 mb-3 text-xs text-red-600 dark:text-red-400">{emailError}</p>}
                    <FormSubmitButton value="Submit" />
                  </form>
                </div>
              </div>
            </>
        
        )
    }else{
        return (
            <div className="container">
                <p className="text-gray-500 dark:text-gray-400 pt-8 pb-6 px-14 xl:py-14 w-full md:w-10/12 md:px-6">
                    A link to reset your password has been sent to <b>{emailInput}</b>. Click on the link provided in the email to reset your password.
                </p>
                <p className="text-gray-500 dark:text-gray-400 px-14 pb-6 w-full md:w-10/12 md:px-6">
                Cant't find the email? Try checking your spam folder
                </p>
                <p className="text-gray-500 dark:text-gray-400 px-14 w-full md:w-10/12 md:px-6 inline">
                Didn't receive the email? 
                </p>
                {seconds > 0 && (
                <button
                    disabled
                    type="button"
                    className="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center"          >
                    Resend email ({seconds})
                </button>
                )}
                {seconds === 0 && (
                <button
                    type="button"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={handleResendClick}
                >
                    Resend email
                </button>
                )}
            </div>
        )
    }
    
}
import { useState,useEffect } from "react";
import { useLocation } from "react-router-dom";
import qs from "qs";
import axios from "axios"

export default function AwaitVerificationPage() {
  // Add a timer to resend email (prevent spam clicking)
  const [seconds, setSeconds] = useState(10);
  const location = useLocation();
  const queryParameters = new URLSearchParams(location.search)
  const email = queryParameters.get("email");
  useEffect(() => {
    // Timer logic
    const interval = setInterval(() => {
      setSeconds(prevSeconds => {
        // Decrease seconds by 1, stop at 0
        if (prevSeconds > 0) {
          return prevSeconds - 1;
        } else {
          clearInterval(interval); // Stop the timer when it reaches 0
          return 0;
        }
      });
    }, 1000); // Update every second

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [seconds]); // Run whenever 'seconds' state changes

  async function handleResendClick(){
    setSeconds(60); // Reset seconds to 60
    // Trigger API to send email again
    const formData = qs.stringify({email: email});
    const options = {
      method: "POST",
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: formData,
      url: "/resend",
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


  return (
    <>
      <div className="container">
        <p className="text-gray-500 dark:text-gray-400 py-8 px-14 xl:py-14 w-full md:w-10/12 md:px-6">
          <b>A verification email has been sent to the email account.</b> Please
          click on the link provided in the email to activate your account and
          complete the registration process.
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
      
    </>
  );
}

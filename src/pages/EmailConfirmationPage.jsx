import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";


export default function EmailConfirmationPage() {
  const location = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")
  //console.log(location)
  useEffect(()=>{
    const queryParams = new URLSearchParams(location.search);
    const tokenValue = queryParams.get("token");
    console.log("Token:", tokenValue)
    async function verifyToken(){
      try{
        await axios.get(`/verify_token/${tokenValue}`);
        setIsSuccess(true);
      }catch(err){
        console.error(err);
        setErrorMessage(err.response.data);
      }
    }
    verifyToken();
  }, [])


  return (
    <>
      {isSuccess &&
        <p className="text-gray-500 dark:text-gray-400 mx-auto py-10 px-14 w-full md:w-10/12 md:px-6">
          Email successfully verified, account has been successfully activated. Click{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            here
          </Link>{" "}
          to login to use your account!
        </p>
      }
      {!isSuccess && <p className="text-gray-500 dark:text-gray-400 mx-auto py-10 px-14 w-full md:w-10/12 md:px-6">
          Email verification <b>unsuccessful</b>: {errorMessage}</p>}
    </>
  );
}

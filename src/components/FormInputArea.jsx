import { useState } from "react";
import PasswordVisibleToggle from "./PasswordVisibleToggle";
export default AccountFormInputText;

function AccountFormInputText({
  type,
  fieldName,
  label,
  isRequired,
  onInputChange,
  error,
}) {
  // error prop is only for password and username and email and level

  const [textInput, setTextInput] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function handleInputChange(event) {
    const newValue = event.target.value;
    const field = event.target.name;
    setTextInput(newValue);
    //console.log(textInput)
    onInputChange(field, newValue);
  }

  const inputClassString = error ? "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-red-300 appearance-none dark:text-white dark:border-red-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer":
    "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"

  return (
    <>
      <div className="relative z-0 w-full mb-5 group">
        <input
          id={fieldName}
          type={isPasswordVisible ? "text" : type}
          name={fieldName}
          className={inputClassString}
          placeholder=" "
          value={textInput}
          required={isRequired}
          onChange={handleInputChange}
          autoComplete="on"
        />
        <label
          htmlFor={fieldName}
          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          {isRequired ? label + " *" : label}
        </label>
        {(fieldName === "password" || fieldName === "confirmPassword") && (
          <button
            type="button"
            className="absolute top-0 end-0 p-3.5 rounded-e-md"
            onClick={() => {
              setIsPasswordVisible((prev) => {
                return !prev;
              });
            }}
          >
            <PasswordVisibleToggle visible={isPasswordVisible} />
          </button>
        )}
      </div>
    </>
  );
}

import { useState } from "react";

export default function Checkbox({ extraClass, label, fieldName, onCheckClick }) {
    const [isChecked, setIsChecked] = useState(false);
    function handleCheckClick(event){
        const {name} = event.target;
        setIsChecked((prev)=>{
            return !prev; //toggle between false and true
        });
        onCheckClick(name, !isChecked); //pass in the value manually as toggled because setIsChecked is asynchronous;
    }

    return (
        <div className={`flex items-center ${extraClass}`}>
        <input
            id="checked-checkbox"
            type = "checkbox"
            name = {fieldName}
            // value= {isChecked} //an attribute in html will always evaluate to a string
            onClick={handleCheckClick}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
            htmlFor="checked-checkbox"
            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
            {label}
        </label>
        </div>
    );
}

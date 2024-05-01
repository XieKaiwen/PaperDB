export default SignUpRadio

function SignUpRadio({onInputChange}){
    return(
        <>
            <fieldset onInput={(e) => {
                const name = e.target.name;
                const value = e.target.value;
                onInputChange(name, value)
            }}>
                <legend className="sr-only">Levels</legend>

                <div className="flex items-center mb-4">
                    <input type="radio" name="levelRange" value="Pri" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="Primary" className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300">
                    Primary 1 to 6
                    </label>
                </div>

                <div className="flex items-center mb-4">
                    <input  type="radio" name="levelRange" value="Sec" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="Secondary" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Secondary 1 to 4
                    </label>
                </div>

                <div className="flex items-center mb-4">
                    <input type="radio" name="levelRange" value="JC" className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="JC" className="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    JC1, JC2
                    </label>
                </div>
        
            </fieldset>
        </>
    )
}
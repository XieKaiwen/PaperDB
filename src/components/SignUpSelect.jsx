export default SignUpSelect;

function SignUpSelect({level, onInputChange}){
    return (
        <>
        {/* Set the levels as integers */}
            {!level && <select id="level" name="level" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4" onChange={(e) => {
                const {name, value} = e.target
                onInputChange(name, value)
            }} disabled>
                    <option value="" >-Select range first-</option>
                </select>}
            {level==="Pri" && 
            <select id="level" name="level" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4" onChange={(e) => {
                const {name, value} = e.target
                onInputChange(name, value)
            }} >
                <option value="">-Choose a level-</option>
                <option value="1">Pri 1</option>
                <option value="2">Pri 2</option>
                <option value="3">Pri 3</option>
                <option value="4">Pri 4</option>
                <option value="5">Pri 5</option>
                <option value="6">Pri 6</option>
            </select>
            }
            {level==="Sec" && 
            <select id="level" name="level" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4" onChange={(e) => {
                const {name, value} = e.target
                onInputChange(name, value)
            }}>
                <option value="">-Choose a level-</option>
                <option value="7">Sec 1</option>
                <option value="8">Sec 2</option>
                <option value="9">Sec 3</option>
                <option value="10">Sec 4</option>
            </select>
            }
            {level==="JC" && 
            <select id="level" name="level" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4" onChange={(e) => {
                const {name, value} = e.target
                onInputChange(name, value)
            }} >
                <option value="">-Choose a level-</option>
                <option value="11">JC 1</option>
                <option value="12">JC 2</option>
            </select>
            }
        </>
    )
}
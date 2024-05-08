export function validateInputs(purpose, valStatus , email, password, confirmPassword, username, level){
    // 1. validate email
    const emailRegex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    if(!emailRegex.test(email) || email.length > 320){ 
        //if email does not follow the regex pattern, or longer than 320 characters (maximum length of an email)
        valStatus = {
            ...valStatus,
            error: true,
            emailError: "Email entered is not valid."
        }
    }     
    
    if(purpose === "register"){
        // 2. validate password
        if(password != confirmPassword){
            valStatus = {
                ...valStatus,
                error: true,
                passwordError: "Passwords entered should be the same."
            }
        } else if(password.length < 8){
            valStatus = {
                ...valStatus,
                error: true,
                passwordError: "Password needs to be at least 8 characters."
            }
        }
        // 3. validate username
        if(username.length > 50){
            valStatus = {
                ...valStatus,
                error: true,
                usernameError: "Username cannot be longer than 50 characters."
            }
        } 
        // 4. validate level input
        if(level === ""){
            // Tests if the level string only contains numbers
            valStatus = {
                ...valStatus,
                error: true,
                levelError: "Please choose a level for your account"
            }
        } else if (!(/^\d+$/.test(level))){
            valStatus = {
                ...valStatus,
                error: true,
                levelError: "Invalid level. Level should be numeric"
            }
        } else if (parseInt(level) < 1 || parseInt(level) > 12){
            valStatus = {
                ...valStatus,
                error: true,
                levelError: "Invalid level. Level cannot be less than 1 or more than 12"
            }
        }   
    }
    
    // 5. Return the valStatus
    return valStatus;
}
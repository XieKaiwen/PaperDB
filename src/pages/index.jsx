import React from "react"
import {Link} from "react-router-dom"

export default IndexPage

function IndexPage(){
    return (
        <>
            <Link to="auth/login">Login</Link><br/>
            <Link to="auth/signup">Sign Up</Link>
            <h1>This is the Index Page. To describe my Project</h1>
        </>
    )
}

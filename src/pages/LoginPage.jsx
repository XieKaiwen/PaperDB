import React from "react"
import LoginForm from "../components/LoginForm"
import PenLogo  from "../components/PenLogo"


export default LoginPage
{/* <img className="w-16 md:w-24  lg:w-28 inline-block" src={penLogo} /> */}
function LoginPage(){
    return(
        <>
            <div className="px-16 py-4 2xl:px-24">
                <div className="sm:flex">
                    <div className="w-3/5 my-auto hidden sm:block">
                        <h1 className="font-serif mb-2 lg:mb-9 text-5xl font-extrabold leading-none tracking-tight text-gray-900 md:text-6xl lg:text-8xl dark:text-white">PaperDB <PenLogo /> </h1>
                        <p className="mb-4 hidden lg:block lg:text-lg font-normal text-gray-500 dark:text-gray-400 text-balance">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sit amet semper ex. Donec ac metus sit amet dolor tempor feugiat. Aliquam erat volutpat. Ut vitae vestibulum nunc. Quisque sit amet sem purus. Fusce eleifend, quam eu semper vulputate, ante lacus scelerisque elit, sed bibendum leo turpis ac massa. Phasellus a nunc ac leo venenatis elementum. (Description)</p>
                    </div>
                    <div className="w-full sm:w-2/5">
                        {/* Find out how to do the wrapper route trick and rewatch the router video*/}
                        {/* Find out how to style a Link */}
                        <LoginForm/>
                    </div>
                </div>
            </div>

        </>
    )
}

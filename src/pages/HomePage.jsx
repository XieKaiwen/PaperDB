import React from "react"
import { useEffect} from "react"
import { useLocation } from "react-router-dom"

export default HomePage

function HomePage(){
    const location = useLocation();
    console.log(location)
    return <h1 className="text-3xl font-bold underline">Home Page!</h1>
}

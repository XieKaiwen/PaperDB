import { useLocation, Outlet } from "react-router-dom";
import AuthLayout from "./AuthLayout";


export default function Layout(){
    const {pathname} = useLocation();
    if(pathname==="/login" || pathname==="/signup"){
        return(
            <AuthLayout>
                <Outlet />
            </AuthLayout>
        )
    } else{
        return (
            <Outlet/>
        )
    }
}
import React, {createContext, useReducer, useEffect, useState} from "react";
import axios from "axios";

export const AuthContext = createContext()

const initialState = {
    isAuthenticated: false,
    user_id: "",
    username: "",
    level: "",
    date_joined: ""
};

function reducer(state, action){
    switch(action.type){
        case 'LOGIN':
            // localStorage.setItem('user_id', action.payload.user_id),
            // localStorage.setItem('username', action.payload.username),
            // localStorage.setItem('level', action.payload.level),
            // localStorage.setItem('date_joined', action.payload.date_joined)
            return{
                ...state,
                isAuthenticated: true,
                user_id: action.payload.user_id,
                username: action.payload.username,
                level: action.payload.level,
                date_joined: action.payload.date_joined
            }
        case 'LOGOUT':
            // localStorage.clear();
            return {
                ...state,
                isAuthenticated: false,
                user_id: "",
                username: "",
                level: "",
                date_joined: ""
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [userInfo, dispatch] = useReducer(reducer, initialState);
    const [readyForRender, setReadyForRender] = useState(false)
    useEffect(() => {
        async function fetchAuth(){
          try {
            const { data:userData } = await axios.get("/_auth/check"); //This route will be called twice because of React.StrictMode but it will not happen twice once in production
    
            //console.log(userData); // Log the initial state
            if (userData.isAuthenticated) {
                dispatch({ type: 'LOGIN', payload: userData });
            }
            setReadyForRender(true);
          } catch (error) {
            console.error("Failed to fetch auth data", error);
          }
        }
        fetchAuth()
      }, []);

    const login = (userData) => {
        dispatch({ type: 'LOGIN', payload: userData });
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    if(!readyForRender){
        return null
    }

    return (
        <AuthContext.Provider value={{userInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
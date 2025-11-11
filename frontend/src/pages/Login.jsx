import React, {useState} from "react"
import { Navigate } from "react-router-dom"
import axios from "axios"

import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"
import { SERVER_ADDRESS } from "../config/global_constants"



export default function Login(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [redirectHome, setRedirectHome] = useState(false)

    const handleSubmit = e => {
        e.preventDefault()


        //todo validation
        const formData = new FormData(e.target)

        axios.post(`${SERVER_ADDRESS}/api/login`, formData, {headers: {"Content-Type": "multipart/form-data" }})
        .then(res => {
            console.log(res)
            if (res.status === 200){
                console.log(res)
                localStorage.setItem("user", res.data.data.user.user_email)
                localStorage.setItem("token", res.data.token)
                localStorage.setItem("accessLevel", 1)
                setRedirectHome(true)
            }
            else {
                console.log(res)
                setErrorMessage(res.errorMessage)
            }
        })
        .catch(err => {
            console.log(err)
            setErrorMessage(err)
        })
    }

    return (
        <div id="loginPage">
            {redirectHome ? <Navigate to="/" replace/> : ""}
            <div id="formContainer">
                <div id="returnButton"><a href="/home">↩</a></div>

                <h2>Login to your EduSense account</h2>
                {errorMessage === "" ? errorMessage : ""}
                <form action="#" onSubmit={e=>handleSubmit(e)}>
                    <FormTextField 
                        label="Email"
                        type="text"
                        value={email}
                        onChange={setEmail}
                        required={true}
                        formFor="user_email"
                    />

                    <FormTextField 
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        required = {true}
                        formFor="user_password"
                    />

                    

                    <button type="submit">Login</button>


                    <p id="callToRegister">
                        Don't have an account? <a href="/register" id="callToRegisterLink">Register Now</a>
                    </p>
                </form>
                
            </div>
        </div>
    )
}
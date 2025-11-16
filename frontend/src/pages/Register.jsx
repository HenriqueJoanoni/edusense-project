import React, {useState} from "react"
import { Navigate } from "react-router-dom"
import axios from "axios"


import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"
import { SERVER_ADDRESS } from "../config/global_constants"

export default function Register(){
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [organisation, setOrganisation] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [redirectHome, setRedirectHome] = useState(false)
    

    const handleSubmit = e => {
        e.preventDefault()
        

        if (password!== confirmedPassword){
            setErrorMessage("Passwords do not match")
            return
        }
        //todo validation

        
        const formData = new FormData(e.target)
        formData.append("user_role", "student")


        
        axios.post(`${SERVER_ADDRESS}/api/register`, formData, {headers: {"Content-Type": "multipart/form-data" }})
        .then(res => {
            if (res.status === 201){
                console.log(res.data)
                localStorage.setItem("user",  res.data.data.user.user_email)
                localStorage.setItem("token", res.data.token)
                setErrorMessage("")
                setRedirectHome(true)


            }
            else {
                console.log(res)
            }
        })
        .catch(err => {
            console.log(err)
            setErrorMessage(err)
        })




    }

    return (
        <div id="registerPage">
            {redirectHome ? <Navigate to="/" replace/> : ""}
            <div id="formContainer">
                <div id="returnButton"><a href="/home">↩</a></div>

                <h2>Create an EduSense Account</h2>
                {errorMessage === "" ? errorMessage : ""}
                <form action="#" onSubmit={(e)=>{handleSubmit(e)}}>
                    <FormTextField 
                        label="Name"
                        type="text"
                        value={name}
                        onChange={setName}
                        required={true}
                        formFor="user_name"
                    />


                    <FormTextField 
                        label="Email"
                        type="text"
                        value={email}
                        onChange={setEmail}
                        required={true}
                        formFor="user_email"
                    />
                    
                    {/*  
                    <FormTextField 
                        label="Organisation"
                        type="text"
                        value={organisation}
                        onChange={setOrganisation}
                        required = {true}
                    />

                    */}

                    <FormTextField 
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        required = {true}
                        formFor="user_password"
                    />

                    <FormTextField 
                        label="Confirm Password"
                        type="password"
                        value={confirmedPassword}
                        onChange={setConfirmedPassword}
                        required = {true}
                        formFor="user_password_confirmation"
                    />

                    

                    <button type="submit">Register</button>


                    <p id="callToRegister">
                        Already have an account? <a href="/login" id="callToRegisterLink">Login</a>
                    </p>
                </form>
                
            </div>
        </div>
    )
}
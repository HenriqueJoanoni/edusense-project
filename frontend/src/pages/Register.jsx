import React, {useState} from "react"
import axios from "axios"
import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"

export default function Register(){
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [organisation, setOrganisation] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const handleSubmit = e => {
        e.preventDefault()
        

        if (password!== confirmedPassword){
            setErrorMessage("Passwords do not match")
            return
        }
        //todo validation

        
        const formData = new FormData(e.target)

        
        axios.post(`${process.env.SERVER_HOST}/register`, formData, {headers: {"Content-Type": "multipart/form-data" }})
        .then(res => {
            if (res.status === 201){
                console.log(res.data)
                sessionStorage.user = res.data.user.user_email
                sessionStorage.token = res.token
                setErrorMessage("")

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
                        form_for="user_email"
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

                    

                    <button type="submit">Login</button>


                    <p id="callToRegister">
                        Already have an account? <a href="/login" id="callToRegisterLink">Login</a>
                    </p>
                </form>
                
            </div>
        </div>
    )
}
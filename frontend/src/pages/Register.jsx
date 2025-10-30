import React, {useState} from "react"
import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"

export default function Register(){
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [organisation, setOrganisation] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")

    return (
        <div id="registerPage">
            <div id="formContainer">
                <div id="returnButton"><a href="/home">↩</a></div>

                <h2>Create an EduSense Account</h2>
                <form action="">
                    <FormTextField 
                        label="Name"
                        type="text"
                        value={name}
                        onChange={setName}
                        required={true}
                    />


                    <FormTextField 
                        label="Email"
                        type="text"
                        value={email}
                        onChange={setEmail}
                        required={true}
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
                    />

                    <FormTextField 
                        label="Confirm Password"
                        type="password"
                        value={confirmedPassword}
                        onChange={setConfirmedPassword}
                        required = {true}
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
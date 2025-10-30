import React, {useState} from "react"
import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"

export default function Login(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div id="loginPage">
            <div id="formContainer">
                <div id="returnButton"><a href="/home">↩</a></div>

                <h2>Login to your EduSense account</h2>
                <form action="">
                    <FormTextField 
                        label="Email"
                        type="text"
                        value={email}
                        onChange={setEmail}
                        required={true}
                    />

                    <FormTextField 
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        required = {true}
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
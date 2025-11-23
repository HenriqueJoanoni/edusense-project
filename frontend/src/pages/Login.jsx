import React, {useState} from "react"
import {Navigate} from "react-router-dom"
import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"
import api, {setAuthToken} from "../api";

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [redirectHome, setRedirectHome] = useState(false)

    const handleSubmit = e => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('user_email', email)
        formData.append('user_password', password)

        api.post('/login', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        })
            .then(res => {
                setAuthToken(res.data.token)
                localStorage.setItem("user", res.data.data.user.user_email)
                localStorage.setItem("accessLevel", 1)
                setRedirectHome(true)
            })
            .catch(err => {
                setErrorMessage(err.userMessage)
            })
    }

    return (
        <div id="loginPage">
            {redirectHome ? <Navigate to="/" replace/> : ""}
            <div id="formContainer">
                <div id="returnButton"><a href="/home">↩</a></div>

                <h2>Login to your EduSense account</h2>
                {errorMessage === "" ? errorMessage : ""}
                <form action="#" onSubmit={e => handleSubmit(e)}>
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
                        required={true}
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
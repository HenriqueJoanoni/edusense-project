import React, {useState} from "react"
import {Navigate} from "react-router-dom"
import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"
import "../css/SweetAlert.css"
import api from "../api";

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [organisation, setOrganisation] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [redirectToLogin, setRedirectToLogin] = useState(false)

    const handleSubmit = e => {
        e.preventDefault()
        if (password !== confirmedPassword) {
            setErrorMessage("Passwords do not match")
            return
        }
        const formData = new FormData()
        formData.append('user_name', name)
        formData.append('user_email', email)
        formData.append('user_password', password)
        formData.append('user_password_confirmation', confirmedPassword)

        api.post('/register', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        })
            .then(res => {
                setRedirectToLogin(true)
            })
            .catch(err => {
                setErrorMessage(err.userMessage)
            })
    }

    return (
        <div id="registerPage">
            {redirectToLogin ? <Navigate to="/login" replace/> : ""}
            <div id="formContainer">
                <div id="returnButton"><a href="/home">↩</a></div>

                <h2>Create an EduSense Account</h2>
                {errorMessage === "" ? errorMessage : ""}
                <form action="#" onSubmit={(e) => {
                    handleSubmit(e)
                }}>
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

                    <FormTextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        required={true}
                        formFor="user_password"
                    />

                    <FormTextField
                        label="Confirm Password"
                        type="password"
                        value={confirmedPassword}
                        onChange={setConfirmedPassword}
                        required={true}
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
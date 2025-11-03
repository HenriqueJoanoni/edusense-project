import React, {useState} from "react"
import FormTextField from "../components/FormTextField"
import "../css/LoginRegister.css"

export default function Login(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const handleSubmit = e => {
        e.preventDefault()


        //todo validation
        const formData = new FormData(e.target)

        axios.post(`${process.env.SERVER_ADDRESS}/login`, formData, {headers: {"Content-Type": "multipart/form-data" }})
        .then(res => {
            if (res.status === 200){
                sessionStorage.user = res.data.user.user_email
                sessionStorage.token = res.token
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
            <div id="formContainer">
                <div id="returnButton"><a href="/home">↩</a></div>

                <h2>Login to your EduSense account</h2>
                {errorMessage === "" ? errorMessage : ""}x
                <form action="">
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
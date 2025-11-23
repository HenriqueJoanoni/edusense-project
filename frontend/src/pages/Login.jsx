import React, {useState} from "react"
import {Navigate} from "react-router-dom"
import FormTextField from "../components/FormTextField"
import "../sass_styles/LoginRegister.scss"
import api, {setAuthToken} from "../api"
import {showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert} from "../utils/alerts"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [redirectHome, setRedirectHome] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            showErrorAlert(
                'Missing Information',
                'Please enter both email and password.'
            )
            return
        }

        showLoadingAlert('Logging in to Your Account...')

        const formData = new FormData()
        formData.append('user_email', email)
        formData.append('user_password', password)

        try {
            const res = await api.post('/login', formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            })

            setAuthToken(res.data.token)
            sessionStorage.setItem("User", JSON.stringify(res.data.data.user))
            sessionStorage.setItem("Token", res.data.token)

            closeAlert()
            await showSuccessAlert(
                'Welcome Back!',
                'You will be redirected to your dashboard.',
                {
                    timer: 2000,
                    timerProgressBar: true,
                    willClose: () => {
                        setRedirectHome(true)
                    }
                }
            )

        } catch (err) {
            closeAlert()

            const errorMessage = err.response?.data?.message
                || err.userMessage
                || 'Invalid email or password. Please try again.'

            showErrorAlert('Login Failed', errorMessage)
        }
    }

    return (
        <div id="loginPage">
            {redirectHome && <Navigate to="/home" replace/>}

            <div className="auth-container">
                <div className="auth-branding">
                    <div className="branding-content">
                        <div className="logo-section">
                            <img src="/edusense-logo-new.png" alt="EduSense Logo" className="logo"/>
                        </div>
                        <p className="brand-tagline">
                            Smart Attendance System for Modern Education
                        </p>
                        <div className="features-list">
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Automated Attendance Tracking</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Real-Time Reporting</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Secure & Reliable</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-form-wrapper">
                    <a href="/home" className="back-button" aria-label="Back to homepage">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        <span>Back</span>
                    </a>

                    <div className="form-container">
                        <div className="form-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <FormTextField
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                required={true}
                                formFor="user_email"
                                placeholder="john.smith@university.ac.uk"
                            />

                            <FormTextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                required={true}
                                formFor="user_password"
                                placeholder="Enter your password"
                            />

                            <button type="submit" className="submit-btn">
                                Sign In
                            </button>

                            <p className="form-footer-text">
                                Don't have an account?{' '}
                                <a href="/register" className="auth-link">
                                    Create Account
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

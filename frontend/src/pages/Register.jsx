import React, {useState} from "react"
import {Navigate} from "react-router-dom"
import FormTextField from "../components/FormTextField"
import "../sass_styles/LoginRegister.scss"
import api from "../api"
import {showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert} from "../utils/alerts"

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [organisation, setOrganisation] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [redirectToLogin, setRedirectToLogin] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmedPassword) {
            showErrorAlert(
                'Passwords Do Not Match',
                'Please ensure both password fields are identical.'
            )
            return
        }

        if (password.length < 8) {
            showErrorAlert(
                'Weak Password',
                'Your password must be at least 8 characters long.'
            )
            return
        }

        showLoadingAlert('Creating Your Account...')

        const formData = new FormData()
        formData.append('user_name', name)
        formData.append('user_email', email)
        formData.append('user_password', password)
        formData.append('user_password_confirmation', confirmedPassword)

        try {
            await api.post('/register', formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            })

            closeAlert()
            await showSuccessAlert(
                'Account Created Successfully!',
                'You will be redirected to the login page.',
                {
                    timer: 2500,
                    timerProgressBar: true,
                    willClose: () => {
                        setRedirectToLogin(true)
                    }
                }
            )

        } catch (err) {
            closeAlert()

            if (err.response?.status === 422 && err.response?.data?.errors) {
                const validationErrors = err.response.data.errors
                const firstError = Object.values(validationErrors)[0][0]
                showErrorAlert('Validation Error', firstError)
            } else {
                const errorMessage = err.response?.data?.message
                    || err.userMessage
                    || 'An error occurred during registration. Please try again.'
                showErrorAlert('Registration Failed', errorMessage)
            }
        }
    }

    return (
        <div id="registerPage">
            {redirectToLogin && <Navigate to="/login" replace/>}

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
                            <h2>Create Your Account</h2>
                            <p>Join thousands of educators using EduSense</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <FormTextField
                                label="Full Name"
                                type="text"
                                value={name}
                                onChange={setName}
                                required={true}
                                formFor="user_name"
                                placeholder="John Smith"
                            />

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
                                placeholder="Minimum 8 characters"
                            />

                            <FormTextField
                                label="Confirm Password"
                                type="password"
                                value={confirmedPassword}
                                onChange={setConfirmedPassword}
                                required={true}
                                formFor="user_password_confirmation"
                                placeholder="Re-enter your password"
                            />

                            <button type="submit" className="submit-btn">
                                Create Account
                            </button>

                            <p className="form-footer-text">
                                Already have an account?{' '}
                                <a href="/login" className="auth-link">
                                    Sign In
                                </a>
                            </p>

                            <p className="terms-text">
                                By registering, you agree to our{' '}
                                <a href="/terms" className="terms-link">Terms of Service</a>
                                {' '}and{' '}
                                <a href="/privacy" className="terms-link">Privacy Policy</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

import React, {useState, useEffect} from "react"
import {Navigate} from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../sass_styles/StudentProfile.scss"
import api from "../api"
import {showErrorAlert, showLoadingAlert, closeAlert, showSuccessAlert} from "../utils/alerts"

export default function StudentProfile() {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [redirectToLogin, setRedirectToLogin] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        user_name: '',
        user_email: ''
    })

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            setLoading(true)

            const userSession = JSON.parse(sessionStorage.getItem("User"))

            if (!userSession || !userSession.id) {
                throw new Error('No user session found')
            }

            const response = await api.post('/user', {
                id: userSession.id
            }, {
                headers: {'Content-Type': 'application/json'}
            })

            if (response.data.success) {
                setUserData(response.data.data)
                setEditData({
                    user_name: response.data.data.user.user_name,
                    user_email: response.data.data.user.user_email
                })
            }
        } catch (err) {
            console.error('Error fetching user data:', err)

            if (err.response?.status === 401 || err.message === 'No user session found') {
                showErrorAlert(
                    'Session Expired',
                    'Please log in again to access your profile.'
                )
                setTimeout(() => {
                    sessionStorage.clear()
                    setRedirectToLogin(true)
                }, 2000)
            } else {
                showErrorAlert(
                    'Failed to Load Profile',
                    err.response?.data?.message || 'An error occurred whilst loading your profile.'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    const handleEditToggle = () => {
        setIsEditing(!isEditing)
        if (isEditing) {
            setEditData({
                user_name: userData.user.user_name,
                user_email: userData.user.user_email
            })
        }
    }

    const handleSaveChanges = async () => {
        showLoadingAlert('Updating Your Profile...')

        try {
            const userSession = JSON.parse(sessionStorage.getItem("User"))

            const response = await api.post('/user/update', {
                id: userSession.id,
                user_name: editData.user_name,
                user_email: editData.user_email
            }, {
                headers: {'Content-Type': 'application/json'}
            })

            closeAlert()

            if (response.data.success) {
                const updatedUser = {
                    ...userSession,
                    user_name: response.data.data.user.user_name,
                    user_email: response.data.data.user.user_email
                }
                sessionStorage.setItem("User", JSON.stringify(updatedUser))

                setUserData(response.data.data)
                setIsEditing(false)

                await showSuccessAlert(
                    'Profile Updated',
                    'Your changes have been saved successfully.'
                )
            }
        } catch (err) {
            closeAlert()
            showErrorAlert(
                'Update Failed',
                err.response?.data?.message || 'Failed to update your profile.'
            )
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (redirectToLogin) {
        return <Navigate to="/login" replace/>
    }

    return (
        <div id="studentProfilePage">
            <Header/>

            <main className="profile-main">
                <div className="profile-container">
                    <div className="page-header">
                        <div className="header-content">
                            <h1>My Profile</h1>
                            <p>View and manage your account information</p>
                        </div>
                        {!loading && userData && (
                            <button
                                onClick={handleEditToggle}
                                className={`edit-btn ${isEditing ? 'cancel' : ''}`}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your profile...</p>
                        </div>
                    ) : userData ? (
                        <div className="profile-content">
                            <div className="profile-card">
                                <div className="profile-header-card">
                                    <div className="avatar-section">
                                        <div className="avatar">
                                            {userData.user.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-status">
                                            <span
                                                className={`status-badge ${userData.permissions.is_admin ? 'admin' : ''}`}>
                                                {userData.role_label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-info">
                                    <div className="info-section">
                                        <h3 className="section-title">Personal Information</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>Full Name</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="edit-input"
                                                        value={editData.user_name}
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            user_name: e.target.value
                                                        })}
                                                    />
                                                ) : (
                                                    <p>{userData.user.user_name}</p>
                                                )}
                                            </div>

                                            <div className="info-item">
                                                <label>Email Address</label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        className="edit-input"
                                                        value={editData.user_email}
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            user_email: e.target.value
                                                        })}
                                                    />
                                                ) : (
                                                    <p>{userData.user.user_email}</p>
                                                )}
                                            </div>

                                            <div className="info-item">
                                                <label>User ID</label>
                                                <p className="user-id">#{userData.user.id}</p>
                                            </div>

                                            <div className="info-item">
                                                <label>Email Verification</label>
                                                <div
                                                    className={`verification-status ${userData.user.email_verified_at ? 'verified' : 'pending'}`}>
                                                    <span className="status-icon">
                                                        {userData.user.email_verified_at ? '✓' : '⏳'}
                                                    </span>
                                                    <span>{userData.user.email_verified_at ? 'Verified' : 'Pending Verification'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3 className="section-title">Account Details</h3>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>Account Created</label>
                                                <p>{formatDate(userData.user.created_at)}</p>
                                            </div>

                                            <div className="info-item">
                                                <label>Last Updated</label>
                                                <p>{formatDate(userData.user.updated_at)}</p>
                                            </div>

                                            <div className="info-item">
                                                <label>Account Role</label>
                                                <p>{userData.role_label}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3 className="section-title">Permissions</h3>
                                        <div className="permissions-grid">
                                            <div
                                                className={`permission-item ${userData.permissions.is_admin ? 'granted' : 'denied'}`}>
                                                <span className="permission-icon">
                                                    {userData.permissions.is_admin ? '✓' : '✗'}
                                                </span>
                                                <span>Administrator Access</span>
                                            </div>

                                            <div
                                                className={`permission-item ${userData.permissions.can_manage_courses ? 'granted' : 'denied'}`}>
                                                <span className="permission-icon">
                                                    {userData.permissions.can_manage_courses ? '✓' : '✗'}
                                                </span>
                                                <span>Manage Courses</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <div className="action-buttons">
                                            <button onClick={handleSaveChanges} className="save-btn">
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="profile-actions">
                                <h3>Account Actions</h3>
                                <div className="actions-grid">
                                    <div className="action-card"
                                         onClick={() => showErrorAlert('Coming Soon', 'This feature will be available shortly.')}>
                                        <span className="action-icon">🔒</span>
                                        <div className="action-content">
                                            <h4>Change Password</h4>
                                            <p>Update your account password</p>
                                        </div>
                                    </div>

                                    <div className="action-card"
                                         onClick={() => showErrorAlert('Coming Soon', 'This feature will be available shortly.')}>
                                        <span className="action-icon">🔔</span>
                                        <div className="action-content">
                                            <h4>Notifications</h4>
                                            <p>Manage your notification preferences</p>
                                        </div>
                                    </div>

                                    <div className="action-card danger"
                                         onClick={() => showErrorAlert('Coming Soon', 'This feature will be available shortly.')}>
                                        <span className="action-icon">🗑️</span>
                                        <div className="action-content">
                                            <h4>Delete Account</h4>
                                            <p>Permanently remove your account</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="error-state">
                            <p>Failed to load profile data</p>
                            <button onClick={fetchUserData} className="retry-btn">
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer/>
        </div>
    )
}

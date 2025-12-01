import React, {useEffect, useState} from "react"
import {useLocation, useNavigate} from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import api from "../api"
import {showErrorAlert, showLoadingAlert, closeAlert, showSuccessAlert} from "../utils/alerts"
import "../sass_styles/EditUser.scss"

export default function EditUser() {
    const location = useLocation()
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [roleLabel, setRoleLabel] = useState('')
    const [permissions, setPermissions] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const state = location.state
        if (state?.user) {
            setUser(state.user)
            setRoleLabel(state.roleLabel)
            setPermissions(state.permissions)
            setLoading(false)
            return
        }

        const params = new URLSearchParams(location.search)
        const id = params.get('id')
        if (!id) {
            showErrorAlert('User not informed', 'User ID is required to edit a user.')
            navigate('/admin')
            return
        }

        (async () => {
            try {
                showLoadingAlert('Loading user data...')
                const token = JSON.parse(sessionStorage.getItem("User"))?.token
                const res = await api.post('/user', {id}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                closeAlert()
                const payload = res.data?.data
                if (!payload?.user) {
                    showErrorAlert('Error', 'User not found')
                    navigate('/admin')
                    return
                }
                setUser(payload.user)
                setRoleLabel(payload.role_label)
                setPermissions(payload.permissions)
            } catch (err) {
                closeAlert()
                console.error('Error to load the user', err)
                showErrorAlert('Error', err.response?.data?.message || 'An error occurred while loading the user data.')
                navigate('/admin')
            } finally {
                setLoading(false)
            }
        })()
    }, [location, navigate])

    const handleCancel = () => {
        navigate(-1)
    }
    
    const clearString = (str) => {
        let removedSpecial =  str.replace(/[^a-zA-Z0-9\s]/g, ' ').trim()
        return removedSpecial.charAt(0).toUpperCase() + removedSpecial.slice(1)
    }

    return (
        <div id="editUserPage">
            <Header/>
            <main className="dashboard-main">
                <div className="dashboard-container">
                    <div className="page-header">
                        <h1>Edit User</h1>
                        <p>{loading ? 'Loading...' : `Editing: ${user?.user_name || ''}`}</p>
                    </div>

                    {!loading && user && (
                        <div className="edit-user-form">
                            <label>ID</label>
                            <input type="text" value={user.id} readOnly/>

                            <label>Name</label>
                            <input type="text" defaultValue={user.user_name}/>

                            <label>Email</label>
                            <input type="email" defaultValue={user.user_email}/>

                            <label>Role</label>
                            <input type="text" value={roleLabel} readOnly/>

                            <div className="form-permissions" id="permissions" aria-labelledby="permissions">
                                <label>Permissions</label>
                                {permissions && Object.keys(permissions).map((permKey) => (
                                    <div key={permKey} className="permission-checkbox">
                                        <input
                                            type="checkbox"
                                            id={permKey}
                                            defaultChecked={permissions[permKey]}
                                        />
                                        <label htmlFor={permKey}>{clearString(permKey)}</label>
                                    </div>
                                ))}
                            </div>

                            <div className="form-actions">
                                <button className="btn-cancel" type="button" onClick={handleCancel}>Cancel</button>
                                <button
                                    className="btn-edit"
                                    type="button"
                                    onClick={() => showSuccessAlert('Edit', 'User details updated successfully!')}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer/>
        </div>
    )
}

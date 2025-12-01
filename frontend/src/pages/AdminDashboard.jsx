import React, {useState, useEffect} from "react"
import {Navigate, useNavigate} from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../sass_styles/AdminDashboard.scss"
import api from "../api"
import {showErrorAlert, showLoadingAlert, closeAlert, showSuccessAlert, showConfirmAlert} from "../utils/alerts"
import {ACCESS_LEVEL_ADMIN} from "../config/global_constants"

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null)
    const [activities, setActivities] = useState([])
    const [trends, setTrends] = useState([])
    const [topCourses, setTopCourses] = useState([])
    const [systemHealth, setSystemHealth] = useState(null)
    const [redirectToLogin, setRedirectToLogin] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [allUsers, setAllUsers] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [perPage] = useState(10)
    const navigate = useNavigate()

    useEffect(() => {
        const userSession = JSON.parse(sessionStorage.getItem("User"))

        if (!userSession || userSession.user_role !== ACCESS_LEVEL_ADMIN) {
            sessionStorage.clear()
            setRedirectToLogin(true)
            return
        }

        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            showLoadingAlert('Loading Dashboard Data...')

            const [overviewRes, activitiesRes, trendsRes, coursesRes, healthRes, usersRes] = await Promise.all([
                api.get('/dashboard/overview'),
                api.get('/dashboard/activities'),
                api.get('/dashboard/trends'),
                api.get('/dashboard/top-courses'),
                api.get('/dashboard/system-health'),
                api.get('/dashboard/users')
            ])

            setOverview(overviewRes.data.data)
            setActivities(activitiesRes.data.data)
            setTrends(trendsRes.data.data)
            setTopCourses(coursesRes.data.data)
            setSystemHealth(healthRes.data.data)
            setAllUsers(usersRes.data.data)
            setTotalPages(Math.ceil(usersRes.data.data.length / perPage))

            closeAlert()
        } catch (err) {
            console.error('Error fetching dashboard data:', err)

            if (err.response?.status === 401) {
                sessionStorage.clear()
                setRedirectToLogin(true)
            } else {
                showErrorAlert(
                    'Error Loading Dashboard',
                    err.response?.data?.message || 'Could not fetch dashboard data.'
                )
            }
        }
    }

    const handlerResetPassword = (userId, userName = '') => {
        try {
            if (userId === JSON.parse(sessionStorage.getItem("User")).id) {
                showErrorAlert('Cannot reset own password', 'Please contact an administrator for assistance.')
                return
            }

            showConfirmAlert(`Are you sure you want to reset the password for ${userName}?`)
                .then(confirm => {
                    if (!confirm.isConfirmed) {
                        return
                    }

                    api.patch('/dashboard/reset-password', {id: userId}, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem("User")).token}`
                        }
                    })
                    closeAlert()
                    showSuccessAlert('Password Reset')
                })
        } catch (err) {
            console.error('Error resetting password:', err)
            closeAlert()
            showErrorAlert('Password reset fail', err.response?.data?.message || 'An error occurred')
        }
    }

    const handlerEditUser = async (userId) => {
        try {
            if (userId === JSON.parse(sessionStorage.getItem("User")).id) {
                showErrorAlert('Cannot edit own account')
                return
            }

            showLoadingAlert('Loading User Data...')
            const token = JSON.parse(sessionStorage.getItem("User")).token
            const response = await api.post('/user', {id: userId}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            closeAlert()
            const payload = response.data.data
            if (!payload || !payload.user) {
                showErrorAlert('Error Loading User Data')
                return
            }

            navigate('/admin/edit-user', {
                state: {
                    user: payload.user,
                    roleLabel: payload.role_label,
                    permissions: payload.permissions
                }
            })
        } catch (err) {
            console.error('Error editing user:', err)
            closeAlert()
            showErrorAlert('Error editing user', err.response?.data?.message || 'An error occurred')
        }
    }

    const handleDeleteUser = async (userId, userName) => {
        try {
            if (userId === JSON.parse(sessionStorage.getItem("User")).id) {
                showErrorAlert('Cannot delete own account', 'Please contact an administrator for assistance.')
            }

            const confirm = await showConfirmAlert(
                `Are you sure you want to delete ${userName}?`,
                'This action will archive the user and cannot be undone.'
            )

            if (!confirm.isConfirmed) {
                return
            }

            showLoadingAlert('Deleting User...')
            const token = JSON.parse(sessionStorage.getItem("User")).token

            await api.delete(`/dashboard/delete-user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            closeAlert()
            showSuccessAlert('User Archived Successfully', 'The user has been removed from active users.')

            await fetchDashboardData()
        } catch (err) {
            console.error('Error deleting user:', err)
            closeAlert()
            showErrorAlert(
                'Error deleting user',
                err.response?.data?.message || 'An error occurred while trying to archive the user')
        }
    }

    if (redirectToLogin) {
        return <Navigate to="/login"/>
    }

    const getCurrentPageUsers = () => {
        const startIndex = (currentPage - 1) * perPage
        const endIndex = startIndex + perPage
        return allUsers.slice(startIndex, endIndex)
    }

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return
        setCurrentPage(newPage)
    }

    const getPageNumbers = () => {
        const pageNumbers = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pageNumbers.push(i)
                }
                pageNumbers.push('...')
                pageNumbers.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1)
                pageNumbers.push('...')
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pageNumbers.push(i)
                }
            } else {
                pageNumbers.push(1)
                pageNumbers.push('...')
                pageNumbers.push(currentPage - 1)
                pageNumbers.push(currentPage)
                pageNumbers.push(currentPage + 1)
                pageNumbers.push('...')
                pageNumbers.push(totalPages)
            }
        }
        return pageNumbers
    }

    return (
        <div id="adminDashboardPage">
            <Header/>

            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1>Admin Dashboard</h1>
                        <p>System overview and statistics</p>
                    </div>

                    {/* Stats Cards */}
                    {overview && (
                        <div className="stats-grid">
                            <div className="stat-card users">
                                <div className="card-icon">👥</div>
                                <div className="card-content">
                                    <h3>{overview.users.total}</h3>
                                    <p>Total Users</p>
                                    <div className="card-details">
                                        <span>Students: {overview.users.students}</span>
                                        <span>Lecturers: {overview.users.lecturers}</span>
                                        <span>Admins: {overview.users.admins}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card attendance">
                                <div className="card-icon">📊</div>
                                <div className="card-content">
                                    <h3>{overview.attendance.total.toLocaleString()}</h3>
                                    <p>Total Attendances</p>
                                    <div className="card-details">
                                        <span>Today: {overview.attendance.today}</span>
                                        <span>This Week: {overview.attendance.this_week}</span>
                                        <span>This Month: {overview.attendance.this_month}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card courses">
                                <div className="card-icon">📚</div>
                                <div className="card-content">
                                    <h3>{overview.courses.total}</h3>
                                    <p>Courses</p>
                                    <div className="card-details">
                                        <span>Active: {overview.courses.active}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card readers">
                                <div className="card-icon">📡</div>
                                <div className="card-content">
                                    <h3>{overview.readers.total}</h3>
                                    <p>Readers</p>
                                    <div className="card-details">
                                        <span>Active: {overview.readers.active}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs Navigation */}
                    <div className="tabs-navigation">
                        <button
                            className={activeTab === 'overview' ? 'active' : ''}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={activeTab === 'activities' ? 'active' : ''}
                            onClick={() => setActiveTab('activities')}
                        >
                            Recent Activities
                        </button>
                        <button
                            className={activeTab === 'trends' ? 'active' : ''}
                            onClick={() => setActiveTab('trends')}
                        >
                            Trends
                        </button>
                        <button
                            className={activeTab === 'courses' ? 'active' : ''}
                            onClick={() => setActiveTab('courses')}
                        >
                            Top Courses
                        </button>
                        <button
                            className={activeTab === 'system' ? 'active' : ''}
                            onClick={() => setActiveTab('system')}
                        >
                            System Health
                        </button>
                        <button
                            className={activeTab === 'users' ? 'active' : ''}
                            onClick={() => setActiveTab('users')}
                        >
                            User Management
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'activities' && (
                            <div className="activities-section">
                                <h2>Recent Activities</h2>
                                <div className="activities-list">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="activity-item">
                                            <div className="activity-icon">✓</div>
                                            <div className="activity-details">
                                                <p className="activity-text">
                                                    <strong>{activity.student_name}</strong> attended{' '}
                                                    <strong>{activity.course_name}</strong>
                                                </p>
                                                <p className="activity-meta">
                                                    {activity.reader_location} • {activity.time_ago}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'trends' && (
                            <div className="trends-section">
                                <h2>Attendance Trends (Last 30 Days)</h2>
                                <div className="trends-chart">
                                    {trends.map((day) => (
                                        <div key={day.date} className="trend-bar">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(day.total / Math.max(...trends.map(t => t.total))) * 100}%`
                                                }}
                                            ></div>
                                            <span className="bar-label">{new Date(day.date).getDate()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="courses-section">
                                <h2>Top 10 Courses by Attendance</h2>
                                <div className="courses-table">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Course Name</th>
                                            <th>Identifier</th>
                                            <th>Total Attendances</th>
                                            <th>Students Enrolled</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {topCourses.map((course, index) => (
                                            <tr key={course.id}>
                                                <td>{index + 1}</td>
                                                <td>{course.name}</td>
                                                <td>{course.identifier}</td>
                                                <td>{course.total_attendances}</td>
                                                <td>{course.students_enrolled}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && systemHealth && (
                            <div className="system-section">
                                <h2>System Health</h2>
                                <div className="health-cards">
                                    <div className="health-card">
                                        <h3>Database</h3>
                                        <p className="status healthy">{systemHealth.database.status}</p>
                                        <p>Response Time: {systemHealth.database.response_time}ms</p>
                                    </div>
                                    <div className="health-card">
                                        <h3>Storage</h3>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{width: `${systemHealth.storage.used_percentage}%`}}
                                            ></div>
                                        </div>
                                        <p>{systemHealth.storage.used_percentage}% Used</p>
                                    </div>
                                    <div className="health-card">
                                        <h3>Readers Status</h3>
                                        <p>Active: {systemHealth.readers.active}</p>
                                        <p>Inactive: {systemHealth.readers.inactive}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="users-section">
                                <div className="users-header">
                                    <h2>User Management</h2>
                                    <span className="total-users">
                                        {allUsers.length} total users
                                    </span>
                                </div>
                                <div className="users-table">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Verified Email</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {getCurrentPageUsers().map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.user_name}</td>
                                                <td>{user.user_email}</td>
                                                <td>{
                                                    user.email_verified_at ?
                                                        new Date(user.email_verified_at).toLocaleDateString('en-IE') :
                                                        'Not Verified'
                                                }</td>
                                                <td>{user.user_role.replace(/^./, user.user_role[0].toUpperCase())}</td>
                                                <td>
                                                    <button
                                                        id={`admin-edit-user-${user.id}`}
                                                        className="admin-action admin-edit-user-button"
                                                        type="button"
                                                        title="Edit User"
                                                        onClick={() => handlerEditUser(user.id)}
                                                    >
                                                        <i className="bi bi-pencil" aria-hidden="true"></i>
                                                        <span className="sr-only">Edit</span>
                                                    </button>

                                                    <button
                                                        id={`admin-reset-password-${user.id}`}
                                                        className="admin-action admin-reset-password-button"
                                                        type="button"
                                                        title="Reset Password"
                                                        onClick={() => handlerResetPassword(user.id, user.user_name)}
                                                    >
                                                        <i className="bi bi-key" aria-hidden="true"></i>
                                                        <span className="sr-only">Reset Password</span>
                                                    </button>

                                                    <button
                                                        id={`admin-delete-user-${user.id}`}
                                                        className="admin-action admin-delete-user-button"
                                                        type="button"
                                                        title="Archive User"
                                                        onClick={() => handleDeleteUser(user.id, user.user_name)}
                                                    >
                                                        <i className="bi bi-archive" aria-hidden="true"></i>
                                                        <span className="sr-only">Archive</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    <div className="pagination-controls">
                                        <button
                                            className="pagination-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            <i className="bi bi-chevron-left"></i> Previous
                                        </button>

                                        <div className="pagination-numbers">
                                            {getPageNumbers().map((pageNum, index) => {
                                                if (pageNum === '...') {
                                                    return (
                                                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                                            ...
                                                        </span>
                                                    )
                                                }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <button
                                            className="pagination-btn"
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            Next <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    )
}

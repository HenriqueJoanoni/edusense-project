import React, {useState, useEffect} from "react"
import {Navigate} from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../sass_styles/AdminDashboard.scss"
import api from "../api"
import {showErrorAlert, showLoadingAlert, closeAlert} from "../utils/alerts"
import {ACCESS_LEVEL_ADMIN} from "../config/global_constants"

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null)
    const [activities, setActivities] = useState([])
    const [trends, setTrends] = useState([])
    const [topCourses, setTopCourses] = useState([])
    const [systemHealth, setSystemHealth] = useState(null)
    const [loading, setLoading] = useState(true)
    const [redirectToLogin, setRedirectToLogin] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

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
            setLoading(true)
            showLoadingAlert('Loading Dashboard Data...')

            const [overviewRes, activitiesRes, trendsRes, coursesRes, healthRes] = await Promise.all([
                api.get('/dashboard/overview'),
                api.get('/dashboard/activities'),
                api.get('/dashboard/trends'),
                api.get('/dashboard/top-courses'),
                api.get('/dashboard/system-health')
            ])

            setOverview(overviewRes.data.data)
            setActivities(activitiesRes.data.data)
            setTrends(trendsRes.data.data)
            setTopCourses(coursesRes.data.data)
            setSystemHealth(healthRes.data.data)

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
        } finally {
            setLoading(false)
        }
    }

    if (redirectToLogin) {
        return <Navigate to="/login"/>
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
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    )
}

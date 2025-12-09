import React, {useState, useEffect} from "react"
import {Navigate} from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../sass_styles/LecturerDashboard.scss"
import api from "../api"
import {showErrorAlert, showLoadingAlert, closeAlert, showSuccessAlert} from "../utils/alerts"
import {ACCESS_LEVEL_TEACHER} from "../config/global_constants"

export default function LecturerDashboard() {
    const [subjects, setSubjects] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [attendanceData, setAttendanceData] = useState(null)
    const [statistics, setStatistics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [redirectToLogin, setRedirectToLogin] = useState(false)

    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        student_search: ''
    })

    useEffect(() => {
        const userSession = JSON.parse(sessionStorage.getItem("User"))

        if (!userSession || userSession.user_role !== ACCESS_LEVEL_TEACHER) {
            sessionStorage.clear()
            setRedirectToLogin(true)
            return
        }

        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            showLoadingAlert('Loading Dashboard...')

            const [subjectsRes, statsRes] = await Promise.all([
                api.get('/lecturer/subjects'),
                api.get('/lecturer/statistics')
            ])

            setSubjects(subjectsRes.data.data)
            setStatistics(statsRes.data.data)

            if (subjectsRes.data.data.length > 0) {
                setSelectedSubject(subjectsRes.data.data[0].class_subject_id)
                await fetchAttendanceData(subjectsRes.data.data[0].class_subject_id)
            }

            closeAlert()
        } catch (err) {
            console.error('Error fetching data:', err)

            if (err.response?.status === 401) {
                sessionStorage.clear()
                setRedirectToLogin(true)
            } else {
                showErrorAlert('Failed to load dashboard data')
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchAttendanceData = async (classSubjectId) => {
        try {
            showLoadingAlert('Loading Attendance Data...')

            const response = await api.post('/lecturer/attendance', {
                class_subject_id: classSubjectId || selectedSubject,
                start_date: filters.start_date,
                end_date: filters.end_date,
                student_search: filters.student_search
            })

            setAttendanceData(response.data.data)
            closeAlert()
        } catch (err) {
            console.error('Error fetching attendance:', err)
            showErrorAlert('Failed to load attendance data')
        }
    }

    const handleSubjectChange = async (classSubjectId) => {
        setSelectedSubject(classSubjectId)
        await fetchAttendanceData(classSubjectId)
    }

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        })
    }

    const applyFilters = async () => {
        await fetchAttendanceData()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'good':
                return '#10b981'
            case 'warning':
                return '#f59e0b'
            case 'critical':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    if (redirectToLogin) {
        return <Navigate to="/login"/>
    }

    return (
        <div id="lecturerDashboardPage">
            <Header/>

            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1>Lecturer Dashboard</h1>
                        <p>Manage your subjects and track student attendance</p>
                    </div>

                    {/* Statistics Cards */}
                    {statistics && (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="card-icon">📚</div>
                                <div className="card-content">
                                    <h3>{statistics.total_subjects}</h3>
                                    <p>Subjects</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="card-icon">👥</div>
                                <div className="card-content">
                                    <h3>{statistics.total_students}</h3>
                                    <p>Total Students</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="card-icon">📅</div>
                                <div className="card-content">
                                    <h3>{statistics.attendances_today}</h3>
                                    <p>Attendances Today</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="card-icon">📊</div>
                                <div className="card-content">
                                    <h3>{statistics.average_attendance_rate}%</h3>
                                    <p>Avg. Attendance Rate</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subject Selector */}
                    <div className="subject-selector">
                        <label>Select Subject:</label>
                        <select
                            value={selectedSubject || ''}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                        >
                            {subjects.map(subject => (
                                <option key={subject.class_subject_id} value={subject.class_subject_id}>
                                    {subject.subject_name} - {subject.course_name} ({subject.total_students} students)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filters */}
                    <div className="filters-section">
                        <div className="filter-group">
                            <label>Start Date:</label>
                            <input
                                type="date"
                                name="start_date"
                                placeholder="dd/mm/yyyy"
                                value={filters.start_date}
                                onChange={handleFilterChange}
                                maxLength={10}
                            />
                        </div>

                        <div className="filter-group">
                            <label>End Date:</label>
                            <input
                                type="date"
                                name="end_date"
                                placeholder="dd/mm/yyyy"
                                value={filters.end_date}
                                onChange={handleFilterChange}
                                maxLength={10}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Search Student:</label>
                            <input
                                type="text"
                                name="student_search"
                                placeholder="Name or email..."
                                value={filters.student_search}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <button className="apply-filters-btn" onClick={applyFilters}>
                            Apply Filters
                        </button>
                    </div>

                    {/* Summary Cards */}
                    {attendanceData?.summary && (
                        <div className="summary-cards">
                            <div className="summary-card good">
                                <h4>{attendanceData.summary.good_attendance}</h4>
                                <p>Good Attendance (≥75%)</p>
                            </div>
                            <div className="summary-card warning">
                                <h4>{attendanceData.summary.warning_attendance}</h4>
                                <p>Warning (50-74%)</p>
                            </div>
                            <div className="summary-card critical">
                                <h4>{attendanceData.summary.critical_attendance}</h4>
                                <p>Critical (&lt;50%)</p>
                            </div>
                        </div>
                    )}

                    {/* Students Table */}
                    {attendanceData?.students && (
                        <div className="students-table-container">
                            <h2>Student Attendance</h2>
                            <table className="students-table">
                                <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Student Number</th>
                                    <th>Email</th>
                                    <th>Total Classes</th>
                                    <th>Attended</th>
                                    <th>Missed</th>
                                    <th>Rate</th>
                                    <th>Status</th>
                                    <th>Last Attendance</th>
                                </tr>
                                </thead>
                                <tbody>
                                {attendanceData.students.map(student => (
                                    <tr key={student.student_id}>
                                        <td>{student.student_name}</td>
                                        <td>{student.student_number}</td>
                                        <td>{student.student_email}</td>
                                        <td>{student.total_classes}</td>
                                        <td className="attended">{student.attended}</td>
                                        <td className="missed">{student.missed}</td>
                                        <td>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${student.attendance_rate}%`,
                                                        backgroundColor: getStatusColor(student.status)
                                                    }}
                                                >
                                                    {student.attendance_rate}%
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${student.status}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td>{student.last_attendance || 'Never'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <Footer/>
        </div>
    )
}

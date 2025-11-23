import React, {useState, useEffect, useMemo} from "react"
import {Navigate} from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../sass_styles/StudentPersonalAttendance.scss"
import api from "../api"
import {showErrorAlert, showLoadingAlert, closeAlert, showSuccessAlert} from "../utils/alerts"

export default function StudentPersonalAttendance() {
    const [attendanceData, setAttendanceData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [redirectToLogin, setRedirectToLogin] = useState(false)
    const [filters, setFilters] = useState({
        start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    })
    const [selectedCourse, setSelectedCourse] = useState('all')
    const [viewMode, setViewMode] = useState('grid')

    useEffect(() => {
        fetchAttendanceData()
    }, [])

    const fetchAttendanceData = async () => {
        try {
            setLoading(true)
            const userSession = JSON.parse(sessionStorage.getItem("User"))

            if (!userSession || !userSession.id) {
                throw new Error('No user session found')
            }

            const checkIfStudent = await api.get('/is-student/' + userSession.id)

            if (checkIfStudent.success === false) {
                throw new Error('Could not load student information')
            }

            const response = await api.post('/reports/generate', {
                start_date: filters.start_date,
                end_date: filters.end_date,
                student_id: checkIfStudent.data.student_id
            }, {
                headers: {'Content-Type': 'application/json'}
            })

            if (response.data.success) {
                setAttendanceData(response.data.data)
            }
        } catch (err) {
            console.error('Error fetching attendance data:', err)

            if (err.response?.status === 401 || err.message === 'No user session found') {
                showErrorAlert(
                    'Session Expired',
                    'Please log in again to access your attendance records.'
                )
                setTimeout(() => {
                    sessionStorage.clear()
                    setRedirectToLogin(true)
                }, 2000)
            } else {
                showErrorAlert(
                    'Failed to Load Attendance',
                    err.response?.data?.message || 'An error occurred whilst loading your attendance records.'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({...prev, [field]: value}))
    }

    const handleApplyFilters = () => {
        if (new Date(filters.start_date) > new Date(filters.end_date)) {
            showErrorAlert(
                'Invalid Date Range',
                'Start date must be before end date.'
            )
            return
        }
        fetchAttendanceData()
    }

    const handleExportCSV = () => {
        if (!attendanceData?.attendances?.length) {
            showErrorAlert('No Data', 'No attendance records to export.')
            return
        }

        const headers = ['Date', 'Time', 'Course', 'Location', 'Reader Code']
        const rows = filteredAttendances.map(att => [
            att.timestamp.date,
            att.timestamp.time,
            `${att.course.name} (${att.course.identifier})`,
            att.reader.location,
            att.reader.code
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'})
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `attendance_${filters.start_date}_to_${filters.end_date}.csv`
        link.click()

        showSuccessAlert('Exported Successfully', 'Your attendance records have been downloaded.')
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (timeString) => {
        return timeString.slice(0, 5)
    }

    const filteredAttendances = useMemo(() => {
        if (!attendanceData?.attendances) return []
        if (selectedCourse === 'all') return attendanceData.attendances

        return attendanceData.attendances.filter(
            att => att.course.identifier === selectedCourse
        )
    }, [attendanceData, selectedCourse])

    const uniqueCourses = useMemo(() => {
        if (!attendanceData?.statistics?.by_course) return []
        return attendanceData.statistics.by_course
    }, [attendanceData])

    const selectedCourseStats = useMemo(() => {
        if (selectedCourse === 'all') {
            return {
                total_attendances: attendanceData?.summary?.total_records || 0,
                course_name: 'All Courses'
            }
        }
        return uniqueCourses.find(c => c.course_identifier === selectedCourse) || {}
    }, [selectedCourse, uniqueCourses, attendanceData])

    if (redirectToLogin) {
        return <Navigate to="/login" replace/>
    }

    return (
        <div id="studentPersonalAttendancePage">
            <Header/>

            <main className="attendance-main">
                <div className="attendance-container">
                    <div className="page-header">
                        <div className="header-content">
                            <h1>My Attendance Records</h1>
                            <p>View and manage your attendance history</p>
                        </div>
                    </div>

                    <div className="filters-section">
                        <div className="filters-grid">
                            <div className="filter-item">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    max={filters.end_date}
                                />
                            </div>
                            <div className="filter-item">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={filters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    min={filters.start_date}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Course</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="all">All Courses</option>
                                    {uniqueCourses.map(course => (
                                        <option key={course.course_id} value={course.course_identifier}>
                                            {course.course_name} ({course.course_identifier})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="filters-actions">
                            <button onClick={handleApplyFilters} className="btn-primary" disabled={loading}>
                                <span>🔍</span>
                                Apply Filters
                            </button>
                            <button onClick={handleExportCSV} className="btn-secondary"
                                    disabled={loading || !attendanceData}>
                                <span>📥</span>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your attendance records...</p>
                        </div>
                    ) : attendanceData ? (
                        <>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <div className="card-icon">📅</div>
                                    <div className="card-content">
                                        <h3>{attendanceData.summary.total_records}</h3>
                                        <p>Total Attendances</p>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="card-icon">📚</div>
                                    <div className="card-content">
                                        <h3>{uniqueCourses.length}</h3>
                                        <p>Courses Attended</p>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="card-icon">📊</div>
                                    <div className="card-content">
                                        <h3>{attendanceData.summary.attendance_days}</h3>
                                        <p>Days Present</p>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="card-icon">📈</div>
                                    <div className="card-content">
                                        <h3>{attendanceData.summary.average_per_day.toFixed(1)}</h3>
                                        <p>Avg Per Day</p>
                                    </div>
                                </div>
                            </div>

                            {selectedCourse === 'all' && (
                                <div className="course-stats-section">
                                    <h3>Attendance by Course</h3>
                                    <div className="course-stats-grid">
                                        {uniqueCourses.map(course => (
                                            <div key={course.course_id} className="course-stat-card">
                                                <div className="course-header">
                                                    <h4>{course.course_name}</h4>
                                                    <span className="course-code">{course.course_identifier}</span>
                                                </div>
                                                <div className="course-metrics">
                                                    <div className="metric">
                                                        <span className="metric-value">{course.total_attendances}</span>
                                                        <span className="metric-label">Attendances</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-value">{course.total_students}</span>
                                                        <span className="metric-label">Students</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="view-controls">
                                <h3>
                                    {selectedCourseStats.course_name}
                                    <span className="record-count">({filteredAttendances.length} records)</span>
                                </h3>
                                <div className="view-toggle">
                                    <button
                                        className={viewMode === 'grid' ? 'active' : ''}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <span>🎴</span> Grid
                                    </button>
                                    <button
                                        className={viewMode === 'table' ? 'active' : ''}
                                        onClick={() => setViewMode('table')}
                                    >
                                        <span>📋</span> Table
                                    </button>
                                </div>
                            </div>

                            {filteredAttendances.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📭</span>
                                    <h3>No Attendance Records Found</h3>
                                    <p>Try adjusting your filters or date range.</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="attendance-grid">
                                    {filteredAttendances.map(attendance => (
                                        <div key={attendance.id} className="attendance-card">
                                            <div className="card-header">
                                                <div className="date-badge">
                                                    <span
                                                        className="day">{new Date(attendance.timestamp.date).getDate()}</span>
                                                    <span className="month">
                                                        {new Date(attendance.timestamp.date).toLocaleDateString('en-GB', {month: 'short'})}
                                                    </span>
                                                </div>
                                                <div className="time-info">
                                                    <span
                                                        className="time">🕒 {formatTime(attendance.timestamp.time)}</span>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <h4 className="course-name">{attendance.course.name}</h4>
                                                <p className="course-code">{attendance.course.identifier}</p>
                                                <div className="location-info">
                                                    <span>📍 {attendance.reader.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="attendance-table-wrapper">
                                    <table className="attendance-table">
                                        <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Course</th>
                                            <th>Location</th>
                                            <th>Reader Code</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredAttendances.map(attendance => (
                                            <tr key={attendance.id}>
                                                <td>{formatDate(attendance.timestamp.date)}</td>
                                                <td>{formatTime(attendance.timestamp.time)}</td>
                                                <td>
                                                    <div className="course-cell">
                                                        <span className="course-name">{attendance.course.name}</span>
                                                        <span
                                                            className="course-code">{attendance.course.identifier}</span>
                                                    </div>
                                                </td>
                                                <td>{attendance.reader.location}</td>
                                                <td><code>{attendance.reader.code}</code></td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="error-state">
                            <span className="error-icon">⚠️</span>
                            <h3>Failed to Load Attendance Data</h3>
                            <button onClick={fetchAttendanceData} className="retry-btn">
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

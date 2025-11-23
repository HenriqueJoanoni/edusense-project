import React, {useState} from 'react';
import './App.css';
import {BrowserRouter, Routes, Route, Link} from "react-router-dom"
import {
    ACCESS_LEVEL_GUEST,
    ACCESS_LEVEL_STUDENT,
    ACCESS_LEVEL_TEACHER,
    ACCESS_LEVEL_ADMIN
} from "./config/global_constants"
import "./css/SweetAlerts.css"

import Homepage from './pages/Homepage';
import StudentProfile from './pages/StudentProfile';
import ClassAttendancePage from './pages/ClassAttendancePage';
import AdminClassPage from './pages/AdminClassPage';
import Login from "./pages/Login"
import Logout from './pages/Logout';
import Register from './pages/Register';

import LoggedInRoute from './components/LoggedInRoute';
import ClassOverview from './pages/ClassOverview';
import StudentAttendancePage from './pages/StudentAttendancePage';
import AdminDashboard from "./pages/AdminDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";

function App() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    if (localStorage.getItem("accessLevel") == null) {
        localStorage.setItem("accessLevel", ACCESS_LEVEL_GUEST)
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Homepage/>}/>
                <Route path="/home" element={<Homepage/>}/>
                <Route path="/my-profile/" element={<StudentProfile/>}/>
                <Route path="/my-attendance/" element={<StudentProfile/>}/>
                <Route path="/attendance/" element={<ClassAttendancePage/>}/>
                <Route path="/dashboard" element={<AdminDashboard/>}/>
                <Route path="/login/" element={<Login/>}/>
                <Route path="/logout/" element={<Logout/>}/>
                <Route path="/register/" element={<Register/>}/>
                <Route path="/class-groups" element={<LoggedInRoute element={ClassOverview}/>}/>

                <Route path="/student/attendance/:class_id/:subject_id"
                       element={<LoggedInRoute element={StudentAttendancePage}/>}
                />

                <Route exact path="/admin/:course_id/:subject_id"
                       element={<LoggedInRoute element={AdminClassPage}/>
                }/>

                <Route path="/lecturer/dashboard"
                       element={<LecturerDashboard/>}
                       requiredRole={ACCESS_LEVEL_TEACHER}/>
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
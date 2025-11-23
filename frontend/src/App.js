import React, { useEffect, useState } from 'react';
import './App.css';
import api from './api';
import {BrowserRouter, Routes, Route, Link } from "react-router-dom"
import {
  ACCESS_LEVEL_GUEST,
  ACCESS_LEVEL_STUDENT,
  ACCESS_LEVEL_TEACHER,
  ACCESS_LEVEL_ADMIN
} from "./config/global_constants"


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

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /*
  useEffect(() => {
    api.get('/users')
      .then(response => {
        setUsers(response.data);
          console.log(response.data)
        setLoading(false);
      })
      .catch(err => {
        setError('Error to retrieve users: ' + err.message);
        setLoading(false);
      });
  }, []);

  */


  //check if logged in
  if (localStorage.getItem("accessLevel") == null) {
    localStorage.setItem("accessLevel", ACCESS_LEVEL_GUEST)
  }

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/students/" element={<StudentProfile />} />
          <Route path="/attendance/" element={<ClassAttendancePage />} />
          <Route path="/login/" element={<Login />} />
          <Route path="/logout/" element={<Logout />} />
          <Route path="/register/" element={<Register />} />


          <Route path="/class-groups" element={<LoggedInRoute element={ClassOverview} />} />
          <Route path="/student/attendance/:class_id/:subject_id" element={<LoggedInRoute element={StudentAttendancePage}/> }/>
          
          <Route exact path="/admin/:course_id/:subject_id" element={<LoggedInRoute element={AdminClassPage}/> }/>
          





      </Routes>
    
    </BrowserRouter>



    
    
  );
}

export default App;



<div className="App">
      <Homepage />

      
    </div>

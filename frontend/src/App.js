import React, { useEffect, useState } from 'react';
import './App.css';
import api from './api';
import {BrowserRouter, Routes, Route, Link } from "react-router-dom"

import Homepage from './pages/Homepage';
import StudentProfile from './pages/StudentProfile';
import ClassAttendancePage from './pages/ClassAttendancePage';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/students/" element={<StudentProfile />} />
          <Route path="/attendance/" element={<ClassAttendancePage />} />
      </Routes>
    
    </BrowserRouter>



    
    
  );
}

export default App;



<div className="App">
      <Homepage />

      
    </div>

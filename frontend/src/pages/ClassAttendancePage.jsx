import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import AttendanceTableRow from "../components/AttendanceTableRow"

import "../css/ClassAttendancePage.css"




export default function ClassAttendancePage(){
    const data = {
        classTitle:"Algorithms and Data Structures",
        totalStudentsPresent: 42,
        totalStudentsLate: 5,
        totalStudentsAbsent: 13,
        averageArrivalTime: "09:04",

        studentData: [
            {
                ID: "1234",
                name: "John Doe",
                arrivalTime: "09:01",
                status: "present"
            },
            {
                ID: "4321",
                name: "Jim Doe",
                arrivalTime: "09:08",
                status: "late"
            },
            {
                ID: "1234",
                name: "Jane Doe",
                arrivalTime: "",
                status: "absent"
            }
        ]
    }


    return (
        <>
            <Header />
            <div id="classAttendancePage">
                <div id="classTitleHeader">
                    <h2>{data.classTitle}</h2>
                </div>
                <div id="topRow">
                    <div className="attendanceInfoBox" id="present">
                        <span><img src="/icons8-checked-50.png  "/><p className="spanText">Total Students Present</p></span>
                        <p className="boxData">{data.totalStudentsPresent}</p>
                    </div>


                    <div className="attendanceInfoBox" id="late">
                        <span><img src="/icons8-clock-50.png"/><p className="spanText">Total Students Late</p></span>
                        <p className="boxData">{data.totalStudentsLate}</p>
                    </div>


                    <div className="attendanceInfoBox" id="absent">
                        <span><img src="/icons8-exclamation-50.png"/><p className="spanText">Total Students Absent</p></span>
                        <p className="boxData">{data.totalStudentsAbsent}</p>
                    </div>

                    <div className="attendanceInfoBox" id="average">
                        <span><img src="/icons8-clock-50.png"/><p className="spanText">Average Arrival Time</p></span>
                        <p className="boxData">{data.averageArrivalTime}</p>
                    </div>
                </div>

                <div id="attendanceTableContainer">
                    <div id="attendanceTableTools">
                        <span id="titleSpan"><img src="/icons8-page-50.png"/><p>Attendance History</p></span>
                        <div id="searchDiv">
                            <div>
                                Date Picker
                            </div>
                            <div id="nameSearchContainer">
                                <img src="/icons8-magnifying-glass-50.png" alt="Magnifying Glass" />
                                <input 
                                    type="text"
                                    placeholder="Search Student"
                                />
                            </div>
                        </div>
                    </div>
                    <table id="attendanceTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Arrival Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.studentData.map(student => <AttendanceTableRow student={student} />)}
                        </tbody>
                    </table>

                </div>
            </div>
            <Footer />
        
        </>
    )
}
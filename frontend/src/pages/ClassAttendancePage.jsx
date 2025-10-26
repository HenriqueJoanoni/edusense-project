import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"

import "../css/ClassAttendancePage.css"



export default function ClassAttendancePage(){
    const data = {
        totalStudentsPresent: 42,
        totalStudentsLate: 5,
        totalStudentsAbsent: 13,
        averageArrivalTime: "09:04",
    }


    return (
        <>
            <Header />
            <div id="classAttendancePage">
                <div id="topRow">
                    <div className="attendanceInfoBox" id="present">
                        <span>Total Students Present</span>
                        <p>{data.totalStudentsPresent}</p>
                    </div>


                    <div className="attendanceInfoBox" id="late">
                        <span>Total Students Late</span>
                        <p>{data.totalStudentsLate}</p>
                    </div>


                    <div className="attendanceInfoBox" id="absent">
                        <span>Total Students Absent</span>
                        <p>{data.totalStudentsAbsent}</p>
                    </div>

                    <div className="attendanceInfoBox" id="average">
                        <span>Average Arrival Time</span>
                        <p>{data.totalStudentsPresent}</p>
                    </div>
                </div>
            </div>
        
        </>
    )
}
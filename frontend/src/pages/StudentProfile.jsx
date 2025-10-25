import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../css/StudentProfile.css"
import { Doughnut, ChartData } from 'react-chartjs-2'
import moment from "moment"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, plugins } from 'chart.js';

//import StudentTimetable from "../components/StudentTimetable"

//needed to make chart work
ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentProfile(props){
    

    let student = {
        id: "123123123",
        name: "John Doe",
        profilePhoto: "https://media.istockphoto.com/id/504709418/photo/portrait-of-a-young-adult.jpg?s=1024x1024&w=is&k=20&c=Rx3a8EDUZ5gLM15PwHrHIwqvgqq2kGcK1c6TWPGKOug=",
        dateOfBirth: "2002-12-11",
        course: {
            courseName: "Software Engineering"
        },

        attendanceData: {
            present: 270,
            late: 12,
            absent: 8
        }
    }

    const totalDays = student.attendanceData.present + student.attendanceData.late + student.attendanceData.absent
    const attendanceAsPercent = {
        present: (student.attendanceData.present / totalDays * 100).toFixed(1) + '%',
        late: (student.attendanceData.late / totalDays * 100).toFixed(1) + '%',
        absent: (student.attendanceData.absent / totalDays * 100).toFixed(1) + '%'
    }



    const chartData = {
        labels: [attendanceAsPercent.present, attendanceAsPercent.late, attendanceAsPercent.absent],
        datasets: [
            {
                label: "Attendance Summary",
                data: [student.attendanceData.present,
                        student.attendanceData.late,
                        student.attendanceData.absent
                ],
                backgroundColor: [
                    '#04E400',
                    '#FFD400',
                    '#FF0000'
                ],
                borderColor: [
                    '#029000',
                    '#957C00',
                    '#700000'
                ],
                borderWidth: 2,
                borderRadius: 10,
                spacing: 5
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    boxWidth: 30,
                    padding: 25
                }   
            },
            tooltip: {enabled: false}
        }
    }



    return(
        <>
        <Header />
        <div id="studentProfileContainer">
            <div id="studentProfileTopRow">
                <div id="studentInfoContainer">
                    <div id="profilePhoto">
                        <img src={student.profilePhoto} alt="Profile Photo" />
                    </div>
                    <div id="studentInformation">
                        <h3>{student.name}</h3>
                        <p>ID: {student.id}</p>
                        <p>Age: {Math.floor((Date.now() - new Date(student.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25))}</p>
                        <p>Course: {student.course.courseName}</p>
                    </div>

                    <button type="button" id="settingsButton"><img src="/icons8-settings-50.png" alt="Settings Button"/></button>
                </div>
                
                <div id="studentChartSummary">
                    <Doughnut id="doughnutChart" data={chartData} options={chartOptions}/>
                </div>

            </div>

            <div id="studentTimetable">
                {/* TODO  */}
            </div>
        </div>
        <Footer />
        </>

    )
}
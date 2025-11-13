import React, {useState, useEffect} from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import AttendanceTableRow from "../components/AttendanceTableRow"

import "../css/StudentAttendancePage.css"



import { Doughnut, ChartData } from 'react-chartjs-2'
import moment from "moment"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, plugins } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentAttendancePage(props){
    const [sortField, setSortField] = useState("ID")
    const [sortDirection, setSortDirection] = useState(1)
    const [searchInput, setSearchInput] = useState("")

    const updateSort = (newSortField) => {
        if (sortField === newSortField) {
            setSortDirection(sortDirection * -1)
        }
        else {
            setSortField(newSortField)
            setSortDirection(1)
        }
        
    }

    const findDates = () =>{
        if (searchInput === ""){
            return [...data.studentData].sort((a, b) => a[sortField] > b[sortField   ] ? sortDirection : -sortDirection)
        }

        else {
            return data.studentData.filter(student => {return student.ID.toLowerCase().includes(searchInput.toLowerCase()) ||
                                                            student.name.toLowerCase().includes(searchInput.toLowerCase())
            })
        }
    }


    const data = {
        classTitle:"Algorithms and Data Structures",
        totalClasses: 70,
        totalClassesPresent: 25,
        totalClassesLate: 5,
        totalClassesAbsent: 3,


        studentData: [
            {
                ID: "10/11/2025",
                name: "09:00",
                arrivalTime: "09:01",
                status: "present"
            },
            {
                ID: "05/11/2025",
                name: "09:00",
                arrivalTime: "09:08",
                status: "late"
            },
            {
                ID: "01/11/2025",
                name: "09:00",
                arrivalTime: "-",
                status: "absent"
            }
        ]
    }

    const attendanceData = {
            present: 270,
            late: 12,
            absent: 8
    }

    const totalDays = attendanceData.present + attendanceData.late + attendanceData.absent
    const attendanceAsPercent = {
        present: (attendanceData.present / totalDays * 100).toFixed(1) + '%',
        late: (attendanceData.late / totalDays * 100).toFixed(1) + '%',
        absent: (attendanceData.absent / totalDays * 100).toFixed(1) + '%'
    }

    const chartData = {
        labels: [attendanceAsPercent.present, attendanceAsPercent.late, attendanceAsPercent.absent],
        datasets: [
            {
                label: "Attendance Summary",
                data: [attendanceData.present,
                        attendanceData.late,
                        attendanceData.absent
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
                    position: 'center',
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: {
                            size: 15,
                            weight: 'bold'
                        },
                        boxWidth: 30,
                        padding: 25
                    }   
                },
                tooltip: {enabled: false}
            }
        }




    return (
        <>
            <Header />
            <div id="studentAttendancePageContainer">
                <h1 id="classTitleHeader">{data.classTitle}</h1>
                <div id="topRow">
                    <div className="attendanceInfoBox" id="present">
                        <span><img src="/icons8-checked-50.png  "/><p className="spanText">Total Classes</p></span>
                        <p className="boxData">{data.totalClasses}</p>
                    </div>


                    <div className="attendanceInfoBox" id="late">
                        <span><img src="/icons8-clock-50.png"/><p className="spanText">Total Classes Present</p></span>
                        <p className="boxData">{data.totalClassesPresent}</p>
                    </div>


                    <div className="attendanceInfoBox" id="absent">
                        <span><img src="/icons8-exclamation-50.png"/><p className="spanText">Total Classes Late</p></span>
                        <p className="boxData">{data.totalClassesLate}</p>
                    </div>

                    <div className="attendanceInfoBox" id="average">
                        <span><img src="/icons8-clock-50.png"/><p className="spanText">TotalClassesAbsent</p></span>
                        <p className="boxData">{data.totalClassesAbsent}</p>
                    </div>
                </div>

                <div id="studentAttendanceDoughnutChart">
                    <Doughnut id="doughnutChart" data={chartData} options={chartOptions}/>
                </div>

                <div id="attendanceTableContainer">
                    <div id="attendanceTableTools">
                        <span id="titleSpan"><img src="/icons8-page-50.png"/><p>Attendance History</p></span>
                        <div id="searchDiv">
                            <div>
                                Date Picker
                            </div>
                            {/*  
                            <div id="nameSearchContainer">
                                <img src="/icons8-magnifying-glass-50.png" alt="Magnifying Glass" />
                                <input 
                                    type="text"
                                    placeholder="Search Date"
                                    value={searchInput}
                                    onChange={e => {setSearchInput(e.target.value)}}
                                />
                            </div>
                            */}
                        </div>
                    </div>
                    <table id="attendanceTable">
                        <thead>
                            <tr>
                                <th onClick={()=>{updateSort("ID")}}>Date {sortField !== "ID" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                                <th onClick={()=>{updateSort("name")}}>Scheduled Time {sortField !== "name" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                                <th onClick={()=>{updateSort("arrivalTime")}}>Arrival Time {sortField !== "arrivalTime" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                                <th onClick={()=>{updateSort("status")}}>Status {sortField !== "status" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {findDates().map(student => <AttendanceTableRow key={student.ID} student={student} />)}
                        </tbody>
                    </table>

                </div>

                
            </div>


            
            <Footer />
        </>
    )
}
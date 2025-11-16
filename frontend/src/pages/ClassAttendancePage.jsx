import React, {useState} from "react"
import axios from "axios"
import { SERVER_ADDRESS } from "../config/global_constants"
import Header from "../components/Header"
import Footer from "../components/Footer"
import AttendanceTableRow from "../components/AttendanceTableRow"

import "../css/ClassAttendancePage.css"




export default function ClassAttendancePage(){
    const [sortField, setSortField] = useState("ID")
    const [sortDirection, setSortDirection] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [data, setData] = useState({})
    

    useEffect(()=>{
        axios.get(`${SERVER_ADDRESS}/api/classes-endpoint/subjectID`)
        .then(res => {
            if(res.status===200){
                setData(res.data.data)
            }
            else {
                console.log(res)
            }
        })
        .catch(err => {console.log(err)})
    })

    const ddata = {
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
                ID: "1235",
                name: "Jane Doe",
                arrivalTime: "-",
                status: "absent"
            }
        ]
    }

    const findStudents = () =>{
        if (searchInput === ""){
            return [...data.studentData].sort((a, b) => a[sortField] > b[sortField   ] ? sortDirection : -sortDirection)
        }

        else {
            return data.studentData.filter(student => {return student.ID.toLowerCase().includes(searchInput.toLowerCase()) ||
                                                            student.name.toLowerCase().includes(searchInput.toLowerCase())
            })
        }
    }

    const updateSort = (newSortField) => {
        if (sortField === newSortField) {
            setSortDirection(sortDirection * -1)
        }
        else {
            setSortField(newSortField)
            setSortDirection(1)
        }
        
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
                                    value={searchInput}
                                    onChange={e => {setSearchInput(e.target.value)}}
                                />
                            </div>
                        </div>
                    </div>
                    <table id="attendanceTable">
                        <thead>
                            <tr>
                                <th onClick={()=>{updateSort("ID")}}>ID {sortField !== "ID" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                                <th onClick={()=>{updateSort("name")}}>Name {sortField !== "name" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                                <th onClick={()=>{updateSort("arrivalTime")}}>Arrival Time {sortField !== "arrivalTime" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                                <th onClick={()=>{updateSort("status")}}>Status {sortField !== "status" ? "" : sortDirection === -1 ? "▼" : "▲"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {findStudents().map(student => <AttendanceTableRow key={student.ID} student={student} />)}
                        </tbody>
                    </table>

                </div>
            </div>
            <Footer />
        
        </>
    )
}
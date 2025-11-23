import React, {useState, useEffect} from "react"
import {useParams} from "react-router-dom"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import HorizontalTextField from "../components/HorizontalTextField"
import AdminClassTableRow from "../components/AdminClassTableRow"
import {SERVER_ADDRESS} from "../config/global_constants"
import "../css/AdminClassPage.css"

export default function AdminClassPage(props) {
    const currDate = new Date()
    const {course_id} = useParams()
    const [attendances, setAttendances] = useState([])

    const getAttendances = () => {
        axios.post(`${SERVER_ADDRESS}/api/reports/generate`, {
                start_date: "2025-01-01", //new Date().toISOString().split("T")[0],
                end_date: "2025-11-01",//new Date().toISOString().split("T")[0],
                course_id: course_id
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
            .then(res => {
                if (res.status === 200) {
                    setAttendances(res.data.data.attendances)
                }
            })
            .catch(err => console.log(err))
    }

    const getClassInfo = () => {

    }

    useEffect(() => {


    }, [])


    const [formData, setFormData] = useState({
        class_name: "Math 1",
        class_teacher: "Mr. Smith",
        class_id: "D1234",


        students: [
            {
                student_name: "Christopher Healy",
                student_id: "D123123"
            },
            {
                student_name: "Christopher Healy",
                student_id: "D123123"
            },
            {
                student_name: "Christopher Healy",
                student_id: "D123123"
            },
            {
                student_name: "Christopher Healy",
                student_id: "D123123"
            },
            {
                student_name: "Christopher Healy",
                student_id: "D123123"
            },
        ]
    })

    return (
        <>
            <Header/>
            <div id="adminPageContainer">
                <div id="adminTopRow">
                    <div id="adminClassInfo">
                        <HorizontalTextField
                            fieldName="class_name"
                            label="Class Name"
                            value={formData.class_name}
                            type="text"
                            onChanged={(e) => {
                                setFormData({...formData, ["class_name"]: e.target.value})
                            }}
                        />

                        <HorizontalTextField
                            fieldName="teacher_name"
                            label="Teacher"
                            value={formData.class_teacher}
                            type="text"
                            onChanged={(e) => {
                                setFormData({...formData, ["class_teacher"]: e.target.value})
                            }}
                        />

                        <HorizontalTextField
                            fieldName="class_id"
                            label="Class ID"
                            value={formData.class_id}
                            type="text"
                            onChanged={(e) => {
                            }}
                        />
                    </div>
                    <div id="adminClassActions">
                        <button type="button"><img src="/icons8-calendar-50.png"/>Set Timetable</button>
                        <button type="button"><img src="/icons8-add-user-50.png"/>Add Students</button>
                    </div>
                </div>

                <div id="adminStudentsTable">
                    <div id="tableTools">
                        <span>
                            <img src="/icons8-page-50.png"/>
                            <h3>Students Enrolled</h3>
                        </span>
                        <input type="text"/>
                    </div>

                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Remove</th>
                        </tr>
                        </thead>
                        <tbody>
                        {attendances.map(attendance =>
                            <AdminClassTableRow
                                student={attendance.student}
                                onDeletePressed={() => {
                                }}
                            />
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer/>
        </>
    )
}
import React, {useState, useEffect} from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import HorizontalTextField from "../components/HorizontalTextField"
import AdminClassTableRow from "../components/AdminClassTableRow"


export default function AdminClassPage(props){
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



    


    return(
        <>
            <Header />
            <div id="adminPageContainer">
                <div id="adminTopRow">
                    <div id="adminClassInfo">
                        <HorizontalTextField 
                            fieldName="class_name"
                            value={formData.class_name}
                            type="text"
                            onChanged={(e)=>{
                                setFormData({...formData, ["class_name"]:e.target.value})
                            }}
                        />

                        <HorizontalTextField 
                            fieldName="teacher_name"
                            value={formData.class_teacher}
                            type="text"
                            onChanged={(e)=>{
                                setFormData({...formData, ["class_teacher"]:e.target.value})
                            }}
                        />

                        <HorizontalTextField 
                            fieldName="class_id"
                            value={formData.class_id}
                            type="text"
                            onChanged={(e)=>{}}
                        />
                    </div>
                    <div id="adminClassActions">
                        <button type="button">Set Timetable</button>
                        <button type="button">Add Students</button>
                    </div>
                </div>

                <div id="adminStudentsTable">
                    <div id="tableTools">
                        <h3>Students Enrolled</h3>
                        <input type="text" />
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <td>ID</td>
                                <td>Name</td>
                                <td>Remove</td>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.students.map(student => 
                                <AdminClassTableRow
                                    student={student}
                                    onDeletePressed={()=>{D}}
                                />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    )
}
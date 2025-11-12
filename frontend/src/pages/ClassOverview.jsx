import React, {useState, useEffect} from "react"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import ClassGroupCard from "../components/ClassGroupCard"
import "../css/ClassOverview.css"
import {SERVER_ADDRESS} from "../config/global_constants"

export default function ClassOverview(){
    const accessLevelMap = {
        1: "/student/attendance/",
        2: "/teacher/attedance/",
        3: "admin/classGroup/"
    }

    /*const [userGroups, setUserGroups] = useState([])

    useEffect(()=>{
        axios.get(`${SERVER_ADDRESS}/TODO`
            .then(res => {
                if (res.status == 200){
                    setUserGroups(#)
                }
            })
        )
    }, [])

    */


    const userGroups = [
        {
            id: "axc1123",
            className: "Maths 1",
            teacher: "Mr Doe",
            numStudents: 20
        },
        {
            id: "676767",
            className: "Algorithms and Data Structures",
            teacher: "Ms Doe",
            numStudents: 18
        },
        {
            id: "b4ug01",
            className: "Geography",
            teacher: "Mr Smith",
            numStudents: 25
        },
        {
            id: "rh12331",
            className: "Science",
            teacher: "Mr Doe",
            numStudents: 34
        },
        {
            id: "rh12331",
            className: "Science",
            teacher: "Mr Doe",
            numStudents: 34
        }
    ]



    return (
        <>
            <Header />
            <div id="classOverviewContainer">
                <div id="classOverviewMain">
                    <h2>Your Class Groups</h2>
                    <div id="classList">
                        {userGroups.map(group => {
                            const linkTo = accessLevelMap[localStorage.getItem("accessLevel")] + group.id
                            return <ClassGroupCard classGroup={group} linkTo={linkTo}/>}
                        )}
                    </div>
                </div>
            </div>
            <Footer />

        </>
    )
}
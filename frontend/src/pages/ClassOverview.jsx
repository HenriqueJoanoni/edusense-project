import React, {useState, useEffect} from "react"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import ClassGroupCard from "../components/ClassGroupCard"
import "../css/ClassOverview.css"
import {SERVER_ADDRESS} from "../config/global_constants"



/*
{
	"success": true,
	"message": "Subscribed subjects retrieved successfully.",
	"data": [
		{
			"subject_id": 6,
			"subject_name": "Software Design Patterns",
			"subject_code": "SE201",
			"class_id": 2,
			"class_year": 2,
			"class_semester": 2,
			"lecturer_id": 13
		},
		{
			"subject_id": 41,
			"subject_name": "Network Protocols",
			"subject_code": "NET221",
			"class_id": 2,
			"class_year": 2,
			"class_semester": 2,
			"lecturer_id": 3
		},
		{
			"subject_id": 45,
			"subject_name": "Network Administration",
			"subject_code": "NET225",
			"class_id": 2,
			"class_year": 2,
			"class_semester": 2,
			"lecturer_id": 15
		},
		{
			"subject_id": 47,
			"subject_name": "SQL and Query Optimisation",
			"subject_code": "DB232",
			"class_id": 2,
			"class_year": 2,
			"class_semester": 2,
			"lecturer_id": 35
		}
	]
}



*/



export default function ClassOverview(){
    const accessLevelMap = {
        1: "/student/attendance/",
        2: "/teacher/attedance/",
        3: "admin/classGroup/"
    }

    const [userGroups, setUserGroups] = useState([])

    useEffect(()=>{
        axios.defaults.withCredentials = true
        axios.get(`${SERVER_ADDRESS}/api/my-classes`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }})
            .then(res => {
                if (res.status == 200){
                    setUserGroups(res.data.data)
                }
                else {
                    console.log(res)
                }
            }
        )
    }, [])

    

    
    const createLink = (class_id, subject_id) => {
        //student
        if (localStorage.getItem("accessLevel") === 1){
            return `/student-attendance/?class=${class_id}/?subject=${subject_id}}`
        }
    }

    



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
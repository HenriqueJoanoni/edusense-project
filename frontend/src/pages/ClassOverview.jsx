import React, {useState, useEffect} from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import ClassGroupCard from "../components/ClassGroupCard"
import "../css/ClassOverview.css"

export default function ClassOverview(){
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
                        {userGroups.map(group => <ClassGroupCard classGroup={group}/>)}
                    </div>
                </div>
            </div>
            <Footer />

        </>
    )
}
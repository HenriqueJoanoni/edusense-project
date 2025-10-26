import React from "react"

export default function AttendanceTableRow(props){




    return (
        <tr>
            <td>{props.student.ID}</td>
            <td>{props.student.name}</td>            
            <td>{props.student.arrivalTime}</td>
            <td>{props.student.status}</td>
        </tr>
    )
}
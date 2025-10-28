import React from "react"

export default function AttendanceTableRow(props){
    let statusClasses = {
        present: "statusBubblePresent",
        late: "statusBubbleLate",
        absent: "statusBubbleAbsent"
    }


    function capitalise(str){
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
    



    return (
        <tr>
            <td>{props.student.ID}</td>
            <td>{props.student.name}</td>            
            <td>{props.student.arrivalTime}</td>
            <td>
                <div className={`attendanceStatusBubble ${statusClasses[props.student.status]}`}>
                    {capitalise(props.student.status)}
                </div>
            </td>
        </tr>
    )
}
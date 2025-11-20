import React from "react"

export default function AdminClassTableRow(props){
    return (
        <tr>
            <td>{props.student.student_id}</td>
            <td><img src="" alt="img" />{props.student.student_name}</td>
            <td>
                <button type="button">{props.onDeletePressed}</button>
            </td>
        </tr>
    )
}
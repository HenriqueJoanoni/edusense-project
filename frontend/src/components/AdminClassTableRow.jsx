import React from "react"

export default function AdminClassTableRow(props){
    return (
        <tr className="adminClassTableRow">
            <td>{props.student.registration}</td>
            <td><span><img src="/profilePlaceholder.jpg" alt="img" />{props.student.name}</span></td>
            <td>
                <button type="button" onClick={props.onDeletePressed}><img src="/icons8-trash-can-50.png"/></button>
            </td>
        </tr>
    )
}
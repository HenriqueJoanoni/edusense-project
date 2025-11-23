import React from "react"


export default function HorizontalTextField(props){
    return (
        <div className="horizontalTextField">
            <label htmlFor={props.fieldName}>{props.label}:</label>
            <input 
                type={props.type}
                value={props.value}
                onChange={props.onChanged}
                name={props.fieldName}
            />
        </div>
    )
}
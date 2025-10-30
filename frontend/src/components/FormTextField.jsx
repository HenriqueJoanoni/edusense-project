import React from "react"
import "../css/FormTextField.css"

export default function FormTextField(props){
    return (
        <div className="formTextField">
            <label htmlFor="">{props.label} {props.required ? "*" : ""}</label>
            <input 
                type={props.type}
                placeholder={props.label}
                value={props.value}
                onChange={(e)=>props.onChange(e.target.value)}
                required={props.required}
            />
        </div>
    )
}
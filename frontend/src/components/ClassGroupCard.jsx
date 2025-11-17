import React from "react"

export default function ClassGroupCard(props){
    return  (
        <div className="classGroupCard">
            <div className="classInfo">
                <h4>{props.classGroup.subject_name}</h4>
                <div>
                    <p>{props.classGroup.subject_code}</p>
                    <p>{props.classGroup.teacher}</p>
                </div>
                
            </div>
            <a href={props.linkTo}>Expand</a>
        </div>
    )
}
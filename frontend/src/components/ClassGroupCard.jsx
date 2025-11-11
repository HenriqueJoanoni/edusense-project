import React from "react"

export default function ClassGroupCard(props){
    return  (
        <div className="classGroupCard">
            <div className="classInfo">
                <h4>{props.classGroup.className}</h4>
                <div>
                    <p>ID:{props.classGroup.id}</p>
                    <p>{props.classGroup.teacher}</p>
                </div>
                
            </div>
            <a href="#">Expand</a>
        </div>
    )
}
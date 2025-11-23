import React, {useState, useEffect} from "react"
import "../css/Header.css"

export default function Header() {
    return (
        <header>
            <div id="titleSection">
                <img
                    src="/edusense_logo.png"
                    id="edusenseLogo"
                    alt="Edusense Logo"
                />
                <h1>EduSense</h1>
            </div>

            <div id="headerActions">
                <a href="" className="headerLink">About</a>
                {localStorage.getItem("token") == null ? <a href="/login" className="headerLink">Login</a> :
                    <a href="/logout" className="headerLink">Logout</a>}
                {localStorage.getItem("token") == null ? <a href="/register" className="headerLink">Register</a> : ""}
            </div>
        </header>
    )
}

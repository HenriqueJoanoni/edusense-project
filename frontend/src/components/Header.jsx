import React, {useState, useRef, useEffect} from "react";
import "../css/Header.css";
import {ACCESS_LEVEL_ADMIN, ACCESS_LEVEL_TEACHER} from "../config/global_constants";

export default function Header() {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const user = sessionStorage.getItem("Token") != null
        ? JSON.parse(sessionStorage.getItem("User"))
        : null;

    console.log({"User data: ": user})
    return (
        <header>
            <a href="/">
                <div id="titleSection">
                    <img src="/roll-call.png" id="edusenseLogo" alt="Edusense Logo"/>
                    <div className="edusense-logo-writing">
                        <img src="/edusense-logo-new.png" alt="logo"/>
                    </div>
                </div>
            </a>
            <div id="headerActions">
                <a href="" className="headerLink">About</a>
                {user ? (
                    <>
                        {user.user_role === ACCESS_LEVEL_ADMIN ?
                            <a href="/dashboard" className="headerLink">Dashboard</a> :
                            user.user_role === ACCESS_LEVEL_TEACHER ?
                                <a href="/lecturer/dashboard" className="headerLink">Dashboard</a> :
                            <a href="/my-attendance" className="headerLink">My Attendance</a>
                        }
                        <div className="user-info" ref={dropdownRef}>
                            <img
                                src={user.avatarUrl || "/profile-picture.png"}
                                alt="Avatar"
                                className="user-avatar"
                                onClick={() => setShowDropdown((prev) => !prev)}
                                style={{cursor: "pointer"}}
                            />
                            <span className="user-name">{user.name}</span>
                            {showDropdown && (
                                <div className="user-dropdown">
                                    <a
                                        href="/my-profile"
                                        className="dropdown-link"
                                    >
                                        Profile
                                    </a>
                                    <a
                                        href="/logout"
                                        className="dropdown-link"
                                    >
                                        Logout
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <a href="/login" className="headerLink">Login</a>
                        <a href="/register" className="headerLink">Register</a>
                    </>
                )}
            </div>
        </header>
    );
}

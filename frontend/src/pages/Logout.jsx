import React from "react"
import { Navigate } from "react-router-dom"

export default function Logout(){
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    return <Navigate to="/" replace />
}
import React, {useEffect} from "react";
import {Navigate} from "react-router-dom";
import api from "../api";

export default function Logout() {
    const [shouldRedirect, setShouldRedirect] = React.useState(false);

    useEffect(() => {
        const performLogout = async () => {
            const token = sessionStorage.getItem("Token")

            if (token) {
                try {
                    await api.post("/logout", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                } catch (error) {
                    console.error("Erro ao fazer logout:", error)
                }
            }

            sessionStorage.removeItem("Token")
            sessionStorage.removeItem("User")
            setShouldRedirect(true)
        }
        performLogout()
    }, [])

    if (shouldRedirect) {
        return <Navigate to="/login" replace/>
    }

    return (
        <div style={{padding: "20px", textAlign: "center"}}>
            logging out...
        </div>
    )
}
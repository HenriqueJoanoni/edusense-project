import React from "react"
import "../css/Footer.css"


export default function Footer(){
    return (
        <footer>
            <div id="footerLinks">
                <ul>
                    <li class="footerLink"><a href="#"><img src="/icons8-facebook-50.png" alt="Facebook"/></a></li>
                    <li class="footerLink"><a href="#"><img src="/icons8-instagram-50.png" alt="Instagram"/></a></li>
                    <li class="footerLink"><a href="#"><img src="/icons8-x-48.png" alt="X"/></a></li>
                </ul>
            </div>
        </footer>
    )
}
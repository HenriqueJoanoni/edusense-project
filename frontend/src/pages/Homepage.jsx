import Header from "../components/Header"
import Footer from "../components/Footer"


import "../css/Homepage.css"


export default function Homepage(){
    return (
        <>
        <Header />
        <div id="homepageContainer">
            <div id="homepageOverlay">
                <div id="homepageMain">
                    <h2>Attendance Made Simpler</h2>
                    <p>EduSense is changing the way teachers take Attendance</p>
                    <button type="text">Start Now</button>
                </div>
            </div>
        </div>
        <Footer />
        </>

    )
}
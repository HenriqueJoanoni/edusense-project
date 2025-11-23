import Header from "../components/Header"
import Footer from "../components/Footer"
import TypeWriter from "../components/TypeWriter";
import "../css/Homepage.css"

export default function Homepage() {
    let userInfo = JSON.parse(sessionStorage.getItem("User"))

    return (
        <>
            <Header userInfo={userInfo}/>
            <div id="homepageContainer">
                <div id="homepageOverlay">
                    <div id="homepageMain">
                        <TypeWriter
                            strings={[
                            "<h2>Attendance Made Simpler</h2>"
                        ]}
                            typeSpeed={80}
                            backSpeed={0}
                            loop={false}
                            asHtml={true}
                        />
                        <p>EduSense is changing the way teachers take Attendance</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}
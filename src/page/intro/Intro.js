import { Link } from "react-router-dom";
import "./Info.css";

const Intro = () => {
    return (
        <div className="intro_wrapper">
            <div className="intro_section">
                <div className="logo">SOOLTHER TOWN</div>

                <Link to="/info">
                    <button className="cta_button">시작하기</button>
                </Link>
            </div>
        </div>
    );
};

export default Intro;

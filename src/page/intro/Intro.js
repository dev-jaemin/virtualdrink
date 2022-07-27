import { Link } from "react-router-dom";
import "./Info.css";

const Intro = () => {
    return (
        <div className="intro_wrapper">
            <Link to="/info">
                <button className="cta_button">START</button>
            </Link>
        </div>
    );
};

export default Intro;

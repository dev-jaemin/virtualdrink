import { Link } from "react-router-dom";

const Intro = () => {
    return (
        <div>
            Virtual Drink
            <Link to="/info">
                <button>Enter</button>
            </Link>
        </div>
    );
};

export default Intro;

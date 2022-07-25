import { Link } from "react-router-dom";
import "./Info.css";

const Info = () => {
    const clickCheck = (event) => {
        document.querySelectorAll(`input[type=checkbox]`).forEach((el) => (el.checked = false));
        event.target.checked = true;
    };

    return (
        <div>
            <div className="nickname_section">
                <label for="name">Your Nickname: </label>
                <input type="text" name="name"></input>
            </div>

            <div>
                <label for="age">Your age: </label>
                <input type="number" name="age" min="20"></input>
            </div>

            <div>
                <label for="characterType">Choose character: </label>
            </div>

            <input type="checkbox" name="char" onClick={clickCheck}></input>
            <img src="logo192.png" alt="No image" />
            <input type="checkbox" name="char" onClick={clickCheck}></input>
            <img src="logo192.png" alt="No image" />
            <input type="checkbox" name="char" onClick={clickCheck}></input>
            <img src="logo192.png" alt="No image" />
            <input type="checkbox" name="char" onClick={clickCheck}></input>
            <img src="logo192.png" alt="No image" />
            <Link to="/main">
                <button>Enter</button>
            </Link>
        </div>
    );
};

export default Info;

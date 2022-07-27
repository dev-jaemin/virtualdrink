
import man1 from "../../static/image/characterimages/m0.gif";
import woman1 from "../../static/image/characterimages/w0.gif";
import man2 from "../../static/image/characterimages/m4.gif";
import woman2 from "../../static/image/characterimages/w4.gif";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Info = () => {
    const navigate = useNavigate();

    const [info, setInfo] = useState({
        nickname: "",
        roomID: "",
        characterType: "man1",
    });

    const clickCheck = (e) => {
        document.querySelectorAll(`input[type=checkbox]`).forEach((el) => (el.checked = false));
        e.target.checked = true;
        setInfo({
            ...info,
            ["characterType"]: e.target.name,
        });
    };

    const onChange = (e) => {
        setInfo({
            ...info,
            [e.target.name]: e.target.value,
        });
    };

    const enterMain = () => {
        Object.keys(info).forEach((key) => {
            window.sessionStorage.setItem(key, info[key]);
        });
        navigate("/main");
    };

    return (
        <div>
            <div>
                <label for="nickname">Your Nickname: </label>
                <input type="text" name="nickname" id="nickname" onChange={onChange} />
            </div>

            <div>
                <label for="roomId">Select RoomId: </label>
                <input type="number" name="roomID" id="nickname" onChange={onChange} />
            </div>

            <div>
                <label for="characterType">Choose character: </label><br/>
                <input type="checkbox" name="man1" onClick={clickCheck}/>
                <img src={man1} alt="No image" />
                <input type="checkbox" name="woman1" onClick={clickCheck}/>
                <img src={woman1} alt="No image" />
                <input type="checkbox" name="man2" onClick={clickCheck}/>
                <img src={man2} alt="No image" />
                <input type="checkbox" name="woman2" onClick={clickCheck}/>
                <img src={woman2} alt="No image" />
            </div>
            <div onClick={enterMain}>Enter</div>
        </div>
    );
};

export default Info;

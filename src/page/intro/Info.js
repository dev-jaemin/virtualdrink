import { useNavigate } from "react-router-dom";
import man from "../../static/image/characterimages/m0.gif";
import woman from "../../static/image/characterimages/w0.gif";
import React, { useState } from "react";

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
        <div className="info_wrapper">
            <div className="info_form">
                <div className="info_input_section">
                    <label for="nickname">Nickname </label>
                    <input type="text" name="nickname" id="nickname" onChange={onChange} />
                </div>

                <div className="info_input_section">
                    <label for="roomId">RoomID </label>
                    <input type="number" name="roomID" id="nickname" onChange={onChange} />
                </div>

                <div style={{ margin: "0px 10px" }}>
                    <label for="characterType">Choose character </label>
                    <br />
                    <input type="checkbox" name="man1" onClick={clickCheck} />
                    <img src={man} alt="No image" />
                    <input type="checkbox" name="woman1" onClick={clickCheck} />
                    <img src={woman} alt="No image" />
                </div>
                <div className="info_submit_btn" onClick={enterMain}>
                    Enter
                </div>
            </div>
        </div>
    );
};

export default Info;

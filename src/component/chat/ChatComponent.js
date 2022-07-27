import { useRef } from "react";
import "./ChatComponent.css";

const ChatComponent = ({ chatData, sendChat, setChatTextInput }) => {
    const inputRef = useRef();

    const onEnter = (e) => {
        if (e.key === "Enter") {
            submitChat();
        }
    };

    const submitChat = () => {
        sendChat();
        inputRef.current.value = "";
    };

    return (
        <div className="chat_wrapper">
            <div className="chat_section">
                {chatData.map((item, index) => {
                    return (
                        <div key={index}>
                            <span>{item.nickname + " : "}</span>
                            <span>{item.text}</span>
                        </div>
                    );
                })}
            </div>
            <div className="send_section" onKeyDown={onEnter}>
                <input type="text" ref={inputRef} onChange={(e) => setChatTextInput(e.target.value)} />
                {/*<button onClick={submitChat}>전송</button>*/}
            </div>
        </div>
    );
};

export default ChatComponent;

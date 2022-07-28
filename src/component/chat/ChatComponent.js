import { useRef, useEffect } from "react";
import "./ChatComponent.css";

const ChatComponent = ({ chatData, sendChat, setChatTextInput }) => {
    const inputRef = useRef();
    const scrollRef = useRef();

    const onEnter = (e) => {
        if (e.key === "Enter") {
            submitChat();
        }
    };

    const submitChat = () => {
        sendChat();
        inputRef.current.value = "";
    };

    useEffect(() => {
        scrollRef.current.scrollTo(0, 500000);
    }, [chatData]);

    return (
        <div className="chat_wrapper">
            <div className="chat_section" ref={scrollRef}>
                {chatData.map((item, index) => {
                    return (
                        <div key={index}>
                            <span className={item.nickname === "SYSTEM" ? "chat_nickname_system" : "chat_nickname"}>{`[${item.nickname}] : `}</span>
                            <span style={{ color: "white" }}>{item.text}</span>
                        </div>
                    );
                })}
            </div>
            <div className="send_section" onKeyDown={onEnter}>
                <input type="text" ref={inputRef} onChange={(e) => setChatTextInput(e.target.value)} />
            </div>
        </div>
    );
};

export default ChatComponent;

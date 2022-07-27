import { useRef } from "react";

const ChatComponent = ({ chatData, sendChat, setChatTextInput }) => {
    const inputRef = useRef();

    return (
        <div>
            <div>
                {chatData.map((item) => {
                    return (
                        <div>
                            <div>{item.nickname}</div>
                            <div>{item.text}</div>
                        </div>
                    );
                })}
            </div>
            <div>
                <input type="text" ref={inputRef} onChange={(e) => setChatTextInput(e.target.value)} />
                <button
                    onClick={(e) => {
                        sendChat(e);
                        inputRef.current.value = "";
                    }}
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;

import React, { useEffect, useRef, useCallback, useState } from "react";
import io from "socket.io-client";
import Canvas from "../../component/canvas/canvas";
import ChatComponent from "../../component/chat/ChatComponent";
import VideoStream from "../../component/video/VideoStream";
import { pcConfig } from "./config";

const Mainpage = () => {
    const SOCKET_SERVER_URL = process.env.REACT_APP_API_HOST;
    const ROOM_ID = window.sessionStorage.getItem("roomID") || "1234";

    const socketRef = useRef();
    const localStreamRef = useRef();
    const sendPCRef = useRef();
    const receivePCsRef = useRef({});
    const localVideoRef = useRef(null);

    const [users, setUsers] = useState([]);
    const [usersPos, setUsersPos] = useState([]);

    const [chatData, setChatData] = useState([]);
    const [chatTextInput, setChatTextInput] = useState("");

    const closeReceivePC = useCallback((id) => {
        if (!receivePCsRef.current[id]) return;
        receivePCsRef.current[id].close();
        delete receivePCsRef.current[id];
    }, []);

    const createReceiverOffer = useCallback(async (pc, senderSocketID) => {
        try {
            const sdp = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            pc.setLocalDescription(new RTCSessionDescription(sdp));
            if (!socketRef.current) return;
            socketRef.current.emit("receiverOffer", {
                sdp,
                receiverSocketID: socketRef.current.id,
                senderSocketID,
                roomID: ROOM_ID,
            });
        } catch (error) {
            console.log(error);
        }
    }, []);

    const createReceiverPeerConnection = useCallback((socketID) => {
        try {
            const pc = new RTCPeerConnection(pcConfig);
            // add pc to peerConnections object
            receivePCsRef.current = { ...receivePCsRef.current, [socketID]: pc };
            pc.onicecandidate = (e) => {
                if (!(e.candidate && socketRef.current)) return;
                socketRef.current.emit("receiverCandidate", {
                    candidate: e.candidate,
                    receiverSocketID: socketRef.current.id,
                    senderSocketID: socketID,
                });
            };
            pc.oniceconnectionstatechange = (e) => {
                console.log(e);
            };
            pc.ontrack = (e) => {
                setUsers((oldUsers) =>
                    oldUsers
                        .filter((user) => user.id !== socketID)
                        .concat({
                            id: socketID,
                            stream: e.streams[0],
                        })
                );
            };
            // return pc
            return pc;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }, []);

    const createReceivePC = useCallback(
        (id) => {
            try {
                const pc = createReceiverPeerConnection(id);
                if (!(socketRef.current && pc)) return;
                createReceiverOffer(pc, id);
            } catch (error) {
                console.log(error);
            }
        },
        [createReceiverOffer, createReceiverPeerConnection]
    );

    const createSenderOffer = useCallback(async () => {
        try {
            if (!sendPCRef.current) return;
            const sdp = await sendPCRef.current.createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: false,
            });
            sendPCRef.current.setLocalDescription(new RTCSessionDescription(sdp));
            if (!socketRef.current) return;
            socketRef.current.emit("senderOffer", {
                sdp,
                senderSocketID: socketRef.current.id,
                roomID: ROOM_ID,
            });
        } catch (error) {
            console.log(error);
        }
    }, []);

    const createSenderPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(pcConfig);
        pc.onicecandidate = (e) => {
            if (!(e.candidate && socketRef.current)) return;
            socketRef.current.emit("senderCandidate", {
                candidate: e.candidate,
                senderSocketID: socketRef.current.id,
            });
        };
        pc.oniceconnectionstatechange = (e) => {
            console.log(e);
        };
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                if (!localStreamRef.current) return;
                pc.addTrack(track, localStreamRef.current);
            });
        } else {
            console.log("no local stream");
        }
        sendPCRef.current = pc;
    }, []);

    const getLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: 240,
                    height: 240,
                },
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            if (!socketRef.current) return;
            createSenderPeerConnection();
            await createSenderOffer();

            socketRef.current.emit("joinRoom", {
                id: socketRef.current.id,
                nickname: window.sessionStorage.getItem("nickname") || "guest",
                characterType: window.sessionStorage.getItem("characterType") || "man1",
                roomID: ROOM_ID,
            });
        } catch (e) {
            console.log(`getUserMedia error: ${e}`);
        }
    }, [createSenderOffer, createSenderPeerConnection]);

    const sendMyPosition = (x, y, direction) => {
        socketRef.current.emit("playerMovement", {
            id: socketRef.current.id,
            x: x,
            y: y,
            direction: direction,
        });
    };

    const sendChat = () => {
        if (chatTextInput !== "") {
            socketRef.current.emit("sendChat", {
                nickname: window.sessionStorage.getItem("nickname") || "guest",
                text: chatTextInput,
            });
            setChatTextInput("");
        }
    };

    useEffect(() => {
        socketRef.current = io.connect(SOCKET_SERVER_URL, {
            path: "/socket.io",
            transports: ["websocket"],
        });
        getLocalStream();

        socketRef.current.on("userEnter", (data) => {
            createReceivePC(data.id);
        });

        socketRef.current.on("allUsers", (data) => {
            data.users.forEach((user) => createReceivePC(user.id));
            // user들의 포지션 정보 저장
            setUsersPos(Object.values(data.userPos));
        });

        socketRef.current.on("userExit", (data) => {
            closeReceivePC(data.id);
            setUsers((users) => users.filter((user) => user.id !== data.id));
        });

        socketRef.current.on("getSenderAnswer", async (data) => {
            try {
                if (!sendPCRef.current) return;

                await sendPCRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("getSenderCandidate", async (data) => {
            try {
                if (!(data.candidate && sendPCRef.current)) return;

                await sendPCRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("getReceiverAnswer", async (data) => {
            try {
                const pc = receivePCsRef.current[data.id];
                if (!pc) return;
                await pc.setRemoteDescription(data.sdp);
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("getReceiverCandidate", async (data) => {
            try {
                const pc = receivePCsRef.current[data.id];
                if (!(pc && data.candidate)) return;
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("updatePlayersMovement", async (data) => {
            setUsersPos(Object.values(data.userPos));
        });

        socketRef.current.on("getChat", (data) => {
            setChatData((chatData) => [...chatData, data]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (sendPCRef.current) {
                sendPCRef.current.close();
            }
            users.forEach((user) => closeReceivePC(user.id));
        };
        // eslint-disable-next-line
    }, [closeReceivePC, createReceivePC, createSenderOffer, createSenderPeerConnection, getLocalStream]);

    return (
        <div style={{ height: "95vh" }}>
            <VideoStream localVideoRef={localVideoRef} users={users} />
            <Canvas users={usersPos} id={socketRef.current && socketRef.current.id} socketRef={socketRef} sendMyPosition={sendMyPosition} chatData={chatData} />
            <ChatComponent chatData={chatData} setChatTextInput={setChatTextInput} sendChat={sendChat} />
        </div>
    );
};

export default Mainpage;

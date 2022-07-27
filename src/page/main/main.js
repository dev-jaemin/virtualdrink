import React, { useEffect, useRef, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import Canvas from "../../component/canvas/canvas";
import VideoStream from "../../component/video/VideoStream";
import { pcConfig } from "./config";

const Mainpage = () => {
    const SOCKET_SERVER_URL = process.env.REACT_APP_API_HOST;

    const socketRef = useRef();
    const localStreamRef = useRef();
    const sendPCRef = useRef();
    const receivePCsRef = useRef({});
    const localVideoRef = useRef(null);
    const [searchParams] = useSearchParams();

    const [users, setUsers] = useState([]);
    const [usersPos, setUsersPos] = useState([]);

    const closeReceivePC = useCallback((id) => {
        console.log(`close : ${id}`);
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
            // console.log("create receiver offer success");
            // 아래의 코드에서 맨 앞 await를 지운 적 있음
            pc.setLocalDescription(new RTCSessionDescription(sdp));
            if (!socketRef.current) return;
            socketRef.current.emit("receiverOffer", {
                sdp,
                receiverSocketID: socketRef.current.id,
                senderSocketID,
                roomID: "1234",
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
                // console.log("receiver PC onicecandidate");
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
                // console.log("ontrack success");
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
                console.log(`socketID(${id}) user entered`);
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
            // console.log("create sender offer success");
            // 아래의 코드에서 맨 앞 await를 지운 적 있음
            sendPCRef.current.setLocalDescription(new RTCSessionDescription(sdp));
            if (!socketRef.current) return;
            socketRef.current.emit("senderOffer", {
                sdp,
                senderSocketID: socketRef.current.id,
                roomID: "1234",
            });
        } catch (error) {
            console.log(error);
        }
    }, []);

    const createSenderPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(pcConfig);
        pc.onicecandidate = (e) => {
            if (!(e.candidate && socketRef.current)) return;
            // console.log("sender PC onicecandidate");
            socketRef.current.emit("senderCandidate", {
                candidate: e.candidate,
                senderSocketID: socketRef.current.id,
            });
        };
        pc.oniceconnectionstatechange = (e) => {
            console.log(e);
        };
        if (localStreamRef.current) {
            // console.log("add local stream");
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
                nickname: searchParams.get("nickname") || "guest",
                characterType: searchParams.get("characterType") || "man1",
                roomID: searchParams.get("roomID") || "1234",
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

    const ready369 = () =>{
        socketRef.current.emit("369 start");
    };


    useEffect(() => {
        socketRef.current = io.connect(SOCKET_SERVER_URL);
        getLocalStream();

        socketRef.current.on("userEnter", (data) => {
            createReceivePC(data.id);
        });

        socketRef.current.on("allUsers", (data) => {
            console.log(data);
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
                // console.log("get sender answer");
                // console.log(data.sdp);
                await sendPCRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("getSenderCandidate", async (data) => {
            try {
                if (!(data.candidate && sendPCRef.current)) return;
                // console.log("get sender candidate");
                await sendPCRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                // console.log("candidate add success");
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("getReceiverAnswer", async (data) => {
            try {
                // console.log(`get socketID(${data.id})'s answer`);
                const pc = receivePCsRef.current[data.id];
                if (!pc) return;
                await pc.setRemoteDescription(data.sdp);
                // console.log(`socketID(${data.id})'s set remote sdp success`);
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("getReceiverCandidate", async (data) => {
            try {
                //  console.log(`get socketID(${data.id})'s candidate`);
                const pc = receivePCsRef.current[data.id];
                if (!(pc && data.candidate)) return;
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                // console.log(`socketID(${data.id})'s candidate add success`);
            } catch (error) {
                console.log(error);
            }
        });

        socketRef.current.on("updatePlayersMovement", async (data) => {
            // const changedUser = users.filter((user) => {
            //     return user.id === data.id;
            // })[0];
            // console.log(data);
            console.log(data);
            setUsersPos(Object.values(data.userPos));
        });

        socketRef.current.on("myTurn", () =>{
            alert("It's your turn!")
        });

        socketRef.current.on("getCorrect", (user) =>{
            console.log(user.id+" is correct!");
        });

        socketRef.current.on("getIncorrect", (user) =>{
            console.log(user.id+" is wrong! Game over");
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
        <div>
            <VideoStream localVideoRef={localVideoRef} users={users} />
            <Canvas users={usersPos} socketRef={socketRef} sendMyPosition={sendMyPosition} />
            <button onClick={ready369}>ready 369</button>
        </div>
    );
};

export default Mainpage;

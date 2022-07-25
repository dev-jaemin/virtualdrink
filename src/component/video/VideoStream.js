import React, { useState, useRef, useEffect, useCallback } from "react";
import io from "socket.io-client";
import Video from "./Video";

const pc_config = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
            ],
        },
        {
            url: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
        },
        {
            url: "turn:192.158.29.39:3478?transport=udp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808",
        },
        {
            url: "turn:192.158.29.39:3478?transport=tcp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808",
        },
        {
            url: "turn:turn.bistri.com:80",
            credential: "homeo",
            username: "homeo",
        },
        {
            url: "turn:turn.anyfirewall.com:443?transport=tcp",
            credential: "webrtc",
            username: "webrtc",
        },
    ],
};
const SOCKET_SERVER_URL = "https://virtualdrink.kro.kr";

const Socket = () => {
    const socketRef = useRef();
    const localStreamRef = useRef();
    const sendPCRef = useRef();
    const receivePCsRef = useRef({});
    const localVideoRef = useRef(null);

    const [users, setUsers] = useState([]);

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
            console.log("create receiver offer success");
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
            const pc = new RTCPeerConnection(pc_config);
            // add pc to peerConnections object
            receivePCsRef.current = { ...receivePCsRef.current, [socketID]: pc };
            pc.onicecandidate = (e) => {
                if (!(e.candidate && socketRef.current)) return;
                console.log("receiver PC onicecandidate");
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
                console.log("ontrack success");
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
            console.log("create sender offer success");
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
        const pc = new RTCPeerConnection(pc_config);
        pc.onicecandidate = (e) => {
            if (!(e.candidate && socketRef.current)) return;
            console.log("sender PC onicecandidate");
            socketRef.current.emit("senderCandidate", {
                candidate: e.candidate,
                senderSocketID: socketRef.current.id,
            });
        };
        pc.oniceconnectionstatechange = (e) => {
            console.log(e);
        };
        if (localStreamRef.current) {
            console.log("add local stream");
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
                roomID: "1234",
            });
        } catch (e) {
            console.log(`getUserMedia error: ${e}`);
        }
    }, [createSenderOffer, createSenderPeerConnection]);
    useEffect(() => {
        socketRef.current = io.connect(SOCKET_SERVER_URL);
        getLocalStream();
        socketRef.current.on("userEnter", (data) => {
            createReceivePC(data.id);
        });
        socketRef.current.on("allUsers", (data) => {
            console.log(data);
            data.users.forEach((user) => createReceivePC(user.id));
        });
        socketRef.current.on("userExit", (data) => {
            closeReceivePC(data.id);
            setUsers((users) => users.filter((user) => user.id !== data.id));
        });
        socketRef.current.on("getSenderAnswer", async (data) => {
            try {
                if (!sendPCRef.current) return;
                console.log("get sender answer");
                console.log(data.sdp);
                await sendPCRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } catch (error) {
                console.log(error);
            }
        });
        socketRef.current.on("getSenderCandidate", async (data) => {
            try {
                if (!(data.candidate && sendPCRef.current)) return;
                console.log("get sender candidate");
                await sendPCRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log("candidate add success");
            } catch (error) {
                console.log(error);
            }
        });
        socketRef.current.on("getReceiverAnswer", async (data) => {
            try {
                console.log(`get socketID(${data.id})'s answer`);
                const pc = receivePCsRef.current[data.id];
                if (!pc) return;
                await pc.setRemoteDescription(data.sdp);
                console.log(`socketID(${data.id})'s set remote sdp success`);
            } catch (error) {
                console.log(error);
            }
        });
        socketRef.current.on("getReceiverCandidate", async (data) => {
            try {
                console.log(`get socketID(${data.id})'s candidate`);
                const pc = receivePCsRef.current[data.id];
                if (!(pc && data.candidate)) return;
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log(`socketID(${data.id})'s candidate add success`);
            } catch (error) {
                console.log(error);
            }
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
            <video
                style={{
                    width: 240,
                    height: 240,
                    margin: 5,
                    backgroundColor: "black",
                }}
                muted
                ref={localVideoRef}
                autoPlay
            />
            {users.map((user, index) => (
                <Video key={index} stream={user.stream} />
            ))}
        </div>
    );
};
export default Socket;

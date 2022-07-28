import React, { useEffect, useRef, useState } from "react";
import Styled from "styled-components";

const VideoContainer = Styled.video`
    width: 15vw;
    height: 100%;
    background-color: black;
    object-fit: cover;
    margin: 5px;
`;

const Video = ({ stream, muted }) => {
    const ref = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream;
        if (muted) setIsMuted(muted);
    }, [stream, muted]);

    return <VideoContainer ref={ref} muted={isMuted} autoPlay />;
};

export default Video;

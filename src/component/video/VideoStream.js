import Video from "./Video";
import Styled from "styled-components";
import "./Video.css";

const Container = Styled.div`
    position: relative;
    display: inline-block;
    height: 20vh;
`;

const Socket = ({ localVideoRef, users }) => {
    return (
        <div style={{ position: "fixed" }}>
            <Container>
                <video muted ref={localVideoRef} autoPlay />
                {users.map((user, index) => (
                    <Video key={index} stream={user.stream} />
                ))}
            </Container>
        </div>
    );
};
export default Socket;

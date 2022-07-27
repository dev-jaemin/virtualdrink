import Video from "./Video";
import Styled from "styled-components";

const Container = Styled.div`
    position: relative;
    display: inline-block;
    height: 20vh;
`;

const Socket = ({ localVideoRef, users }) => {
    return (
        <div style={{ position: "fixed" }}>
            <Container>
                <video
                    style={{
                        width: "15vw",
                        height: "100%",
                        backgroundColor: "black",
                        objectFit: "cover",
                        margin: "5px",
                    }}
                    muted
                    ref={localVideoRef}
                    autoPlay
                />
                {users.map((user, index) => (
                    <Video key={index} stream={user.stream} />
                ))}
            </Container>
        </div>
    );
};
export default Socket;

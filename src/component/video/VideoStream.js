import Video from "./Video";

const Socket = ({ localVideoRef, users }) => {
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

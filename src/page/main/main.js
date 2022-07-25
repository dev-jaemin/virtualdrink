import Canvas from "../../component/canvas/canvas";
import Socket from "../../component/video/VideoStream";

const Mainpage = () => {
    return (
        <div>
            <Socket />
            <Canvas />
        </div>
    );
};

export default Mainpage;

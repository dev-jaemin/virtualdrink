import { Route, BrowserRouter, Routes } from "react-router-dom";
import Intro from "./page/intro/Intro";
import Main from "./page/main/main";
import Info from "./page/intro/Info";
import "./App.css";
import Socket from "./page/socket/Socket";
import UserMoving from "./component/user/UserMoving";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Intro />} exact />
                    <Route path="/main" element={<Main />} exact />
                    <Route path="/socket" element={<Socket />} />
                    <Route path="/info" element={<Info />} />
                    <Route path="/test" element={UserMoving()}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

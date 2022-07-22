import { Route, BrowserRouter, Routes } from "react-router-dom";
import Intro from "./page/intro/Intro";
import Main from "./page/main/main";

import "./App.css";
import Socket from "./page/socket/Socket";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Intro />} exact />
                    <Route path="/main" element={<Main />} exact />
                    <Route path="/socket" element={<Socket />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

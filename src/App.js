import { Route, BrowserRouter, Routes } from "react-router-dom";
import Intro from "./page/intro/Intro";
import Main from "./page/main/main";

import "./App.css";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Intro />} exact />
                    <Route path="/main" element={<Main />} exact />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

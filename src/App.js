import { Route, BrowserRouter, Routes } from "react-router-dom";
import Intro from "./page/intro/Intro";
import MainPage from "./page/main/main";
import Info from "./page/intro/Info";
import "./App.css";
import UserMoving from "./component/user/UserMoving";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Intro />} exact />
                    <Route path="/main" element={<MainPage />} exact />
                    <Route path="/info" element={<Info />} />
                    <Route path="/test" element={UserMoving("man1")} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

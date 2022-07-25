import { Route, BrowserRouter, Routes } from "react-router-dom";
import Intro from "./page/intro/Intro";
import MainPage from "./page/main/main";
import Info from "./page/intro/Info";
import "./App.css";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Intro />} exact />
                    <Route path="/main" element={<MainPage />} exact />
                    <Route path="/info" element={<Info />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

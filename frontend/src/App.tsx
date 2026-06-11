import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TierList from "./pages/TierList";
import SecretPacks from "./pages/SecretPacks";
import TopCards from "./pages/TopCards";
import About from "./pages/About";
import NavBar from "./components/NavBar";


export default function App() {
  return (
    <div>
      <NavBar />
      <main className="main-content mx-auto w-full max-w-[1080px] px-3 py-6">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/tier-list" element={<TierList/>} />
          <Route path="/secret-packs" element={<SecretPacks/>} />
          <Route path="/top-cards" element={<TopCards/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
      </main>
    </div>
    
  );
}

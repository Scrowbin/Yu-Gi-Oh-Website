import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TierList from "./pages/TierList";
import SecretPacks from "./pages/SecretPacks";
import TopCards from "./pages/TopCards";
import NavBar from "./components/NavBar";


export default function App() {
  return (
    <div>
      <NavBar />
      <main className='main-content'>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/tier-list" element={<TierList/>} />
          <Route path="/secret-packs" element={<SecretPacks/>} />
          <Route path="/top-cards" element={<TopCards/>} />
        </Routes>
      </main>
    </div>
    
  );
}

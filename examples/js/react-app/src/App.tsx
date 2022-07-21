import "./App.css";
import { Routes, Route } from "react-router-dom";
import { NftMints } from "./routes/nft-mints";
import { Nav } from "./components/nav";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Nav />
      <div className="w-screen bg-[#F9FAFB] flex flex-col">
        <Routes>
          <Route path="nft-mints" element={<NftMints />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
}

export default App;

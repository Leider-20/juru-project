import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/home.jsx";
import Voces from "./pages/voces.jsx";
import ClubCreativo from "./pages/clubCreativo.jsx";
import ViveJuru from "./pages/vive.jsx";
import HomeEventos from "./pages/homeEventos.jsx";
import HomeProductos from "./pages/homeProductos.jsx";
import Documental from "./pages/documental.jsx";
import Memorias from "./pages/memorias.jsx";






createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voces" element={<Voces />} />
        <Route path="/clubCreativo" element={<ClubCreativo />} />
        <Route path="/vive" element={<ViveJuru />} />
        <Route path="/eventos" element={<HomeEventos />} />
        <Route path="/productos" element={<HomeProductos />} />
        <Route path="/documental" element={<Documental />} />
        <Route path="/memorias" element={<Memorias />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

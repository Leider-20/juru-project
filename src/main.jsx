import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./home.jsx";
import Voces from "./voces.jsx";
import ClubCreativo from "./clubCreativo.jsx";
import ViveJuru from "./vive.jsx";
import HomeEventos from "./homeEventos.jsx";
import HomeProductos from "./homeProductos.jsx";
import Documental from "./documental.jsx";






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
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

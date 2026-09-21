import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./home.jsx";
import Voces from "./voces.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Voces />} />
        <Route path="/voces" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

// Logo (misma ruta que usa home.jsx)
import juruLogo from "../images/juru-logo.png";

// Video de esta página — carpeta: src/images/documental_img/
// Nombre que debes ponerle a tu archivo:
//   juru-documental.mp4  -> el documental
import videoDocumental from "../images/documental_mp4/juru-documental.mp4";

// Mismo menú que home.jsx. "Sobre nosotros" y "Memorias" son secciones de
// la página principal, por eso apuntan a "/" con su ancla.
const NAV_LINKS_IZQ = [{ label: "Sobre nosotros", href: "/#quienes-somos" }];
const NAV_LINKS_DER = [{ label: "Memorias", href: "/#novedades" }];

// A dónde lleva el botón "¡Quiero conocer más!". Cámbialo por la ruta que
// corresponda (por ejemplo "/vive" o "/voces").
const CONOCER_MAS_TO = "/vive"; // Cambia esto según tu necesidad

const EASE_FIGMA = "cubic-bezier(0.42, 0, 1, 1)";
const EASE_SLIDE = "cubic-bezier(0, 0, 0.58, 1)";

export default function Documental() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Siempre empezamos arriba de la página.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.style.background = "#D3DB63";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // "Volver" regresa a la página de la que vino el visitante; si entró
  // directo a esta página (sin historial), lo manda al inicio.
  const handleVolver = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <main className="doc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500&family=Judson:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500&family=Caveat+Brush&display=swap');

        :root {
          --ease-figma: ${EASE_FIGMA};
          --ease-slide: ${EASE_SLIDE};
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { color: inherit; }
        button { font: inherit; }

        .doc-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #000;
          font-family: 'Instrument Sans', sans-serif;
          animation: docIn 450ms var(--ease-slide) backwards;
        }
        @keyframes docIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ---------- Barra horizontal (igual a home.jsx) ---------- */
        .hero-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 70px;
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 4.5vw;
          background: #A6AA5A;
        }
        .hero-nav-logo { justify-self: start; }
        .hero-nav-spacer { justify-self: end; display: flex; align-items: center; }
        .hero-logo { width: 86px; height: auto; display: block; }
        .hero-links {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 34px;
          color: rgba(255,255,255,.95);
          font: 500 14px 'Fredoka', sans-serif;
          text-shadow: 0 1px 6px rgba(60,60,20,.45);
        }
        .hero-links a {
          position: relative;
          text-decoration: none;
          transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .hero-links a::after {
          content: '';
          position: absolute;
          left: 0; bottom: -7px;
          width: 100%; height: 1px;
          background: rgba(255,255,255,.8);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease-slide);
        }
        .hero-links a:hover { opacity: .75; transform: translateY(-1px); }
        .hero-links a:hover::after { transform: scaleX(1); }
        .hero-club {
          padding: 9px 22px;
          border-radius: 999px;
          background: #d3da63;
          color: #272626;
          text-decoration: none;
          font: 400 14px 'Fredoka', sans-serif;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(60,60,20,.25);
          transition: filter 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .hero-club:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .mobile-menu-button { display: none; border: 0; background: transparent; color: white; cursor: pointer; }

        .mobile-overlay { position: fixed; inset: 0; z-index: 50; background: #1F1B14; color: white; display: flex; flex-direction: column; animation: menuIn 300ms var(--ease-slide) both; }
        @keyframes menuIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .mobile-overlay-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; }
        .mobile-overlay nav { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; font: 400 28px 'Judson', serif; }
        .mobile-overlay nav a { text-decoration: none; transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide); }
        .mobile-overlay nav a:hover { opacity: .65; transform: translateX(5px); }

        /* ---------- Video ---------- */
        .doc-video-wrap {
          position: relative;
          flex: 1;
          min-height: 340px;
          background: #000;
        }
        .doc-video {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }

        /* ---------- Barra inferior: Volver · texto · Quiero conocer más ---------- */
        .doc-actions {
          flex-shrink: 0;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 24px;
          min-height: 104px;
          padding: 18px 34px;
          background: #D3DB63;
        }
        /* Fuente parecida a "Stay With Me" (Regular 400, 30px, interlineado 100%) */
        .doc-note {
          margin: 0;
          text-align: center;
          color: #272626;
          font: 400 clamp(19px, 2.2vw, 34px)/1 'Caveat Brush', 'Stay With Me', cursive;
          letter-spacing: 0;
        }
        .doc-note span { display: block; }
        .doc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 40px;
          border: 0;
          border-radius: 999px;
          background: #8F4538;
          color: #fff;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          font: 500 15px 'Fredoka', sans-serif;
          transition: filter 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .doc-btn:hover { filter: brightness(1.12); transform: translateY(-2px); }
        .doc-btn:focus-visible, .hero-club:focus-visible, .hero-links a:focus-visible {
          outline: 2px solid #5A2504;
          outline-offset: 3px;
        }

        @media (max-width: 900px) {
          .hero-links { display: none; }
          .hero-club { display: none; }
          .mobile-menu-button { display: block; }
          .doc-video-wrap { flex: none; aspect-ratio: 16 / 9; min-height: 0; }
          .doc-actions {
            grid-template-columns: 1fr 1fr;
            gap: 18px 12px;
            padding: 22px 20px;
          }
          .doc-note { grid-column: 1 / -1; order: -1; }
        }

        @media (max-width: 560px) {
          .hero-nav { padding: 0 20px; }
          .hero-logo { width: 74px; }
          .doc-btn { padding: 0 24px; font-size: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <header className="hero-nav">
        <div className="hero-nav-logo">
          <Link to="/" aria-label="JURU inicio">
            <img className="hero-logo" src={juruLogo} alt="JURU" />
          </Link>
        </div>

        <nav className="hero-links" aria-label="Navegación principal">
          {NAV_LINKS_IZQ.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
          <Link to="/vive">Vive</Link>
          <Link to="/voces">Voces</Link>
          {NAV_LINKS_DER.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="hero-nav-spacer">
          <Link to="/clubCreativo" className="hero-club">Club Creativo</Link>
          <button className="mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Menu size={27} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-overlay">
          <div className="mobile-overlay-head">
            <img src={juruLogo} alt="JURU" className="hero-logo" />
            <button className="mobile-menu-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
              <X size={28} />
            </button>
          </div>
          <nav>
            {NAV_LINKS_IZQ.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link to="/clubCreativo" onClick={() => setMenuOpen(false)}>Club Creativo</Link>
            {NAV_LINKS_DER.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link to="/vive" onClick={() => setMenuOpen(false)}>Vive</Link>
            <Link to="/voces" onClick={() => setMenuOpen(false)}>Voces</Link>
          </nav>
        </div>
      )}

      <div className="doc-video-wrap">
        <video
          className="doc-video"
          src={videoDocumental}
          controls
          playsInline
          preload="metadata"
          aria-label="Documental de JURU"
        />
      </div>

      <div className="doc-actions">
        <button type="button" className="doc-btn" onClick={handleVolver}>Volver</button>
        <p className="doc-note">
          <span>¿Te faltó conocer más sobre nuestro territorio?</span>
          <span>Ve a nuestro video juego inmersivo y conócelo como uno más de la comunidad</span>
        </p>
        <Link to={CONOCER_MAS_TO} className="doc-btn">¡Quiero conocer más!</Link>
      </div>
    </main>
  );
}
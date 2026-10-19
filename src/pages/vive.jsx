import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

// Logo que ya se usa en Home
import juruLogo from "../images/juru-logo.png";

// Imágenes de "Vive JURU"
import viveSol from "../images/vive_img/juru-vive_sol_decorativo.png";
import vivePaisajeIzq from "../images/vive_img/juru-vive_paisaje_izquierda_cana_y_montana.png";
import vivePaisajeDer from "../images/vive_img/juru-vive_paisaje_derecha_arbol_y_sendero.png";
import viveBurro from "../images/vive_img/juru-vive_burro_con_carga.png";
import iconoCaminos from "../images/vive_img/juru-vive_icono_sigue_caminos.png";

const NAV_LINKS_IZQ = [{ label: "Sobre nosotros", href: "/#quienes-somos" }];
const NAV_LINKS_DER = [{ label: "Memorias", to: "/memorias" }];

/* ----------------------------- Iconos de los pasos ----------------------------- */
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const IconoMouse = () => (
  <svg {...svgProps}>
    <rect x="7" y="3" width="10" height="17" rx="5" />
    <path d="M12 3v7" />
    <path d="M4.5 9.5a8 8 0 0 1 1.6-3.2" strokeWidth="1" />
  </svg>
);

const IconoCaminos = () => (
  <img className="vj-icono-img" src={iconoCaminos} alt="" aria-hidden="true" />
);

const IconoPlay = () => (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M10 8.3 16 12l-6 3.7z" />
  </svg>
);

const IconoMapa = () => (
  <svg {...svgProps}>
    <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
    <path d="M9 4v13.5M15 6.5V20" />
  </svg>
);

const PASOS = [
  { id: "arrastra", Icono: IconoMouse, titulo: "Haz clic y arrastra", texto: "para mirar a tu alrededor." },
  { id: "caminos", Icono: IconoCaminos, titulo: "Sigue los caminos", texto: "para avanzar por el territorio." },
  { id: "play", Icono: IconoPlay, titulo: "Dale play", texto: "para reproducir los videos" },
  { id: "mapa", Icono: IconoMapa, titulo: "Usa el mapa", texto: "para orientarte y elegir tu recorrido, dándole clic a los puntos" },
];

// Destino del botón "Iniciar recorrido" (proyecto externo)
const URL_RECORRIDO = "https://julifon23.itch.io/vive-360";

export default function ViveJuru() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.style.background = "#F5F5D5";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <main className="vj-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&family=Fredoka:wght@400;500&family=Judson:wght@400&display=swap');

        :root {
          --vj-bg: #F5F5D5;
          --vj-olive: #6C6C2C;
          --vj-bar: #BDBBA4;
          --vj-lima: #d3da63;
          --vj-tile: #CBD96B;
          --ease-figma: cubic-bezier(0.42, 0, 1, 1);
          --ease-slide: cubic-bezier(0, 0, 0.58, 1);
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { color: inherit; }
        button { font: inherit; }

        .vj-page {
          --u: calc(100vw / 1440);   /* 1u = 1px del diseño de 1440px */
          min-height: 100vh;
          /* "hidden" convertía a esta página en su propio contenedor de scroll
             (overflow-y pasaba a "auto") y mostraba una segunda barra.
             "clip" recorta igual sin crear contenedor de scroll. */
          overflow-x: hidden;
          overflow-x: clip;
          background: var(--vj-bg);
          color: #1d1d1d;
          font-family: 'Outfit', sans-serif;
        }

        @keyframes vjFadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vjMenuIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

        /* ---------------- BARRA DE NAVEGACIÓN ---------------- */
        .vj-bar {
          position: sticky;   /* barra fija al hacer scroll */
          top: 0;
          z-index: 40;
          height: 65px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 3vw;
          background: var(--vj-bar);
        }
        .vj-logo { width: 86px; height: auto; display: block; }
        .vj-links {
          display: flex;
          align-items: center;
          gap: 34px;
          color: var(--vj-bg);
          font: 500 14px 'Fredoka', sans-serif;
          text-shadow: 0 1px 4px rgba(0,0,0,.25);
        }
        .vj-links a {
          position: relative;
          text-decoration: none;
          color: inherit;
          transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .vj-links a::after {
          content: '';
          position: absolute;
          left: 0; bottom: -7px;
          width: 100%; height: 1px;
          background: rgba(245,245,213,.9);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease-slide);
        }
        .vj-links a:hover { opacity: .8; transform: translateY(-1px); }
        .vj-links a:hover::after { transform: scaleX(1); }
        .vj-links a.vj-active {
          padding: 9px 22px;
          background: rgba(255,255,255,.28);
          border-radius: 999px;
        }
        .vj-links a.vj-active::after { display: none; }
        .vj-right { justify-self: end; display: flex; align-items: center; }
        .vj-club {
          padding: 7px 22px;
          border-radius: 999px;
          background: var(--vj-lima);
          color: #272626;
          text-decoration: none;
          font: 500 14px 'Fredoka', sans-serif;
          white-space: nowrap;
          box-shadow: 0 4px 4px rgba(0,0,0,.25);
          transition: filter 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .vj-club:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .vj-menu-btn { display: none; border: 0; background: transparent; color: var(--vj-bg); cursor: pointer; }

        .vj-overlay {
          position: fixed; inset: 0; z-index: 60;
          background: #1F1B14; color: white;
          display: flex; flex-direction: column;
          animation: vjMenuIn 300ms var(--ease-slide) both;
        }
        .vj-overlay-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; }
        .vj-overlay nav {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 28px; font: 400 28px 'Judson', serif;
        }
        .vj-overlay nav a { text-decoration: none; color: inherit; transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide); }
        .vj-overlay nav a:hover { opacity: .65; transform: translateX(5px); }

        /* ---------------- CONTENIDO (móvil / tablet primero) ---------------- */
        .vj-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 34px;
          padding: 36px 20px 70px;
          overflow: hidden;
          animation: vjFadeIn 700ms var(--ease-slide) both;
        }
        .vj-sol { width: 110px; height: auto; order: 0; }
        .vj-intro { order: 1; text-align: center; max-width: 560px; }
        .vj-bienvenida { margin: 0; font-weight: 300; font-size: 24px; line-height: 1; color: var(--vj-olive); }
        .vj-titulo { margin: 6px 0 0; font-weight: 400; font-size: 64px; line-height: .95; color: var(--vj-olive); }
        .vj-parrafo { margin: 28px 0 0; font-size: 17px; line-height: 1.3; }
        .vj-como { order: 2; margin: 0; font-size: 18px; font-weight: 400; letter-spacing: .01em; }
        .vj-pasos { order: 3; display: grid; grid-template-columns: 1fr 1fr; gap: 22px; width: 100%; max-width: 420px; }
        .vj-paso { display: flex; flex-direction: column; align-items: center; }
        .vj-tile {
          width: 100%;
          aspect-ratio: 133 / 108;
          display: flex; align-items: center; justify-content: center;
          border-radius: 18px;
          background: rgba(203,217,107,.9);
          color: #fff;
        }
        .vj-tile svg { width: 56px; height: 56px; }
        .vj-tile .vj-icono-img { width: 100px; height: 100px; object-fit: contain; display: block; }
        .vj-label {
          width: 96%;
          margin-top: 12px;
          padding: 8px 8px 10px;
          text-align: center;
          background: rgba(250,250,230,.9);
          font-size: 12px;
          line-height: 1.15;
          color: #111;
        }
        .vj-label strong { display: block; font-weight: 500; }
        .vj-lema { order: 4; margin: 0; text-align: center; font-weight: 300; font-size: 30px; line-height: 1.2; color: var(--vj-olive); white-space: nowrap; }
        .vj-cta {
          order: 5;
          width: min(100%, 336px);
          height: 44px;
          display: flex; align-items: center; justify-content: center; gap: 14px;
          border: 1px solid var(--vj-olive);
          border-radius: 999px;
          color: var(--vj-olive);
          text-decoration: none;
          font-size: 18px;
          transition: background 500ms var(--ease-figma), color 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .vj-cta:hover { background: var(--vj-olive); color: var(--vj-bg); transform: translateY(-2px); }
        .vj-img-izq, .vj-img-der, .vj-burro { width: min(100%, 440px); height: auto; order: 9; display: block; }

        @media (max-width: 900px) {
          .vj-links, .vj-club { display: none; }
          .vj-menu-btn { display: block; }
        }
        @media (max-width: 560px) {
          .vj-bar { padding: 0 20px; }
          .vj-logo { width: 74px; }
          .vj-titulo { font-size: 54px; }
        }

        /* ---------------- ESCRITORIO: lienzo de 1440px escalado ---------------- */
        @media (min-width: 1101px) {
          .vj-stage {
            display: block;
            height: calc(var(--u) * 1386);
            padding: 0;
          }
          .vj-stage > * { position: absolute; margin: 0; }

          .vj-img-izq { left: 0; top: calc(var(--u) * 110); width: calc(var(--u) * 565); }
          .vj-img-der { left: calc(var(--u) * 1035); top: calc(var(--u) * 335); width: calc(var(--u) * 405); }
          .vj-burro { left: calc(var(--u) * 880); top: calc(var(--u) * 845); width: calc(var(--u) * 325); z-index: 2; }
          .vj-sol { left: calc(var(--u) * 1058); top: calc(var(--u) * 115); width: calc(var(--u) * 178); z-index: 2; }

          .vj-intro { left: calc(var(--u) * 430); top: calc(var(--u) * 150); width: calc(var(--u) * 620); max-width: none; z-index: 3; }
          .vj-bienvenida { font-size: calc(var(--u) * 30); }
          .vj-titulo { margin-top: calc(var(--u) * 4); padding-left: calc(var(--u) * 34); font-size: calc(var(--u) * 100); }
          .vj-parrafo { margin: calc(var(--u) * 66) auto 0; width: calc(var(--u) * 590); font-size: max(14px, calc(var(--u) * 20)); line-height: 1.2; }

          .vj-como { left: calc(var(--u) * 440); top: calc(var(--u) * 570); width: calc(var(--u) * 720); text-align: center; font-size: max(14px, calc(var(--u) * 20)); z-index: 3; }

          .vj-pasos {
            left: calc(var(--u) * 414);
            top: calc(var(--u) * 659);
            display: flex;
            gap: calc(var(--u) * 55);
            width: auto; max-width: none;
            z-index: 3;
          }
          .vj-paso { width: calc(var(--u) * 133); }
          .vj-tile { width: 100%; height: calc(var(--u) * 108); aspect-ratio: auto; border-radius: calc(var(--u) * 20); }
          .vj-tile svg { width: calc(var(--u) * 62); height: calc(var(--u) * 62); }
          .vj-tile .vj-icono-img { width: calc(var(--u) * 118); height: calc(var(--u) * 118); }
          .vj-label {
            width: calc(var(--u) * 127);
            min-height: calc(var(--u) * 65);
            margin-top: calc(var(--u) * 18);
            padding: calc(var(--u) * 8);
            font-size: max(9px, calc(var(--u) * 11));
          }

          /* Más ancho (420) y recentrado (left 522) para que "Explora. Descubre."
             quepa en un solo renglón y "Conecta" quede debajo, centrado con el botón. */
          .vj-lema { left: calc(var(--u) * 522); top: calc(var(--u) * 945); width: calc(var(--u) * 420); white-space: nowrap; font-size: calc(var(--u) * 36); line-height: calc(var(--u) * 42); z-index: 3; }
          .vj-cta { left: calc(var(--u) * 564); top: calc(var(--u) * 1138); width: calc(var(--u) * 336); height: calc(var(--u) * 40); font-size: max(14px, calc(var(--u) * 20)); z-index: 3; }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* ------------------- Barra de navegación ------------------- */}
      <header className="vj-bar">
        <div>
          <Link to="/" aria-label="JURU inicio">
            <img className="vj-logo" src={juruLogo} alt="JURU" />
          </Link>
        </div>

        <nav className="vj-links" aria-label="Navegación principal">
          {NAV_LINKS_IZQ.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
          <Link to="/vive" className="vj-active" aria-current="page">Vive</Link>
          <Link to="/voces">Voces</Link>
          {NAV_LINKS_DER.map((item) => (
            <Link key={item.label} to={item.to}>{item.label}</Link>
          ))}
        </nav>

        <div className="vj-right">
          <Link to="/clubCreativo" className="vj-club">Club Creativo</Link>
          <button className="vj-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Menu size={27} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="vj-overlay">
          <div className="vj-overlay-head">
            <img src={juruLogo} alt="JURU" className="vj-logo" />
            <button className="vj-menu-btn" style={{ display: "block", color: "#fff" }} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
              <X size={28} />
            </button>
          </div>
          <nav>
            {NAV_LINKS_IZQ.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link to="/vive" onClick={() => setMenuOpen(false)}>Vive</Link>
            <Link to="/voces" onClick={() => setMenuOpen(false)}>Voces</Link>
            {NAV_LINKS_DER.map((item) => (
              <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            ))}
            <Link to="/clubCreativo" onClick={() => setMenuOpen(false)}>Club Creativo</Link>
          </nav>
        </div>
      )}

      {/* ------------------- Contenido ------------------- */}
      <section className="vj-stage" aria-label="Vive JURU">
        {/* Recortes decorativos */}
        <img className="vj-img-izq" src={vivePaisajeIzq} alt="Paisaje del territorio con caña, montaña y una mujer caminando" />
        <img className="vj-img-der" src={vivePaisajeDer} alt="Árbol y sendero del territorio" />
        <img className="vj-burro" src={viveBurro} alt="Burro cargando costales" />
        <img className="vj-sol" src={viveSol} alt="" aria-hidden="true" />

        {/* Título y descripción */}
        <div className="vj-intro">
          <p className="vj-bienvenida">Bienvenida a</p>
          <h1 className="vj-titulo">VIVE JURU</h1>
          <p className="vj-parrafo">
            Te invitamos a recorrer el territorio de JURU y descubrir las historias, saberes y lugares que hacen parte de su identidad. Camina por la ruta, explora sus espacios y encuentra las voces, objetos y relatos que conectan a la comunidad con su territorio.
          </p>
        </div>

        {/* ¿Cómo recorrerla? */}
        <h2 className="vj-como">¿CÓMO RECORRERLA?</h2>

        <div className="vj-pasos">
          {PASOS.map(({ id, Icono, titulo, texto }) => (
            <div key={id} className="vj-paso">
              <div className="vj-tile"><Icono /></div>
              <p className="vj-label">
                <strong>{titulo}</strong>
                {texto}
              </p>
            </div>
          ))}
        </div>

        <p className="vj-lema">Explora. Descubre.<br />Conecta</p>

        {/* Enlace externo: abre el recorrido en otro proyecto */}
        <a href={URL_RECORRIDO} className="vj-cta">
          Iniciar recorrido <ArrowRight size={18} />
        </a>
      </section>
    </main>
  );
}
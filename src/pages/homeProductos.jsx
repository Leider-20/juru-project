import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Undo2 } from "lucide-react";

// Logo (misma ruta que usa home.jsx)
import juruLogo from "../images/juru-logo.png";

// Imágenes de esta página — carpeta: src/images/homeProductos_img/
// Cada recuadro lleva DOS imágenes: la principal y la que aparece al pasar
// el cursor. Nombres que debes ponerle a tus archivos:
//
//   Neceser verde con cuentas      -> juru-neceser-frente.png      / juru-neceser-detalle.png
//   Bolso de retazos con perlas    -> juru-bolso-retazos-frente.png / juru-bolso-retazos-detalle.png
//   Bolso vinotinto                -> juru-bolso-vino-frente.png   / juru-bolso-vino-detalle.png
//   Tote de tela bordado a mano    -> juru-tote-frente.png         / juru-tote-detalle.png
import neceserFrente from "../images/homeProductos_img/juru-neceser-frente.png";
import neceserDetalle from "../images/homeProductos_img/juru-neceser-detalle.png";
import retazosFrente from "../images/homeProductos_img/juru-bolso-retazos-frente.png";
import retazosDetalle from "../images/homeProductos_img/juru-bolso-retazos-detalle.png";
import vinoFrente from "../images/homeProductos_img/juru-bolso-vino-frente.png";
import vinoDetalle from "../images/homeProductos_img/juru-bolso-vino-detalle.png";
import toteFrente from "../images/homeProductos_img/juru-tote-frente.png";
import toteDetalle from "../images/homeProductos_img/juru-tote-detalle.png";

// Corazón del rectángulo central. Pon tu imagen en esta carpeta con este
// nombre exacto: src/images/homeProductos_img/juru-corazon.png
// (si es PNG o SVG con fondo transparente, se verá mejor)
import corazon from "../images/homeProductos_img/juru-corazon.png";

// Mismo menú que home.jsx. "Sobre nosotros" y "Memorias" son secciones de
// la página principal, por eso apuntan a "/" con su ancla.
const NAV_LINKS_IZQ = [{ label: "Sobre nosotros", href: "/#quienes-somos" }];
const NAV_LINKS_DER = [{ label: "Memorias", href: "/#novedades" }];

// Enlace del botón "Pídelo aquí" (WhatsApp, formulario, etc.). Cámbialo
// cuando lo tengas.
const PEDIDO_HREF = "#";

// Texto del rectángulo central (ocupa las dos filas de la columna del medio).
const TEXTO_PANEL =
  "Cada pieza tiene una identidad propia. En sus formas, colores, materiales y detalles se encuentran los saberes, la creatividad y las historias de las mujeres que las crean. Más que objetos, son expresiones de una tradición que se transforma sin perder sus raíces. Explora el catálogo y descubre la huella que hace único a cada producto.";

// Cuadrícula de 3 columnas: los productos van en las columnas de los lados
// (2 por columna) y el rectángulo con texto ocupa la columna del medio.
// El panel se ubica con grid-column / grid-row en el CSS, así que su lugar
// en esta lista solo define el orden en pantallas pequeñas.
const PRODUCTOS = [
  { id: "neceser", alt: "Neceser verde con figuras de cuentas", frente: neceserFrente, detalle: neceserDetalle },
  { id: "retazos", alt: "Bolso de retazos de cuero con asas de madera", frente: retazosFrente, detalle: retazosDetalle },
  { id: "panel", panel: true },
  { id: "vino", alt: "Bolso vinotinto de JURU", frente: vinoFrente, detalle: vinoDetalle },
  { id: "tote", alt: "Tote de tela con flores y pavo real bordados a mano", frente: toteFrente, detalle: toteDetalle },
];

const EASE_FIGMA = "cubic-bezier(0.42, 0, 1, 1)";
const EASE_SLIDE = "cubic-bezier(0, 0, 0.58, 1)";

export default function HomeProductos() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();

  // Transición de salida al tocar la flecha: el contenido se desvanece y
  // se aleja un poco mientras una cortina del color de home.jsx aparece;
  // al terminar, navegamos a la página principal.
  const LEAVE_MS = 350;
  const goHome = () => {
    // Con la pantalla cubierta, subimos al inicio para que home.jsx no
    // herede el scroll de esta página.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/");
  };
  const handleBack = (e) => {
    // Respeta clic con Ctrl/Cmd/Shift o botón central (abrir en otra pestaña).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (leaving) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      goHome();
      return;
    }
    setLeaving(true);
    setTimeout(goHome, LEAVE_MS);
  };

  // Al llegar desde "Leer más" siempre empezamos arriba de la página.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.background = "#B07404";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <main className={`prod-page ${leaving ? "is-leaving" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fredoka:wght@400;500&family=Judson:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500&display=swap');

        :root {
          --ease-figma: ${EASE_FIGMA};
          --ease-slide: ${EASE_SLIDE};
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { color: inherit; }

        .prod-page {
          min-height: 100vh;
          overflow-x: clip;
          background: #B07404;
          color: #F3E7B5;
          font-family: 'Instrument Sans', sans-serif;
        }

        /* ---------- Barra horizontal (igual a home.jsx) ---------- */
        .hero-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 70px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 4.5vw;
          background: #8F6215;
        }
        .hero-nav-logo { justify-self: start; }
        .hero-nav-spacer { justify-self: end; display: flex; align-items: center; }
        .hero-logo { width: 86px; height: auto; display: block; }
        .hero-links {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 34px;
          color: rgba(255,255,255,.92);
          font: 500 14px 'Fredoka', sans-serif;
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

        /* ---------- Transiciones de entrada y salida ---------- */
        .prod-page { animation: prodIn 450ms var(--ease-slide) backwards; }
        @keyframes prodIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .prod-stage {
          transition: opacity 280ms var(--ease-figma), transform 350ms var(--ease-slide);
          transform-origin: 50% 30%;
        }
        .is-leaving .prod-stage {
          opacity: 0;
          transform: translateY(20px) scale(.98);
        }
        .prod-curtain {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: #F7F2E4;
          opacity: 0;
          pointer-events: none;
          transition: opacity 330ms var(--ease-slide);
        }
        .is-leaving .prod-curtain { opacity: 1; pointer-events: all; }
        .is-leaving .prod-back svg { transform: translateX(-10px); }
        .prod-back svg { transition: transform 250ms var(--ease-slide); }

        /* ---------- Flecha de regreso ---------- */
        .prod-top {
          display: flex;
          justify-content: flex-end;
          padding: 78px 5.4vw 0;
          height: 260px;
        }
        .prod-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 999px;
          color: #fff;
          text-decoration: none;
          transition: background 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .prod-back:hover { background: rgba(255,255,255,.18); transform: translateX(-3px); }
        .prod-back:focus-visible, .hero-club:focus-visible, .hero-links a:focus-visible, .prod-cta:focus-visible, .prod-card:focus-visible {
          outline: 2px solid #d3da63;
          outline-offset: 3px;
        }

        /* ---------- Cuadrícula de productos ---------- */
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          column-gap: 3.9vw;
          row-gap: 66px;
          padding: 0 2.7vw;
        }
        .prod-card {
          position: relative;
          aspect-ratio: 416 / 348;
          border-radius: 50px;
          overflow: hidden;
        }
        .prod-card { background: #8a5a1c; cursor: pointer; }
        .prod-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 600ms var(--ease-figma);
        }
        /* La segunda imagen está encima, invisible; al pasar el cursor (o
           enfocar con teclado) una se desvanece y la otra aparece. */
        .prod-card .img-hover { opacity: 0; }
        .prod-card:hover .img-hover,
        .prod-card:focus-visible .img-hover,
        .prod-card.is-open .img-hover { opacity: 1; }
        .prod-card:hover .img-base,
        .prod-card:focus-visible .img-base,
        .prod-card.is-open .img-base { opacity: 0; }

        /* ---------- Rectángulo central con texto ---------- */
        /* Ocupa la columna del medio y las dos filas. */
        .prod-panel {
          grid-column: 2;
          grid-row: 1 / span 2;
          display: flex;
          flex-direction: column;
          justify-content: center;   /* texto y corazón agrupados en el centro */
          align-items: center;
          gap: 38px;
          padding: 8% 11%;
          border-radius: 50px;
          background: #934B2E;
          color: #fff;
        }
        .prod-panel-text {
          margin: 0;
          font-family: 'Caveat', cursive;
          font-weight: 500;
          font-size: clamp(20px, 2.15vw, 33px);
          line-height: 1.25;
          text-align: left;
        }
        /* Tamaño del corazón: cambia el width para hacerlo más grande o pequeño */
        .prod-panel-heart {
          flex-shrink: 0;
          display: block;
          width: 72px;
          height: auto;
        }

        /* ---------- Llamado a la compra ---------- */
        .prod-buy {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 40px;
          padding: 140px 9vw 70px;
        }
        .prod-buy-title {
          max-width: 760px;
          margin: 0 0 40px;
          color: #EBD79B;
          font: 400 clamp(32px, 3.5vw, 50px)/1.25 'Instrument Sans', sans-serif;
        }
        .prod-buy-text {
          max-width: 790px;
          margin: 0;
          color: #F3E7B5;
          font: 400 19px/1.27 'Instrument Sans', sans-serif;
        }
        .prod-cta {
          justify-self: end;
          margin-right: 6vw;
          margin-top: 40px;
          padding: 9px 29px;
          border-radius: 999px;
          background: #d3da63;
          color: #8F4535;
          text-decoration: none;
          font: 400 16px 'Fredoka', sans-serif;
          white-space: nowrap;
          transition: filter 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .prod-cta:hover { filter: brightness(1.06); transform: translateY(-2px); }

        /* ---------- ¿Cómo funciona? ---------- */
        .prod-how {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: start;
          gap: 40px;
          padding: 100px 9vw 100px;
          background: #8F4538;
          color: #F7F2E4;
        }
        .prod-steps {
          max-width: 760px;
          margin: 0;
          font: 400 25px/1.5 'Instrument Sans', sans-serif;
        }
        .prod-note {
          margin: 22px 0 0;
          font: 400 15px 'Instrument Sans', sans-serif;
        }
        .prod-how-title {
          margin: 0 7vw 0 0;
          color: #fff;
          font: 500 clamp(30px, 3vw, 42px)/1.2 'Fredoka', sans-serif;
        }

        @media (max-width: 900px) {
          .hero-links { display: none; }
          .hero-club { display: none; }
          .mobile-menu-button { display: block; }

          .prod-top { height: 150px; padding-top: 40px; }
          .prod-grid { grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: 16px; padding: 0 16px; }
          .prod-card { border-radius: 30px; }
          /* El texto pasa a ocupar todo el ancho, entre los productos */
          .prod-panel { grid-column: 1 / -1; grid-row: auto; border-radius: 30px; padding: 40px 32px 32px; }
          .prod-panel-text { font-size: 24px; }

          .prod-buy { grid-template-columns: 1fr; padding: 80px 28px 56px; }
          .prod-cta { justify-self: start; margin: 0; }
          .prod-how { grid-template-columns: 1fr; padding: 60px 28px; }
          .prod-how-title { order: -1; margin: 0; }
          .prod-steps { font-size: 20px; }
        }

        @media (max-width: 560px) {
          .hero-nav { padding: 0 20px; }
          .hero-logo { width: 74px; }
          .prod-grid { grid-template-columns: 1fr; }
          .prod-card { border-radius: 36px; }
          .prod-buy-text { font-size: 17px; }
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

      <div className="prod-stage">
      <div className="prod-top">
        <Link to="/" onClick={handleBack} className="prod-back" aria-label="Volver al inicio">
          <Undo2 size={40} strokeWidth={1.4} />
        </Link>
      </div>

      <section className="prod-grid" aria-label="Nuestros productos">
        {PRODUCTOS.map((p) =>
          p.panel ? (
            <div key={p.id} className="prod-panel">
              <p className="prod-panel-text">{TEXTO_PANEL}</p>
              {/* Corazón: se cambia con el archivo juru-corazon.png (ver import arriba) */}
              <img className="prod-panel-heart" src={corazon} alt="" aria-hidden="true" />
            </div>
          ) : (
            <div key={p.id} className="prod-card" tabIndex={0} role="img" aria-label={p.alt}>
              <img className="img-base" src={p.frente} alt="" />
              <img className="img-hover" src={p.detalle} alt="" />
            </div>
          )
        )}
      </section>

      <section className="prod-buy">
        <div>
          <h1 className="prod-buy-title">Compra tu diseño antes de que llegue a producción.</h1>
          <p className="prod-buy-text">
            Elige el bolso que más te representa, realiza tu pedido y nosotros lo hacemos especialmente para ti. Así apoyas directamente el trabajo de las mujeres artesanas de JURU y haces parte de la creación de una pieza con historia.
          </p>
        </div>
        <a href={PEDIDO_HREF} className="prod-cta">Pídelo aquí</a>
      </section>

      <section className="prod-how" aria-label="¿Cómo funciona?">
        <div>
          <p className="prod-steps">
            1. Elige tu diseño → 2. Reserva tu pieza → 3. JURU la produce → 4. Recíbela en casa.
          </p>
          <p className="prod-note">Cupos limitados · Producción bajo pedido</p>
        </div>
        <h2 className="prod-how-title">¿Cómo<br />funciona?</h2>
      </section>
      </div>

      <div className="prod-curtain" aria-hidden="true" />
    </main>
  );
}
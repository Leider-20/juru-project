import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { Menu, X, Undo2, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";

// Logo (misma ruta que usa home.jsx)
import juruLogo from "../images/juru-logo.png";

// Mismo menú que home.jsx. "Sobre nosotros" y "Memorias" son secciones de
// la página principal, por eso apuntan a "/" con su ancla.
const NAV_LINKS_IZQ = [{ label: "Sobre nosotros", href: "/#quienes-somos" }];
const NAV_LINKS_DER = [{ label: "Memorias", to: "/memorias" }];

// Las 34 páginas del PDF del libro, convertidas a imagen. Están en
// public/libro/pagina-01.webp ... pagina-34.webp
const TOTAL_PAGINAS = 34;
const PAGINAS = Array.from(
  { length: TOTAL_PAGINAS },
  (_, i) => `/libro/pagina-${String(i + 1).padStart(2, "0")}.webp`
);

// Proporción de cada página (ancho / alto) del PDF.
const RATIO = 650 / 910;

const EASE_FIGMA = "cubic-bezier(0.42, 0, 1, 1)";
const EASE_SLIDE = "cubic-bezier(0, 0, 0.58, 1)";

// react-pageflip necesita que cada página sea un componente con ref.
const Pagina = forwardRef(function Pagina({ src, numero }, ref) {
  return (
    <div className="lib-sheet" ref={ref}>
      <img
        src={src}
        alt={`Página ${numero} del libro`}
        draggable={false}
        loading={numero <= 6 ? "eager" : "lazy"}
      />
    </div>
  );
});

export default function HomeLibro() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [size, setSize] = useState(null); // { w, h, portrait }
  const navigate = useNavigate();

  const bookRef = useRef(null);
  const areaRef = useRef(null);
  const stageRef = useRef(null);

  // Transición de salida al tocar la flecha: el contenido se desvanece y
  // se aleja un poco mientras una cortina del color de home.jsx aparece;
  // al terminar, navegamos a la página principal.
  const LEAVE_MS = 350;
  const goHome = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/");
  };
  const handleBack = (e) => {
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

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.background = "#F1EAD3";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // Calcula el tamaño del libro para que ocupe todo el espacio disponible
  // debajo de la barra: dos páginas abiertas en escritorio, una en móvil.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const medir = () => {
      const { width, height } = el.getBoundingClientRect();
      const portrait = width < 760;
      const padX = portrait ? 12 : 72; // espacio para las flechas laterales
      const padY = portrait ? 56 : 28; // espacio para el contador
      const maxW = Math.max(width - padX * 2 + (portrait ? 24 : 0), 200);
      const maxH = Math.max(height - padY * 2, 200);
      const paginasVisibles = portrait ? 1 : 2;
      let pageH = Math.min(maxH, maxW / paginasVisibles / RATIO);
      let pageW = pageH * RATIO;
      setSize({ w: Math.floor(pageW), h: Math.floor(pageH), portrait });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const flip = useCallback((dir) => {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (dir > 0) api.flipNext();
    else api.flipPrev();
  }, []);

  // Teclado: flechas izquierda / derecha.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") flip(1);
      if (e.key === "ArrowLeft") flip(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip]);

  // Pantalla completa del libro.
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.();
  };

  // Texto del contador: "3-4 / 34" en escritorio, "3 / 34" en móvil.
  const contador = () => {
    const n = pagina + 1;
    if (size?.portrait || n === 1) return `${n} / ${TOTAL_PAGINAS}`;
    // Con portada, los pliegos son (2-3), (4-5)... ; la última, si queda sola.
    const izq = n % 2 === 0 ? n : n - 1;
    const der = izq + 1;
    return der > TOTAL_PAGINAS ? `${izq} / ${TOTAL_PAGINAS}` : `${izq}-${der} / ${TOTAL_PAGINAS}`;
  };

  const enPortada = pagina === 0;
  const enUltima = pagina >= TOTAL_PAGINAS - 1;

  return (
    <main className={`lib-page ${leaving ? "is-leaving" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500&family=Judson:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500&display=swap');

        :root {
          --ease-figma: ${EASE_FIGMA};
          --ease-slide: ${EASE_SLIDE};
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { color: inherit; }

        .lib-page {
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #F1EAD3;
          color: #0A2150;
          font-family: 'Instrument Sans', sans-serif;
        }

        /* ---------- Barra horizontal fija (igual a home.jsx) ---------- */
        .hero-nav {
          flex: none;
          position: relative;
          z-index: 20;
          height: 70px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 4.5vw;
          background: #03273ff0;
        }
        .hero-nav-logo { justify-self: start; }
        .hero-nav-spacer { justify-self: end; display: flex; align-items: center; }
        .hero-logo { width: 86px; height: auto; display: block; }
        .hero-links {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 34px;
          color: #f9f6a9;
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
          background: #f9f6a9;
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
        .lib-page { animation: libIn 450ms var(--ease-slide) backwards; }
        @keyframes libIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lib-stage {
          flex: 1;
          min-height: 0;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Crema cálido (el mismo de la cortina): hace resaltar la portada azul */
          background: radial-gradient(ellipse at 50% 45%, #aa4731 0%, #aa4731 55%, #aa4731 100%);
          transition: opacity 280ms var(--ease-figma), transform 350ms var(--ease-slide);
          transform-origin: 50% 30%;
        }
        .is-leaving .lib-stage {
          opacity: 0;
          transform: translateY(20px) scale(.98);
        }
        .lib-curtain {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: #F7F2E4;
          opacity: 0;
          pointer-events: none;
          transition: opacity 330ms var(--ease-slide);
        }
        .is-leaving .lib-curtain { opacity: 1; pointer-events: all; }
        .is-leaving .lib-back svg { transform: translateX(-10px); }
        .lib-back svg { transition: transform 250ms var(--ease-slide); }

        /* ---------- Botones sobre el libro ---------- */
        .lib-btn {
          position: absolute;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: 0;
          border-radius: 999px;
          background: #03273f88;
          color: #f9f6a9;
          cursor: pointer;
          text-decoration: none;
          transition: background 300ms var(--ease-slide), transform 300ms var(--ease-slide), opacity 300ms var(--ease-slide);
        }
        .lib-btn:hover { background: rgba(7, 33, 74, .18); }
        .lib-btn[disabled] { opacity: .25; cursor: default; pointer-events: none; }
        .lib-prev { left: 14px; top: 50%; margin-top: -24px; }
        .lib-next { right: 14px; top: 50%; margin-top: -24px; }
        .lib-prev:hover { transform: translateX(-3px); }
        .lib-next:hover { transform: translateX(3px); }
        .lib-back { top: 12px; left: 14px; width: 52px; height: 52px; }
        .lib-back:hover { transform: translateX(-3px); }
        .lib-full { top: 12px; right: 14px; }
        .lib-btn:focus-visible, .hero-club:focus-visible, .hero-links a:focus-visible {
          outline: 2px solid #0A2150;
          outline-offset: 3px;
        }
        .hero-club:focus-visible, .hero-links a:focus-visible { outline-color: #d3da63; }
        .lib-count {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          color: #5B5A3A;
          font: 400 14px 'Fredoka', sans-serif;
          letter-spacing: .04em;
        }

        /* ---------- Libro ---------- */
        .lib-book { filter: drop-shadow(0 22px 34px rgba(10, 33, 80, .35)); touch-action: pan-y; }
        .lib-sheet { background: #fff; overflow: hidden; }
        .lib-sheet img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          user-select: none;
          -webkit-user-drag: none;
        }

        @media (max-width: 900px) {
          .hero-links { display: none; }
          .hero-club { display: none; }
          .mobile-menu-button { display: block; }
        }
        @media (max-width: 760px) {
          .lib-btn { width: 42px; height: 42px; }
          .lib-prev { left: 6px; }
          .lib-next { right: 6px; }
          .lib-full { display: none; }
        }
        @media (max-width: 560px) {
          .hero-nav { padding: 0 20px; }
          .hero-logo { width: 74px; }
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
            <Link key={item.label} to={item.to}>{item.label}</Link>
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
              <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            ))}
            <Link to="/vive" onClick={() => setMenuOpen(false)}>Vive</Link>
            <Link to="/voces" onClick={() => setMenuOpen(false)}>Voces</Link>
          </nav>
        </div>
      )}

      {/* El libro ocupa todo el espacio debajo de la barra */}
      <section className="lib-stage" ref={stageRef} aria-label="Libro digital de JURU: Tejemos territorio, contamos historia">
        <div ref={areaRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <Link to="/" onClick={handleBack} className="lib-btn lib-back" aria-label="Volver al inicio">
          <Undo2 size={34} strokeWidth={1.4} />
        </Link>

        <button className="lib-btn lib-full" onClick={toggleFullscreen} aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
          {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        <button className="lib-btn lib-prev" onClick={() => flip(-1)} disabled={enPortada} aria-label="Página anterior">
          <ChevronLeft size={28} />
        </button>
        <button className="lib-btn lib-next" onClick={() => flip(1)} disabled={enUltima} aria-label="Página siguiente">
          <ChevronRight size={28} />
        </button>

        {size && (
          <div className="lib-book">
            <HTMLFlipBook
              key={`${size.w}x${size.h}-${size.portrait}`}
              ref={bookRef}
              width={size.w}
              height={size.h}
              size="fixed"
              showCover
              usePortrait={size.portrait}
              startPage={Math.min(pagina, TOTAL_PAGINAS - 1)}
              drawShadow
              maxShadowOpacity={0.5}
              flippingTime={800}
              useMouseEvents
              mobileScrollSupport
              clickEventForward={false}
              swipeDistance={30}
              showPageCorners
              onFlip={(e) => setPagina(e.data)}
            >
              {PAGINAS.map((src, i) => (
                <Pagina key={src} src={src} numero={i + 1} />
              ))}
            </HTMLFlipBook>
          </div>
        )}

        <div className="lib-count" aria-live="polite">{contador()}</div>
      </section>

      <div className="lib-curtain" aria-hidden="true" />
    </main>
  );
}
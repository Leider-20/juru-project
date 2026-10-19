import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

// Logo (misma ruta que usa home.jsx)
import juruLogo from "../images/juru-logo.png";

// Medios de esta página — carpeta: src/images/homeEventos_img/
// Nombres que debes ponerle a tus archivos:
//   juru-territorios-entramados.mp4  -> video de la izquierda (fotos en la pared)
//   juru-instalacion-colcha.png      -> foto de la sala con la mesa y la colcha
import videoTerritorios from "../images/homeEventos_img/juru-territorios-entramados.mp4";
import instalacionColcha from "../images/homeEventos_img/juru-instalacion-colcha.png";

// Mismo menú que home.jsx. "Sobre nosotros" y "Memorias" son secciones de
// la página principal, por eso apuntan a "/" con su ancla.
const NAV_LINKS_IZQ = [{ label: "Sobre nosotros", href: "/#quienes-somos" }];
const NAV_LINKS_DER = [{ label: "Memorias", href: "/#novedades" }];

const EASE_FIGMA = "cubic-bezier(0.42, 0, 1, 1)";
const EASE_SLIDE = "cubic-bezier(0, 0, 0.58, 1)";

export default function HomeEventos() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();

  // Volver a home.jsx: el contenido se desvanece mientras una cortina del
  // color de home aparece; con la pantalla cubierta subimos al inicio de la
  // página (si no, home heredaría el scroll de esta página y quedaría a la
  // mitad) y navegamos.
  const LEAVE_MS = 350;
  const goHome = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/");
  };
  const handleExit = (e) => {
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
    document.body.style.background = "#5A2504";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <main className={`evt-page ${leaving ? "is-leaving" : ""}`}>
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

        .evt-page {
          min-height: 100vh;
          background: #5A2504;
          color: #F7F2E4;
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
          background: #4D2810;
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
        .evt-page { animation: evtIn 450ms var(--ease-slide) backwards; }
        @keyframes evtIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .evt-stage {
          transition: opacity 280ms var(--ease-figma), transform 350ms var(--ease-slide);
          transform-origin: 50% 30%;
        }
        .is-leaving .evt-stage {
          opacity: 0;
          transform: translateY(20px) scale(.98);
        }
        .evt-curtain {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: #F7F2E4;
          opacity: 0;
          pointer-events: none;
          transition: opacity 330ms var(--ease-slide);
        }
        .is-leaving .evt-curtain { opacity: 1; pointer-events: all; }

        /* ---------- Contenido ---------- */
        .evt-layout {
          display: grid;
          grid-template-columns: 44% 1fr;   /* antes 35.2%: columna del video más ancha */
          align-items: start;
        }

        /* El video se queda fijo mientras se lee el texto. Tiene el
           tamaño de su propia proporción (sin recortes ni franjas) y
           queda centrado en la columna. Ahora ocupa casi todo el alto
           disponible de la pantalla (sin el tope fijo de 560px). */
        .evt-media {
          position: sticky;
          top: 70px;
          height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 28px;
        }
        .evt-media video {
          display: block;
          /* Ocupa todo el ancho de la columna; el alto lo fija la pantalla
             y el video se ajusta con "cover" (recorta un poco arriba y abajo
             en vez de dejar franjas). */
          width: 100%;
          height: calc(100vh - 102px);
          max-height: 760px;
          object-fit: cover;
          object-position: center;
          border-radius: 22px;
          box-shadow: 0 24px 40px -18px rgba(0,0,0,.55);
        }

        .evt-content {
          max-width: 800px;
          padding: 135px 6vw 90px 56px;
        }
        .evt-title {
          max-width: 540px;
          margin: 0 0 34px;
          color: #fff;
          font: 500 30px/1.24 'Fredoka', sans-serif;
          letter-spacing: -.005em;
        }
        .evt-text p {
          margin: 0 0 30px;
          color: #F7F2E4;
          font: 400 19px/1.27 'Instrument Sans', sans-serif;
        }
        .evt-text { padding-left: 7px; }
        .evt-figure { margin: 38px 0 40px 7px; }
        .evt-figure img {
          width: 100%;
          height: auto;
          display: block;
        }
        .evt-text-final { padding-left: 0; }

        .evt-exit-wrap { display: flex; justify-content: center; margin-top: 50px; padding-right: 60px; }
        .evt-exit {
          min-width: 130px;
          padding: 8px 24px;
          border-radius: 999px;
          background: #9A8478;
          color: #5A2504;
          text-align: center;
          text-decoration: none;
          font: 400 13px 'Instrument Sans', sans-serif;
          transition: background 300ms var(--ease-slide), color 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .evt-exit:hover { background: #F7F2E4; transform: translateY(-2px); }
        .evt-exit:focus-visible, .hero-club:focus-visible, .hero-links a:focus-visible {
          outline: 2px solid #d3da63;
          outline-offset: 3px;
        }

        @media (max-width: 900px) {
          .hero-links { display: none; }
          .hero-club { display: none; }
          .mobile-menu-button { display: block; }

          .evt-layout { grid-template-columns: 1fr; }
          .evt-media { position: relative; top: 0; height: auto; padding: 28px 24px 0; }
          .evt-media video { height: auto; max-height: 70vh; object-fit: contain; }
          .evt-content { padding: 40px 24px 70px; }
          .evt-title { font-size: 26px; }
          .evt-text { padding-left: 0; }
          .evt-text p { font-size: 17px; }
          .evt-figure { margin-left: 0; }
          .evt-exit-wrap { padding-right: 0; }
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

      <div className="evt-stage">
      <div className="evt-layout">
        <div className="evt-media">
          <video
            src={videoTerritorios}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Fotografías de las artesanas de JURU en la pared de la sala de exhibición"
          />
        </div>

        <article className="evt-content">
          <h1 className="evt-title">
            Territorios entramados: mediaciones del hacer artesanal en contextos híbridos
          </h1>

          <div className="evt-text">
            <p>
              Así como se tejen la trama y la urdimbre, así como dos fragmentos de tela se unen para conformar una nueva superficie, los territorios también se entretejen, desdibujando poco a poco los límites que los definen y diferencian.
            </p>
            <p>
              En los contextos rurales en proceso de urbanización, como el Resguardo Indígena La Trina, en Supía, Caldas, estas fuerzas de encuentro y tensión producen inevitables transformaciones culturales. Las mujeres indígenas y artesanas de JURU se encuentra con dinámicas contemporáneas del hacer artesanal atravesadas por la circulación digital, la estandarización y nuevas formas de participación y consumo.
            </p>
            <p>
              Este encuentro hace parte de la expansión urbana y de las dinámicas de aculturación que atraviesan a las comunidades étnicas asentadas en territorios rurales cada vez más próximos a los centros poblados. Esto no supone necesariamente la desaparición de una práctica frente a otra. Por el contrario, abre un campo de decisiones que invita a preguntarnos ¿qué conservar? - ¿qué transformar? - ¿qué incorporar y qué dejar por fuera?
            </p>
          </div>

          <figure className="evt-figure">
            <img
              src={instalacionColcha}
              alt="Sala de exhibición con fotografías en la pared y una mesa con una máquina de coser cubierta por una colcha de retazos de colores"
            />
          </figure>

          <div className="evt-text evt-text-final">
            <p>
              La obra se sitúa en ese espacio de interrelaciones. Un territorio que, como el tejido, no está completamente definido antes de ser construido, sino que emerge de cada cruce. Allí, las tecnologías no aparecen únicamente como agentes de transformación, sino como elementos que pueden ser apropiados, negociados o rechazados según los ritmos, saberes y necesidades de quienes producen. Territorios entramados parte de una pregunta sobre aquello que sucede cuando diferentes formas de hacer, habitar y producir se encuentran, se tensionan y se transforman. Un espacio donde aquello que parece desaparecer también puede estar dando origen a algo nuevo.
            </p>
          </div>

          <div className="evt-exit-wrap">
            <Link to="/" onClick={handleExit} className="evt-exit">Salir</Link>
          </div>
        </article>
      </div>
      </div>

      <div className="evt-curtain" aria-hidden="true" />
    </main>
  );
}
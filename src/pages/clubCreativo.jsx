import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Play } from "lucide-react";

// Logo que ya usas en Home
import juruLogo from "../images/juru-logo.png";

// Imágenes y video de Club Creativo — colócalos en src/images/dona/ con
// estos nombres de archivo (o cambia aquí la extensión si es otra).
import clubHeroFondo from "../images/clubCreativo_img/juru-club_fondo_mesa_manualidades.png";
import clubVideo from "../images/clubCreativo_img/juru-video_creativo.mp4";
import clubCajita from "../images/clubCreativo_img/juru-club_cajita_contenido_universo.png";
import clubTaller from "../images/clubCreativo_img/juru-club_taller_mujeres_manualidades.png";

const NAV_LINKS_IZQ = [{ label: "Sobre nosotros", href: "/#quienes-somos" }];
const NAV_LINKS_DER = [{ label: "Memorias", href: "/memorias" }];

const PLANES = [
  { id: "mensual", titulo: "Mensual", subtitulo: "Pago mes a mes", precio: "$ 99.000 cop / caja", tipo: "Pago mensual recurrente" },
  { id: "cuotas", titulo: "Anual", subtitulo: "Pago a cuotas", precio: "$ 89.000 cop / caja", tipo: "Pago mensual" },
  { id: "contado", titulo: "Anual", subtitulo: "de contado", precio: "$ 79.000 cop / caja", tipo: "Pago anual" },
];

const NOTAS = [
  "El libro físico completo se envía únicamente con la primera aportación. Las mensualidades siguientes no incluyen el libro.",
  "Cada mes recibirás un producto elaborado por las chicas (o en colaboración directa con ellas) y un mini-taller práctico diferente, con instructivo e implementos incluidos (La disponibilidad de productos y talleres puede variar según la capacidad de producción del mes).",
  "Las aportaciones se reciben durante todo el mes. El corte de producción y envío es el día 5 de cada mes. Todo lo recibido entre el día 6 del mes anterior y el día 5 del mes actual se incluye en ese ciclo. Los envíos se realizan en los 10 a 15 días hábiles siguientes al corte.",
  "El Club se reserva el derecho de modificar los productos o los talleres de un mes determinado según disponibilidad y capacidad de producción, manteniendo siempre el valor del kit.",
];

const EASE_FIGMA = "cubic-bezier(0.42, 0, 1, 1)";
const EASE_SLIDE = "cubic-bezier(0, 0, 0.58, 1)";

function Reveal({ children, className = "", delay = 0, duration = 500 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`juru-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms`, "--reveal-duration": `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// ---- Íconos de redes sociales (footer, igual que en home.jsx) ------------
const iconProps = {
  viewBox: "0 0 48 48",
  width: 46,
  height: 46,
  "aria-hidden": true,
  focusable: "false",
};

const IconInstagram = () => (
  <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="4">
    <rect x="5" y="5" width="38" height="38" rx="11" />
    <circle cx="24" cy="24" r="9" />
    <circle cx="35" cy="13" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg {...iconProps}>
    <circle cx="24" cy="24" r="22" fill="currentColor" />
    <path
      d="M26.5 41V27.5h4.4l.7-5.2h-5.1v-3.3c0-1.5.4-2.5 2.6-2.5h2.7V12c-.5-.1-2.1-.2-4-.2-4 0-6.6 2.4-6.6 6.8v3.7h-4.4v5.2h4.4V41z"
      fill="#272626"
    />
  </svg>
);

const IconWhatsapp = () => (
  <svg {...iconProps}>
    <path
      d="M24 5C13.5 5 5 13.5 5 24c0 3.6 1 7 2.8 9.9L5 43l9.4-2.7A19 19 0 0 0 24 43c10.5 0 19-8.5 19-19S34.5 5 24 5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 14.5c-.6 0-1.4.3-1.9 1-.7.9-1.4 2.2-.9 4 .8 2.9 3.2 6.2 6.4 8.7 3.2 2.4 6.1 3.2 8 2.7 1.3-.4 2.4-1.6 2.6-2.8.1-.5-.1-.8-.5-1l-3.4-1.6c-.4-.2-.8-.1-1.1.2l-1.3 1.5c-.2.2-.5.3-.8.2-1.8-.8-4.3-3-5.2-4.7-.1-.3-.1-.6.1-.8l1-1.3c.3-.4.3-.8.1-1.2L18.9 15c-.2-.3-.7-.5-1.4-.5z"
      fill="currentColor"
    />
  </svg>
);

// Enlaces de las redes: se mantienen los que ya tenía esta página.
const REDES = [
  { name: "Instagram", label: "@juru.marca", href: "https://instagram.com/jurumarca", external: true, Icon: IconInstagram },
  { name: "Facebook", label: "juru marca", href: "#", external: true, Icon: IconFacebook },
  { name: "WhatsApp", label: "315 55 555", href: "https://wa.me/57315555555", external: true, Icon: IconWhatsapp },
];

export default function ClubCreativo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [correo, setCorreo] = useState("");
  const [acepta, setAcepta] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    document.body.style.background = "#2A1408";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const reproducir = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play();
    setReproduciendo(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acepta) return;
    // TODO: conectar con tu servicio de suscripción
    console.log("Suscripción:", correo);
  };

  return (
    <main className="cc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Caveat:wght@400;600&family=Fredoka:wght@400;500&family=Judson:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500&display=swap');

        :root {
          --juru-cream: #F7F2E4;
          --juru-beige: #D8C5B8;
          --juru-brown: #5A2504;
          --juru-red: #8F4535;
          --juru-orange: #A34102;
          --juru-dark: #272626;
          --cc-bg: #2A1408;
          --cc-arena: #BD9882;
          --cc-lima: #d3da63;
          --cc-gris: #d9d9d9;
          --ease-figma: ${EASE_FIGMA};
          --ease-slide: ${EASE_SLIDE};
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { color: inherit; }
        button, input { font: inherit; }

        .cc-page {
          min-height: 100vh;
          overflow-x: hidden;
          background: var(--cc-bg);
          color: var(--juru-cream);
          font-family: 'Instrument Sans', sans-serif;
        }

        .juru-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity var(--reveal-duration, 500ms) var(--ease-figma),
            transform var(--reveal-duration, 500ms) var(--ease-slide);
          transition-delay: var(--reveal-delay, 0ms);
        }
        .juru-reveal.is-visible { opacity: 1; transform: translateY(0); }

        /* ---------------- HERO ---------------- */
        .cc-hero {
          position: relative;
          isolation: isolate;
          min-height: 600px;
          overflow: hidden;
          background-color: #4a4a2f;
          background-size: cover;
          background-position: center;
          color: white;
        }
        .cc-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(180deg, rgba(20,24,10,.35) 0%, rgba(20,24,10,.12) 45%, rgba(20,24,10,.2) 100%);
        }
        .cc-nav {
          position: relative;
          z-index: 5;
          height: 70px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 4.5vw;
          background: rgba(59,59,59,.28);
          backdrop-filter: blur(2px);
        }
        .cc-nav-logo { justify-self: start; }
        .cc-nav-right { justify-self: end; display: flex; align-items: center; }
        .cc-logo { width: 86px; height: auto; }
        .cc-links {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 34px;
          color: rgba(255,255,255,.92);
          font: 500 14px 'Fredoka', sans-serif;
        }
        .cc-links a {
          position: relative;
          text-decoration: none;
          transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .cc-links a::after {
          content: '';
          position: absolute;
          left: 0; bottom: -7px;
          width: 100%; height: 1px;
          background: rgba(255,255,255,.8);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease-slide);
        }
        .cc-links a:hover { opacity: .75; transform: translateY(-1px); }
        .cc-links a:hover::after { transform: scaleX(1); }
        .cc-pill {
          padding: 9px 22px;
          border-radius: 999px;
          background: var(--cc-lima);
          color: #272626;
          text-decoration: none;
          font: 400 14px 'Fredoka', sans-serif;
          white-space: nowrap;
          transition: filter 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .cc-pill:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .cc-menu-btn { display: none; border: 0; background: transparent; color: white; }

        .cc-hero-content {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 30px 5vw 60px 7vw;
          min-height: 530px;
        }
        /* Bloque del título: "Club" grande, "Creativo" más pequeño debajo y el
           subtítulo centrado respecto al bloque (sin ensancharlo). */
        .cc-titulo-bloque {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          margin-top: 30px;
        }
        .cc-title {
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font: 400 clamp(110px, 13vw, 200px)/.8 'Caveat Brush', cursive;
          color: #fff;
          transform: rotate(-6deg);
          transform-origin: left top;
        }
        .cc-title-creativo { font-size: .62em; margin-left: .45em; margin-top: .05em; }
        .cc-subtitle {
          width: 0;
          min-width: 100%;
          margin: 22px 0 0;
          font: 400 clamp(18px, 1.7vw, 26px)/1.15 'Caveat', cursive;
          text-align: center;
          text-wrap: balance;
          color: #fff;
          transform: rotate(-4deg);
        }
        .cc-video-col { display: flex; flex-direction: column; align-items: flex-end; padding-top: 110px; }
        .cc-video {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 7.4;
          background: #d3d3d3;
          overflow: hidden;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,.4);
        }
        .cc-video video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cc-play {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 84px; height: 84px;
          border-radius: 999px;
          border: 3px solid #fff;
          background: transparent;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 300ms var(--ease-slide), background 500ms var(--ease-figma);
        }
        .cc-play:hover { transform: scale(1.08); background: rgba(255,255,255,.18); }
        .cc-como { margin: 18px 40px 0 0; font: 400 26px 'Caveat', cursive; color: #fff; }

        /* ---------------- SUSCRÍBETE ---------------- */
        .cc-sub { text-align: center; padding: 48px 24px 90px; }
        .cc-sub h2 { margin: 0; font: 400 clamp(26px, 3.4vw, 38px) 'Judson', serif; color: var(--juru-cream); }
        .cc-sub p { margin: 6px 0 0; font: 400 13px 'Fredoka', sans-serif; }

        /* ---------------- CAJITA ---------------- */
        .cc-cajita { position: relative; line-height: 0; }
        .cc-cajita > img { width: 100%; display: block; aspect-ratio: 1439 / 776; object-fit: cover; }
        .cc-cajita-titulo {
          position: absolute;
          left: 2%; top: 76%;
          margin: 0;
          font: 400 clamp(14px, 2.6vw, 38px)/1 'Caveat Brush', cursive;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0,0,0,.25);
        }

        /* En escritorio el contenedor "desaparece" y cada texto se posiciona
           en % sobre la imagen (medidas tomadas de la imagen de 1439 px). */
        .cc-notas-cajita { display: contents; }
        .cc-nota {
          position: absolute;
          margin: 0;
          transform: translateX(-50%);
          font-family: 'Caveat', cursive;
          font-weight: 400;
          font-size: 1.737vw;      /* 25px sobre un ancho de 1439px */
          line-height: 1;          /* 100% */
          letter-spacing: 0;
          text-align: center;
          color: #3B3B3B;
          white-space: pre-line;
        }
        .cc-nota--libro { left: 21.9%; top: 11.3%; width: 22%; transform: translate(-50%, -100%); }
        .cc-nota--regalo-izq { left: 7.3%; top: 61.5%; width: 15%; }
        .cc-nota--kit { left: 88.5%; top: 26.4%; width: 18.5%; }
        .cc-nota--material { left: 90.3%; top: 59%; width: 17%; }
        .cc-nota--celular { left: 53%; bottom: 2%; width: 38%; }

        /* ---------------- PLANES ---------------- */
        .cc-planes { position: relative; padding: 0 0 130px; }
        .cc-planes-titulo {
          margin: 0;
          padding: 18px 8% 18px 0;
          text-align: right;
          font: 400 24px 'Caveat Brush', cursive;
          color: #fff;
        }
        .cc-planes-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(3, 238px);
          justify-content: center;
          gap: 41px;
          padding: 0 20px;
        }
        .cc-plan {
          height: 375px;
          padding: 40px 20px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: rgba(200,200,200,.82);
          color: #3b2a22;
          font: 400 12px 'Fredoka', sans-serif;
          transition: transform 300ms var(--ease-slide), background 500ms var(--ease-figma);
        }
        .cc-plan:hover { transform: translateY(-4px); background: rgba(210,210,210,.92); }
        .cc-plan-titulo { margin: 0; font: 500 22px/1 'Fredoka', sans-serif; color: #5c3b33; }
        .cc-plan-sub { margin: -2px 0 34px; font: 400 22px 'Caveat Brush', cursive; color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,.25); }
        .cc-plan-precio { margin: 0 0 28px; }
        .cc-plan-tipo { margin: 0 0 auto; }
        .cc-plan-envio { margin: 0 0 36px; max-width: 170px; }
        .cc-plan-btn {
          width: 122px;
          padding: 7px 0;
          border: 0;
          border-radius: 999px;
          background: var(--juru-red);
          color: #fff;
          font-size: 12px;
          cursor: pointer;
          transition: filter 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .cc-plan-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }

        .cc-detalle {
          position: relative;
          display: grid;
          grid-template-columns: 370px 1fr;
          gap: 130px;
          margin-top: -167px;
          align-items: start;
        }
        .cc-foto { position: relative; z-index: 1; width: 370px; height: 610px; object-fit: cover; display: block; }
        /* Bloque "Términos y condiciones": el margen superior que antes tenía la
           lista ahora lo tiene el bloque, para que el título quede arriba. */
        .cc-terminos { margin-top: 270px; }
        .cc-terminos-titulo {
          margin: 0 0 14px;
          font: 400 24px/1.2 'Fredoka', sans-serif;
          color: var(--juru-cream);
        }
        .cc-notas {
          list-style: none;
          margin: 0;
          padding: 0;
          width: min(100%, 435px);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cc-notas li {
          padding: 8px 11px;
          background: var(--cc-gris);
          color: #3b2a22;
          font: 400 9px/1.35 'Instrument Sans', sans-serif;
        }

        /* ---------------- NEWSLETTER ---------------- */
        .cc-news {
          position: relative;
          min-height: 230px;
          padding: 70px 0 120px 68px;
          background: var(--cc-arena);
          color: var(--juru-brown);
        }
        .cc-news-circulo {
          position: absolute;
          top: -90px; right: -60px;
          width: 270px; height: 270px;
          border-radius: 50%;
          background: #b8470c;
          z-index: 3;
          transition: transform 500ms var(--ease-slide);
        }
        .cc-news:hover .cc-news-circulo { transform: scale(1.05); }
        .cc-news-inner { position: relative; z-index: 2; max-width: 520px; }
        .cc-news h2 { margin: 0; text-align: center; font: 400 clamp(30px, 3.4vw, 40px)/1.5 'Caveat Brush', cursive; color: #6b2a12; }
        .cc-form-campo {
          display: flex;
          margin-top: 26px;
          width: 100%;
          height: 44px;
          border-radius: 999px;
          overflow: hidden;
          background: var(--cc-gris);
        }
        .cc-form-campo input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          padding: 0 24px;
          text-align: center;
          font: 400 12px 'Fredoka', sans-serif;
          color: #3b2a22;
        }
        .cc-form-campo button {
          padding: 0 30px;
          border: 0;
          border-radius: 999px;
          background: var(--juru-red);
          color: #fff;
          font: 400 12px 'Fredoka', sans-serif;
          cursor: pointer;
          transition: filter 500ms var(--ease-figma);
        }
        .cc-form-campo button:hover { filter: brightness(1.1); }

        /* ---------------- FOOTER (igual al de home.jsx) ---------------- */
        .cc-footer {
          position: relative;
          z-index: 4;
          margin-top: -48px;
          padding: 64px 8vw 34px;
          border-radius: 50px 50px 0 0;
          background: var(--juru-dark);
          color: #FFEAEA;
          font-family: 'Alevia DEMO', 'Judson', serif;
        }
        .cc-footer-main {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 60px;
          align-items: start;
        }
        .cc-footer-left { max-width: 640px; }
        .cc-footer-consent {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          cursor: pointer;
          font: 400 15px/1.45 'Alevia DEMO', 'Judson', serif;
        }
        .cc-footer-consent input {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          margin: 2px 0 0;
          accent-color: var(--juru-red);
          cursor: pointer;
        }
        .cc-footer-social {
          display: flex;
          flex-wrap: wrap;
          gap: 44px;
          margin: 40px 0 0;
          padding: 0;
          list-style: none;
        }
        .cc-footer-social a {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #FFEAEA;
          text-decoration: none;
          font: 400 14px 'Alevia DEMO', 'Judson', serif;
          transition: transform 300ms var(--ease-slide), opacity 500ms var(--ease-figma);
        }
        .cc-footer-social a:hover { transform: translateY(-4px); opacity: .8; }
        .cc-footer-support { text-align: center; }
        .cc-footer-support-title { margin: 0 0 20px; font: 400 15px 'Alevia DEMO', 'Judson', serif; }
        .cc-footer-support a {
          display: block;
          width: fit-content;
          margin: 0 auto 12px;
          color: #FFEAEA;
          text-decoration: none;
          font: 400 15px 'Alevia DEMO', 'Judson', serif;
          transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .cc-footer-support a:hover { opacity: .65; transform: translateX(3px); }
        .cc-footer-line {
          height: 1px;
          margin: 44px 0 26px;
          background: linear-gradient(90deg, rgba(189,152,130,0), rgba(189,152,130,.7) 15%, rgba(189,152,130,.7) 85%, rgba(189,152,130,0));
        }
        .cc-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .cc-footer-logo { width: 90px; height: auto; display: block; }
        .cc-footer-credit { margin: 0; color: #FFEAEA; opacity: .85; font: 400 15px 'Alevia DEMO', 'Judson', serif; }
        .cc-footer a:focus-visible, .cc-footer-consent input:focus-visible { outline: 2px solid #d3da63; outline-offset: 4px; }

        /* ---------------- MENÚ MÓVIL ---------------- */
        .cc-overlay { position: fixed; inset: 0; z-index: 50; background: #1F1B14; color: white; display: flex; flex-direction: column; animation: ccMenuIn 300ms var(--ease-slide) both; }
        @keyframes ccMenuIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .cc-overlay-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; }
        .cc-overlay nav { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; font: 400 28px 'Judson', serif; }
        .cc-overlay nav a { text-decoration: none; transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide); }
        .cc-overlay nav a:hover { opacity: .65; transform: translateX(5px); }

        /* ---------------- RESPONSIVE ---------------- */
        @media (max-width: 1000px) {
          .cc-links, .cc-pill { display: none; }
          .cc-menu-btn { display: block; }
          .cc-hero-content { grid-template-columns: 1fr; padding: 10px 24px 40px; }
          .cc-video-col { padding-top: 10px; }
          /* En pantallas pequeñas los textos pasan debajo de la imagen */
          .cc-notas-cajita { display: grid; gap: 18px; padding: 28px 24px; background: #E3D6C4; }
          .cc-cajita .cc-nota { position: static; transform: none; width: auto; max-width: 520px; margin: 0 auto; font-size: 22px; line-height: 1.15; }
          .cc-planes-grid { grid-template-columns: minmax(230px, 340px); }
          .cc-plan { height: auto; min-height: 340px; }
          .cc-detalle { grid-template-columns: 1fr; gap: 24px; margin-top: 40px; padding: 0 20px; }
          .cc-foto { width: 100%; height: 360px; }
          .cc-terminos { margin-top: 0; }
          .cc-terminos-titulo { font-size: 22px; }
          .cc-notas { margin-top: 0; width: 100%; }
          .cc-notas li { font-size: 12px; padding: 10px 12px; }
          .cc-news { padding: 60px 24px 90px; }
          .cc-news-circulo { width: 140px; height: 140px; top: -50px; right: -30px; }
          .cc-footer-main { grid-template-columns: 1fr; gap: 44px; }
          .cc-footer-support { text-align: left; }
          .cc-footer-support a { margin-left: 0; }
        }

        @media (max-width: 560px) {
          .cc-nav { padding: 0 20px; }
          .cc-logo { width: 74px; }
          .cc-title { font-size: 100px; }
          .cc-footer { padding: 48px 24px 28px; border-radius: 36px 36px 0 0; }
          .cc-footer-social { gap: 28px; }
          .cc-footer-bottom { flex-direction: column; align-items: flex-start; }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* ------------------------- HERO ------------------------- */}
      <section className="cc-hero" aria-label="Club Creativo" style={{ backgroundImage: `url(${clubHeroFondo})` }}>
        <header className="cc-nav">
          <div className="cc-nav-logo">
            <Link to="/" aria-label="JURU inicio">
              <img className="cc-logo" src={juruLogo} alt="JURU" />
            </Link>
          </div>

          <nav className="cc-links" aria-label="Navegación principal">
            {NAV_LINKS_IZQ.map((item) => (
              <a key={item.label} href={item.href}>{item.label}</a>
            ))}
            <Link to="/vive">Vive</Link>
            <Link to="/voces">Voces</Link>
            {NAV_LINKS_DER.map((item) => (
              <a key={item.label} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <div className="cc-nav-right">
            <a href="#planes" className="cc-pill">Club Creativo</a>
            <button className="cc-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
              <Menu size={27} />
            </button>
          </div>
        </header>

        <div className="cc-hero-content">
          <Reveal>
            <div className="cc-titulo-bloque">
              <h1 className="cc-title">
                <span className="cc-title-club">Club</span>
                <span className="cc-title-creativo">Creativo</span>
              </h1>
              <p className="cc-subtitle">Un espacio para quienes quieren ir más allá y ser parte de la inmersión total Juru</p>
            </div>
          </Reveal>

          <Reveal delay={150} className="cc-video-col">
            <div className="cc-video">
              <video
                ref={videoRef}
                src={clubVideo}
                playsInline
                controls={reproduciendo}
                onEnded={() => setReproduciendo(false)}
              />
              {!reproduciendo && (
                <button className="cc-play" onClick={reproducir} aria-label="Reproducir video">
                  <Play size={34} fill="currentColor" />
                </button>
              )}
            </div>
            <span className="cc-como">¿cómo funciona?</span>
          </Reveal>
        </div>
      </section>

      {menuOpen && (
        <div className="cc-overlay">
          <div className="cc-overlay-head">
            <img src={juruLogo} alt="JURU" className="cc-logo" />
            <button className="cc-menu-btn" style={{ display: "block" }} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
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
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <a href="#planes" onClick={() => setMenuOpen(false)}>Club Creativo</a>
          </nav>
        </div>
      )}

      {/* ---------------------- SUSCRÍBETE ---------------------- */}
      <section className="cc-sub">
        <Reveal>
          <h2>Suscríbete para recibir tu cajita especial</h2>
          <p>*Todos los 15 de cada mes podrás recibirla*</p>
        </Reveal>
      </section>

      {/* ------------------- CAJITA / UNIVERSO ------------------- */}
      <section className="cc-cajita" aria-label="Contenido de la cajita">
        <img src={clubCajita} alt="Contenido de la cajita del Club Creativo JURU" />
        <h3 className="cc-cajita-titulo">¡Sumérgete en el universo Juru!</h3>
        <div className="cc-notas-cajita">
          <p className="cc-nota cc-nota--libro">
            Es el libro completo que recibe la persona con su primera aportación.
          </p>
          <p className="cc-nota cc-nota--regalo-izq">Un producto elaborado por las artesanas</p>
          <p className="cc-nota cc-nota--kit">
            Kit del mini-taller: materiales textiles, hilos, pequeñas piezas de cuero, aguja/herramientas, instructivo, una pequeña plantilla
          </p>
          <p className="cc-nota cc-nota--material">
            {"Material complementario\nAparecen pequeñas tarjetas/fotografías que podrían convertirse en: fragmentos de sus relatos y tarjetas sobre materiales y técnicas"}
          </p>
          <p className="cc-nota cc-nota--celular">
            {"El celular muestra una experiencia audiovisual de JURU.\npuedes acceder a contenidos digitales complementarios."}
          </p>
        </div>
      </section>

      {/* ------------------- PLANES Y PRECIOS ------------------- */}
      <section id="planes" className="cc-planes">
        <h2 className="cc-planes-titulo">Planes y precios</h2>

        <div className="cc-planes-grid">
          {PLANES.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <article className="cc-plan">
                <h3 className="cc-plan-titulo">{p.titulo}</h3>
                <p className="cc-plan-sub">{p.subtitulo}</p>
                <p className="cc-plan-precio">{p.precio}</p>
                <p className="cc-plan-tipo">{p.tipo}</p>
                <p className="cc-plan-envio">Incluimos el costo de envío a nivel nacional</p>
                <button className="cc-plan-btn" type="button">Suscríbete</button>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="cc-detalle">
          <img className="cc-foto" src={clubTaller} alt="Mujeres artesanas en un taller creativo" />
          <Reveal className="cc-terminos">
            <h3 className="cc-terminos-titulo">Términos y condiciones</h3>
            <ul className="cc-notas">
              {NOTAS.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------------------- NEWSLETTER ---------------------- */}
      <section className="cc-news">
        <div className="cc-news-circulo" aria-hidden="true" />
        <div className="cc-news-inner">
          <Reveal>
            <h2>¡Toma la iniciativa y entérate de <br />todo lo nuevo!</h2>
            <form id="cc-newsletter-form" onSubmit={handleSubmit}>
              <div className="cc-form-campo">
                <input
                  type="email"
                  required
                  placeholder="Ingresa tu correo aquí"
                  aria-label="Correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
                <button type="submit">Suscríbete</button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ------------------------ FOOTER ------------------------ */}
      <footer className="cc-footer">
        <div className="cc-footer-main">
          <div className="cc-footer-left">
            <label className="cc-footer-consent">
              <input
                type="checkbox"
                form="cc-newsletter-form"
                required
                checked={acepta}
                onChange={(e) => setAcepta(e.target.checked)}
              />
              <span>
                Declaro que la información obtenida para el tratamiento de mis datos personales la he suministrado de forma automática y/o manual y es verídica.
              </span>
            </label>

            <ul className="cc-footer-social" aria-label="Redes sociales">
              {REDES.map(({ name, label, href, external, Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    aria-label={name}
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    <Icon />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="cc-footer-support">
            <p className="cc-footer-support-title">Alternativas de apoyo</p>
            <a href="/#dona">Compra</a>
            <a href="/#dona">Dona</a>
            <a href="#">Comparte</a>
          </div>
        </div>

        <div className="cc-footer-line" />

        <div className="cc-footer-bottom">
          <img src={juruLogo} alt="JURU" className="cc-footer-logo" />
          <p className="cc-footer-credit">Este sitio está diseñado con todo el 🤍 por Edna Design</p>
        </div>
      </footer>
    </main>
  );
}
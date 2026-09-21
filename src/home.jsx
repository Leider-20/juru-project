import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, MessageCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import juruLogo from "./images/juru-logo.png";
import juruHierbas from "./images/juru-hierbas.png";
import juruTerritorio from "./images/juru-territorio.png";
import juruHerramientas from "./images/juru-herramientas.png";
import juruTaller from "./images/juru-taller.jpg";
import juruMaquina from "./images/juru-maquina.png";
import testimonioFoto from "./images/juru-testimonio.png";
import novedadEventos from "./images/juru-evento.png";
import novedadProductos from "./images/juru-producto.png";
import novedadLibro from "./images/juru-libro.png";
import texturaTopografica from "./images/juru-lineas.png";
import ilustracionFamilia from "./images/juru-familia.png";

// Retratos de las mujeres de JURU — colócalos en src/images/ con estos
// nombres de archivo (o cambia las rutas de abajo por las tuyas).
import per1 from "./images/per_1.jpeg";
import per2 from "./images/per_2.jpeg";
import per3 from "./images/per_3.jpeg";
import per4 from "./images/per_4.jpeg";
import per5 from "./images/per_5.jpeg";

// Nota: el orden real del menú (Sobre nosotros, Vive, Dona, Memorias, Voces)
// se arma directamente en el header, porque "Dona" (un pill-link) va en
// medio de esta lista, no al final.
const NAV_LINKS_IZQ = [
  { label: "Sobre nosotros", href: "#quienes-somos" },
  { label: "Vive", href: "#historia" },
];
const NAV_LINKS_DER = [{ label: "Memorias", href: "#novedades" }];

const GALLERY = [
  { src: juruHierbas, alt: "Ofrenda de hierbas y flores sobre tela" },
  { src: juruTaller, alt: "Mujeres alrededor de una mesa haciendo manualidades" },
  { src: juruMaquina, alt: "Máquina de coser bajo un techo de zinc" },
];

// Retratos que se muestran en la sección "¿Quiénes somos?" — los rostros
// reales detrás de JURU.
const ARTESANAS = [
  { src: per2, alt: "Artesana de JURU 1" },
  { src: per1, alt: "Artesana de JURU 2" },
  { src: per3, alt: "Artesana de JURU 3" },
  { src: per4, alt: "Artesana de JURU 4" },
  { src: per5, alt: "Artesana de JURU 5" },
];

const TESTIMONIOS = [
  {
    foto: testimonioFoto,
    texto: "Somos un grupo de mujeres empoderadas, que hemos trabajado con dedicación, un proceso lleno de sentimientos por cada producto cocido y tejido a mano.",
    autora: "Deyanira Salazar",
  },
];

const NOVEDADES = [
  {
    badge: "Eventos",
    badgeColor: "#A34102",
    img: novedadEventos,
    texto:
      "Tuvimos la oportunidad de hacer parte del XIV Simposio internacional de Diseño y Cultura en @fadpcali. Hablamos un poco de cómo los contextos rurales en proceso de urbanización producen transformaciones culturales dentro de JURU.",
    href: "#",
  },
  {
    badge: "Nuestros Productos",
    badgeColor: "#B07404",
    img: novedadProductos,
    texto:
      "Piezas hechas con tiempo, dedicación y saber: bolsos, prendas y accesorios que llevan parte de nuestra historia.",
    href: "#",
  },
  {
    badge: "Libro",
    badgeColor: "#2F3100",
    img: novedadLibro,
    texto:
      "Memorias: un recorrido en papel por las historias y las manos detrás de cada pieza de JURU.",
    href: "#",
  },
];

// Puntos del "camino" decorativo del mapa, en coordenadas de un viewBox
// 0 0 400 900. El trazado se bifurca en el punto 3.1: una rama baja
// directo (2.3 → 2.2 → 2.1) y la otra da la vuelta por la derecha
// (3.2 → JURU → 4.9 → 4.3 → 4.2 → 4.1), y ambas se reencuentran en el
// punto 1.3 antes de continuar juntas hacia el final.
const PUNTOS = {
  inicio: { x: 20, y: 16, isEnd: true },
  p31: {
    x: 108, y: 50, label: "3.1",
    detalle: { titulo: "Relato 3.1", texto: "La molienda es el lugar donde se transforma la caña de azúcar en panela. Es el sustento económico y cultural de muchas familias.", img: 1 },
  },
  p23: {
    x: 15, y: 152, label: "2.3",
    detalle: { titulo: "Relato 2.3", texto: "Historias de trabajo y saberes de la comunidad.", img: 2 },
  },
  p32: {
    x: 200, y: 141, label: "3.2",
    detalle: { titulo: "Relato 3.2", texto: "Un momento compartido entre mujeres de la red.", img: 0 },
  },
  juru: { x: 289, y: 148, label: "JURU", isPin: true },
  p49: {
    x: 386, y: 163, label: "4.9",
    inactivo: true,
    detalle: { titulo: "Relato 4.9", texto: "Este relato todavía no está disponible.", img: 0 },
  },
  p22: {
    x: 96, y: 246, label: "2.2",
    detalle: { titulo: "Relato 2.2", texto: "Un oficio aprendido y transmitido con las manos.", img: 1 },
  },
  p43: {
    x: 316, y: 352, label: "4.3",
    detalle: { titulo: "Relato 4.3", texto: "Una historia de sororidad y comunidad.", img: 2 },
  },
  p21: {
    x: 131, y: 398, label: "2.1",
    detalle: { titulo: "Relato 2.1", texto: "El inicio de un camino propio de trabajo.", img: 0 },
  },
  p13: {
    x: 196, y: 512, label: "1.3",
    detalle: { titulo: "Relato 1.3", texto: "Una reflexión íntima sobre lo que somos.", img: 1 },
  },
  p42: {
    x: 366, y: 518, label: "4.2",
    detalle: { titulo: "Relato 4.2", texto: "Apoyo entre mujeres en momentos difíciles.", img: 2 },
  },
  p41: {
    x: 272, y: 584, label: "4.1",
    detalle: { titulo: "Relato 4.1", texto: "El primer paso para pedir o dar una mano.", img: 0 },
  },
  p12: {
    x: 171, y: 678, label: "1.2",
    detalle: { titulo: "Relato 1.2", texto: "Un momento para sí misma, entre tantos días.", img: 1 },
  },
  p11: {
    x: 171, y: 782, label: "1.1",
    detalle: { titulo: "Relato 1.1", texto: "Quién es ella, contado con sus propias palabras.", img: 2 },
  },
  fin: { x: 159, y: 892, isEnd: true },
};

const RUTA = Object.values(PUNTOS);
const TRONCO = [PUNTOS.inicio, PUNTOS.p31, PUNTOS.p23, PUNTOS.p22, PUNTOS.p21, PUNTOS.p13, PUNTOS.p12, PUNTOS.p11, PUNTOS.fin];
const LAZO = [PUNTOS.p31, PUNTOS.p32, PUNTOS.p49, PUNTOS.p43, PUNTOS.p42, PUNTOS.p41, PUNTOS.p13];

function routePath(points) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x} ${midY} ${midX} ${midY} Q ${curr.x} ${midY} ${curr.x} ${curr.y}`;
  }
  return d;
}

const EASE_FIGMA = "cubic-bezier(0.42, 0, 1, 1)";
const EASE_SLIDE = "cubic-bezier(0, 0, 0.58, 1)";

// Transiciones tomadas de los estados de Figma compartidos:
// 300ms con cubic-bezier(0,0,0.58,1) para entradas/zoom y 500ms con
// cubic-bezier(0.42,0,1,1) para opacidad, color y desplazamientos suaves.


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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [faceIdx, setFaceIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState(1); // arranca mostrando el punto 3.1

  // ---- Scroll-pinned "tarjetas apiladas" ---------------------------------
  const MAX_DIST = 2;         // a partir de esta distancia, el efecto ya no crece más
  const MAX_SHRINK = 0.45;    // encogimiento máximo (scale mínimo = 1 - esto = 0.55)
  const MAX_BLUR = 6;         // blur máximo en px
  const PEEK_PERCENT = 14;    // % del panel que se deja siempre visible de cada tarjeta ya pasada

  const galleryWrapRef = useRef(null);
  const [scales, setScales] = useState(GALLERY.map(() => 1));
  const [blurs, setBlurs] = useState(GALLERY.map(() => 0));
  const [translateYs, setTranslateYs] = useState(GALLERY.map((_, i) => (i === 0 ? 0 : 100)));

  const goToFace = (i) => setFaceIdx((i + ARTESANAS.length) % ARTESANAS.length);
  const prevFace = () => goToFace(faceIdx - 1);
  const nextFace = () => goToFace(faceIdx + 1);

  // Deslizar con el dedo (o arrastrar con el mouse) sobre la foto del
  // testimonio para cambiar de artesana, además de los puntos y las
  // flechas. Solo guardamos dónde empezó el toque; al soltar, comparamos
  // contra dónde terminó para decidir si fue un swipe válido.
  const touchStartX = useRef(null);
  const onTestimonialTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTestimonialTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 50; // px mínimos para contar como swipe, no un toque accidental
    if (delta > SWIPE_THRESHOLD) prevFace();
    else if (delta < -SWIPE_THRESHOLD) nextFace();
    touchStartX.current = null;
  };

  // El resaltado tipo "pill" es simplemente "qué ítem del menú
  // corresponde a dónde estás". Por defecto, estando en esta página,
  // corresponde a "Sobre nosotros" — y cambia al que toques.
  const [activeNav, setActiveNav] = useState("#quienes-somos");
  const navClass = (href) => (href === activeNav ? "nav-active" : "");

  useEffect(() => {
    let ticking = false;

    const compute = () => {
      ticking = false;
      const wrap = galleryWrapRef.current;
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      const progress = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));

      const n = GALLERY.length;
      const floatIndex = progress * (n - 1);

      // ENTRADA EN PILA: cada tarjeta tiene su propio "cajón" fijo dentro
      // de la pila: la tarjeta i, una vez que llega, se queda para
      // siempre en translateY = i * PEEK_PERCENT. Como el z-index es
      // ascendente por índice, cada una tapa a todas las anteriores
      // excepto por esa franja — así se ven TODAS las tarjetas ya
      // pasadas al mismo tiempo, apiladas, no solo la inmediata anterior.
      const nextTranslateYs = GALLERY.map((_, i) => {
        const target = i * PEEK_PERCENT;
        const entrada = Math.min(Math.max(floatIndex - (i - 1), 0), 1);
        return 100 - entrada * (100 - target);
      });

      // RETIRADA: una vez que una tarjeta ya fue cubierta por la
      // siguiente, se encoge y difumina (transform-origin arriba, por
      // eso el borde superior se queda fijo y es lo único que asoma).
      const dist = GALLERY.map((_, i) => Math.min(Math.max(floatIndex - i, 0), MAX_DIST) / MAX_DIST);

      setScales(dist.map((t) => 1 - t * MAX_SHRINK));
      setBlurs(dist.map((t) => t * MAX_BLUR));
      setTranslateYs(nextTranslateYs);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(compute);
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.background = "#F7F2E4";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <main className="juru-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500&family=Judson:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500&display=swap');

        :root {
          --juru-cream: #F7F2E4;
          --juru-paper: #EEEBE4;
          --juru-beige: #D8C5B8;
          --juru-beige-2: #D0B6A6;
          --juru-brown: #5A2504;
          --juru-text: #574747;
          --juru-olive: #6C6C2C;
          --juru-red: #8F4535;
          --juru-orange: #A34102;
          --juru-dark: #272626;
          --juru-footer: #1F1B14;
          --ease-figma: ${EASE_FIGMA};
          --ease-slide: ${EASE_SLIDE};
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { color: inherit; }
        button, input { font: inherit; }

        .juru-page {
          min-height: 100vh;
          overflow-x: hidden;
          background: var(--juru-cream);
          color: var(--juru-brown);
          font-family: 'Instrument Sans', sans-serif;
        }

        .juru-display { font-family: 'Alevia DEMO', 'Judson', serif; font-weight: 400; }
        .juru-body { font-family: 'Fredoka', sans-serif; font-weight: 400; }
        .juru-judson { font-family: 'Judson', serif; font-weight: 400; }

        .juru-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity var(--reveal-duration, 500ms) var(--ease-figma),
            transform var(--reveal-duration, 500ms) var(--ease-slide);
          transition-delay: var(--reveal-delay, 0ms);
        }
        .juru-reveal.is-visible { opacity: 1; transform: translateY(0); }

        .hero {
          position: relative;
          height: min(100vh, 820px);
          min-height: 650px;
          overflow: hidden;
          color: white;
        }
        .hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .hero-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(20,24,10,.28) 0%, rgba(20,24,10,.18) 45%, rgba(20,24,10,.48) 100%);
        }
        .hero-fade {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 170px;
          background: linear-gradient(180deg, rgba(247,242,228,0) 0%, var(--juru-cream) 100%);
          pointer-events: none;
        }
        .hero-nav {
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
        .hero-nav-logo { justify-self: start; }
        .hero-nav-spacer { justify-self: end; }
        .hero-logo { width: 86px; height: auto; }
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
        /* Relleno sobre el ítem de la sección que se está viendo ahora
           mismo — mismo look del pill de "Dona", pero calculado en vivo
           según qué sección está en pantalla (ver activeSection más abajo
           en el componente). */
        .hero-links a.nav-active {
          padding: 9px 22px;
          background: rgba(217,217,217,.46);
          border-radius: 999px;
        }
        .hero-links a.nav-active::after { display: none; }
        .mobile-menu-button { display: none; border: 0; background: transparent; color: white; }

        .hero-content {
          position: relative;
          z-index: 3;
          height: calc(100% - 70px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 20px 80px;
        }
        .hero-kicker {
          margin: 0 0 10px;
          color: white;
          font: 400 30px 'Alevia DEMO', 'Judson', serif;
          letter-spacing: .01em;
        }
        .hero-title {
          margin-bottom: 28px;
          max-width: 760px;
          margin: 0 auto 40px;   /* separa el título del botón */
          color: white;
          font: 400 40px/1.28 'Alevia DEMO', 'Judson', serif;
        }
        .hero-cta {
          margin-top: 0px;
          min-width: 260px;
          padding: 12px 30px;
          border: 1px solid white;
          border-radius: 20px;
          color: white;
          text-decoration: none;
          font: 500 20px 'Fredoka', sans-serif;
          box-shadow: 0 4px 20px rgba(0,0,0,.25);
          transition: background 500ms var(--ease-figma), color 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .hero-cta:hover { background: rgba(217,217,217,.46); transform: translateY(-2px); }

        .intro {
          position: relative;
          padding: 65px 24px 50px;
          text-align: center;
          overflow: hidden;
        }
        .intro::before,
        .who::before,
        .territory::before {
          content: '';
          position: absolute;
          pointer-events: none;
          width: 900px; height: 900px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(216,197,184,.34) 0%, rgba(216,197,184,0) 68%);
          transform: translate(-55%, 10%);
        }
        .intro-small {
          margin: 0 0 5px;
          color: #52524F;
          font: 400 30px 'Judson', serif;
        }
        .intro-large {
          max-width: 700px;
          margin: 0 auto;
          color: #52524F;
          font: 400 35px/1.15 'Judson', serif;
        }

        .gallery-wrap {
          position: relative;
          height: 290vh;
        }
        .gallery-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          min-height: 650px;
          padding: 30px 5vw 75px;
        }
        .gallery-stack {
          position: relative;
          height: 100%;
          max-width: 1240px;
          margin: 0 auto;
        }
        .gallery-card {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 50px;
          background: #ddd;
          box-shadow: 0 30px 60px -15px rgba(20,24,10,.35);
          transform-origin: 50% 0;
          will-change: transform, filter;
          transition: transform 0.05s linear, filter 0.05s linear;
        }
        .gallery-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 300ms var(--ease-slide); }
        .gallery-card:hover img { transform: scale(1.025); }
        .gallery-fade {
          position: absolute;
          z-index: 20;
          left: 0; right: 0; bottom: 0;
          height: 130px;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(247,242,228,0) 0%, var(--juru-cream) 100%);
        }

        .who {
          position: relative;
          padding: 70px 24px 85px;
          overflow: hidden;
          background: var(--juru-cream);
        }
        .who-inner { position: relative; max-width: 1080px; margin: 0 auto; }
        .who-heading {
          margin: 0 0 34px;
          text-align: right;
          color: var(--juru-brown);
          font: 400 50px 'Alevia DEMO', 'Judson', serif;
        }
        .who-layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 70px;
          align-items: start;
        }
        .who-art { width: 100%; max-width: 230px; margin: 15px auto 0; opacity: .85; }
        .who-copy {
          color: var(--juru-text);
          font: 400 30px/1.35 'Fredoka', sans-serif;
        }
        .who-copy p { margin: 0 0 22px; }

        .who-slider {
          position: relative;
          width: 280px;
          max-width: 100%;
          margin: 30px auto 44px;
        }
        .who-slider-viewport {
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 18px 30px -12px rgba(90,37,4,.35);
          background: #ddd;
        }
        .who-slider-track {
          display: flex;
          transition: transform 500ms var(--ease-slide);
        }
        .who-slide {
          flex-shrink: 0;
          height: 360px;
        }
        .who-slide img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .who-slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 38px; height: 38px;
          border-radius: 999px;
          border: none;
          background: rgba(255,255,255,.85);
          color: var(--juru-brown);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(90,37,4,.25);
          transition: background 300ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .who-slider-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.06); }
        .who-slider-prev { left: -14px; }
        .who-slider-next { right: -14px; }
        .who-slider-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
        }
        .dot-dark {
          width: 10px; height: 10px;
          border-radius: 999px;
          border: 1px solid var(--juru-brown);
          background: transparent;
          padding: 0;
          cursor: pointer;
          transition: background-color 300ms var(--ease-figma);
        }
        .dot-dark.active { background: var(--juru-brown); }

        .testimonial {
          position: relative;
          height: 610px;
          min-height: 520px;
          overflow: hidden;
        }
        .testimonial img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .testimonial::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(20,16,10,.76) 0%, rgba(20,16,10,.34) 45%, rgba(20,16,10,.08) 100%);
        }
        .testimonial-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 40px 9vw;
        }
        .testimonial-copy { max-width: 680px; }
        .testimonial-text {
          margin: 0 0 34px;
          color: white;
          font: 400 40px/1.15 'Alevia DEMO', 'Judson', serif;
        }
        .testimonial-author {
          margin: 0;
          color: rgba(255,255,255,.73);
          font: 400 40px 'Alevia DEMO', 'Judson', serif;
        }
        .dots {
          position: absolute;
          z-index: 3;
          bottom: 20px;
          left: 0; right: 0;
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .dot { width: 13px; height: 13px; border-radius: 999px; border: 1px solid white; background: rgba(217,217,217,.46); padding: 0; }
        .dot.active { background: #D9D9D9; }
        .testimonial-arrow {
          position: absolute;
          top: 50%;
          z-index: 3;
          transform: translateY(-50%);
          width: 44px; height: 44px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.55);
          background: rgba(59,59,59,.35);
          backdrop-filter: blur(2px);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 300ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .testimonial-arrow:hover { background: rgba(217,217,217,.46); }
        .testimonial-arrow-prev { left: 20px; }
        .testimonial-arrow-next { right: 20px; }
        @media (max-width: 560px) {
          .testimonial-arrow { width: 38px; height: 38px; }
          .testimonial-arrow-prev { left: 12px; }
          .testimonial-arrow-next { right: 12px; }
        }

        .territory {
          position: relative;
          overflow: hidden;
          padding: 70px 5vw 100px;
          background: linear-gradient(180deg, #F4EFE3 0%, #D8C5B8 100%);
        }
        .territory-texture {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: .42;
          pointer-events: none;
          mix-blend-mode: multiply;
        }
        .territory-head { position: relative; z-index: 1; text-align: center; margin-bottom: 58px; }
        .territory-kicker { margin: 0; color: var(--juru-brown); font: 400 50px 'Alevia DEMO', 'Judson', serif; }
        .territory-title { margin: -2px 0 6px; color: var(--juru-brown); font: 400 80px/.95 'Alevia DEMO', 'Judson', serif; }
        .territory-link { display: inline-flex; align-items: center; gap: 6px; color: var(--juru-brown); font: 400 20px 'Alevia DEMO', 'Judson', serif; text-decoration: none; transition: gap 300ms var(--ease-slide); }
        .territory-link:hover { gap: 12px; }
        .territory-grid {
          position: relative; z-index: 1;
          max-width: 1190px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 60px;
          align-items: center;
        }
        .territory-data { color: var(--juru-brown); font: 400 20px/1.35 'Alevia DEMO', 'Judson', serif; }
        .territory-illustration { display: block; object-fit: contain; }
        .territory-illustration-house { width: 235px; max-width: 100%; margin: -5px auto 20px; opacity: .9; }
        .territory-illustration-tools { width: 250px; max-width: 100%; margin: 12px auto 0; opacity: .9; }
        .territory-quote { margin: 0 0 34px; max-width: 250px; }
        .route-data { margin: 0 0 32px; }
        .numbers { display: flex; gap: 28px; align-items: flex-start; margin: 10px 0 35px; }
        .number { margin: 0; font: 400 100px/.78 'Alevia DEMO', 'Judson', serif; }
        .number-label { margin: 12px 0 0; max-width: 110px; font: 400 20px/1.05 'Alevia DEMO', 'Judson', serif; }
        .territory-map {
          position: relative;
          min-height: 650px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .territory-map img {
          width: min(100%, 850px);
          max-height: 850px;
          object-fit: contain;
          filter: drop-shadow(0 30px 40px rgba(90,37,4,.08));
          transition: transform 500ms var(--ease-slide);
        }
        .territory-map:hover img { transform: scale(1.015); }

        .map-svg {
          width: min(100%, 420px);
          height: auto;
          display: block;
          margin: 0 auto;
          filter: drop-shadow(0 20px 30px rgba(90,37,4,.1));
        }
        .map-path {
          fill: none;
          stroke: var(--juru-olive);
          stroke-width: 3;
          stroke-linecap: round;
          opacity: .55;
        }
        .map-point circle {
          fill: var(--juru-cream);
          stroke: var(--juru-brown);
          stroke-width: 2;
          cursor: pointer;
          transition: fill 300ms var(--ease-figma), transform 300ms var(--ease-slide);
          transform-box: fill-box;
          transform-origin: center;
        }
        .map-point text {
          font: 400 13px 'Alevia DEMO', 'Judson', serif;
          fill: var(--juru-brown);
          pointer-events: none;
        }
        .map-point:hover circle,
        .map-point.is-active circle { fill: var(--juru-brown); transform: scale(1.15); }
        .map-point.is-pin circle { fill: var(--juru-orange); stroke: none; }
        .map-point.is-inactive circle { opacity: .35; cursor: default; }
        .map-point.is-inactive text { opacity: .4; }

        .map-detail-card {
          position: absolute;
          top: 0;
          right: 0;
          width: 190px;
          padding: 16px;
          border-radius: 22px;
          background: rgba(238,235,228,.92);
          box-shadow: 0 18px 30px -12px rgba(90,37,4,.3);
          text-align: center;
        }
        .map-detail-num {
          margin: 0 0 8px;
          color: var(--juru-red);
          font: 400 22px 'Alevia DEMO', 'Judson', serif;
        }
        .map-detail-card img {
          width: 100%;
          height: 90px;
          object-fit: cover;
          border-radius: 14px;
          display: block;
          margin-bottom: 10px;
        }
        .map-detail-text {
          margin: 0;
          color: var(--juru-brown);
          font: 400 12px/1.4 'Instrument Sans', sans-serif;
        }

        .news {
          position: relative;
          padding: 70px 5vw 95px;
          background: #D0B6A6;
          overflow: hidden;
        }
        .news::before {
          content: '';
          position: absolute;
          width: 1100px; height: 1100px;
          left: -600px; bottom: -500px;
          border-radius: 50%;
          background: rgba(255,255,255,.13);
        }
        .news-title {
          position: relative;
          margin: 0 0 55px;
          text-align: center;
          color: var(--juru-brown);
          font: 400 50px 'Alevia DEMO', 'Judson', serif;
        }
        .news-grid { position: relative; max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .news-card { position: relative; text-align: center; }
        .news-badge {
          position: relative;
          z-index: 2;
          display: inline-flex;
          min-height: 43px;
          align-items: center;
          justify-content: center;
          padding: 7px 25px;
          margin-bottom: -15px;
          border-radius: 999px;
          color: white;
          font: 500 20px 'Fredoka', sans-serif;
          text-shadow: 0 4px 4px rgba(0,0,0,.25);
          transition: transform 300ms var(--ease-slide), filter 500ms var(--ease-figma);
        }
        .news-card:hover .news-badge { transform: translateY(-4px); filter: brightness(1.08); }
        .news-image-wrap {
          height: 520px;
          padding: 10px;
          border-radius: 50px;
          background: rgba(255,255,255,.24);
          overflow: hidden;
        }
        .news-image-wrap img {
          width: 100%; height: 100%; object-fit: cover; border-radius: 40px; display: block;
          transition: transform 500ms var(--ease-slide), filter 500ms var(--ease-figma);
        }
        .news-card:hover .news-image-wrap img { transform: scale(1.04); filter: saturate(1.05); }
        .news-copy { margin: 18px auto 16px; max-width: 340px; min-height: 72px; color: #3B3B3B; font: 500 12px/1.4 'Instrument Sans', sans-serif; }
        .news-more {
          display: inline-flex;
          min-width: 150px;
          justify-content: center;
          padding: 10px 22px;
          border-radius: 999px;
          background: #D9D9D9;
          color: var(--juru-red);
          text-decoration: none;
          font: 400 25px 'Instrument Sans', sans-serif;
          text-shadow: 0 4px 4px rgba(0,0,0,.25);
          transition: background-color 300ms var(--ease-slide), color 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .news-more:hover { background: #8F4535; color: white; transform: translateY(-2px); }

        .newsletter {
          position: relative;
          overflow: hidden;
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          background: #BD9882;
        }
        .newsletter::after {
          content: '';
          position: absolute;
          width: 430px; height: 430px;
          right: -120px; bottom: -170px;
          border-radius: 50%;
          background: var(--juru-orange);
          transition: transform 500ms var(--ease-slide);
        }
        .newsletter:hover::after { transform: scale(1.05); }
        .newsletter-inner { position: relative; z-index: 2; width: min(900px, 100%); text-align: center; }
        .newsletter-title { margin: 0 0 40px; color: var(--juru-brown); font: 400 50px/1.05 'Alevia DEMO', 'Judson', serif; }
        .newsletter-form { display: flex; max-width: 820px; margin: 0 auto; gap: 0; }
        .newsletter-input { flex: 1; min-width: 0; height: 60px; padding: 0 28px; border: 1px solid #272626; border-radius: 50px 0 0 50px; outline: none; background: #D9D9D9; color: #272626; font: 400 15px 'Alevia DEMO', 'Judson', serif; }
        .newsletter-button { width: 170px; border: 1px solid var(--juru-red); border-radius: 0 50px 50px 0; background: var(--juru-red); color: white; cursor: pointer; font: 400 15px 'Alevia DEMO', 'Judson', serif; transition: filter 500ms var(--ease-figma), transform 300ms var(--ease-slide); }
        .newsletter-button:hover { filter: brightness(1.1); transform: translateX(2px); }

        .footer {
          position: relative;
          background: var(--juru-dark);
          color: #FFEAEA;
          padding: 58px 8vw 30px;
        }
        .footer-top { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 40px; align-items: start; padding-bottom: 35px; border-bottom: 1px solid rgba(189,152,130,.55); }
        .footer-logo { width: 125px; filter: none; }
        .footer-legal { max-width: 560px; margin: 0; font: 400 15px/1.45 'Alevia DEMO', 'Judson', serif; }
        .footer-support-title { margin: 0 0 18px; font: 400 15px 'Alevia DEMO', 'Judson', serif; }
        .footer-support a { display: block; width: fit-content; margin-bottom: 9px; color: #FFEAEA; text-decoration: none; font: 400 15px 'Alevia DEMO', 'Judson', serif; transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide); }
        .footer-support a:hover { opacity: .65; transform: translateX(3px); }
        .footer-bottom { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; align-items: end; padding-top: 30px; }
        .footer-social { display: flex; gap: 22px; }
        .footer-social a { transition: transform 300ms var(--ease-slide), opacity 500ms var(--ease-figma); }
        .footer-social a:hover { transform: translateY(-3px); opacity: .7; }
        .footer-contact { font: 400 15px/1.8 'Alevia DEMO', 'Judson', serif; }
        .footer-brand { text-align: right; color: rgba(243,243,201,.8); font: 500 64px 'Fredoka', sans-serif; }
        .footer-credit { margin: 26px 0 0; text-align: center; color: #FFEAEA; opacity: .85; font: 400 15px 'Alevia DEMO', 'Judson', serif; }

        .mobile-overlay { position: fixed; inset: 0; z-index: 50; background: #1F1B14; color: white; display: flex; flex-direction: column; animation: menuIn 300ms var(--ease-slide) both; }
        @keyframes menuIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .mobile-overlay-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; }
        .mobile-overlay nav { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; font: 400 28px 'Judson', serif; }
        .mobile-overlay nav a { text-decoration: none; transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide); }
        .mobile-overlay nav a:hover { opacity: .65; transform: translateX(5px); }

        @media (max-width: 900px) {
          .hero-links { display: none; }
          .mobile-menu-button { display: block; }
          .who-layout { grid-template-columns: 1fr; gap: 20px; }
          .who-art { max-width: 170px; }
          .who-heading { text-align: center; }
          .territory-grid { grid-template-columns: 1fr; }
          .territory-data { max-width: 620px; margin: 0 auto; text-align: center; }
          .territory-quote { margin-left: auto; margin-right: auto; }
          .numbers { justify-content: center; }
          .territory-map { min-height: 450px; }
          .map-detail-card { position: static; width: 220px; margin: 0 auto 24px; }
          .news-grid { grid-template-columns: 1fr; max-width: 520px; }
          .news-image-wrap { height: 560px; }
          .footer-top { grid-template-columns: 1fr; }
          .footer-bottom { grid-template-columns: 1fr 1fr; }
          .footer-brand { text-align: left; }
        }

        @media (max-width: 560px) {
          .hero { min-height: 610px; height: 88vh; }
          .hero-nav { padding: 0 20px; }
          .hero-logo { width: 74px; }
          .hero-content { padding-bottom: 50px; }
          .hero-cta { min-width: 225px; font-size: 18px; }
          .intro { padding-top: 48px; }
          .gallery-wrap { height: 270vh; }
          .gallery-sticky { min-height: 570px; padding: 20px 13px 55px; }
          .gallery-card { border-radius: 27px; }
          .who { padding: 50px 24px 65px; }
          .who-copy { font-size: 15px; line-height: 1.42; }
          .who-slider { width: 220px; }
          .who-slide { height: 280px; }
          .testimonial { height: 520px; }
          .testimonial-content { padding: 30px 24px; align-items: flex-end; padding-bottom: 75px; }
          .testimonial-text { font-size: 28px; }
          .territory { padding: 50px 20px 70px; }
          .territory-kicker { font-size: 34px; }
          .territory-title { font-size: 51px; }
          .territory-map { min-height: 360px; }
          .number { font-size: 66px; }
          .news { padding: 55px 20px 75px; }
          .news-title { font-size: 40px; }
          .news-image-wrap { height: 470px; }
          .newsletter { padding: 60px 18px; }
          .newsletter-form { flex-direction: column; gap: 10px; }
          .newsletter-input, .newsletter-button { width: 100%; height: 55px; border-radius: 50px; }
          .footer { padding: 45px 24px 25px; }
          .footer-bottom { grid-template-columns: 1fr; }
          .footer-brand { text-align: left; }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <section className="hero" aria-label="Inicio">
        <video className="hero-video" autoPlay muted loop playsInline src="/videos/hero.mp4" />
        <div className="hero-shade" />
        <div className="hero-fade" />

        <header className="hero-nav">
          <div className="hero-nav-logo">
            <a href="#inicio" aria-label="JURU inicio">
              <img className="hero-logo" src={juruLogo} alt="JURU" />
            </a>
          </div>

          <nav className="hero-links" aria-label="Navegación principal">
            {NAV_LINKS_IZQ.map((item) => (
              <a key={item.label} href={item.href} className={navClass(item.href)} onClick={() => setActiveNav(item.href)}>{item.label}</a>
            ))}
            <a href="#dona" className={navClass("#dona")} onClick={() => setActiveNav("#dona")}>Dona</a>
            {NAV_LINKS_DER.map((item) => (
              <a key={item.label} href={item.href} className={navClass(item.href)} onClick={() => setActiveNav(item.href)}>{item.label}</a>
            ))}
            <Link to="/voces">Voces</Link>
          </nav>

          <div className="hero-nav-spacer">
            <button className="mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
              <Menu size={27} />
            </button>
          </div>
        </header>

        <div id="inicio" className="hero-content">
          <Reveal>
            <p className="hero-kicker">De nuestras raíces nace</p>
            <h1 className="hero-title">la inspiración, de nuestras manos, la historia</h1>
            <a href="#historia" className="hero-cta">Conoce nuestra historia</a>
          </Reveal>
        </div>
      </section>

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
            <a href="#dona" onClick={() => setMenuOpen(false)}>Dona</a>
            {NAV_LINKS_DER.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link to="/voces" onClick={() => setMenuOpen(false)}>Voces</Link>
          </nav>
        </div>
      )}

      <section className="intro">
        <Reveal duration={700}>
          <p className="intro-small">Aprendimos a crear,</p>
        </Reveal>
        <Reveal duration={700} delay={180}>
          <p className="intro-large">nos encontramos para soñar, y juntas dejamos huella que perduran</p>
        </Reveal>
      </section>

      <section id="historia" ref={galleryWrapRef} className="gallery-wrap" aria-label="Nuestra historia">
        <div className="gallery-sticky">
          <div className="gallery-stack">
            {GALLERY.map((img, i) => (
              <div
                key={img.src}
                className="gallery-card"
                style={{
                  transform: `translateY(${translateYs[i]}%) scale(${scales[i]})`,
                  transformOrigin: "50% 0%",
                  filter: `blur(${blurs[i]}px)`,
                  zIndex: i,
                }}
              >
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
            <div className="gallery-fade" />
          </div>
        </div>
      </section>

      <section id="quienes-somos" className="who">
        <div className="who-inner">
          <Reveal>
            <h2 className="who-heading">¿ Quienes Somos ?</h2>
          </Reveal>

          <div className="who-layout">
            <Reveal delay={100}>
              <img src={ilustracionFamilia} alt="Ilustración de la comunidad de JURU" className="who-art" />
            </Reveal>
            <Reveal delay={160}>
              <div className="who-copy">
                <p>Somos artesanas, madres, trabajadoras del campo, mujeres que encontraron en sus manos una forma de crear, de sostenerse y de contar quiénes son. Con esas manos transformamos materiales en objetos que llevan parte de nuestra historia: bolsos, prendas, accesorios y piezas hechas con tiempo, dedicación y saber.</p>
                <p>Pero JURU no habla solo de lo que hacemos. Habla de lo que somos y de dónde venimos. Por eso creamos este espacio: una ventana hacia nuestro territorio, para que puedas conocernos más allá de un producto.</p>
                <p>Aquí puedes recorrer nuestros caminos en la Colección Digital del Entorno, escuchar nuestras voces e historias, adentrarte en nuestras memorias, y descubrir las piezas que hacemos en un catálogo pensado para una compra consciente. Cada uno de estos espacios cuenta una parte de nuestra historia.</p>
                <p>Queremos que cuando conozcas una de nuestras piezas, conozcas también las manos que la hicieron, el territorio que la vio nacer y todo lo que hay detrás de ella. Porque para nosotras, crear no es solo hacer un objeto: es mantener vivo un saber, es contar nuestra historia, es darle valor a nuestro territorio, es seguir tejiendo memoria.</p>
                <p>Te invitamos a recorrer JURU: a escucharnos, a conocernos. Y, si encuentras una pieza que quieras llevar contigo, a hacerlo sabiendo que detrás de ella hay una historia que sigue viva.<br />Bienvenida a nuestro territorio. Bienvenida a JURU.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        className="testimonial"
        aria-label="Testimonio"
        onTouchStart={onTestimonialTouchStart}
        onTouchEnd={onTestimonialTouchEnd}
      >
        <img src={ARTESANAS[faceIdx].src} alt={ARTESANAS[faceIdx].alt} />
        <div className="testimonial-content">
          <Reveal>
            <div className="testimonial-copy">
              <p className="testimonial-text">{TESTIMONIOS[0].texto}</p>
              <p className="testimonial-author">{TESTIMONIOS[0].autora}</p>
            </div>
          </Reveal>
        </div>
        <button className="testimonial-arrow testimonial-arrow-prev" onClick={prevFace} aria-label="Foto anterior">
          <ChevronLeft size={22} />
        </button>
        <button className="testimonial-arrow testimonial-arrow-next" onClick={nextFace} aria-label="Foto siguiente">
          <ChevronRight size={22} />
        </button>
        <div className="dots">
          {ARTESANAS.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === faceIdx ? "active" : ""}`}
              onClick={() => goToFace(i)}
              aria-label={`Ver foto ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="territory" id="mapa">
        <img className="territory-texture" src={texturaTopografica} alt="" aria-hidden="true" />
        <div className="territory-head">
          <Reveal>
            <p className="territory-kicker">Somos de donde venimos</p>
            <h2 className="territory-title">de Nuestro Territorio</h2>
            <a className="territory-link" href="#mapa-imagen">Explora el mapa <ArrowRight size={16} /></a>
          </Reveal>
        </div>

        <div className="territory-grid">
          <Reveal>
            <div className="territory-data">
              <img className="territory-illustration territory-illustration-house" src={juruTerritorio} alt="Ilustración del territorio de JURU" />
              <p className="territory-quote">La geografía no nos define, nos identifica.</p>
              <p className="route-data"><strong>DST:</strong><br />1,4 km de recorrido<br /><br /><strong>DSN:</strong><br />+ 220 m<br /><br />40 min hasta la caseta</p>
              <div className="numbers">
                <div>
                  <p className="number">30<span style={{ fontSize: 20, verticalAlign: "top" }}>+</span></p>
                  <p className="number-label">familias</p>
                </div>
                <div>
                  <p className="number">15<span style={{ fontSize: 20, verticalAlign: "top" }}>+</span></p>
                  <p className="number-label">mujeres hacen parte de JURU</p>
                </div>
              </div>
              <p>Somos parte del<br /><strong style={{ fontSize: 30 }}>resguardo indígena la Trina</strong></p>
              <img className="territory-illustration territory-illustration-tools" src={juruHerramientas} alt="Herramientas artesanales de JURU" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="territory-map" id="mapa-imagen">
              <svg className="map-svg" viewBox="0 0 400 900" role="img" aria-label="Mapa interactivo del recorrido por el territorio de JURU">
                <path d={routePath(TRONCO)} className="map-path" />
                <path d={routePath(LAZO)} className="map-path" />
                {RUTA.map((p, i) => {
                  if (p.isEnd) return null;
                  return (
                    <g
                      key={p.label + i}
                      className={`map-point ${p.isPin ? "is-pin" : ""} ${p.inactivo ? "is-inactive" : ""} ${hoverIdx === i ? "is-active" : ""}`}
                      onMouseEnter={() => !p.inactivo && setHoverIdx(i)}
                      onFocus={() => !p.inactivo && setHoverIdx(i)}
                      onClick={() => !p.inactivo && setHoverIdx(i)}
                      tabIndex={p.inactivo ? -1 : 0}
                    >
                      <circle cx={p.x} cy={p.y} r={p.isPin ? 11 : 7} />
                      <text x={p.x} y={p.y - 15} textAnchor="middle">{p.label}</text>
                    </g>
                  );
                })}
              </svg>

              {RUTA[hoverIdx]?.detalle && (
                <div className="map-detail-card">
                  <p className="map-detail-num">{RUTA[hoverIdx].label}</p>
                  <img src={GALLERY[RUTA[hoverIdx].detalle.img].src} alt={RUTA[hoverIdx].detalle.titulo} />
                  <p className="map-detail-text">{RUTA[hoverIdx].detalle.texto}</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="novedades" className="news">
        <Reveal>
          <h2 className="news-title">Novedades</h2>
        </Reveal>
        <div className="news-grid">
          {NOVEDADES.map((item, i) => (
            <Reveal key={item.badge} delay={i * 100}>
              <article className="news-card">
                <span className="news-badge" style={{ background: item.badgeColor }}>{item.badge}</span>
                <div className="news-image-wrap">
                  <img src={item.img} alt={item.badge} />
                </div>
                <p className="news-copy">{item.texto}</p>
                <a href={item.href} className="news-more">Leer más</a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="dona" className="newsletter">
        <div className="newsletter-inner">
          <Reveal>
            <h2 className="newsletter-title">¡Toma la iniciativa y entérate de todo lo nuevo!</h2>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input className="newsletter-input" type="email" required placeholder="Ingresa tu correo aquí" aria-label="Correo electrónico" />
              <button className="newsletter-button" type="submit">Suscríbete</button>
            </form>
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <img src={juruLogo} alt="JURU" className="footer-logo" />
          <p className="footer-legal">Declaro que la información obtenida para el tratamiento de mis datos personales la he suministrado de forma automática y/o manual y es verídica.</p>
          <div className="footer-support">
            <p className="footer-support-title">Alternativas de apoyo</p>
            <a href="#dona">Compra</a>
            <a href="#dona">Dona</a>
            <a href="#">Comparte</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-social" aria-label="Redes sociales">
            <a href="#" aria-label="Instagram">I</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="WhatsApp"><MessageCircle size={22} /></a>
          </div>
          <div className="footer-contact">
            <div>@juru.marca</div>
            <div>juru marca</div>
            <div>315 55 555</div>
          </div>
          <div className="footer-brand">JURU</div>
        </div>

        <p className="footer-credit">Este sitio está diseñado con todo el 🤍 por Edna Design</p>
      </footer>
    </main>
  );
}
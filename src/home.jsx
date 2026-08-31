import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import juruLogo from "./images/juru-logo.jpeg";
import juruHierbas from "./images/juru-hierbas.jpg";
import juruTaller from "./images/juru-taller.jpg";
import juruMaquina from "./images/juru-maquina.jpg";

// ---------------------------------------------------------------------------
// Página de inicio de JURU. Dos piezas técnicas propias de este archivo:
//
// 1) HERO CON VIDEO: un <video> de fondo a pantalla completa, con overlay
//    oscuro y el texto/CTA encima.
//
// 2) GALERÍA CON SCROLL PINNEADO (inspirada en fundacionpiesdescalzos.com):
//    una sección alta (N x 100vh) contiene un panel "sticky" del alto de
//    la pantalla. Dentro, las imágenes están todas apiladas una sobre otra
//    (position: absolute). Mientras se hace scroll DENTRO de esa sección
//    alta, el panel se queda fijo en pantalla y calculamos, a partir de
//    cuánto se ha scrolleado, la escala/blur de cada imagen para que
//    parezcan una pila de tarjetas que se van "hundiendo" hacia atrás.
//
//    FIX CLAVE (el que traía el bug del amontonamiento): el z-index de
//    cada tarjeta ya NO es estático por posición en el array. Antes,
//    la última imagen del array siempre pintaba encima de todas las
//    demás, sin importar el scroll — así que una imagen "lejana" (chica
//    y borrosa por la fórmula de distancia) terminaba tapando a la que
//    sí estaba en foco. Ahora el z-index se recalcula en cada scroll:
//    la tarjeta más cercana al punto actual del scroll (floatIndex)
//    siempre queda arriba, sin importar si es una tarjeta "pasada" o
//    "futura" dentro del array.
// ---------------------------------------------------------------------------

// Reemplaza estas imágenes por tus fotos reales (ya importadas arriba).
const GALLERY = [
  { src: juruHierbas, alt: "Ofrenda de hierbas y flores sobre tela" },
  { src: juruTaller, alt: "Mujeres alrededor de una mesa haciendo manualidades" },
  { src: juruMaquina, alt: "Máquina de coser bajo un techo de zinc" },
];

// Puntos del "camino" decorativo, en coordenadas de un viewBox 0 0 400 900.
const RUTA = [
  { x: 90, y: 40, label: null, isEnd: true },
  { x: 130, y: 130, label: "3.1" },
  { x: 105, y: 230, label: "2.3" },
  { x: 165, y: 210, label: "3.2" },
  { x: 200, y: 300, label: "JURU", isPin: true },
  { x: 130, y: 340, label: "2.2" },
  { x: 150, y: 430, label: "2.1" },
  { x: 140, y: 520, label: "1.3" },
  { x: 220, y: 560, label: "4.2" },
  { x: 250, y: 480, label: "4.3" },
  { x: 165, y: 610, label: "4.1" },
  { x: 160, y: 690, label: "1.2" },
  { x: 150, y: 780, label: "1.1" },
  { x: 145, y: 850, label: null, isEnd: true },
];

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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // ---- Scroll-pinned "tarjetas apiladas" ---------------------------------
  const MAX_DIST = 2;         // a partir de esta distancia, el efecto ya no crece más
  const MAX_SHRINK = 0.45;    // encogimiento máximo (scale mínimo = 1 - esto = 0.55)
  const MAX_BLUR = 6;         // blur máximo en px
  const PEEK_PERCENT = 14;    // % del panel que se deja siempre visible de la tarjeta de atrás

  const galleryWrapRef = useRef(null);
  const [scales, setScales] = useState(GALLERY.map(() => 1));
  const [blurs, setBlurs] = useState(GALLERY.map(() => 0));
  const [translateYs, setTranslateYs] = useState(GALLERY.map((_, i) => (i === 0 ? 0 : 100)));

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

      // ENTRADA: cada tarjeta (excepto la primera) empieza totalmente
      // oculta debajo del panel (translateY 100%) y sube hasta su lugar
      // (translateY 0%) durante su propia "ventana" de scroll, que va de
      // (i - 1) a i en floatIndex. Como z-index ya es simplemente i
      // (ascendente), una tarjeta que todavía no le toca turno no puede
      // tapar nada: literalmente está fuera de pantalla, abajo del todo.
      // ENTRADA EN PILA: cada tarjeta tiene su propio "cajón" fijo dentro
      // de la pila: la tarjeta i, una vez que llega, se queda para
      // siempre en translateY = i * PEEK_PERCENT (la tarjeta 0 en 0%,
      // la 1 en PEEK_PERCENT%, la 2 en 2×PEEK_PERCENT%, etc.). Como el
      // z-index es ascendente por índice, cada una tapa a todas las
      // anteriores excepto por esa franja — así se ven TODAS las
      // tarjetas ya pasadas al mismo tiempo, apiladas, no solo la
      // inmediatamente anterior.
      const translateYs = GALLERY.map((_, i) => {
        const target = i * PEEK_PERCENT; // posición final de reposo de esta tarjeta
        const entrada = Math.min(Math.max(floatIndex - (i - 1), 0), 1);
        return 100 - entrada * (100 - target); // 100% (oculta abajo) -> target% (su lugar en la pila)
      });

      // RETIRADA: una vez que una tarjeta ya fue cubierta por la
      // siguiente, se encoge y difumina (con transform-origin arriba,
      // por eso el borde superior se queda fijo y es lo único que
      // asoma por encima de la tarjeta que la tapa — igual que en la
      // referencia).
      const dist = GALLERY.map((_, i) => Math.min(Math.max(floatIndex - i, 0), MAX_DIST) / MAX_DIST);

      setScales(dist.map((t) => 1 - t * MAX_SHRINK));
      setBlurs(dist.map((t) => t * MAX_BLUR));
      setTranslateYs(translateYs);
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

  return (
    <div style={{ background: "#8A9A5F", color: "#F4F1E6", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italianno&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* ------------------------------------------------------------- */}
      {/* HERO: video de fondo + overlay + texto + nav                  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/hero.mp4"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(20,24,10,0.35) 0%, rgba(20,24,10,0.55) 100%)" }}
        />

        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
          <img src={juruLogo} alt="JURU" className="h-8 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
          <button onClick={() => setMenuOpen(true)} aria-label="Abrir menú" className="text-white">
            <Menu size={26} />
          </button>
        </header>

        <div className="relative z-10 h-[calc(100vh-88px)] flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-5xl text-center mb-8">
            {/* Primera línea - manuscrita */}
            <p
              className="text-5xl md:text-7xl leading-none mb-[-4px]"
              style={{
                fontFamily: "'Italianno', cursive",
                fontWeight: 400,
                color: "#f5c208",
              }}
            >
              De nuestras raíces nace
            </p>

            {/* Segunda parte - serif */}
            <p
              className="text-4xl md:text-6xl leading-[0.95]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              la inspiración, de nuestras
              <br />
              manos, la historia
            </p>
          </div>
          <a
            href="#historia"
            className="inline-block rounded-full px-6 py-2.5 text-sm border"
            style={{ borderColor: "rgba(244,241,230,0.6)" }}
          >
            Conoce nuestra historia
          </a>
        </div>
      </section>

      {/* Menú a pantalla completa */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#14180A" }}>
          <div className="flex items-center justify-between px-6 md:px-10 py-6">
            <img src={juruLogo} alt="JURU" className="h-8 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
            <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="text-white">
              <X size={26} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8 text-2xl" style={{ fontFamily: "'Fraunces', serif" }}>
            {["Nuestra historia", "Lo que hacemos", "Voces", "Contáctanos"].map((item) => (
              <a key={item} href="#" className="text-white/80 hover:text-white" onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GALERÍA CON SCROLL PINNEADO                                    */}
      {/* ------------------------------------------------------------- */}
      <section id="historia" ref={galleryWrapRef} style={{ height: `${GALLERY.length * 100}vh` }} className="relative">
        <div className="sticky top-0 h-screen w-full py-10 px-6 md:py-16 md:px-20 lg:px-32">
          <div className="relative h-full w-full max-w-6xl mx-auto">
            {GALLERY.map((img, i) => (
              <div
                key={img.src}
                className="absolute inset-0 rounded-[2.5rem] overflow-hidden"
                style={{
                  transform: `translateY(${translateYs[i]}%) scale(${scales[i]})`,
                  transformOrigin: "50% 0%",
                  filter: `blur(${blurs[i]}px)`,
                  zIndex: i,
                  transition: "transform 0.05s linear, filter 0.05s linear",
                  boxShadow: "0 30px 60px -15px rgba(0,0,0,0.35)",
                }}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* RUTA DECORATIVA                                                */}
      {/* ------------------------------------------------------------- */}
      <section className="py-24 px-6 flex justify-center">
        <svg viewBox="0 0 400 900" className="w-full max-w-sm h-auto">
          <path d={routePath(RUTA)} fill="none" stroke="#F4F1E6" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="1 6" strokeLinecap="round" />
          {RUTA.map((p, i) => (
            <g key={i}>
              {p.isEnd ? (
                <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="#F4F1E6" strokeOpacity={0.6} strokeWidth={1.5} />
              ) : (
                <circle cx={p.x} cy={p.y} r={3} fill="#F4F1E6" fillOpacity={0.7} />
              )}
              {p.label && (
                <text
                  x={p.x + (p.isPin ? 12 : 10)}
                  y={p.y + (p.isPin ? -6 : 4)}
                  fontSize={p.isPin ? 15 : 11}
                  fill="#F4F1E6"
                  fillOpacity={p.isPin ? 0.95 : 0.55}
                  fontFamily={p.isPin ? "'Fraunces', serif" : "'Inter', sans-serif"}
                  fontStyle={p.isPin ? "italic" : "normal"}
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CONTACTO                                                       */}
      {/* ------------------------------------------------------------- */}
      <section className="px-6 md:px-10 pb-16">
        <p className="italic text-2xl" style={{ fontFamily: "'Fraunces', serif" }}>
          Contáctanos
        </p>
      </section>
    </div>
  );
}
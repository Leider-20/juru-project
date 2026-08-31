import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import juruLogo from "./images/juru-logo.png";
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

// Puntos del mapa, en coordenadas de un viewBox 0 0 400 900. A diferencia
// de una ruta lineal, este trazado se BIFURCA en el punto 3.1: una rama
// baja directo (2.3 → 2.2 → 2.1) y la otra da la vuelta por la derecha
// (3.2 → JURU → 4.9 → 4.3 → 4.2 → 4.1), y ambas se reencuentran en el
// punto 1.3 (el nudo "Y." del boceto) antes de continuar juntas hacia
// el final. Por eso el trazado se dibuja como DOS <path> que comparten
// sus puntos de inicio/fin de bifurcación, en vez de una sola línea.
//
// Cada punto lleva "detalle" (imagen + texto) para la tarjeta que aparece
// al pasar el cursor — son marcadores de posición, reemplázalos por la
// historia real de cada relato.
const PUNTOS = {
  inicio: { x: 20, y: 16, isEnd: true },
  p31: {
    x: 108, y: 50, label: "3.1",
    detalle: { titulo: "Relato 3.1", texto: "Un relato compartido en esta parada del camino.", img: 1 },
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

// Lista plana (para dibujar puntos y tarjetas) — cada punto una sola vez,
// aunque 3.1 y 1.3 sean compartidos por ambas ramas del trazado.
const RUTA = Object.values(PUNTOS);

// Dos trazados que comparten los puntos de bifurcación (3.1) y reencuentro
// (1.3): el tronco principal y el lazo que pasa por JURU.
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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);

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
        @import url('https://fonts.googleapis.com/css2?family=Italianno&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=Kapakana:wght@400&family=Judson:ital,wght@0,400;0,700;1,400&display=swap');
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
        {/* Difuminado hacia el verde de la sección siguiente, para que el
            corte entre el video y el fondo plano no se sienta abrupto. */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 md:h-56 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(138,154,95,0) 0%, #8A9A5F 100%)" }}
        />

        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
          <img src={juruLogo} alt="JURU" className="h-15 w-auto" />
          <nav className="hidden md:flex items-center gap-12 text-base tracking-wide text-white/85" style={{ fontFamily: "'Inter', sans-serif" }}>
            {["Nuestra historia", "Lo que hacemos", "Voces", "Contáctanos"].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* Hamburguesa solo en móvil, donde sí hace falta ocultar las
              opciones detrás de un botón por falta de espacio. */}
          <button onClick={() => setMenuOpen(true)} aria-label="Abrir menú" className="text-white md:hidden">
            <Menu size={26} />
          </button>
        </header>

        <div className="relative z-10 h-[calc(100vh-88px)] flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-5xl text-center mb-8">
            {/* Primera línea - Kapakana */}
            <p
              style={{
                color: "#FFF",
                fontFamily: "'Kapakana', cursive",
                fontSize: 64,
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              De nuestras raíces nace
            </p>

            {/* Segunda parte - Judson */}
            <p
              style={{
                color: "#DFEA79",
                textAlign: "center",
                fontFamily: "'Judson', serif",
                fontSize: 48,
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
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
          {/* Difuminado sobre el borde inferior de la pila, para que la
              tarjeta que se retira se disuelva en el fondo verde en vez
              de cortarse en seco contra un borde recto. */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 md:h-32 pointer-events-none"
            style={{ background: "linear-gradient(180deg, rgba(138,154,95,0) 0%, #8A9A5F 100%)", zIndex: GALLERY.length + 1 }}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* RUTA DECORATIVA — mapa interactivo estilo fundacionpiesdescalzos.com:
          tarjeta clara que resalta sobre el verde, resplandor difuminado
          detrás del trazo, y una tarjeta con imagen + texto al pasar el
          cursor (o tocar, en móvil) sobre cada punto. */}
      {/* ------------------------------------------------------------- */}
      <section className="pt-32 md:pt-44 pb-20 md:pb-28 px-6 flex justify-center">
        <div
          className="relative w-full max-w-md rounded-[2.5rem] md:rounded-[3rem] px-6 py-12 md:px-10 md:py-16 overflow-hidden"
          style={{ background: "#F7F2E4", boxShadow: "0 40px 80px -30px rgba(20,24,10,0.45)" }}
        >
          {/* Resplandor difuminado detrás del camino, para darle profundidad
              a la tarjeta en vez de un fondo plano. */}
          <div
            className="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "#DFEA79", opacity: 0.35, filter: "blur(70px)" }}
          />
          <div
            className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "#8A9A5F", opacity: 0.3, filter: "blur(70px)" }}
          />

          <p
            className="relative text-center text-xs uppercase tracking-widest mb-8"
            style={{ color: "#6B7048", fontFamily: "'Inter', sans-serif" }}
          >
            Pasa el cursor sobre cada punto para conocer su historia
          </p>

          {/* Contenedor con la relación de aspecto del viewBox (400x900):
              el SVG y la capa de tarjetas flotantes comparten exactamente
              el mismo marco, así el % de posición de cada tarjeta coincide
              siempre con el punto del mapa que representa. */}
          <div
            className="relative mx-auto mt-10 md:mt-14"
            style={{ aspectRatio: "400 / 900", maxWidth: 300 }}
            onClick={() => setHoverIdx(null)}
          >
            <svg viewBox="0 0 400 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
              <path
                d={routePath(TRONCO)}
                fill="none"
                stroke="#2E2A1F"
                strokeOpacity={0.75}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d={routePath(LAZO)}
                fill="none"
                stroke="#2E2A1F"
                strokeOpacity={0.75}
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* Etiqueta "Y." junto al nudo donde se reencuentran las dos
                  ramas, como en el boceto. */}
              <text
                x={PUNTOS.p13.x + 16}
                y={PUNTOS.p13.y + 26}
                fontSize={13}
                fill="#2E2A1F"
                fillOpacity={0.6}
                fontFamily="'Fraunces', serif"
                fontStyle="italic"
              >
                Y.
              </text>
              {RUTA.map((p, i) => {
                if (p.isEnd) {
                  const isStart = i === 0;
                  return (
                    <g key={i}>
                      {isStart ? (
                        <>
                          <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#2E2A1F" strokeWidth={1.5} />
                          <circle cx={p.x} cy={p.y} r={3} fill="#2E2A1F" />
                        </>
                      ) : (
                        <>
                          {Array.from({ length: 10 }).map((_, r) => {
                            const angle = (r / 10) * Math.PI * 2;
                            const x1 = p.x + Math.cos(angle) * 9;
                            const y1 = p.y + Math.sin(angle) * 9;
                            const x2 = p.x + Math.cos(angle) * 16;
                            const y2 = p.y + Math.sin(angle) * 16;
                            return (
                              <line key={r} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2E2A1F" strokeWidth={1.5} strokeLinecap="round" />
                            );
                          })}
                          <circle cx={p.x} cy={p.y} r={7} fill="#F7F2E4" stroke="#2E2A1F" strokeWidth={1.5} />
                        </>
                      )}
                    </g>
                  );
                }

                if (p.isPin) {
                  // Pin de ubicación (teardrop dibujado a mano) para JURU.
                  const r = 13;
                  const d = `M ${p.x} ${p.y}
                             C ${p.x - r} ${p.y - r * 1.4} ${p.x - r} ${p.y - r * 2.6} ${p.x} ${p.y - r * 2.6}
                             C ${p.x + r} ${p.y - r * 2.6} ${p.x + r} ${p.y - r * 1.4} ${p.x} ${p.y} Z`;
                  return (
                    <g key={i}>
                      <path d={d} fill="#2E2A1F" />
                      <circle cx={p.x} cy={p.y - r * 1.7} r={r * 0.38} fill="#F7F2E4" />
                      <text
                        x={p.x}
                        y={p.y - r * 2.6 - 10}
                        fontSize={17}
                        fill="#2E2A1F"
                        textAnchor="middle"
                        fontFamily="'Fraunces', serif"
                        fontStyle="italic"
                      >
                        JURU
                      </text>
                    </g>
                  );
                }

                const isHovered = hoverIdx === i;
                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={(e) => { e.stopPropagation(); setHoverIdx(isHovered ? null : i); }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Área de toque más grande que el punto visible, para
                        que sea fácil de tocar en móvil. */}
                    <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 7 : 5}
                      fill={p.inactivo ? "#F7F2E4" : isHovered ? "#DFEA79" : "#8FAE4F"}
                      stroke="#2E2A1F"
                      strokeOpacity={p.inactivo ? 0.45 : 1}
                      strokeWidth={1.2}
                      style={{ transition: "r 0.2s ease, fill 0.2s ease" }}
                    />
                    <text
                      x={p.x + 10}
                      y={p.y + 4}
                      fontSize={11}
                      fill="#2E2A1F"
                      fillOpacity={p.inactivo ? 0.4 : isHovered ? 0.9 : 0.55}
                      fontFamily="'IBM Plex Mono', monospace"
                    >
                      {p.label}
                    </text>
                    {/* Marca de "no disponible", como en el boceto (4.9 x). */}
                    {p.inactivo && (
                      <text
                        x={p.x + 34}
                        y={p.y + 4}
                        fontSize={12}
                        fill="#2E2A1F"
                        fillOpacity={0.4}
                        fontFamily="'IBM Plex Mono', monospace"
                      >
                        ×
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tarjetas flotantes con imagen + descripción al pasar el
                cursor (o al tocar) un punto del mapa. */}
            {RUTA.map((p, i) => {
              if (!p.detalle || hoverIdx !== i) return null;
              const goRight = p.x <= 200;
              const goDown = p.y <= 450;
              const transform = `translate(${goRight ? "14px" : "calc(-100% - 14px)"}, ${goDown ? "14px" : "calc(-100% - 14px)"})`;
              return (
                <div
                  key={i}
                  className="absolute z-30 w-40 rounded-2xl overflow-hidden pointer-events-none"
                  style={{
                    left: `${(p.x / 400) * 100}%`,
                    top: `${(p.y / 900) * 100}%`,
                    transform,
                    background: "#FFFDF7",
                    boxShadow: "0 20px 40px -12px rgba(20,24,10,0.5)",
                    border: "1px solid rgba(46,42,31,0.1)",
                  }}
                >
                  <img src={GALLERY[p.detalle.img].src} alt={p.detalle.titulo} className="w-full h-20 object-cover" />
                  <div className="px-3 py-2.5">
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "#2E2A1F", fontFamily: "'Fraunces', serif" }}>
                      {p.detalle.titulo}
                    </div>
                    <div className="text-[11px] leading-snug" style={{ color: "#6B7048" }}>
                      {p.detalle.texto}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
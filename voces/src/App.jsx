import { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, MapPin, Clock, Mic, Square, Trash2 } from "lucide-react";
import juruLogo from './assets/juru-logo.jpeg'

// ---------------------------------------------------------------------------
// JURU — proyecto propio inspirado en la idea de un "quipu" (hilos con
// nudos que guardan historias), pero no es el proyecto Quipu.
//
// Datos de ejemplo. Los relatos "demo" son marcadores de posición a
// propósito: no se inventan relatos reales sobre temas sensibles.
// Las grabaciones reales las agrega la propia persona con el micrófono,
// y sí usan su audio y duración reales.
// ---------------------------------------------------------------------------

// Aclara u oscurece un color hexadecimal. percent > 0 aclara, < 0 oscurece.
function shade(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

// Posiciones de partida ya no se necesitan como "ramas demo": el árbol
// nace vacío y cada rama se crea cuando el usuario graba un audio.
const STYLE_CYCLE = ["wave", "arc", "spiral", "zigzag"];

const TRUNK_START = [500, 630];
const FORK = [450, 420];

// Calcula un punto de destino para una rama grabada por el usuario,
// distribuyéndolas alrededor del tronco en un arco hacia arriba. La
// distancia (largo de la rama) depende de la duración de la grabación:
// entre más larga la grabación, más lejos llega el nudo final — con un
// tope (MAX_R) para que nunca se salga del lienzo visible.
const MIN_R = 140; // radio para grabaciones muy cortas
const MAX_R = 310; // radio tope, aunque la grabación sea muy larga
const DURATION_CAP = 45; // segundos a partir de los cuales ya no crece más

// Duración del crossfade al cambiar de apartado (ver displaySection más abajo).
const SECTION_FADE_MS = 260;

function recordingEndpoint(index, duration = 0) {
  const angleDeg = -170 + ((index * 41) % 150); // barrido hacia arriba
  const growth = Math.min(duration, DURATION_CAP) / DURATION_CAP; // 0..1
  const radius = MIN_R + growth * (MAX_R - MIN_R);
  const rad = (angleDeg * Math.PI) / 180;
  return [FORK[0] + radius * Math.cos(rad), FORK[1] + radius * Math.sin(rad)];
}

// Secciones del menú lateral. Cada una define su identidad (emoji + nombre),
// las palabras clave que la resumen, una descripción corta, y las preguntas
// que pueden activar conversaciones en esa sección. Las ramas de cada una
// nacen exclusivamente de las grabaciones del usuario.
const SECCIONES = [
  {
    id: "mi-vida",
    label: "🌱 Lo que soy",
    keywords: "Resiliencia · hogar · sentimientos · emociones · metas",
    desc: "Este es tu espacio más íntimo. Aquí puedes hablarnos un poco sobre ti y lo que te representa.",
    color: "#84e590",
    questions: [
      "¿Qué parte de ser mujer y cuidar de otros casi nadie ve?",
      "¿Qué haces cuando necesitas un momento para ti?",
      "¿Qué sueño has dejado pendiente?",
      "¿Qué has aprendido de ser mamá?",
      "¿Qué te gustaría que otra mujer entendiera de tu día a día?",
    ],
  },
  {
    id: "lo-que-se-hacer",
    label: "🪡 Lo que hago",
    keywords: "Trabajo · saberes · aprendizajes · emprendimiento · sueños",
    desc: "Háblanos de esos saberes que nacieron de tus manos, de tus experiencias y de todo lo que la vida te ha enseñado, cada habilidad guarda una historia, un esfuerzo y una parte de quien eres.",
    color: "#f3c407",
    questions: [
      "¿Qué sabes hacer que aprendiste de otra mujer?",
      "¿Qué habilidad te gustaría convertir en un proyecto?",
      "¿Qué has aprendido trabajando?",
      "¿Qué te gustaría enseñar a otras?",
      "¿Cuál ha sido el mayor reto para sacar adelante una idea?",
    ],
  },
  {
    id: "juntas",
    label: "🤎 Lo que comparto",
    keywords: "Experiencias · comunidad · apoyo · historias · sororidad",
    desc: "En este espacio nos reconocemos y sostenemos. La sororidad es una fuerza que florece en comunidad.",
    color: "#d7f20c",
    questions: [
      "¿Quién te ha ayudado cuando más lo necesitabas?",
      "¿Qué mujer ha dejado una huella en tu vida?",
      "¿Qué has superado y qué aprendiste de ello?",
      "¿Qué consejo le darías a otra mujer que está empezando?",
      "¿Qué podemos hacer juntas que solas sería más difícil?",
    ],
  },
];

// Sección virtual: no guarda grabaciones propias, agrega todas las de
// SECCIONES en un solo árbol para verlas todas juntas.
const TODOS_ID = "todos";
const SECCION_TODOS = {
  id: TODOS_ID,
  label: "Todo lo que compartimos",
  keywords: null,
  desc: "Todas las ramas grabadas, sin importar la sección.",
  color: "#E8C170",
};

// ---------------------------------------------------------------------------
// Generadores de curva (estilos de rama)
// ---------------------------------------------------------------------------
function wavePath([x0, y0], [x1, y1], sway = 1) {
  const midX = (x0 + x1) / 2 + (x1 > x0 ? 34 : -34) * sway;
  const midY = (y0 + y1) / 2;
  const c1x = x0 + (midX - x0) * 0.5;
  const c1y = y0 - Math.abs(y0 - y1) * 0.15;
  const c2x = midX + (x1 - midX) * 0.5;
  const c2y = y1 + Math.abs(y0 - y1) * 0.1;
  return `M ${x0} ${y0} C ${c1x} ${c1y} ${c2x} ${c2y} ${midX} ${midY} S ${x1 + (x1 > x0 ? 10 : -10)} ${(midY + y1) / 2} ${x1} ${y1}`;
}
function arcPath([x0, y0], [x1, y1]) {
  const c1x = x0 + (x1 - x0) * 0.2;
  const c1y = y0 - Math.abs(y0 - y1) * 0.65;
  const c2x = x0 + (x1 - x0) * 0.75;
  const c2y = y1 + Math.abs(y0 - y1) * 0.05;
  return `M ${x0} ${y0} C ${c1x} ${c1y} ${c2x} ${c2y} ${x1} ${y1}`;
}
function spiralPath([x0, y0], [x1, y1], sway = 1) {
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const perpx = -uy * sway, perpy = ux * sway;
  const A = [x0 + dx * 0.5, y0 + dy * 0.5];
  const B = [x0 + dx * 0.62, y0 + dy * 0.62];
  const L = 34;
  const approach = `M ${x0} ${y0} Q ${x0 + dx * 0.25} ${y0 + dy * 0.25 - 14} ${A[0]} ${A[1]}`;
  const loop = `C ${A[0] + perpx * L} ${A[1] + perpy * L} ${B[0] - perpx * L} ${B[1] - perpy * L} ${B[0]} ${B[1]}`;
  const settle = `Q ${B[0] + dx * 0.15} ${B[1] + dy * 0.15 + 10} ${x1} ${y1}`;
  return `${approach} ${loop} ${settle}`;
}
function zigzagPath([x0, y0], [x1, y1]) {
  const steps = 4;
  let d = `M ${x0} ${y0}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = x0 + (x1 - x0) * t;
    const py = y0 + (y1 - y0) * t;
    const offset = (i % 2 === 0 ? 1 : -1) * 15;
    d += ` Q ${px + offset} ${py - 6} ${px} ${py}`;
  }
  return d;
}
function cordPath(style, start, end, sway) {
  switch (style) {
    case "arc": return arcPath(start, end);
    case "spiral": return spiralPath(start, end, sway);
    case "zigzag": return zigzagPath(start, end);
    default: return wavePath(start, end, sway);
  }
}

// Obtiene la duración real de un blob de audio grabado. Los navegadores a
// veces reportan Infinity para blobs webm sin un "seek" previo; este es el
// workaround estándar para forzar el cálculo correcto.
function getBlobDuration(blob) {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = URL.createObjectURL(blob);
    audio.onloadedmetadata = () => {
      if (!isFinite(audio.duration)) {
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          resolve(audio.duration);
          audio.currentTime = 0;
        };
      } else {
        resolve(audio.duration);
      }
    };
  });
}

// Fila individual de un hilo: dibuja el path y, tras montarse, coloca los
// "nudos" a lo largo de la curva real usando getPointAtLength.
function Cord({ hilo, isActive, onSelect }) {
  const pathRef = useRef(null);
  const [knotPoints, setKnotPoints] = useState([]);
  const sway = hilo.end[0] > FORK[0] ? 1 : -1;
  const d = useMemo(() => cordPath(hilo.style, FORK, hilo.end, sway), [hilo]);

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    const pts = [];
    for (let i = 1; i <= hilo.knots; i++) {
      const pt = pathRef.current.getPointAtLength((len * i) / (hilo.knots + 1));
      pts.push(pt);
    }
    setKnotPoints(pts);
  }, [hilo, d]);

  // stopPropagation es clave aquí: el <main> que contiene el árbol tiene su
  // propio onClick para deseleccionar cuando se hace clic "fuera" de una
  // rama. Sin detener la propagación, seleccionar una rama dispararía
  // también ese handler y la rama se deseleccionaría en el mismo clic.
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(hilo.id);
  };

  return (
    <g onClick={handleClick} style={{ cursor: "pointer" }}>
      <path d={d} fill="none" stroke="transparent" strokeWidth={22} />
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={hilo.color}
        strokeWidth={isActive ? 2.6 : 1.6}
        strokeOpacity={isActive ? 1 : 0.4}
        strokeLinecap="round"
        strokeDasharray="1 5"
        style={{ transition: "stroke-width 0.35s ease, stroke-opacity 0.35s ease" }}
      />
      {knotPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={isActive ? 3.4 : 2.4}
          fill={hilo.color}
          fillOpacity={isActive ? 1 : 0.5}
          style={{ transition: "r 0.3s ease, fill-opacity 0.3s ease" }}
        />
      ))}
      <circle
        cx={hilo.end[0]}
        cy={hilo.end[1]}
        r={isActive ? 11 : 9}
        fill="none"
        stroke={hilo.color}
        strokeOpacity={isActive ? 0.8 : 0.35}
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <circle
        cx={hilo.end[0]}
        cy={hilo.end[1]}
        r={isActive ? 7 : 5}
        fill={isActive ? hilo.color : "#1C1914"}
        stroke={hilo.color}
        strokeOpacity={isActive ? 1 : 0.6}
        strokeWidth={1.5}
        style={{ transition: "all 0.3s ease" }}
      />
    </g>
  );
}

export default function JuruPrototype() {
  const [activeSection, setActiveSection] = useState("mi-vida");

  // displaySection es la sección que realmente se está pintando en el
  // lienzo (encabezado + árbol). Antes, el árbol y el encabezado seguían a
  // activeSection al instante: entre "Todos" y una sección individual se
  // sentía fluido solo porque las ramas comparten el mismo id (React
  // reutiliza el nodo), pero entre dos secciones individuales los ids son
  // distintos y todo aparecía/desaparecía de golpe. displaySection se
  // actualiza con un pequeño retraso para poder desvanecer el contenido
  // anterior antes de mostrar el nuevo, logrando una transición pareja
  // entre los tres apartados (y también hacia/desde "Todos").
  const [displaySection, setDisplaySection] = useState(activeSection);
  const [sectionVisible, setSectionVisible] = useState(true);
  const sectionFadeTimeoutRef = useRef(null);

  useEffect(() => {
    if (activeSection === displaySection) return;
    setSectionVisible(false);
    sectionFadeTimeoutRef.current = setTimeout(() => {
      setDisplaySection(activeSection);
      setSectionVisible(true);
    }, SECTION_FADE_MS);
    return () => clearTimeout(sectionFadeTimeoutRef.current);
  }, [activeSection, displaySection]);

  // targetSeccion: hacia dónde se está navegando (se usa para lógica
  // inmediata, como a qué sección pertenece una nueva grabación).
  // seccion: lo que realmente se está pintando ahora mismo en el lienzo.
  const targetSeccion =
    activeSection === TODOS_ID ? SECCION_TODOS : SECCIONES.find((s) => s.id === activeSection);
  const seccion =
    displaySection === TODOS_ID ? SECCION_TODOS : SECCIONES.find((s) => s.id === displaySection);

  // Grabaciones reales del usuario, agrupadas por sección. El árbol nace
  // vacío: hilos es exactamente lo que el usuario ha grabado en esta sección.
  const [recordings, setRecordings] = useState({}); // { [sectionId]: hilo[] }

  // Vista agregada: combina las grabaciones de todas las secciones en un
  // solo árbol. Se recalculan las posiciones (end) con un índice global
  // para que no se amontonen entre sí, conservando el color de su sección
  // de origen y el largo real según la duración de cada grabación.
  const allHilos = useMemo(() => {
    const combined = [];
    SECCIONES.forEach((s) => {
      (recordings[s.id] || []).forEach((h) => combined.push({ ...h, color: s.color }));
    });
    combined.sort((a, b) => a.id.localeCompare(b.id));
    return combined.map((h, idx) => ({
      ...h,
      end: recordingEndpoint(idx, h.duration),
      style: STYLE_CYCLE[idx % STYLE_CYCLE.length],
    }));
  }, [recordings]);

  const totalCount = useMemo(
    () => Object.values(recordings).reduce((acc, arr) => acc + (arr?.length || 0), 0),
    [recordings]
  );

  // El árbol que se dibuja usa displaySection (lo que está en pantalla
  // ahora), no activeSection (hacia dónde se navega), para que el
  // crossfade tenga tiempo de desvanecer el contenido anterior.
  const hilos = displaySection === TODOS_ID ? allHilos : recordings[displaySection] || [];

  const [activeId, setActiveId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const active = hilos.find((h) => h.id === activeId) || null;

  // Reproductor de audio real, usado solo para las ramas grabadas.
  const audioRef = useRef(null);

  // Grabación de micrófono
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordTimerRef = useRef(null);

  // Al cambiar de sección, no seleccionamos ninguna grabación automáticamente:
  // la caja de reproducción solo debe aparecer cuando el usuario elige una
  // rama a propósito. Mientras tanto se ve la caja de preguntas.
  useEffect(() => {
    setActiveId(null);
    setProgress(0);
    setPlaying(false);
  }, [activeSection]);

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }, [activeId]);

  // (ya no hay ramas "demo" simuladas: toda reproducción usa audio real)

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const togglePlay = () => {
    if (!audioRef.current || !active) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = progress >= active.duration ? 0 : audioRef.current.currentTime;
      audioRef.current.play();
    }
    setPlaying((p) => !p);
  };

  // -------------------------------------------------------------------
  // Grabación con el micrófono
  // -------------------------------------------------------------------
  const startRecording = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const duration = await getBlobDuration(blob);

        const list = recordings[activeSection] || [];
        const idx = list.length;
        const end = recordingEndpoint(idx, duration);
        const newHilo = {
          id: `rec-${Date.now()}`,
          end,
          place: "Grabación anónima",
          recordedLabel: new Date().toLocaleString("es-PE", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
          }),
          duration: Math.max(1, Math.round(duration)),
          knots: Math.max(2, Math.min(9, Math.round(duration / 6))),
          style: STYLE_CYCLE[idx % STYLE_CYCLE.length],
          color: targetSeccion.color,
          audioURL: url,
        };

        setRecordings((prev) => ({
          ...prev,
          [activeSection]: [...(prev[activeSection] || []), newHilo],
        }));
        setActiveId(newHilo.id);

        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch (err) {
      setMicError("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordTimerRef.current);
    setIsRecording(false);
  };

  // Si el usuario cambia de apartado mientras hay una grabación en curso,
  // se detiene automáticamente (lo que ya dispara el guardado normal en
  // recorder.onstop) en vez de dejarla corriendo en segundo plano sobre
  // una sección que ya no se está viendo. startRecording/stopRecording
  // capturan por clausura el apartado en el que se inició la grabación,
  // así que el audio siempre se guarda en su sección de origen aunque
  // activeSection ya haya cambiado para cuando termine de procesarse.
  const prevActiveSectionRef = useRef(activeSection);
  useEffect(() => {
    if (prevActiveSectionRef.current !== activeSection) {
      if (isRecording) {
        stopRecording();
      }
      prevActiveSectionRef.current = activeSection;
    }
  }, [activeSection, isRecording, stopRecording]);

  const deleteActiveRecording = () => {
    if (!active) return;
    // En la vista agregada hay que ubicar a qué sección pertenece la
    // grabación activa antes de poder borrarla.
    const ownerSection =
      displaySection === TODOS_ID
        ? SECCIONES.find((s) => (recordings[s.id] || []).some((h) => h.id === active.id))?.id
        : displaySection;
    if (!ownerSection) return;
    const remaining = (recordings[ownerSection] || []).filter((h) => h.id !== active.id);
    setRecordings((prev) => ({ ...prev, [ownerSection]: remaining }));
    setActiveId(null);
  };

  // Deselecciona la rama activa. Se usa cuando se hace clic en cualquier
  // zona "fuera del árbol": el fondo del lienzo, el encabezado, el hint de
  // "toca un nudo...", etc. Las ramas mismas detienen la propagación del
  // clic (ver Cord.handleClick) para no auto-deseleccionarse al elegirlas.
  const handleCanvasClick = () => setActiveId(null);

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row"
      style={{ background: "#12100D", color: "#EDE6D8", fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes juruPulse { 0% { box-shadow: 0 0 0 0 rgba(193,80,46,0.55); } 100% { box-shadow: 0 0 0 14px rgba(193,80,46,0); } }
      `}</style>

      {/* audio real, oculto, para reproducir grabaciones */}
      <audio
        ref={audioRef}
        src={active?.audioURL}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
      />

      {/* Nav lateral. self-start evita que se estire a la altura completa
          del layout (por default un flex item se estira); así el sidebar
          solo ocupa el alto de su propio contenido, como en el wireframe. */}
      <aside className="md:w-56 shrink-0 md:self-start overflow-y-auto px-6 pt-4 pb-8 border-b md:border-r" style={{ borderColor: "#26221B" }}>
        <img src={juruLogo} alt="JURU" className="h-18 w-auto mb-1 mx-auto block" />
        <div className="italic text-sm text-center mb-8" style={{ color: "#8A7C63", fontFamily: "'IBM Plex Mono', monospace" }}>
          Dejando huella
        </div>
        <nav className="flex flex-col gap-3 text-sm">
          {SECCIONES.map((s) => {
            const isActive = s.id === activeSection;
            const count = (recordings[s.id] || []).length;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="flex items-center gap-2 cursor-pointer select-none"
                style={{ color: isActive ? "#EDE6D8" : "#8A7C63", transition: "color 0.25s ease" }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#B5A88F"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#8A7C63"; }}
              >
                <span
                  className="inline-block rounded-full shrink-0"
                  style={{ width: 6, height: 6, background: s.color, opacity: isActive ? 1 : 0.4, transition: "opacity 0.25s ease" }}
                />
                {s.label}
                {count > 0 && (
                  <span className="text-xs" style={{ color: "#8A7C63", fontFamily: "'IBM Plex Mono', monospace" }}>
                    · {count}
                  </span>
                )}
              </div>
            );
          })}

          {/* Separador + vista agregada de todas las secciones */}
          <div className="mt-1 pt-3 border-t" style={{ borderColor: "#26221B" }}>
            <div
              onClick={() => setActiveSection(TODOS_ID)}
              className="flex items-center gap-2 cursor-pointer select-none font-medium"
              style={{
                color: activeSection === TODOS_ID ? "#EDE6D8" : "#8A7C63",
                transition: "color 0.25s ease",
              }}
              onMouseEnter={(e) => { if (activeSection !== TODOS_ID) e.currentTarget.style.color = "#B5A88F"; }}
              onMouseLeave={(e) => { if (activeSection !== TODOS_ID) e.currentTarget.style.color = "#8A7C63"; }}
            >
              <span
                className="inline-block rounded-full shrink-0"
                style={{
                  width: 6,
                  height: 6,
                  background: SECCION_TODOS.color,
                  opacity: activeSection === TODOS_ID ? 1 : 0.4,
                  transition: "opacity 0.25s ease",
                }}
              />
              {SECCION_TODOS.label}
              {totalCount > 0 && (
                <span className="text-xs font-normal" style={{ color: "#8A7C63", fontFamily: "'IBM Plex Mono', monospace" }}>
                  · {totalCount}
                </span>
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* Lienzo principal. flex-1 + min-h-0 es la combinación clave: sin
          min-h-0, un hijo flex nunca se encoge más allá del alto de su
          contenido, así que en ciertos zooms terminaba empujando/recortando
          el SVG en vez de ajustarse al espacio real disponible. overflow-hidden
          asegura que el SVG (absolute inset-0) nunca se salga de esta caja.
          onClick aquí deselecciona la rama activa cuando el clic no vino de
          una rama (que detiene su propagación en Cord.handleClick). */}
      <main className="relative flex-1 min-h-0 overflow-hidden" onClick={handleCanvasClick}>
        <div className="absolute top-0 left-0 right-0 px-6 py-4 z-10" style={{ background: "linear-gradient(180deg, rgba(18,16,13,0.85) 0%, rgba(18,16,13,0) 100%)" }}>
          {/* Este bloque se desvanece y reaparece junto con el árbol al
              cambiar de apartado, para que el encabezado nunca "salte" de
              golpe a la nueva sección mientras el lienzo todavía cruza. */}
          <div style={{ opacity: sectionVisible ? 1 : 0, transition: `opacity ${SECTION_FADE_MS}ms ease` }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#EDE6D8" }}>
              <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: seccion.color }} />
              {seccion.label}
            </div>
            {seccion.keywords && (
              <div
                className="text-[11px] mt-0.5 uppercase tracking-wide"
                style={{ color: seccion.color, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.85 }}
              >
                {seccion.keywords}
              </div>
            )}
            <div className="text-xs mt-0.5 max-w-md" style={{ color: "#8A7C63" }}>
              {seccion.desc}
            </div>
          </div>
        </div>

        {/* El SVG se posiciona con absolute inset-0 en vez de w-full h-full:
            así su tamaño se calcula directamente desde el contenedor (que
            ahora tiene una altura explícita), sin depender de que el
            navegador resuelva bien un % de altura dentro de un flex hijo
            en distintos niveles de zoom. preserveAspectRatio evita que el
            árbol se recorte o se estire de forma distinta según el ancho. */}
        <svg
          viewBox="0 0 960 660"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          <path
            d={`M ${TRUNK_START[0]} ${TRUNK_START[1]} C ${TRUNK_START[0] - 20} ${TRUNK_START[1] - 90} ${FORK[0] - 10} ${FORK[1] + 70} ${FORK[0]} ${FORK[1]}`}
            fill="none"
            stroke={seccion.color}
            strokeOpacity={0.55}
            strokeWidth={2.4}
            strokeLinecap="round"
            style={{ transition: "stroke 0.4s ease" }}
          />
          {/* Las ramas de la sección anterior se desvanecen y las de la
              nueva aparecen ya con la opacidad al 100%, en vez de saltar
              de un set de ramas a otro en el mismo frame. */}
          <g style={{ opacity: sectionVisible ? 1 : 0, transition: `opacity ${SECTION_FADE_MS}ms ease` }}>
            {hilos.map((h) => (
              <Cord key={h.id} hilo={h} isActive={h.id === activeId} onSelect={setActiveId} />
            ))}
          </g>
        </svg>

        {/* Botón flotante de grabación (arriba del panel en móvil para no encimarse).
            No aplica en la vista agregada: hay que elegir una sección primero.
            stopPropagation evita que el clic también dispare la deselección
            del <main>; el toggle de grabación es una acción aparte. */}
        {activeSection !== TODOS_ID ? (
          <div
            className="absolute bottom-56 right-4 md:bottom-8 md:right-6 flex flex-col items-end gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {micError && (
              <div className="text-xs px-3 py-1.5 rounded-lg max-w-[220px] text-right" style={{ background: "#33291F", color: "#D98C6E" }}>
                {micError}
              </div>
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2 rounded-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium whitespace-nowrap"
              style={{
                background: isRecording ? "#C1502E" : "#1C1914",
                color: isRecording ? "#EDE6D8" : "#EDE6D8",
                border: `1px solid ${isRecording ? "#C1502E" : "#33291F"}`,
                animation: isRecording ? "juruPulse 1.5s infinite" : "none",
              }}
            >
              {isRecording ? <Square size={14} /> : <Mic size={14} />}
              {isRecording ? `Grabando · ${fmt(recordSeconds)}` : "Grabar un nuevo relato"}
            </button>
          </div>
        ) : (
          <div className="absolute bottom-56 right-4 md:bottom-8 md:right-6 z-20 max-w-[220px] text-right">
            <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#1C1914", color: "#8A7C63", border: "1px solid #33291F" }}>
              Elige una sección para grabar un nuevo relato.
            </div>
          </div>
        )}

        <div className="hidden md:block absolute top-6 right-6 text-xs text-right z-10" style={{ color: "#5C5346", fontFamily: "'IBM Plex Mono', monospace" }}>
          Toca una rama para escuchar ese relato
        </div>
      </main>

      {/* Panel de relato activo, o mensaje de árbol vacío. Vive fuera de
          <main>, posicionado contra todo el layout (root es "relative"),
          para poder ubicarse pegado a la izquierda real de la pantalla —
          en el espacio que deja el sidebar corto — sin que su posición
          dependa del ancho/alto del lienzo. stopPropagation evita que
          interactuar con el panel dispare la deselección del <main>.
          Usa targetSeccion (no seccion) para el color y las preguntas,
          así responde de inmediato al clic en el menú en vez de esperar
          el crossfade del árbol. */}
      {active ? (
        <div
          className="absolute left-4 right-4 md:left-4 md:right-auto md:w-[440px] bottom-8 md:bottom-auto md:top-96 rounded-xl px-4 py-4 md:px-6 md:py-5 md:max-h-[calc(100vh-18rem)] md:overflow-y-auto z-30"
          style={{ background: "rgba(28,25,20,0.92)", border: "1px solid #33291F", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2 text-[11px] md:text-xs" style={{ color: "#8A7C63", fontFamily: "'IBM Plex Mono', monospace" }}>
              <MapPin size={12} /> {active.place}
              <span className="mx-1">·</span>
              <Clock size={12} /> {active.recordedLabel}
            </div>
            <button onClick={deleteActiveRecording} style={{ color: "#8A7C63" }} title="Borrar grabación">
              <Trash2 size={13} />
            </button>
          </div>

          <div className="italic text-base md:text-xl mb-4 md:mb-5 leading-snug" style={{ fontFamily: "'Fraunces', serif", color: "#EDE6D8" }}>
            Grabación anónima — toca reproducir para escucharla.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="rounded-full flex items-center justify-center shrink-0 w-9 h-9 md:w-10 md:h-10"
              style={{ background: active.color, color: "#12100D" }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
            </button>

            <div className="flex-1">
              <div className="relative h-1.5 rounded-full" style={{ background: "#33291F" }}>
                <div
                  className="absolute left-0 top-0 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (progress / active.duration) * 100)}%`, background: active.color, transition: "width 0.2s linear" }}
                />
                {Array.from({ length: active.knots }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${((i + 1) / (active.knots + 1)) * 100}%`,
                      top: -1.5, width: 4.5, height: 4.5, background: "#8A7C63",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: "#8A7C63", fontFamily: "'IBM Plex Mono', monospace" }}>
                <span>{fmt(progress)}</span>
                <span>{fmt(active.duration)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="absolute left-4 right-4 md:left-4 md:right-auto md:w-[380px] bottom-8 md:bottom-auto md:top-85 rounded-xl px-4 py-4 md:px-6 md:py-5 z-30"
          style={{ background: "rgba(28,25,20,0.75)", border: "1px dashed #33291F" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-sm" style={{ color: "#8A7C63" }}>
            {hilos.length > 0
              ? "Toca una rama para escuchar ese relato."
              : "Todavía no hay relatos. Graba tu primer relato con el botón de abajo."}
          </div>
          {targetSeccion.questions && targetSeccion.questions.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: "#33291F" }}>
              <div
                className="text-[10px] uppercase tracking-wide mb-2"
                style={{ color: targetSeccion.color, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Preguntas para inspirarte
              </div>
              <ul className="flex flex-col gap-1.5 text-xs" style={{ color: "#B5A88F" }}>
                {targetSeccion.questions.map((q, i) => (
                  <li key={i} className="leading-snug">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
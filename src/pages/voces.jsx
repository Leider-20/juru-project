import { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, MapPin, Clock, Mic, Square, Trash2, Menu, X, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import juruLogo from "../images/juru-logo.png";

// Imágenes de la portada "Formar la palabra" — carpeta: src/images/voces_img/
// Nombres que debes ponerle a tus archivos:
//   juru-voces_ramas_superior_derecha.png  -> ramas rojizas de arriba a la derecha
//   juru-voces_ramas_inferior_izquierda.png -> ramas doradas de abajo a la izquierda
import ramasDerecha from "../images/voces_img/juru-voces_ramas_superior_derecha.png";
import ramasIzquierda from "../images/voces_img/juru-voces_ramas_inferior_izquierda.png";

// ---------------------------------------------------------------------------
// JURU — proyecto propio inspirado en la idea de un "quipu" (hilos con
// nudos que guardan historias), pero no es el proyecto Quipu.
//
// Datos de ejemplo. Los relatos "demo" son marcadores de posición a
// propósito: no se inventan relatos reales sobre temas sensibles.
// Las grabaciones reales las agrega la propia persona con el micrófono,
// y sí usan su audio y duración reales.
// ---------------------------------------------------------------------------

// Barra de navegación (misma del Home). Los enlaces con ancla van como <a>
// con "/#..." para que, al venir desde otra página, el navegador cargue el
// Home y se desplace hasta la sección.
const NAV_LINKS_IZQ = [{ label: "Sobre nosotros", href: "/#quienes-somos" }];
const NAV_LINKS_DER = [{ label: "Memorias", href: "/memorias" }];

// Tiempos de la transición portada <-> foro (ms)
const FORO_SCROLL_MS = 900; // referencia de lo que tarda el scroll suave; el bloqueo espera el doble como tope de seguridad
const FORO_SALIDA_MS = 850; // lo que tarda el regreso a la portada antes de cerrar el foro

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
      "¿Qué te gustaría que otra mujer entendiera de tu día a día?",
    ],
  },
  {
    id: "lo-que-se-hacer",
    label: "🪡 Lo que has aprendido",
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

// ---------------------------------------------------------------------------
// Persistencia local con IndexedDB: guarda los audios (como Blob real, no
// texto) en el propio navegador, sin necesitar servidor ni base de datos
// externa. Sobrevive a recargar la página, pero vive solo en este navegador.
// ---------------------------------------------------------------------------
const DB_NAME = "juru-db";
const DB_VERSION = 1;
const STORE_NAME = "recordings";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbSaveRecording(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDeleteRecording(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbLoadAllRecordings() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("mi-vida");

  // Sección del foro: el botón "¿Qué quieres compartir hoy?" de la portada
  // baja hasta aquí.
  // El foro NO se muestra hasta que la persona toca el botón: así la portada
  // se ve completa y el botón tiene sentido. Al abrirse, aparece con un
  // fundido y la página baja hasta él (scroll suave). Una vez abajo, la
  // página se bloquea: solo se puede volver a la portada con el botón
  // "Volver" del menú lateral, que hace la transición inversa.
  const foroRef = useRef(null);
  const [foroAbierto, setForoAbierto] = useState(false);
  const [foroSaliendo, setForoSaliendo] = useState(false);

  // rAF de la espera de salida (ver volverALaPortada)
  const salidaRef = useRef(0);
  useEffect(() => () => cancelAnimationFrame(salidaRef.current), []);

  // Mientras el foro se está yendo (sube a la portada) la página no debe
  // poder moverse: si el usuario interrumpe la subida suave, el foro se
  // cerraría con la página a medio camino y todo "se reacomodaría" de golpe.
  useEffect(() => {
    if (!foroSaliendo) return;
    const bloquear = (e) => e.preventDefault();
    window.addEventListener("wheel", bloquear, { passive: false });
    window.addEventListener("touchmove", bloquear, { passive: false });
    return () => {
      window.removeEventListener("wheel", bloquear);
      window.removeEventListener("touchmove", bloquear);
    };
  }, [foroSaliendo]);

  const irAlForo = () => {
    // Si el foro todavía se está yendo, ignorar el clic: abrirlo ahora
    // chocaría con el cierre pendiente (se desmontaba a mitad de la bajada).
    if (foroSaliendo) return;
    if (!foroAbierto) {
      setForoAbierto(true); // el scroll se hace en el efecto de abajo
    } else {
      foroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Bajada: al montarse el foro, scroll suave hasta él.
  useEffect(() => {
    if (!foroAbierto) return;
    const id = requestAnimationFrame(() => {
      foroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [foroAbierto]);

  // Bloqueo: mientras el foro está abierto la página no se puede mover.
  // Fases:
  //  1) Transición: baja suave hacia el foro. Se bloquea TODO input del
  //     usuario para que no pueda interrumpir la animación a medias (si la
  //     interrumpe, el bloqueo después lo "salta" bruscamente a su sitio).
  //  2) Bloqueo: al llegar, se fija la posición exacta, se oculta el
  //     overflow y se anula el rebote elástico.
  // Se libera al volver o al salir.
  useEffect(() => {
    if (!foroAbierto || foroSaliendo) return;

    const html = document.documentElement;
    const body = document.body;
    let lockY = null;
    let raf = 0;
    const inicio = performance.now();

    // Posición final de la página con el foro justo bajo la barra,
    // limitada a lo que la página realmente puede desplazarse.
    const calcularObjetivo = () => {
      const el = foroRef.current;
      if (!el) return null;
      const max = Math.max(0, html.scrollHeight - window.innerHeight);
      const y = el.getBoundingClientRect().top + window.scrollY - 70;
      return Math.min(Math.max(0, y), max);
    };

    const activar = () => {
      const y = calcularObjetivo();
      if (y === null) return;
      lockY = y;
      // scroll-behavior: auto evita que el CSS "smooth" convierta el
      // reposicionamiento en una animación (el efecto raro en Safari).
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, lockY);
      html.style.scrollbarGutter = "stable"; // evita el salto de ancho al ocultar la barra
      html.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      body.style.overscrollBehavior = "none";
    };

    // Espera a que termine el scroll suave (o a un tope de seguridad)
    const esperar = () => {
      const y = calcularObjetivo();
      const llego = y !== null && Math.abs(window.scrollY - y) < 2;
      if (llego || performance.now() - inicio > FORO_SCROLL_MS * 2) {
        activar();
      } else {
        raf = requestAnimationFrame(esperar);
      }
    };
    raf = requestAnimationFrame(esperar);

    // Un panel con scroll interno solo puede desplazarse si de verdad tiene
    // contenido por recorrer en esa dirección; si no, el gesto se cancela
    // para que no "se escape" hacia la página.
    const puedeDesplazarse = (target, direccion) => {
      const panel = target instanceof Element ? target.closest(".vp-sin-barra") : null;
      if (!panel) return false;
      const max = panel.scrollHeight - panel.clientHeight;
      if (max <= 1) return false;
      return direccion < 0 ? panel.scrollTop > 0 : panel.scrollTop < max - 1;
    };

    const onWheel = (e) => {
      if (puedeDesplazarse(e.target, e.deltaY)) return;
      e.preventDefault();
    };

    let touchY = 0;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY;
      const direccion = touchY - y; // > 0: el dedo sube = la página quiere bajar
      touchY = y;
      if (puedeDesplazarse(e.target, direccion)) return;
      e.preventDefault();
    };

    const TECLAS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    const onKeyDown = (e) => {
      if (!TECLAS.includes(e.key)) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      // Escribir / mover un control sigue funcionando; la barra espaciadora
      // además debe seguir activando botones y enlaces.
      const selector =
        e.key === " "
          ? "input, textarea, select, button, a, [role='slider']"
          : "input, textarea, select, [role='slider']";
      if (t.closest(selector)) return;
      e.preventDefault();
    };

    // Red de seguridad: si algo logra mover la página, vuelve a su sitio.
    const onScroll = () => {
      if (lockY !== null && Math.abs(window.scrollY - lockY) > 1) {
        window.scrollTo(0, lockY);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      html.style.overflow = "";
      html.style.overscrollBehavior = "";
      html.style.scrollbarGutter = "";
      html.style.scrollBehavior = "";
      body.style.overscrollBehavior = "";
    };
  }, [foroAbierto, foroSaliendo]);

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

  // Fondo del body igual al de la página (evita franjas claras al hacer
  // scroll elástico) y arranque siempre desde la portada.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.style.background = "#12100D";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const targetSeccion =
    activeSection === TODOS_ID ? SECCION_TODOS : SECCIONES.find((s) => s.id === activeSection);
  const seccion =
    displaySection === TODOS_ID ? SECCION_TODOS : SECCIONES.find((s) => s.id === displaySection);

  const [recordings, setRecordings] = useState({}); // { [sectionId]: hilo[] }

  // Al montar la app, recupera las grabaciones guardadas en IndexedDB de
  // sesiones anteriores y reconstruye sus audioURL (URL.createObjectURL
  // no persiste entre recargas: hay que regenerarla desde el Blob guardado).
  useEffect(() => {
    (async () => {
      try {
        const rows = await dbLoadAllRecordings();
        const grouped = {};
        rows.forEach((r) => {
          const hilo = {
            id: r.id,
            end: r.end,
            place: r.place,
            recordedLabel: r.recordedLabel,
            duration: r.duration,
            knots: r.knots,
            style: r.style,
            color: r.color,
            audioURL: URL.createObjectURL(r.blob),
          };
          grouped[r.sectionId] = grouped[r.sectionId] || [];
          grouped[r.sectionId].push(hilo);
        });
        setRecordings(grouped);
      } catch (err) {
        console.error("No se pudieron cargar las grabaciones guardadas:", err);
      }
    })();
  }, []);

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

  const hilos = displaySection === TODOS_ID ? allHilos : recordings[displaySection] || [];

  const [activeId, setActiveId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const active = hilos.find((h) => h.id === activeId) || null;

  const audioRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordTimerRef = useRef(null);

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

  // ---- Barra de progreso interactiva (clic / arrastrar / teclado) --------
  const barRef = useRef(null);
  const [scrubbing, setScrubbing] = useState(false);

  // Duración "real" del audio: la del elemento si el navegador ya la conoce,
  // y si no, la que calculamos al grabar.
  const getTotal = () => {
    const a = audioRef.current;
    if (a && isFinite(a.duration) && a.duration > 0) return a.duration;
    return active ? active.duration : 0;
  };

  const seekTo = (seconds) => {
    const a = audioRef.current;
    if (!a || !active) return;
    const total = getTotal();
    const t = Math.min(total, Math.max(0, seconds));
    a.currentTime = t;
    setProgress(t);
  };

  const seekFromClientX = (clientX) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return;
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    seekTo(frac * getTotal());
  };

  const onBarPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubbing(true);
    seekFromClientX(e.clientX);
  };
  const onBarPointerMove = (e) => {
    if (scrubbing) seekFromClientX(e.clientX);
  };
  const onBarPointerUp = (e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setScrubbing(false);
  };
  const onBarKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); seekTo(progress + 5); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(progress - 5); }
    else if (e.key === "Home") { e.preventDefault(); seekTo(0); }
    else if (e.key === "End") { e.preventDefault(); seekTo(getTotal()); }
  };

  // Los audios grabados con MediaRecorder (webm) suelen llegar sin duración
  // ni "índice" para saltar, y por eso el navegador no deja mover la barra.
  // Truco estándar: saltar al final una vez para que calcule la duración y
  // volver al inicio; desde ahí ya se puede retroceder/adelantar.
  const handleAudioMetadata = (e) => {
    const a = e.currentTarget;
    if (isFinite(a.duration)) return;
    const volver = () => {
      a.removeEventListener("timeupdate", volver);
      a.currentTime = 0;
    };
    a.addEventListener("timeupdate", volver);
    a.currentTime = 1e101;
  };

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

        try {
          await dbSaveRecording({
            id: newHilo.id,
            sectionId: activeSection,
            blob,
            place: newHilo.place,
            recordedLabel: newHilo.recordedLabel,
            duration: newHilo.duration,
            knots: newHilo.knots,
            style: newHilo.style,
            end: newHilo.end,
            color: newHilo.color,
          });
        } catch (err) {
          console.error("No se pudo guardar la grabación:", err);
        }

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

  // Subida: transición inversa a la de bajar. El foro se desvanece mientras
  // la página sube suavemente a la portada; al terminar, el foro se cierra
  // (así "¿Qué quieres compartir hoy?" vuelve a funcionar igual que al inicio).
  const volverALaPortada = () => {
    if (foroSaliendo) return;
    if (isRecording) stopRecording();
    if (audioRef.current) audioRef.current.pause();
    setPlaying(false);
    setForoSaliendo(true); // esto también libera el bloqueo de scroll
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });

    // El foro solo se cierra cuando la página YA llegó arriba (y el fundido
    // terminó). Con un tiempo fijo, si la subida suave tardaba más, el foro
    // se desmontaba a mitad de camino, la página se encogía de golpe y el
    // navegador la reubicaba bruscamente; eso se notaba al volver a bajar.
    const inicio = performance.now();
    const esperarSubida = () => {
      const t = performance.now() - inicio;
      const arriba = window.scrollY <= 1;
      if ((arriba && t >= FORO_SALIDA_MS) || t > FORO_SALIDA_MS * 3) {
        if (window.scrollY > 1) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        setForoAbierto(false);
        setForoSaliendo(false);
        setActiveId(null);
      } else {
        salidaRef.current = requestAnimationFrame(esperarSubida);
      }
    };
    salidaRef.current = requestAnimationFrame(esperarSubida);
  };

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
    const ownerSection =
      displaySection === TODOS_ID
        ? SECCIONES.find((s) => (recordings[s.id] || []).some((h) => h.id === active.id))?.id
        : displaySection;
    if (!ownerSection) return;
    const remaining = (recordings[ownerSection] || []).filter((h) => h.id !== active.id);
    setRecordings((prev) => ({ ...prev, [ownerSection]: remaining }));
    dbDeleteRecording(active.id).catch((err) => console.error("No se pudo borrar de IndexedDB:", err));
    setActiveId(null);
  };

  const handleCanvasClick = () => setActiveId(null);

  return (
    <div
      className="relative w-full min-h-screen flex flex-col"
      style={{ background: "#12100D", color: "#EDE6D8", fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Fredoka:wght@400;500&family=Judson:wght@400&family=Comfortaa:wght@300;400&display=swap');
        :root {
          --ease-figma: cubic-bezier(0.42, 0, 1, 1);
          --ease-slide: cubic-bezier(0, 0, 0.58, 1);
        }
        /* scrollbar-gutter reserva siempre el espacio de la barra de scroll:
           así el ancho de la página no cambia cuando el foro aparece/desaparece
           ni cuando se bloquea el scroll (era otro "reacomodo" visible). */
        html { scroll-behavior: smooth; scrollbar-gutter: stable; }
        @keyframes juruPulse { 0% { box-shadow: 0 0 0 0 rgba(193,80,46,0.55); } 100% { box-shadow: 0 0 0 14px rgba(193,80,46,0); } }
        @keyframes vocesCanvasIn { from { opacity: 0; transform: scale(1.025); } to { opacity: 1; transform: scale(1); } }
        @keyframes vocesAsideIn { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes vocesFloatIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vocesNavIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vnMenuIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes vpFadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vpFadeOut { from { opacity: 1; } to { opacity: 0; } }
        .voces-canvas { animation: vocesCanvasIn 800ms cubic-bezier(.22,1,.36,1) both; }
        .voces-aside { animation: vocesAsideIn 650ms cubic-bezier(.22,1,.36,1) 100ms both; }
        .voces-header { animation: vocesFloatIn 600ms cubic-bezier(.22,1,.36,1) 260ms both; }
        .voces-controls { animation: vocesFloatIn 600ms cubic-bezier(.22,1,.36,1) 420ms both; }
        .voces-nav { animation: vocesNavIn 500ms cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .voces-canvas, .voces-aside, .voces-header, .voces-controls, .voces-nav { animation: none; }
          .vp-anim, .vp-foro { animation: none !important; }
        }

        /* ---------- Portada "Formar la palabra" ---------- */
        .vp-intro {
          position: relative;
          overflow: hidden;
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 90px 24px 100px;
          background: #12100D;
          color: #fff;
          font-family: 'Comfortaa', 'Fredoka', sans-serif;
          font-weight: 300;
        }
        .vp-ramas {
          position: absolute;
          pointer-events: none;
          user-select: none;
          max-width: none;
          animation: vpFadeIn 1200ms var(--ease-slide) 150ms both;
        }
        .vp-ramas--der { top: 0; right: 0; width: min(62vw, 900px); }
        .vp-ramas--izq { bottom: 0; left: 0; width: min(44vw, 640px); }
        .vp-contenido {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 470px;
          text-align: center;
        }
        .vp-titulo {
          margin: 0 0 54px;
          font: 300 clamp(40px, 5vw, 66px)/1.2 'Comfortaa', sans-serif;
          text-transform: uppercase;
          letter-spacing: .01em;
          animation: vpFadeUp 800ms var(--ease-slide) 100ms both;
        }
        .vp-texto {
          margin: 0;
          font: 300 clamp(15px, 1.45vw, 19px)/1.27 'Comfortaa', sans-serif;
          animation: vpFadeUp 800ms var(--ease-slide) 250ms both;
        }
        .vp-subtitulo {
          margin: 22px 0 40px;
          font: 300 clamp(22px, 2.3vw, 30px)/1.3 'Comfortaa', sans-serif;
          animation: vpFadeUp 800ms var(--ease-slide) 380ms both;
        }
        .vp-texto--2 { animation-delay: 500ms; }
        .vp-boton {
          margin-top: 30px;
          padding: 14px 29px;
          border: 1px solid #fff;
          border-radius: 999px;
          background: transparent;
          color: #fff;
          cursor: pointer;
          font: 500 clamp(16px, 1.5vw, 20px) 'Fredoka', sans-serif;
          animation: vpFadeUp 800ms var(--ease-slide) 650ms both;
          transition: background 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .vp-boton:hover { background: rgba(255,255,255,.16); transform: translateY(-2px); }
        .vp-foro {
          /* El foro ocupa exactamente la pantalla visible bajo la barra, para
             que se vea completo (rama de arriba y botón de grabar). */
          height: calc(100vh - 70px);
          height: calc(100dvh - 70px);
          min-height: 460px;
          animation: vpFadeIn 700ms var(--ease-slide) both;
        }
        /* Salida: mismo fundido que al entrar, pero hacia afuera */
        .vp-foro--saliendo { animation: vpFadeOut 700ms var(--ease-figma) forwards; }
        @media (max-width: 767px) { .vp-foro { min-height: 640px; } }
        .vp-boton:focus-visible { outline: 2px solid #d3da63; outline-offset: 4px; }

        /* Paneles del foro: se pueden desplazar pero sin mostrar la barra */
        .vp-sin-barra { scrollbar-width: none; -ms-overflow-style: none; overscroll-behavior: contain; }
        .vp-sin-barra::-webkit-scrollbar { display: none; }

        /* Botón para volver a la portada (menú lateral del foro) */
        .vp-volver {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto 18px;
          padding: 7px 16px 7px 12px;
          border: 1px solid #5C5346;
          border-radius: 999px;
          background: rgba(28,25,20,.78);
          color: #EDE6D8;
          cursor: pointer;
          font: 500 12px 'Fredoka', sans-serif;
          transition: background .25s ease, border-color .25s ease, transform .25s ease;
        }
        .vp-volver:hover { background: #C1502E; border-color: #C1502E; transform: translateY(-2px); }
        .vp-volver:focus-visible { outline: 2px solid #d3da63; outline-offset: 3px; }

        /* ---------- Barra de navegación (misma del Home) ---------- */
        .vn-bar {
          position: sticky;
          top: 0;
          z-index: 40;
          flex-shrink: 0;
          height: 70px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 4.5vw;
          /* Mismo color que antes (gris translúcido sobre el fondo oscuro),
             pero sólido: ahora la barra queda fija al hacer scroll. */
          background: #1E1C1A;
          border-bottom: 1px solid #26221B;
        }
        .vn-logo-wrap { justify-self: start; }
        .vn-logo { width: 86px; height: auto; display: block; }
        .vn-right { justify-self: end; display: flex; align-items: center; }
        .vn-links {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 34px;
          color: rgba(255,255,255,.92);
          font: 500 14px 'Fredoka', sans-serif;
        }
        .vn-links a {
          position: relative;
          text-decoration: none;
          color: inherit;
          transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide);
        }
        .vn-links a::after {
          content: '';
          position: absolute;
          left: 0; bottom: -7px;
          width: 100%; height: 1px;
          background: rgba(255,255,255,.8);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease-slide);
        }
        .vn-links a:hover { opacity: .75; transform: translateY(-1px); }
        .vn-links a:hover::after { transform: scaleX(1); }
        .vn-links a.vn-active {
          padding: 9px 22px;
          background: rgba(217,217,217,.46);
          border-radius: 999px;
        }
        .vn-links a.vn-active::after { display: none; }
        .vn-club {
          padding: 9px 22px;
          border-radius: 999px;
          background: #d3da63;
          color: #272626;
          text-decoration: none;
          font: 400 14px 'Fredoka', sans-serif;
          white-space: nowrap;
          transition: filter 300ms var(--ease-slide), transform 300ms var(--ease-slide);
        }
        .vn-club:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .vn-menu-btn { display: none; border: 0; background: transparent; color: white; cursor: pointer; }

        .vn-overlay {
          position: fixed; inset: 0; z-index: 60;
          background: #1F1B14; color: white;
          display: flex; flex-direction: column;
          animation: vnMenuIn 300ms var(--ease-slide) both;
        }
        .vn-overlay-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; }
        .vn-overlay nav {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 28px; font: 400 28px 'Judson', serif;
        }
        .vn-overlay nav a { text-decoration: none; color: inherit; transition: opacity 500ms var(--ease-figma), transform 300ms var(--ease-slide); }
        .vn-overlay nav a:hover { opacity: .65; transform: translateX(5px); }

        @media (max-width: 900px) {
          .vn-links, .vn-club { display: none; }
          .vn-menu-btn { display: block; }
          .vp-ramas--der { width: 90vw; opacity: .55; }
          .vp-ramas--izq { width: 70vw; opacity: .55; }
        }
        @media (max-width: 560px) {
          .vn-bar { padding: 0 20px; }
          .vn-logo { width: 74px; }
          .vp-intro { padding: 70px 22px 80px; }
          .vp-titulo { margin-bottom: 36px; }
        }
      `}</style>

      <audio
        ref={audioRef}
        src={active?.audioURL}
        onLoadedMetadata={handleAudioMetadata}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
      />

      {/* ------------------- Barra de navegación ------------------- */}
      <header className="vn-bar voces-nav">
        <div className="vn-logo-wrap">
          <Link to="/" aria-label="JURU inicio">
            <img className="vn-logo" src={juruLogo} alt="JURU" />
          </Link>
        </div>

        <nav className="vn-links" aria-label="Navegación principal">
          {NAV_LINKS_IZQ.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
          <Link to="/vive">Vive</Link>
          <Link to="/voces" className="vn-active" aria-current="page">Voces</Link>
          {NAV_LINKS_DER.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="vn-right">
          <Link to="/clubCreativo" className="vn-club">Club Creativo</Link>
          <button className="vn-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Menu size={27} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="vn-overlay">
          <div className="vn-overlay-head">
            <img src={juruLogo} alt="JURU" className="vn-logo" />
            <button className="vn-menu-btn" style={{ display: "block" }} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
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
            <Link to="/clubCreativo" onClick={() => setMenuOpen(false)}>Club Creativo</Link>
          </nav>
        </div>
      )}

      {/* ------------------- Portada: Formar la palabra ------------------- */}
      <section className="vp-intro" aria-label="Formar la palabra">
        <img className="vp-ramas vp-ramas--der vp-anim" src={ramasDerecha} alt="" aria-hidden="true" />
        <img className="vp-ramas vp-ramas--izq vp-anim" src={ramasIzquierda} alt="" aria-hidden="true" />

        <div className="vp-contenido">
          <h1 className="vp-titulo vp-anim">Formar la palabra</h1>

          <p className="vp-texto vp-anim">
            Desde 2018, JURU ha sido un espacio para encontrarnos, aprender, crear y compartir entre mujeres del Resguardo Indígena La Trina. Aquí, cada experiencia, saber y relato tiene un lugar.
          </p>

          <p className="vp-subtitulo vp-anim">Este espacio nace para continuar esa conversación</p>

          <p className="vp-texto vp-texto--2 vp-anim">
Comparte tus experiencias, los aprendizajes de los talleres de tu cajita mensual, tus técnicas artesanales, ideas y opiniones. ¡Este foro también es tuyo, participa! Publica tus creaciones, comparte tus dudas, intercambia consejos y anímate a aprender de otras mujeres. Cada aporte cuenta y puede inspirar nuevas ideas para crear y emprender juntas.
Porque cuando ponemos nuestros conocimientos en común, nuestras voces se fortalecen y crecemos juntas como comunidad de artesanas.          </p>

          <button type="button" className="vp-boton vp-anim" onClick={irAlForo}>
            ¿Qué quieres compartir hoy?
          </button>
        </div>
      </section>

      {/* ------------------- Foro de voces (debajo de la portada) ------------------- */}
      {foroAbierto && (
      <section
        id="foro"
        ref={foroRef}
        className={`vp-foro ${foroSaliendo ? "vp-foro--saliendo" : ""} relative flex flex-col overflow-hidden`}
        style={{ scrollMarginTop: 70 }}
        aria-label="Foro de voces"
      >
      <div className="relative flex-1 min-h-0 flex flex-col md:flex-row">
        {/* Columna izquierda: menú de secciones + panel de relato.
            En escritorio el panel va justo debajo del menú; en móvil el
            wrapper no es "relative", así el panel se ancla al fondo. */}
        <div className="static md:relative md:w-[17rem] shrink-0 md:flex md:flex-col">
          <aside
            className="voces-aside w-full md:shrink-0 px-5 pt-6 pb-8 border-b md:border-r"
            style={{ borderColor: "#26221B" }}
          >
            {/* Única forma de volver a la portada desde el foro */}
            <button type="button" className="vp-volver" onClick={volverALaPortada} aria-label="Volver a la portada">
              <ArrowUp size={15} />
              Volver
            </button>

            <div className="italic text-sm text-center mb-6" style={{ color: "#8A7C63", fontFamily: "'IBM Plex Mono', monospace" }}>
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
                    className="flex items-center gap-2 whitespace-nowrap cursor-pointer select-none"
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

              <div className="mt-1 pt-3 border-t" style={{ borderColor: "#26221B" }}>
                <div
                  onClick={() => setActiveSection(TODOS_ID)}
                  className="flex items-center gap-2 whitespace-nowrap cursor-pointer select-none font-medium"
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

          {active ? (
            <div
              className="vp-sin-barra absolute left-4 right-4 bottom-8 md:relative md:left-auto md:right-auto md:bottom-auto md:mt-4 md:mb-6 md:ml-4 md:w-[420px] md:min-h-0 rounded-xl px-4 py-4 md:px-6 md:py-4 md:overflow-y-auto z-30"
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
                  {/* Zona de toque más alta que la barra para que sea fácil de agarrar */}
                  <div
                    ref={barRef}
                    role="slider"
                    tabIndex={0}
                    aria-label="Posición de la grabación"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(active.duration)}
                    aria-valuenow={Math.round(progress)}
                    aria-valuetext={`${fmt(progress)} de ${fmt(active.duration)}`}
                    className="relative py-2 -my-2 cursor-pointer select-none outline-none"
                    style={{ touchAction: "none" }}
                    onPointerDown={onBarPointerDown}
                    onPointerMove={onBarPointerMove}
                    onPointerUp={onBarPointerUp}
                    onPointerCancel={onBarPointerUp}
                    onKeyDown={onBarKeyDown}
                  >
                    <div className="relative h-1.5 rounded-full" style={{ background: "#33291F" }}>
                      <div
                        className="absolute left-0 top-0 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (progress / (getTotal() || 1)) * 100)}%`,
                          background: active.color,
                          transition: scrubbing ? "none" : "width 0.2s linear",
                        }}
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
                      {/* Perilla que marca el momento actual */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          left: `${Math.min(100, (progress / (getTotal() || 1)) * 100)}%`,
                          top: "50%",
                          width: scrubbing ? 16 : 12,
                          height: scrubbing ? 16 : 12,
                          transform: "translate(-50%, -50%)",
                          background: active.color,
                          boxShadow: "0 0 0 3px rgba(18,16,13,0.9)",
                          transition: scrubbing ? "width .15s, height .15s" : "left 0.2s linear, width .15s, height .15s",
                        }}
                      />
                    </div>
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
              className="vp-sin-barra absolute left-4 right-4 bottom-8 md:relative md:left-auto md:right-auto md:bottom-auto md:mt-4 md:mb-6 md:ml-4 md:w-[420px] md:min-h-0 rounded-xl px-4 py-4 md:px-6 md:py-4 md:overflow-y-auto z-30"
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
                  <ul className="flex flex-col gap-1 text-xs" style={{ color: "#B5A88F" }}>
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

        <main className="voces-canvas relative flex-1 min-h-0 overflow-hidden" onClick={handleCanvasClick}>
          <div className="voces-header absolute top-0 left-0 right-0 px-6 py-4 z-10" style={{ background: "linear-gradient(180deg, rgba(18,16,13,0.85) 0%, rgba(18,16,13,0) 100%)" }}>
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
            <g style={{ opacity: sectionVisible ? 1 : 0, transition: `opacity ${SECTION_FADE_MS}ms ease` }}>
              {hilos.map((h) => (
                <Cord key={h.id} hilo={h} isActive={h.id === activeId} onSelect={setActiveId} />
              ))}
            </g>
          </svg>

          {activeSection !== TODOS_ID ? (
            <div
              className="voces-controls absolute bottom-56 right-4 md:bottom-8 md:right-6 flex flex-col items-end gap-2 z-20"
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
            <div className="voces-controls absolute bottom-56 right-4 md:bottom-8 md:right-6 z-20 max-w-[220px] text-right">
              <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#1C1914", color: "#8A7C63", border: "1px solid #33291F" }}>
                Elige una sección para grabar un nuevo relato.
              </div>
            </div>
          )}
        </main>
      </div>
      </section>
      )}
    </div>
  );
}
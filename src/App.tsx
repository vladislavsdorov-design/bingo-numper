// import { useState, useEffect, useRef } from "react";
// import {
//   RotateCcw,
//   Trash2,
//   Monitor,
//   ArrowLeft,
//   PartyPopper,
//   X,
//   WifiOff,
// } from "lucide-react";
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue, set, Database } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyBghDQYhpnLcXzzKsG8MtKHEre_wUaIYJM",
//   authDomain: "lapose-d2a83.firebaseapp.com",
//   databaseURL:
//     "https://lapose-d2a83-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "lapose-d2a83",
//   storageBucket: "lapose-d2a83.firebasestorage.app",
//   messagingSenderId: "633119883215",
//   appId: "1:633119883215:web:9edb546bdd7ee505919cba",
//   measurementId: "G-XBH8CV4L5Y",
// };

// let db: Database | null = null;
// try {
//   const app = initializeApp(firebaseConfig);
//   db = getDatabase(app);
// } catch (e) {
//   db = null;
// }

// const MAX_NUMBER = 75;
// const GRID_COLUMNS = 10;
// const CONFETTI_COLORS = [
//   "#d4a73c",
//   "#b4483a",
//   "#3e8073",
//   "#6b4a82",
//   "#f2e9d0",
//   "#3e6e8e",
// ];

// interface ConfettiPiece {
//   id: number;
//   kind: string;
//   left: number;
//   size: number;
//   color: string;
//   duration: number;
//   delay: number;
//   rotate: number;
//   sway: number;
// }

// interface DisplayNumber {
//   number: number;
//   color: string;
// }

// function makeConfetti(count: number): ConfettiPiece[] {
//   return Array.from({ length: count }, (_, i) => ({
//     id: i,
//     kind: Math.random() > 0.65 ? "streamer" : "square",
//     left: Math.random() * 100,
//     size: 6 + Math.random() * 9,
//     color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
//     duration: 2.4 + Math.random() * 2.2,
//     delay: Math.random() * 0.8,
//     rotate: Math.random() * 360,
//     sway: 20 + Math.random() * 40,
//   }));
// }

// // Цвета для шариков
// const BALL_COLORS = [
//   "#d4a73c", // золотой
//   "#e74c3c", // красный
//   "#3498db", // синий
//   "#2ecc71", // зеленый
//   "#f39c12", // оранжевый
//   "#9b59b6", // фиолетовый
//   "#1abc9c", // бирюзовый
//   "#e67e22", // тыквенный
//   "#e84393", // розовый
//   "#00b894", // изумрудный
// ];

// export default function BingoCaller() {
//   const [called, setCalled] = useState<number[]>([]);
//   const [celebrating, setCelebrating] = useState<boolean>(false);
//   const [view, setView] = useState<"admin" | "display">("admin");
//   const [pulseKey, setPulseKey] = useState<number>(0);
//   const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
//   const [offline, setOffline] = useState<boolean>(!db);
//   const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

//   const lastRef = useRef<number | undefined>(undefined);
//   const prevCelebratingRef = useRef<boolean>(false);
//   const rootRef = useRef<HTMLDivElement | null>(null);

//   const calledSet = new Set(called);
//   const last = called[called.length - 1];

//   // Список показанных номеров всегда пересчитывается из called —
//   // это единственный источник правды, поэтому номер не может задвоиться
//   // (например, при включении/выключении эффекта BINGO).
//   const displayNumbers: DisplayNumber[] = called.map((num, index) => ({
//     number: num,
//     color: BALL_COLORS[index % BALL_COLORS.length],
//   }));

//   // Массив чисел от 1 до MAX_NUMBER
//   const numbers = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

//   // Раскладываем номера по столбцам: 1-10 идут вниз в первом столбце,
//   // 11-20 вниз во втором и т.д. (GRID_ROWS чисел в каждом столбце)
//   const GRID_ROWS = GRID_COLUMNS; // 10 чисел в каждом столбце (сверху вниз)
//   const numberColumns: number[][] = [];
//   for (let i = 0; i < numbers.length; i += GRID_ROWS) {
//     numberColumns.push(numbers.slice(i, i + GRID_ROWS));
//   }

//   function enterFullscreen() {
//     const el = rootRef.current;
//     if (el && el.requestFullscreen) {
//       el.requestFullscreen().catch(() => {});
//     }
//   }

//   function exitFullscreen() {
//     if (document.fullscreenElement) {
//       document.exitFullscreen().catch(() => {});
//     }
//   }

//   // Если пользователь выходит из полноэкранного режима (например, через Esc),
//   // возвращаем его на панель ведущего
//   useEffect(() => {
//     function handleFsChange() {
//       if (!document.fullscreenElement && view === "display") {
//         setView("admin");
//       }
//     }
//     document.addEventListener("fullscreenchange", handleFsChange);
//     return () =>
//       document.removeEventListener("fullscreenchange", handleFsChange);
//   }, [view]);

//   // subscribe to Firebase (falls back to local-only state if unavailable)
//   useEffect(() => {
//     if (!db) return;
//     let unsub: (() => void) | undefined;
//     try {
//       const gameRef = ref(db, "bingoGame");
//       unsub = onValue(
//         gameRef,
//         (snap) => {
//           const data = snap.val() || {};
//           const newCalled: number[] = data.called || [];
//           setCalled(newCalled);
//           setCelebrating(!!data.celebrating);
//           setOffline(false);
//         },
//         () => setOffline(true)
//       );
//     } catch (e) {
//       setOffline(true);
//     }
//     return () => unsub && unsub();
//   }, []);

//   useEffect(() => {
//     if (last !== lastRef.current) {
//       setPulseKey((k) => k + 1);
//       lastRef.current = last;

//       // Запускаем анимацию перехода для нового номера
//       if (last) {
//         setIsTransitioning(true);
//         setTimeout(() => setIsTransitioning(false), 1500);
//       }
//     }
//   }, [last, called.length]);

//   useEffect(() => {
//     if (celebrating && !prevCelebratingRef.current) {
//       setConfetti(makeConfetti(130));
//     }
//     prevCelebratingRef.current = celebrating;
//   }, [celebrating]);

//   function persist(newCalled: number[], newCelebrating: boolean) {
//     if (db && !offline) {
//       set(ref(db, "bingoGame"), {
//         called: newCalled,
//         celebrating: newCelebrating,
//       }).catch(() => setOffline(true));
//     } else {
//       setCalled(newCalled);
//       setCelebrating(newCelebrating);
//     }
//   }

//   function callNumber(n: number) {
//     if (calledSet.has(n)) return;
//     persist([...called, n], celebrating);
//   }

//   function undo() {
//     if (called.length === 0) return;
//     const newCalled = called.slice(0, -1);
//     if (db && !offline) {
//       set(ref(db, "bingoGame"), {
//         called: newCalled,
//         celebrating: celebrating,
//       }).catch(() => setOffline(true));
//     } else {
//       setCalled(newCalled);
//     }
//   }

//   function resetAll() {
//     if (called.length === 0) return;
//     if (window.confirm("Zresetować grę i zacząć od nowa?")) {
//       if (db && !offline) {
//         set(ref(db, "bingoGame"), {
//           called: [],
//           celebrating: false,
//         }).catch(() => setOffline(true));
//       } else {
//         setCalled([]);
//         setCelebrating(false);
//       }
//     }
//   }

//   function triggerBingo() {
//     persist(called, true);
//   }

//   function stopCelebration() {
//     persist(called, false);
//   }

//   return (
//     <div className="bc-root" ref={rootRef}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500;600;700&display=swap');

//         .bc-root {
//           --felt: #12261c;
//           --felt-2: #1b3527;
//           --cream: #f2e9d0;
//           --cream-dim: #b9ad8d;
//           --ink: #081109;
//           --gold: #d4a73c;
//           --red: #b4483a;
//           font-family: 'Work Sans', sans-serif;
//           background: var(--felt);
//           color: var(--cream);
//           min-height: 100vh;
//         }
//         .bc-root *, .bc-root *::before, .bc-root *::after { box-sizing: border-box; }

//         .offline-banner {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           font-size: 12px;
//           color: var(--cream-dim);
//           background: rgba(180,72,58,0.15);
//           border: 1px solid rgba(180,72,58,0.4);
//           padding: 8px 12px;
//           border-radius: 8px;
//         }

//         /* ---------- ADMIN ---------- */
//         .admin-wrap {
//           max-width: 820px;
//           margin: 0 auto;
//           padding: 20px;
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//           min-height: 100vh;
//         }
//         .admin-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 12px;
//         }
//         .admin-title {
//           font-family: 'Anton', sans-serif;
//           letter-spacing: 0.04em;
//           font-size: clamp(22px, 5vw, 30px);
//           color: var(--gold);
//           margin: 0;
//         }
//         .admin-title span { color: var(--cream); }

//         .btn {
//           font-family: 'Work Sans', sans-serif;
//           font-weight: 600;
//           font-size: 14px;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 16px;
//           border-radius: 8px;
//           border: 1px solid rgba(242,233,208,0.25);
//           background: var(--felt-2);
//           color: var(--cream);
//           cursor: pointer;
//           transition: transform 0.15s ease, background 0.15s ease;
//         }
//         .btn:hover { background: #234431; }
//         .btn:active { transform: scale(0.96); }
//         .btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
//         .btn:disabled { opacity: 0.4; cursor: default; }

//         .current-card {
//           background: var(--felt-2);
//           border-radius: 14px;
//           padding: 20px;
//           text-align: center;
//         }
//         .current-card .label {
//           font-size: 12px;
//           text-transform: uppercase;
//           letter-spacing: 0.14em;
//           color: var(--cream-dim);
//           margin-bottom: 8px;
//         }
//         .current-big {
//           font-family: 'Anton', sans-serif;
//           font-size: 56px;
//           line-height: 1;
//           color: var(--gold);
//         }
//         .empty-note { color: var(--cream-dim); font-size: 14px; }

//         .controls-row {
//           display: flex;
//           gap: 10px;
//           flex-wrap: wrap;
//           justify-content: center;
//           margin-top: 16px;
//         }
//         .bingo-btn {
//           font-family: 'Anton', sans-serif;
//           font-size: 18px;
//           letter-spacing: 0.05em;
//           padding: 12px 28px;
//           border-radius: 999px;
//           border: none;
//           background: linear-gradient(135deg, #e2b74b, #b4483a);
//           color: var(--ink);
//           display: inline-flex;
//           align-items: center;
//           gap: 10px;
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(212,167,60,0.35);
//           transition: transform 0.15s ease;
//         }
//         .bingo-btn:hover { transform: translateY(-2px); }
//         .bingo-btn:active { transform: scale(0.96); }
//         .bingo-btn:focus-visible { outline: 2px solid var(--cream); outline-offset: 3px; }
//         .bingo-btn:disabled { opacity: 0.4; cursor: default; transform: none; }
//         .stop-btn {
//           background: var(--red);
//           color: var(--cream);
//         }

//         .history-strip {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 6px;
//           padding: 12px;
//           background: var(--felt-2);
//           border-radius: 12px;
//           min-height: 40px;
//         }
//         .history-strip .empty-note { padding: 4px; }
//         .h-chip {
//           width: 32px; height: 32px;
//           border-radius: 50%;
//           background: var(--gold);
//           color: var(--ink);
//           font-weight: 700;
//           font-size: 13px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           animation: appearChip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
//         }
//         @keyframes appearChip {
//           0% { transform: scale(0) rotate(180deg); opacity: 0; }
//           100% { transform: scale(1) rotate(0deg); opacity: 1; }
//         }
//         .h-chip.current-h {
//           box-shadow: 0 0 0 2px var(--cream);
//           animation: pulse 1s ease-in-out infinite, appearChip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
//         }
//         @keyframes pulse {
//           0%, 100% { transform: scale(1); }
//           50% { transform: scale(1.1); }
//         }

//         .number-grid-wrapper {
//           display: flex;
//           flex-direction: row;
//           gap: 6px;
//         }
//         .number-column {
//           flex: 1;
//           display: grid;
//           grid-template-rows: repeat(${GRID_COLUMNS}, 1fr);
//           gap: 6px;
//         }
//         .chip {
//           aspect-ratio: 1;
//           border-radius: 50%;
//           border: 1.5px solid rgba(242,233,208,0.25);
//           background: transparent;
//           color: var(--cream-dim);
//           font-weight: 700;
//           font-size: 14px;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }
//         .chip:hover:not(.chip-called) {
//           border-color: var(--gold);
//           color: var(--gold);
//           transform: scale(1.05);
//         }
//         .chip:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
//         .chip-called {
//           background: var(--gold);
//           border-color: var(--gold);
//           color: var(--ink);
//           cursor: default;
//           animation: chipPop 0.5s cubic-bezier(.34,1.56,.64,1);
//         }
//         @keyframes chipPop {
//           0% { transform: scale(0.8); }
//           100% { transform: scale(1); }
//         }
//         .chip-current {
//           transform: scale(1.18);
//           box-shadow: 0 0 0 3px var(--cream), 0 0 14px 3px rgba(212,167,60,0.6);
//           animation: currentPulse 0.8s ease-in-out infinite;
//         }
//         @keyframes currentPulse {
//           0%, 100% { transform: scale(1.18); }
//           50% { transform: scale(1.25); }
//         }

//         /* ---------- DISPLAY ---------- */
//         .display-root {
//           position: fixed;
//           inset: 0;
//           background: radial-gradient(ellipse 60% 45% at 50% 10%, rgba(212,167,60,0.14), transparent 70%), var(--felt);
//           display: flex;
//           flex-direction: column;
//           overflow: hidden;
//         }
//         .display-back {
//         position: absolute;
//           top: 14px;
//           left: 14px;
//           opacity: -10.50;
//           z-index: 5;
//               color: #00000000;
//         }
//         .display-back:hover { opacity: 1; }

//         .display-history {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 8px;
//           padding: 60px 4vw 10px;
//           justify-content: center;
//           max-width: 80vw;
//           margin: 0 auto;
//         }
//         .d-chip {
//          width: clamp(28px, 6vw, 100px);
//     height: clamp(28px, 6vw, 100px);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 700;
//          font-size: clamp(11px, 2.6vw, 40px);
//           color: var(--ink);
//           box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//           animation: appearNumber 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both, floatBall 3s ease-in-out infinite 0.6s;
//           transition: transform 0.3s ease;
//         }
//         .d-chip:hover {
//           transform: scale(1.2);
//         }
//         @keyframes appearNumber {
//           0% {
//             transform: scale(0) rotate(360deg) translateY(-50px);
//             opacity: 0;
//           }
//           100% {
//             transform: scale(1) rotate(0deg) translateY(0px);
//             opacity: 1;
//           }
//         }
//         @keyframes floatBall {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-5px); }
//         }

//         .display-stage {
//           flex: 1;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           position: relative;
//           perspective: 1500px;
//         }
//         .ball-wrap {
//           position: relative;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           perspective: 1500px;
//         }
//         .ball-glow {
//           position: absolute;
//           width: min(80vh, 70vw);
//           height: min(80vh, 70vw);
//           border-radius: 50%;
//           background: radial-gradient(circle, rgba(212,167,60,0.25), transparent 70%);
//           animation: glowPulse 2s ease-in-out infinite;
//           filter: blur(20px);
//         }
//         @keyframes glowPulse {
//           0%, 100% { opacity: 0.6; transform: scale(1); }
//           50% { opacity: 1; transform: scale(1.15); }
//         }

//         .ball {
//           position: relative;
//           width: min(46vh, 46vw);
//           height: min(46vh, 46vw);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow:
//             0 20px 60px rgba(0,0,0,0.55),
//             inset 0 -20px 40px rgba(0,0,0,0.3),
//             inset 0 20px 40px rgba(255,255,255,0.3);
//           transform-style: preserve-3d;
//           transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
//           cursor: pointer;
//         }
//         .ball::before {
//           content: '';
//           position: absolute;
//           top: 10%;
//           left: 20%;
//           width: 35%;
//           height: 25%;
//           background: radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%);
//           border-radius: 50%;
//           transform: rotate(-30deg);
//           filter: blur(2px);
//         }
//         .ball::after {
//           content: '';
//           position: absolute;
//           bottom: 15%;
//           right: 15%;
//           width: 15%;
//           height: 10%;
//           background: radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%);
//           border-radius: 50%;
//           transform: rotate(30deg);
//           filter: blur(1px);
//         }
//         .ball .num {
//           font-family: 'Anton', sans-serif;
//           font-size: min(18vh, 18vw);
//           color: var(--ink);
//           text-shadow: 0 2px 8px rgba(0,0,0,0.2);
//           transform: translateZ(30px);
//           font-weight: 700;
//           position: relative;
//           z-index: 2;
//         }

//         /* Анимация появления шарика */
//         .ball-appear {
//           animation: ballAppear 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
//         }
//         @keyframes ballAppear {
//           0% {
//             transform: translateY(-60vh) scale(0.1) rotateX(-180deg) rotateY(180deg);
//             opacity: 0;
//           }
//           30% {
//             transform: translateY(5vh) scale(1.3) rotateX(10deg) rotateY(-20deg);
//             opacity: 1;
//           }
//           50% {
//             transform: translateY(-3vh) scale(0.95) rotateX(-5deg) rotateY(10deg);
//           }
//           70% {
//             transform: translateY(2vh) scale(1.05) rotateX(3deg) rotateY(-5deg);
//           }
//           100% {
//             transform: translateY(0) scale(1) rotateX(0deg) rotateY(0deg);
//             opacity: 1;
//           }
//         }

//         /* Анимация перехода между номерами */
//         .ball-transition-in {
//           animation: transitionIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
//         }
//         @keyframes transitionIn {
//           0% {
//             transform: scale(0.3) rotateY(-180deg) translateY(30vh);
//             opacity: 0;
//           }
//           40% {
//             transform: scale(1.2) rotateY(10deg) translateY(-5vh);
//             opacity: 1;
//           }
//           70% {
//             transform: scale(0.95) rotateY(-5deg) translateY(2vh);
//           }
//           100% {
//             transform: scale(1) rotateY(0deg) translateY(0);
//             opacity: 1;
//           }
//         }

//         .ball-float {
//           animation: ballFloat 3s ease-in-out infinite;
//         }
//         @keyframes ballFloat {
//           0%, 100% {
//             transform: translateY(0px) rotateX(0deg) rotateY(0deg);
//           }
//           25% {
//             transform: translateY(-8px) rotateX(2deg) rotateY(3deg);
//           }
//           75% {
//             transform: translateY(-4px) rotateX(-2deg) rotateY(-3deg);
//           }
//         }

//         .display-waiting {
//           font-family: 'Anton', sans-serif;
//           color: var(--cream-dim);
//           font-size: clamp(16px, 2.6vw, 26px);
//           text-align: center;
//           border: 2px dashed rgba(242,233,208,0.25);
//           border-radius: 50%;
//           width: min(38vh, 38vw);
//           height: min(38vh, 38vw);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 20px;
//         }

//         /* ---------- EPIC CELEBRATION ---------- */
//         .celebrate-overlay {
//           position: fixed;
//           inset: 0;
//           z-index: 20;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: rgba(8,17,9,0.6);
//           overflow: hidden;
//         }
//         .celebrate-flash {
//           position: absolute;
//           inset: 0;
//           background: radial-gradient(circle at 50% 45%, rgba(212,167,60,0.5), transparent 65%);
//           animation: flashPulse 1.4s ease-in-out infinite;
//         }
//         @keyframes flashPulse {
//           0%, 100% { opacity: 0.35; }
//           50% { opacity: 0.85; }
//         }
//         .celebrate-rays {
//           position: absolute;
//           width: 220vmax;
//           height: 220vmax;
//           background: repeating-conic-gradient(
//             from 0deg,
//             rgba(212,167,60,0.28) 0deg 4deg,
//             transparent 4deg 20deg
//           );
//           animation: spinRays 9s linear infinite;
//         }
//         @keyframes spinRays {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         .confetti-piece {
//           position: absolute;
//           top: -8%;
//           animation-name: confetti-fall;
//           animation-timing-function: linear;
//           animation-fill-mode: forwards;
//         }
//         .confetti-piece.streamer {
//           animation-name: confetti-sway;
//         }
//         @keyframes confetti-fall {
//           0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
//           100% { transform: translateY(115vh) rotate(640deg); opacity: 0.9; }
//         }
//         @keyframes confetti-sway {
//           0%   { transform: translate(0, -10vh) rotate(0deg); opacity: 1; }
//           25%  { transform: translate(var(--sway), 25vh) rotate(90deg); }
//           50%  { transform: translate(0, 55vh) rotate(180deg); }
//           75%  { transform: translate(calc(var(--sway) * -1), 85vh) rotate(270deg); }
//           100% { transform: translate(0, 115vh) rotate(360deg); opacity: 0.9; }
//         }
//         .bingo-text {
//           position: relative;
//           font-family: 'Anton', sans-serif;
//           font-size: clamp(52px, 15vw, 160px);
//           letter-spacing: 0.06em;
//           color: var(--gold);
//           text-shadow: 0 0 30px rgba(212,167,60,0.7), 0 6px 0 rgba(8,17,9,0.6);
//           animation: bingoPop 0.9s cubic-bezier(.34,1.56,.64,1) both,
//                      bingoGlow 1.6s ease-in-out infinite 0.9s;
//         }
//         @keyframes bingoPop {
//           0% { transform: scale(0.3) rotate(-8deg); opacity: 0; }
//           60% { transform: scale(1.18) rotate(4deg); opacity: 1; }
//           100% { transform: scale(1) rotate(0deg); }
//         }
//         @keyframes bingoGlow {
//           0%, 100% { text-shadow: 0 0 30px rgba(212,167,60,0.7), 0 6px 0 rgba(8,17,9,0.6); }
//           50% { text-shadow: 0 0 60px rgba(212,167,60,1), 0 6px 0 rgba(8,17,9,0.6); }
//         }
//         .celebrate-close {
//           position: absolute;
//           top: 18px;
//           right: 18px;
//           z-index: 21;
//           background: rgba(242,233,208,0.15);
//           border: none;
//           color: var(--cream);
//           border-radius: 50%;
//           width: 44px; height: 44px;
//           display: flex; align-items: center; justify-content: center;
//           cursor: pointer;
//         }
//         .celebrate-close:hover { background: rgba(242,233,208,0.3); }

//         @media (prefers-reduced-motion: reduce) {
//           .ball-appear, .ball-transition-in,
//           .confetti-piece, .bingo-text, .celebrate-rays, .celebrate-flash,
//           .d-chip, .ball-float, .ball-glow, .chip-current, .h-chip.current-h,
//           .h-chip { animation: none; }
//         }
//       `}</style>

//       {view === "admin" ? (
//         <div className="admin-wrap">
//           <div className="admin-header">
//             <h1 className="admin-title">
//               BINGO <span>CALLER</span>
//             </h1>
//             <button
//               className="btn"
//               onClick={() => {
//                 setView("display");
//                 enterFullscreen();
//               }}
//             >
//               <Monitor size={16} /> Ekran
//             </button>
//           </div>

//           {offline && (
//             <div className="offline-banner">
//               <WifiOff size={14} /> Brak połączenia z Firebase — gra działa
//               tylko lokalnie, w tym oknie.
//             </div>
//           )}

//           <div className="current-card">
//             <div className="label">Aktualny numer</div>
//             {last ? (
//               <div className="current-big">{last}</div>
//             ) : (
//               <div className="empty-note">Jeszcze nie rozpoczęto</div>
//             )}
//             <div className="controls-row">
//               {celebrating ? (
//                 <button
//                   className="bingo-btn stop-btn"
//                   onClick={stopCelebration}
//                 >
//                   <X size={20} /> Zatrzymaj efekt
//                 </button>
//               ) : (
//                 <button
//                   className="bingo-btn"
//                   onClick={triggerBingo}
//                   disabled={called.length === 0}
//                 >
//                   <PartyPopper size={20} /> BINGO!
//                 </button>
//               )}
//             </div>
//             <div className="controls-row">
//               <button
//                 className="btn"
//                 onClick={undo}
//                 disabled={called.length === 0}
//               >
//                 <RotateCcw size={15} /> Cofnij
//               </button>
//               <button
//                 className="btn"
//                 onClick={resetAll}
//                 disabled={called.length === 0}
//               >
//                 <Trash2 size={15} /> Resetuj
//               </button>
//             </div>
//           </div>

//           <div className="history-strip">
//             {called.length === 0 ? (
//               <div className="empty-note">
//                 Wylosowane numery pojawią się tutaj.
//               </div>
//             ) : (
//               called.map((n) => {
//                 const displayNum = displayNumbers.find((d) => d.number === n);
//                 return (
//                   <div
//                     key={n}
//                     className={`h-chip ${n === last ? "current-h" : ""}`}
//                     style={{
//                       background: displayNum?.color || "var(--gold)",
//                     }}
//                   >
//                     {n}
//                   </div>
//                 );
//               })
//             )}
//           </div>

//           <div className="number-grid-wrapper">
//             {numberColumns.map((col, colIndex) => (
//               <div key={colIndex} className="number-column">
//                 {col.map((n) => {
//                   const isCalled = calledSet.has(n);
//                   const isCurrent = n === last;
//                   const displayNum = displayNumbers.find((d) => d.number === n);
//                   return (
//                     <button
//                       key={n}
//                       className={`chip ${isCalled ? "chip-called" : ""} ${
//                         isCurrent ? "chip-current" : ""
//                       }`}
//                       onClick={() => callNumber(n)}
//                       disabled={isCalled}
//                       style={{
//                         background: isCalled
//                           ? displayNum?.color || "var(--gold)"
//                           : "transparent",
//                       }}
//                     >
//                       {n}
//                     </button>
//                   );
//                 })}
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="display-root">
//           <button
//             className="btn display-back"
//             onClick={() => {
//               exitFullscreen();
//               setView("admin");
//             }}
//           >
//             <ArrowLeft size={15} /> Panel prowadzącego
//           </button>

//           <div className="display-history">
//             {displayNumbers
//               .filter((item) => item.number !== last)
//               .sort((a, b) => a.number - b.number)
//               .map((item) => (
//                 <div
//                   key={item.number}
//                   className="d-chip"
//                   style={{
//                     background: item.color,
//                     animationDelay: `${(item.number % 5) * 0.2}s`,
//                   }}
//                 >
//                   {item.number}
//                 </div>
//               ))}
//           </div>

//           <div className="display-stage">
//             {last ? (
//               <div className="ball-wrap">
//                 <div className="ball-glow" />
//                 <div
//                   key={pulseKey}
//                   className={`ball ${
//                     isTransitioning
//                       ? "ball-transition-in"
//                       : "ball-appear ball-float"
//                   }`}
//                   style={{
//                     background:
//                       displayNumbers.find((d) => d.number === last)?.color ||
//                       "var(--gold)",
//                   }}
//                 >
//                   <span className="num">{last}</span>
//                 </div>
//               </div>
//             ) : (
//               <div className="display-waiting">
//                 Oczekiwanie
//                 <br />
//                 na pierwszy numer
//               </div>
//             )}
//           </div>

//           {celebrating && (
//             <div className="celebrate-overlay">
//               <div className="celebrate-flash" />
//               <div className="celebrate-rays" />
//               <button className="celebrate-close" onClick={stopCelebration}>
//                 <X size={22} />
//               </button>
//               {confetti.map((p) => (
//                 <div
//                   key={p.id}
//                   className={`confetti-piece ${
//                     p.kind === "streamer" ? "streamer" : ""
//                   }`}
//                   style={{
//                     left: `${p.left}%`,
//                     width: p.kind === "streamer" ? p.size * 0.4 : p.size,
//                     height: p.kind === "streamer" ? p.size * 3.5 : p.size * 0.4,
//                     background: p.color,
//                     animationDuration: `${p.duration}s`,
//                     animationDelay: `${p.delay}s`,
//                     transform: `rotate(${p.rotate}deg)`,
//                   }}
//                 />
//               ))}
//               <div className="bingo-text">BINGO!</div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Trash2,
  Monitor,
  ArrowLeft,
  PartyPopper,
  X,
  WifiOff,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBghDQYhpnLcXzzKsG8MtKHEre_wUaIYJM",
  authDomain: "lapose-d2a83.firebaseapp.com",
  databaseURL:
    "https://lapose-d2a83-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lapose-d2a83",
  storageBucket: "lapose-d2a83.firebasestorage.app",
  messagingSenderId: "633119883215",
  appId: "1:633119883215:web:9edb546bdd7ee505919cba",
  measurementId: "G-XBH8CV4L5Y",
};

let db: Database | null = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  db = null;
}

const MAX_NUMBER = 75;
const GRID_COLUMNS = 10;
const CONFETTI_COLORS = [
  "#d4a73c",
  "#b4483a",
  "#3e8073",
  "#6b4a82",
  "#f2e9d0",
  "#3e6e8e",
];

interface ConfettiPiece {
  id: number;
  kind: string;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotate: number;
  sway: number;
}

interface DisplayNumber {
  number: number;
  color: string;
}

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    kind: Math.random() > 0.65 ? "streamer" : "square",
    left: Math.random() * 100,
    size: 6 + Math.random() * 9,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    duration: 2.4 + Math.random() * 2.2,
    delay: Math.random() * 0.8,
    rotate: Math.random() * 360,
    sway: 20 + Math.random() * 40,
  }));
}

// Цвета для шариков
const BALL_COLORS = [
  "#d4a73c", // золотой
  "#e74c3c", // красный
  "#3498db", // синий
  "#2ecc71", // зеленый
  "#f39c12", // оранжевый
  "#9b59b6", // фиолетовый
  "#1abc9c", // бирюзовый
  "#e67e22", // тыквенный
  "#e84393", // розовый
  "#00b894", // изумрудный
];

export default function BingoCaller() {
  const [called, setCalled] = useState<number[]>([]);
  const [celebrating, setCelebrating] = useState<boolean>(false);
  const [view, setView] = useState<"admin" | "display">("admin");
  const [pulseKey, setPulseKey] = useState<number>(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [offline, setOffline] = useState<boolean>(!db);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const lastRef = useRef<number | undefined>(undefined);
  const prevCelebratingRef = useRef<boolean>(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const calledSet = new Set(called);
  const last = called[called.length - 1];

  // Список показанных номеров всегда пересчитывается из called —
  // это единственный источник правды, поэтому номер не может задвоиться
  // (например, при включении/выключении эффекта BINGO).
  const displayNumbers: DisplayNumber[] = called.map((num, index) => ({
    number: num,
    color: BALL_COLORS[index % BALL_COLORS.length],
  }));

  // Массив чисел от 1 до MAX_NUMBER
  const numbers = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

  // Раскладываем номера по столбцам: 1-10 идут вниз в первом столбце,
  // 11-20 вниз во втором и т.д. (GRID_ROWS чисел в каждом столбце)
  const GRID_ROWS = GRID_COLUMNS; // 10 чисел в каждом столбце (сверху вниз)
  const numberColumns: number[][] = [];
  for (let i = 0; i < numbers.length; i += GRID_ROWS) {
    numberColumns.push(numbers.slice(i, i + GRID_ROWS));
  }

  function enterFullscreen() {
    const el = rootRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  // Если пользователь выходит из полноэкранного режима (например, через Esc),
  // возвращаем его на панель ведущего
  useEffect(() => {
    function handleFsChange() {
      if (!document.fullscreenElement && view === "display") {
        setView("admin");
      }
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, [view]);

  // subscribe to Firebase (falls back to local-only state if unavailable)
  useEffect(() => {
    if (!db) return;
    let unsub: (() => void) | undefined;
    try {
      const gameRef = ref(db, "bingoGame");
      unsub = onValue(
        gameRef,
        (snap) => {
          const data = snap.val() || {};
          const newCalled: number[] = data.called || [];
          setCalled(newCalled);
          setCelebrating(!!data.celebrating);
          setOffline(false);
        },
        () => setOffline(true)
      );
    } catch (e) {
      setOffline(true);
    }
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    if (last !== lastRef.current) {
      setPulseKey((k) => k + 1);
      lastRef.current = last;

      // Запускаем анимацию перехода для нового номера
      if (last) {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 1500);
      }
    }
  }, [last, called.length]);

  useEffect(() => {
    if (celebrating && !prevCelebratingRef.current) {
      setConfetti(makeConfetti(130));
    }
    prevCelebratingRef.current = celebrating;
  }, [celebrating]);

  function persist(newCalled: number[], newCelebrating: boolean) {
    if (db && !offline) {
      set(ref(db, "bingoGame"), {
        called: newCalled,
        celebrating: newCelebrating,
      }).catch(() => setOffline(true));
    } else {
      setCalled(newCalled);
      setCelebrating(newCelebrating);
    }
  }

  function callNumber(n: number) {
    if (calledSet.has(n)) return;
    persist([...called, n], celebrating);
  }

  function undo() {
    if (called.length === 0) return;
    const newCalled = called.slice(0, -1);
    if (db && !offline) {
      set(ref(db, "bingoGame"), {
        called: newCalled,
        celebrating: celebrating,
      }).catch(() => setOffline(true));
    } else {
      setCalled(newCalled);
    }
  }

  function resetAll() {
    if (called.length === 0) return;
    if (window.confirm("Zresetować grę i zacząć od nowa?")) {
      if (db && !offline) {
        set(ref(db, "bingoGame"), {
          called: [],
          celebrating: false,
        }).catch(() => setOffline(true));
      } else {
        setCalled([]);
        setCelebrating(false);
      }
    }
  }

  function triggerBingo() {
    persist(called, true);
  }

  function stopCelebration() {
    persist(called, false);
  }

  return (
    <div className="bc-root" ref={rootRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500;600;700&display=swap');

        .bc-root {
          --felt: #12261c;
          --felt-2: #1b3527;
          --cream: #f2e9d0;
          --cream-dim: #b9ad8d;
          --ink: #081109;
          --gold: #d4a73c;
          --red: #b4483a;
          font-family: 'Work Sans', sans-serif;
          background: var(--felt);
          color: var(--cream);
          min-height: 100vh;
        }
        .bc-root *, .bc-root *::before, .bc-root *::after { box-sizing: border-box; }

        .offline-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--cream-dim);
          background: rgba(180,72,58,0.15);
          border: 1px solid rgba(180,72,58,0.4);
          padding: 8px 12px;
          border-radius: 8px;
        }

        /* ---------- ADMIN ---------- */
        .admin-wrap {
          max-width: 820px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 100vh;
        }
        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .admin-title {
          font-family: 'Anton', sans-serif;
          letter-spacing: 0.04em;
          font-size: clamp(22px, 5vw, 30px);
          color: var(--gold);
          margin: 0;
        }
        .admin-title span { color: var(--cream); }

        .btn {
          font-family: 'Work Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid rgba(242,233,208,0.25);
          background: var(--felt-2);
          color: var(--cream);
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .btn:hover { background: #234431; }
        .btn:active { transform: scale(0.96); }
        .btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .btn:disabled { opacity: 0.4; cursor: default; }

        .current-card {
          background: var(--felt-2);
          border-radius: 14px;
          padding: 20px;
          text-align: center;
        }
        .current-card .label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--cream-dim);
          margin-bottom: 8px;
        }
        .current-big {
          font-family: 'Anton', sans-serif;
          font-size: 56px;
          line-height: 1;
          color: var(--gold);
        }
        .empty-note { color: var(--cream-dim); font-size: 14px; }

        .controls-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 16px;
        }
        .bingo-btn {
          font-family: 'Anton', sans-serif;
          font-size: 18px;
          letter-spacing: 0.05em;
          padding: 12px 28px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #e2b74b, #b4483a);
          color: var(--ink);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(212,167,60,0.35);
          transition: transform 0.15s ease;
        }
        .bingo-btn:hover { transform: translateY(-2px); }
        .bingo-btn:active { transform: scale(0.96); }
        .bingo-btn:focus-visible { outline: 2px solid var(--cream); outline-offset: 3px; }
        .bingo-btn:disabled { opacity: 0.4; cursor: default; transform: none; }
        .stop-btn {
          background: var(--red);
          color: var(--cream);
        }

        .history-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 12px;
          background: var(--felt-2);
          border-radius: 12px;
          min-height: 40px;
        }
        .history-strip .empty-note { padding: 4px; }
        .h-chip {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--gold);
          color: var(--ink);
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: appearChip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes appearChip {
          0% { transform: scale(0) rotate(180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .h-chip.current-h { 
          box-shadow: 0 0 0 2px var(--cream); 
          animation: pulse 1s ease-in-out infinite, appearChip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .number-grid-wrapper {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
        }
        .number-column {
       width: clamp(34px, 12vw, 51px);
    display: grid;
    grid-template-rows: repeat(10, 1fr);
    gap: 6px;
        }
        .chip {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1.5px solid rgba(242,233,208,0.25);
          background: transparent;
          color: var(--cream-dim);
          font-weight: 700;
          font-size: clamp(10px, 2.6vw, 13px);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .chip:hover:not(.chip-called) { 
          border-color: var(--gold); 
          color: var(--gold);
          transform: scale(1.05);
        }
        .chip:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .chip-called {
          background: var(--gold);
          border-color: var(--gold);
          color: var(--ink);
          cursor: default;
          animation: chipPop 0.5s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes chipPop {
          0% { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
        .chip-current {
          transform: scale(1.18);
          box-shadow: 0 0 0 3px var(--cream), 0 0 14px 3px rgba(212,167,60,0.6);
          animation: currentPulse 0.8s ease-in-out infinite;
        }
        @keyframes currentPulse {
          0%, 100% { transform: scale(1.18); }
          50% { transform: scale(1.25); }
        }

        /* ---------- DISPLAY ---------- */
        .display-root {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 60% 45% at 50% 10%, rgba(212,167,60,0.14), transparent 70%), var(--felt);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .display-back {
        position: absolute;
          top: 14px;
          left: 14px;
          opacity: -10.50;
          z-index: 5;
              color: #00000000;
        }
        .display-back:hover { opacity: 1; }

        .display-history {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 60px 4vw 10px;
          justify-content: center;
          max-width: 80vw;
          margin: 0 auto;
        }
        .d-chip {
         width: clamp(28px, 6vw, 100px);
    height: clamp(28px, 6vw, 100px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
         font-size: clamp(11px, 2.6vw, 40px);
          color: var(--ink);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: appearNumber 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both, floatBall 3s ease-in-out infinite 0.6s;
          transition: transform 0.3s ease;
        }
        .d-chip:hover {
          transform: scale(1.2);
        }
        @keyframes appearNumber {
          0% { 
            transform: scale(0) rotate(360deg) translateY(-50px); 
            opacity: 0; 
          }
          100% { 
            transform: scale(1) rotate(0deg) translateY(0px); 
            opacity: 1; 
          }
        }
        @keyframes floatBall {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .display-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          perspective: 1500px;
        }
        .ball-wrap { 
          position: relative; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          perspective: 1500px;
        }
        .ball-glow {
          position: absolute;
          width: min(80vh, 70vw);
          height: min(80vh, 70vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,167,60,0.25), transparent 70%);
          animation: glowPulse 2s ease-in-out infinite;
          filter: blur(20px);
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .ball {
          position: relative;
          width: min(46vh, 46vw);
          height: min(46vh, 46vw);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 20px 60px rgba(0,0,0,0.55),
            inset 0 -20px 40px rgba(0,0,0,0.3),
            inset 0 20px 40px rgba(255,255,255,0.3);
          transform-style: preserve-3d;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .ball::before {
          content: '';
          position: absolute;
          top: 10%;
          left: 20%;
          width: 35%;
          height: 25%;
          background: radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%);
          border-radius: 50%;
          transform: rotate(-30deg);
          filter: blur(2px);
        }
        .ball::after {
          content: '';
          position: absolute;
          bottom: 15%;
          right: 15%;
          width: 15%;
          height: 10%;
          background: radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%);
          border-radius: 50%;
          transform: rotate(30deg);
          filter: blur(1px);
        }
        .ball .num {
          font-family: 'Anton', sans-serif;
          font-size: min(18vh, 18vw);
          color: var(--ink);
          text-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transform: translateZ(30px);
          font-weight: 700;
          position: relative;
          z-index: 2;
        }

        /* Анимация появления шарика */
        .ball-appear {
          animation: ballAppear 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes ballAppear {
          0% { 
            transform: translateY(-60vh) scale(0.1) rotateX(-180deg) rotateY(180deg);
            opacity: 0;
          }
          30% {
            transform: translateY(5vh) scale(1.3) rotateX(10deg) rotateY(-20deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-3vh) scale(0.95) rotateX(-5deg) rotateY(10deg);
          }
          70% {
            transform: translateY(2vh) scale(1.05) rotateX(3deg) rotateY(-5deg);
          }
          100% { 
            transform: translateY(0) scale(1) rotateX(0deg) rotateY(0deg);
            opacity: 1;
          }
        }

        /* Анимация перехода между номерами */
        .ball-transition-in {
          animation: transitionIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes transitionIn {
          0% {
            transform: scale(0.3) rotateY(-180deg) translateY(30vh);
            opacity: 0;
          }
          40% {
            transform: scale(1.2) rotateY(10deg) translateY(-5vh);
            opacity: 1;
          }
          70% {
            transform: scale(0.95) rotateY(-5deg) translateY(2vh);
          }
          100% {
            transform: scale(1) rotateY(0deg) translateY(0);
            opacity: 1;
          }
        }

        .ball-float {
          animation: ballFloat 3s ease-in-out infinite;
        }
        @keyframes ballFloat {
          0%, 100% { 
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          25% { 
            transform: translateY(-8px) rotateX(2deg) rotateY(3deg);
          }
          75% { 
            transform: translateY(-4px) rotateX(-2deg) rotateY(-3deg);
          }
        }

        .display-waiting {
          font-family: 'Anton', sans-serif;
          color: var(--cream-dim);
          font-size: clamp(16px, 2.6vw, 26px);
          text-align: center;
          border: 2px dashed rgba(242,233,208,0.25);
          border-radius: 50%;
          width: min(38vh, 38vw);
          height: min(38vh, 38vw);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* ---------- EPIC CELEBRATION ---------- */
        .celebrate-overlay {
          position: fixed;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(8,17,9,0.6);
          overflow: hidden;
        }
        .celebrate-flash {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 45%, rgba(212,167,60,0.5), transparent 65%);
          animation: flashPulse 1.4s ease-in-out infinite;
        }
        @keyframes flashPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
        .celebrate-rays {
          position: absolute;
          width: 220vmax;
          height: 220vmax;
          background: repeating-conic-gradient(
            from 0deg,
            rgba(212,167,60,0.28) 0deg 4deg,
            transparent 4deg 20deg
          );
          animation: spinRays 9s linear infinite;
        }
        @keyframes spinRays {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .confetti-piece {
          position: absolute;
          top: -8%;
          animation-name: confetti-fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .confetti-piece.streamer {
          animation-name: confetti-sway;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(115vh) rotate(640deg); opacity: 0.9; }
        }
        @keyframes confetti-sway {
          0%   { transform: translate(0, -10vh) rotate(0deg); opacity: 1; }
          25%  { transform: translate(var(--sway), 25vh) rotate(90deg); }
          50%  { transform: translate(0, 55vh) rotate(180deg); }
          75%  { transform: translate(calc(var(--sway) * -1), 85vh) rotate(270deg); }
          100% { transform: translate(0, 115vh) rotate(360deg); opacity: 0.9; }
        }
        .bingo-text {
          position: relative;
          font-family: 'Anton', sans-serif;
          font-size: clamp(52px, 15vw, 160px);
          letter-spacing: 0.06em;
          color: var(--gold);
          text-shadow: 0 0 30px rgba(212,167,60,0.7), 0 6px 0 rgba(8,17,9,0.6);
          animation: bingoPop 0.9s cubic-bezier(.34,1.56,.64,1) both,
                     bingoGlow 1.6s ease-in-out infinite 0.9s;
        }
        @keyframes bingoPop {
          0% { transform: scale(0.3) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.18) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes bingoGlow {
          0%, 100% { text-shadow: 0 0 30px rgba(212,167,60,0.7), 0 6px 0 rgba(8,17,9,0.6); }
          50% { text-shadow: 0 0 60px rgba(212,167,60,1), 0 6px 0 rgba(8,17,9,0.6); }
        }
        .celebrate-close {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 21;
          background: rgba(242,233,208,0.15);
          border: none;
          color: var(--cream);
          border-radius: 50%;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .celebrate-close:hover { background: rgba(242,233,208,0.3); }

        @media (prefers-reduced-motion: reduce) {
          .ball-appear, .ball-transition-in,
          .confetti-piece, .bingo-text, .celebrate-rays, .celebrate-flash,
          .d-chip, .ball-float, .ball-glow, .chip-current, .h-chip.current-h,
          .h-chip { animation: none; }
        }
      `}</style>

      {view === "admin" ? (
        <div className="admin-wrap">
          <div className="admin-header">
            <h1 className="admin-title">
              BINGO <span>CALLER</span>
            </h1>
            <button
              className="btn"
              onClick={() => {
                setView("display");
                enterFullscreen();
              }}
            >
              <Monitor size={16} /> Ekran
            </button>
          </div>

          {offline && (
            <div className="offline-banner">
              <WifiOff size={14} /> Brak połączenia z Firebase — gra działa
              tylko lokalnie, w tym oknie.
            </div>
          )}

          <div className="current-card">
            <div className="label">Aktualny numer</div>
            {last ? (
              <div className="current-big">{last}</div>
            ) : (
              <div className="empty-note">Jeszcze nie rozpoczęto</div>
            )}
            <div className="controls-row">
              {celebrating ? (
                <button
                  className="bingo-btn stop-btn"
                  onClick={stopCelebration}
                >
                  <X size={20} /> Zatrzymaj efekt
                </button>
              ) : (
                <button
                  className="bingo-btn"
                  onClick={triggerBingo}
                  disabled={called.length === 0}
                >
                  <PartyPopper size={20} /> BINGO!
                </button>
              )}
            </div>
            <div className="controls-row">
              <button
                className="btn"
                onClick={undo}
                disabled={called.length === 0}
              >
                <RotateCcw size={15} /> Cofnij
              </button>
              <button
                className="btn"
                onClick={resetAll}
                disabled={called.length === 0}
              >
                <Trash2 size={15} /> Resetuj
              </button>
            </div>
          </div>

          <div className="history-strip">
            {called.length === 0 ? (
              <div className="empty-note">
                Wylosowane numery pojawią się tutaj.
              </div>
            ) : (
              called.map((n) => {
                const displayNum = displayNumbers.find((d) => d.number === n);
                return (
                  <div
                    key={n}
                    className={`h-chip ${n === last ? "current-h" : ""}`}
                    style={{
                      background: displayNum?.color || "var(--gold)",
                    }}
                  >
                    {n}
                  </div>
                );
              })
            )}
          </div>

          <div className="number-grid-wrapper">
            {numberColumns.map((col, colIndex) => (
              <div key={colIndex} className="number-column">
                {col.map((n) => {
                  const isCalled = calledSet.has(n);
                  const isCurrent = n === last;
                  const displayNum = displayNumbers.find((d) => d.number === n);
                  return (
                    <button
                      key={n}
                      className={`chip ${isCalled ? "chip-called" : ""} ${
                        isCurrent ? "chip-current" : ""
                      }`}
                      onClick={() => callNumber(n)}
                      disabled={isCalled}
                      style={{
                        background: isCalled
                          ? displayNum?.color || "var(--gold)"
                          : "transparent",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="display-root">
          <button
            className="btn display-back"
            onClick={() => {
              exitFullscreen();
              setView("admin");
            }}
          >
            <ArrowLeft size={15} /> Panel prowadzącego
          </button>

          <div className="display-history">
            {displayNumbers
              .filter((item) => item.number !== last)
              .sort((a, b) => a.number - b.number)
              .map((item) => (
                <div
                  key={item.number}
                  className="d-chip"
                  style={{
                    background: item.color,
                    animationDelay: `${(item.number % 5) * 0.2}s`,
                  }}
                >
                  {item.number}
                </div>
              ))}
          </div>

          <div className="display-stage">
            {last ? (
              <div className="ball-wrap">
                <div className="ball-glow" />
                <div
                  key={pulseKey}
                  className={`ball ${
                    isTransitioning
                      ? "ball-transition-in"
                      : "ball-appear ball-float"
                  }`}
                  style={{
                    background:
                      displayNumbers.find((d) => d.number === last)?.color ||
                      "var(--gold)",
                  }}
                >
                  <span className="num">{last}</span>
                </div>
              </div>
            ) : (
              <div className="display-waiting">
                Oczekiwanie
                <br />
                na pierwszy numer
              </div>
            )}
          </div>

          {celebrating && (
            <div className="celebrate-overlay">
              <div className="celebrate-flash" />
              <div className="celebrate-rays" />
              <button className="celebrate-close" onClick={stopCelebration}>
                <X size={22} />
              </button>
              {confetti.map((p) => (
                <div
                  key={p.id}
                  className={`confetti-piece ${
                    p.kind === "streamer" ? "streamer" : ""
                  }`}
                  style={{
                    left: `${p.left}%`,
                    width: p.kind === "streamer" ? p.size * 0.4 : p.size,
                    height: p.kind === "streamer" ? p.size * 3.5 : p.size * 0.4,
                    background: p.color,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                    transform: `rotate(${p.rotate}deg)`,
                  }}
                />
              ))}
              <div className="bingo-text">BINGO!</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

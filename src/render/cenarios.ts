/* Cenário de cada praia: céu, mar, ondas e os enfeites de fundo (PRAIAS[b].enfeites). Só desenha; regras em docs/MOLDE-CENARIOS.md.
   Tudo em coordenadas do mundo, entre x0 e x1 (a parte visível). Sem Math.random: a posição vem de hash(i). */
import { SHORE } from '../dados/mapa.ts';
import type { Praia } from '../dados/praias.ts';

/** O céu vai de 0 a HORIZONTE; o mar, de HORIZONTE até a areia (SHORE). Enfeite fica sempre acima de SHORE - 6. */
export const HORIZONTE = 34;
/** e.t: tempo da animação em ms (fica parado com "reduzir movimento"); e.cam: x da câmera, para o que fica fixo no céu. */
export interface Vista { x0: number; x1: number; t: number; cam: number }
export type Enfeite = (c: CanvasRenderingContext2D, e: Vista, P: Praia) => void;

/** Número de 0 a 1 que sempre sai igual para o mesmo i (no lugar de Math.random). */
export const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) };
/** Repete fn a cada `passo` unidades do mundo, só onde está visível (i: número da repetição, para o hash). */
export function cada(e: Vista, passo: number, fn: (x: number, i: number) => void, folga = 80) {
  for (let i = Math.floor((e.x0 - folga) / passo); i * passo <= e.x1 + folga; i++) fn(i * passo, i);
}
const circ = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill() };

/* ---------- Enfeites ---------- */

/** Sol: fica parado no céu (acompanha a câmera). De manhã alto e pequeno; à tarde mais quente; no pôr do sol, grande e baixo, metade no mar. */
const sol: Enfeite = (c, e, P) => {
  const x = e.cam + (P.hora === 'manha' ? 70 : 320);
  if (P.hora === 'porDoSol') {
    c.fillStyle = 'rgba(255,214,120,0.35)'; circ(c, x, HORIZONTE, 34);
    c.fillStyle = '#ffb347'; circ(c, x, HORIZONTE, 22);
    return;
  }
  c.fillStyle = 'rgba(255,240,170,0.45)'; circ(c, x, 17, 16);
  c.fillStyle = P.hora === 'manha' ? '#ffe066' : '#ffd43b'; circ(c, x, 17, 10);
};

/** Nuvens: andam devagar para a direita; 1 a cada 260 unidades, de tamanho e altura variados. */
const nuvens: Enfeite = (c, e) => {
  c.fillStyle = 'rgba(255,255,255,0.9)';
  cada(e, 260, (x, i) => {
    const h = hash(i), cx = x + h * 120 + (e.t / 400) % 260, cy = 9 + h * 14, s = 0.7 + hash(i + 50) * 0.5;
    circ(c, cx, cy, 7 * s); circ(c, cx + 9 * s, cy - 3 * s, 8 * s); circ(c, cx + 19 * s, cy, 6 * s); c.fillRect(cx, cy, 19 * s, 6 * s);
  });
};

/** Gaivotas: dois traços em "v" que batem as asas, voando sobre o mar. */
const gaivotas: Enfeite = (c, e) => {
  c.strokeStyle = 'rgba(58,35,22,0.6)'; c.lineWidth = 1.5; c.lineCap = 'round';
  cada(e, 330, (x, i) => {
    if (hash(i + 7) < 0.4) return; // nem todo trecho tem gaivota
    const gx = x + hash(i) * 200 + Math.sin(e.t / 2000 + i) * 20, gy = HORIZONTE + 10 + hash(i + 3) * 26, a = Math.sin(e.t / 160 + i) * 2.5;
    c.beginPath(); c.moveTo(gx - 6, gy - a); c.quadraticCurveTo(gx - 3, gy - 3, gx, gy); c.quadraticCurveTo(gx + 3, gy - 3, gx + 6, gy - a); c.stroke();
  });
};

/** Boias: listradas, balançando na água perto da areia (bem acima da faixa onde os clientes andam). */
const boias: Enfeite = (c, e) => {
  cada(e, 400, (x, i) => {
    const bx = x + 120 + hash(i) * 160, by = SHORE - 22 + Math.sin(e.t / 600 + i) * 2;
    c.fillStyle = '#fff'; circ(c, bx, by, 6); c.fillStyle = '#ff6b6b'; c.beginPath(); c.arc(bx, by, 6, -0.6, 0.6); c.arc(bx, by, 6, Math.PI - 0.6, Math.PI + 0.6); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(bx - 8, by + 5, 16, 1.5);
  });
};

/** Ilha no horizonte: morro verde com dois coqueiros, a cada 800 unidades. */
const ilha: Enfeite = (c, e) => {
  cada(e, 800, (x, i) => {
    const ix = x + 220 + hash(i) * 300, w = 70 + hash(i + 1) * 40;
    c.fillStyle = '#5f9e6e'; c.beginPath(); c.ellipse(ix, HORIZONTE + 2, w / 2, 12, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#4a8a5a'; c.beginPath(); c.ellipse(ix + w / 6, HORIZONTE + 2, w / 4, 8, 0, Math.PI, 0); c.fill();
    for (const d of [-10, 8]) {
      c.strokeStyle = '#7a5a3a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ix + d, HORIZONTE - 8); c.lineTo(ix + d + 2, HORIZONTE - 18); c.stroke();
      c.fillStyle = '#2f7a45'; for (const a of [-2.6, -1.9, -1.2, -0.5]) { c.beginPath(); c.ellipse(ix + d + 2 + Math.cos(a) * 5, HORIZONTE - 18 + Math.sin(a) * 2, 5, 1.6, a, 0, Math.PI * 2); c.fill() }
    }
  });
};

/** Navio grande e lento no horizonte (um por tela, no máximo). */
const navio: Enfeite = (c, e) => {
  cada(e, 1100, (x, i) => {
    const nx = x + 500 + hash(i) * 300 + (e.t / 900) % 400, ny = HORIZONTE + 4;
    c.fillStyle = '#495057'; c.beginPath(); c.moveTo(nx - 26, ny - 6); c.lineTo(nx + 26, ny - 6); c.lineTo(nx + 20, ny); c.lineTo(nx - 22, ny); c.closePath(); c.fill();
    c.fillStyle = '#f8f9fa'; c.fillRect(nx - 10, ny - 12, 22, 6); c.fillStyle = '#e03131'; c.fillRect(nx + 4, ny - 17, 5, 5);
    c.fillStyle = 'rgba(73,80,87,0.25)'; circ(c, nx + 6, ny - 21, 3); circ(c, nx + 11, ny - 25, 4);
  });
};

/** Jangadas: vela triangular colorida, balançando no meio do mar. */
const jangadas: Enfeite = (c, e) => {
  cada(e, 520, (x, i) => {
    const jx = x + 60 + hash(i) * 340, jy = HORIZONTE + 34 + hash(i + 9) * 22 + Math.sin(e.t / 700 + i) * 1.5, cor = ['#ffd43b', '#ff8787', '#fff'][((i % 3) + 3) % 3];
    c.fillStyle = '#8d5a2b'; c.fillRect(jx - 12, jy, 24, 3);
    c.fillStyle = cor; c.beginPath(); c.moveTo(jx - 2, jy - 1); c.lineTo(jx - 2, jy - 22); c.lineTo(jx + 12, jy - 3); c.closePath(); c.fill();
    c.strokeStyle = '#6b4320'; c.lineWidth = 1; c.beginPath(); c.moveTo(jx - 2, jy); c.lineTo(jx - 2, jy - 23); c.stroke();
  });
};

/** Farol: torre listrada na ponta, apoiada no horizonte, com a luz piscando de leve. */
const farol: Enfeite = (c, e) => {
  cada(e, 1500, (x, i) => {
    const fx = x + 320 + hash(i) * 180, b = HORIZONTE + 4;
    c.fillStyle = '#6b7280'; c.beginPath(); c.moveTo(fx - 24, b + 6); c.lineTo(fx - 14, b); c.lineTo(fx + 14, b); c.lineTo(fx + 24, b + 6); c.closePath(); c.fill();
    c.fillStyle = '#f8f9fa'; c.beginPath(); c.moveTo(fx - 8, b); c.lineTo(fx - 5, b - 24); c.lineTo(fx + 5, b - 24); c.lineTo(fx + 8, b); c.closePath(); c.fill();
    c.fillStyle = '#e03131'; c.fillRect(fx - 7.4, b - 7, 14.8, 5); c.fillRect(fx - 6.2, b - 17, 12.4, 5);
    c.fillStyle = '#343a40'; c.fillRect(fx - 5, b - 29, 10, 5);
    c.fillStyle = '#495057'; c.beginPath(); c.moveTo(fx - 6, b - 29); c.lineTo(fx, b - 34); c.lineTo(fx + 6, b - 29); c.closePath(); c.fill();
    const a = 0.3 + 0.3 * Math.sin(e.t / 500 + i);
    c.fillStyle = `rgba(255,224,102,${a})`; circ(c, fx, b - 26, 4);
  });
};

/** Pedras: rochas escuras na beira da água, com espuma em volta. */
const pedras: Enfeite = (c, e) => {
  cada(e, 300, (x, i) => {
    if (hash(i + 5) < 0.35) return;
    const px = x + 40 + hash(i) * 180, py = SHORE - 30 - hash(i + 2) * 10, w = 10 + hash(i + 7) * 10;
    c.fillStyle = '#8b8f96'; c.beginPath(); c.moveTo(px - w, py + 6); c.lineTo(px - w * 0.5, py - 6); c.lineTo(px + w * 0.4, py - 4); c.lineTo(px + w, py + 7); c.closePath(); c.fill();
    c.fillStyle = '#6f747c'; c.beginPath(); c.moveTo(px - w * 0.5, py - 6); c.lineTo(px + w * 0.4, py - 4); c.lineTo(px + w * 0.2, py + 6); c.lineTo(px - w, py + 6); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(px - w, py + 7, w * 2, 1.5);
  });
};

/** Coqueiros: muitos coqueiros no horizonte, curvados pelo vento, balançando de leve. */
const coqueiros: Enfeite = (c, e) => {
  cada(e, 130, (x, i) => {
    const cx = x + 20 + hash(i) * 50, altura = 16 + hash(i + 3) * 10, dobra = 3 + hash(i + 1) * 4;
    const sway = Math.sin(e.t / 1100 + i) * 1.2;
    const topY = HORIZONTE - altura + sway, topX = cx + dobra + sway;
    c.strokeStyle = '#6b4a2a'; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx, HORIZONTE + 2); c.quadraticCurveTo(cx + 1, HORIZONTE - altura / 2, topX, topY); c.stroke();
    c.fillStyle = '#2f7a45';
    for (const a of [-2.5, -1.9, -1.3, -0.7, -0.15]) { c.beginPath(); c.ellipse(topX + Math.cos(a) * 6, topY + Math.sin(a) * 3, 6, 1.8, a, 0, Math.PI * 2); c.fill() }
  });
};

/** Muralha: pedra do forte antigo correndo pelo horizonte, com ameias no topo. */
const muralha: Enfeite = (c, e) => {
  cada(e, 70, (x) => {
    const top = HORIZONTE - 12;
    c.fillStyle = '#b8a179'; c.fillRect(x, top, 70, 14);
    c.fillStyle = '#9c8660'; c.beginPath();
    for (let k = 0; k < 5; k++) c.rect(x + 4 + k * 14, top - 5, 8, 6);
    c.fill();
    c.fillStyle = 'rgba(120,100,70,0.35)'; c.fillRect(x, top + 8, 70, 1.5);
  });
};

/** Barquinhos: barcos coloridos balançando perto da areia. */
const barquinhos: Enfeite = (c, e) => {
  cada(e, 300, (x, i) => {
    const bx = x + 70 + hash(i) * 160, by = HORIZONTE + 30 + hash(i + 4) * 30 + Math.sin(e.t / 800 + i) * 1.5;
    const cor = ['#e03131', '#1971c2', '#2f9e44', '#f08c00'][((i % 4) + 4) % 4];
    c.fillStyle = '#8d5a2b'; c.fillRect(bx - 9, by, 18, 3);
    c.fillStyle = cor; c.beginPath(); c.moveTo(bx - 10, by); c.lineTo(bx + 10, by); c.lineTo(bx + 7, by + 4); c.lineTo(bx - 7, by + 4); c.closePath(); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(bx, by - 1); c.lineTo(bx, by - 12); c.lineTo(bx + 8, by - 2); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(bx - 10, by + 5, 20, 1.5);
  });
};

/** Ondas grandes: cristas brancas mais altas no mar (só o enfeite; as ondas de base não mudam). */
const ondasGrandes: Enfeite = (c, e) => {
  c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2.5; c.lineCap = 'round';
  cada(e, 150, (x, i) => {
    const wx = x + 30 + hash(i) * 90, wy = HORIZONTE + 26 + hash(i + 2) * 50, r = 12 + hash(i + 5) * 10, sub = Math.sin(e.t / 900 + i) * 2;
    c.beginPath(); c.moveTo(wx - r, wy + sub); c.quadraticCurveTo(wx, wy - r, wx + r, wy + sub); c.stroke();
    c.beginPath(); c.moveTo(wx - r * 0.5, wy + 4 + sub); c.quadraticCurveTo(wx, wy - r * 0.6, wx + r * 0.5, wy + 4 + sub); c.stroke();
  });
};

/** Pranchas: pranchas de surf fincadas na beira da água, balançando um pouco. */
const pranchas: Enfeite = (c, e) => {
  cada(e, 340, (x, i) => {
    const px = x + 60 + hash(i) * 220, py = SHORE + 4, tilt = -0.25 + hash(i + 3) * 0.5, sway = Math.sin(e.t / 1000 + i) * 0.04;
    const cor = ['#ff922b', '#38d9a9', '#f783ac', '#ffd43b'][((i % 4) + 4) % 4];
    c.save(); c.translate(px, py); c.rotate(tilt + sway);
    c.fillStyle = cor; c.beginPath(); c.ellipse(0, -16, 5, 16, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(-1.2, -26, 2.4, 20);
    c.restore();
  });
};

/** Veleiros: barcos à vela atravessando a baía, devagar. */
const veleiros: Enfeite = (c, e) => {
  cada(e, 700, (x, i) => {
    const vx = x + 260 + hash(i) * 260 + (e.t / 800) % 300, vy = HORIZONTE + 34 + hash(i + 3) * 30;
    c.fillStyle = '#f1f3f5'; c.beginPath(); c.moveTo(vx - 18, vy); c.lineTo(vx + 18, vy); c.lineTo(vx + 12, vy + 6); c.lineTo(vx - 12, vy + 6); c.closePath(); c.fill();
    c.fillStyle = '#ced4da'; c.fillRect(vx - 18, vy, 36, 2);
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(vx - 2, vy - 20); c.lineTo(vx - 2, vy - 2); c.lineTo(vx - 15, vy - 2); c.closePath(); c.fill();
    c.fillStyle = '#e9ecef'; c.beginPath(); c.moveTo(vx + 2, vy - 16); c.lineTo(vx + 2, vy - 2); c.lineTo(vx + 13, vy - 2); c.closePath(); c.fill();
    c.strokeStyle = '#868e96'; c.lineWidth = 1; c.beginPath(); c.moveTo(vx - 2, vy - 20); c.lineTo(vx - 2, vy - 2); c.stroke();
  });
};

/** Reflexo do sol: faixa de brilho tremulando na água, embaixo do sol baixo (mesma coluna do enfeite 'sol'). */
const reflexo: Enfeite = (c, e) => {
  const x = e.cam + 320;
  for (let k = 0; k < 9; k++) {
    const y = HORIZONTE + 3 + k * 6, w = (14 - k) * 1.6 + hash(k) * 6, wob = Math.sin(e.t / 700 + k) * 5;
    c.fillStyle = `rgba(255,190,110,${0.5 - k * 0.04})`; c.fillRect(x - w / 2 + wob, y, w, 2);
  }
};

/** Bandeirinhas: cordão de bandeirinhas coloridas entre dois postes no céu. */
const bandeirinhas: Enfeite = (c, e) => {
  cada(e, 340, (x, i) => {
    const y0 = HORIZONTE - 22, meio = 5 + hash(i) * 3, sag = (u: number) => y0 + Math.sin(u * Math.PI) * meio;
    c.strokeStyle = 'rgba(90,60,30,0.7)'; c.lineWidth = 1.5; c.beginPath();
    for (let u = 0; u <= 1.001; u += 0.1) { const xx = x + u * 340, yy = sag(u); u === 0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy) } c.stroke();
    c.fillStyle = '#a0713c'; c.fillRect(x - 2, y0, 4, HORIZONTE - y0); c.fillRect(x + 338, y0, 4, HORIZONTE - y0);
    const cores = ['#e03131', '#f08c00', '#fcc419', '#37b24d', '#1971c2', '#f783ac'];
    for (let k = 0; k < 10; k++) {
      const u = (k + 0.5) / 10, xx = x + u * 340, yy = sag(u);
      c.fillStyle = cores[((i * 10 + k) % 6 + 6) % 6];
      c.beginPath(); c.moveTo(xx - 4, yy); c.lineTo(xx + 4, yy); c.lineTo(xx, yy + 9); c.closePath(); c.fill();
    }
  });
};

/** Faixas: faixas de campeonato esticadas no horizonte, com painéis coloridos em sequência. */
const faixas: Enfeite = (c, e) => {
  cada(e, 300, (x, i) => {
    const y = HORIZONTE - 26, w = 300;
    c.fillStyle = '#f8f9fa'; c.fillRect(x, y, w, 10);
    const cores = ['#e03131', '#1971c2', '#f08c00'];
    for (let k = 0; k < 6; k++) { c.fillStyle = cores[((i + k) % 3 + 3) % 3]; c.fillRect(x + k * 50, y, 25, 10) }
    c.fillStyle = '#343a40'; c.fillRect(x - 2, y - 3, 4, 16); c.fillRect(x + w - 2, y - 3, 4, 16);
  });
};

/** Todos os enfeites, pelo id usado em PRAIAS[b].enfeites. Enfeite novo: uma função aqui e o id na praia. */
export const ENFEITES: Record<string, Enfeite> = { sol, nuvens, gaivotas, boias, ilha, navio, jangadas, farol, pedras, coqueiros, muralha, barquinhos, ondasGrandes, pranchas, veleiros, reflexo, bandeirinhas, faixas };

/* ---------- Cenário ---------- */

/** Céu, mar com ondas, enfeites e a areia. A areia acompanha a beira do mar, que vai e volta devagar. */
export function desenharCenario(c: CanvasRenderingContext2D, P: Praia, e: Vista, H: number) {
  const { x0, x1, t } = e;
  const ceu = c.createLinearGradient(0, 0, 0, HORIZONTE); ceu.addColorStop(0, P.ceu[0]); ceu.addColorStop(1, P.ceu[1]); c.fillStyle = ceu; c.fillRect(x0, 0, x1 - x0, HORIZONTE);
  const mar = c.createLinearGradient(0, HORIZONTE, 0, SHORE); mar.addColorStop(0, P.mar[0]); mar.addColorStop(1, P.mar[1]); c.fillStyle = mar; c.fillRect(x0, HORIZONTE, x1 - x0, SHORE + 10 - HORIZONTE);
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
  for (let r = 0; r < 4; r++) { c.beginPath(); for (let x = Math.floor(x0 / 10) * 10; x <= x1; x += 10) { const y = HORIZONTE + 14 + r * 20 + Math.sin(x / 30 + t / 700 + r) * 3; x === Math.floor(x0 / 10) * 10 ? c.moveTo(x, y) : c.lineTo(x, y) } c.stroke() }
  for (const id of P.enfeites) ENFEITES[id]?.(c, e, P);
  const beira = (x: number) => SHORE + Math.sin(x / 38 + t / 900) * 5;
  c.fillStyle = P.areia; c.beginPath(); c.moveTo(x0, H); for (let x = Math.floor(x0 / 8) * 8; x <= x1; x += 8) c.lineTo(x, beira(x)); c.lineTo(x1, H); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 4; c.beginPath(); for (let x = Math.floor(x0 / 8) * 8; x <= x1; x += 8) x === Math.floor(x0 / 8) * 8 ? c.moveTo(x, beira(x)) : c.lineTo(x, beira(x)); c.stroke();
}

/** Luz da hora do dia, por cima de tudo (menos da interface): a tarde esquenta um pouco; o pôr do sol, bem mais. */
export function luz(c: CanvasRenderingContext2D, P: Praia, x0: number, x1: number, H: number) {
  const a = P.hora === 'porDoSol' ? 0.12 : P.hora === 'tarde' ? 0.035 : 0;
  if (a) { c.fillStyle = `rgba(255,140,60,${a})`; c.fillRect(x0, 0, x1 - x0, H) }
}

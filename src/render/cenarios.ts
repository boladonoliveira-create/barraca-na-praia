/* Cenário de cada praia: céu, mar, ondas e os enfeites de fundo (PRAIAS[b].enfeites). Só desenha; regras em docs/MOLDE-CENARIOS.md.
   Tudo em coordenadas do mundo, entre x0 e x1 (a parte visível). Sem Math.random: a posição vem de hash(i). */
import { SHORE, WALL_Y, PLAY_BOTTOM, LOTS, SHOPS, SERVICO, ESCOLA, FAIXAS } from '../dados/mapa.ts';
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

/** Nuvens: andam devagar para a direita; 1 a cada 260 unidades, de tamanho e altura variados. A cor segue a hora. */
const COR_NUVEM = { manha: 'rgba(255,255,255,0.9)', tarde: 'rgba(255,247,232,0.9)', porDoSol: 'rgba(255,190,150,0.9)' };
const nuvens: Enfeite = (c, e, P) => {
  c.fillStyle = COR_NUVEM[P.hora];
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

/** O painel "Fama" fica fixo no canto de cima, à esquerda da tela: o que é desenhado no alto do céu pula essa área. */
function semPainel(c: CanvasRenderingContext2D, e: Vista, fn: () => void) {
  c.save(); c.beginPath(); c.rect(e.x0, 0, e.x1 - e.x0, HORIZONTE + 4); c.rect(e.cam + 4, 0, 150, 42); c.clip('evenodd'); fn(); c.restore();
}

/** Bandeirinhas: cordão de bandeirinhas coloridas entre dois postes no céu (fora do painel de fama). */
const bandeirinhas: Enfeite = (c, e) => semPainel(c, e, () => {
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
});

/** Faixas: faixas de campeonato esticadas no horizonte, com painéis coloridos em sequência (fora do painel de fama). */
const faixas: Enfeite = (c, e) => semPainel(c, e, () => {
  cada(e, 300, (x, i) => {
    const y = HORIZONTE - 26, w = 300;
    c.fillStyle = '#f8f9fa'; c.fillRect(x, y, w, 10);
    const cores = ['#e03131', '#1971c2', '#f08c00'];
    for (let k = 0; k < 6; k++) { c.fillStyle = cores[((i + k) % 3 + 3) % 3]; c.fillRect(x + k * 50, y, 25, 10) }
    c.fillStyle = '#343a40'; c.fillRect(x - 2, y - 3, 4, 16); c.fillRect(x + w - 2, y - 3, 4, 16);
  });
});

/** Todos os enfeites, pelo id usado em PRAIAS[b].enfeites. Enfeite novo: uma função aqui e o id na praia. */
export const ENFEITES: Record<string, Enfeite> = { sol, nuvens, gaivotas, boias, ilha, navio, jangadas, farol, pedras, coqueiros, muralha, barquinhos, ondasGrandes, pranchas, veleiros, reflexo, bandeirinhas, faixas };

/* ---------- Areia (docs/MOLDE-AREIA.md) ---------- */

/** As zonas da areia onde a decoração pode ficar. Fora delas ficam balcões, filas, quadros e o caminho do jogador.
    beira: a faixa de areia molhada logo abaixo da água (y de y0 a y1), fora das filas dos balcões e dos chuveiros;
    divisa: a fresta entre dois lotes (até `meia` de cada lado de x0), na altura em que o jogador anda;
    rodape: a faixa de baixo, abaixo de onde o jogador pisa. */
export const AREIA = {
  beira: { y0: SHORE + 8, y1: SHORE + 22 },
  divisa: { meia: 6, y0: WALL_Y + 24, y1: PLAY_BOTTOM - 16 },
  rodape: { y0: PLAY_BOTTOM + 6, y1: PLAY_BOTTOM + 16 },
};
/** x livre na beira: longe das filas (balcões e quiosques têm fila na beira quando ela cresce para o lado). */
export function livreNaBeira(x: number) {
  if (SHOPS.some(d => (d.kind === 'counter' || d.kind === 'kiosk') && Math.abs(x - d.cx) < 110)) return false;
  return Math.abs(x - SERVICO.filaX) > 40 && Math.abs(x - ESCOLA.filaX) > 40;
}
/** Repete fn em cada divisa entre lotes que está visível (x da divisa e o índice do lote à direita). */
export function divisas(e: Vista, fn: (x: number, i: number) => void) {
  LOTS.forEach((l, i) => { if (i && l.x0 > e.x0 - 20 && l.x0 < e.x1 + 20) fn(l.x0, i) });
}

/** Conchas: pequenas, espalhadas pela beira (uma a cada 70 unidades, quando o lugar está livre). */
const conchas: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 70, (x, i) => {
    const cx = x + hash(i) * 50, cy = B.y0 + hash(i + 3) * (B.y1 - B.y0); if (!livreNaBeira(cx)) return;
    c.save(); c.translate(cx, cy); c.rotate((hash(i + 5) - 0.5) * 1.2); c.scale(1.3, 1.3);
    c.fillStyle = ['#ffd8a8', '#ffc9c9', '#fff4e6'][((i % 3) + 3) % 3]; c.beginPath(); c.moveTo(-4, 2); c.quadraticCurveTo(0, -6, 4, 2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(160,110,70,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 2); c.lineTo(0, -2); c.moveTo(-2, 2); c.lineTo(-1, -1); c.moveTo(2, 2); c.lineTo(1, -1); c.stroke();
    c.restore();
  });
};

/** Castelinho de areia: em pontos fixos da beira que estão sempre livres (o 1º logo à direita da Barraca do Sol). */
const CASTELOS = [350, 1310, 1880, 2450, 2760];
const castelinho: Enfeite = (c, e) => {
  const y = AREIA.beira.y1 - 2; // a base encosta no fim da beira; o castelo sobe em direção ao mar
  CASTELOS.forEach(cx => {
    if (cx < e.x0 - 30 || cx > e.x1 + 30 || !livreNaBeira(cx - 16) || !livreNaBeira(cx + 19)) return;
    c.fillStyle = '#e9c98b'; c.fillRect(cx - 14, y - 10, 28, 10); // muro
    c.fillStyle = '#dcb877'; c.fillRect(cx - 16, y - 18, 8, 18); c.fillRect(cx + 8, y - 18, 8, 18); // torres
    c.fillStyle = '#e9c98b'; for (const tx of [cx - 16, cx + 8]) for (let k = 0; k < 3; k++) c.fillRect(tx + k * 3, y - 21, 2, 3); // ameias
    c.fillStyle = '#c9a368'; c.fillRect(cx - 3, y - 6, 6, 6); // porta
    c.strokeStyle = '#8d5a2b'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx + 12, y - 18); c.lineTo(cx + 12, y - 28); c.stroke();
    c.fillStyle = '#ff6b6b'; c.beginPath(); c.moveTo(cx + 12, y - 28); c.lineTo(cx + 19, y - 25.5); c.lineTo(cx + 12, y - 23); c.closePath(); c.fill();
  });
};

/** Sombra clara sob um objeto da areia (a única sombra permitida pelo molde). */
function sombra(c: CanvasRenderingContext2D, x: number, y: number, rx: number) {
  c.fillStyle = 'rgba(120,80,30,0.15)'; c.beginPath(); c.ellipse(x, y, rx, rx * 0.35, 0, 0, Math.PI * 2); c.fill();
}

/** Guarda-sóis: pequenos e fechados ou meio abertos na beira (não são os da Barraca do Sol, que são compra). */
const guardaSois: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 110, (x, i) => {
    const gx = x + 30 + hash(i) * 60, base = B.y1; if (!livreNaBeira(gx)) return;
    const cor = ['#f06595', '#4dabf7', '#ffd43b', '#38d9a9'][((i % 4) + 4) % 4];
    sombra(c, gx, base, 7);
    c.strokeStyle = '#9c8660'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx, base); c.lineTo(gx, base - 20); c.stroke();
    if (hash(i + 9) < 0.5) { // fechado: cone estreito
      c.fillStyle = cor; c.beginPath(); c.moveTo(gx, base - 26); c.lineTo(gx - 4, base - 12); c.lineTo(gx + 4, base - 12); c.closePath(); c.fill();
    } else { // meio aberto: meia cúpula
      c.fillStyle = cor; c.beginPath(); c.ellipse(gx, base - 18, 9, 7, 0, Math.PI, 0); c.fill();
    }
  });
};

/** Cangas: toalhas estendidas na areia molhada, listradas. */
const cangas: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 150, (x, i) => {
    const cx = x + 20 + hash(i) * 70, cy = B.y0 + 3 + hash(i + 2) * 6; if (!livreNaBeira(cx + 8) || !livreNaBeira(cx - 8)) return;
    const cor = ['#ff8787', '#74c0fc', '#ffd43b'][((i % 3) + 3) % 3];
    c.save(); c.translate(cx, cy); c.rotate((hash(i + 4) - 0.5) * 0.4);
    c.fillStyle = '#fff7e6'; c.fillRect(-9, -4, 18, 8);
    c.fillStyle = cor; c.fillRect(-9, -4, 18, 2); c.fillRect(-9, 2, 18, 2);
    c.restore();
  });
};

/** Pedras: pedras redondas na areia molhada (as do mar ficam no enfeite 'pedras', do cenário). */
const pedrasAreia: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 130, (x, i) => {
    if (hash(i + 6) < 0.3) return;
    const px = x + 20 + hash(i) * 80, py = B.y1 - 1 - hash(i + 2) * 5, w = 7 + hash(i + 4) * 7; if (!livreNaBeira(px)) return;
    sombra(c, px, B.y1 + 1, w * 1.1);
    c.fillStyle = '#9aa1a8'; c.beginPath(); c.ellipse(px, py, w, w * 0.7, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#c2c8cf'; c.beginPath(); c.ellipse(px - w * 0.2, py - w * 0.25, w * 0.45, w * 0.3, 0, 0, Math.PI * 2); c.fill();
  });
};

/** Redes de pesca: penduradas em duas estacas na beira, com a malha aberta (pontos fixos bem livres). */
const REDES = [640, 1180, 1980, 2660];
const redes: Enfeite = (c, e) => {
  const B = AREIA.beira, y = B.y1, topo = y - 22;
  REDES.forEach(rx => {
    if (rx < e.x0 - 30 || rx > e.x1 + 30 || !livreNaBeira(rx - 14) || !livreNaBeira(rx + 14)) return;
    c.strokeStyle = '#a0713c'; c.lineWidth = 2; c.beginPath(); c.moveTo(rx - 14, y); c.lineTo(rx - 14, topo); c.moveTo(rx + 14, y); c.lineTo(rx + 14, topo); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1; c.beginPath();
    for (let k = -2; k <= 2; k++) { c.moveTo(rx - 14, topo + 4 + k * 4); c.lineTo(rx + 14, topo + 5 + k * 4); }
    for (let k = -1; k <= 1; k++) { c.moveTo(rx + k * 9, topo + 2); c.lineTo(rx + k * 9, y - 2); }
    c.stroke();
  });
};

/** Coqueiros: palmeiras plantadas na beira, com sombra; a copa sobe em direção ao mar. */
const coqueirosAreia: Enfeite = (c, e) => {
  const B = AREIA.beira, base = B.y1;
  cada(e, 210, (x, i) => {
    const px = x + 30 + hash(i) * 90; if (!livreNaBeira(px)) return;
    const altura = 30 + hash(i + 1) * 14, dobra = 4 + hash(i + 2) * 6, sway = Math.sin(e.t / 1200 + i) * 1.5;
    const topX = px + dobra + sway, topY = base - altura + sway;
    sombra(c, px, base, 9);
    c.strokeStyle = '#7a5230'; c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(px, base); c.quadraticCurveTo(px + 1, base - altura / 2, topX, topY); c.stroke();
    c.fillStyle = '#2f7a45';
    for (const a of [-2.6, -2.0, -1.4, -0.8]) { c.beginPath(); c.ellipse(topX + Math.cos(a) * 7, topY + Math.sin(a) * 4, 8, 2.2, a, 0, Math.PI * 2); c.fill() }
    c.fillStyle = '#3f9a55'; c.beginPath(); c.ellipse(topX, topY + 1, 5, 2, 0, 0, Math.PI * 2); c.fill();
  });
};

/** Cocos caídos: na areia molhada, perto de onde os coqueiros estão. */
const cocos: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 120, (x, i) => {
    if (hash(i + 3) < 0.45) return;
    const cx = x + 20 + hash(i) * 80, cy = B.y1 - 2 - hash(i + 1) * 6; if (!livreNaBeira(cx)) return;
    c.fillStyle = '#7a5230'; c.beginPath(); c.ellipse(cx, cy, 4, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5e3f24'; c.beginPath(); c.ellipse(cx - 1, cy - 1, 1.5, 1.5, 0, 0, Math.PI * 2); c.fill();
  });
};

/** Canhão antigo: peça de forte apontada para o mar, em pontos fixos livres (um por tela). */
const CANHOES = [560, 1380, 2200];
const canhao: Enfeite = (c, e) => {
  const y = AREIA.beira.y1;
  CANHOES.forEach((cx0, i) => {
    if (cx0 < e.x0 - 40 || cx0 > e.x1 + 40 || !livreNaBeira(cx0 - 16) || !livreNaBeira(cx0 + 24)) return;
    sombra(c, cx0, y + 1, 16);
    c.fillStyle = '#7a5230'; c.beginPath(); c.moveTo(cx0 - 13, y); c.lineTo(cx0 + 11, y); c.lineTo(cx0 + 9, y - 6); c.lineTo(cx0 - 11, y - 6); c.closePath(); c.fill(); // carreta
    c.fillStyle = '#3b3f45'; c.fillRect(cx0 - 9, y - 6, 20, 6); // berço
    c.fillStyle = '#4e3418';
    c.beginPath(); c.moveTo(cx0 - 4, y - 3); c.arc(cx0 - 8, y - 3, 3.4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx0 + 10, y - 3); c.arc(cx0 + 6, y - 3, 3.4, 0, Math.PI * 2); c.fill(); // rodas
    const ang = -0.5 + (hash(i) - 0.5) * 0.28;
    c.save(); c.translate(cx0 - 6, y - 9); c.rotate(ang);
    c.fillStyle = '#2f3338'; c.fillRect(0, -3.5, 22, 7); c.fillStyle = '#242a2e'; c.fillRect(19, -4.5, 4, 9); c.restore(); // barril e boca
  });
};

/** Pedras do forte: blocos grandes e musgosos na beira. */
const pedrasForte: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 140, (x, i) => {
    if (hash(i + 5) < 0.35) return;
    const px = x + 25 + hash(i) * 80, py = B.y1 - hash(i + 2) * 4, w = 9 + hash(i + 3) * 8; if (!livreNaBeira(px)) return;
    sombra(c, px, B.y1 + 1, w * 1.1);
    c.fillStyle = '#8b8f94'; c.fillRect(px - w, py - w * 0.7, w * 2, w * 0.7);
    c.fillStyle = '#6f7a5a'; c.fillRect(px - w, py - w * 0.78, w * 2, w * 0.16);
  });
};

/** Brilho: pontinhos de ouro na areia molhada, piscando devagar. */
const brilho: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 55, (x, i) => {
    const px = x + hash(i) * 40, py = B.y0 + 2 + hash(i + 1) * 11;
    const pulso = (Math.sin(e.t / 320 + i * 1.7) + 1) / 2; if (pulso < 0.35) return;
    const r = 1.4 + pulso * 1.6;
    c.globalAlpha = 0.3 + pulso * 0.7; c.fillStyle = '#fff3b0';
    c.beginPath(); c.moveTo(px, py - r); c.lineTo(px + r * 0.5, py); c.lineTo(px, py + r); c.lineTo(px - r * 0.5, py); c.closePath(); c.fill();
    c.globalAlpha = 1;
  });
};

/** Estrelas-do-mar: na areia molhada, giradas. */
const estrelas: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 115, (x, i) => {
    if (hash(i + 2) < 0.4) return;
    const px = x + 20 + hash(i) * 80, py = B.y1 - 3 - hash(i + 1) * 5; if (!livreNaBeira(px)) return;
    const r = 4 + hash(i + 3) * 2;
    c.save(); c.translate(px, py); c.rotate(hash(i + 4) * Math.PI * 2);
    c.fillStyle = ['#ffb3c1', '#ffd6a5'][((i % 2) + 2) % 2];
    c.beginPath();
    for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * 0.45 : r, a = (k / 10) * Math.PI * 2; const fx = Math.cos(a) * rr, fy = Math.sin(a) * rr; k ? c.lineTo(fx, fy) : c.moveTo(fx, fy) }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(0, 0, r * 0.22, 0, Math.PI * 2); c.fill();
    c.restore();
  });
};

/** Pranchas fincadas na areia molhada. A faixa grande vazia da Praia Brava (x 2000..2600) fica de fora. */
const PRANCHAS_AREIA = [520, 900, 1250, 1620, 2320, 2760];
const pranchasAreia: Enfeite = (c, e) => {
  const y = AREIA.beira.y1;
  PRANCHAS_AREIA.forEach((px0, i) => {
    if (px0 < e.x0 - 30 || px0 > e.x1 + 30) return;
    if (px0 > 1990 && px0 < 2610) return;
    if (!livreNaBeira(px0)) return;
    const px = px0 + (hash(i) - 0.5) * 20;
    sombra(c, px, y, 6);
    c.save(); c.translate(px, y); c.rotate((hash(i + 1) - 0.5) * 0.5);
    c.fillStyle = ['#ff8787', '#74c0fc', '#ffd43b', '#95e1a0'][((i % 4) + 4) % 4];
    c.beginPath(); c.ellipse(0, -16, 5, 17, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(-0.8, -30, 1.6, 28);
    c.restore();
  });
};

/** Marcas de pé: pegadas bem claras no rodapé e na beira. */
const marcasPe: Enfeite = (c, e) => {
  const B = AREIA.beira, R = AREIA.rodape;
  c.fillStyle = 'rgba(180,150,100,0.4)';
  cada(e, 34, (x, i) => {
    const py = hash(i) < 0.6 ? R.y0 + hash(i + 1) * 9 : B.y0 + hash(i + 1) * (B.y1 - B.y0);
    const px = x + hash(i + 2) * 20;
    c.save(); c.translate(px, py); c.rotate(hash(i + 3) < 0.5 ? -0.25 : 0.25);
    c.beginPath(); c.ellipse(0, 0, 2.1, 3.4, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  });
};

/** Âncora: peça grande na areia, em pontos fixos livres (uma por tela). */
const ANCORAS = [760, 1560, 2430];
const ancora: Enfeite = (c, e) => {
  const y = AREIA.beira.y1;
  ANCORAS.forEach(cx => {
    if (cx < e.x0 - 40 || cx > e.x1 + 40 || !livreNaBeira(cx)) return;
    sombra(c, cx, y + 1, 13);
    c.strokeStyle = '#5c636b'; c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx, y - 4); c.lineTo(cx, y - 22); c.stroke(); // haste
    c.beginPath(); c.moveTo(cx - 8, y - 16); c.lineTo(cx + 8, y - 16); c.stroke(); // cepo
    c.beginPath(); c.arc(cx, y - 25, 3, 0, Math.PI * 2); c.stroke(); // argola
    c.beginPath(); c.moveTo(cx - 12, y - 11); c.quadraticCurveTo(cx, y, cx + 12, y - 11); c.stroke(); // braços
  });
};

/** Boias de veleiro: laranjas redondas, deitadas na areia molhada. */
const boiasVeleiro: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 140, (x, i) => {
    if (hash(i + 1) < 0.35) return;
    const px = x + 25 + hash(i) * 70, py = B.y1 - 4; if (!livreNaBeira(px)) return;
    const n = 1 + ((i % 2) + 2) % 2;
    for (let k = 0; k < n; k++) {
      const bx = px + k * 9 - 4, by = py - k * 2, r = 4.5;
      c.fillStyle = ['#ff922b', '#f76707'][((i + k) % 2 + 2) % 2];
      c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(bx - r, by - 1, r * 2, 2);
    }
  });
};

/** Tochas acesas em pontos fixos: a chama tremula e a luz é um círculo claro, sem shadowBlur. */
const TOCHAS = [430, 1160, 1900, 2680];
const tochas: Enfeite = (c, e) => {
  const y = AREIA.beira.y1;
  TOCHAS.forEach((tx0, i) => {
    if (tx0 < e.x0 - 30 || tx0 > e.x1 + 30 || !livreNaBeira(tx0)) return;
    const tx = tx0 + (hash(i) - 0.5) * 14, topo = y - 30, f = 1 + Math.sin(e.t / 90 + i) * 0.25;
    sombra(c, tx, y, 5);
    c.strokeStyle = '#8a6a3a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(tx, y); c.lineTo(tx, topo); c.stroke(); // mastro
    c.fillStyle = '#5e4a2a'; c.beginPath(); c.ellipse(tx, topo, 4, 3, 0, 0, Math.PI * 2); c.fill(); // taça
    c.globalAlpha = 0.25; c.fillStyle = '#ffd166'; c.beginPath(); c.arc(tx, topo - 4, 9 * f, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; // luz
    c.fillStyle = '#ff9f1c'; c.beginPath(); c.moveTo(tx, topo - 12 * f); c.quadraticCurveTo(tx + 4, topo - 4, tx, topo - 1); c.quadraticCurveTo(tx - 4, topo - 4, tx, topo - 12 * f); c.fill(); // chama
    c.fillStyle = '#ffe08a'; c.beginPath(); c.ellipse(tx, topo - 5, 1.8, 3.2 * f, 0, 0, Math.PI * 2); c.fill();
  });
};

/** Esteiras: palha trançada estendida na areia molhada. */
const esteiras: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 150, (x, i) => {
    const cx = x + 25 + hash(i) * 70, cy = B.y0 + 4 + hash(i + 1) * 6; if (!livreNaBeira(cx + 9) || !livreNaBeira(cx - 9)) return;
    c.save(); c.translate(cx, cy); c.rotate((hash(i + 2) - 0.5) * 0.3);
    c.fillStyle = '#e8cf94'; c.fillRect(-10, -5, 20, 10);
    c.strokeStyle = 'rgba(150,110,60,0.6)'; c.lineWidth = 1; c.beginPath();
    for (let k = -6; k <= 6; k += 4) { c.moveTo(k, -5); c.lineTo(k, 5) }
    c.stroke(); c.restore();
  });
};

/** Placas de patrocínio: nomes genéricos e inventados, em pontos fixos (nada de marca real). */
const PLACAS = [
  { x: 820, txt: 'SORVETÃO DO ZÉ', cor: '#ffd43b' },
  { x: 1620, txt: 'RÁDIO PRAIA FM', cor: '#74c0fc' },
  { x: 2520, txt: 'ÁGUA DE COCO BOM', cor: '#95e1a0' },
];
const placas: Enfeite = (c, e) => {
  const y = AREIA.beira.y1;
  PLACAS.forEach(p => {
    if (p.x < e.x0 - 60 || p.x > e.x1 + 60 || !livreNaBeira(p.x - 30) || !livreNaBeira(p.x + 30)) return;
    sombra(c, p.x, y + 1, 20);
    c.fillStyle = '#8a6a3a'; c.fillRect(p.x - 24, y - 24, 4, 24); c.fillRect(p.x + 20, y - 24, 4, 24); // postes
    c.fillStyle = '#fffdf5'; c.fillRect(p.x - 32, y - 40, 64, 20); // moldura
    c.fillStyle = p.cor; c.fillRect(p.x - 29, y - 37, 58, 14); // placa
    c.fillStyle = '#3a2f1a'; c.font = 'bold 6px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(p.txt, p.x, y - 30);
  });
  c.textAlign = 'start'; c.textBaseline = 'alphabetic';
};

/** Cones: pequenos cones laranja na areia molhada. */
const cones: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 150, (x, i) => {
    if (hash(i + 1) < 0.4) return;
    const cx = x + 25 + hash(i) * 70, y = B.y1; if (!livreNaBeira(cx)) return;
    sombra(c, cx, y + 1, 6);
    c.fillStyle = '#ff6b3d'; c.beginPath(); c.moveTo(cx, y - 14); c.lineTo(cx - 6, y); c.lineTo(cx + 6, y); c.closePath(); c.fill();
    c.fillStyle = '#fff3e0'; c.fillRect(cx - 4, y - 8, 8, 2.5);
    c.fillStyle = '#ff6b3d'; c.fillRect(cx - 7, y - 1.5, 14, 2.5);
  });
};

/** Bandeiras: flâmulas que tremulam em mastros na beira. */
const BANDEIRAS = [340, 890, 1250, 1990, 2680];
const bandeiras: Enfeite = (c, e) => {
  const y = AREIA.beira.y1;
  BANDEIRAS.forEach((bx, i) => {
    if (bx < e.x0 - 30 || bx > e.x1 + 30 || !livreNaBeira(bx)) return;
    const topo = y - 26, sway = Math.sin(e.t / 400 + i) * 2;
    sombra(c, bx, y, 4);
    c.strokeStyle = '#7a6a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, y); c.lineTo(bx, topo); c.stroke();
    c.fillStyle = ['#e64980', '#7950f2', '#22b8cf', '#f59f00'][((i % 4) + 4) % 4];
    c.beginPath(); c.moveTo(bx, topo); c.lineTo(bx + 14 + sway, topo + 5); c.lineTo(bx, topo + 10); c.closePath(); c.fill();
  });
};

/** Todos os enfeites da areia, pelo id usado em PRAIAS[b].enfeitesAreia. */
export const ENFEITES_AREIA: Record<string, Enfeite> = { conchas, castelinho, guardaSois, cangas, pedrasAreia, redes, coqueirosAreia, cocos, canhao, pedrasForte, brilho, estrelas, pranchasAreia, marcasPe, ancora, boiasVeleiro, tochas, esteiras, placas, cones, bandeiras };

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
  orla(c, e);
  for (const id of P.enfeitesAreia) ENFEITES_AREIA[id]?.(c, e, P); // decoração da areia: por baixo de tudo o que é do jogo
}

/** Grama, calçadão (ciclovia e calçada) e rua, por baixo da areia. Desenho simples: o acabamento é da parte B (MOLDE-ORLA). */
function orla(c: CanvasRenderingContext2D, e: Vista) {
  const { x0, x1 } = e, F = FAIXAS, w = x1 - x0;
  c.fillStyle = '#8cc56b'; c.fillRect(x0, F.grama.y0, w, F.grama.y1 - F.grama.y0);
  c.fillStyle = '#6fae4f'; c.fillRect(x0, F.grama.y0, w, 4);
  c.fillStyle = '#c7442f'; c.fillRect(x0, F.calcadao.y0, w, 30); // ciclovia
  c.fillStyle = '#fff'; for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) c.fillRect(x, F.calcadao.y0 + 14, 20, 2);
  c.fillStyle = '#ece6da'; c.fillRect(x0, F.calcadao.y0 + 30, w, F.calcadao.y1 - F.calcadao.y0 - 30); // calçada
  c.fillStyle = '#9aa0a6'; c.fillRect(x0, F.rua.y0, w, 6); // meio-fio
  c.fillStyle = '#495057'; c.fillRect(x0, F.rua.y0 + 6, w, F.rua.y1 - F.rua.y0 - 6);
  c.fillStyle = '#ffd43b'; for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) c.fillRect(x, (F.rua.y0 + F.rua.y1) / 2, 30, 3);
}

/** Luz da hora do dia, por cima de tudo (menos da interface): a tarde esquenta um pouco; o pôr do sol, bem mais. */
export function luz(c: CanvasRenderingContext2D, P: Praia, x0: number, x1: number, H: number) {
  const a = P.hora === 'porDoSol' ? 0.12 : P.hora === 'tarde' ? 0.035 : 0;
  if (a) { c.fillStyle = `rgba(255,140,60,${a})`; c.fillRect(x0, 0, x1 - x0, H) }
}

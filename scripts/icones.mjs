// Gera os PNGs provisórios de ícone e abertura a partir da arte da tela inicial (index.html).
// Depois: npx capacitor-assets generate --android
import sharp from 'sharp';

const arte = `
  <rect x="97" y="52" width="6" height="92" rx="3" fill="#8d5a2b"/>
  <path d="M20 70 A80 52 0 0 1 180 70 Z" fill="#ff6b6b"/>
  <path d="M60 70 Q66 30 100 18 Q82 36 80 70 Z M120 70 Q118 36 100 18 Q134 30 140 70 Z" fill="#fff"/>
  <circle cx="100" cy="18" r="5" fill="#c92a2a"/>
  <g transform="translate(140 112)"><path d="M-12 0 h24 l-4 24 h-16 Z" fill="#fff" stroke="#d9c7e6" stroke-width="2"/><ellipse cx="0" cy="0" rx="14" ry="7" fill="#5b2370"/><circle cx="5" cy="-5" r="4" fill="#e63946"/><circle cx="-5" cy="-2" r="2" fill="#e9c46a"/></g>`;
const fundo = (w, h, mar) => `<rect width="${w}" height="${h}" fill="#f6e3b4"/><rect width="${w}" height="${h * mar}" fill="#1f9fb0"/><rect y="${h * mar}" width="${w}" height="${h * 0.02}" fill="#fff"/>`;
const svg = (w, h, corpo) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${corpo}</svg>`);
// arte de 200x150 centrada num quadrado de lado s, ocupando a fração f
const centro = (s, f) => { const k = s * f / 200; return `<g transform="translate(${(s - 200 * k) / 2} ${(s - 150 * k) / 2}) scale(${k})">${arte}</g>` };

const png = (nome, buf) => sharp(buf).png().toFile('assets/' + nome);
await png('icon-background.png', svg(1024, 1024, fundo(1024, 1024, 0.5)));
await png('icon-foreground.png', svg(1024, 1024, centro(1024, 0.55))); // zona segura do ícone adaptativo: 66% do centro
await png('icon-only.png', svg(1024, 1024, fundo(1024, 1024, 0.5) + centro(1024, 0.72)));
const titulo = `<text x="1366" y="1900" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="230" fill="#5b2370">Barraca</text>
  <text x="1366" y="2130" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="150" fill="#2f9e44">na Praia</text>`;
const abertura = fundo(2732, 2732, 0.38) + `<g transform="translate(866 560) scale(5)">${arte}</g>` + titulo;
await png('splash.png', svg(2732, 2732, abertura));
await png('splash-dark.png', svg(2732, 2732, abertura));
console.log('ok');

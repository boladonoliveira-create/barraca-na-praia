/* As 10 praias do litoral (roteiro da rodada 5). A praia N tem as áreas 1 a N; a área N é a novidade dela.
   Cenário: cores do mar, da areia e do céu, hora do dia e os enfeites de fundo (desenhados em render/cenarios.ts).
   Regras dos enfeites: docs/MOLDE-CENARIOS.md. */
export type Hora = 'manha' | 'tarde' | 'porDoSol';
export interface Praia {
  nome: string;
  /** a área nova desta praia (aparece no litoral e na placa "Na próxima praia") */
  area: string;
  /** mar: [fundo, perto da areia] */
  mar: [string, string];
  areia: string;
  /** céu: [topo, horizonte] */
  ceu: [string, string];
  hora: Hora;
  /** ids das funções de ENFEITES (render/cenarios.ts), desenhados nesta ordem */
  enfeites: string[];
  /** ids das funções de ENFEITES_AREIA (render/cenarios.ts): decoração da areia, só nas zonas livres (docs/MOLDE-AREIA.md) */
  enfeitesAreia: string[];
  /** banhistas (gente que não compra) por tela de 400 de largura: de 25 a 40 */
  banhistas: number;
}

export const PRAIAS: Praia[] = [
  { nome: 'Praia do Sol', area: 'Barraca do Sol', mar: ['#0f7f99', '#33c2c9'], areia: '#f6e3b4', ceu: ['#8fd8ff', '#e3f7ff'], hora: 'manha',
    enfeites: ['sol', 'nuvens', 'gaivotas', 'boias'], enfeitesAreia: ['conchas', 'castelinho'], banhistas: 32 },
  { nome: 'Praia Grande', area: 'Sorveteria', mar: ['#155f9e', '#3aa0d8'], areia: '#f3dcaa', ceu: ['#6ec3f5', '#d6efff'], hora: 'tarde',
    enfeites: ['sol', 'nuvens', 'ilha', 'navio', 'jangadas'], enfeitesAreia: ['cangas', 'guardaSois'], banhistas: 34 },
  { nome: 'Praia do Farol', area: 'Chuveirão e cadeiras', mar: ['#0f7f99', '#35c6d0'], areia: '#f6e3b4', ceu: ['#8fd8ff', '#e8f8ff'], hora: 'manha',
    enfeites: ['sol', 'nuvens', 'farol', 'pedras', 'gaivotas', 'boias'], enfeitesAreia: ['pedrasAreia', 'redes'], banhistas: 30 },
  { nome: 'Praia dos Coqueiros', area: 'Milho e pastel', mar: ['#0e7d8c', '#3ac7c0'], areia: '#f6e3b4', ceu: ['#93dbff', '#e9f8ff'], hora: 'manha',
    enfeites: ['sol', 'nuvens', 'gaivotas'], enfeitesAreia: ['coqueirosAreia', 'cocos'], banhistas: 36 },
  { nome: 'Praia do Forte', area: 'Quadra de futevôlei', mar: ['#155f9e', '#3aa0d8'], areia: '#f2ddab', ceu: ['#6ec3f5', '#d6efff'], hora: 'tarde',
    enfeites: ['sol', 'nuvens', 'muralha', 'navio', 'gaivotas'], enfeitesAreia: ['pedrasForte', 'canhao'], banhistas: 34 },
  { nome: 'Praia Dourada', area: 'Ambulantes', mar: ['#1c5a8a', '#5fb7d6'], areia: '#f7d98c', ceu: ['#7fc6f0', '#f6efd6'], hora: 'tarde',
    enfeites: ['sol', 'nuvens', 'barquinhos', 'gaivotas', 'boias'], enfeitesAreia: ['brilho', 'estrelas'], banhistas: 38 },
  { nome: 'Praia Brava', area: 'Escolinha de surf', mar: ['#0b4f78', '#2b8fbf'], areia: '#eed8a8', ceu: ['#78bfe9', '#d9eefc'], hora: 'tarde',
    enfeites: ['sol', 'nuvens', 'ondasGrandes', 'gaivotas', 'pranchas'], enfeitesAreia: ['marcasPe', 'pranchasAreia'], banhistas: 32 },
  { nome: 'Baía Azul', area: 'Sucos e vitaminas', mar: ['#0a58b8', '#2fa8f0'], areia: '#f5e2b2', ceu: ['#6cc0f7', '#dff3ff'], hora: 'tarde',
    enfeites: ['sol', 'nuvens', 'veleiros', 'gaivotas', 'boias'], enfeitesAreia: ['boiasVeleiro', 'ancora'], banhistas: 36 },
  { nome: 'Praia do Pôr do Sol', area: 'Palco de pagode', mar: ['#3a4f8f', '#d9886a'], areia: '#efcf9e', ceu: ['#f08a4b', '#ffd59a'], hora: 'porDoSol',
    enfeites: ['sol', 'nuvens', 'reflexo', 'gaivotas'], enfeitesAreia: ['esteiras', 'tochas'], banhistas: 25 },
  { nome: 'Praia do Campeonato', area: 'Torneio de futevôlei', mar: ['#12679a', '#3cb2d8'], areia: '#f4dfae', ceu: ['#7cc8f2', '#e2f4ff'], hora: 'tarde',
    enfeites: ['sol', 'nuvens', 'faixas', 'bandeirinhas', 'gaivotas'], enfeitesAreia: ['bandeiras', 'cones', 'placas'], banhistas: 40 },
];

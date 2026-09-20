// ===========================
//   BLOCK TD - proj.js  v3 (animated)
// ===========================

const TILE = 40;
const MAP_COLS = 20;
const MAP_ROWS = 14;

// ===========================
//   MAP DEFINITIONS
// ===========================
const MAPS = {
  floresta: {
    name: 'Floresta',
    desc: 'Campos verdejantes com um caminho sinuoso. Bastante espaço para torres.',
    // Reworked path: S-curve from left, deep zigzag through center, exit bottom-right
    waypoints: [
      [0,2],[4,2],[4,5],[1,5],[1,9],[5,9],[5,6],[9,6],
      [9,10],[13,10],[13,7],[17,7],[17,11],[20,11]
    ],
    // Water tiles reserved for future aquatic units/towers. Empty for now —
    // populate with [col,row] pairs to add lakes/rivers to this map.
    waterTiles: [],
    colors: {
      grassA: '#2d6a3f', grassB: '#275a36',
      pathA:  '#b87333', pathB:  '#a0622e',
      grid: 'rgba(0,0,0,0.12)',
      accent: '#4ecb71',
    },
    drawExtras(ctx) {
      // Scattered trees (decorative, not on path)
      const trees = [
        [2,0],[6,0],[10,0],[14,0],[18,0],[19,3],
        [0,7],[3,3],[8,4],[12,5],[16,3],[18,5],
        [2,12],[6,11],[11,12],[15,12],[19,12],[0,13],[19,13],
      ];
      trees.forEach(([c,r]) => {
        if (PATH_SET.has(`${c},${r}`)) return;
        const x = c*TILE+TILE/2, y = r*TILE+TILE/2;
        const bob = Math.sin(globalTime*1.2 + c*0.7 + r*0.5) * 1.5;
        // Trunk
        ctx.fillStyle = '#5a3a10';
        ctx.fillRect(x-3, y+4+bob, 6, 8);
        // Canopy layers
        ctx.fillStyle = '#1a5e2a';
        ctx.beginPath(); ctx.arc(x, y-2+bob, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#228833';
        ctx.beginPath(); ctx.arc(x-2, y-5+bob, 7, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+3, y-6+bob, 6, 0, Math.PI*2); ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(100,220,100,0.2)';
        ctx.beginPath(); ctx.arc(x-1, y-7+bob, 4, 0, Math.PI*2); ctx.fill();
      });
    }
  },

  vulcao: {
    name: 'Vulcão',
    desc: 'Terreno de lava e rocha. O caminho é mais longo mas as torres têm menos espaço.',
    // Long winding path through volcanic terrain
    waypoints: [
      [0,6],[3,6],[3,1],[7,1],[7,4],[5,4],[5,8],[8,8],
      [8,5],[12,5],[12,2],[16,2],[16,6],[13,6],[13,10],
      [17,10],[17,7],[20,7]
    ],
    // Water tiles reserved for future aquatic units/towers. Empty for now.
    waterTiles: [],
    colors: {
      grassA: '#2a1a0a', grassB: '#221408',
      pathA:  '#cc4400', pathB:  '#aa3300',
      grid: 'rgba(255,50,0,0.08)',
      accent: '#ff6622',
    },
    drawExtras(ctx) {
      // Lava pools (animated)
      const pools = [[1,2],[2,10],[6,11],[10,7],[14,4],[18,3],[19,9],[11,12],[4,12]];
      pools.forEach(([c,r]) => {
        if (PATH_SET.has(`${c},${r}`)) return;
        const x = c*TILE+TILE/2, y = r*TILE+TILE/2;
        const pulse = 0.6 + Math.sin(globalTime*2.5 + c*1.1 + r*0.8) * 0.25;
        // Lava glow
        ctx.save();
        ctx.globalAlpha = pulse * 0.5;
        const grad = ctx.createRadialGradient(x, y, 2, x, y, 14);
        grad.addColorStop(0, '#ff6600');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI*2); ctx.fill();
        // Lava surface
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#cc3300';
        ctx.beginPath(); ctx.ellipse(x, y, 10, 7, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff5500';
        ctx.beginPath(); ctx.ellipse(x-2, y-1, 6, 4, 0.3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath(); ctx.ellipse(x+1, y, 3, 2, -0.2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Rocks / boulders
      const rocks = [[3,9],[7,11],[10,3],[15,8],[18,11],[1,4],[6,7],[9,12],[14,1],[19,5]];
      rocks.forEach(([c,r]) => {
        if (PATH_SET.has(`${c},${r}`)) return;
        const x = c*TILE+TILE/2, y = r*TILE+TILE/2;
        ctx.fillStyle = '#3a2a18';
        ctx.beginPath();
        ctx.arc(x, y+2, 11, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4a3a28';
        ctx.beginPath();
        ctx.arc(x-1, y, 9, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#5a4a38';
        ctx.beginPath();
        ctx.arc(x-2, y-2, 6, 0, Math.PI*2); ctx.fill();
        // Hot crack glow
        ctx.strokeStyle = '#ff440044';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x-4, y+3); ctx.lineTo(x, y-1); ctx.lineTo(x+3, y+2);
        ctx.stroke();
      });

      // Ember particles (rising from lava)
      const emberCount = 8;
      for (let i = 0; i < emberCount; i++) {
        const seed = i * 137.5;
        const cx = ((seed * 73 + globalTime * 15) % (MAP_COLS * TILE));
        const cy = ((seed * 41) % (MAP_ROWS * TILE));
        const rise = (globalTime * 30 + seed * 20) % (MAP_ROWS * TILE);
        const py2 = cy - (rise % (MAP_ROWS * TILE));
        if (py2 < 0) continue;
        const alpha = (1 - rise/(MAP_ROWS*TILE)) * 0.8;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i % 2 === 0 ? '#ff6600' : '#ffcc00';
        ctx.beginPath();
        ctx.arc(cx % (MAP_COLS*TILE), py2, 1.5, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      // Volcano cone in background (top-center, decorative)
      const vx = 10*TILE, vy = 0;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#3a1a00';
      ctx.beginPath();
      ctx.moveTo(vx - 120, vy + 80);
      ctx.lineTo(vx, vy - 30);
      ctx.lineTo(vx + 120, vy + 80);
      ctx.closePath(); ctx.fill();
      // Lava glow at tip
      const glowPulse = 0.4 + Math.sin(globalTime * 2) * 0.2;
      ctx.globalAlpha = glowPulse * 0.3;
      ctx.fillStyle = '#ff4400';
      ctx.beginPath(); ctx.arc(vx, vy - 20, 20, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  },

  // ── NOVO MAPA (atualização): Deserto — dificuldade Média, entre Floresta e ──
  // Vulcão tanto no espaço livre pra construir quanto no comprimento do caminho.
  deserto: {
    name: 'Deserto',
    desc: 'Dunas intermináveis sob um sol implacável. Espaço pra construir mediano — nem sobra como na Floresta, nem falta como no Vulcão. Um oásis no meio do mapa bloqueia duas casas.',
    waypoints: [
      [0,7],[3,7],[3,3],[7,3],[7,10],[10,10],
      [10,2],[14,2],[14,9],[17,9],[17,4],[20,4]
    ],
    // Pequeno oásis decorativo — usa o sistema de água já existente no jogo
    // (reservado "pra futuras torres aquáticas") como um obstáculo de verdade
    // pela primeira vez: bloqueia 2 tiles de construção perto do centro do mapa.
    waterTiles: [[4,8],[5,8]],
    colors: {
      grassA: '#c9a56b', grassB: '#b8935a',
      pathA:  '#8f6a3d', pathB:  '#7d5a32',
      grid: 'rgba(80,45,10,0.10)',
      accent: '#e8b23d',
    },
    drawExtras(ctx) {
      // Sol no canto superior direito, com brilho pulsante suave
      const sx = MAP_COLS*TILE - 70, sy = 55;
      ctx.save();
      const pulse = 0.22 + Math.sin(globalTime*0.8)*0.05;
      const grad = ctx.createRadialGradient(sx, sy, 4, sx, sy, 90);
      grad.addColorStop(0, `rgba(255,220,120,${pulse+0.35})`);
      grad.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(sx, sy, 90, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = '#ffdd77';
      ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Dunas: faixas onduladas mais claras, só textura, não bloqueiam nada
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.strokeStyle = '#fff3d6';
      ctx.lineWidth = 6;
      for (let i=0;i<4;i++){
        const dy = 40 + i*95 + Math.sin(globalTime*0.3+i)*3;
        ctx.beginPath();
        ctx.moveTo(0, dy);
        for (let x=0;x<=MAP_COLS*TILE;x+=40) ctx.lineTo(x, dy + Math.sin(x*0.02+i*1.3)*10);
        ctx.stroke();
      }
      ctx.restore();

      // Cactos espalhados (decorativos, fora do caminho)
      const cacti = [[1,1],[6,1],[9,4],[13,6],[16,1],[19,2],[2,10],[9,12],[12,10],[16,12],[19,10],[1,12]];
      cacti.forEach(([c,r]) => {
        if (PATH_SET.has(`${c},${r}`)) return;
        const x = c*TILE+TILE/2, y = r*TILE+TILE/2;
        const sway = Math.sin(globalTime*0.9 + c*0.8) * 1.2;
        ctx.save();
        ctx.translate(x, y+6);
        ctx.fillStyle = '#3f7d4a';
        // corpo central
        ctx.beginPath(); ctx.roundRect(-4, -16, 8, 20, 4); ctx.fill();
        // braços
        ctx.save(); ctx.translate(-4,-6); ctx.rotate((-0.5+sway*0.02));
        ctx.beginPath(); ctx.roundRect(-9,-4,7,12,3); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(4,-10); ctx.rotate((0.5+sway*0.02));
        ctx.beginPath(); ctx.roundRect(2,-4,7,12,3); ctx.fill(); ctx.restore();
        // espinhos (só textura)
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        for (let i=0;i<4;i++) ctx.fillRect(-3, -14+i*5, 1.5, 1.5);
        ctx.restore();
      });

      // Palmeira ao lado do oásis
      const px_ = 4.5*TILE, py_ = 7.4*TILE;
      const leafSway = Math.sin(globalTime*1.1)*0.08;
      ctx.save();
      ctx.fillStyle = '#7a5a30';
      ctx.fillRect(px_-2, py_-6, 4, 22);
      ctx.fillStyle = '#2f8f4f';
      for (let i=0;i<5;i++){
        const a = (-Math.PI/2) + (i-2)*0.5 + leafSway;
        ctx.save();
        ctx.translate(px_, py_-6);
        ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(14,0,14,4,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
  }
};

// Builds a Set of "col,row" strings for every tile the path occupies,
// based on the waypoints (interpolating straight segments between them).
function buildPathSet(waypoints) {
  const set = new Set();
  for (let i = 0; i < waypoints.length; i++) {
    const [c, r] = waypoints[i];
    set.add(`${c},${r}`);
    if (i < waypoints.length - 1) {
      const [c2, r2] = waypoints[i + 1];
      const steps = Math.max(Math.abs(c2 - c), Math.abs(r2 - r));
      for (let s = 1; s <= steps; s++) {
        const ic = Math.round(c + (c2 - c) * (s / steps));
        const ir = Math.round(r + (r2 - r) * (s / steps));
        set.add(`${ic},${ir}`);
      }
    }
  }
  return set;
}

// Active map state — set before game starts
let selectedMapId = 'floresta';
let activeMap = MAPS.floresta;
// These are re-derived when map changes:
let PATH_WAYPOINTS = activeMap.waypoints;
let PATH_SET = buildPathSet(PATH_WAYPOINTS);
let PATH_PX  = PATH_WAYPOINTS.map(([c,r]) => ({x:c*TILE+TILE/2, y:r*TILE+TILE/2}));
// Water tiles — reserved terrain for future aquatic towers/units.
// Land towers cannot be built here. Empty Set on maps with no water defined.
let WATER_SET = new Set((activeMap.waterTiles||[]).map(([c,r]) => `${c},${r}`));

function selectMap(btn, mapId) {
  document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMapId = mapId;
  const desc = document.getElementById('map-desc');
  if (desc && MAPS[mapId]) desc.textContent = MAPS[mapId].desc;
}

function applyMap(mapId) {
  activeMap      = MAPS[mapId] || MAPS.floresta;
  PATH_WAYPOINTS = activeMap.waypoints;
  PATH_SET       = buildPathSet(PATH_WAYPOINTS);
  PATH_PX        = PATH_WAYPOINTS.map(([c,r]) => ({x:c*TILE+TILE/2, y:r*TILE+TILE/2}));
  WATER_SET      = new Set((activeMap.waterTiles||[]).map(([c,r]) => `${c},${r}`));
}



// ===========================
//   TOWER DEFINITIONS
// ===========================
const TOWER_BASE = {
  archer: {
    name:'Arqueiro', cost:50,
    color:'#4ecb71', glow:'#2e8b47',
    projectileColor:'#a8ff80', projectileSpeed:290, projectileSize:5,
    icon:'🏹',
    upgrades:[
      { label:'Base',        dmg:12,  range:115, rate:1.15,splash:0,  upgCost:0   },
      { label:'Prata',       dmg:22,  range:128, rate:1.45,splash:0,  upgCost:90  },
      { label:'Mestre',      dmg:40,  range:145, rate:1.7, splash:16, upgCost:180 },
    ]
  },
  barricada: {
    name:'Barricada', cost:75,
    color:'#8a9aa8', glow:'#4a5a68',
    projectileColor:'#cdd8e0', projectileSpeed:230, projectileSize:7,
    icon:'🛡️',
    desc:'Defensora de linha de frente: dano baixo, mas atinge todo grupo ao seu redor. Ideal para as primeiras ondas, quando o ouro é curto e os inimigos vêm em bando.',
    upgrades:[
      { label:'Madeira',  dmg:9,  range:90,  rate:1.1, splash:48, upgCost:0  },
      { label:'Ferro',    dmg:14, range:100, rate:1.3, splash:58, upgCost:60 },
      { label:'Aço Cravado', dmg:20, range:110, rate:1.5, splash:68, upgCost:120 },
    ]
  },
  mage: {
    name:'Mago', cost:100,
    color:'#9b59b6', glow:'#6c3483',
    projectileColor:'#d9a7f5', projectileSpeed:200, projectileSize:10,
    icon:'🔮',
    upgrades:[
      { label:'Aprendiz',    dmg:25,  range:100, rate:0.7, splash:55,  upgCost:0   },
      { label:'Feiticeiro',  dmg:50,  range:115, rate:0.9, splash:75,  upgCost:130 },
      { label:'Arquimago',   dmg:100, range:130, rate:1.1, splash:100, upgCost:260 },
    ]
  },
  sniper: {
    name:'Atirador', cost:150,
    color:'#5b8dee', glow:'#2c5faa',
    projectileColor:'#aad4ff', projectileSpeed:500, projectileSize:6,
    icon:'🎯',
    upgrades:[
      { label:'Recruta',     dmg:60,  range:210, rate:0.4, splash:0,  upgCost:0   },
      { label:'Elite',       dmg:110, range:250, rate:0.55,splash:0,  upgCost:180 },
      { label:'Francatirador',dmg:200,range:300, rate:0.7, splash:0,  upgCost:360 },
    ]
  },
  gladiator: {
    name:'Gladiador', cost:200,
    color:'#e8a020', glow:'#a06010',
    projectileColor:'#ffdd80', projectileSpeed:0, projectileSize:0,
    icon:'⚔️',
    upgrades:[
      { label:'Soldado',     dmg:52,  range:75,  rate:0.5,  splash:68,  upgCost:0   },
      { label:'Veterano',    dmg:95,  range:85,  rate:0.6,  splash:82,  upgCost:210 },
      { label:'Campeão',     dmg:175, range:100, rate:0.75, splash:98,  upgCost:420 },
    ]
  },
  farmer: {
    name:'Fazendeiro', cost:125,
    color:'#f5c518', glow:'#b8860b',
    projectileColor:'#ffe066', projectileSpeed:0, projectileSize:0,
    icon:'👨‍🌾', isFarmer:true,
    desc:'Gera ouro passivamente a cada wave. ⚠️ Limite: 8 no mapa.',
    mapLimit: 8,
    upgrades:[
      { label:'Lavrador',  dmg:0, range:0, rate:0, splash:0, upgCost:0,   income:15 },
      { label:'Agricultor',dmg:0, range:0, rate:0, splash:0, upgCost:150, income:30 },
      { label:'Fazendão',  dmg:0, range:0, rate:0, splash:0, upgCost:300, income:55 },
    ]
  }
};

function getTowerStats(tower) {
  const base = getAllTowerBase()[tower.type];
  if (!base) return { dmg:0, range:0, rate:1, splash:0, color:'#fff', glow:'#fff', icon:'?' };
  const upg = base.upgrades[tower.level - 1] || base.upgrades[0];
  return { ...base, ...upg };
}
// ===========================
const SHOP_TOWERS = {
  tesla: {
    name:'Tesla', cost:180, gemCost:3,
    color:'#00ccff', glow:'#0077aa',
    projectileColor:'#88eeff', projectileSpeed:999, projectileSize:7,
    icon:'⚡', desc:'Ataque elétrico em cadeia que salta entre inimigos próximos. Mais upgrades = mais saltos e mais alcance de salto.',
    isChain:true,
    upgrades:[
      // REBALANCEAMENTO: chainCount/chainRange eram fixos — a Tesla nível 3 "Relâmpago"
      // saltava a mesma quantidade de vezes que a nível 1 "Bobina". Agora escala junto.
      { label:'Bobina',     dmg:35,  range:130, rate:0.9, splash:0, upgCost:0,   chainRange:55, chainCount:2 },
      { label:'Supercarregada', dmg:65, range:150, rate:1.2, splash:0, upgCost:200, chainRange:65, chainCount:3 },
      { label:'Relâmpago',  dmg:120, range:170, rate:1.5, splash:0, upgCost:400, chainRange:85, chainCount:4 },
    ]
  },
  cannon: {
    name:'Canhão', cost:220, gemCost:4,
    color:'#cc6633', glow:'#883300',
    projectileColor:'#ff9966', projectileSpeed:240, projectileSize:12,
    icon:'💣', desc:'Dispara bolas explosivas com splash enorme e knockback.',
    isKnockback:true,
    upgrades:[
      { label:'Bronze',    dmg:80,  range:140, rate:0.5, splash:80,  upgCost:0   },
      { label:'Ferro',     dmg:150, range:155, rate:0.6, splash:100, upgCost:250 },
      { label:'Aço',       dmg:280, range:170, rate:0.75,splash:130, upgCost:500 },
    ]
  },
  ice: {
    name:'Gelo', cost:140, gemCost:3,
    color:'#88ddff', glow:'#3399cc',
    projectileColor:'#ccf0ff', projectileSpeed:260, projectileSize:8,
    icon:'❄️', desc:'Congela inimigos ao acertar, reduzindo a velocidade deles por um tempo. O congelamento fica mais forte e mais longo a cada upgrade.',
    isFreeze:true,
    upgrades:[
      // REBALANCEAMENTO: freezeDuration/freezeStrength eram fixos pra torre inteira —
      // upar o Gelo só aumentava dmg/range/rate, o efeito de controle (o motivo de
      // existir a torre) nunca melhorava. Agora escala por nível também.
      { label:'Gelo',      dmg:15,  range:115, rate:0.9, splash:0,  upgCost:0,   freezeDuration:1.6, freezeStrength:0.35 },
      { label:'Permafrost',dmg:28,  range:130, rate:1.1, splash:50, upgCost:160, freezeDuration:2.1, freezeStrength:0.48 },
      { label:'Blizzard',  dmg:50,  range:145, rate:1.3, splash:80, upgCost:320, freezeDuration:2.7, freezeStrength:0.60 },
    ]
  },
  poison: {
    name:'Veneno', cost:160, gemCost:3,
    color:'#66cc44', glow:'#338822',
    projectileColor:'#aaffaa', projectileSpeed:220, projectileSize:9,
    icon:'☠️', desc:'Aplica veneno que causa dano contínuo. A potência e a duração do veneno aumentam a cada upgrade.',
    isPoison:true,
    upgrades:[
      // REBALANCEAMENTO: mesmo problema do Gelo — poisonDps/poisonDuration eram fixos,
      // então "Pestilência" (nível máximo) envenenava exatamente igual a "Toxina" (nível 1).
      { label:'Toxina',    dmg:12,  range:120, rate:1.0, splash:0,  upgCost:0,   poisonDps:14, poisonDuration:3.5 },
      { label:'Ácido',     dmg:22,  range:135, rate:1.2, splash:40, upgCost:180, poisonDps:24, poisonDuration:4.0 },
      { label:'Pestilência',dmg:40, range:150, rate:1.4, splash:70, upgCost:360, poisonDps:38, poisonDuration:5.0 },
    ]
  },
  laser: {
    name:'Laser', cost:300, gemCost:6,
    color:'#ff3366', glow:'#aa0033',
    projectileColor:'#ff88aa', projectileSpeed:999, projectileSize:4,
    icon:'🔴', desc:'Raio contínuo de altíssimo dano. Não tem recarga.',
    isBeam:true,
    upgrades:[
      { label:'Protótipo', dmg:8,   range:180, rate:8.0, splash:0, upgCost:0   },
      { label:'Militar',   dmg:15,  range:210, rate:10.0,splash:0, upgCost:350 },
      { label:'Devastador',dmg:28,  range:240, rate:12.0,splash:0, upgCost:700 },
    ]
  },
  mortar: {
    name:'Morteiro', cost:250, gemCost:5,
    color:'#aa8844', glow:'#664400',
    projectileColor:'#ffcc66', projectileSpeed:180, projectileSize:14,
    icon:'🪖', desc:'Bombardeio de longo alcance. Mira o inimigo mais avançado e prevê sua posição. Enorme área de dano.',
    isMortar:true,
    upgrades:[
      { label:'Campo',      dmg:100, range:480, rate:0.35,splash:100, upgCost:0   },
      { label:'Pesado',     dmg:200, range:540, rate:0.45,splash:130, upgCost:300 },
      { label:'Estratégico',dmg:380, range:620, rate:0.55,splash:160, upgCost:600 },
    ]
  },
  // ─── ARPÃO (perfurante) ─────────────────────────────────────────
  perfurador: {
    name:'Arpão', cost:210, gemCost:4,
    color:'#3fd0c9', glow:'#1f8b85',
    projectileColor:'#bdfff9', projectileSpeed:620, projectileSize:5,
    icon:'🔱', isNew:true,
    desc:'Dispara um arpão que atravessa e atinge TODOS os inimigos numa linha reta — não é área, é uma linha. Excelente em corredores lotados. Mais upgrades = perfura mais alvos.',
    isPierce:true,
    upgrades:[
      { label:'Farpa',    dmg:34, range:190, rate:0.85, splash:0, upgCost:0,   pierceCount:2 },
      { label:'Tridente', dmg:58, range:220, rate:1.0,  splash:0, upgCost:220, pierceCount:3 },
      { label:'Leviatã',  dmg:95, range:250, rate:1.15, splash:0, upgCost:440, pierceCount:5 },
    ]
  },
  // ─── CORROSIVO (anti-armadura) ──────────────────────────────────
  corrosivo: {
    name:'Corrosivo', cost:170, gemCost:3,
    color:'#c7e04d', glow:'#7a8a1f',
    projectileColor:'#e6ff99', projectileSpeed:250, projectileSize:8,
    icon:'🧪', isNew:true,
    desc:'Corrói a defesa do alvo, deixando-o Vulnerável: recebe mais dano de QUALQUER torre por um tempo. É a resposta direta a inimigos e chefes blindados (Cavaleiro Sombrio, Dragão de Ferro).',
    isVuln:true,
    upgrades:[
      { label:'Ácido Fraco', dmg:10, range:110, rate:0.9, splash:35, upgCost:0,   vulnMult:1.20, vulnDuration:3.0 },
      { label:'Corrosão',    dmg:18, range:125, rate:1.1, splash:50, upgCost:190, vulnMult:1.35, vulnDuration:3.5 },
      { label:'Dissolução',  dmg:30, range:140, rate:1.3, splash:65, upgCost:380, vulnMult:1.55, vulnDuration:4.0 },
    ]
  },
  // ─── PRISMA (multi-alvo) ─────────────────────────────────────────
  prisma: {
    name:'Prisma', cost:230, gemCost:4,
    color:'#6ea8ff', glow:'#2a52a0',
    projectileColor:'#c9e2ff', projectileSpeed:340, projectileSize:6,
    icon:'🔷', isNew:true,
    desc:'Refrata sua energia em vários feixes, atacando múltiplos inimigos DIFERENTES ao mesmo tempo, em vez de uma única área. Ótimo contra grupos espalhados; fraco contra um único alvo forte.',
    isMultiShot:true,
    upgrades:[
      { label:'Facetado',      dmg:26, range:130, rate:0.8,  splash:0, upgCost:0,   multiShotCount:2 },
      { label:'Refrator',      dmg:42, range:145, rate:0.95, splash:0, upgCost:240, multiShotCount:3 },
      { label:'Caleidoscópio', dmg:65, range:160, rate:1.1,  splash:0, upgCost:480, multiShotCount:4 },
    ]
  },
  // ─── INVESTIDOR ─────────────────────────────────────────────────
  investidor: {
    name:'Investidor', cost:1800, gemCost:6,
    color:'#22aa44', glow:'#44ff88',
    projectileColor:'#44ff88', projectileSpeed:0, projectileSize:0,
    icon:'💼',
    desc:'Buffa todas as Fazendas do mapa, multiplicando a renda delas. Quanto maior o nível, maior o multiplicador. ⚠️ Limite: 1 no mapa.',
    isInvestidor: true,
    mapLimit: 1,
    upgrades:[
      { label:'Analista',   dmg:0, range:0, rate:0, splash:0, upgCost:0,    multiplier:1.5 },
      { label:'Gerente',    dmg:0, range:0, rate:0, splash:0, upgCost:800,  multiplier:2.0 },
      { label:'Diretor',    dmg:0, range:0, rate:0, splash:0, upgCost:1600, multiplier:2.5 },
      { label:'CEO',        dmg:0, range:0, rate:0, splash:0, upgCost:2500, multiplier:3.0 },
    ]
  },

  // ─── FAZENDEIRO HYPE (caixa-surpresa) ───────────────────────────
  hypefarmer: {
    name:'Fazendeiro Hype', cost:600, gemCost:5,
    color:'#ff66cc', glow:'#cc2299',
    projectileColor:'#ff99dd', projectileSpeed:0, projectileSize:0,
    icon:'🎉', isFarmer:true,
    desc:'Renda menor que o Fazendeiro comum, mas a cada onda tem chance de jogar uma caixa-surpresa: ouro bônus, uma gema grátis, ou um Hype raro que acelera TODAS as torres do mapa por alguns segundos. ⚠️ Limite: 4 no mapa.',
    mapLimit: 4,
    upgrades:[
      { label:'Animador',    dmg:0, range:0, rate:0, splash:0, income:10, upgCost:0,   boxChance:0.30, boxGoldMin:20,  boxGoldMax:60,  hypeBuffDuration:6  },
      { label:'Hypeman',     dmg:0, range:0, rate:0, splash:0, income:18, upgCost:350, boxChance:0.40, boxGoldMin:40,  boxGoldMax:110, hypeBuffDuration:8  },
      { label:'Estrela Pop', dmg:0, range:0, rate:0, splash:0, income:28, upgCost:700, boxChance:0.50, boxGoldMin:70,  boxGoldMax:180, hypeBuffDuration:10 },
    ]
  },

  // ─── ARCTURUS ───────────────────────────────────────────────────
  // REWORK (atualização): agora é a torre mais rara e mais forte do jogo,
  // travada atrás de um custo altíssimo em ouro/gemas E de o jogador já ter
  // alcançado a wave 40 em alguma partida anterior (requiresWave — ver
  // openShopModal/buyTower). Em troca, ganhou um kit de combate muito mais
  // forte e um ciclo de sobrecarga que agora ESCALA por nível
  // (overChargeThreshold/stabilizeDuration eram fixos em 30 tiros / 60s
  // pra qualquer nível — ver fireArcturusTower).
  //
  // Justificativa de ratio (dps "equivalente" = dano de tiro + burn do
  // ciclo base+sobrecarga, com a Nova Solar somada; fragmentos de fora):
  //   ANTES: ~331 dps-equiv ÷ 14700 ouro total (4000+1200+2000+3000+4500)
  //          = 0.0225 dps por ouro investido, por 8 gemas
  //   AGORA: ~932 dps-equiv ÷ 38500 ouro total (12000+3000+5000+7500+11000)
  //          = 0.0242 dps por ouro investido, por 35 gemas
  // ou seja: poder de combate ~2.8x maior, custo em ouro ~2.6x maior, custo
  // em gemas ~4.4x maior — a eficiência ouro→dano ainda melhora (não piora)
  // apesar do preço muito mais alto, e o verdadeiro gargalo de raridade
  // fica nas gemas (35 é, de longe, o maior custo do jogo) + na wave 40.
  // Contra o chefe mais forte do modo infinito (Hollow Voidwalker, 50000hp),
  // isso dá ~54s de solo-kill no nível máximo — forte, mas não instantâneo.
  arcturus: {
    name:'Arcturus', cost:12000, gemCost:35,
    color:'#ff8800', glow:'#ffaa00',
    projectileColor:'#ffcc44', projectileSpeed:300, projectileSize:15,
    icon:'☀️', isMythic:true, requiresWave:40,
    desc:'Entidade solar quase impossível de conter — a torre mais rara do jogo. 3 formas de ataque: tiros incendiários (entram em SOBRECARGA cada vez mais rápido a cada upgrade), Fragmentos Solares que ela invoca para lutar corpo a corpo, e uma Nova Solar devastadora e cada vez mais frequente. 🔒 Só pode ser comprada por quem já alcançou a wave 40. Limite: 1 no mapa.',
    isArcturus: true,
    mapLimit: 1,
    upgrades:[
      // nivel 1 — Ignição
      { label:'Ignição',          dmg:170, range:160, rate:1/2.0, splash:120, upgCost:0,
        burnDps:24,  burnDur:3.0,
        overDmg:300,  overSplash:115, overRate:1/3.0, overBurnDps:90,  overBurnDur:3.5, overDur:6.0,
        summonInterval:12, summonCount:1, summonHp:85,  summonDmg:20,  summonLifespan:14,
        novaCooldown:40, novaDmg:520,  novaRadius:185,
        overChargeThreshold:30, stabilizeDuration:55 },
      // nivel 2 — Ardente
      { label:'Ardente',          dmg:230, range:175, rate:1/1.8, splash:155, upgCost:3000,
        burnDps:48,  burnDur:3.5,
        overDmg:600,  overSplash:150, overRate:1/2.7, overBurnDps:180, overBurnDur:4.0, overDur:6.5,
        summonInterval:11, summonCount:1, summonHp:125, summonDmg:35,  summonLifespan:15,
        novaCooldown:37, novaDmg:840,  novaRadius:205,
        overChargeThreshold:27, stabilizeDuration:47 },
      // nivel 3 — Explosivo
      { label:'Explosivo',        dmg:310, range:195, rate:1/1.6, splash:200, upgCost:5000,
        burnDps:72,  burnDur:4.0,
        overDmg:920,  overSplash:190, overRate:1/2.5, overBurnDps:300, overBurnDur:4.5, overDur:7.0,
        summonInterval:10, summonCount:2, summonHp:180, summonDmg:50,  summonLifespan:16,
        novaCooldown:33, novaDmg:1300, novaRadius:230,
        overChargeThreshold:24, stabilizeDuration:40 },
      // nivel 4 — Colapso
      { label:'Colapso',          dmg:400, range:210, rate:1/1.4, splash:245, upgCost:7500,
        burnDps:110, burnDur:4.5,
        overDmg:1300, overSplash:235, overRate:1/2.3, overBurnDps:460, overBurnDur:5.5, overDur:8.0,
        summonInterval:9,  summonCount:2, summonHp:250, summonDmg:70,  summonLifespan:17,
        novaCooldown:29, novaDmg:1900, novaRadius:255,
        overChargeThreshold:20, stabilizeDuration:30 },
      // nivel 5 — ESTRELA ABSOLUTA
      { label:'Estrela Absoluta', dmg:540, range:230, rate:1/1.2, splash:295, upgCost:11000,
        burnDps:160, burnDur:5.0,
        overDmg:1800, overSplash:290, overRate:1/2.0, overBurnDps:720, overBurnDur:6.0, overDur:9.5,
        summonInterval:8,  summonCount:3, summonHp:365, summonDmg:100, summonLifespan:18,
        novaCooldown:24, novaDmg:3000, novaRadius:285,
        overChargeThreshold:16, stabilizeDuration:20 },
    ]
  },
};

// All tower types combined
function getAllTowerBase() {
  return { ...TOWER_BASE, ...SHOP_TOWERS, ...ADMIN_TOWERS };
}

// ===========================
//   ADMIN TOWERS (código secreto)
// ===========================
const ADMIN_TOWERS = {
  gojo: {
    name:'Satoru Gojo', cost:500,
    color:'#7b2fff', glow:'#ff00ff',
    projectileColor:'#cc88ff', projectileSpeed:350, projectileSize:10,
    icon:'♾️', isAdmin: true,
    desc:'O mais forte. 3 técnicas: Infinidade (área), Vazio Azul (projétil) e Expansão Máxima (apocalipse).',
    // REBALANCEAMENTO: Gojo tinha a MENOR cadência das 3 torres admin (rate 0.35
    // no nível 3 — mais lento que quase tudo no jogo) e por isso o menor ratio
    // dps/ouro das secretas (~0.091, abaixo até de torres normais de loja),
    // apesar do texto dizer "o mais forte". Cadência subiu em todos os níveis
    // (mais forte no nível 3, que era o pior caso) pra alinhar o número com a
    // fama do personagem: dps L3 vai de 210 pra 300 (ratio ~0.130).
    upgrades:[
      { label:'Infinidade',      dmg:80,  range:110, rate:1.2, splash:80,  upgCost:0,    technique:'infinity'  },
      { label:'Vazio Azul',      dmg:180, range:200, rate:0.85,splash:50,  upgCost:600,  technique:'blue'      },
      { label:'Expansão Máxima', dmg:600, range:260, rate:0.5, splash:200, upgCost:1200, technique:'purple'    },
    ]
  },

  // ─── UMBRA (novo código secreto) ─────────────────────────────────
  // Contraponto sombrio do Arcturus: em vez de dano puro, é uma torre de
  // controle — combina duas mecânicas genéricas que nenhuma outra torre
  // combina hoje (isFreeze + isVuln no mesmo tiro), então não precisou de
  // nenhum código de resolução novo, só reusa applyFreeze/applyVulnerable
  // que já existem no caminho genérico de dano em área.
  //
  // REBALANCEAMENTO (nerf gigante): no nível 3 a Umbra ULTRAPASSAVA as duas
  // torres dedicadas nos próprios jogos delas — congelamento 62%/3.0s vs
  // 60%/2.7s do Gelo, vulnerabilidade +65%/4.5s vs +55%/4.0s do Corrosivo —
  // E ainda tinha mais dps (149.5) que Gelo+Corrosivo somados (104), em 1
  // espaço no mapa em vez de 2, sem gastar gema nenhuma (Gelo+Corrosivo
  // juntos custam 6 gemas). Ou seja: fazia os 2 trabalhos melhor que os
  // especialistas, de graça. Agora os efeitos de controle ficam ABAIXO do
  // teto de cada especialista em todo nível, e o dano direto cai bem abaixo
  // da soma dos dois (dps L3: 149.5 → 71.5, ratio dps/ouro: 0.101 → 0.048).
  // Limite de 1 no mapa pra cada Gelo/Corrosivo não existe, mas a Umbra
  // ganhou mapLimit:2 mesmo assim — ela ainda economiza espaço+gema, então
  // sem limite dava pra cobrir o mapa inteiro com o combo de controle mais
  // forte do jogo.
  umbra: {
    name:'Umbra', cost:650,
    color:'#7a3fd6', glow:'#160828',
    projectileColor:'#c9a2ff', projectileSpeed:260, projectileSize:9,
    icon:'🌑', isAdmin: true, secretCode: 'ONDE_A_LUZ_MORRE',
    desc:'Entidade do vazio que se alimenta de luz. Cada disparo CONGELA e CORRÓI a defesa dos inimigos ao mesmo tempo — controle de grupo em estado puro. ⚠️ Limite: 2 no mapa.',
    isFreeze: true, isVuln: true,
    mapLimit: 2,
    upgrades:[
      { label:'Sombra Nascente',  dmg:22,  range:130, rate:0.8,  splash:55, upgCost:0,
        freezeDuration:1.5, freezeStrength:0.28, vulnMult:1.15, vulnDuration:2.5 },
      { label:'Penumbra Devoradora', dmg:40, range:145, rate:0.95, splash:65, upgCost:280,
        freezeDuration:1.9, freezeStrength:0.38, vulnMult:1.28, vulnDuration:3.0 },
      { label:'Colapso Umbrio',   dmg:65,  range:160, rate:1.1,  splash:75, upgCost:550,
        freezeDuration:2.4, freezeStrength:0.50, vulnMult:1.42, vulnDuration:3.5 },
    ]
  },

  // ─── NÊMESIS (novo código secreto) ───────────────────────────────
  // Ofensiva pura: combina isChain (salta entre alvos, como a Tesla) com
  // isPoison (dano contínuo, como a Veneno) — de novo, 100% mecânicas
  // genéricas já resolvidas em moveProjectiles, só uma combinação nova.
  //
  // REBALANCEAMENTO (nerf gigante): no nível 3 a Nêmesis saltava pra
  // chainCount:5 (a Tesla, dona da mecânica, para em 4) E aplicava
  // poisonDps:42 (o Veneno, dono da mecânica, para em 38) — em CADA um dos
  // alvos da cadeia ao mesmo tempo, então o veneno sozinho já passava do
  // teto do especialista multiplicado por até 5. dps efetivo (cadeia com
  // queda 0.6/0.7 por salto, igual a doChainLightning, + veneno em regime
  // permanente) ÷ ouro total: 0.382 antes → 0.301 depois. Agora chainCount
  // combina com a Tesla em vez de superar (2/3/4, igual em cada nível) e
  // poisonDps fica sempre abaixo do Veneno (10/18/28 vs 14/24/38 dele).
  // Ganhou mapLimit:2 pelo mesmo motivo da Umbra: sem limite, 1 tile já
  // cobria a cadeia inteira do mapa com veneno em vários alvos de uma vez.
  nemesis: {
    name:'Nêmesis', cost:700,
    color:'#c81c4a', glow:'#3a000f',
    projectileColor:'#ff6fa8', projectileSpeed:380, projectileSize:8,
    icon:'🌠', isAdmin: true, secretCode: 'ESTRELA_CACADORA',
    desc:'A estrela que persegue. Disparos de energia cósmica saltam entre vários alvos em cadeia e deixam um rastro de decomposição estelar (veneno) em cada um que atingem. ⚠️ Limite: 2 no mapa.',
    isChain: true, isPoison: true,
    mapLimit: 2,
    upgrades:[
      { label:'Caçadora',            dmg:45,  range:140, rate:0.85, splash:0, upgCost:0,
        chainRange:60, chainCount:2, poisonDps:10, poisonDuration:2.5 },
      { label:'Perseguição Eterna',  dmg:78,  range:160, rate:1.05, splash:0, upgCost:320,
        chainRange:72, chainCount:3, poisonDps:18, poisonDuration:3.0 },
      { label:'Veredito Final',      dmg:130, range:185, rate:1.25, splash:0, upgCost:600,
        chainRange:85, chainCount:4, poisonDps:28, poisonDuration:3.5 },
    ]
  },
};


// ===========================
//   ENEMY DEFINITIONS
// ===========================
const ENEMY_DEFS = [
  { name:'Slime',     hp:60,   speed:55, reward:8,   color:'#6ddc6d', size:13, boss:false },
  { name:'Goblin',    hp:120,  speed:70, reward:14,  color:'#e8a020', size:14, boss:false },
  { name:'Orc',       hp:280,  speed:40, reward:25,  color:'#c05030', size:18, boss:false },
  { name:'Mago Mal',  hp:180,  speed:60, reward:20,  color:'#cc44ff', size:15, boss:false },
  { name:'Troll',     hp:600,  speed:30, reward:50,  color:'#4a7a4a', size:22, boss:false },
  { name:'Demônio',   hp:400,  speed:65, reward:40,  color:'#ff4444', size:17, boss:false },
  // ── NOVOS (atualização) ──────────────────────────────────────
  { name:'Morcego',          hp:45,  speed:100, reward:7,  color:'#8866cc', size:11, boss:false },
  // Cavaleiro Sombrio: armorPct reduz todo dano recebido (mesma lógica dos chefes blindados).
  // É o motivo de existir a torre Corrosivo — ela é a resposta direta a esse inimigo.
  { name:'Cavaleiro Sombrio',hp:520, speed:35,  reward:50, color:'#3f4c5e', size:19, boss:false, armorPct:0.25 },
];

const BOSS_DEFS = [
  { name:'Rei Troll', hp:4000, speed:22, reward:300, color:'#3a8a3a', size:34, boss:true, ability:'regen', abilityDesc:'Regenera HP', crown:'👑' },
  { name:'Necromante', hp:3000, speed:30, reward:350, color:'#8833aa', size:30, boss:true, ability:'shield', abilityDesc:'Escudo Mágico', crown:'💀' },
  { name:'Dragão de Ferro', hp:8000, speed:18, reward:500, color:'#888888', size:40, boss:true, ability:'armor', abilityDesc:'Armadura: -50% dmg', crown:'🐉' },
  // ── NOVO chefe regular (fecha a campanha estendida na wave 40) ──
  { name:'Fera Sanguinária', hp:9000, speed:26, reward:650, color:'#992222', size:32, boss:true, ability:'enrage', abilityDesc:'Enfurece abaixo de 50% HP: +60% velocidade', crown:'🩸' },
];

// Novos bosses — aparecem no modo infinito a cada 10 waves após a 30
const INFINITE_BOSS_DEFS = [
  {
    name:'Ryomen Sukuna', hp:18000, speed:28, reward:1200, color:'#cc1111', size:44, boss:true,
    ability:'sukuna', abilityDesc:'Domínio: dano pula para torrres próximas',
    crown:'🔥', lore:'O rei das maldições. Cada golpe destrói o mundo ao redor.',
  },
  {
    name:'Mahito', hp:12000, speed:38, reward:900, color:'#6699ff', size:36, boss:true,
    ability:'mahito', abilityDesc:'Transfiguração: clona a si mesmo ao ser atingido',
    crown:'🫀', lore:'A encarnação do ódio humano. Se dividir não o mata.',
  },
  {
    name:'Yggdrasil, o Titã', hp:30000, speed:12, reward:1800, color:'#228833', size:52, boss:true,
    ability:'titan', abilityDesc:'Titã: reduz cooldown de ataque das torres em 60%',
    crown:'🌳', lore:'A árvore do mundo caminhou. Onde pisa, o tempo congela.',
  },
  {
    name:'Lich Eterno', hp:20000, speed:25, reward:1500, color:'#44ccee', size:42, boss:true,
    ability:'lich', abilityDesc:'Necromancia: revive inimigos mortos como fantasmas',
    crown:'🧊', lore:'Nunca morreu. Nunca vai morrer. Existe há tempo demais.',
  },
  {
    name:'Hollow Voidwalker', hp:50000, speed:20, reward:3000, color:'#ff00ff', size:50, boss:true,
    ability:'void', abilityDesc:'Vazio: torna-se temporariamente intangível (invulnerável)',
    crown:'♾️', lore:'Nasceu no espaço entre o azul e o vermelho. A técnica proibida personificada.',
  },
  // ── NOVO chefe infinito (atualização) ─────────────────────────
  {
    name:'Ceifador de Fortunas', hp:22000, speed:24, reward:1650, color:'#2f9e63', size:38, boss:true,
    ability:'drain', abilityDesc:'Sifão: rouba ouro do jogador periodicamente',
    crown:'💰', lore:'Não quer sua vida. Quer sua fortuna. E vai levar as duas se puder.',
  },
];

// ===========================
//   WAVE DEFINITIONS (40 waves — estendido na atualização, era 30)
// ===========================
function buildWaves() {
  const W = [];
  W.push([{t:0,count:8, interval:1.2}]);
  W.push([{t:0,count:10,interval:1.0},{t:1,count:4,interval:1.5}]);
  W.push([{t:1,count:10,interval:1.0},{t:2,count:3,interval:2.0}]);
  W.push([{t:0,count:15,interval:0.8},{t:2,count:5,interval:1.8}]);
  W.push([{t:3,count:8, interval:1.2},{t:2,count:4,interval:2.0}]);
  W.push([{t:1,count:12,interval:0.9},{t:3,count:6,interval:1.3},{t:4,count:2,interval:3.0}]);
  W.push([{t:4,count:4, interval:2.5},{t:3,count:10,interval:1.0}]);
  W.push([{t:0,count:20,interval:0.6},{t:4,count:3,interval:2.0},{t:3,count:8,interval:1.1}]);
  W.push([{t:4,count:6, interval:2.0},{t:5,count:4,interval:1.5}]);
  W.push([{boss:0,count:1,interval:0},{t:3,count:12,interval:1.0},{t:4,count:4,interval:2.0}]);
  W.push([{t:5,count:8, interval:1.0},{t:1,count:8,interval:1.0}]);
  W.push([{t:2,count:10,interval:1.2},{t:4,count:5,interval:2.0}]);
  W.push([{t:3,count:15,interval:0.8},{t:5,count:6,interval:1.2}]);
  W.push([{t:4,count:8, interval:1.5},{t:5,count:8,interval:1.5}]);
  W.push([{t:0,count:25,interval:0.5},{t:2,count:8,interval:1.5}]);
  W.push([{t:5,count:12,interval:1.0},{t:4,count:6,interval:1.8}]);
  W.push([{t:2,count:12,interval:1.0},{t:5,count:8,interval:1.3}]);
  W.push([{t:3,count:20,interval:0.7},{t:4,count:8,interval:1.2}]);
  W.push([{t:4,count:10,interval:1.5},{t:5,count:10,interval:1.2}]);
  W.push([{boss:1,count:1,interval:0},{t:5,count:10,interval:1.0},{t:4,count:8,interval:1.5}]);
  W.push([{t:5,count:15,interval:0.8},{t:4,count:10,interval:1.0}]);
  W.push([{t:2,count:15,interval:0.9},{t:5,count:12,interval:1.0}]);
  W.push([{t:3,count:20,interval:0.7},{t:5,count:15,interval:0.8}]);
  W.push([{t:4,count:15,interval:1.0},{t:5,count:15,interval:0.9}]);
  W.push([{t:5,count:20,interval:0.7},{t:4,count:12,interval:1.0}]);
  W.push([{t:0,count:30,interval:0.4},{t:5,count:15,interval:0.8},{t:4,count:10,interval:1.2}]);
  W.push([{t:5,count:20,interval:0.7},{t:4,count:15,interval:1.0}]);
  W.push([{t:5,count:25,interval:0.6},{t:4,count:12,interval:0.9}]);
  W.push([{t:5,count:20,interval:0.7},{t:4,count:20,interval:0.7}]);
  W.push([{boss:2,count:1,interval:0},{boss:0,count:1,interval:8},{boss:1,count:1,interval:8},{t:5,count:15,interval:0.8}]);
  // ── NOVO: Segundo Ato (waves 31-40) — introduz Morcego(6) e Cavaleiro Sombrio(7) ──
  W.push([{t:5,count:18,interval:0.7},{t:6,count:20,interval:0.4},{t:4,count:8,interval:1.3}]);                              // 31
  W.push([{t:7,count:8, interval:1.6},{t:3,count:18,interval:0.75},{t:5,count:12,interval:0.9}]);                            // 32
  W.push([{t:6,count:28,interval:0.32},{t:2,count:18,interval:0.75},{t:7,count:7,interval:1.8}]);                            // 33
  W.push([{t:4,count:15,interval:1.0},{t:7,count:8,interval:1.5},{t:5,count:15,interval:0.8}]);                              // 34
  W.push([{t:6,count:30,interval:0.28},{t:1,count:22,interval:0.45},{t:3,count:10,interval:1.0}]);                           // 35 (respiro no meio do 2º ato)
  W.push([{t:7,count:10,interval:1.4},{t:5,count:20,interval:0.7},{t:3,count:15,interval:0.8}]);                             // 36
  W.push([{t:2,count:20,interval:0.7},{t:4,count:15,interval:0.9},{t:7,count:10,interval:1.3}]);                             // 37
  W.push([{t:6,count:30,interval:0.3},{t:5,count:22,interval:0.6},{t:7,count:10,interval:1.2}]);                             // 38
  W.push([{t:4,count:16,interval:0.8},{t:5,count:20,interval:0.6},{t:7,count:12,interval:1.0},{t:6,count:16,interval:0.35}]);// 39 (empurrão final)
  W.push([{boss:3,count:1,interval:0},{boss:2,count:1,interval:10},{t:5,count:20,interval:0.6},{t:7,count:10,interval:1.2}]);// 40 — FINAL: Fera Sanguinária + Dragão de Ferro
  return W;
}
const WAVES = buildWaves();

// ===========================
//   PERSISTENCE (Save/Load)
// ===========================
const SAVE_KEY = 'blocktd_save';

function loadPersist() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { gems: 0, unlockedTowers: [] };
    return JSON.parse(raw);
  } catch(e) { return { gems: 0, unlockedTowers: [] }; }
}

function savePersist(data) {
  // Pequeno reforço: sem isso, um erro de storage (modo privado do navegador,
  // cota excedida, etc.) derrubava o jogo inteiro com uma exceção não tratada.
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
  catch(e) { console.warn('Não foi possível salvar o progresso:', e); }
}

function saveGame() {
  const persist = loadPersist();
  persist.lastRun = {
    wave: state.wave, score: state.score, gold: state.gold,
    lives: state.lives, goldSpent: state.goldSpent,
    towers: state.towers.map(t=>({ type:t.type, col:t.col, row:t.row, level:t.level })),
    savedAt: Date.now(),
  };
  persist.gems = (persist.gems || 0) + Math.floor(state.score / 200);
  savePersist(persist);
  showSaveToast();
  updateGemHUD();
}

function loadGame() {
  const persist = loadPersist();
  const run = persist.lastRun;
  if (!run) return false;
  state.wave = run.wave;
  state.score = run.score;
  state.gold = run.gold;
  state.lives = run.lives;
  state.goldSpent = run.goldSpent || 0;
  state.towers = run.towers.map(t => ({
    type: t.type, col: t.col, row: t.row, level: t.level,
    px: t.col*TILE+TILE/2, py: t.row*TILE+TILE/2,
    cd: 0, firing: 0, animTime: Math.random()*10,
  }));
  return true;
}

function showSaveToast() {
  const el = document.getElementById('save-toast');
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2200);
}

function updateGemHUD() {
  const persist = loadPersist();
  document.getElementById('hud-gems').textContent = persist.gems || 0;
  document.getElementById('shop-gem-count').textContent = persist.gems || 0;
}

// ===========================
//   SFX (procedural — sem arquivos de áudio externos)
// ===========================
// O jogo não tinha nenhum som. Em vez de exigir assets externos (que não temos
// como empacotar aqui), os efeitos são sintetizados na hora com osciladores da
// Web Audio API — leve, e funciona 100% offline. Tudo é best-effort: se o
// navegador bloquear áudio (autoplay policy) ou não suportar, falha em silêncio
// e o jogo continua normalmente.
let audioCtx = null;
let sfxEnabled = true;

function initAudio() {
  if (audioCtx) return audioCtx;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  catch(e) { audioCtx = null; }
  return audioCtx;
}

function playTone(freq, duration, type, volume, delay) {
  if (!sfxEnabled) return;
  const ac = initAudio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    const t0 = ac.currentTime + (delay||0);
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(volume!=null?volume:0.08, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + duration + 0.02);
  } catch(e) { /* falha em silêncio */ }
}

// Ruído filtrado (buffer aleatório + bandpass) — usado pros disparos que
// precisam de textura de "sopro/hiss/impacto" em vez de tom puro (veneno,
// corrosivo, canhão, morteiro, sniper). Mais caro que playTone, então só
// usado nos sons de disparo, que já são curtos e passam por throttle.
function playNoise(duration, volume, delay, freq, q) {
  if (!sfxEnabled) return;
  const ac = initAudio();
  if (!ac) return;
  try {
    const size = Math.max(1, Math.floor(ac.sampleRate * duration));
    const buffer = ac.createBuffer(1, size, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<size;i++) data[i] = Math.random()*2-1;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq||1200;
    filter.Q.value = q||1;
    const gain = ac.createGain();
    const t0 = ac.currentTime + (delay||0);
    gain.gain.setValueAtTime(volume!=null?volume:0.05, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    src.connect(filter); filter.connect(gain); gain.connect(ac.destination);
    src.start(t0); src.stop(t0 + duration + 0.02);
  } catch(e) { /* falha em silêncio */ }
}

// Sons ligados a eventos discretos do jogo (construir, upar, vender, navegar
// menus, abrir/fechar modais, comprar na loja, ligar/desligar toggles, negar
// uma ação, começar/vencer wave, alerta de chefe, vida perdida, chefe morto,
// conquista, fim de jogo). De propósito NÃO existe som de "disparo" ou
// "acerto" por projétil — com várias torres de cadência alta atirando ao
// mesmo tempo (ex.: Laser a 8-12 disparos/s) isso viraria uma poluição
// sonora em vez de feedback útil.
const SFX = {
  place()      { playTone(300, 0.06, 'square', 0.07); },
  sell()       { playTone(220, 0.08, 'sawtooth', 0.06); },
  upgrade()    { playTone(523,0.09,'sine',0.08); playTone(659,0.09,'sine',0.08,0.09); playTone(784,0.12,'sine',0.08,0.18); },
  waveStart()  { playTone(200,0.15,'sawtooth',0.08); playTone(260,0.15,'sawtooth',0.06,0.1); },
  bossAlert()  { playTone(110,0.30,'sawtooth',0.12); playTone(98, 0.35,'sawtooth',0.10,0.15); },
  bossDown()   { [660,880,1108].forEach((f,i)=>playTone(f,0.15,'sine',0.09,i*0.09)); },
  lifeLost()   { playTone(140,0.20,'square',0.10); },
  achievement(){ playTone(784,0.10,'sine',0.08); playTone(988,0.10,'sine',0.08,0.10); playTone(1318,0.16,'sine',0.09,0.20); },
  gold()       { playTone(880,0.08,'sine',0.06); playTone(1108,0.08,'sine',0.045,0.05); },
  victory()    { [523,659,784,1046].forEach((f,i)=>playTone(f,0.18,'sine',0.09,i*0.12)); },
  defeat()     { [392,349,311,262].forEach((f,i)=>playTone(f,0.25,'sine',0.09,i*0.15)); },
  // Toca uma única vez, no exato momento em que Arcturus é colocado no mapa
  // (não confundir com o flash recorrente de sobrecarga). Um rumor grave
  // seguido de um arpejo ascendente e brilhante — a chegada da "Estrela
  // Absoluta".
  arcturusArrival() {
    playTone(80, 0.9, 'sawtooth', 0.10);
    playTone(220, 0.5, 'sine', 0.06, 0.15);
    [392,523,659,784,988,1318].forEach((f,i)=>playTone(f,0.35,'sine',0.08,0.25+i*0.09));
  },

  // --- UI / navegação (novos) ---------------------------------------
  // Clique leve e neutro: navegar entre telas (menu, como jogar, voltar),
  // fechar resultado de partida. Bem curto pra não cansar em cliques
  // repetidos.
  uiClick()    { playTone(520, 0.035, 'square', 0.045); },
  // Selecionar uma torre no painel ou clicar numa torre já construída no
  // mapa — um "tick" um pouco mais alto que o uiClick pra diferenciar
  // seleção de navegação.
  select()     { playTone(660, 0.04, 'triangle', 0.05); },
  // Ação negada: sem ouro, tile ocupado, caminho/água, torre bloqueada,
  // limite de mapa, modo desafio. Um "buzz" curto e descendente, claramente
  // distinto dos outros — feedback de "não" sem ser irritante.
  deny()       { playTone(180, 0.09, 'square', 0.07); playTone(120, 0.10, 'square', 0.06, 0.05); },
  // Abrir modal (loja, upgrade, conquistas, admin): sobe. Fechar: desce.
  // Curtos o bastante pra não atrapalhar quem abre/fecha rápido.
  modalOpen()  { playTone(440, 0.05, 'sine', 0.05); playTone(660, 0.06, 'sine', 0.05, 0.04); },
  modalClose() { playTone(500, 0.05, 'sine', 0.045); playTone(340, 0.06, 'sine', 0.04, 0.04); },
  // Ligar/desligar um toggle (pausa, velocidade, auto-skip). Dois tons
  // curtos: um pra cada estado, pra dar noção auditiva de ON/OFF sem
  // precisar olhar o botão.
  toggleOn()   { playTone(700, 0.05, 'triangle', 0.05); playTone(950, 0.05, 'triangle', 0.045, 0.05); },
  toggleOff()  { playTone(500, 0.05, 'triangle', 0.045); },
  // Comprar torre na loja (gasta gemas) — mais "precioso" que colocar torre
  // em jogo, já que usa moeda premium.
  shopBuy()    { playTone(587,0.08,'sine',0.07); playTone(880,0.10,'sine',0.07,0.08); playTone(1174,0.14,'sine',0.08,0.16); },
  // Salvar partida: dois toques curtos e neutros, tipo "confirmado".
  save()       { playTone(600, 0.06, 'sine', 0.06); playTone(800, 0.07, 'sine', 0.05, 0.07); },
  // Código admin/secreto aceito vs. rejeitado — bem diferentes do
  // achievement/deny genéricos pra dar peso ao "easter egg".
  adminOk()    { [440,554,659,880,1108].forEach((f,i)=>playTone(f,0.14,'sine',0.08,i*0.07)); },
  adminFail()  { playTone(160,0.12,'sawtooth',0.08); playTone(110,0.18,'sawtooth',0.08,0.10); },
  // Fim de uma wave normal (ainda há mais pela frente) — mais curto e
  // "leve" que victory(), que é reservado pro fim de toda a campanha.
  waveClear()  { playTone(494,0.08,'sine',0.06); playTone(659,0.10,'sine',0.06,0.08); },
  // Ganhar uma gema (recompensa de wave ou caixa-surpresa) — um "chime"
  // cristalino, bem diferente do ouro (que é mais grave/metálico) pra dar
  // peso especial à moeda premium.
  gem()        { playTone(1046,0.09,'sine',0.055); playTone(1568,0.11,'sine',0.05,0.06); },
  // Buff raro de Hype (Fazendeiro Hype): todas as torres turbinadas por
  // alguns segundos — um "power-up" ascendente e animado, distinto de
  // qualquer outro som do jogo por ser o mais raro dos três resultados
  // da caixa-surpresa.
  hypeBuff()   { [440,554,659,880,1108,1318].forEach((f,i)=>playTone(f,0.10,'triangle',0.07,i*0.045)); },
  // Desbloqueio do Modo Infinito (bateu todas as waves da campanha) — o
  // marco mais raro do jogo fora da vitória em si. Fanfarra maior e mais
  // longa que waveClear/achievement, mas com timbre próprio (dente-de-serra
  // grave + arpejo largo) pra não ser confundida com victory().
  infiniteUnlock() {
    playTone(65, 0.5, 'sawtooth', 0.09);
    [392,523,659,784,988,1318,1568].forEach((f,i)=>playTone(f,0.22,'sine',0.08,0.1+i*0.08));
  },
};

// ===========================
//   SFX DE DISPARO (um timbre por torre)
// ===========================
// Cada torre de combate tem seu próprio "assinatura sonora" de tiro — bem
// curta e baixa (volumes na casa de 0.02-0.045) porque, ao contrário dos
// SFX de evento acima, estas tocam POTENCIALMENTE várias vezes por
// segundo. O throttle em playShotSfx() (por TIPO de torre, não por torre
// individual) é o que evita a "poluição sonora" que o comentário original
// deste arquivo citava como motivo pra nunca ter som de tiro: mesmo que o
// jogador encha o mapa de 10 Lasers atirando 10-12x/s cada, o som daquele
// tipo tem um intervalo mínimo entre reproduções — então ele ainda ouve
// "um Laser tocando", não uma metralhadora de cliques sobrepostos.
const SHOT_SFX = {
  // Flecha: "twang" curto de corda, dois harmônicos rápidos.
  archer()      { playTone(900,0.03,'triangle',0.04); playTone(520,0.035,'triangle',0.025,0.018); },
  // Barricada: baque de escudo — tom grave + estalo de impacto.
  barricada()   { playTone(150,0.05,'square',0.05); playNoise(0.035,0.03,0,650,2); },
  // Mago: whoosh arcano ascendente.
  mage()        { playTone(560,0.06,'sine',0.04); playTone(880,0.05,'sine',0.03,0.03); },
  // Atirador: estalo seco e agudo, tipo disparo de precisão.
  sniper()      { playNoise(0.035,0.06,0,3400,1.2); playTone(1500,0.02,'square',0.03); },
  // Gladiador: clangor metálico de espada.
  gladiator()   { playTone(320,0.05,'square',0.045); playTone(190,0.06,'square',0.03,0.02); },
  // Tesla: zap elétrico, dois tons agudos quase simultâneos.
  tesla()       { playTone(2000,0.02,'sawtooth',0.032); playTone(1300,0.025,'sawtooth',0.026,0.015); },
  // Canhão: boom grave com corpo de ruído (explosão).
  cannon()      { playTone(90,0.12,'sine',0.06); playNoise(0.08,0.04,0,420,1); },
  // Gelo: chime cristalino agudo.
  ice()         { playTone(1500,0.05,'sine',0.035); playTone(1900,0.04,'sine',0.024,0.02); },
  // Veneno: "cuspida" — tom curto + borbulha de ruído.
  poison()      { playTone(300,0.04,'sine',0.03); playNoise(0.03,0.025,0,900,2); },
  // Laser: tique sibilante, minúsculo — é o mais throttled de todos porque
  // dispara 8-12x/s; a repetição rápida já dá a sensação de feixe contínuo.
  laser()       { playTone(2300,0.018,'square',0.018); },
  // Morteiro: baque de lançamento ainda mais grave/longo que o canhão.
  mortar()      { playTone(70,0.15,'sine',0.07); playNoise(0.1,0.05,0,300,1); },
  // Arpão: whoosh pesado de farpa perfurando o ar.
  perfurador()  { playTone(520,0.05,'sawtooth',0.04); playTone(260,0.05,'sawtooth',0.025,0.03); },
  // Corrosivo: chiado ácido (ruído) + leve mordida de tom.
  corrosivo()   { playNoise(0.06,0.035,0,2100,2.5); playTone(420,0.04,'sawtooth',0.02,0.01); },
  // Prisma: acorde curto de três notas — um "ping" por refração, disparado
  // uma única vez por rajada (não por alvo atingido).
  prisma()      { [950,1250,1550].forEach((f,i)=>playTone(f,0.05,'sine',0.03,i*0.015)); },
  // Arcturus — ataque normal: whoosh grave e incendiário.
  arcturus()     { playTone(200,0.06,'sawtooth',0.045); playTone(520,0.05,'sine',0.03,0.02); },
  // Arcturus — sobrecarga: a mesma ideia, só que maior e com corpo de ruído.
  arcturusOver() { playTone(120,0.12,'sawtooth',0.07); playNoise(0.08,0.04,0,500,1); },
  // Gojo — Infinidade: anel etéreo suave.
  gojoInfinity() { playTone(700,0.08,'sine',0.04); playTone(1050,0.07,'sine',0.028,0.04); },
  // Gojo — Vazio Azul: implosão (agudo caindo pro grave, depois um "pop").
  gojoBlue()     { playTone(1200,0.05,'sine',0.04); playTone(220,0.06,'sine',0.045,0.05); },
  // Gojo — Expansão Máxima: o mais raro e mais épico — um estrondo cósmico grave
  // seguido de um acorde largo. Throttle alto (é uma técnica rara de qualquer forma).
  gojoPurple()   { playTone(55,0.2,'sawtooth',0.08); [300,600,900].forEach((f,i)=>playTone(f,0.15,'sine',0.05,0.05+i*0.05)); },
  // Umbra: tom sombrio frio + sopro de ruído (congela e corrói ao mesmo tempo).
  umbra()        { playTone(240,0.06,'sine',0.035); playNoise(0.05,0.025,0,1500,2); },
  // Nêmesis: zap cósmico agudo, timbre parecido com a Tesla mas mais fino/cortante.
  nemesis()      { playTone(1800,0.03,'sawtooth',0.03); playTone(1200,0.03,'sawtooth',0.024,0.02); },
};

// Intervalo mínimo (segundos) entre reproduções do MESMO som de disparo,
// mesmo com várias torres iguais atirando ao mesmo tempo — é o que evita
// virar "purê" de áudio quando o mapa está cheio de uma torre só.
const SHOT_SFX_MIN_GAP = {
  archer:0.05, barricada:0.08, mage:0.10, sniper:0.12, gladiator:0.10,
  tesla:0.08, cannon:0.12, ice:0.08, poison:0.08, laser:0.09, mortar:0.15,
  perfurador:0.09, corrosivo:0.08, prisma:0.10,
  arcturus:0.10, arcturusOver:0.12,
  gojoInfinity:0.15, gojoBlue:0.12, gojoPurple:0.3,
  umbra:0.09, nemesis:0.09,
};

const _lastShotSfxAt = {};
function playShotSfx(key) {
  if (!sfxEnabled) return;
  const fn = SHOT_SFX[key];
  if (!fn) return;
  // globalTime avança gameSpeed vezes mais rápido que o relógio real (ver
  // gameLoop: o loop de update roda `gameSpeed` vezes por frame real, cada
  // uma somando o mesmo dt real em globalTime). Sem compensar isso, o
  // throttle "encolhe" junto com a velocidade — em 3x ele deixava passar 3x
  // mais sons por segundo REAL, o que ficava insuportável. Multiplicando o
  // intervalo mínimo por gameSpeed, a densidade de som em tempo real fica
  // igual não importa a velocidade escolhida.
  const minGap = (SHOT_SFX_MIN_GAP[key] != null ? SHOT_SFX_MIN_GAP[key] : 0.06) * gameSpeed;
  if (globalTime - (_lastShotSfxAt[key]||-999) < minGap) return;
  _lastShotSfxAt[key] = globalTime;
  fn();
}

let _lastLifeLostSfxAt = -999;
function sfxLifeLost() {
  // Pequeno debounce: uma wave ruim pode perder várias vidas em menos de 1
  // frame de diferença — sem isso, viraria um alarme ensurdecedor instantâneo.
  if (globalTime - _lastLifeLostSfxAt < 0.15) return;
  _lastLifeLostSfxAt = globalTime;
  SFX.lifeLost();
}

function setSfxEnabled(on) {
  sfxEnabled = on;
  const persist = loadPersist();
  persist.sfxEnabled = on;
  savePersist(persist);
  const btn = document.getElementById('btn-sfx');
  if (btn) { btn.textContent = on ? '🔊' : '🔇'; btn.classList.toggle('on', on); btn.title = on ? 'Som ligado (clique p/ mutar)' : 'Som mudo (clique p/ ligar)'; }
}

// ===========================
//   GAME STATE
// ===========================
let canvas, ctx;
let state = {};
let globalTime = 0;
let gameSpeed = 1; // 1, 2 ou 3

// Current selected mode before starting
let selectedGameMode = 'normal'; // 'facil'|'normal'|'dificil'|'hardcore'|'infinito'|'desafio'

const GAME_MODES = {
  facil:    { label:'😊 Fácil',     lives:30, gold:250, enemyScale:0.65, gemBonus:0,  desc:'Mais vidas, mais ouro inicial, inimigos mais fracos.' },
  normal:   { label:'⚔️ Normal',    lives:20, gold:150, enemyScale:1.0,  gemBonus:0,  desc:'A experiência padrão do BLOCK TD.' },
  dificil:  { label:'💀 Difícil',   lives:12, gold:100, enemyScale:1.4,  gemBonus:1,  desc:'Inimigos mais resistentes e rápidos. +1 gema por vitória.' },
  hardcore: { label:'🔥 Hardcore',  lives:5,  gold:80,  enemyScale:1.9,  gemBonus:3,  desc:'Uma vida e orçamento apertado. Só para os melhores.' },
  infinito: { label:'∞ Infinito',  lives:20, gold:150, enemyScale:1.0,  gemBonus:0,  desc:'Waves infinitas — inimigos escalam sem parar até você perder.' },
  desafio:  { label:'🏆 Desafio',  lives:1,  gold:200, enemyScale:2.0,  gemBonus:5,  desc:'Sem torres de suporte. Apenas torres de dano. 1 vida. +5 gemas.' },
};

// ===========================
//   CONQUISTAS (novo na atualização)
// ===========================
// Progresso permanente e independente de partida — fica salvo em localStorage
// (persist.unlockedAchievements) e paga gemas de verdade. `check` recebe o
// persist salvo mais um `ctx` leve com o estado da partida atual ({wave,
// gameMode}); estatísticas cumulativas (kills, chefes, torres) ficam em
// persist.stats e só são somadas ao persist no fim da partida (mergeRunStatsIntoPersist),
// mas conquistas de wave são checadas ao vivo, a cada wave concluída.
const ACHIEVEMENTS = [
  { id:'wave10',     name:'Sobrevivente',         desc:'Alcance a wave 10.',                    icon:'🌊', gems:1, check:(p,ctx)=> ctx && ctx.wave>=10 },
  { id:'wave20',     name:'Veterano de Guerra',   desc:'Alcance a wave 20.',                    icon:'⚔️', gems:2, check:(p,ctx)=> ctx && ctx.wave>=20 },
  { id:'wave30',     name:'Lenda Viva',           desc:'Alcance a wave 30.',                    icon:'🔥', gems:3, check:(p,ctx)=> ctx && ctx.wave>=30 },
  { id:'wave40',     name:'Além do Fim',          desc:'Alcance a wave 40 — o fim da campanha.',icon:'🌌', gems:5, check:(p,ctx)=> ctx && ctx.wave>=40 },
  { id:'wave50inf',  name:'Sem Fim',              desc:'Alcance a wave 50 no Modo Infinito.',   icon:'♾️', gems:8, check:(p,ctx)=> ctx && ctx.gameMode==='infinito' && ctx.wave>=50 },
  { id:'kills100',   name:'Exterminador',         desc:'Derrote 100 inimigos no total (todas as partidas).', icon:'💀', gems:2, check:(p)=> (p.stats && p.stats.totalKills||0)>=100 },
  { id:'kills1000',  name:'Extermínio em Massa',  desc:'Derrote 1000 inimigos no total.',       icon:'☠️', gems:6, check:(p)=> (p.stats && p.stats.totalKills||0)>=1000 },
  { id:'bosses10',   name:'Caçador de Chefes',    desc:'Derrote 10 chefes no total.',           icon:'👑', gems:4, check:(p)=> (p.stats && p.stats.totalBossKills||0)>=10 },
  { id:'towers50',   name:'Construtor',           desc:'Construa 50 torres no total.',          icon:'🏗️', gems:2, check:(p)=> (p.stats && p.stats.totalTowersBuilt||0)>=50 },
  { id:'winHardcore',name:'Sobrevivente Hardcore',desc:'Vença uma partida no modo Hardcore.',   icon:'🔥', gems:5, check:(p)=> !!(p.stats && p.stats.victories && p.stats.victories.hardcore) },
  { id:'winDesafio', name:'Desafio Aceito',       desc:'Vença uma partida no modo Desafio.',    icon:'🏆', gems:8, check:(p)=> !!(p.stats && p.stats.victories && p.stats.victories.desafio) },
  { id:'allShopTowers', name:'Colecionador',      desc:'Desbloqueie todas as torres da loja.',  icon:'🛒', gems:5, check:(p)=> (p.unlockedTowers||[]).length >= Object.keys(SHOP_TOWERS).length },
  { id:'corrosivoBuilt', name:'Química Aplicada', desc:'Construa uma torre Corrosivo numa partida.', icon:'🧪', gems:1, check:(p)=> !!(p.stats && p.stats.builtCorrosivo) },
];

// Soma os contadores da partida que acabou de terminar ao progresso permanente.
// Só deve ser chamada UMA vez por partida (em endGame), pra não contar em dobro.
function mergeRunStatsIntoPersist(persist) {
  persist.stats = persist.stats || {};
  persist.stats.totalKills       = (persist.stats.totalKills||0)       + (state.kills||0);
  persist.stats.totalBossKills   = (persist.stats.totalBossKills||0)   + (state.bossKillsRun||0);
  persist.stats.totalTowersBuilt = (persist.stats.totalTowersBuilt||0) + (state.towersBuiltRun||0);
  persist.stats.gamesPlayed      = (persist.stats.gamesPlayed||0) + 1;
  persist.stats.bestWave         = Math.max(persist.stats.bestWave||0, state.wave||0);
  if (state.towers.some(t=>t.type==='corrosivo')) persist.stats.builtCorrosivo = true;
  return persist;
}

// Verifica todas as conquistas ainda não desbloqueadas; concede gemas e avisa
// na tela para as que acabaram de ser cumpridas. Seguro pra chamar a qualquer
// momento (idempotente — já desbloqueada não paga de novo).
function checkAchievements(persist, ctx) {
  persist.unlockedAchievements = persist.unlockedAchievements || [];
  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach(ach => {
    if (persist.unlockedAchievements.includes(ach.id)) return;
    let passed = false;
    try { passed = !!ach.check(persist, ctx); } catch(e) { passed = false; }
    if (passed) {
      persist.unlockedAchievements.push(ach.id);
      persist.gems = (persist.gems||0) + ach.gems;
      newlyUnlocked.push(ach);
    }
  });
  if (newlyUnlocked.length > 0) {
    savePersist(persist);
    updateGemHUD();
    newlyUnlocked.forEach((ach, i) => {
      setTimeout(() => {
        if (!canvas) return;
        SFX.achievement();
        spawnFloat(`🏆 ${ach.name} desbloqueada! +${ach.gems}💎`, canvas.width/2, canvas.height/2 - 60 - i*24, '#ffdd00');
        spawnParticles(canvas.width/2, canvas.height/2, '#ffdd00', 20);
      }, i*350);
    });
  }
  return newlyUnlocked;
}

function selectMode(btn, mode) {
  // Update button active state
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedGameMode = mode;
  const def = GAME_MODES[mode];
  if (!def) return;
  // Update description
  const desc = document.getElementById('mode-desc');
  if (desc) desc.textContent = def.desc;
  // Stats chips (novo no remake do menu): dá pra ver vidas/ouro/bônus de
  // gemas de cada modo sem precisar decorar ou ler só a descrição em texto.
  const stats = document.getElementById('mode-desc-stats');
  if (stats) {
    stats.innerHTML =
      `<span>❤️ ${def.lives}</span>` +
      `<span>💰 ${def.gold}</span>` +
      `<span>⚔️ ${def.enemyScale.toFixed(2)}x</span>` +
      (def.gemBonus ? `<span>💎 +${def.gemBonus}</span>` : '');
  }
}

function initState() {
  const mode = GAME_MODES[selectedGameMode] || GAME_MODES.normal;
  state = {
    lives: mode.lives,
    gold:  mode.gold,
    score:0,
    wave:1, waveActive:false, allWavesDone:false,
    towers:[], enemies:[], projectiles:[], particles:[], floatTexts:[],
    summons:[],
    selectedType:null, selectedTower:null,
    spawnQueue:[], spawnTimer:0,
    goldSpent:0, lastTime:null, hoveredTile:null,
    running:false, autoSkip:false, paused:false,
    bossAlertTimer:0,
    gameMode: selectedGameMode,
    enemyScale: mode.enemyScale,
    // Contadores desta partida (usados pelo sistema de conquistas ao final da run)
    kills:0, bossKillsRun:0, towersBuiltRun:0,
  };
  globalTime = 0;
  gameSpeed = 1;
}

// ===========================
//   SCREENS
// ===========================
// ─── TELA CHEIA ────────────────────────────────────────────────────
// API padrão de Fullscreen, com fallback pros prefixos antigos (alguns
// WebKit/Edge legado). iOS Safari NÃO suporta tela cheia de elementos
// arbitrários (só de <video>), então lá o botão continua existindo mas
// o toggle não tem efeito — não existe workaround 100% web pra isso.
function isCurrentlyFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}
function toggleFullscreen() {
  try {
    if (!isCurrentlyFullscreen()) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) {
        const p = req.call(el);
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) {
        const p = exit.call(document);
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    }
  } catch (e) { /* navegador sem suporte real — o botão só não faz nada */ }
}
function syncFullscreenButtons() {
  const on = isCurrentlyFullscreen();
  document.querySelectorAll('.fs-toggle').forEach(btn => {
    btn.classList.toggle('on', on);
    btn.title = on ? 'Sair da tela cheia' : 'Tela cheia';
  });
}
['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'].forEach(evt =>
  document.addEventListener(evt, syncFullscreenButtons)
);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('btn-start').onclick  = ()=>{ initAudio(); SFX.uiClick(); showScreen('game-screen'); startGame(false); };
document.getElementById('btn-load').onclick   = ()=>{ initAudio(); SFX.uiClick(); showScreen('game-screen'); startGame(true); };
document.getElementById('btn-how').onclick    = ()=>{ SFX.uiClick(); showScreen('how-screen'); };
document.getElementById('btn-back').onclick   = ()=>{ SFX.uiClick(); showScreen('menu-screen'); };
document.getElementById('btn-menu').onclick   = ()=>{ SFX.uiClick(); state.running=false; showScreen('menu-screen'); };
document.getElementById('btn-retry').onclick  = ()=>{ SFX.uiClick(); showScreen('game-screen'); startGame(false); };
document.getElementById('btn-gomenu').onclick = ()=>{ SFX.uiClick(); showScreen('menu-screen'); };
document.querySelectorAll('.fs-toggle').forEach(btn => { btn.onclick = () => { SFX.uiClick(); toggleFullscreen(); }; });
document.getElementById('modal-close').onclick= ()=>closeUpgradeModal();
document.getElementById('shop-close').onclick = ()=>closeShopModal();

// ── Conquistas (acessível pelo menu principal, não depende de partida ativa) ──
const btnAchievements = document.getElementById('btn-achievements');
if (btnAchievements) btnAchievements.onclick = () => openAchievementsModal();
const achClose = document.getElementById('achievements-close');
if (achClose) achClose.onclick = () => { SFX.modalClose(); document.getElementById('achievements-modal').classList.add('hidden'); };

function openAchievementsModal() {
  SFX.modalOpen();
  const persist = loadPersist();
  const unlocked = persist.unlockedAchievements || [];
  const list = document.getElementById('achievements-list');
  if (!list) return;
  list.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const done = unlocked.includes(ach.id);
    const div = document.createElement('div');
    div.className = 'ach-item' + (done ? ' done' : '');
    div.innerHTML = `
      <span class="ach-icon">${done ? ach.icon : '🔒'}</span>
      <span class="ach-info"><b>${ach.name}</b><span>${ach.desc}</span></span>
      <span class="ach-reward">${done ? '✓' : `💎${ach.gems}`}</span>
    `;
    list.appendChild(div);
  });
  const countEl = document.getElementById('achievements-count');
  if (countEl) countEl.textContent = `${unlocked.length}/${ACHIEVEMENTS.length}`;
  document.getElementById('achievements-modal').classList.remove('hidden');
}

// ===========================
//   START GAME
// ===========================
function startGame(doLoad=false) {
  canvas = document.getElementById('game-canvas');
  ctx    = canvas.getContext('2d');
  resizeCanvas();
  window.onresize = resizeCanvas;
  // orientationchange às vezes dispara antes do navegador atualizar
  // innerWidth/innerHeight no mobile — o pequeno atraso evita medir o
  // tamanho "velho" (da orientação anterior) por engano.
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 120));
  initState();
  applyMap(selectedMapId);
  if (doLoad) loadGame();
  state.running = true;
  setupUI();
  loadUnlockedTowersIntoPanel();
  loadAdminTowersIntoPanel();
  updateHUD();
  updateGemHUD();
  syncPauseButton();
  requestAnimationFrame(gameLoop);
}

// Breakpoint único pra decidir o layout "mobile" (painel de torres vira barra
// inferior, como na Bloons TD, em vez de coluna lateral). Este valor TEM que
// ser exatamente igual ao usado no media query de style.css — os dois lados
// leem essa decisão de formas diferentes (JS aqui, CSS lá) mas precisam
// concordar, senão o cálculo de escala do canvas erra o espaço disponível.
const MOBILE_BREAKPOINT_PX = 860;
function isMobileLayout() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
}

function resizeCanvas() {
  const area  = document.getElementById('game-area');
  const panel = document.getElementById('tower-panel');
  const hud   = document.getElementById('hud');
  const WORLD_W = MAP_COLS * TILE; // largura fixa do "mundo" do jogo (800px)
  const WORLD_H = MAP_ROWS * TILE; // altura fixa do "mundo" do jogo (560px)
  const mobile = isMobileLayout();

  // CORREÇÃO DE BUG (mapa cortado no mobile): antes, canvas.width/height eram
  // o próprio espaço disponível na tela — se a tela era mais estreita que os
  // 800px que o mapa usa (todo desenho no jogo é em coordenada de pixel fixa,
  // tile*40), tudo que passasse de canvas.width simplesmente NUNCA aparecia,
  // cortado pelo próprio limite do canvas. Não tinha como sobrar espaço, ele
  // desaparecia.
  //
  // Agora o canvas INTERNO (width/height, o que o jogo desenha) fica sempre
  // fixo em 800x560 — isso significa que NADA no resto do código (torres,
  // caminho, partículas, cliques em tile) precisa saber ou se importar com o
  // tamanho real da tela. O que muda é só o tamanho VISUAL do canvas (CSS),
  // escalado pra caber inteiro no espaço disponível — como um object-fit:
  // contain manual. getTile() (abaixo) compensa essa escala ao converter
  // clique/toque de volta pra coordenada de tile.
  canvas.width  = WORLD_W;
  canvas.height = WORLD_H;

  const availW = area.clientWidth - (mobile ? 0 : panel.offsetWidth);
  const availH = (window.innerHeight - hud.offsetHeight) - (mobile ? panel.offsetHeight : 0);
  const scale = Math.max(0.1, Math.min(availW / WORLD_W, availH / WORLD_H));

  canvas.style.width  = Math.floor(WORLD_W * scale) + 'px';
  canvas.style.height = Math.floor(WORLD_H * scale) + 'px';
}

// ===========================
//   TOWER TOOLTIP (hover info)
// ===========================
function attachTowerTooltip(btn, type) {
  if (!btn || !type) return;
  const tooltip = document.getElementById('tower-tooltip');
  if (!tooltip) return;

  btn.addEventListener('mouseenter', () => {
    const base = getAllTowerBase()[type];
    if (!base) return;
    const u = base.upgrades[0];
    let html = `<div class="tt-name">${base.icon} ${base.name}</div>`;
    if (base.desc) html += `<div class="tt-desc">${base.desc}</div>`;
    html += `<div class="tt-stats">
      <span>💰 Custo: <b>${base.cost}</b></span>
      <span>⚔️ Dano: <b>${u.dmg}</b></span>
      <span>🎯 Alcance: <b>${u.range}</b></span>
      <span>⏱️ Cadência: <b>${u.rate.toFixed(1)}/s</b></span>
      ${u.splash ? `<span>💥 Área: <b>${u.splash}px</b></span>` : ''}
    </div>`;
    tooltip.innerHTML = html;
    tooltip.classList.add('show');
  });

  btn.addEventListener('mousemove', (e) => {
    const ttRect = tooltip.getBoundingClientRect();
    let x = e.clientX + 16;
    let y = e.clientY - ttRect.height/2;
    if (x + ttRect.width > window.innerWidth - 8) x = e.clientX - ttRect.width - 16;
    if (y < 8) y = 8;
    if (y + ttRect.height > window.innerHeight - 8) y = window.innerHeight - ttRect.height - 8;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  });

  btn.addEventListener('mouseleave', () => {
    tooltip.classList.remove('show');
  });
}

// ===========================
//   UI
// ===========================
function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  syncPauseButton();
}

function syncPauseButton() {
  const pauseBtn = document.getElementById('btn-pause');
  if (!pauseBtn) return;
  pauseBtn.classList.toggle('on', state.paused);
  pauseBtn.textContent = state.paused ? '▶' : '⏸';
  pauseBtn.title = state.paused ? 'Continuar (Espaço)' : 'Pausar (Espaço)';
}

function setupUI() {
  // Mode badge in HUD
  const hudWave = document.getElementById('hud-wave');
  if (hudWave) {
    const mode = GAME_MODES[state.gameMode] || GAME_MODES.normal;
    const existing = document.getElementById('mode-hud-badge');
    if (!existing) {
      const badge = document.createElement('span');
      badge.id = 'mode-hud-badge';
      badge.className = `mode-hud-badge mode-badge-${state.gameMode}`;
      badge.textContent = mode.label;
      hudWave.parentNode.insertBefore(badge, hudWave.nextSibling);
    }
  }
  // Speed toggle — agora cicla 1x → 2x → 3x → 1x (veja o fix em gameLoop)
  const speedBtn = document.getElementById('btn-speed');
  speedBtn.onclick = () => {
    gameSpeed = gameSpeed >= 3 ? 1 : gameSpeed + 1;
    speedBtn.textContent = `▶▶ ${gameSpeed}x`;
    speedBtn.classList.toggle('on', gameSpeed > 1);
    if (gameSpeed === 1) SFX.toggleOff(); else SFX.toggleOn();
  };

  // Pause toggle
  const pauseBtn = document.getElementById('btn-pause');
  pauseBtn.onclick = () => { (state.paused ? SFX.toggleOn : SFX.toggleOff)(); togglePause(); };

  // Shop
  document.getElementById('btn-shop').onclick = () => openShopModal();

  // Som (mudo/ligado) — lembrado entre sessões via localStorage
  const sfxBtn = document.getElementById('btn-sfx');
  if (sfxBtn) {
    const persist0 = loadPersist();
    setSfxEnabled(persist0.sfxEnabled !== false); // padrão: ligado
    // Toca DEPOIS de ligar (senão o toggleOn nunca soaria ao reativar o som).
    sfxBtn.onclick = () => { const turningOn = !sfxEnabled; setSfxEnabled(turningOn); if (turningOn) SFX.toggleOn(); };
  }

  // Save
  document.getElementById('btn-save').onclick = () => { saveGame(); SFX.save(); };

  // Admin button
  document.getElementById('btn-admin').onclick = () => openAdminModal();
  document.getElementById('admin-confirm').onclick = () => checkAdminCode();
  document.getElementById('admin-cancel').onclick = () => { SFX.modalClose(); closeAdminModal(); };
  document.getElementById('admin-code-input').onkeydown = e => {
    if (e.key === 'Enter') checkAdminCode();
  };
  // Show admin unlocked state if already unlocked
  const persist = loadPersist();
  if (persist.adminUnlocked) {
    document.getElementById('btn-admin').classList.add('unlocked');
    document.getElementById('btn-admin').title = '🔐 Admin Desbloqueado';
  }


  document.querySelectorAll('.tower-btn[data-type]').forEach(btn => {
    btn.onclick = () => {
      const t = btn.getAttribute('data-type');
      // Check if unlocked (base towers always unlocked)
      const persist = loadPersist();
      if (SHOP_TOWERS[t] && !persist.unlockedTowers.includes(t)) {
        SFX.deny();
        spawnFloat('Bloqueado! Compre na loja 🛒', canvas.width/2, 60, '#c77dff');
        return;
      }
      SFX.select();
      if (state.selectedType===t) {
        state.selectedType=null; btn.classList.remove('active');
      } else {
        state.selectedType=t; state.selectedTower=null;
        document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
      }
      updateSidePanel();
    };
    attachTowerTooltip(btn, btn.getAttribute('data-type'));
  });

  document.getElementById('btn-sell').onclick = () => {
    if (!state.selectedTower) return;
    openSellConfirm(state.selectedTower);
  };

  document.getElementById('btn-upgrade').onclick = () => {
    if (!state.selectedTower) return;
    openUpgradeModal(state.selectedTower);
  };

  document.getElementById('btn-wave').onclick = () => {
    if (!state.waveActive && !state.allWavesDone) { SFX.uiClick(); startWave(); }
  };

  const autoBtn = document.getElementById('btn-autoskip');
  autoBtn.onclick = () => {
    state.autoSkip = !state.autoSkip;
    autoBtn.classList.toggle('on', state.autoSkip);
    autoBtn.textContent = state.autoSkip ? '⏭ AUTO ✓' : '⏭ AUTO';
    (state.autoSkip ? SFX.toggleOn : SFX.toggleOff)();
  };

  canvas.onclick = (e) => {
    const {col,row} = getTile(e);
    const px=col*TILE+TILE/2, py=row*TILE+TILE/2;
    const clicked = state.towers.find(t=>t.col===col&&t.row===row);
    if (clicked) {
      SFX.select();
      state.selectedTower=clicked; state.selectedType=null;
      document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('active'));
      updateSidePanel(); return;
    }
    if (state.selectedType) {
      const base=getAllTowerBase()[state.selectedType];
      // Desafio mode: only damage towers allowed
      if (state.gameMode === 'desafio') {
        const noDmgTypes = ['farmer','investidor','hypefarmer'];
        if (noDmgTypes.includes(state.selectedType)) {
          SFX.deny();
          spawnFloat('🏆 Desafio: torres de suporte bloqueadas!', col*TILE+20, row*TILE, '#ff8888');
          return;
        }
      }
      // Map limit check (e.g. Arcturus: max 1)
      if (base.mapLimit) {
        const existingCount = state.towers.filter(t => t.type === state.selectedType).length;
        if (existingCount >= base.mapLimit) {
          SFX.deny();
          spawnFloat(`Limite: ${base.mapLimit} no mapa!`, col*TILE+20, row*TILE, '#ff6644');
          return;
        }
      }
      if (!base) { state.selectedType=null; updateSidePanel(); return; }
      if (PATH_SET.has(`${col},${row}`))                         { SFX.deny(); spawnFloat('Caminho!',px,py-20,'#ff6b35'); return; }
      if (!base.isAquatic && WATER_SET.has(`${col},${row}`))      { SFX.deny(); spawnFloat('Água! 🌊',px,py-20,'#4ea8d8'); return; }
      if (col<0||col>=MAP_COLS||row<0||row>=MAP_ROWS)             return;
      if (state.towers.find(t=>t.col===col&&t.row===row))        { SFX.deny(); spawnFloat('Ocupado!',px,py-20,'#ff6b35'); return; }
      if (state.gold<base.cost)                                  { SFX.deny(); spawnFloat('Sem ouro!',px,py-20,'#ff6b35'); return; }
      state.gold-=base.cost; state.goldSpent+=base.cost;
      state.towers.push({ type:state.selectedType, col, row, px, py, cd:0, level:1, firing:0, animTime:Math.random()*10 });
      state.towersBuiltRun = (state.towersBuiltRun||0) + 1;
      updateHUD();
      spawnFloat(`-${base.cost}💰`,px,py-20,'#aaa');
      SFX.place();
      if (state.selectedType === 'arcturus') triggerArcturusEntrance(px, py);
    } else {
      state.selectedTower=null; updateSidePanel();
    }
  };

  canvas.onmousemove = (e)=>{ state.hoveredTile=getTile(e); };
  canvas.onmouseleave= ()=>{ state.hoveredTile=null; };

  // Keyboard shortcuts
  document.onkeydown = (e) => {
    // Don't trigger shortcuts while typing in an input (e.g. admin code)
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (!document.getElementById('game-screen').classList.contains('active')) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePause();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // Close any open modal first, else deselect tower/type
      const shopOpen = !document.getElementById('shop-modal').classList.contains('hidden');
      const upgOpen  = !document.getElementById('upgrade-modal').classList.contains('hidden');
      const adminOpen= !document.getElementById('admin-modal').classList.contains('hidden');
      const sellOpen = !document.getElementById('sell-confirm-modal').classList.contains('hidden');
      if (shopOpen) { closeShopModal(); return; }
      if (upgOpen)  { closeUpgradeModal(); return; }
      if (adminOpen){ closeAdminModal(); return; }
      if (sellOpen) { closeSellConfirm(); return; }
      state.selectedType=null; state.selectedTower=null;
      document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('active'));
      updateSidePanel();
      return;
    }
    // Number keys 1-9 select the Nth tower button currently in the panel
    if (e.key >= '1' && e.key <= '9') {
      const visibleBtns = Array.from(document.querySelectorAll('.tower-btn[data-type]'))
        .filter(b => b.style.display !== 'none' && !b.closest('.hidden'));
      const idx = parseInt(e.key, 10) - 1;
      const btn = visibleBtns[idx];
      if (btn) btn.click();
      return;
    }
    if (e.key.toLowerCase() === 'u') { document.getElementById('btn-upgrade').click(); return; }
    if (e.key.toLowerCase() === 's' && state.selectedTower) { document.getElementById('btn-sell').click(); return; }
  };
}

function getTile(e) {
  const r = canvas.getBoundingClientRect();
  // O canvas agora é desenhado internamente em 800x560 fixos mas pode aparecer
  // em qualquer tamanho na tela (ver resizeCanvas) — sem esse fator de escala,
  // um toque/clique num canvas encolhido (mobile) ou ampliado (monitor grande)
  // acertaria o tile errado.
  const scaleX = canvas.width  / r.width;
  const scaleY = canvas.height / r.height;
  const x = (e.clientX - r.left) * scaleX;
  const y = (e.clientY - r.top)  * scaleY;
  return { col: Math.floor(x / TILE), row: Math.floor(y / TILE) };
}

function updateHUD() {
  document.getElementById('hud-lives').textContent = state.lives;
  document.getElementById('hud-gold').textContent  = state.gold;
  document.getElementById('hud-score').textContent = state.score;
  const waveEl = document.getElementById('hud-wave');
  waveEl.textContent = state.gameMode === 'infinito' && state.wave > WAVES.length
    ? `∞ ${state.wave}`
    : state.wave;
  const btn=document.getElementById('btn-wave');
  btn.disabled = state.waveActive || (state.allWavesDone && state.gameMode !== 'infinito');
  btn.textContent = (state.allWavesDone && state.gameMode !== 'infinito') ? '✓ FIM' : (state.waveActive ? '⏳...' : '▶ WAVE');
  updateTowerAffordability();
}

// Esmaece (só visual — continua clicável/selecionável, igual antes) qualquer
// torre do painel que custe mais ouro do que o jogador tem agora. updateHUD()
// já roda logo depois de toda mudança de ouro (compra, venda, upgrade,
// recompensa de onda, renda do fazendeiro...), então é o gancho certo.
function updateTowerAffordability() {
  const base = getAllTowerBase();
  document.querySelectorAll('#tower-panel .tower-btn[data-type]').forEach(btn => {
    const def = base[btn.getAttribute('data-type')];
    if (!def) return;
    btn.classList.toggle('cant-afford', state.gold < def.cost);
  });
}

function updateSidePanel() {
  const actions = document.getElementById('selected-actions');
  const infoBox = document.getElementById('tower-info');
  const t = state.selectedTower;
  if (t) {
    const stats = getTowerStats(t);
    const base  = getAllTowerBase()[t.type];
    actions.classList.remove('hidden');
    infoBox.classList.remove('hidden');
    const upgBtn = document.getElementById('btn-upgrade');
    const upgCostEl=document.getElementById('upgrade-cost');
    const sellEl=document.getElementById('sell-val');
    const maxLevel = base.upgrades.length;
    if (t.level < maxLevel) {
      const nextUpg = base.upgrades[t.level];
      upgCostEl.textContent = `${nextUpg.upgCost}💰`;
      upgBtn.disabled = state.gold < nextUpg.upgCost;
      upgBtn.title = 'Abrir upgrades';
    } else {
      upgCostEl.textContent='MAX';
      upgBtn.disabled=true;
    }
    const spent = base.cost + base.upgrades.slice(1,t.level).reduce((s,u)=>s+u.upgCost,0);
    sellEl.textContent=`+${Math.floor(spent*0.65)}💰`;
    document.getElementById('ti-name').textContent  = `${stats.icon} ${stats.name}`;
    document.getElementById('ti-level').textContent = `Nível ${t.level} — ${base.upgrades[t.level-1].label}`;
    if (t.type === 'investidor') {
      const mult = base.upgrades[t.level-1].multiplier;
      const farmerCount = state.towers.filter(x=>x.type==='farmer'||x.type==='hypefarmer').length;
      const noFarm = farmerCount===0 ? '<br><span style="color:#ff8888;font-size:10px;">⚠️ Sem Fazendas no mapa!</span>' : '';
      document.getElementById('ti-stats').innerHTML =
        `💼 Multiplicador: <b>x${mult}</b>${noFarm}<br>`+
        `🌾 Fazendas no mapa: ${farmerCount}<br>`+
        `📈 Bônus/wave: +${Math.round((mult-1)*100)}% nas fazendas`;

    } else if (t.type === 'farmer') {
      const income = base.upgrades[t.level-1].income;
      const investor = state.towers.find(x=>x.type==='investidor');
      const mult = investor ? getTowerStats(investor).multiplier : 1;
      const realIncome = Math.round(income * mult);
      const buffStr = investor ? ` × ${mult} = ${realIncome}💰` : '';
      document.getElementById('ti-stats').innerHTML = `🌾 Renda: +${income}${buffStr}/wave<br>📈 Total waves: ${t.waveCount||0}<br>💵 Gerado: ${t.totalEarned||0}💰`;
    } else if (t.type === 'hypefarmer') {
      const upg = base.upgrades[t.level-1];
      const investor = state.towers.find(x=>x.type==='investidor');
      const mult = investor ? getTowerStats(investor).multiplier : 1;
      const realIncome = Math.round(upg.income * mult);
      const buffStr = investor ? ` × ${mult} = ${realIncome}💰` : '';
      document.getElementById('ti-stats').innerHTML =
        `🌾 Renda: +${upg.income}${buffStr}/wave<br>`+
        `🎁 Chance de caixa: ${Math.round(upg.boxChance*100)}%/wave<br>`+
        `💰 Bônus da caixa: ${upg.boxGoldMin}-${upg.boxGoldMax}💰<br>`+
        `📈 Total waves: ${t.waveCount||0} • Gerado: ${t.totalEarned||0}💰`;
    } else if (t.type === 'arcturus') {
      const charges = t.arcCharges || 0;
      const isOver = t.arcOvercharging;
      const isStab = t.arcStabilising;
      const upg = base.upgrades[t.level-1];
      const threshold = upg.overChargeThreshold || 30;
      const thermalStatus = isOver
        ? '🔥 SOBRECARGA ATIVA!'
        : isStab
        ? `⛔ Estabilizando... ${Math.ceil(t.arcStabilTimer||0)}s`
        : `☀️ Cargas: ${charges}/${threshold}`;
      const thermalColor = isOver ? '#ff4400' : isStab ? '#888' : charges > threshold*0.65 ? '#ff8800' : '#ffcc44';
      const novaIn   = Math.ceil(Math.max(0, t.arcNovaTimer   !== undefined ? t.arcNovaTimer   : upg.novaCooldown));
      const summonIn = Math.ceil(Math.max(0, t.arcSummonTimer !== undefined ? t.arcSummonTimer : upg.summonInterval));
      document.getElementById('ti-stats').innerHTML =
        `🗡 ${stats.dmg} (splash ${stats.splash}px)<br>`+
        `⚡ ${stats.rate.toFixed(1)} atk/s • 🎯 ${stats.range}px<br>`+
        `🔥 Burn: ${upg.burnDps}dps/${upg.burnDur}s<br>`+
        `💥 Sobrecarga: ${upg.overDmg}dmg, ${upg.overSplash}px (a cada ${threshold} tiros, ${upg.stabilizeDuration||60}s p/ estabilizar)<br>`+
        `🔆 Fragmentos: ${upg.summonCount}x | ${upg.summonDmg}dmg | a cada ${upg.summonInterval}s <span style="color:#aaa">(${summonIn}s)</span><br>`+
        `☀️ Nova Solar: ${upg.novaDmg}dmg | raio ${upg.novaRadius}px | CD ${upg.novaCooldown}s <span style="color:#aaa">(${novaIn}s)</span><br>`+
        `<span style='color:${thermalColor};font-weight:700;'>${thermalStatus}</span>`;
    } else {
      let extra = '';
      if (stats.poisonDps)    extra += `<br>☠️ Veneno: ${stats.poisonDps}dps / ${stats.poisonDuration}s`;
      if (stats.freezeStrength) extra += `<br>❄️ Congela: -${Math.round(stats.freezeStrength*100)}% vel. / ${stats.freezeDuration}s`;
      if (stats.chainCount)   extra += `<br>⚡ Cadeia: ${stats.chainCount} saltos (${stats.chainRange}px)`;
      if (stats.pierceCount)  extra += `<br>🔱 Perfura: até ${stats.pierceCount} alvos em linha`;
      if (stats.vulnMult)     extra += `<br>🧪 Vulnerável: +${Math.round((stats.vulnMult-1)*100)}% dano / ${stats.vulnDuration}s`;
      if (stats.multiShotCount) extra += `<br>🔷 Multi-alvo: ${stats.multiShotCount} inimigos por disparo`;
      if (stats.isKnockback)  extra += `<br>💥 Empurra inimigos para trás`;
      document.getElementById('ti-stats').innerHTML =
        `🗡 ${stats.dmg}${stats.splash?` (área ${stats.splash}px)`:''}<br>`+
        `⚡ ${stats.rate.toFixed(1)} atk/s<br>`+
        `🎯 ${stats.range}px${extra}`;
    }
  } else {
    actions.classList.add('hidden');
    infoBox.classList.add('hidden');
  }
}

// ===========================
//   UPGRADE MODAL
// ===========================
function openUpgradeModal(tower) {
  SFX.modalOpen();
  state.wasPausedBeforeModal = state.paused;
  state.paused = true;
  syncPauseButton();
  const base = getAllTowerBase()[tower.type];
  const modal= document.getElementById('upgrade-modal');
  const tiers= document.getElementById('modal-tiers');
  document.getElementById('modal-title').textContent = `${base.icon} ${base.name} — Upgrades`;
  tiers.innerHTML='';
  base.upgrades.forEach((upg,i)=>{
    const lvl=i+1;
    const isCurrent=(tower.level===lvl);
    const isLocked =(lvl>tower.level+1 || (lvl===tower.level+1 && state.gold<upg.upgCost));
    const canBuy   =(lvl===tower.level+1 && state.gold>=upg.upgCost);
    const div=document.createElement('div');
    div.className='modal-tier'+(isCurrent?' current':(isLocked&&!canBuy?' locked':''));
    const badges=['t1','t2','t3','t4','t5'];
    const icons_=['🥉','🥈','🥇','💎','👑'];
    div.innerHTML=`
      <div class="tier-badge ${badges[i]}">${icons_[i]}</div>
      <div class="tier-info">
        <b>Nível ${lvl}: ${upg.label}</b>
        <span>DMG ${upg.dmg}${upg.splash?' • Área '+upg.splash+'px':''} • Rate ${upg.rate.toFixed(1)} • Range ${upg.range}${upg.burnDps?' • 🔥Burn '+upg.burnDps+'dps/'+upg.burnDur+'s':''}${upg.overDmg?' • 💥Over '+upg.overDmg+'dmg a cada '+(upg.overChargeThreshold||30)+' tiros':''}${upg.summonInterval?' • 🔆'+upg.summonCount+'x Frag/'+upg.summonInterval+'s':''}${upg.novaDmg?' • ☀️Nova '+upg.novaDmg+'dmg/'+upg.novaRadius+'px':''}${upg.poisonDps?' • ☠️'+upg.poisonDps+'dps/'+upg.poisonDuration+'s':''}${upg.freezeStrength?' • ❄️-'+Math.round(upg.freezeStrength*100)+'%/'+upg.freezeDuration+'s':''}${upg.chainCount?' • ⚡x'+upg.chainCount+' saltos':''}${upg.pierceCount?' • 🔱perfura '+upg.pierceCount:''}${upg.vulnMult?' • 🧪+'+Math.round((upg.vulnMult-1)*100)+'% dano/'+upg.vulnDuration+'s':''}${upg.multiShotCount?' • 🔷'+upg.multiShotCount+'x alvos':''}</span>
      </div>
      ${isCurrent
        ? '<span class="tier-label-cur">✓ ATUAL</span>'
        : (canBuy
          ? `<span class="tier-cost">${upg.upgCost}💰</span>`
          : `<span class="tier-cost" style="color:#666">${upg.upgCost}💰</span>`)
      }
    `;
    if (canBuy) {
      div.style.cursor='pointer';
      div.onclick=()=>{ doUpgrade(tower,lvl,upg); closeUpgradeModal(); };
    }
    tiers.appendChild(div);
  });

  // Botão "Upgrade Máximo": pula direto pro último nível, cobrando de uma
  // vez só a soma do custo de todos os níveis que faltam (sem desconto —
  // é conveniência, não economia).
  const maxBtn = document.getElementById('btn-max-upgrade');
  const maxLevel = base.upgrades.length;
  if (tower.level >= maxLevel) {
    maxBtn.textContent = '👑 Nível Máximo';
    maxBtn.disabled = true;
  } else {
    const totalCost = base.upgrades.slice(tower.level).reduce((s,u)=>s+u.upgCost,0);
    maxBtn.textContent = `⏫ Upgrade Máximo — ${totalCost}💰`;
    maxBtn.disabled = state.gold < totalCost;
    maxBtn.onclick = () => { doMaxUpgrade(tower, totalCost, maxLevel); closeUpgradeModal(); };
  }

  modal.classList.remove('hidden');
}

function closeUpgradeModal() {
  SFX.modalClose();
  document.getElementById('upgrade-modal').classList.add('hidden');
  state.paused = !!state.wasPausedBeforeModal;
  syncPauseButton();
}

// ===========================
//   SELL CONFIRMATION
// ===========================
function openSellConfirm(tower) {
  SFX.modalOpen();
  state.wasPausedBeforeModal = state.paused;
  state.paused = true;
  syncPauseButton();
  const base  = getAllTowerBase()[tower.type];
  const spent = base.cost + base.upgrades.slice(1, tower.level).reduce((s,u)=>s+u.upgCost,0);
  const refund= Math.floor(spent * 0.65);
  document.getElementById('sell-confirm-text').innerHTML =
    `Vender <b style="color:#e8eaf6">${base.icon} ${base.name}</b> (Nível ${tower.level}) por <b style="color:#f5a623">+${refund}💰</b>?`;
  const modal = document.getElementById('sell-confirm-modal');
  modal.classList.remove('hidden');

  const yesBtn = document.getElementById('sell-confirm-yes');
  const noBtn  = document.getElementById('sell-confirm-no');
  yesBtn.onclick = () => {
    state.gold += refund;
    spawnFloat(`+${refund}💰`, tower.px, tower.py-22, '#f5a623');
    SFX.sell();
    state.towers = state.towers.filter(t=>t!==tower);
    // Clean up any lingering Solar Fragments from this Arcturus
    if (tower.type === 'arcturus') state.summons = [];
    state.selectedTower=null;
    updateHUD(); updateSidePanel();
    closeSellConfirm();
  };
  noBtn.onclick = () => closeSellConfirm();
}

function closeSellConfirm() {
  SFX.modalClose();
  document.getElementById('sell-confirm-modal').classList.add('hidden');
  state.paused = !!state.wasPausedBeforeModal;
  syncPauseButton();
}

// ===========================
//   SHOP MODAL
// ===========================
function openShopModal(isRefresh) {
  if (!isRefresh) SFX.modalOpen();
  state.wasPausedBeforeModal = state.paused;
  state.paused = true;
  syncPauseButton();
  updateGemHUD();
  const persist = loadPersist();
  const bestWave = (persist.stats && persist.stats.bestWave) || 0;
  const container = document.getElementById('shop-items');
  container.innerHTML = '';
  Object.entries(SHOP_TOWERS).forEach(([key, def]) => {
    const owned = persist.unlockedTowers.includes(key);
    // requiresWave (ex.: Arcturus → 40): trava a torre até o jogador já ter
    // batido aquela wave em ALGUMA partida anterior, mesmo tendo gemas.
    const meetsReq = !def.requiresWave || bestWave >= def.requiresWave;
    const canAfford = meetsReq && (persist.gems || 0) >= def.gemCost;
    const div = document.createElement('div');
    div.className = 'shop-item' + (owned ? ' owned' : (!meetsReq ? ' locked-req' : (!canAfford ? ' cant-afford' : '')));
    div.dataset.type = key;
    div.dataset.key = key; // ativa também o destaque (já existente, mas nunca usado) do investidor
    // Support towers (income/multiplier-based) don't have dmg/range, so show
    // their actual specialty instead of "DMG undefined".
    const firstUpg = def.upgrades[0];
    let statsLine;
    if (def.isFarmer) {
      statsLine = `🌾 Renda base: +${firstUpg.income}💰/wave${firstUpg.boxChance ? ` • 🎁 ${Math.round(firstUpg.boxChance*100)}% chance de caixa` : ''}`;
    } else if (def.isInvestidor) {
      statsLine = `💼 Multiplicador inicial: x${firstUpg.multiplier}`;
    } else {
      statsLine = `💥 DMG ${firstUpg.dmg} • Range ${firstUpg.range}`;
    }
    let priceHtml;
    if (owned) {
      priceHtml = `<span class="shop-item-price owned-badge">✓ DESBLOQUEADO</span>`;
    } else if (!meetsReq) {
      priceHtml = `<span class="shop-item-price locked-badge">🔒 Requer wave ${def.requiresWave} (recorde: ${bestWave})</span>`;
    } else {
      priceHtml = `<span class="shop-item-price">💎 ${def.gemCost} Gemas</span>`;
    }
    div.innerHTML = `
      <span class="shop-item-icon">${def.icon}</span>
      ${def.isMythic ? '<span class="shop-item-mythic">MÍTICO</span>' : (def.isNew ? '<span class="shop-item-new">NOVO</span>' : '')}
      <span class="shop-item-name">${def.name}</span>
      <div class="shop-item-desc">${def.desc}</div>
      <div class="shop-item-stats">💰 ${def.cost}g em jogo • ${statsLine}</div>
      ${priceHtml}
    `;
    if (!owned && canAfford) {
      div.onclick = () => buyTower(key, def, persist);
    }
    container.appendChild(div);
  });
  document.getElementById('shop-modal').classList.remove('hidden');
}

function buyTower(key, def, persist) {
  if (persist.unlockedTowers.includes(key)) return;
  const bestWave = (persist.stats && persist.stats.bestWave) || 0;
  if (def.requiresWave && bestWave < def.requiresWave) return;
  if ((persist.gems || 0) < def.gemCost) return;
  persist.gems -= def.gemCost;
  persist.unlockedTowers.push(key);
  savePersist(persist);
  updateGemHUD();
  // Add to panel
  addUnlockedTowerToPanel(key, def);
  openShopModal(true); // refresh (sem repetir o som de abrir modal)
  SFX.shopBuy();
  spawnFloat(`${def.icon} ${def.name} desbloqueado!`, canvas.width/2, canvas.height/2, '#c77dff');
}

// ── Helpers visuais do painel de torres ──────────────────────────────
// Cada torre já tem sua própria cor (def.color); esses helpers levam essa
// cor pro card do painel (borda/fundo/glow no hover e quando selecionada),
// em vez do dourado genérico fixo que era usado antes pra todas.
function hexToRgbTriple(hex) {
  const h = String(hex).replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
}

// Garante (uma única vez) o rótulo de categoria "Loja"/"Secreto" no painel,
// sempre no mesmo ponto de inserção dos botões (logo antes de .panel-divider)
// — assim ele aparece só quando existe pelo menos 1 torre daquela categoria.
function ensureTowerSectionLabel(kind, label) {
  const panel = document.getElementById('tower-panel');
  if (!panel || panel.querySelector(`.panel-section-label[data-section="${kind}"]`)) return;
  const divider = panel.querySelector('.panel-divider');
  const el = document.createElement('div');
  el.className = 'panel-section-label';
  el.dataset.section = kind;
  el.textContent = label;
  panel.insertBefore(el, divider || null);
}

function addUnlockedTowerToPanel(key, def) {
  // Don't add if already exists
  if (document.querySelector(`.tower-btn[data-type="${key}"]`)) return;
  const panel = document.getElementById('tower-panel');
  const divider = panel.querySelector('.panel-divider');
  ensureTowerSectionLabel('loja', '🛒 Loja');
  const rgb = hexToRgbTriple(def.color);
  const btn = document.createElement('button');
  btn.className = 'tower-btn' + (def.isMythic ? ' mythic-tower-btn' : '');
  btn.setAttribute('data-type', key);
  btn.style.setProperty('--tw-color', def.color);
  btn.style.setProperty('--tw-rgb', rgb);
  btn.innerHTML = `
    ${def.isMythic ? '<span class="tbtn-mythic-tag">MÍTICA</span>' : ''}
    <div class="tbtn-icon" style="background:linear-gradient(135deg,${def.color},${def.glow});box-shadow:inset 0 1px 0 rgba(255,255,255,.25), inset 0 -7px 10px rgba(0,0,0,.22), 0 0 10px rgba(${rgb},.45);">${def.icon}</div>
    <div class="tbtn-info"><b>${def.name}</b><span>${def.cost}💰</span></div>
  `;
  btn.onclick = () => {
    SFX.select();
    if (state.selectedType===key) {
      state.selectedType=null; btn.classList.remove('active');
    } else {
      state.selectedType=key; state.selectedTower=null;
      document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    }
    updateSidePanel();
  };
  panel.insertBefore(btn, divider);
  attachTowerTooltip(btn, key);
}

function closeShopModal() {
  SFX.modalClose();
  document.getElementById('shop-modal').classList.add('hidden');
  state.paused = !!state.wasPausedBeforeModal;
  syncPauseButton();
}

// ===========================
//   ADMIN CODE SYSTEM
// ===========================
const ADMIN_CODE = 'EntreOSexEATerraEuSouOMaisCum';

function openAdminModal() {
  SFX.modalOpen();
  const persist = loadPersist();
  if (persist.adminUnlocked) {
    // Already unlocked — just show a message and offer to add Gojo to panel
    const fb = document.getElementById('admin-feedback');
    fb.textContent = '✓ Acesso Admin já ativo! Satoru Gojo desbloqueado.';
    fb.className = 'admin-feedback success';
    fb.classList.remove('hidden');
    document.getElementById('admin-code-input').value = '';
    document.getElementById('admin-modal').classList.remove('hidden');
    return;
  }
  document.getElementById('admin-feedback').classList.add('hidden');
  document.getElementById('admin-code-input').value = '';
  document.getElementById('admin-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('admin-code-input').focus(), 100);
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.add('hidden');
}

function checkAdminCode() {
  const input = document.getElementById('admin-code-input').value.trim();
  const fb = document.getElementById('admin-feedback');
  fb.classList.remove('hidden');

  if (input === ADMIN_CODE) {
    SFX.adminOk();
    fb.textContent = '✅ Acesso concedido! Satoru Gojo desbloqueado!';
    fb.className = 'admin-feedback success';

    const persist = loadPersist();
    persist.adminUnlocked = true;
    savePersist(persist);

    document.getElementById('btn-admin').classList.add('unlocked');
    document.getElementById('btn-admin').title = '🔐 Admin Desbloqueado';

    // Unlock Gojo
    loadAdminTowersIntoPanel();

    setTimeout(() => {
      closeAdminModal();
      spawnFloat('♾️ SATORU GOJO DESBLOQUEADO!', canvas.width/2, canvas.height/2 - 20, '#b07aff');
      spawnFloat('O mais forte chegou.', canvas.width/2, canvas.height/2 + 10, '#ff88ff');
    }, 1200);
    return;
  }

  // Outras torres de código secreto (Umbra, Nêmesis, ...): cada uma tem seu
  // próprio código, independente do ADMIN_CODE do Gojo. O desbloqueio de
  // cada uma fica em persist.unlockedSecretTowers em vez do flag único
  // adminUnlocked (que continua exclusivo do Gojo).
  const secretMatch = Object.entries(ADMIN_TOWERS).find(([, d]) => d.secretCode && d.secretCode === input);
  if (secretMatch) {
    const [key, def] = secretMatch;
    const persist = loadPersist();
    persist.unlockedSecretTowers = persist.unlockedSecretTowers || [];
    if (persist.unlockedSecretTowers.includes(key)) {
      SFX.select();
      fb.textContent = `✓ ${def.name} já desbloqueado!`;
      fb.className = 'admin-feedback success';
    } else {
      SFX.adminOk();
      persist.unlockedSecretTowers.push(key);
      savePersist(persist);
      fb.textContent = `✅ Acesso concedido! ${def.name} desbloqueado!`;
      fb.className = 'admin-feedback success';
      loadAdminTowersIntoPanel();
      setTimeout(() => {
        closeAdminModal();
        spawnFloat(`${def.icon} ${def.name.toUpperCase()} DESBLOQUEADO!`, canvas.width/2, canvas.height/2 - 20, def.color);
      }, 1200);
    }
    document.getElementById('admin-code-input').value = '';
    return;
  }

  SFX.adminFail();
  fb.textContent = '❌ Código incorreto. Tente novamente.';
  fb.className = 'admin-feedback error';
  document.getElementById('admin-code-input').value = '';
  // Shake effect
  const input_ = document.getElementById('admin-code-input');
  input_.style.animation = 'none';
  input_.style.borderColor = '#e74c3c';
  setTimeout(() => { input_.style.borderColor = '#7b2fff'; }, 600);
}

function loadAdminTowersIntoPanel() {
  const persist = loadPersist();
  const unlockedSecret = persist.unlockedSecretTowers || [];
  Object.entries(ADMIN_TOWERS).forEach(([key, def]) => {
    // Gojo usa o flag único adminUnlocked; as torres com código próprio
    // (def.secretCode) têm desbloqueio individual em unlockedSecretTowers.
    const isUnlocked = def.secretCode ? unlockedSecret.includes(key) : !!persist.adminUnlocked;
    if (isUnlocked) addAdminTowerToPanel(key, def);
  });
}

function addAdminTowerToPanel(key, def) {
  if (document.querySelector(`.tower-btn[data-type="${key}"]`)) return;
  const panel = document.getElementById('tower-panel');
  const divider = panel.querySelector('.panel-divider');
  ensureTowerSectionLabel('secreto', '🔐 Secreto');
  const rgb = hexToRgbTriple(def.color);
  const btn = document.createElement('button');
  btn.className = 'tower-btn secret-tower-btn';
  btn.setAttribute('data-type', key);
  btn.style.setProperty('--tw-color', def.color);
  btn.style.setProperty('--tw-rgb', rgb);
  btn.innerHTML = `
    <div class="tbtn-icon" style="background:linear-gradient(135deg, ${def.color}, ${def.glow}); box-shadow:inset 0 1px 0 rgba(255,255,255,.25), inset 0 -7px 10px rgba(0,0,0,.22), 0 0 10px rgba(${rgb},.5);">${def.icon}</div>
    <div class="tbtn-info"><b style="color:${def.color}">${def.name}</b><span>${def.cost}💰</span></div>
  `;
  btn.title = def.desc;
  btn.onclick = () => {
    SFX.select();
    if (state.selectedType===key) {
      state.selectedType=null; btn.classList.remove('active');
    } else {
      state.selectedType=key; state.selectedTower=null;
      document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    }
    updateSidePanel();
  };
  // Insert before divider (at top)
  panel.insertBefore(btn, divider ? divider : panel.firstChild);
  attachTowerTooltip(btn, key);
}


function loadUnlockedTowersIntoPanel() {
  const persist = loadPersist();
  persist.unlockedTowers.forEach(key => {
    const def = SHOP_TOWERS[key];
    if (def) addUnlockedTowerToPanel(key, def);
  });
}

function doUpgrade(tower,lvl,upg) {
  state.gold -= upg.upgCost;
  state.goldSpent += upg.upgCost;
  tower.level = lvl;
  spawnParticles(tower.px, tower.py, getAllTowerBase()[tower.type].color, 16);
  spawnFloat('⬆️ UPGRADE!', tower.px, tower.py-24, '#4ecb71');
  SFX.upgrade();
  updateHUD(); updateSidePanel();
}

// Upgrade direto pro nível máximo, pagando de uma vez a soma dos upgCost
// de todos os níveis pulados (mesmo custo total de ir subindo um por um).
function doMaxUpgrade(tower, totalCost, maxLevel) {
  if (state.gold < totalCost || tower.level >= maxLevel) return;
  state.gold -= totalCost;
  state.goldSpent += totalCost;
  tower.level = maxLevel;
  spawnParticles(tower.px, tower.py, getAllTowerBase()[tower.type].color, 28);
  spawnFloat('👑 NÍVEL MÁXIMO!', tower.px, tower.py-24, '#f5a623');
  SFX.upgrade();
  updateHUD(); updateSidePanel();
}

// ===========================
//   WAVE / SPAWN
// ===========================
function startWave() {
  const rawIdx = state.wave - 1;
  const waveIdx = state.gameMode === 'infinito'
    ? rawIdx % WAVES.length
    : rawIdx;
  if (waveIdx>=WAVES.length) return;
  state.waveActive=true;
  SFX.waveStart();
  const groups=WAVES[waveIdx];
  const queue=[];
  let delay=0;
  const isBossWave = state.wave%10===0;

  // Post-campaign infinite bosses: every 10 waves after the campaign ends (WAVES.length,
  // 40 as of this update) spawn a new infinite boss.
  const infiniteBossIdx = state.gameMode === 'infinito' && state.wave > WAVES.length && isBossWave
    ? Math.floor((state.wave - (WAVES.length + 1)) / 10) % INFINITE_BOSS_DEFS.length
    : -1;

  groups.forEach(g=>{
    for(let i=0;i<g.count;i++){
      if(g.boss!==undefined){
        queue.push({ delay, isBoss:true, bossIdx:g.boss });
      } else {
        queue.push({ delay, isBoss:false, typeDef:ENEMY_DEFS[g.t] });
      }
      delay+=g.interval;
    }
    delay+=0.5;
  });

  // Inject infinite boss at start of wave (before normal enemies)
  if (infiniteBossIdx >= 0) {
    queue.unshift({ delay:0, isInfiniteBoss:true, bossIdx:infiniteBossIdx });
    // Shift all other delays by 4s to give space for the boss entrance
    queue.slice(1).forEach(item => item.delay += 4);
  }

  state.spawnQueue=queue;
  state.spawnTimer=0;

  if(isBossWave){
    const bossDef = infiniteBossIdx >= 0
      ? INFINITE_BOSS_DEFS[infiniteBossIdx]
      : BOSS_DEFS[(state.wave/10-1)%BOSS_DEFS.length];
    showBossAlert(bossDef.name, bossDef.abilityDesc);
  }
  updateHUD();
}

function showBossAlert(name, abilityDesc) {
  const el=document.getElementById('boss-alert');
  document.getElementById('boss-alert-name').textContent=`⚠️ BOSS: ${name}!`;
  // abilityDesc já existia nos dados dos chefes mas nunca era mostrado — agora
  // o jogador sabe o que esperar antes de a wave começar.
  const descEl = document.getElementById('boss-alert-desc');
  if (descEl) descEl.textContent = abilityDesc ? `✦ ${abilityDesc}` : '';
  el.classList.remove('hidden');
  state.bossAlertTimer=3.5;
  SFX.bossAlert();
}

function processSpawn(dt) {
  if(!state.waveActive||state.spawnQueue.length===0) return;
  state.spawnTimer+=dt;
  while(state.spawnQueue.length>0 && state.spawnTimer>=state.spawnQueue[0].delay){
    const item=state.spawnQueue.shift();
    if(item.isInfiniteBoss)   spawnInfiniteBoss(INFINITE_BOSS_DEFS[item.bossIdx]);
    else if(item.isBoss)      spawnBoss(BOSS_DEFS[item.bossIdx]);
    else                      spawnEnemy(item.typeDef);
  }
}

function spawnEnemy(def) {
  const s=PATH_PX[0];
  // REBALANCEAMENTO: antes, o multiplicador de dificuldade do modo (enemyScale)
  // só era aplicado a chefes — todo inimigo comum tinha o MESMO hp em Fácil,
  // Difícil, Hardcore e Desafio, então os modos só ficavam "reais" nas waves de
  // chefe. Agora o hp comum também escala. A recompensa acompanha só até a metade
  // do multiplicador, para que modos difíceis continuem mais difíceis de verdade
  // (mais hp por ouro recebido), e Fácil continue dando um pouco menos de ouro.
  const scale = state.enemyScale || 1.0;
  const hp = Math.max(1, Math.round(def.hp * scale));
  const rewardScale = 1 + (scale - 1) * 0.5;
  const reward = Math.max(1, Math.round(def.reward * rewardScale));
  state.enemies.push({
    x:s.x,y:s.y, hp,maxHp:hp,
    speed:def.speed,reward,
    color:def.color,size:def.size, name:def.name,
    wpIdx:1,dead:false,reached:false,flashTimer:0,
    isBoss:false, regenTimer:0, shieldHp:0, shieldTimer:0,
    walkTime:0, facingDir:1,
    // NOVO: armadura plana (ex.: Cavaleiro Sombrio) — mesma lógica dos chefes blindados.
    armorReduction: def.armorPct || 0,
  });
}

function spawnBoss(def) {
  const s=PATH_PX[0];
  const scale = (1 + (state.wave/10)*0.5) * (state.enemyScale || 1.0);
  const hp = Math.floor(def.hp*scale);
  state.enemies.push({
    x:s.x,y:s.y, hp, maxHp:hp,
    speed:def.speed, reward:def.reward,
    color:def.color, size:def.size,
    wpIdx:1, dead:false, reached:false, flashTimer:0,
    isBoss:true, ability:def.ability, crown:def.crown,
    regenTimer:0, shieldHp:0, shieldTimer:0,
    armorReduction: def.ability==='armor' ? 0.5 : 0,
    name: def.name, walkTime:0, facingDir:1,
  });
}

function spawnInfiniteBoss(def) {
  const s = PATH_PX[0];
  // Scale aggressively per wave beyond the end of the campaign (WAVES.length)
  const extraWaves = Math.max(0, state.wave - WAVES.length);
  const scale = (1 + extraWaves * 0.18) * (state.enemyScale || 1.0);
  const hp = Math.floor(def.hp * scale);
  const reward = Math.floor(def.reward * (1 + extraWaves * 0.1));

  const enemy = {
    x:s.x, y:s.y, hp, maxHp:hp,
    speed: def.speed * (1 + extraWaves * 0.02), // slowly gets faster
    reward, color:def.color, size:def.size,
    wpIdx:1, dead:false, reached:false, flashTimer:0,
    isBoss:true, isInfiniteBoss:true,
    ability:def.ability, crown:def.crown, name:def.name, lore:def.lore,
    regenTimer:0, shieldHp:0, shieldTimer:0,
    armorReduction:0,
    walkTime:0, facingDir:1,
    // Ability-specific state
    voidTimer:0, voidActive:false, voidCooldown:0,
    mahitoCloneTimer:0, mahitoCloneCount:0,
    lichReviveTimer:0,
    titanDebuffActive:false,
    sukunaDomainTimer:0,
  };

  // Armor for Titan
  if (def.ability === 'titan') enemy.armorReduction = 0.3;

  state.enemies.push(enemy);

  // Show lore popup
  spawnFloat(`☠ ${def.name}`, s.x, s.y - 40, def.color);
  setTimeout(() => {
    if (state.running) spawnFloat(def.lore, canvas.width/2, 80, def.color);
  }, 800);
}


// ===========================
// roundRect polyfill for browsers that don't support it
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
    if (w < 2*r) r = w/2;
    if (h < 2*r) r = h/2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
  };
}

function gameLoop(ts) {
  if(!state.running) return;
  const rawDt=Math.min((ts-(state.lastTime||ts))/1000,0.05);
  state.lastTime=ts;
  if (!state.paused) {
    // CORREÇÃO DE BUG: a versão antiga fazia `dt = rawDt/steps` e então rodava
    // `update(dt)` exatamente `steps` vezes — isso soma de volta pra rawDt total
    // (steps * (rawDt/steps) = rawDt), então o botão "2x" nunca acelerava nada de
    // verdade, só rodava a mesma quantidade de tempo simulado em passos menores.
    // Agora cada passo usa o dt cheio, então gameSpeed multiplica o tempo simulado
    // por quadro de verdade — e dá pra ter 3x também.
    for (let i = 0; i < gameSpeed; i++) {
      globalTime += rawDt;
      update(rawDt);
    }
  }
  draw();
  if (state.paused) drawPauseOverlay();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  processSpawn(dt);
  updateBossAlert(dt);
  updateEnemies(dt);
  // Hype Farmer's rare "all towers fire faster" buff ticks down here
  if (state.hypeBuff) {
    state.hypeBuff.timer -= dt;
    if (state.hypeBuff.timer <= 0) {
      state.hypeBuff = null;
      spawnFloat('Hype acabou...', canvas.width/2, 60, '#ff99cc');
    }
  }
  fireTowers(dt);
  moveProjectiles(dt);
  updateSummons(dt);
  updateParticles(dt);
  updateFloatTexts(dt);
  checkWaveEnd();
  checkGameOver();
  // advance tower animTime
  state.towers.forEach(t=>{ t.animTime=(t.animTime||0)+dt; });
}

function updateBossAlert(dt) {
  if(state.bossAlertTimer>0){
    state.bossAlertTimer-=dt;
    if(state.bossAlertTimer<=0){
      document.getElementById('boss-alert').classList.add('hidden');
    }
  }
}

function updateEnemies(dt) {
  state.enemies.forEach(e => {
    if(e.dead||e.reached) return;
    e.flashTimer=Math.max(0,e.flashTimer-dt);
    e.walkTime=(e.walkTime||0)+dt;

    // Freeze tick
    if (e.frozen) {
      e.frozenTimer -= dt;
      if (e.frozenTimer <= 0) {
        e.frozen = false;
        e.speed = e.baseSpeed || e.speed;
      }
    }
    // Poison tick
    if (e.poisoned) {
      e.poisonTimer -= dt;
      e.hp -= e.poisonDps * dt;
      if (e.poisonTimer <= 0) e.poisoned = false;
    }
    // Vulnerable tick (Corrosivo)
    if (e.vulnerable) {
      e.vulnTimer -= dt;
      if (e.vulnTimer <= 0) { e.vulnerable = false; e.vulnMult = 1; }
    }
    // Burn tick (Arcturus)
    if (e.burning) {
      e.burnTimer -= dt;
      e.hp -= e.burnDps * dt;
      if (e.burnTimer <= 0) { e.burning = false; e.burnDps = 0; }
      if (e.hp <= 0 && !e.dead) {
        e.dead = true;
        state.gold += e.reward; state.score += e.reward;
        state.kills = (state.kills||0) + 1;
        if (e.isBoss) { state.bossKillsRun = (state.bossKillsRun||0) + 1; SFX.bossDown(); }
        spawnParticles(e.x, e.y, '#ff8800', 10);
        spawnFloat(`+${e.reward}💰`, e.x, e.y-22, '#f5a623');
        updateHUD(); return;
      }
    }
    // general hp=0 check after status ticks
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      state.gold += e.reward; state.score += e.reward;
      state.kills = (state.kills||0) + 1;
      if (e.isBoss) { state.bossKillsRun = (state.bossKillsRun||0) + 1; SFX.bossDown(); }
      spawnParticles(e.x, e.y, '#ffaa44', 8);
      spawnFloat(`+${e.reward}💰`, e.x, e.y-22, '#f5a623');
      updateHUD(); return;
    }

    if(e.isBoss){
      if(e.ability==='regen'){
        e.regenTimer=(e.regenTimer||0)+dt;
        if(e.regenTimer>0.5){ e.hp=Math.min(e.maxHp, e.hp+e.maxHp*0.005); e.regenTimer=0; }
      }
      if(e.ability==='shield'){
        e.shieldTimer=(e.shieldTimer||0)+dt;
        if(e.shieldTimer>8 && e.shieldHp<=0){
          e.shieldHp=Math.floor(e.maxHp*0.2); e.shieldTimer=0;
          spawnFloat('🛡 Escudo!',e.x,e.y-30,'#aaccff');
          spawnParticles(e.x,e.y,'#aaccff',12);
        }
      }

      // ===== NEW INFINITE BOSS ABILITIES =====
      if(e.ability==='void'){
        // Hollow Voidwalker: every 12s becomes invulnerable for 3s
        e.voidCooldown=(e.voidCooldown||0)+dt;
        if(e.voidActive){
          e.voidTimer=(e.voidTimer||0)+dt;
          if(e.voidTimer>=3){ e.voidActive=false; e.voidTimer=0; e.voidCooldown=0; spawnFloat('Vazio acabou!',e.x,e.y-32,'#ff88ff'); }
        } else if(e.voidCooldown>=12){
          e.voidActive=true; e.voidTimer=0;
          spawnFloat('♾️ INTANGÍVEL!',e.x,e.y-36,'#ff00ff');
          spawnParticles(e.x,e.y,'#ff00ff',20);
        }
      }
      if(e.ability==='mahito'){
        // Mahito: every 8s hit, clone spawns a weaker copy
        e.mahitoCloneTimer=(e.mahitoCloneTimer||0)+dt;
        if(e.mahitoCloneTimer>=8 && (e.mahitoCloneCount||0)<3){
          e.mahitoCloneTimer=0; e.mahitoCloneCount=(e.mahitoCloneCount||0)+1;
          const cloneDef={ name:'Mahito-Clone', hp:Math.floor(e.maxHp*0.25), speed:e.speed*1.3,
            reward:Math.floor(e.reward*0.2), color:'#3366aa', size:Math.floor(e.size*0.65),
            boss:false, ability:null, crown:null };
          spawnBoss(cloneDef);
          spawnFloat('🫀 Clone!',e.x,e.y-32,'#6699ff');
          spawnParticles(e.x,e.y,'#6699ff',14);
        }
      }
      if(e.ability==='lich'){
        // Lich: every 15s revives 3 random dead-ish enemies as ghost clones
        e.lichReviveTimer=(e.lichReviveTimer||0)+dt;
        if(e.lichReviveTimer>=15){
          e.lichReviveTimer=0;
          let revived=0;
          for(let i=0;i<3&&revived<3;i++){
            const ghostDef={ name:'Fantasma', hp:400*(state.wave/WAVES.length), speed:60,
              reward:10, color:'#aaeeff', size:14, boss:false, ability:null, crown:null };
            spawnBoss(ghostDef);
            revived++;
          }
          spawnFloat('🧊 Necromancia!',e.x,e.y-36,'#44ccee');
          spawnParticles(e.x,e.y,'#44ccee',16);
        }
      }
      if(e.ability==='titan'){
        // Yggdrasil: every 20s debuffs all towers with 60% slower attack for 5s
        e.titanTimer=(e.titanTimer||0)+dt;
        if(!e.titanDebuffActive && e.titanTimer>=20){
          e.titanDebuffActive=true; e.titanTimer=0;
          state.titanDebuff={ duration:5, timer:0 };
          state.towers.forEach(t=>{ t._savedRate=null; });
          spawnFloat('🌳 RAÍZES! Torres lentas!',e.x,e.y-40,'#44cc44');
          spawnParticles(e.x,e.y,'#228833',20);
        }
        if(e.titanDebuffActive){
          if(!state.titanDebuff) e.titanDebuffActive=false;
        }
      }
      if(e.ability==='enrage'){
        // Fera Sanguinária: dispara uma única vez ao cruzar 50% de HP.
        if(!e.enraged && e.hp <= e.maxHp*0.5){
          e.enraged = true;
          e.speed = e.speed * 1.6;
          spawnFloat('🩸 ENFURECIDO!', e.x, e.y-40, '#ff2222');
          spawnParticles(e.x, e.y, '#ff0000', 20);
        }
      }
      if(e.ability==='drain'){
        // Ceifador de Fortunas: rouba ouro do jogador periodicamente. A pressão
        // é econômica, não de combate — incentiva o jogador a focá-lo rápido.
        e.drainTimer=(e.drainTimer||0)+dt;
        if(e.drainTimer>=9){
          e.drainTimer=0;
          const stolen = Math.min(state.gold, Math.round(40 + state.wave*3));
          if (stolen > 0) {
            state.gold -= stolen;
            spawnFloat(`💰 -${stolen} roubado!`, e.x, e.y-40, '#ffdd00');
            spawnParticles(e.x, e.y, '#ffdd00', 16);
            updateHUD();
          } else {
            spawnFloat('💰 (sem ouro pra roubar)', e.x, e.y-40, '#888');
          }
        }
      }
      if(e.ability==='sukuna'){
        // Sukuna: every 10s domain expansion — deals flat damage to all towers in range
        e.sukunaDomainTimer=(e.sukunaDomainTimer||0)+dt;
        if(e.sukunaDomainTimer>=10){
          e.sukunaDomainTimer=0;
          const domainRange=180;
          let affected=0;
          state.towers.forEach(t=>{
            const dx=t.px-e.x,dy=t.py-e.y;
            if(Math.sqrt(dx*dx+dy*dy)<=domainRange){
              // "Damage" tower: stun it (freeze cd) for 2s
              t.sukunaStun=(t.sukunaStun||0)+2.5;
              affected++;
            }
          });
          if(affected>0){
            spawnFloat(`🔥 Domínio! ${affected} torres paralisadas!`,e.x,e.y-44,'#ff3333');
            spawnParticles(e.x,e.y,'#cc1111',25);
            spawnSplashRing(e.x,e.y,domainRange,'#ff3333');
          }
        }
      }
    }

    const tgt=PATH_PX[e.wpIdx];
    const dx=tgt.x-e.x, dy=tgt.y-e.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const step=e.speed*dt;
    if(dx!==0) e.facingDir = dx>0 ? 1 : -1;
    if(dist<=step){
      e.x=tgt.x; e.y=tgt.y; e.wpIdx++;
      if(e.wpIdx>=PATH_PX.length){
        e.reached=true;
        state.lives=Math.max(0,state.lives-(e.isBoss?5:1));
        updateHUD();
        sfxLifeLost();
        spawnParticles(e.x,e.y,'#ff4444',10);
        // Hardcore / Desafio: dramatic red flash on life lost
        if (state.gameMode==='hardcore'||state.gameMode==='desafio') {
          const fl=document.createElement('div');
          fl.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:8888;background:rgba(255,0,0,.3);animation:arcFlash .45s ease forwards;';
          document.body.appendChild(fl); setTimeout(()=>fl.remove(),500);
        }
        checkGameOver();
      }
    } else {
      e.x+=dx/dist*step; e.y+=dy/dist*step;
    }
  });
  state.enemies=state.enemies.filter(e=>!e.dead&&!e.reached);
}

// Predicts where a target enemy will be by the time a slow mortar shell
// arrives, by walking it forward along its remaining waypoints for the
// shell's estimated travel time. Falls back to the enemy's current spot
// if it reaches the end of the path before the shell lands.
function predictMortarLandingSpot(enemy, tower, projectileSpeed) {
  const dx0 = enemy.x - tower.px, dy0 = enemy.y - tower.py;
  const dist0 = Math.sqrt(dx0*dx0 + dy0*dy0);
  let travelTime = dist0 / Math.max(1, projectileSpeed);
  travelTime = Math.min(travelTime, 2.5); // safety cap

  let x = enemy.x, y = enemy.y;
  let wpIdx = enemy.wpIdx;
  let remaining = enemy.speed * travelTime;

  while (remaining > 0 && wpIdx < PATH_PX.length) {
    const wp = PATH_PX[wpIdx];
    const dx = wp.x - x, dy = wp.y - y;
    const segDist = Math.sqrt(dx*dx + dy*dy);
    if (segDist <= remaining) {
      x = wp.x; y = wp.y;
      remaining -= segDist;
      wpIdx++;
    } else {
      const ratio = segDist > 0 ? remaining / segDist : 0;
      x += dx * ratio; y += dy * ratio;
      remaining = 0;
    }
  }
  return {x, y};
}

// ===========================
//   SUMMONED UNITS (e.g. Arcturus's Solar Fragments)
// ===========================
const SUMMON_AGGRO_RANGE = 320;
const SUMMON_ATTACK_RANGE = 16;
const SUMMON_ATTACK_RATE = 1.3; // attacks per second

function updateSummons(dt) {
  for (let i = state.summons.length - 1; i >= 0; i--) {
    const u = state.summons[i];
    if (u.dead) { state.summons.splice(i, 1); continue; }

    u.animTime = (u.animTime || 0) + dt;
    u.lifespan -= dt;
    if (u.lifespan <= 0) {
      spawnParticles(u.x, u.y, '#ffaa00', 8);
      state.summons.splice(i, 1);
      continue;
    }

    // Re-acquire target if dead/reached/missing
    if (!u.target || u.target.dead || u.target.reached) {
      let best = null, bestDist = SUMMON_AGGRO_RANGE;
      state.enemies.forEach(e => {
        if (e.dead || e.reached) return;
        const dx = e.x - u.x, dy = e.y - u.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d <= bestDist) { bestDist = d; best = e; }
      });
      u.target = best;
    }

    if (u.target) {
      const dx = u.target.x - u.x, dy = u.target.y - u.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > SUMMON_ATTACK_RANGE) {
        // Walk toward target
        const step = u.speed * dt;
        u.x += (dx/dist) * step;
        u.y += (dy/dist) * step;
      } else {
        // Attack
        u.cd = (u.cd || 0) - dt;
        if (u.cd <= 0) {
          u.cd = 1 / SUMMON_ATTACK_RATE;
          damageEnemy(u.target, u.dmg);
          spawnParticles(u.target.x, u.target.y, '#ffaa44', 3);
        }
      }
    }
  }
}

function drawSummons() {
  state.summons.forEach(u => {
    if (u.type === 'solarFragment') drawSolarFragment(u);
  });
}

function drawSolarFragment(u) {
  const t = u.animTime || 0;
  const lifeRatio = Math.max(0, Math.min(1, u.lifespan / 4)); // fade out in the last ~4s
  const r = 7 + Math.sin(t*6)*1.2;

  ctx.save();
  ctx.globalAlpha = lifeRatio < 1 ? lifeRatio : 1;

  // Glow
  const grad = ctx.createRadialGradient(u.x, u.y, 1, u.x, u.y, r*2.2);
  grad.addColorStop(0, '#ffee99');
  grad.addColorStop(0.5, '#ffaa00aa');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(u.x, u.y, r*2.2, 0, Math.PI*2); ctx.fill();

  // Core
  ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffcc44';
  ctx.beginPath(); ctx.arc(u.x, u.y, r, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  // Small flickering rays
  for (let i = 0; i < 4; i++) {
    const angle = (i/4)*Math.PI*2 + t*3;
    const len = 3 + Math.sin(t*8+i)*1.5;
    ctx.strokeStyle = '#ffee88'; ctx.lineWidth = 1.2; ctx.globalAlpha = (lifeRatio<1?lifeRatio:1) * 0.7;
    ctx.beginPath();
    ctx.moveTo(u.x + Math.cos(angle)*r, u.y + Math.sin(angle)*r);
    ctx.lineTo(u.x + Math.cos(angle)*(r+len), u.y + Math.sin(angle)*(r+len));
    ctx.stroke();
  }

  // HP bar (only if damaged)
  if (u.hp < u.maxHp) {
    const w = 18, h = 3;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#222';
    ctx.fillRect(u.x - w/2, u.y - r - 9, w, h);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(u.x - w/2, u.y - r - 9, w * Math.max(0, u.hp/u.maxHp), h);
  }

  ctx.restore();
}

function fireTowers(dt) {
  // Update titan root debuff
  if(state.titanDebuff){
    state.titanDebuff.timer+=dt;
    if(state.titanDebuff.timer>=state.titanDebuff.duration){
      state.titanDebuff=null;
      spawnFloat('🌳 Raízes acabaram!',canvas.width/2,60,'#44cc44');
    }
  }

  state.towers.forEach(tower => {
    const stats=getTowerStats(tower);
    if (tower.type === 'farmer' || tower.type === 'hypefarmer') return; // passive, no combat

    // Sukuna domain stun
    if(tower.sukunaStun>0){
      tower.sukunaStun=Math.max(0,tower.sukunaStun-dt);
      return; // tower is paralyzed
    }

    // ===== ARCTURUS timers run unconditionally (even when cd > 0 or no target) =====
    if (tower.type === 'arcturus') {
      const arcStats = getTowerStats(tower);
      tower.arcSummonTimer = (tower.arcSummonTimer || 0) - dt;
      if (tower.arcSummonTimer <= 0) {
        tower.arcSummonTimer = arcStats.summonInterval;
        summonSolarFragments(tower, arcStats);
      }
      tower.arcNovaTimer = (tower.arcNovaTimer || 0) - dt;
      if (tower.arcNovaTimer <= 0) {
        tower.arcNovaTimer = arcStats.novaCooldown;
        triggerSolarNova(tower, arcStats);
      }
      tower.arcNovaFlashTimer = Math.max(0, (tower.arcNovaFlashTimer||0) - dt);
    }

    // Titan root debuff slows towers; Hype Farmer's buff speeds them up.
    // Both modify the cooldown countdown rate, so they stack naturally.
    let cdRate = state.titanDebuff ? 0.4 : 1.0;
    if (state.hypeBuff) cdRate *= 1.6;
    tower.cd=Math.max(0,(tower.cd||0)-dt*cdRate);
    if(tower.cd>0) return;

    // ===== SATORU GOJO — 3 técnicas =====
    if (tower.type === 'gojo') {
      fireGojoTower(tower, stats);
      return;
    }

    // ===== ARCTURUS — Ciclo Térmico =====
    if (tower.type === 'arcturus') {
      fireArcturusTower(tower, stats, dt);
      return;
    }

    // ===== ARPÃO — perfura em linha reta =====
    if (tower.type === 'perfurador') {
      let target=null, bestProg=-1;
      state.enemies.forEach(e=>{
        if(e.dead||e.reached) return;
        const dx=e.x-tower.px, dy=e.y-tower.py;
        if(Math.sqrt(dx*dx+dy*dy)<=stats.range){
          if(e.wpIdx>bestProg){ bestProg=e.wpIdx; target=e; }
        }
      });
      if(!target) return;
      tower.cd=1/stats.rate; tower.firing=0.2; tower.attackPhase=1;
      playShotSfx('perfurador');
      // Raio da torre através do alvo, estendido até o alcance máximo.
      const dx=target.x-tower.px, dy=target.y-tower.py;
      const dist=Math.sqrt(dx*dx+dy*dy)||1;
      const ux=dx/dist, uy=dy/dist;
      const endX=tower.px+ux*stats.range, endY=tower.py+uy*stats.range;
      const corridor=16; // meia-largura da "linha" do arpão, em px
      const hits=[];
      state.enemies.forEach(e=>{
        if(e.dead||e.reached) return;
        const ex=e.x-tower.px, ey=e.y-tower.py;
        const proj=ex*ux+ey*uy; // distância ao longo do raio
        if(proj<0||proj>stats.range+e.size) return;
        const perp=Math.abs(ex*uy-ey*ux); // distância perpendicular ao raio
        if(perp<=corridor+e.size*0.5) hits.push({e,proj});
      });
      hits.sort((a,b)=>a.proj-b.proj);
      const maxHits=stats.pierceCount||3;
      // REBALANCEAMENTO (nerf gigante): antes cada alvo perfurado recebia
      // 100% do dano, sem nenhuma queda — com pierceCount:5 no nível 3
      // (dmg 95, rate 1.15), 5 inimigos alinhados no corredor levavam
      // 95 cada, dps efetivo somado ~546/870 ouro = 0.628, o maior ratio
      // dps/ouro do jogo (mais que Tesla 0.534 e Nêmesis). Agora usa a
      // MESMA curva de queda que a corrente da Tesla (doChainLightning:
      // 1º alvo 100%, 2º 60%, do 3º em diante 70% do anterior), já que os
      // dois são mecânicas de multi-alvo por tiro e deviam seguir a mesma
      // régua. Dano no 1º alvo (o caso normal, 1 inimigo) não muda nada;
      // só o "melhor caso" de linha cheia cai (~546 → ~275 dps no nível 3).
      let pierceDmg = stats.dmg;
      hits.slice(0,maxHits).forEach((h,i)=>{
        if(i===1) pierceDmg *= 0.6;
        else if(i>1) pierceDmg *= 0.7;
        damageEnemy(h.e,pierceDmg);
      });
      // Projétil é só visual — o dano já foi resolvido na hora (evita ter que
      // simular colisão de um projétil que atravessa vários alvos, quadro a quadro).
      state.projectiles.push({
        x:tower.px,y:tower.py, tx:endX,ty:endY, target:null,
        speed:stats.projectileSpeed, damage:0, splash:0,
        color:stats.projectileColor, size:stats.projectileSize, dead:false,
        isPierceBolt:true,
      });
      spawnParticles(tower.px,tower.py,stats.color,6);
      return;
    }

    // ===== PRISMA — multi-alvo simultâneo =====
    if (tower.type === 'prisma') {
      const candidates=[];
      state.enemies.forEach(e=>{
        if(e.dead||e.reached) return;
        const dx=e.x-tower.px, dy=e.y-tower.py;
        if(Math.sqrt(dx*dx+dy*dy)<=stats.range) candidates.push(e);
      });
      if(candidates.length===0) return;
      candidates.sort((a,b)=>b.wpIdx-a.wpIdx); // prioriza os mais avançados
      const count=Math.min(stats.multiShotCount||2, candidates.length);
      tower.cd=1/stats.rate; tower.firing=0.2; tower.attackPhase=1;
      playShotSfx('prisma');
      for(let i=0;i<count;i++){
        const target=candidates[i];
        state.projectiles.push({
          x:tower.px,y:tower.py, tx:target.x,ty:target.y, target,
          speed:stats.projectileSpeed, damage:stats.dmg, splash:0,
          color:stats.projectileColor, size:stats.projectileSize, dead:false,
        });
      }
      spawnParticles(tower.px,tower.py,stats.color,8);
      return;
    }

    if(tower.type==='gladiator'){
      let hit=false;
      state.enemies.forEach(e=>{
        if(e.dead||e.reached) return;
        const dx=e.x-tower.px, dy=e.y-tower.py;
        if(Math.sqrt(dx*dx+dy*dy)<=stats.range){ damageEnemy(e, stats.dmg); hit=true; }
      });
      if(hit){
        tower.cd=1/stats.rate;
        tower.firing=0.22;
        tower.attackPhase = 1; // swing forward
        playShotSfx('gladiator');
        spawnSplashRing(tower.px,tower.py,stats.range,stats.glow);
        spawnParticles(tower.px,tower.py,stats.color,6);
      } else {
        tower.cd=0.25;
      }
      return;
    }

    let target=null, bestProg=-1;
    state.enemies.forEach(e=>{
      if(e.dead||e.reached) return;
      const dx=e.x-tower.px, dy=e.y-tower.py;
      if(Math.sqrt(dx*dx+dy*dy)<=stats.range){
        const prog=e.wpIdx;
        if(prog>bestProg){ bestProg=prog; target=e; }
      }
    });
    if(!target) return;

    tower.cd=1/stats.rate;
    tower.firing=0.18;
    tower.attackPhase = 1;
    if (stats.dmg > 0) playShotSfx(tower.type);

    // Mortar: still targets the most-advanced enemy in range, but its
    // shell is slow, so it predicts where the enemy will be when the
    // shell lands instead of aiming at its current position.
    let projTx = target.x, projTy = target.y;
    if (stats.isMortar) {
      const predicted = predictMortarLandingSpot(target, tower, stats.projectileSpeed);
      projTx = predicted.x; projTy = predicted.y;
    }

    state.projectiles.push({
      x:tower.px,y:tower.py,
      tx:projTx, ty:projTy,
      target: stats.isMortar ? null : target,
      speed:stats.projectileSpeed,
      damage:stats.dmg,
      splash:stats.splash,
      color:stats.projectileColor,
      size:stats.projectileSize,
      dead:false,
      isChain: stats.isChain || false, chainRange: stats.chainRange||0, chainCount: stats.chainCount||0,
      isFreeze: stats.isFreeze || false, freezeDuration: stats.freezeDuration||0, freezeStrength: stats.freezeStrength||0,
      isPoison: stats.isPoison || false, poisonDps: stats.poisonDps||0, poisonDuration: stats.poisonDuration||0,
      isVuln: stats.isVuln || false, vulnMult: stats.vulnMult||1, vulnDuration: stats.vulnDuration||0,
      isKnockback: stats.isKnockback || false,
      isMortar: stats.isMortar || false,
    });
  });
  state.towers.forEach(t=>{
    if(t.firing>0){
      t.firing=Math.max(0,t.firing-dt);
      if(t.firing===0) t.attackPhase=0;
    }
  });
}

function moveProjectiles(dt) {
  state.projectiles.forEach(p=>{
    if(p.dead) return;
    if(p.target&&!p.target.dead&&!p.target.reached){ p.tx=p.target.x; p.ty=p.target.y; }
    const dx=p.tx-p.x, dy=p.ty-p.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const step=p.speed*dt;
    if(dist<=step+2){
      // Arcturus handles its own collision — skip normal logic
      if (p.isArcturus) {
        resolveArcturusHit(p);
        return; // handled
      }
      if(p.splash>0){
        state.enemies.forEach(e=>{
          if(e.dead||e.reached) return;
          const ddx=e.x-p.tx, ddy=e.y-p.ty;
          if(Math.sqrt(ddx*ddx+ddy*ddy)<=p.splash) {
            damageEnemy(e,p.damage);
            if(p.isFreeze) applyFreeze(e, p.freezeDuration, p.freezeStrength);
            if(p.isPoison) applyPoison(e, p.poisonDps, p.poisonDuration);
            if(p.isVuln)   applyVulnerable(e, p.vulnMult, p.vulnDuration);
            if(p.isKnockback) applyKnockback(e);
          }
        });
        spawnParticles(p.tx,p.ty,p.color,16);
        spawnSplashRing(p.tx,p.ty,p.splash,p.color);
        // Mortar: extra dust ring to sell the "artillery strike" feel
        if (p.isMortar) {
          spawnSplashRing(p.tx, p.ty, p.splash * 0.6, '#3a3a3a');
          spawnParticles(p.tx, p.ty, '#5a5040', 10);
        }
        // Gojo purple: extra massive explosion
        if (p.isGojo && p.gojoType === 'purple') {
          spawnGojoRing(p.tx, p.ty, p.splash * 1.4, '#ff00ff', 0.6);
          spawnGojoRing(p.tx, p.ty, p.splash * 0.7, '#ffffff', 0.4);
          spawnParticles(p.tx, p.ty, '#ff00ff', 30);
          spawnParticles(p.tx, p.ty, '#ffffff', 15);
          spawnFloat('紫 Hollow Purple!', p.tx, p.ty - 40, '#ff00ff');
        }
      } else {
        if(p.target&&!p.target.dead&&!p.target.reached) {
          damageEnemy(p.target,p.damage);
          if(p.isFreeze)   applyFreeze(p.target, p.freezeDuration, p.freezeStrength);
          if(p.isPoison)   applyPoison(p.target, p.poisonDps, p.poisonDuration);
          if(p.isVuln)     applyVulnerable(p.target, p.vulnMult, p.vulnDuration);
          if(p.isKnockback) applyKnockback(p.target);
          // Chain lightning (propaga poison/vuln para cada salto também,
          // não só no alvo inicial — necessário pra Nêmesis, que combina
          // isChain+isPoison; Tesla, que só usa isChain, não é afetada)
          if(p.isChain && p.chainCount > 0) {
            const chainFx = p.isPoison ? {poisonDps:p.poisonDps, poisonDuration:p.poisonDuration}
                           : p.isVuln  ? {vulnMult:p.vulnMult, vulnDuration:p.vulnDuration}
                           : null;
            doChainLightning(p.target, p.damage*0.6, p.chainRange, p.chainCount-1, p.color, [p.target], chainFx);
          }
        }
        spawnParticles(p.tx,p.ty,p.color,6);
        // Gojo blue void: implosion effect
        if (p.isGojo && p.gojoType === 'blue') {
          spawnGojoRing(p.tx, p.ty, p.splash, '#4488ff', 0.45);
          spawnParticles(p.tx, p.ty, '#4488ff', 18);
          spawnFloat('蒼 Vazio Azul', p.tx, p.ty - 28, '#88aaff');
        }
      }
      // Normal projectile cleanup
      p.dead=true;
    } else {
      p.x+=dx/dist*step; p.y+=dy/dist*step;
    }
  });
  state.projectiles=state.projectiles.filter(p=>!p.dead);
}

function doChainLightning(fromEnemy, dmg, range, jumpsLeft, color, hit, statusFx) {
  if (jumpsLeft <= 0) return;
  let next = null, bestDist = range;
  state.enemies.forEach(e => {
    if (e.dead || e.reached || hit.includes(e)) return;
    const dx = e.x - fromEnemy.x, dy = e.y - fromEnemy.y;
    const d = Math.sqrt(dx*dx+dy*dy);
    if (d < bestDist) { bestDist = d; next = e; }
  });
  if (!next) return;
  damageEnemy(next, dmg);
  if (statusFx) {
    if (statusFx.poisonDps) applyPoison(next, statusFx.poisonDps, statusFx.poisonDuration);
    if (statusFx.vulnMult)  applyVulnerable(next, statusFx.vulnMult, statusFx.vulnDuration);
  }
  spawnParticles(next.x, next.y, color, 5);
  // draw lightning bolt as particles along the path
  for (let i = 0; i < 5; i++) {
    const t = i/4;
    const jx = fromEnemy.x + (next.x-fromEnemy.x)*t + (Math.random()-0.5)*12;
    const jy = fromEnemy.y + (next.y-fromEnemy.y)*t + (Math.random()-0.5)*12;
    state.particles.push({x:jx,y:jy,vx:0,vy:0,life:0.18,maxLife:0.18,color,size:3});
  }
  doChainLightning(next, dmg*0.7, range, jumpsLeft-1, color, [...hit, next], statusFx);
}

// ─── ARCTURUS HELPERS ───────────────────────────────────────────
// Arcturus overcharge screen flash
function triggerArcturusFlash() {
  // CORREÇÃO DE BUG: procurava 'gameCanvas' (não existe); o id real é
  // 'game-canvas'. Isso fazia o flash de sobrecarga nunca aparecer.
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;'+'background:radial-gradient(ellipse at center,rgba(255,80,0,.35),rgba(255,40,0,.12),transparent);'+'animation:arcFlash .5s ease forwards;';
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 600);
}

// Cinemática única de chegada: dispara só uma vez, no instante em que um
// Arcturus é fisicamente colocado no mapa (ver o clique de posicionamento).
// Diferente do triggerArcturusFlash (pulso pequeno e recorrente da
// sobrecarga), este é o "momento" grande e único — banner de tela cheia via
// DOM (CSS puro, sem imagens) + reforço de partículas no ponto da torre.
// Não pausa o jogo de propósito: mais simples e sem risco de conflitar com
// o overlay padrão de pausa (drawPauseOverlay).
function triggerArcturusEntrance(px, py) {
  const overlay = document.createElement('div');
  overlay.className = 'arc-entrance-overlay';
  overlay.innerHTML =
    '<div class="arc-entrance-rays"></div>' +
    '<div class="arc-entrance-text">☀️ A ESTRELA ABSOLUTA CHEGOU ☀️' +
      '<span class="arc-entrance-sub">O campo de batalha nunca mais será o mesmo.</span>' +
    '</div>';
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2900);

  spawnGojoRing(px, py, 40,  '#ffffff', 0.9);
  spawnGojoRing(px, py, 90,  '#ffcc44', 0.8);
  spawnGojoRing(px, py, 150, '#ff8800', 0.7);
  spawnParticles(px, py, '#ffffff', 30);
  spawnParticles(px, py, '#ffaa00', 24);
  spawnFloat('☀️ ARCTURUS DESPERTOU', px, py - 50, '#ffdd88');
  triggerArcturusFlash();
  SFX.arcturusArrival();
}

function applyBurn(e, dps, duration) {
  e.burning = true;
  e.burnDps = Math.max(e.burnDps || 0, dps);
  e.burnTimer = duration;
}

function arcturusSplashBurn(cx, cy, radius, dmg, burnDps, burnDur) {
  state.enemies.forEach(e => {
    if (e.dead || e.reached) return;
    const dx = e.x - cx, dy = e.y - cy;
    if (Math.sqrt(dx*dx+dy*dy) <= radius) {
      damageEnemy(e, dmg);
      applyBurn(e, burnDps, burnDur);
    }
  });
}

// Spawns 1-2 Solar Fragments next to the Arcturus tower. Fragments are
// melee mini-units that walk toward the nearest enemy and burn it down,
// then fizzle out after their lifespan ends.
function summonSolarFragments(tower, stats) {
  const count = stats.summonCount || 1;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random()*0.6;
    const dist = TILE * 0.55;
    state.summons.push({
      type: 'solarFragment',
      x: tower.px + Math.cos(angle)*dist,
      y: tower.py + Math.sin(angle)*dist,
      hp: stats.summonHp, maxHp: stats.summonHp,
      dmg: stats.summonDmg,
      speed: 70,
      lifespan: stats.summonLifespan,
      cd: 0,
      target: null,
      animTime: 0,
      dead: false,
    });
  }
  spawnParticles(tower.px, tower.py, '#ffcc44', 10);
  spawnGojoRing(tower.px, tower.py, TILE*0.7, '#ffaa00', 0.35);
}

// Solar Nova: a big, occasional AoE blast centered on the tower itself.
// Hits and burns every enemy within novaRadius — Arcturus's signature
// "ultimate" attack, separate from its normal shots and overcharge.
function triggerSolarNova(tower, stats) {
  arcturusSplashBurn(tower.px, tower.py, stats.novaRadius, stats.novaDmg, stats.burnDps*1.5, stats.burnDur);
  spawnFloat('☀️ NOVA SOLAR!', tower.px, tower.py - 46, '#fff2cc');
  spawnGojoRing(tower.px, tower.py, stats.novaRadius, '#ffffff', 0.7);
  spawnGojoRing(tower.px, tower.py, stats.novaRadius*0.6, '#ffcc44', 0.55);
  spawnGojoRing(tower.px, tower.py, stats.novaRadius*0.3, '#ff8800', 0.4);
  spawnParticles(tower.px, tower.py, '#ffffff', 26);
  spawnParticles(tower.px, tower.py, '#ffaa00', 18);
  triggerArcturusFlash();
  tower.arcNovaFlashTimer = 0.5; // for the tower's own visual pulse
}

function fireArcturusTower(tower, stats, dt) {
  // ── Stabilisation cooldown after overcharge ──
  if (tower.arcStabilising) {
    tower.arcStabilTimer = (tower.arcStabilTimer || 0) - dt;
    if (tower.arcStabilTimer <= 0) {
      tower.arcStabilising = false;
      tower.arcCharges = 0;
      spawnFloat('☀️ Estabilizado!', tower.px, tower.py - 36, '#ffcc44');
      spawnGojoRing(tower.px, tower.py, 60, '#ffaa00', 0.5);
    }
    // Still attacks normally during stabilisation (just no overcharge)
  }

  // ── Overcharge active ──
  if (tower.arcOvercharging) {
    tower.arcOverTimer = (tower.arcOverTimer || 0) - dt;
    if (tower.arcOverTimer <= 0) {
      // End overcharge → start stabilisation
      tower.arcOvercharging = false;
      tower.arcStabilising  = true;
      tower.arcStabilTimer  = stats.stabilizeDuration || 60;
      tower.arcCharges = 0;
      spawnFloat('⛔ Estabilizando...', tower.px, tower.py - 36, '#ff6644');
    }
    // Overcharge attack
    tower.cd = Math.max(0, (tower.cd || 0) - dt);
    if (tower.cd > 0) return;
    // Find target
    let target = null, bestProg = -1;
    state.enemies.forEach(e => {
      if (e.dead || e.reached) return;
      const dx = e.x - tower.px, dy = e.y - tower.py;
      if (Math.sqrt(dx*dx+dy*dy) <= stats.range + 30) {
        if (e.wpIdx > bestProg) { bestProg = e.wpIdx; target = e; }
      }
    });
    if (!target) return;
    tower.cd = 1 / stats.overRate;
    tower.firing = 0.3;
    playShotSfx('arcturusOver');
    // Overcharge projectile (bigger, slower, more damage)
    state.projectiles.push({
      x: tower.px, y: tower.py,
      tx: target.x, ty: target.y,
      target,
      speed: stats.projectileSpeed * 0.75,
      damage: stats.overDmg,
      splash: stats.overSplash,
      color: '#ff4400',
      size: stats.projectileSize * 1.7,
      dead: false,
      isArcturus: true, arcOvercharge: true,
      burnDps: stats.overBurnDps, burnDur: stats.overBurnDur,
    });
    spawnParticles(tower.px, tower.py, '#ff4400', 10);
    return;
  }

  // ── Normal attack ──
  tower.cd = Math.max(0, (tower.cd || 0) - dt);
  if (tower.cd > 0) return;
  let target = null, bestProg = -1;
  state.enemies.forEach(e => {
    if (e.dead || e.reached) return;
    const dx = e.x - tower.px, dy = e.y - tower.py;
    if (Math.sqrt(dx*dx+dy*dy) <= stats.range) {
      if (e.wpIdx > bestProg) { bestProg = e.wpIdx; target = e; }
    }
  });
  if (!target) return;

  tower.cd = 1 / stats.rate;
  tower.firing = 0.18;
  tower.arcCharges = (tower.arcCharges || 0) + 1;
  playShotSfx('arcturus');

  state.projectiles.push({
    x: tower.px, y: tower.py,
    tx: target.x, ty: target.y,
    target,
    speed: stats.projectileSpeed,
    damage: stats.dmg,
    splash: stats.splash,
    color: stats.projectileColor,
    size: stats.projectileSize,
    dead: false,
    isArcturus: true, arcOvercharge: false,
    burnDps: stats.burnDps, burnDur: stats.burnDur,
  });
  spawnParticles(tower.px, tower.py, '#ffaa44', 4);

  // REWORK: o limiar de sobrecarga e o tempo de estabilização agora
  // escalam por nível (stats.overChargeThreshold/stabilizeDuration) —
  // antes eram sempre fixos em 30 tiros / 60s, mesmo no nível máximo.
  const threshold = stats.overChargeThreshold || 30;
  const warnEvery = Math.max(4, Math.round(threshold / 3));

  // A cada ~1/3 do limiar: aviso visual de pulso
  if (tower.arcCharges % warnEvery === 0 && tower.arcCharges < threshold) {
    const remaining = threshold - tower.arcCharges;
    spawnFloat(`☀️ ${remaining} até sobrecarga`, tower.px, tower.py - 30, '#ffcc44');
    spawnGojoRing(tower.px, tower.py, stats.range * 0.4, '#ff8800', 0.3);
  }

  // ── Trigger overcharge ao atingir o limiar do nível ──
  if (tower.arcCharges >= threshold && !tower.arcStabilising) {
    tower.arcOvercharging = true;
    tower.arcOverTimer    = stats.overDur;
    tower.arcCharges      = 0;
    spawnFloat('🔥 SOBRECARGA!', tower.px, tower.py - 42, '#ff4400');
    spawnGojoRing(tower.px, tower.py, stats.range, '#ff8800', 0.6);
    spawnGojoRing(tower.px, tower.py, stats.overSplash, '#ff4400', 0.45);
    spawnParticles(tower.px, tower.py, '#ff4400', 20);
    // Screen flash
    triggerArcturusFlash();
  }
}

// Handle Arcturus projectile hits (called from moveProjectiles)
function resolveArcturusHit(p) {
  if (p.splash > 0) {
    state.enemies.forEach(e => {
      if (e.dead || e.reached) return;
      const dx = e.x - p.tx, dy = e.y - p.ty;
      if (Math.sqrt(dx*dx+dy*dy) <= p.splash) {
        damageEnemy(e, p.damage);
        applyBurn(e, p.burnDps, p.burnDur);
      }
    });
    spawnParticles(p.tx, p.ty, p.color, p.arcOvercharge ? 18 : 8);
    spawnSplashRing(p.tx, p.ty, p.splash, p.color);
    if (p.arcOvercharge) {
      spawnGojoRing(p.tx, p.ty, p.splash, '#ff6600', 0.55);
      spawnGojoRing(p.tx, p.ty, p.splash * 0.55, '#ffcc00', 0.4);
      spawnFloat('💥 Impacto Solar!', p.tx, p.ty - 32, '#ff8800');
    }
  } else {
    if (p.target && !p.target.dead && !p.target.reached) {
      damageEnemy(p.target, p.damage);
      applyBurn(p.target, p.burnDps, p.burnDur);
    }
    spawnParticles(p.tx, p.ty, p.color, 6);
  }
  p.dead = true;
}

function applyFreeze(e, duration, strength) {
  e.frozen = true;
  e.frozenTimer = duration;
  e.frozenStrength = strength;
  e.baseSpeed = e.baseSpeed || e.speed;
  e.speed = Math.floor(e.baseSpeed * (1 - strength));
}

function applyPoison(e, dps, duration) {
  e.poisoned = true;
  e.poisonDps = Math.max(e.poisonDps || 0, dps);
  e.poisonTimer = duration;
}

// Corrosivo: marca o alvo como "Vulnerável" — todo dano que ele receber (de
// qualquer torre) é multiplicado por vulnMult enquanto durar. Reaplicar apenas
// atualiza para o multiplicador mais forte e reinicia a duração (não empilha).
function applyVulnerable(e, mult, duration) {
  e.vulnerable = true;
  e.vulnMult = Math.max(e.vulnMult || 1, mult);
  e.vulnTimer = duration;
}

function applyKnockback(e) {
  // Push enemy back along path
  if (e.wpIdx > 1) {
    const prev = PATH_PX[e.wpIdx - 1];
    e.x = (e.x + prev.x) / 2;
    e.y = (e.y + prev.y) / 2;
  }
}

// ===========================
//   GOJO SATORU — 3 TÉCNICAS
// ===========================
function fireGojoTower(tower, stats) {
  const technique = stats.technique || 'infinity';
  const enemies = state.enemies.filter(e => !e.dead && !e.reached);

  // Find closest/best target in range
  let target = null, bestProg = -1;
  enemies.forEach(e => {
    const dx = e.x - tower.px, dy = e.y - tower.py;
    if (Math.sqrt(dx*dx+dy*dy) <= stats.range) {
      if (e.wpIdx > bestProg) { bestProg = e.wpIdx; target = e; }
    }
  });

  if (!target && technique !== 'purple') { tower.cd = 0.25; return; }
  if (!target && technique === 'purple') { tower.cd = 0.5; return; }

  if (technique === 'infinity') {
    // Lv1: Infinidade — área em torno do Gojo, dano direto
    let hit = false;
    enemies.forEach(e => {
      const dx = e.x - tower.px, dy = e.y - tower.py;
      if (Math.sqrt(dx*dx+dy*dy) <= stats.range) {
        damageEnemy(e, stats.dmg);
        hit = true;
      }
    });
    if (!hit) { tower.cd = 0.3; tower.firing = 0; return; }
    tower.cd = 1 / stats.rate;
    tower.firing = 0.3;
    playShotSfx('gojoInfinity');
    // Infinity ring burst
    spawnGojoRing(tower.px, tower.py, stats.range, '#7b2fff', 0.4);
    spawnParticles(tower.px, tower.py, '#b07aff', 12);
    spawnFloat('∞ Infinidade', tower.px, tower.py - 28, '#cc88ff');

  } else if (technique === 'blue') {
    // Lv2: Vazio Azul — projétil poderoso que implode no alvo
    if (!target) { tower.cd = 0.25; return; }
    tower.cd = 1 / stats.rate;
    tower.firing = 0.28;
    tower.lastTechnique = technique;
    playShotSfx('gojoBlue');
    state.projectiles.push({
      x: tower.px, y: tower.py,
      tx: target.x, ty: target.y,
      target,
      speed: 380,
      damage: stats.dmg,
      splash: stats.splash,
      color: '#4488ff',
      size: 14,
      dead: false,
      isGojo: true, gojoType: 'blue',
    });
    spawnParticles(tower.px, tower.py, '#4488ff', 8);

  } else if (technique === 'purple') {
    // Lv3: Expansão Máxima — precisa ter pelo menos 1 inimigo no mapa
    const anyEnemy = state.enemies.find(e => !e.dead && !e.reached);
    if (!anyEnemy) { tower.cd = 0.5; return; }
    tower.cd = 1 / stats.rate;
    tower.firing = 0.7;
    tower.lastTechnique = technique;
    playShotSfx('gojoPurple');
    // Aim at densest cluster of enemies on the path
    let bestWpIdx = Math.floor(PATH_PX.length * 0.5);
    const counts = new Array(PATH_PX.length).fill(0);
    state.enemies.forEach(e => { if (!e.dead && !e.reached) counts[Math.min(e.wpIdx, PATH_PX.length-1)]++; });
    let maxCount = 0;
    counts.forEach((c, i) => { if (c > maxCount) { maxCount = c; bestWpIdx = i; } });
    const aimWp = PATH_PX[bestWpIdx];
    state.projectiles.push({
      x: tower.px, y: tower.py,
      tx: aimWp.x, ty: aimWp.y,
      target: null,
      speed: 220,
      damage: stats.dmg,
      splash: stats.splash,
      color: '#cc00ff',
      size: 22,
      dead: false,
      isGojo: true, gojoType: 'purple',
      purpleTrail: [],
    });
    spawnGojoRing(tower.px, tower.py, 60, '#cc00ff', 0.5);
    spawnParticles(tower.px, tower.py, '#ff00ff', 20);
    spawnFloat('紫 Expansão Máxima!', tower.px, tower.py - 32, '#ff00ff');
  }
}

function spawnGojoRing(x, y, radius, color, duration) {
  state.particles.push({ x, y, vx:0, vy:0, life: duration, maxLife: duration, color, size: radius, ring: true, gojoRing: true });
}

function damageEnemy(e, rawDmg) {
  // Hollow Voidwalker: invulnerable during void phase
  if(e.voidActive) {
    spawnFloat('INTANGÍVEL',e.x,e.y-20,'#ff00ff');
    return;
  }
  let dmg=rawDmg;
  // Corrosivo: "Vulnerável" amplifica TODO dano recebido antes da redução de armadura,
  // então é a resposta direta a inimigos/chefes blindados (Cavaleiro Sombrio, Dragão de Ferro).
  if(e.vulnerable) dmg=dmg*(e.vulnMult||1);
  if(e.armorReduction) dmg=Math.floor(dmg*(1-e.armorReduction));
  if(e.shieldHp>0){
    const absorbed=Math.min(e.shieldHp,dmg);
    e.shieldHp-=absorbed; dmg-=absorbed;
    if(e.shieldHp<=0) spawnFloat('💔 Escudo!',e.x,e.y-28,'#aaccff');
    if(dmg<=0) return;
  }
  e.hp-=dmg; e.flashTimer=0.1;
  if(e.hp<=0){
    e.dead=true;
    state.gold+=e.reward; state.score+=e.reward;
    state.kills = (state.kills||0) + 1;
    if (e.isBoss) { state.bossKillsRun = (state.bossKillsRun||0) + 1; SFX.bossDown(); }
    spawnParticles(e.x,e.y,e.color,e.isBoss?30:10);
    if(e.isBoss) spawnParticles(e.x,e.y,'#ffdd00',20);
    spawnFloat(`+${e.reward}💰`,e.x,e.y-22,'#f5a623');
    if(e.isBoss) spawnFloat('BOSS MORTO!',e.x,e.y-50,'#ff4444');
    updateHUD();
  }
}

// Pays out every income-generating support tower at the end of a wave.
// Handles both the regular Fazendeiro and the Fazendeiro Hype (caixa-surpresa).
// investMult comes from the Investidor tower (1.0 if none placed).
function payFarmerIncome(investMult) {
  state.towers.forEach(t => {
    if (t.type !== 'farmer' && t.type !== 'hypefarmer') return;
    const baseIncome = getTowerStats(t).income || 0;
    const income = Math.round(baseIncome * investMult);
    state.gold += income;
    t.waveCount = (t.waveCount || 0) + 1;
    t.totalEarned = (t.totalEarned || 0) + income;

    const buffedLabel = investMult > 1 ? `+${income}💰 (x${investMult})` : `+${income}💰`;

    if (t.type === 'farmer') {
      spawnFloat(`🌾 ${buffedLabel}`, t.px, t.py - 24, '#f5c518');
    } else {
      // Hype Farmer: always pays gold, and on top of that has a chance
      // each wave to pop a surprise box with an extra random bonus.
      spawnFloat(`🎉 ${buffedLabel}`, t.px, t.py - 24, '#ff66cc');
      rollHypeFarmerBox(t);
    }
  });
}

// Hype Farmer's signature gimmick: every wave there's a chance she throws
// a confetti box that can contain bonus gold, a free gem, or (rarely) a
// short-lived global attack-speed hype buff for every tower on the map.
function rollHypeFarmerBox(tower) {
  const stats = getTowerStats(tower);
  const chance = stats.boxChance || 0.35;
  if (Math.random() > chance) return;

  const roll = Math.random();
  if (roll < 0.55) {
    // Bonus gold box
    const bonus = stats.boxGoldMin + Math.floor(Math.random() * (stats.boxGoldMax - stats.boxGoldMin + 1));
    state.gold += bonus;
    SFX.gold();
    spawnFloat(`🎁 +${bonus}💰 Bônus!`, tower.px, tower.py - 44, '#ffdd00');
    spawnParticles(tower.px, tower.py, '#ffdd00', 14);
  } else if (roll < 0.85) {
    // Gem box
    const persist = loadPersist();
    persist.gems = (persist.gems || 0) + 1;
    savePersist(persist);
    updateGemHUD();
    SFX.gem();
    spawnFloat('🎁 +1💎 Gema Surpresa!', tower.px, tower.py - 44, '#c77dff');
    spawnParticles(tower.px, tower.py, '#c77dff', 14);
  } else {
    // Rare hype buff: every tower on the map fires faster for a short time
    state.hypeBuff = { timer: stats.hypeBuffDuration || 8 };
    SFX.hypeBuff();
    spawnFloat('🎉 HYPE! Todas as torres turbinadas!', canvas.width / 2, canvas.height / 2 - 20, '#ff66cc');
    spawnParticles(tower.px, tower.py, '#ff66cc', 24);
  }
}

function checkWaveEnd() {
  if(!state.waveActive) return;
  if(state.spawnQueue.length===0&&state.enemies.length===0){
    state.waveActive=false;
    SFX.waveClear();
    if(state.wave>=WAVES.length && state.gameMode !== 'infinito'){
      // Enter infinite mode!
      state.gameMode = 'infinito';
      state.allWavesDone = false;
      state.wave++;
      const bonus = 200;
      state.gold += bonus;
      SFX.infiniteUnlock();
      spawnFloat('🌟 MODO INFINITO DESBLOQUEADO!', canvas.width/2, canvas.height/2 - 20, '#ffdd00');
      spawnFloat(`+${bonus}💰 Bônus de sobrevivência!`, canvas.width/2, canvas.height/2 + 20, '#f5a623');
      spawnParticles(canvas.width/2, canvas.height/2, '#ffdd00', 40);
      updateHUD();
      if (state.autoSkip) startWave();
    } else if(state.gameMode === 'infinito' && state.wave >= WAVES.length) {
      // Already in infinite mode — just increment and continue
      state.wave++;
      const bonus = 25 + state.wave * 8; // bigger bonus in infinite
      state.gold += bonus;
      spawnFloat(`+${bonus}💰 BÔNUS!`, canvas.width/2, canvas.height/2, '#f5a623');

      // Investidor multiplier
      const investor = state.towers.find(t => t.type === 'investidor');
      const investMult = investor
        ? (getTowerStats(investor).multiplier || 1.0)
        : 1.0;
      if (investor) {
        spawnFloat(
          `💼 x${investMult} nas fazendas!`,
          investor.px, investor.py - 28, '#44ff88'
        );
      }
      payFarmerIncome(investMult);
      // Gem reward every 5 waves
      if (state.wave % 5 === 1 && state.wave > 1) {
        const gemReward = state.wave <= 10 ? 1 : state.wave <= 20 ? 2 : 3;
        const persist = loadPersist();
        persist.gems = (persist.gems||0) + gemReward;
        savePersist(persist);
        updateGemHUD();
        SFX.gem();
        spawnFloat(`+${gemReward}💎 Gema!`, canvas.width/2, canvas.height/2 + 30, '#c77dff');
      }
      updateHUD();
      if (state.autoSkip) startWave();
    } else {
      // Normal waves < 30
      state.wave++;
      const bonus = 25 + state.wave * 6;
      state.gold += bonus;
      spawnFloat(`+${bonus}💰 BÔNUS!`, canvas.width/2, canvas.height/2, '#f5a623');

      // Investidor multiplier
      const investorN = state.towers.find(t => t.type === 'investidor');
      const investMultN = investorN ? (getTowerStats(investorN).multiplier || 1.0) : 1.0;
      if (investorN) spawnFloat(`💼 x${investMultN} nas fazendas!`, investorN.px, investorN.py - 28, '#44ff88');

      payFarmerIncome(investMultN);

      // Gem reward every 5 waves
      if (state.wave % 5 === 1 && state.wave > 1) {
        const gemReward = state.wave <= 10 ? 1 : state.wave <= 20 ? 2 : 3;
        const persist = loadPersist();
        persist.gems = (persist.gems||0) + gemReward;
        savePersist(persist);
        updateGemHUD();
        SFX.gem();
        spawnFloat(`+${gemReward}💎 Gema!`, canvas.width/2, canvas.height/2 + 30, '#c77dff');
      }

      updateHUD();
      if (state.autoSkip) startWave();
    }
    // Conquistas de wave são checadas ao vivo (não só no fim de jogo), assim o
    // jogador é avisado na hora que cruza um marco, mesmo em partidas longas.
    checkAchievements(loadPersist(), { wave: state.wave, gameMode: state.gameMode });
  }
}

function checkGameOver() {
  if(state.lives<=0) endGame(false);
}

function endGame(win) {
  state.running=false;
  const persist = loadPersist();
  // Gem bonus for hard modes
  if (win) {
    const mode = GAME_MODES[state.gameMode];
    if (mode && mode.gemBonus > 0) {
      persist.gems = (persist.gems||0) + mode.gemBonus;
      spawnFloat(`+${mode.gemBonus}💎 Bônus de Modo!`, canvas.width/2, canvas.height/2 - 40, '#c77dff');
    }
    persist.stats = persist.stats || {};
    persist.stats.victories = persist.stats.victories || {};
    persist.stats.victories[state.gameMode] = true;
  }
  // Progresso permanente (conquistas): soma os contadores desta partida e checa
  // o que foi desbloqueado, incluindo vitórias por modo checadas acima.
  mergeRunStatsIntoPersist(persist);
  savePersist(persist);
  updateGemHUD();
  checkAchievements(persist, { wave: state.wave, gameMode: state.gameMode });
  SFX[win ? 'victory' : 'defeat']();
  const title=document.getElementById('go-title');
  title.textContent=win?'VITÓRIA!':'DERROTA';
  title.className=win?'win':'lose';
  document.getElementById('go-msg').textContent=win?'Você sobreviveu a todas as ondas!':'Os inimigos venceram...';
  document.getElementById('go-waves').textContent=state.wave;
  document.getElementById('go-score').textContent=state.score;
  document.getElementById('go-spent').textContent=state.goldSpent;
  showScreen('gameover-screen');
}

// ===========================
//   PARTICLES & FX
// ===========================
function spawnParticles(x,y,color,count){
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2, s=30+Math.random()*90;
    state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.4+Math.random()*0.3,maxLife:0.7,color,size:2+Math.random()*4});
  }
}
function spawnSplashRing(x,y,radius,color){
  state.particles.push({x,y,vx:0,vy:0,life:0.35,maxLife:0.35,color,size:radius,ring:true});
}
function spawnFloat(text,x,y,color){
  state.floatTexts.push({text,x,y,color,life:1.2,maxLife:1.2});
}
function updateParticles(dt){
  state.particles.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;});
  state.particles=state.particles.filter(p=>p.life>0);
}
function updateFloatTexts(dt){
  state.floatTexts.forEach(f=>{f.life-=dt;f.y-=30*dt;});
  state.floatTexts=state.floatTexts.filter(f=>f.life>0);
}

// ===========================
//   DRAW
// ===========================
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMap();
  drawRanges();
  drawHoverPreview();
  drawTowers();
  drawEnemies();
  drawSummons();
  drawProjectiles();
  drawParticles();
  drawFloatTexts();
}

function drawPauseOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(13,15,26,0.55)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#f5a623';
  ctx.font = 'bold 32px Segoe UI, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 10;
  ctx.fillText('⏸ PAUSADO', canvas.width/2, canvas.height/2 - 10);
  ctx.font = '13px Segoe UI, Arial, sans-serif';
  ctx.fillStyle = '#8892b0';
  ctx.shadowBlur = 0;
  ctx.fillText('Pressione ESPAÇO ou clique no botão para continuar', canvas.width/2, canvas.height/2 + 20);
  ctx.restore();
}

// Draws a single water tile — reserved terrain for future aquatic
// towers/units. Animated gentle waves so it reads clearly as water,
// distinct from grass and path tiles.
function drawWaterTile(x, y, col, row) {
  const grad = ctx.createLinearGradient(x, y, x+TILE, y+TILE);
  grad.addColorStop(0, '#1a4d7a');
  grad.addColorStop(1, '#0d3358');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, TILE, TILE);

  // Wave ripples
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#4ea8d8';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 2; i++) {
    const offset = Math.sin(globalTime*1.4 + col*0.6 + row*0.4 + i*2) * 4;
    ctx.beginPath();
    ctx.moveTo(x+4, y+12+i*14+offset);
    ctx.quadraticCurveTo(x+TILE/2, y+8+i*14+offset, x+TILE-4, y+12+i*14+offset);
    ctx.stroke();
  }
  ctx.restore();

  // Surface sparkle
  const sparklePulse = 0.15 + Math.sin(globalTime*2 + col*1.3 + row*0.9) * 0.1;
  ctx.save();
  ctx.globalAlpha = Math.max(0, sparklePulse);
  ctx.fillStyle = '#aee6ff';
  ctx.beginPath();
  ctx.arc(x+TILE*0.65, y+TILE*0.35, 2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawMap() {
  const c = activeMap.colors;

  for(let row=0;row<MAP_ROWS;row++){
    for(let col=0;col<MAP_COLS;col++){
      const x=col*TILE, y=row*TILE;
      const isPath=PATH_SET.has(`${col},${row}`);
      const isWater=WATER_SET.has(`${col},${row}`);
      if(isWater){
        drawWaterTile(x,y,col,row);
      } else if(isPath){
        ctx.fillStyle=(col+row)%2===0 ? c.pathA : c.pathB;
        ctx.fillRect(x,y,TILE,TILE);
        // Path edge highlight for vulcao (lava glow)
        if (selectedMapId === 'vulcao') {
          const glow = 0.06 + Math.sin(globalTime*1.8 + col*0.4 + row*0.3) * 0.04;
          ctx.fillStyle = `rgba(255,100,0,${glow})`;
          ctx.fillRect(x,y,TILE,TILE);
        }
      } else {
        ctx.fillStyle=(col+row)%2===0 ? c.grassA : c.grassB;
        ctx.fillRect(x,y,TILE,TILE);
      }
      ctx.strokeStyle=c.grid; ctx.lineWidth=0.5;
      ctx.strokeRect(x,y,TILE,TILE);
    }
  }

  // Map-specific decorative extras (trees, lava, rocks...)
  if (activeMap.drawExtras) activeMap.drawExtras(ctx);

  // Path arrows
  ctx.save(); ctx.globalAlpha=0.35; ctx.fillStyle='#fff';
  ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  for(let i=0;i<PATH_PX.length-1;i++){
    const a=PATH_PX[i],b=PATH_PX[i+1];
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    ctx.save(); ctx.translate(mx,my); ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)); ctx.fillText('›',0,0); ctx.restore();
  }
  ctx.restore();

  // IN / OUT labels
  const s=PATH_PX[0], e=PATH_PX[PATH_PX.length-1];
  ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle=c.accent; ctx.fillText('IN',s.x,s.y);
  ctx.fillStyle='#e74c3c'; ctx.fillText('OUT',e.x,e.y);
}

function drawRanges() {
  if(!state.selectedTower) return;
  const stats=getTowerStats(state.selectedTower);
  const {px,py}=state.selectedTower;
  ctx.save();
  ctx.globalAlpha=0.1; ctx.fillStyle=stats.color;
  ctx.beginPath(); ctx.arc(px,py,stats.range,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=0.4; ctx.strokeStyle=stats.color; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
  ctx.stroke(); ctx.restore();
}

function drawHoverPreview() {
  if(!state.hoveredTile) return;
  const {col,row}=state.hoveredTile;
  if(col<0||col>=MAP_COLS||row<0||row>=MAP_ROWS) return;
  const isPath=PATH_SET.has(`${col},${row}`);
  const isWater=WATER_SET.has(`${col},${row}`);
  const hasTower=state.towers.some(t=>t.col===col&&t.row===row);
  const px=col*TILE, py=row*TILE;

  // No tower type selected: just a subtle outline on the hovered tile
  if (!state.selectedType) {
    ctx.save();
    ctx.globalAlpha=0.5; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.5;
    ctx.strokeRect(px+1,py+1,TILE-2,TILE-2);
    ctx.restore();
    return;
  }

  const base=getAllTowerBase()[state.selectedType];
  if (!base) return;
  const blockedByWater = isWater && !base.isAquatic;
  const canPlace=!isPath&&!hasTower&&!blockedByWater;
  const upg=base.upgrades[0];
  const color = canPlace ? base.color : '#ff3b3b';
  ctx.save();
  // Range circle
  ctx.globalAlpha=0.08; ctx.fillStyle=color;
  ctx.beginPath(); ctx.arc(px+TILE/2,py+TILE/2,upg.range,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=0.3; ctx.strokeStyle=color; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.stroke();
  ctx.setLineDash([]);
  // Tile fill
  ctx.globalAlpha=canPlace?0.35:0.3;
  ctx.fillStyle=color;
  ctx.fillRect(px,py,TILE,TILE);
  // Solid border — thicker & bright red when blocked, so it reads at a glance
  ctx.globalAlpha=1;
  ctx.lineWidth=canPlace?1.5:2.5;
  ctx.strokeStyle=canPlace?color:'#ff3b3b';
  ctx.strokeRect(px+1,py+1,TILE-2,TILE-2);
  // X mark when blocked
  if (!canPlace) {
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.globalAlpha=0.85;
    ctx.beginPath();
    ctx.moveTo(px+10,py+10); ctx.lineTo(px+TILE-10,py+TILE-10);
    ctx.moveTo(px+TILE-10,py+10); ctx.lineTo(px+10,py+TILE-10);
    ctx.stroke();
  }
  ctx.restore();
}

// ===========================
//   TOWER DRAWING - ANIMATED MODELS
// ===========================

function drawTower(tower) {
  const base = getAllTowerBase()[tower.type] || TOWER_BASE[tower.type];
  const stats = getTowerStats(tower);
  const {px, py} = tower;
  const s = TILE * 0.72;
  const isSelected = state.selectedTower === tower;
  const firing = tower.firing > 0;
  const t = tower.animTime || 0;

  ctx.save();
  if (isSelected || firing) { ctx.shadowColor = base.glow; ctx.shadowBlur = isSelected ? 22 : 12; }

  // Base tile background
  const grad = ctx.createLinearGradient(px-s/2, py-s/2, px+s/2, py+s/2);
  grad.addColorStop(0, base.color + 'cc');
  grad.addColorStop(1, base.glow + 'cc');
  ctx.fillStyle = grad;
  roundRect(ctx, px-s/2, py-s/2, s, s, 6);
  ctx.fill();

  // Draw type-specific animated model
  ctx.save();
  switch(tower.type) {
    case 'gladiator': drawGladiatorModel(ctx, px, py, s, t, tower, stats); break;
    case 'archer':    drawArcherModel(ctx, px, py, s, t, tower, stats);    break;
    case 'mage':      drawMageModel(ctx, px, py, s, t, tower, stats);      break;
    case 'sniper':    drawSniperModel(ctx, px, py, s, t, tower, stats);    break;
    case 'farmer':    drawFarmerModel(ctx, px, py, s, t, tower);           break;
    case 'hypefarmer': drawHypeFarmerModel(ctx, px, py, s, t, tower);      break;
    case 'gojo':      drawGojoModel(ctx, px, py, s, t, tower, stats);      break;
    case 'investidor': drawInvestidorModel(ctx, px, py, s, t, tower, stats); break;
    case 'arcturus':   drawArcturusModel(ctx, px, py, s, t, tower, stats);   break;
    case 'mortar':      drawMortarModel(ctx, px, py, s, t, tower, stats);    break;
    default:
      ctx.font=`${Math.floor(s*0.52)}px sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(getAllTowerBase()[tower.type]?.icon||'?', px, py);
      break;
  }
  ctx.restore();

  // Level indicator dots
  for(let lv=0;lv<tower.level;lv++){
    ctx.fillStyle = lv===0?'#aaa':(lv===1?'#88aaff':'#ffdd00');
    ctx.beginPath(); ctx.arc(px-s/2+5+lv*8, py+s/2-5, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=0.8; ctx.stroke();
  }

  // Selected outline
  if(isSelected){
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.strokeRect(px-TILE/2+2, py-TILE/2+2, TILE-4, TILE-4);
  }
  ctx.restore();
}

// ---- GLADIADOR model ----
// Body + helmet + sword that swings on attack, idles rocking
function drawGladiatorModel(ctx, px, py, s, t, tower, stats) {
  const firing = tower.firing > 0;
  const sc = s / 28; // scale factor

  // Idle bob
  const bob = Math.sin(t * 2.2) * 1.2;

  ctx.save();
  ctx.translate(px, py + bob);

  // --- BODY ---
  // Torso (armored plate)
  ctx.fillStyle = '#c8860a';
  ctx.fillRect(-6*sc, -4*sc, 12*sc, 9*sc);
  // Chest plate shine
  ctx.fillStyle = '#e8a020';
  ctx.fillRect(-5*sc, -3*sc, 10*sc, 5*sc);
  // Belt
  ctx.fillStyle = '#7a4a00';
  ctx.fillRect(-6*sc, 4*sc, 12*sc, 2*sc);

  // --- LEGS ---
  // Left leg
  const legSwing = Math.sin(t * 2.2) * 0.4;
  ctx.save();
  ctx.translate(-3*sc, 6*sc);
  ctx.rotate(legSwing * 0.15);
  ctx.fillStyle = '#8b5e0a';
  ctx.fillRect(-2.5*sc, 0, 5*sc, 6*sc);
  // Boot
  ctx.fillStyle = '#3a2a00';
  ctx.fillRect(-3*sc, 5*sc, 6*sc, 2.5*sc);
  ctx.restore();

  ctx.save();
  ctx.translate(3*sc, 6*sc);
  ctx.rotate(-legSwing * 0.15);
  ctx.fillStyle = '#8b5e0a';
  ctx.fillRect(-2.5*sc, 0, 5*sc, 6*sc);
  ctx.fillStyle = '#3a2a00';
  ctx.fillRect(-3*sc, 5*sc, 6*sc, 2.5*sc);
  ctx.restore();

  // --- SHIELD (left side) ---
  ctx.fillStyle = '#cc3300';
  roundRect(ctx, -10*sc, -5*sc, 5*sc, 9*sc, 1.5*sc);
  ctx.fill();
  ctx.fillStyle = '#ff5522';
  ctx.fillRect(-9.5*sc, -3*sc, 3.5*sc, 5*sc);
  // Shield cross
  ctx.strokeStyle = '#ffaa44';
  ctx.lineWidth = sc * 0.9;
  ctx.beginPath();
  ctx.moveTo(-8*sc, -2*sc); ctx.lineTo(-8*sc, 1*sc);
  ctx.moveTo(-9.5*sc, -0.5*sc); ctx.lineTo(-6.5*sc, -0.5*sc);
  ctx.stroke();

  // --- SWORD (right side) — swing animation ---
  const swingAngle = firing
    ? -Math.PI/2 + (1 - tower.firing/0.22) * (Math.PI * 0.85) // attack swing
    : -Math.PI/4 + Math.sin(t * 2.2) * 0.18;                   // idle sway

  ctx.save();
  ctx.translate(6*sc, -2*sc);
  ctx.rotate(swingAngle);

  // Grip
  ctx.fillStyle = '#4a2a00';
  ctx.fillRect(-1.2*sc, 0, 2.4*sc, 5*sc);
  // Guard (crossguard)
  ctx.fillStyle = '#888';
  ctx.fillRect(-4*sc, -1*sc, 8*sc, 2*sc);
  // Blade
  ctx.fillStyle = '#ddeeff';
  ctx.beginPath();
  ctx.moveTo(-1.5*sc, -1*sc);
  ctx.lineTo(1.5*sc, -1*sc);
  ctx.lineTo(0.5*sc, -14*sc);
  ctx.lineTo(-0.5*sc, -14*sc);
  ctx.closePath();
  ctx.fill();
  // Blade shine
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0.2*sc, -2*sc);
  ctx.lineTo(0.8*sc, -2*sc);
  ctx.lineTo(0.3*sc, -13*sc);
  ctx.closePath();
  ctx.fill();
  // Tip
  ctx.fillStyle = '#aaccff';
  ctx.beginPath();
  ctx.moveTo(-0.5*sc, -13*sc);
  ctx.lineTo(0.5*sc, -13*sc);
  ctx.lineTo(0, -15.5*sc);
  ctx.closePath();
  ctx.fill();

  // Sword trail when attacking
  if(firing && tower.firing > 0.05){
    ctx.globalAlpha = tower.firing * 0.7;
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 3*sc;
    ctx.setLineDash([2*sc, 2*sc]);
    ctx.beginPath();
    ctx.moveTo(0, -8*sc);
    ctx.lineTo(0, -14*sc);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore(); // sword

  // --- HEAD / HELMET ---
  // Neck
  ctx.fillStyle = '#c8860a';
  ctx.fillRect(-2.5*sc, -9*sc, 5*sc, 3*sc);
  // Helmet body
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.arc(0, -12*sc, 5*sc, 0, Math.PI*2);
  ctx.fill();
  // Helmet visor
  ctx.fillStyle = '#555';
  ctx.fillRect(-4*sc, -12.5*sc, 8*sc, 2.5*sc);
  // Helmet plume (color by level)
  const plumeColors = ['#cc3300','#4488ff','#ffdd00'];
  ctx.fillStyle = plumeColors[tower.level-1];
  ctx.beginPath();
  ctx.moveTo(-1.5*sc, -17*sc);
  ctx.quadraticCurveTo(3*sc, -19*sc + Math.sin(t*3)*sc, 1*sc, -12*sc);
  ctx.quadraticCurveTo(-1*sc, -13*sc, -2*sc, -17*sc);
  ctx.closePath();
  ctx.fill();
  // Eyes glow
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(-3*sc, -12.8*sc, 2*sc, 1.2*sc);
  ctx.fillRect(1*sc, -12.8*sc, 2*sc, 1.2*sc);

  // Attack flash effect
  if(firing){
    ctx.globalAlpha = tower.firing * 0.35;
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(0, 0, 12*sc, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore(); // translate to px,py+bob
}

// ---- ARQUEIRO model ----
// Body + bow that aims and releases
function drawArcherModel(ctx, px, py, s, t, tower, stats) {
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t * 2.5) * 1.0;

  ctx.save();
  ctx.translate(px, py + bob);

  // Legs
  const legSwing = Math.sin(t * 2.5) * 0.3;
  [-3, 3].forEach((dx, i) => {
    ctx.save();
    ctx.translate(dx*sc, 5*sc);
    ctx.rotate((i===0?1:-1)*legSwing*0.15);
    ctx.fillStyle = '#2a5e1e';
    ctx.fillRect(-2*sc, 0, 4*sc, 6*sc);
    ctx.fillStyle = '#1a3a10';
    ctx.fillRect(-2.5*sc, 5*sc, 5*sc, 2*sc);
    ctx.restore();
  });

  // Body (green tunic)
  ctx.fillStyle = '#2e7a2e';
  ctx.fillRect(-5.5*sc, -4*sc, 11*sc, 9*sc);
  ctx.fillStyle = '#3ea03e';
  ctx.fillRect(-4.5*sc, -3*sc, 9*sc, 4*sc);
  // Belt
  ctx.fillStyle = '#8b5e00';
  ctx.fillRect(-5.5*sc, 4*sc, 11*sc, 2*sc);
  // Belt buckle
  ctx.fillStyle = '#d4a000';
  ctx.fillRect(-1*sc, 4.2*sc, 2*sc, 1.5*sc);

  // --- BOW ---
  const bowPullback = firing ? tower.firing/0.18 : 0;
  ctx.save();
  ctx.translate(-8*sc, 0);
  // Bow curve
  ctx.strokeStyle = '#8b5a00';
  ctx.lineWidth = 2.2*sc;
  ctx.beginPath();
  ctx.moveTo(0, -9*sc);
  ctx.quadraticCurveTo(-4*sc*(1-bowPullback*0.3), 0, 0, 9*sc);
  ctx.stroke();
  // Bowstring
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 0.8*sc;
  ctx.beginPath();
  ctx.moveTo(0, -9*sc);
  ctx.lineTo(-bowPullback*3*sc, 0);
  ctx.lineTo(0, 9*sc);
  ctx.stroke();
  // Arrow on bow when not firing
  if(!firing || bowPullback > 0.3){
    ctx.strokeStyle = '#a06010';
    ctx.lineWidth = 1.2*sc;
    ctx.beginPath();
    ctx.moveTo(1*sc - bowPullback*3*sc, 0);
    ctx.lineTo(7*sc, 0);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#aaddff';
    ctx.beginPath();
    ctx.moveTo(7*sc, 0);
    ctx.lineTo(5*sc, -1.5*sc);
    ctx.lineTo(5*sc, 1.5*sc);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore(); // bow

  // Arm holding bow
  ctx.fillStyle = '#2e7a2e';
  ctx.fillRect(-9*sc, -2*sc, 4*sc, 2.5*sc);
  // Pulling arm
  ctx.save();
  ctx.translate(4*sc, -1*sc);
  const pullAngle = firing ? -Math.PI/6 * bowPullback : Math.sin(t*2.5)*0.1;
  ctx.rotate(pullAngle);
  ctx.fillStyle = '#2e7a2e';
  ctx.fillRect(0, -1.5*sc, 5*sc, 2.5*sc);
  ctx.restore();

  // Head
  ctx.fillStyle = '#f0c080';
  ctx.beginPath();
  ctx.arc(0, -9*sc, 4.5*sc, 0, Math.PI*2);
  ctx.fill();
  // Hood
  ctx.fillStyle = '#1a6a1a';
  ctx.beginPath();
  ctx.arc(0, -10*sc, 5*sc, Math.PI, Math.PI*2);
  ctx.fill();
  // Hood tip
  ctx.beginPath();
  ctx.moveTo(-4*sc, -10*sc);
  ctx.lineTo(4*sc, -10*sc);
  ctx.lineTo(2*sc, -16*sc + Math.sin(t*3)*sc);
  ctx.closePath();
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(-2.5*sc, -9.5*sc, 1.5*sc, 1.5*sc);
  ctx.fillRect(1*sc, -9.5*sc, 1.5*sc, 1.5*sc);

  // Fire flash
  if(firing && bowPullback < 0.2){
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#a8ff80';
    ctx.beginPath();
    ctx.arc(-8*sc, 0, 6*sc, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

// ---- MAGO model ----
// Robed figure with staff + orb floating, casting glow on attack
function drawMageModel(ctx, px, py, s, t, tower, stats) {
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t * 1.8) * 0.9;
  const orbFloat = Math.sin(t * 2.8) * 2.5;

  ctx.save();
  ctx.translate(px, py + bob);

  // Robe body
  ctx.fillStyle = '#6a2a8a';
  ctx.beginPath();
  ctx.moveTo(-7*sc, -3*sc);
  ctx.lineTo(7*sc, -3*sc);
  ctx.lineTo(9*sc, 12*sc);
  ctx.lineTo(-9*sc, 12*sc);
  ctx.closePath();
  ctx.fill();
  // Robe highlight
  ctx.fillStyle = '#8b3aaa';
  ctx.fillRect(-5*sc, -2*sc, 10*sc, 6*sc);
  // Robe trim
  ctx.strokeStyle = '#d9a7f5';
  ctx.lineWidth = sc;
  ctx.beginPath();
  ctx.moveTo(-7*sc, -3*sc);
  ctx.lineTo(-9*sc, 12*sc);
  ctx.moveTo(7*sc, -3*sc);
  ctx.lineTo(9*sc, 12*sc);
  ctx.stroke();

  // --- STAFF ---
  const staffSway = Math.sin(t * 1.8) * 0.08;
  ctx.save();
  ctx.translate(7*sc, 2*sc);
  ctx.rotate(staffSway);
  // Staff pole
  ctx.strokeStyle = '#6b3a00';
  ctx.lineWidth = 2*sc;
  ctx.beginPath();
  ctx.moveTo(0, 8*sc);
  ctx.lineTo(0, -20*sc);
  ctx.stroke();
  // Staff head gem
  const gemGlow = firing ? 1.0 : 0.5 + Math.sin(t * 3) * 0.3;
  ctx.shadowColor = '#d9a7f5';
  ctx.shadowBlur = 8 * gemGlow;
  ctx.fillStyle = `rgba(200,120,255,${gemGlow})`;
  ctx.beginPath();
  ctx.arc(0, -20*sc, 4*sc, 0, Math.PI*2);
  ctx.fill();
  // Gem sparkle
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = sc * 0.8;
  ctx.beginPath();
  ctx.moveTo(-2*sc, -21*sc); ctx.lineTo(-1*sc, -20*sc);
  ctx.moveTo(0, -23*sc); ctx.lineTo(0, -22*sc);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore(); // staff

  // Floating magic orb (separate from staff)
  ctx.save();
  ctx.translate(-9*sc, -8*sc + orbFloat);
  const orbAlpha = 0.6 + Math.sin(t * 2.8) * 0.3;
  ctx.shadowColor = '#d9a7f5';
  ctx.shadowBlur = 10;
  ctx.globalAlpha = orbAlpha;
  ctx.fillStyle = '#cc88ff';
  ctx.beginPath();
  ctx.arc(0, 0, 3.5*sc, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore(); // orb

  // Head
  ctx.fillStyle = '#f0c080';
  ctx.beginPath();
  ctx.arc(0, -9*sc, 4.5*sc, 0, Math.PI*2);
  ctx.fill();
  // Wizard hat
  ctx.fillStyle = '#5a1a7a';
  ctx.beginPath();
  ctx.moveTo(-6*sc, -9*sc);
  ctx.lineTo(6*sc, -9*sc);
  ctx.lineTo(2*sc, -20*sc + Math.sin(t*2)*0.8*sc);
  ctx.closePath();
  ctx.fill();
  // Hat brim
  ctx.fillStyle = '#7a2a9a';
  ctx.fillRect(-7*sc, -10*sc, 14*sc, 2*sc);
  // Star on hat
  ctx.fillStyle = '#ffdd00';
  ctx.font = `${5*sc}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 0.5*sc, -15*sc);
  // Eyes (glowing)
  const eyeCol = firing ? '#ff00ff' : '#cc88ff';
  ctx.fillStyle = eyeCol;
  ctx.beginPath();
  ctx.arc(-2*sc, -9.5*sc, 1.2*sc, 0, Math.PI*2);
  ctx.arc(2*sc, -9.5*sc, 1.2*sc, 0, Math.PI*2);
  ctx.fill();

  // Cast effect
  if(firing){
    ctx.globalAlpha = tower.firing * 0.6;
    ctx.shadowColor = '#d9a7f5';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#d9a7f5';
    ctx.beginPath();
    ctx.arc(0, 0, 12*sc, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ---- ATIRADOR (Sniper) model ----
// Military figure with long rifle, leans and recoils on shot
function drawMortarModel(ctx, px, py, s, t, tower, stats) {
  const firing = tower.firing > 0;
  const sc = s / 28;
  const recoil = firing ? (tower.firing / 0.18) * 4 : 0;
  const tubeAngle = -1.15; // steep upward angle, classic mortar stance

  ctx.save();
  ctx.translate(px, py);

  // Tripod legs (base plate)
  ctx.fillStyle = '#3a3526';
  ctx.beginPath();
  ctx.moveTo(-9*sc, 9*sc); ctx.lineTo(-3*sc, 3*sc); ctx.lineTo(3*sc, 3*sc); ctx.lineTo(9*sc, 9*sc);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a2618';
  ctx.fillRect(-10*sc, 8*sc, 20*sc, 3*sc);

  // Ammo crate beside the tripod
  ctx.fillStyle = '#5a4a28';
  ctx.fillRect(6*sc, 1*sc, 7*sc, 6*sc);
  ctx.strokeStyle = '#3a2e18'; ctx.lineWidth = 0.8*sc;
  ctx.strokeRect(6*sc, 1*sc, 7*sc, 6*sc);
  ctx.fillStyle = '#cc8822';
  ctx.beginPath(); ctx.arc(9.5*sc, 4*sc, 1.8*sc, 0, Math.PI*2); ctx.fill();

  // Tube (the mortar barrel), tilted steeply, with recoil sliding it down on fire
  ctx.save();
  ctx.translate(0, 2*sc + recoil);
  ctx.rotate(tubeAngle);
  ctx.fillStyle = '#444036';
  ctx.fillRect(-3*sc, -22*sc, 6*sc, 24*sc);
  ctx.fillStyle = '#5a5648';
  ctx.fillRect(-3*sc, -22*sc, 2*sc, 24*sc);
  // Muzzle ring
  ctx.fillStyle = '#262420';
  ctx.fillRect(-3.6*sc, -23*sc, 7.2*sc, 3*sc);
  ctx.restore();

  // Muzzle flash + smoke puff when firing
  if (firing && tower.firing > 0.1) {
    const mx = Math.cos(tubeAngle - Math.PI/2) * 24*sc;
    const my = 2*sc + Math.sin(tubeAngle - Math.PI/2) * 24*sc;
    ctx.save();
    ctx.globalAlpha = tower.firing * 1.3;
    ctx.shadowColor = '#ffaa33'; ctx.shadowBlur = 16*sc;
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath(); ctx.arc(mx, my, 5*sc, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff0cc';
    ctx.beginPath(); ctx.arc(mx, my, 2.5*sc, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = tower.firing * 0.6;
    ctx.fillStyle = '#999';
    ctx.beginPath(); ctx.arc(mx, my - 4*sc, 7*sc * (1 + (0.18-tower.firing)*3), 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawSniperModel(ctx, px, py, s, t, tower, stats) {
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t * 1.5) * 0.6;
  const recoil = firing ? tower.firing / 0.18 * 2.5 : 0;

  ctx.save();
  ctx.translate(px, py + bob);

  // Legs
  ctx.fillStyle = '#2a3a5a';
  ctx.fillRect(-5.5*sc, 4*sc, 11*sc, 7*sc);
  // Boots
  ctx.fillStyle = '#111';
  ctx.fillRect(-6*sc, 9.5*sc, 5*sc, 2.5*sc);
  ctx.fillRect(1*sc, 9.5*sc, 5*sc, 2.5*sc);

  // Body (military jacket)
  ctx.fillStyle = '#2a4a2a';
  ctx.fillRect(-6*sc, -5*sc, 12*sc, 10*sc);
  // Jacket pockets
  ctx.fillStyle = '#1e3a1e';
  ctx.fillRect(-5*sc, -2*sc, 3*sc, 3*sc);
  ctx.fillRect(2*sc, -2*sc, 3*sc, 3*sc);
  // Belt
  ctx.fillStyle = '#2a1a00';
  ctx.fillRect(-6*sc, 4*sc, 12*sc, 1.5*sc);

  // --- RIFLE ---
  const leanAngle = -0.22 + Math.sin(t*1.5)*0.04;
  ctx.save();
  ctx.translate(4*sc + recoil, -1*sc);
  ctx.rotate(leanAngle);
  // Stock
  ctx.fillStyle = '#5a3000';
  ctx.fillRect(-2*sc, 2*sc, 4*sc, 5*sc);
  // Body of rifle
  ctx.fillStyle = '#222';
  ctx.fillRect(-1.5*sc, -16*sc, 3*sc, 18*sc);
  // Barrel extension
  ctx.fillStyle = '#333';
  ctx.fillRect(-0.8*sc, -24*sc, 1.6*sc, 9*sc);
  // Barrel tip / suppressor
  ctx.fillStyle = '#555';
  ctx.fillRect(-1.5*sc, -26*sc, 3*sc, 3*sc);
  // Scope
  ctx.fillStyle = '#111';
  ctx.fillRect(1.5*sc, -13*sc, 3*sc, 2*sc);
  ctx.fillStyle = '#0044aa';
  ctx.fillRect(2*sc, -13.2*sc, 2*sc, 1.5*sc);

  // Muzzle flash on fire
  if(firing && tower.firing > 0.08){
    ctx.globalAlpha = tower.firing * 1.2;
    ctx.shadowColor = '#aad4ff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -27*sc, 3.5*sc, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#aad4ff';
    ctx.beginPath();
    ctx.arc(0, -27*sc, 2*sc, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  ctx.restore(); // rifle

  // Arms
  ctx.fillStyle = '#2a4a2a';
  ctx.fillRect(-6*sc, -3*sc, 4*sc, 2.5*sc); // left arm
  ctx.fillRect(2*sc, -3*sc, 6*sc, 2.5*sc);   // right arm

  // Head
  ctx.fillStyle = '#f0c080';
  ctx.beginPath();
  ctx.arc(0, -10*sc, 4.5*sc, 0, Math.PI*2);
  ctx.fill();
  // Military beret
  ctx.fillStyle = '#2a4a2a';
  ctx.beginPath();
  ctx.arc(0, -12*sc, 5*sc, Math.PI, Math.PI*2);
  ctx.fill();
  ctx.fillRect(-5*sc, -12.5*sc, 10*sc, 2*sc);
  // Beret badge
  ctx.fillStyle = '#ffdd00';
  ctx.beginPath();
  ctx.arc(-2*sc, -12.5*sc, 1.5*sc, 0, Math.PI*2);
  ctx.fill();
  // Eyes (with scope eye visible)
  ctx.fillStyle = '#000';
  ctx.fillRect(-2.5*sc, -10.5*sc, 2*sc, 1.5*sc);
  ctx.fillRect(0.5*sc, -10.5*sc, 2*sc, 1.5*sc);
  // Scope / monocle on right eye
  ctx.strokeStyle = '#aaddff';
  ctx.lineWidth = sc * 0.8;
  ctx.beginPath();
  ctx.arc(1.5*sc, -9.8*sc, 2*sc, 0, Math.PI*2);
  ctx.stroke();

  ctx.restore();
}

// ---- FAZENDEIRO model ----
// Friendly farmer with straw hat, hoe, and animated crops growing around him
function drawFarmerModel(ctx, px, py, s, t, tower) {
  const sc = s / 28;
  const bob = Math.sin(t * 1.6) * 0.8;
  const hoeSway = Math.sin(t * 1.6) * 0.22;
  const income = getTowerStats(tower).income || 0;

  ctx.save();
  ctx.translate(px, py + bob);

  // --- CROPS around farmer (level-based quantity) ---
  const cropCount = tower.level === 1 ? 2 : tower.level === 2 ? 4 : 6;
  for (let i = 0; i < cropCount; i++) {
    const angle = (i / cropCount) * Math.PI * 2 + t * 0.3;
    const r = 12 * sc;
    const cx = Math.cos(angle) * r;
    const cy = Math.sin(angle) * r;
    const growPhase = Math.sin(t * 2.2 + i * 1.1) * 0.15 + 0.85;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(growPhase, growPhase);
    // Stalk
    ctx.strokeStyle = '#5a8a00';
    ctx.lineWidth = 1.2 * sc;
    ctx.beginPath();
    ctx.moveTo(0, 3*sc); ctx.lineTo(0, -3*sc);
    ctx.stroke();
    // Wheat head
    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.ellipse(0, -4*sc, 1.8*sc, 3*sc, 0, 0, Math.PI*2);
    ctx.fill();
    // Leaves
    ctx.fillStyle = '#4a8a00';
    ctx.beginPath();
    ctx.ellipse(-2.5*sc, -1*sc, 1.5*sc, 0.7*sc, -0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // --- LEGS ---
  const legSwing = Math.sin(t * 1.6) * 0.25;
  [-3, 3].forEach((dx, i) => {
    ctx.save();
    ctx.translate(dx*sc, 5*sc);
    ctx.rotate((i===0?1:-1) * legSwing * 0.12);
    ctx.fillStyle = '#4a6aa0'; // denim overalls
    ctx.fillRect(-2*sc, 0, 4*sc, 6*sc);
    ctx.fillStyle = '#2a3a60';
    ctx.fillRect(-2.5*sc, 5*sc, 5*sc, 2*sc); // boots
    ctx.restore();
  });

  // --- OVERALLS BODY ---
  ctx.fillStyle = '#4a6aa0';
  ctx.fillRect(-5.5*sc, -5*sc, 11*sc, 11*sc);
  // Bib
  ctx.fillStyle = '#5a7ab0';
  ctx.fillRect(-3.5*sc, -4*sc, 7*sc, 6*sc);
  // Bib straps
  ctx.fillStyle = '#3a5a90';
  ctx.fillRect(-3.5*sc, -5*sc, 1.5*sc, 2*sc);
  ctx.fillRect(2*sc, -5*sc, 1.5*sc, 2*sc);
  // Overall pocket
  ctx.fillStyle = '#3a5a90';
  ctx.fillRect(-1.5*sc, -1*sc, 3*sc, 2.5*sc);

  // --- HOE (tool) ---
  ctx.save();
  ctx.translate(7*sc, -1*sc);
  ctx.rotate(hoeSway);
  // Handle
  ctx.strokeStyle = '#8b5a00';
  ctx.lineWidth = 2*sc;
  ctx.beginPath();
  ctx.moveTo(0, 10*sc); ctx.lineTo(0, -14*sc);
  ctx.stroke();
  // Hoe blade
  ctx.fillStyle = '#888';
  ctx.fillRect(-4*sc, -15*sc, 8*sc, 2.5*sc);
  ctx.fillStyle = '#aaa';
  ctx.fillRect(-3.5*sc, -14*sc, 7*sc, 1.2*sc);
  ctx.restore();

  // Arms
  ctx.fillStyle = '#4a6aa0';
  ctx.fillRect(-7*sc, -3*sc, 3*sc, 2.5*sc); // left arm
  ctx.save();
  ctx.translate(4*sc, -2*sc);
  ctx.rotate(hoeSway * 0.5);
  ctx.fillRect(0, 0, 5*sc, 2.5*sc); // right arm holding hoe
  ctx.restore();

  // --- HEAD ---
  // Face (skin)
  ctx.fillStyle = '#f5c09a';
  ctx.beginPath();
  ctx.arc(0, -10*sc, 5*sc, 0, Math.PI*2);
  ctx.fill();
  // Rosy cheeks
  ctx.fillStyle = 'rgba(255,120,100,0.35)';
  ctx.beginPath();
  ctx.arc(-2.5*sc, -9*sc, 2*sc, 0, Math.PI*2);
  ctx.arc(2.5*sc, -9*sc, 2*sc, 0, Math.PI*2);
  ctx.fill();
  // Eyes (happy squint)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = sc;
  ctx.beginPath();
  ctx.arc(-2*sc, -10.5*sc, 1.2*sc, Math.PI*0.1, Math.PI*0.9);
  ctx.arc(2*sc, -10.5*sc, 1.2*sc, Math.PI*0.1, Math.PI*0.9);
  ctx.stroke();
  // Smile
  ctx.beginPath();
  ctx.arc(0, -8.5*sc, 2.2*sc, 0.1, Math.PI-0.1);
  ctx.stroke();

  // --- STRAW HAT ---
  // Brim
  ctx.fillStyle = '#d4a827';
  ctx.beginPath();
  ctx.ellipse(0, -14*sc, 9*sc, 2.5*sc, 0, 0, Math.PI*2);
  ctx.fill();
  // Crown
  ctx.fillStyle = '#c8920a';
  ctx.beginPath();
  ctx.moveTo(-5*sc, -14*sc);
  ctx.lineTo(5*sc, -14*sc);
  ctx.lineTo(3.5*sc, -20*sc + Math.sin(t*1.8)*0.5*sc);
  ctx.lineTo(-3.5*sc, -20*sc + Math.sin(t*1.8)*0.5*sc);
  ctx.closePath();
  ctx.fill();
  // Hat band
  ctx.fillStyle = '#cc3300';
  ctx.fillRect(-5*sc, -14.8*sc, 10*sc, 1.5*sc);

  // --- COIN sparkle animation (floats up from farmer periodically) ---
  const coinPhase = (t * 0.8) % 1;
  if (coinPhase < 0.5) {
    ctx.globalAlpha = Math.sin(coinPhase * Math.PI);
    ctx.font = `${7*sc}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💰', 10*sc, -22*sc - coinPhase * 18*sc);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- FAZENDEIRO HYPE model ----
// Same silhouette as the regular farmer, but with party colors, confetti
// orbiting instead of wheat, sunglasses, and a "caixa-surpresa" she's
// holding up — visually signals "this one gives surprises, not steady income".
function drawHypeFarmerModel(ctx, px, py, s, t, tower) {
  const sc = s / 28;
  const bob = Math.sin(t * 2.0) * 1.1; // bouncier than the regular farmer
  const armWave = Math.sin(t * 2.0) * 0.3;

  ctx.save();
  ctx.translate(px, py + bob);

  // --- CONFETTI orbiting (replaces crops) ---
  const confettiColors = ['#ff66cc', '#ffdd00', '#44ddff', '#88ff66'];
  const confettiCount = tower.level === 1 ? 5 : tower.level === 2 ? 7 : 9;
  for (let i = 0; i < confettiCount; i++) {
    const angle = (i / confettiCount) * Math.PI * 2 + t * 0.8;
    const r = 13 * sc;
    const cx = Math.cos(angle) * r;
    const cy = Math.sin(angle) * r * 0.6 - 2 * sc;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 3 + i);
    ctx.fillStyle = confettiColors[i % confettiColors.length];
    ctx.fillRect(-1.3*sc, -1.3*sc, 2.6*sc, 2.6*sc);
    ctx.restore();
  }

  // --- LEGS ---
  const legSwing = Math.sin(t * 2.0) * 0.3;
  [-3, 3].forEach((dx, i) => {
    ctx.save();
    ctx.translate(dx*sc, 5*sc);
    ctx.rotate((i===0?1:-1) * legSwing * 0.15);
    ctx.fillStyle = '#cc2299'; // pink overalls instead of denim
    ctx.fillRect(-2*sc, 0, 4*sc, 6*sc);
    ctx.fillStyle = '#7a1a5a';
    ctx.fillRect(-2.5*sc, 5*sc, 5*sc, 2*sc); // boots
    ctx.restore();
  });

  // --- OVERALLS BODY ---
  ctx.fillStyle = '#ff66cc';
  ctx.fillRect(-5.5*sc, -5*sc, 11*sc, 11*sc);
  ctx.fillStyle = '#ff99dd';
  ctx.fillRect(-3.5*sc, -4*sc, 7*sc, 6*sc);
  ctx.fillStyle = '#cc2299';
  ctx.fillRect(-3.5*sc, -5*sc, 1.5*sc, 2*sc);
  ctx.fillRect(2*sc, -5*sc, 1.5*sc, 2*sc);

  // --- ARMS raised (cheering) ---
  ctx.save();
  ctx.translate(-7*sc, -2*sc);
  ctx.rotate(-0.6 + armWave * 0.3);
  ctx.fillStyle = '#ff66cc';
  ctx.fillRect(-1.5*sc, -6*sc, 3*sc, 7*sc);
  ctx.restore();

  // Right arm holds the surprise box
  ctx.save();
  ctx.translate(6*sc, -3*sc);
  ctx.rotate(0.3 - armWave * 0.2);
  ctx.fillStyle = '#ff66cc';
  ctx.fillRect(-1.5*sc, 0, 3*sc, 6*sc);
  // Gift box
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(-3.5*sc, -7*sc, 7*sc, 6*sc);
  ctx.fillStyle = '#ff3388';
  ctx.fillRect(-3.5*sc, -4.5*sc, 7*sc, 1.2*sc);
  ctx.fillRect(-0.6*sc, -7*sc, 1.2*sc, 6*sc);
  ctx.restore();

  // --- HEAD ---
  ctx.fillStyle = '#f5c09a';
  ctx.beginPath();
  ctx.arc(0, -10*sc, 5*sc, 0, Math.PI*2);
  ctx.fill();
  // Big open smile
  ctx.strokeStyle = '#333';
  ctx.lineWidth = sc;
  ctx.beginPath();
  ctx.arc(0, -8*sc, 2.6*sc, 0.05, Math.PI - 0.05);
  ctx.stroke();
  // Sunglasses (party vibe)
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(-2.2*sc, -10.5*sc, 1.8*sc, 1.4*sc, 0, 0, Math.PI*2);
  ctx.ellipse(2.2*sc, -10.5*sc, 1.8*sc, 1.4*sc, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillRect(-0.8*sc, -11*sc, 1.6*sc, 0.8*sc); // bridge
  // Lens shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(-2.8*sc, -11*sc, 0.6*sc, 0, Math.PI*2);
  ctx.arc(1.6*sc, -11*sc, 0.6*sc, 0, Math.PI*2);
  ctx.fill();

  // --- PARTY HAT (cone, replaces straw hat) ---
  ctx.fillStyle = '#44ddff';
  ctx.beginPath();
  ctx.moveTo(-4.5*sc, -14*sc);
  ctx.lineTo(4.5*sc, -14*sc);
  ctx.lineTo(0, -23*sc + Math.sin(t*2.5)*0.6*sc);
  ctx.closePath();
  ctx.fill();
  // Pompom on top
  ctx.fillStyle = '#ffdd00';
  ctx.beginPath();
  ctx.arc(0, -23*sc + Math.sin(t*2.5)*0.6*sc, 1.3*sc, 0, Math.PI*2);
  ctx.fill();
  // Hat stripes
  ctx.strokeStyle = '#ff66cc';
  ctx.lineWidth = sc * 0.8;
  ctx.beginPath();
  ctx.moveTo(-3*sc, -16*sc); ctx.lineTo(-1*sc, -20*sc);
  ctx.moveTo(3*sc, -16*sc); ctx.lineTo(1*sc, -20*sc);
  ctx.stroke();

  // --- Floating "?" sparkle above the box (teases the surprise) ---
  const sparklePhase = (t * 0.6) % 1;
  if (sparklePhase < 0.5) {
    ctx.globalAlpha = Math.sin(sparklePhase * Math.PI);
    ctx.font = `bold ${7*sc}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 6*sc, -16*sc - sparklePhase * 14*sc);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- SATORU GOJO model ----
// White-haired, blindfolded, black suit + infinity aura
function drawArcturusModel(ctx, px, py, s, t, tower, stats) {
  const isOver = tower.arcOvercharging;
  const isStab = tower.arcStabilising;
  const charges = tower.arcCharges || 0;
  const chargeThreshold = stats.overChargeThreshold || 30;
  const chargeRatio = Math.min(charges / chargeThreshold, 1);

  // Outer pulsing corona
  const coronaPulse = 0.5 + 0.5 * Math.sin(t * (isOver ? 12 : 4));
  const coronaR = s * (isOver ? 1.5 : 0.95) + coronaPulse * (isOver ? 10 : 4);
  const coronaAlpha = isOver ? 0.55 + coronaPulse * 0.3 : 0.2 + chargeRatio * 0.3;
  const coronaColor = isOver ? '#ff4400' : isStab ? '#aaaaaa' : '#ffaa00';
  const cg = ctx.createRadialGradient(px, py, coronaR*0.3, px, py, coronaR);
  cg.addColorStop(0, coronaColor + Math.round(coronaAlpha*255).toString(16).padStart(2,'0'));
  cg.addColorStop(1, 'transparent');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(px, py, coronaR, 0, Math.PI*2); ctx.fill();

  // Core sun body
  const coreR = s * 0.54;
  const coreColor = isOver ? '#ff5500' : isStab ? '#888888' : `hsl(${30 + chargeRatio*20}, 100%, 55%)`;
  const grad = ctx.createRadialGradient(px-coreR*0.28, py-coreR*0.28, 1, px, py, coreR);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, isOver ? '#ff8800' : '#ffdd44');
  grad.addColorStop(1, coreColor);
  ctx.fillStyle = grad;
  ctx.shadowColor = isOver ? '#ff4400' : '#ffaa00';
  ctx.shadowBlur  = isOver ? 30 : 14 + chargeRatio * 12;
  ctx.beginPath(); ctx.arc(px, py, coreR, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  // Solar flares (rays)
  const rayCount = isOver ? 10 : 7;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + t * (isOver ? 3 : 1.2);
    const rayLen = (isOver ? 14 : 8) + Math.sin(t * 5 + i) * (isOver ? 7 : 3);
    const rx1 = px + Math.cos(angle) * coreR;
    const ry1 = py + Math.sin(angle) * coreR;
    const rx2 = px + Math.cos(angle) * (coreR + rayLen);
    const ry2 = py + Math.sin(angle) * (coreR + rayLen);
    ctx.strokeStyle = isOver ? '#ff6600' : '#ffee88';
    ctx.lineWidth = isOver ? 2.5 : 1.5;
    ctx.globalAlpha = isOver ? 0.85 : 0.55 + chargeRatio * 0.3;
    ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Charge ring (fills as charges build up)
  if (!isOver && !isStab && charges > 0) {
    ctx.save();
    ctx.strokeStyle = `hsl(${20 + chargeRatio * 40}, 100%, 60%)`;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(px, py, coreR + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*chargeRatio);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Stabilisation grey ring
  if (isStab) {
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(px, py, coreR + 6, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // ── Summon cooldown ring (gold-green, outer) ──
  const summonInterval = stats.summonInterval || 12;
  const summonTimer   = tower.arcSummonTimer !== undefined ? tower.arcSummonTimer : summonInterval;
  const summonRatio   = 1 - Math.max(0, Math.min(1, summonTimer / summonInterval));
  const summonR = coreR + (isOver ? 17 : 13);
  ctx.save();
  ctx.strokeStyle = '#88ee44';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.55;
  // Background track
  ctx.beginPath(); ctx.arc(px, py, summonR, 0, Math.PI*2); ctx.stroke();
  // Filled progress
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = summonRatio >= 1 ? '#ccff44' : '#88ee44';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(px, py, summonR, -Math.PI/2, -Math.PI/2 + Math.PI*2*summonRatio);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Nova Solar cooldown ring (white-blue, outer-outer) ──
  const novaCooldown = stats.novaCooldown || 40;
  const novaTimer    = tower.arcNovaTimer !== undefined ? tower.arcNovaTimer : novaCooldown;
  const novaRatio    = 1 - Math.max(0, Math.min(1, novaTimer / novaCooldown));
  const novaR = coreR + (isOver ? 25 : 20);
  ctx.save();
  ctx.strokeStyle = '#aaddff44';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.arc(px, py, novaR, 0, Math.PI*2); ctx.stroke();
  ctx.globalAlpha = novaRatio > 0.9 ? 0.9 + 0.1 * Math.sin(t*8) : 0.75;
  ctx.strokeStyle = novaRatio >= 1 ? '#ffffff' : '#aaddff';
  ctx.lineWidth = novaRatio >= 1 ? 2.5 : 1.8;
  ctx.beginPath();
  ctx.arc(px, py, novaR, -Math.PI/2, -Math.PI/2 + Math.PI*2*novaRatio);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Nova Solar flash (white explosion pulse when it fires) ──
  const novaFlash = tower.arcNovaFlashTimer || 0;
  if (novaFlash > 0) {
    const flashAlpha = novaFlash / 0.5;
    const flashR = stats.novaRadius * (1 - flashAlpha * 0.4);
    ctx.save();
    ctx.globalAlpha = flashAlpha * 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(px, py, flashR, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = flashAlpha * 0.3;
    ctx.strokeStyle = '#ffcc44'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(px, py, flashR, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  // HUD charge counter
  if (!isOver && !isStab && charges > 0) {
    ctx.fillStyle = chargeRatio > 0.7 ? '#ff4400' : '#ffaa00';
    ctx.font = `bold ${Math.round(s*0.34)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${charges}/${chargeThreshold}`, px, py + coreR + 9);
  }
  if (isOver) {
    ctx.fillStyle = '#ff2200';
    ctx.font = `bold ${Math.round(s*0.35)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OVER!', px, py + coreR + 9);
  }
}

function drawInvestidorModel(ctx, px, py, s, t, tower, stats) {
  const mult = stats.multiplier || 1.0;
  const lvl  = tower.level || 1;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
  const farmerCount = state.towers.filter(x=>x.type==='farmer'||x.type==='hypefarmer').length;

  // Green aura — grows with multiplier
  if (farmerCount > 0) {
    const auraR = s * (1.0 + (mult - 1.5) * 0.4 + pulse * 0.18);
    const ag = ctx.createRadialGradient(px, py, auraR*0.3, px, py, auraR);
    ag.addColorStop(0, `rgba(40,220,80,${0.18 + pulse*0.12})`);
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(px, py, auraR, 0, Math.PI*2); ctx.fill();
  }

  // Body — green rounded rect
  const bw = s*0.82, bh = s*0.64;
  ctx.fillStyle = '#1a7a34';
  ctx.shadowColor = '#44ff88'; ctx.shadowBlur = 10 + pulse * 8;
  ctx.beginPath();
  ctx.roundRect(px - bw/2, py - bh/2, bw, bh, 5);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Briefcase handle
  ctx.strokeStyle = '#88ffaa'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py - bh/2 - 4, bw*0.22, Math.PI, 0);
  ctx.stroke();

  // Latch
  ctx.fillStyle = '#ffcc44';
  ctx.fillRect(px - 3, py - 4, 6, 7);

  // Multiplier label
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(s*0.28)}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`x${mult}`, px, py + bh/2 + 10);

  // Connected farm rings (one per nearby farmer)
  if (farmerCount > 0) {
    const ringR = s * (0.8 + lvl * 0.1) + pulse * 4;
    ctx.strokeStyle = `rgba(68,255,136,${0.3 + pulse*0.2})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(px, py, ringR, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawGojoModel(ctx, px, py, s, t, tower, stats) {
  const firing = tower.firing > 0;
  const technique = tower.lastTechnique || stats.technique || 'infinity';
  const sc = s / 28;
  const bob = Math.sin(t * 1.6) * 1.0;
  const auraT = globalTime;

  ctx.save();
  ctx.translate(px, py + bob);

  // === AURA BASE (always pulsing) ===
  const auraSize = 14*sc + Math.sin(auraT * 3) * 2*sc;
  const auraAlpha = 0.12 + Math.sin(auraT * 4) * 0.06;
  ctx.save();
  ctx.globalAlpha = auraAlpha;
  const auraGrad = ctx.createRadialGradient(0, 0, 2*sc, 0, 0, auraSize);
  auraGrad.addColorStop(0, '#cc00ff');
  auraGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = auraGrad;
  ctx.beginPath(); ctx.arc(0, 0, auraSize, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // === INFINITY SYMBOL (floating, rotating) ===
  ctx.save();
  ctx.globalAlpha = 0.25 + Math.sin(auraT * 2) * 0.1;
  ctx.strokeStyle = '#b07aff';
  ctx.lineWidth = 1.2*sc;
  const inf = 9*sc;
  // Draw ∞ as two overlapping circles rotated
  ctx.translate(0, -20*sc);
  ctx.rotate(auraT * 0.5);
  ctx.beginPath();
  ctx.arc(-inf*0.5, 0, inf*0.5, 0, Math.PI*2);
  ctx.arc( inf*0.5, 0, inf*0.5, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();

  // === LEGS (black pants) ===
  const legSwing = Math.sin(t * 1.6) * 0.25;
  ctx.fillStyle = '#111';
  ctx.save();
  ctx.translate(-3*sc, 5*sc);
  ctx.rotate(legSwing * 0.12);
  ctx.fillRect(-2.5*sc, 0, 5*sc, 7*sc);
  ctx.fillStyle = '#222'; ctx.fillRect(-2.5*sc, 6*sc, 5*sc, 2*sc); // shoe
  ctx.restore();
  ctx.fillStyle = '#111';
  ctx.save();
  ctx.translate(3*sc, 5*sc);
  ctx.rotate(-legSwing * 0.12);
  ctx.fillRect(-2.5*sc, 0, 5*sc, 7*sc);
  ctx.fillStyle = '#222'; ctx.fillRect(-2.5*sc, 6*sc, 5*sc, 2*sc);
  ctx.restore();

  // === BODY (black suit + white collar) ===
  ctx.fillStyle = '#111';
  ctx.fillRect(-6*sc, -5*sc, 12*sc, 11*sc);
  // Suit lapels
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-1*sc, -5*sc); ctx.lineTo(-4*sc, -2*sc); ctx.lineTo(0, -1*sc); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1*sc, -5*sc); ctx.lineTo(4*sc, -2*sc); ctx.lineTo(0, -1*sc); ctx.closePath();
  ctx.fill();
  // Tie
  ctx.fillStyle = '#7b2fff';
  ctx.beginPath();
  ctx.moveTo(0, -1*sc); ctx.lineTo(-1.5*sc, 2*sc); ctx.lineTo(0, 5*sc); ctx.lineTo(1.5*sc, 2*sc);
  ctx.closePath(); ctx.fill();

  // === ARMS ===
  // Left arm
  ctx.fillStyle = '#111';
  const lArmRot = firing && technique === 'infinity'
    ? Math.sin(t * 20) * 0.3
    : Math.sin(t * 1.6) * 0.1;
  ctx.save();
  ctx.translate(-8*sc, -2*sc);
  ctx.rotate(lArmRot);
  ctx.fillRect(0, 0, 3*sc, 8*sc);
  // Hand glow (infinity technique)
  const handGlow = technique === 'infinity' ? '#b07aff' : (technique === 'blue' ? '#4488ff' : '#ff00ff');
  ctx.shadowColor = handGlow;
  ctx.shadowBlur = firing ? 14 : 5;
  ctx.fillStyle = handGlow;
  ctx.beginPath(); ctx.arc(1.5*sc, 9*sc, 2.5*sc, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Right arm
  ctx.fillStyle = '#111';
  const rArmRot = firing && technique !== 'infinity'
    ? -Math.PI/4 + Math.sin(t*15)*0.2
    : Math.sin(t * 1.6 + 1) * 0.1;
  ctx.save();
  ctx.translate(5*sc, -2*sc);
  ctx.rotate(rArmRot);
  ctx.fillRect(0, 0, 3*sc, 8*sc);
  // Right hand glow
  ctx.shadowColor = handGlow;
  ctx.shadowBlur = firing ? 14 : 5;
  ctx.fillStyle = handGlow;
  ctx.beginPath(); ctx.arc(1.5*sc, 9*sc, 2.5*sc, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === HEAD ===
  // Skin
  ctx.fillStyle = '#f0c880';
  ctx.beginPath(); ctx.arc(0, -11*sc, 5*sc, 0, Math.PI*2); ctx.fill();

  // === WHITE HAIR ===
  ctx.fillStyle = '#ffffff';
  // Top puff
  ctx.beginPath();
  ctx.arc(0, -15*sc, 4.5*sc, Math.PI, 0);
  ctx.fill();
  // Side tufts
  ctx.beginPath();
  ctx.arc(-4*sc, -13*sc, 3*sc, Math.PI, Math.PI*1.8);
  ctx.arc( 4*sc, -13*sc, 3*sc, Math.PI*1.2, 0);
  ctx.fill();
  // Hair that moves
  ctx.beginPath();
  ctx.arc(-1.5*sc + Math.sin(t*2)*sc, -17*sc, 2*sc, 0, Math.PI*2);
  ctx.arc( 1.5*sc + Math.cos(t*2)*sc, -17*sc, 2*sc, 0, Math.PI*2);
  ctx.fill();

  // === BLINDFOLD ===
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(-5.5*sc, -13*sc, 11*sc, 3.5*sc);
  // Blindfold shine
  ctx.fillStyle = 'rgba(150,120,255,0.3)';
  ctx.fillRect(-5.5*sc, -13*sc, 11*sc, 1*sc);
  // Eyes peeking (six-eyes glow)
  ctx.fillStyle = '#7b2fff';
  ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = 8;
  ctx.fillRect(-3.5*sc, -12.8*sc, 2.5*sc, 1.5*sc);
  ctx.fillRect(1*sc, -12.8*sc, 2.5*sc, 1.5*sc);
  ctx.shadowBlur = 0;

  // Smirk
  ctx.strokeStyle = '#c07050';
  ctx.lineWidth = sc * 0.9;
  ctx.beginPath();
  ctx.arc(1.5*sc, -9.2*sc, 2.5*sc, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // === ATTACK VISUAL EFFECTS ===
  if (firing) {
    if (technique === 'infinity') {
      // Pulsing infinity rings
      const rings = Math.floor(tower.firing * 12);
      for (let i = 0; i < Math.min(rings, 5); i++) {
        ctx.globalAlpha = 0.4 - i * 0.07;
        ctx.strokeStyle = '#b07aff';
        ctx.lineWidth = (2 - i * 0.3)*sc;
        ctx.beginPath();
        ctx.arc(0, 0, (8 + i * 4)*sc, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

    } else if (technique === 'blue') {
      // Blue void implosion effect around hands
      ctx.save();
      ctx.globalAlpha = tower.firing * 0.8;
      ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 20;
      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.arc(-6.5*sc, 7*sc, (4 + tower.firing * 6)*sc, 0, Math.PI*2);
      ctx.arc( 6.5*sc, 7*sc, (4 + tower.firing * 6)*sc, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

    } else if (technique === 'purple') {
      // Hollow Purple — massive glowing orb
      ctx.save();
      const orb = tower.firing * 18;
      const purpleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orb*sc);
      purpleGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
      purpleGrad.addColorStop(0.3, 'rgba(200,0,255,0.8)');
      purpleGrad.addColorStop(1, 'rgba(100,0,200,0)');
      ctx.fillStyle = purpleGrad;
      ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 30;
      ctx.globalAlpha = tower.firing;
      ctx.beginPath(); ctx.arc(0, 0, orb*sc*2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore(); // main translate
}

function drawTowers() { state.towers.forEach(drawTower); }

// ===========================
//   ENEMY DRAWING (animated walk)
// ===========================
function drawEnemies() {
  state.enemies.forEach(e=>{
    if(e.dead||e.reached) return;
    const {x,y,size:r}=e;
    ctx.save();
    if(e.flashTimer>0){ ctx.shadowColor='#fff'; ctx.shadowBlur=14; }
    if(e.isBoss){ ctx.shadowColor=e.color; ctx.shadowBlur=20; }
    if(e.isInfiniteBoss){ ctx.shadowBlur=35; } // extra dramatic glow

    // Void phase: flickering transparency
    if(e.voidActive){
      ctx.globalAlpha = 0.3 + Math.sin(globalTime*20)*0.25;
      ctx.shadowColor='#ff00ff'; ctx.shadowBlur=40;
    }

    // Titan root aura
    if(e.ability==='titan' && state.titanDebuff){
      ctx.save();
      ctx.globalAlpha=0.2; ctx.strokeStyle='#228833'; ctx.lineWidth=3;
      for(let i=1;i<=3;i++){
        ctx.beginPath(); ctx.arc(x,y,r+i*14,0,Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }

    // Sukuna domain warning ring
    if(e.ability==='sukuna'){
      const pulse = 0.1+Math.abs(Math.sin(globalTime*3))*0.12;
      ctx.save(); ctx.globalAlpha=pulse; ctx.strokeStyle='#ff3333'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x,y,180,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }

    // Shield aura
    if(e.shieldHp>0){
      ctx.save();
      ctx.globalAlpha=0.25; ctx.fillStyle='#aaccff';
      ctx.beginPath(); ctx.arc(x,y,r+8,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=0.6; ctx.strokeStyle='#aaccff'; ctx.lineWidth=2; ctx.stroke();
      ctx.restore();
    }

    // Leg wobble for regular enemies
    const wt = e.walkTime || 0;
    if(!e.isBoss){
      const legOff = Math.sin(wt * 8) * (r * 0.35);
      // Shadow
      ctx.globalAlpha=0.2; ctx.fillStyle='#000';
      ctx.beginPath(); ctx.ellipse(x,y+r+1,r*0.8,r*0.25,0,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
      // Left leg
      ctx.fillStyle = e.flashTimer>0?'#fff':e.color;
      ctx.fillRect(x-r*0.55, y+r*0.5, r*0.45, r*0.55 + legOff);
      // Right leg
      ctx.fillRect(x+r*0.1, y+r*0.5, r*0.45, r*0.55 - legOff);
    }

    // Body
    if(e.isBoss){
      ctx.fillStyle=e.flashTimer>0?'#fff':e.color;
      const sides = e.isInfiniteBoss ? 8 : 6;
      const rotOffset = e.isInfiniteBoss ? (globalTime * 0.4) : -Math.PI/6;
      ctx.beginPath();
      for(let i=0;i<sides;i++){
        const a=i*Math.PI*2/sides + rotOffset;
        if(i===0) ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a));
        else ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));
      }
      ctx.closePath(); ctx.fill();
      // Infinite bosses get a second inner ring
      if(e.isInfiniteBoss){
        ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=2.5; ctx.stroke();
        ctx.save();
        ctx.globalAlpha=0.3;
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.5;
        ctx.beginPath();
        for(let i=0;i<sides;i++){
          const a=i*Math.PI*2/sides + rotOffset + Math.PI/sides;
          if(i===0) ctx.moveTo(x+r*0.6*Math.cos(a),y+r*0.6*Math.sin(a));
          else ctx.lineTo(x+r*0.6*Math.cos(a),y+r*0.6*Math.sin(a));
        }
        ctx.closePath(); ctx.stroke();
        ctx.restore();
      } else {
        ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2; ctx.stroke();
      }
      // Crown emoji
      ctx.font=`${Math.floor(r*0.85)}px sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(e.crown,x,y);
    } else {
      // Squash on bounce
      const squash = 1 + Math.sin(wt * 8) * 0.08;
      ctx.fillStyle=e.flashTimer>0?'#fff':e.color;
      ctx.beginPath();
      ctx.ellipse(x, y, r*squash, r/squash, 0, 0, Math.PI*2);
      ctx.fill();
      // Armadura (Cavaleiro Sombrio, etc.): contorno metálico mais grosso em vez do
      // contorno fino padrão, pra sinalizar "isso resiste a dano" à primeira vista.
      if (e.armorReduction > 0) {
        ctx.strokeStyle='rgba(210,220,235,0.85)'; ctx.lineWidth=2.5; ctx.stroke();
      } else {
        ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=1.5; ctx.stroke();
      }

      // Simple eyes (cute)
      ctx.fillStyle='rgba(0,0,0,0.7)';
      const eyeOffset = e.facingDir > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.arc(x + eyeOffset*r*0.3 - r*0.1, y - r*0.2, r*0.18, 0, Math.PI*2);
      ctx.arc(x + eyeOffset*r*0.3 + r*0.25, y - r*0.2, r*0.18, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();

    // Freeze overlay
    if (e.frozen) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#88ddff';
      ctx.beginPath(); ctx.arc(x, y, r+2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    // Poison overlay
    if (e.poisoned) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#66cc44';
      ctx.beginPath(); ctx.arc(x, y, r+2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    // Vulnerable overlay (Corrosivo) — anel pulsante ácido em vez de preenchimento,
    // pra não ser confundido com o preenchimento sólido do veneno.
    if (e.vulnerable) {
      ctx.save();
      const pulse = 0.5 + Math.sin(globalTime*6)*0.25;
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#d4ff4d';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r+4, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }

    // Burn flame visual (Arcturus)
    if (e.burning) {
      const bAlpha = 0.3 + 0.25 * Math.sin(Date.now() * 0.012 + e.x * 0.05);
      const bGrad = ctx.createRadialGradient(x, y - r*0.4, 1, x, y, r * 1.5);
      bGrad.addColorStop(0, 'rgba(255,200,50,'+( bAlpha + 0.2 )+')');
      bGrad.addColorStop(0.5, 'rgba(255,80,0,'+bAlpha+')');
      bGrad.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI*2); ctx.fill();
    }
    // HP bar
    const bw=r*2.6+(e.isBoss?14:0);
    const bh=e.isBoss?7:4;
    const bx=x-bw/2, by=y-r-(e.isBoss?16:10);
    ctx.fillStyle='#111'; ctx.fillRect(bx,by,bw,bh);
    const pct=e.hp/e.maxHp;
    ctx.fillStyle=pct>0.5?'#4ecb71':(pct>0.25?'#f5a623':'#e74c3c');
    ctx.fillRect(bx,by,bw*pct,bh);
    if(e.shieldHp>0){
      const sw=bw*(e.shieldHp/(e.maxHp*0.2));
      ctx.fillStyle='#aaccff';
      ctx.fillRect(bx,by-bh-2,sw,bh);
    }
    if(e.isBoss){
      ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillStyle='#ff8888'; ctx.fillText(e.name,x,by-2);
    }
  });
}

function drawProjectiles() {
  state.projectiles.forEach(p=>{
    ctx.save();
    if (p.isGojo) {
      // Gojo projectile: special render
      if (p.gojoType === 'blue') {
        // Blue void — swirling blue orb
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#4488ff');
        grad.addColorStop(1, 'rgba(0,50,200,0)');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        // Orbit ring
        ctx.strokeStyle = '#aaddff'; ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI*2); ctx.stroke();
      } else if (p.gojoType === 'purple') {
        // Hollow Purple — massive purple+white swirling orb
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ff00ff');
        grad.addColorStop(0.7, '#7700cc');
        grad.addColorStop(1, 'rgba(80,0,100,0)');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 35;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI*2); ctx.fill();
        // Extra outer glow ring
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ff88ff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI*2); ctx.stroke();
      }
    } else if (p.isPierceBolt) {
      // Arpão: traço fino na direção do movimento em vez de uma bolinha —
      // o dano já foi aplicado no disparo, isso é puramente visual.
      const dx=p.tx-p.x, dy=p.ty-p.y; const d=Math.sqrt(dx*dx+dy*dy)||1;
      const ux=dx/d, uy=dy/d;
      ctx.strokeStyle=p.color; ctx.lineWidth=3; ctx.lineCap='round';
      ctx.shadowColor=p.color; ctx.shadowBlur=10;
      ctx.beginPath();
      ctx.moveTo(p.x-ux*14, p.y-uy*14);
      ctx.lineTo(p.x+ux*4,  p.y+uy*4);
      ctx.stroke();
    } else if (p.isMortar) {
      // Mortar shell: dark bomb body with a faint smoke trail and a
      // pulsing fuse glow, distinct from the regular round projectiles.
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(p.x - (p.tx-p.x)*0.04, p.y - (p.ty-p.y)*0.04, p.size*0.4, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size/2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(p.x, p.y - p.size*0.15, p.size*0.18, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  });
}

function drawParticles() {
  state.particles.forEach(p=>{
    const a=p.life/p.maxLife;
    ctx.save(); ctx.globalAlpha=a;
    if(p.ring){
      ctx.strokeStyle=p.color; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size*(1-a)+2,0,Math.PI*2); ctx.stroke();
    } else {
      ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  });
}

function drawFloatTexts() {
  state.floatTexts.forEach(f=>{
    const a=Math.min(1,f.life/f.maxLife*2);
    ctx.save(); ctx.globalAlpha=a;
    ctx.fillStyle=f.color; ctx.font='bold 13px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='#000'; ctx.shadowBlur=5;
    ctx.fillText(f.text,f.x,f.y);
    ctx.restore();
  });
}

// ===========================
//   HELPERS
// ===========================
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

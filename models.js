// ============================================================
//  BLOCK TD — MODELOS DE PERSONAGENS v2
//  ------------------------------------------------------------
//  Este arquivo é carregado DEPOIS de proj.js e substitui todas
//  as funções draw*Model (redesenhadas) e adiciona modelos novos
//  para as torres que antes só mostravam o emoji do ícone.
//  Também substitui drawTower() para incluir os novos tipos no
//  switch. Nenhuma lógica de jogo (dano, custo, etc) é alterada
//  aqui — é 100% visual.
//
//  Convenção usada em todo modelo:
//    const lvl = tower.level || 1;
//  e cada nível troca peça de arma/armadura de verdade (silhueta
//  diferente), não só cor — conforme pedido.
// ============================================================

// ---- helpers pequenos reaproveitados por vários modelos ----
function mLerp(a, b, t) { return a + (b - a) * t; }
function mGlow(ctx, color, blur, fn) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  fn();
  ctx.restore();
}
// desenha uma estrela simples de n pontas (usada em vários efeitos "mítico")
function mStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerR, y = cy + Math.sin(rot) * outerR;
    ctx.lineTo(x, y); rot += step;
    x = cx + Math.cos(rot) * innerR; y = cy + Math.sin(rot) * innerR;
    ctx.lineTo(x, y); rot += step;
  }
  ctx.closePath();
}

// ============================================================
//  TORRES BASE (existentes) — redesenhadas com variação forte
//  de armadura/arma por nível
// ============================================================

// ---- ARQUEIRO ----
function drawArcherModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t * 2.2) * 1.0;
  const draw = firing ? Math.min(1, (0.3 - tower.firing) / 0.3) : 0.15 + Math.sin(t * 2.2) * 0.1;

  ctx.save();
  ctx.translate(px, py + bob);

  const tunic = lvl === 1 ? '#3d7a3d' : lvl === 2 ? '#2c6b4a' : '#1d4a2e';
  const trim = lvl === 1 ? '#69a55a' : lvl === 2 ? '#c9d6dd' : '#ffdd66';
  const skin = '#f0c080';

  if (lvl === 3) {
    ctx.fillStyle = '#12331f';
    ctx.beginPath();
    ctx.moveTo(-6*sc,-6*sc); ctx.lineTo(-11*sc,10*sc); ctx.lineTo(11*sc,10*sc); ctx.lineTo(6*sc,-6*sc);
    ctx.closePath(); ctx.fill();
  }

  const legSwing = Math.sin(t*2.2)*0.3;
  [-3,3].forEach((dx,i)=>{
    ctx.save();
    ctx.translate(dx*sc, 5*sc);
    ctx.rotate((i===0?1:-1)*legSwing*0.1);
    ctx.fillStyle = '#4a3a20';
    ctx.fillRect(-2*sc,0,4*sc,6*sc);
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(-2.3*sc,5.5*sc,4.6*sc,2*sc);
    ctx.restore();
  });

  ctx.save();
  ctx.translate(-6*sc,-4*sc);
  ctx.rotate(-0.3);
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-2*sc,-2*sc,4*sc,(6+lvl*2)*sc);
  ctx.fillStyle = trim;
  for (let i=0;i<lvl+1;i++){ ctx.fillRect(-1.6*sc + i*1.2*sc, -6*sc, 0.8*sc, 4*sc); }
  ctx.restore();

  ctx.fillStyle = tunic;
  ctx.fillRect(-5.5*sc,-4*sc,11*sc,9*sc);
  ctx.fillStyle = trim;
  ctx.fillRect(-5.5*sc,-4*sc,11*sc,2*sc);
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-5.5*sc,3*sc,11*sc,1.5*sc);

  if (lvl===3){
    ctx.fillStyle = trim;
    ctx.beginPath(); ctx.arc(-6*sc,-4*sc,2.2*sc,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6*sc,-4*sc,2.2*sc,0,Math.PI*2); ctx.fill();
  }

  ctx.fillStyle = tunic;
  ctx.fillRect(-7*sc,-3*sc,3*sc,6*sc);

  ctx.save();
  ctx.translate(6*sc,-1*sc);
  ctx.rotate(-0.15);
  if (lvl===1){
    ctx.strokeStyle = '#7a5220'; ctx.lineWidth = 1.6*sc;
    ctx.beginPath(); ctx.moveTo(0,-11*sc); ctx.quadraticCurveTo(6*sc,0,0,11*sc); ctx.stroke();
  } else if (lvl===2){
    ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 1.8*sc;
    ctx.beginPath();
    ctx.moveTo(2*sc,-12*sc); ctx.quadraticCurveTo(7*sc,-6*sc,5*sc,0);
    ctx.quadraticCurveTo(7*sc,6*sc,2*sc,12*sc); ctx.stroke();
  } else {
    ctx.shadowColor = '#ffe680'; ctx.shadowBlur = 8;
    ctx.strokeStyle = '#e8c862'; ctx.lineWidth = 2*sc;
    ctx.beginPath();
    ctx.moveTo(3*sc,-13*sc); ctx.quadraticCurveTo(9*sc,-6*sc,6*sc,0);
    ctx.quadraticCurveTo(9*sc,6*sc,3*sc,13*sc); ctx.stroke();
    ctx.shadowBlur = 0;
  }
  const pull = draw * 5*sc;
  const tipY = lvl===1?11:lvl===2?12:13;
  ctx.strokeStyle = lvl===3 ? '#fff2b0' : '#ddd';
  ctx.lineWidth = 0.7*sc;
  ctx.beginPath();
  ctx.moveTo(lvl===1?0:(lvl===2?2*sc:3*sc), -tipY*sc);
  ctx.lineTo(-pull, 0);
  ctx.lineTo(lvl===1?0:(lvl===2?2*sc:3*sc), tipY*sc);
  ctx.stroke();
  if (draw > 0.05){
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 1*sc;
    ctx.beginPath(); ctx.moveTo(-pull,0); ctx.lineTo(9*sc,0); ctx.stroke();
    ctx.fillStyle = lvl===3 ? '#ffdd66' : '#999';
    ctx.beginPath();
    ctx.moveTo(9*sc,0); ctx.lineTo(6*sc,-1.3*sc); ctx.lineTo(6*sc,1.3*sc);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0,-9*sc,4.3*sc,0,Math.PI*2); ctx.fill();
  if (lvl>=2){
    ctx.fillStyle = tunic;
    ctx.beginPath(); ctx.arc(0,-10*sc,5*sc,Math.PI*0.85,Math.PI*2.15); ctx.fill();
  } else {
    ctx.fillStyle = '#7a4a1a';
    ctx.beginPath(); ctx.arc(0,-12*sc,4*sc,Math.PI,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = '#222';
  ctx.fillRect(-2.2*sc,-9.5*sc,1.6*sc,1.4*sc);
  ctx.fillRect(0.6*sc,-9.5*sc,1.6*sc,1.4*sc);

  if (firing){
    ctx.globalAlpha = tower.firing*0.5;
    ctx.fillStyle = trim;
    ctx.beginPath(); ctx.arc(0,0,11*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ---- GLADIADOR ----
function drawGladiatorModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*2.2)*1.1;
  ctx.save();
  ctx.translate(px, py+bob);

  const armor = lvl===1?'#c8860a':lvl===2?'#9aa0a8':'#e8c020';
  const armorHi = lvl===1?'#e8a020':lvl===2?'#c8d0d8':'#fff2a0';
  const shieldCol = lvl===1?'#8a4a20':lvl===2?'#556a80':'#cc3300';

  const legSwing = Math.sin(t*2.2)*0.4;
  [-3,3].forEach((dx,i)=>{
    ctx.save();
    ctx.translate(dx*sc,6*sc);
    ctx.rotate((i===0?1:-1)*legSwing*0.15);
    ctx.fillStyle = lvl===3?'#8a6a10':'#5a4010';
    ctx.fillRect(-2.5*sc,0,5*sc,6*sc);
    ctx.fillStyle = '#3a2a00';
    ctx.fillRect(-3*sc,5*sc,6*sc,2.5*sc);
    ctx.restore();
  });

  if (lvl===3){
    ctx.fillStyle = '#8a0000';
    ctx.beginPath();
    ctx.moveTo(-6*sc,-4*sc); ctx.lineTo(-9*sc,9*sc); ctx.lineTo(-3*sc,9*sc); ctx.lineTo(-4*sc,-3*sc);
    ctx.closePath(); ctx.fill();
  }

  ctx.fillStyle = armor;
  ctx.fillRect(-6*sc,-4*sc,12*sc,9*sc);
  ctx.fillStyle = armorHi;
  ctx.fillRect(-5*sc,-3*sc,10*sc,5*sc);
  ctx.fillStyle = '#5a3a00';
  ctx.fillRect(-6*sc,4*sc,12*sc,2*sc);
  if (lvl>=2){
    ctx.fillStyle = armorHi;
    ctx.beginPath(); ctx.arc(0,-2*sc,2*sc,0,Math.PI*2); ctx.fill();
  }

  ctx.save();
  ctx.translate(-8*sc,-1*sc);
  if (lvl===1){
    ctx.fillStyle = shieldCol;
    ctx.beginPath(); ctx.arc(0,0,4.5*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c8860a';
    ctx.beginPath(); ctx.arc(0,0,1.5*sc,0,Math.PI*2); ctx.fill();
  } else if (lvl===2){
    ctx.fillStyle = shieldCol;
    roundRect(ctx,-3*sc,-6*sc,6*sc,12*sc,2*sc); ctx.fill();
    ctx.strokeStyle = '#dde6ee'; ctx.lineWidth = 0.8*sc;
    ctx.strokeRect(-3*sc,-6*sc,6*sc,12*sc);
  } else {
    ctx.fillStyle = shieldCol;
    roundRect(ctx,-4*sc,-7.5*sc,8*sc,15*sc,2*sc); ctx.fill();
    ctx.fillStyle = '#ffaa44';
    mStar(ctx,0,0,5,2.4*sc,1*sc); ctx.fill();
  }
  ctx.restore();

  const swingAngle = firing
    ? -Math.PI/2 + (1 - tower.firing/0.22)*(Math.PI*0.85)
    : -Math.PI/4 + Math.sin(t*2.2)*0.18;
  ctx.save();
  ctx.translate(6*sc,-2*sc);
  ctx.rotate(swingAngle);
  ctx.fillStyle = '#3a2200';
  ctx.fillRect(-1.2*sc,0,2.4*sc,5*sc);
  ctx.fillStyle = '#888';
  ctx.fillRect(-4*sc,-1*sc,8*sc,2*sc);
  const bladeLen = lvl===1?11:lvl===2?15:19;
  if (lvl===3){ ctx.shadowColor='#ff8800'; ctx.shadowBlur=10; }
  ctx.fillStyle = lvl===3?'#ffb060':'#ddeeff';
  ctx.beginPath();
  ctx.moveTo(-1.5*sc,-1*sc); ctx.lineTo(1.5*sc,-1*sc);
  ctx.lineTo(0.6*sc,-bladeLen*sc); ctx.lineTo(-0.6*sc,-bladeLen*sc);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.fillStyle = armor;
  ctx.fillRect(-2.5*sc,-9*sc,5*sc,3*sc);
  ctx.fillStyle = lvl===3?'#ddd':'#888';
  ctx.beginPath(); ctx.arc(0,-12*sc,5*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#555';
  ctx.fillRect(-4*sc,-12.5*sc,8*sc,2.5*sc);

  if (lvl===3){
    ctx.fillStyle = '#eee';
    [-1,1].forEach(dir=>{
      ctx.beginPath();
      ctx.moveTo(dir*4*sc,-14*sc);
      ctx.quadraticCurveTo(dir*10*sc,-18*sc+Math.sin(t*3)*sc, dir*5*sc,-11*sc);
      ctx.closePath(); ctx.fill();
    });
  }
  const plumeColors = ['#cc3300','#4488ff','#ffdd00'];
  ctx.fillStyle = plumeColors[lvl-1];
  ctx.beginPath();
  ctx.moveTo(-1.5*sc,-17*sc);
  ctx.quadraticCurveTo(3*sc,-19*sc+Math.sin(t*3)*sc,1*sc,-12*sc);
  ctx.quadraticCurveTo(-1*sc,-13*sc,-2*sc,-17*sc);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#ff6600';
  ctx.fillRect(-3*sc,-12.8*sc,2*sc,1.2*sc);
  ctx.fillRect(1*sc,-12.8*sc,2*sc,1.2*sc);

  if (firing){
    ctx.globalAlpha = tower.firing*0.35;
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(0,0,12*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ---- MAGO ----
function drawMageModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t * 1.8) * 0.9;
  const orbFloat = Math.sin(t * 2.8) * 2.5;

  ctx.save();
  ctx.translate(px, py + bob);

  const robeCol = lvl===1 ? '#5a4a3a' : lvl===2 ? '#6a2a8a' : '#2a1a5a';
  const robeHi  = lvl===1 ? '#7a6a4a' : lvl===2 ? '#8b3aaa' : '#5a3aaa';
  const trimCol = lvl===1 ? '#a89060' : lvl===2 ? '#d9a7f5' : '#ffd966';

  ctx.fillStyle = robeCol;
  ctx.beginPath();
  ctx.moveTo(-7*sc,-3*sc); ctx.lineTo(7*sc,-3*sc); ctx.lineTo(9*sc,12*sc); ctx.lineTo(-9*sc,12*sc);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = robeHi;
  ctx.fillRect(-5*sc,-2*sc,10*sc,6*sc);
  ctx.strokeStyle = trimCol; ctx.lineWidth = sc;
  ctx.beginPath();
  ctx.moveTo(-7*sc,-3*sc); ctx.lineTo(-9*sc,12*sc);
  ctx.moveTo(7*sc,-3*sc); ctx.lineTo(9*sc,12*sc);
  ctx.stroke();

  if (lvl===3){
    ctx.fillStyle = trimCol;
    for (let i=0;i<3;i++){
      ctx.beginPath(); ctx.arc(0, i*3.5*sc, 0.9*sc, 0, Math.PI*2); ctx.fill();
    }
  }

  const staffSway = Math.sin(t*1.8)*0.08;
  ctx.save();
  ctx.translate(7*sc,2*sc);
  ctx.rotate(staffSway);
  ctx.strokeStyle = lvl===3 ? '#3a2a6a' : '#6b3a00';
  ctx.lineWidth = 2*sc;
  ctx.beginPath(); ctx.moveTo(0,8*sc); ctx.lineTo(0,-20*sc); ctx.stroke();

  if (lvl===1){
    ctx.fillStyle = '#c9a877';
    ctx.beginPath(); ctx.arc(0,-19*sc,2*sc,0,Math.PI*2); ctx.fill();
  } else {
    const gemGlow = firing ? 1.0 : 0.5 + Math.sin(t*3)*0.3;
    const gemCol = lvl===2 ? '200,120,255' : '255,200,80';
    ctx.shadowColor = `rgb(${gemCol})`; ctx.shadowBlur = 8*gemGlow;
    ctx.fillStyle = `rgba(${gemCol},${gemGlow})`;
    ctx.beginPath(); ctx.arc(0,-20*sc, (lvl===2?4:5)*sc, 0, Math.PI*2); ctx.fill();
    if (lvl===3){
      ctx.beginPath(); ctx.arc(-4*sc,-16*sc,1.8*sc,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(4*sc,-16*sc,1.8*sc,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = sc*0.8;
    ctx.beginPath();
    ctx.moveTo(-2*sc,-21*sc); ctx.lineTo(-1*sc,-20*sc);
    ctx.moveTo(0,-23*sc); ctx.lineTo(0,-22*sc);
    ctx.stroke();
  }
  ctx.restore();

  const orbCount = lvl===1?0:lvl===2?1:3;
  for (let i=0;i<orbCount;i++){
    const ang = t*1.4 + i*(Math.PI*2/Math.max(orbCount,1));
    const ox = Math.cos(ang)*(9+i)*sc;
    const oy = Math.sin(ang)*3*sc - 8*sc + orbFloat*0.4;
    ctx.save();
    ctx.globalAlpha = 0.6+Math.sin(t*2.8+i)*0.3;
    ctx.shadowColor = trimCol; ctx.shadowBlur = 10;
    ctx.fillStyle = trimCol;
    ctx.beginPath(); ctx.arc(ox,oy,2.6*sc,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = '#f0c080';
  ctx.beginPath(); ctx.arc(0,-9*sc,4.5*sc,0,Math.PI*2); ctx.fill();

  ctx.fillStyle = lvl===1?'#4a3a2a':lvl===2?'#5a1a7a':'#2a1a5a';
  ctx.beginPath();
  ctx.moveTo(-6*sc,-9*sc); ctx.lineTo(6*sc,-9*sc);
  ctx.lineTo(2*sc,(lvl===3?-24:-20)*sc + Math.sin(t*2)*0.8*sc);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = lvl===1?'#6a5a3a':lvl===2?'#7a2a9a':'#4a2a8a';
  ctx.fillRect(-7*sc,-10*sc,14*sc,2*sc);
  if (lvl>=2){
    ctx.fillStyle = '#ffdd00';
    ctx.font = `${5*sc}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', 0.5*sc, lvl===3?-19*sc:-15*sc);
  }

  const eyeCol = firing ? '#ff00ff' : (lvl===1?'#5a4a3a':'#cc88ff');
  ctx.fillStyle = eyeCol;
  ctx.beginPath();
  ctx.arc(-2*sc,-9.5*sc,1.2*sc,0,Math.PI*2);
  ctx.arc(2*sc,-9.5*sc,1.2*sc,0,Math.PI*2);
  ctx.fill();

  if (firing){
    ctx.globalAlpha = tower.firing*0.6;
    ctx.shadowColor = trimCol; ctx.shadowBlur = 20;
    ctx.fillStyle = trimCol;
    ctx.beginPath(); ctx.arc(0,0,12*sc,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ---- ATIRADOR (SNIPER) ----
function drawSniperModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.5)*0.6;
  const recoil = firing ? tower.firing/0.18*2.5 : 0;

  ctx.save();
  ctx.translate(px, py+bob);

  const jacket = lvl===1?'#3a4a3a':lvl===2?'#2a4a2a':'#33301f';
  const jacketHi = lvl===1?'#2a3a2a':lvl===2?'#1e3a1e':'#22200f';

  if (lvl===3){
    ctx.fillStyle = 'rgba(90,100,60,0.55)';
    for (let i=0;i<5;i++){
      ctx.beginPath();
      ctx.ellipse((Math.sin(i*2)*7)*sc, (-4+i*3)*sc, 4*sc, 2*sc, 0,0,Math.PI*2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#232323';
  ctx.fillRect(-5.5*sc,4*sc,11*sc,7*sc);
  ctx.fillStyle = '#111';
  ctx.fillRect(-6*sc,9.5*sc,5*sc,2.5*sc);
  ctx.fillRect(1*sc,9.5*sc,5*sc,2.5*sc);

  ctx.fillStyle = jacket;
  ctx.fillRect(-6*sc,-5*sc,12*sc,10*sc);
  ctx.fillStyle = jacketHi;
  ctx.fillRect(-5*sc,-2*sc,3*sc,3*sc);
  ctx.fillRect(2*sc,-2*sc,3*sc,3*sc);
  ctx.fillStyle = '#2a1a00';
  ctx.fillRect(-6*sc,4*sc,12*sc,1.5*sc);

  if (lvl>=2){
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-4.5*sc,-4*sc,9*sc,4*sc);
    ctx.fillStyle = '#333';
    ctx.fillRect(-3.5*sc,-3*sc,2.5*sc,2.5*sc);
    ctx.fillRect(1*sc,-3*sc,2.5*sc,2.5*sc);
  }

  const leanAngle = -0.22 + Math.sin(t*1.5)*0.04;
  ctx.save();
  ctx.translate(4*sc+recoil, -1*sc);
  ctx.rotate(leanAngle);
  ctx.fillStyle = '#5a3000';
  ctx.fillRect(-2*sc,2*sc,4*sc,5*sc);
  const barrelLen = lvl===1?18:lvl===2?22:27;
  ctx.fillStyle = '#222';
  ctx.fillRect(-1.5*sc,-barrelLen*sc+2*sc,3*sc,barrelLen*sc);
  ctx.fillStyle = '#333';
  ctx.fillRect(-0.8*sc,-barrelLen*sc-6*sc,1.6*sc,8*sc);
  ctx.fillStyle = '#555';
  ctx.fillRect(-1.5*sc,-barrelLen*sc-8*sc,3*sc,3*sc);
  if (lvl===3){
    ctx.strokeStyle = '#222'; ctx.lineWidth = 1*sc;
    ctx.beginPath();
    ctx.moveTo(0,-barrelLen*sc+4*sc); ctx.lineTo(-4*sc,-barrelLen*sc+10*sc);
    ctx.moveTo(0,-barrelLen*sc+4*sc); ctx.lineTo(4*sc,-barrelLen*sc+10*sc);
    ctx.stroke();
  }
  ctx.fillStyle = '#111';
  ctx.fillRect(1.5*sc,-13*sc,(3+lvl)*sc,2*sc);
  ctx.fillStyle = lvl===3?'#ff3333':'#0044aa';
  ctx.fillRect(2*sc,-13.2*sc,2*sc,1.5*sc);

  if (firing && tower.firing>0.08){
    ctx.globalAlpha = tower.firing*1.2;
    ctx.shadowColor = '#aad4ff'; ctx.shadowBlur = 15;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0,-barrelLen*sc-7*sc,3.5*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#aad4ff';
    ctx.beginPath(); ctx.arc(0,-barrelLen*sc-7*sc,2*sc,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
  ctx.restore();

  ctx.fillStyle = jacket;
  ctx.fillRect(-6*sc,-3*sc,4*sc,2.5*sc);
  ctx.fillRect(2*sc,-3*sc,6*sc,2.5*sc);

  ctx.fillStyle = '#f0c080';
  ctx.beginPath(); ctx.arc(0,-10*sc,4.5*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = jacket;
  ctx.beginPath(); ctx.arc(0,-12*sc,5*sc,Math.PI,Math.PI*2); ctx.fill();
  ctx.fillRect(-5*sc,-12.5*sc,10*sc,2*sc);
  ctx.fillStyle = lvl===3?'#8a1a1a':'#ffdd00';
  ctx.beginPath(); ctx.arc(-2*sc,-12.5*sc,1.5*sc,0,Math.PI*2); ctx.fill();

  ctx.fillStyle = '#000';
  ctx.fillRect(-2.5*sc,-10.5*sc,2*sc,1.5*sc);
  ctx.fillRect(0.5*sc,-10.5*sc,2*sc,1.5*sc);
  ctx.strokeStyle = '#aaddff'; ctx.lineWidth = sc*0.8;
  ctx.beginPath(); ctx.arc(1.5*sc,-9.8*sc,2*sc,0,Math.PI*2); ctx.stroke();

  ctx.restore();
}

// ---- FAZENDEIRO ----
function drawFarmerModel(ctx, px, py, s, t, tower) {
  const lvl = tower.level || 1;
  const sc = s / 28;
  const bob = Math.sin(t * 1.6) * 0.8;
  const toolSway = Math.sin(t * 1.6) * 0.22;

  ctx.save();
  ctx.translate(px, py + bob);

  const cropCount = lvl === 1 ? 2 : lvl === 2 ? 4 : 6;
  for (let i = 0; i < cropCount; i++) {
    const angle = (i / cropCount) * Math.PI * 2 + t * 0.3;
    const r = 12 * sc;
    const cx = Math.cos(angle) * r, cy = Math.sin(angle) * r;
    const growPhase = Math.sin(t * 2.2 + i * 1.1) * 0.15 + 0.85;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(growPhase, growPhase);
    ctx.strokeStyle = '#5a8a00'; ctx.lineWidth = 1.2*sc;
    ctx.beginPath(); ctx.moveTo(0,3*sc); ctx.lineTo(0,-3*sc); ctx.stroke();
    ctx.fillStyle = '#f5c518';
    ctx.beginPath(); ctx.ellipse(0,-4*sc,1.8*sc,3*sc,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4a8a00';
    ctx.beginPath(); ctx.ellipse(-2.5*sc,-1*sc,1.5*sc,0.7*sc,-0.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  const legSwing = Math.sin(t*1.6)*0.25;
  [-3,3].forEach((dx,i)=>{
    ctx.save();
    ctx.translate(dx*sc,5*sc);
    ctx.rotate((i===0?1:-1)*legSwing*0.12);
    ctx.fillStyle = lvl===3 ? '#5a4a20' : '#4a6aa0';
    ctx.fillRect(-2*sc,0,4*sc,6*sc);
    ctx.fillStyle = '#2a3a60';
    ctx.fillRect(-2.5*sc,5*sc,5*sc,2*sc);
    ctx.restore();
  });

  ctx.fillStyle = lvl===3 ? '#6a5220' : '#4a6aa0';
  ctx.fillRect(-5.5*sc,-5*sc,11*sc,11*sc);
  ctx.fillStyle = lvl===3 ? '#8a6a2a' : '#5a7ab0';
  ctx.fillRect(-3.5*sc,-4*sc,7*sc,6*sc);
  ctx.fillStyle = lvl===3 ? '#4a3a10' : '#3a5a90';
  ctx.fillRect(-3.5*sc,-5*sc,1.5*sc,2*sc);
  ctx.fillRect(2*sc,-5*sc,1.5*sc,2*sc);
  ctx.fillStyle = '#3a5a90';
  ctx.fillRect(-1.5*sc,-1*sc,3*sc,2.5*sc);
  // medalha/broche nível 2+
  if (lvl>=2){
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath(); ctx.arc(4*sc,-2*sc,1.4*sc,0,Math.PI*2); ctx.fill();
  }

  // --- FERRAMENTA (muda por nível: enxada -> forcado -> foice dourada) ---
  ctx.save();
  ctx.translate(7*sc,-1*sc);
  ctx.rotate(toolSway);
  ctx.strokeStyle = lvl===3?'#d4af37':'#8b5a00';
  ctx.lineWidth = 2*sc;
  ctx.beginPath(); ctx.moveTo(0,10*sc); ctx.lineTo(0,-14*sc); ctx.stroke();
  if (lvl===1){
    ctx.fillStyle = '#888'; ctx.fillRect(-4*sc,-15*sc,8*sc,2.5*sc);
    ctx.fillStyle = '#aaa'; ctx.fillRect(-3.5*sc,-14*sc,7*sc,1.2*sc);
  } else if (lvl===2){
    ctx.fillStyle = '#9aa0a8';
    [-3,0,3].forEach(dx=>{ ctx.fillRect(dx*sc-0.7*sc,-18*sc,1.4*sc,6*sc); });
    ctx.fillRect(-4*sc,-13*sc,8*sc,1.6*sc);
  } else {
    ctx.shadowColor = '#ffdd66'; ctx.shadowBlur = 8;
    ctx.fillStyle = '#f0d060';
    ctx.beginPath();
    ctx.moveTo(0,-13*sc); ctx.quadraticCurveTo(9*sc,-16*sc,7*sc,-24*sc);
    ctx.quadraticCurveTo(3*sc,-18*sc,0,-13*sc);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  ctx.fillStyle = lvl===3?'#6a5220':'#4a6aa0';
  ctx.fillRect(-7*sc,-3*sc,3*sc,2.5*sc);
  ctx.save();
  ctx.translate(4*sc,-2*sc); ctx.rotate(toolSway*0.5);
  ctx.fillRect(0,0,5*sc,2.5*sc);
  ctx.restore();

  ctx.fillStyle = '#f5c09a';
  ctx.beginPath(); ctx.arc(0,-10*sc,5*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,120,100,0.35)';
  ctx.beginPath(); ctx.arc(-2.5*sc,-9*sc,2*sc,0,Math.PI*2); ctx.arc(2.5*sc,-9*sc,2*sc,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = sc;
  ctx.beginPath();
  ctx.arc(-2*sc,-10.5*sc,1.2*sc,Math.PI*0.1,Math.PI*0.9);
  ctx.arc(2*sc,-10.5*sc,1.2*sc,Math.PI*0.1,Math.PI*0.9);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(0,-8.5*sc,2.2*sc,0.1,Math.PI-0.1); ctx.stroke();

  ctx.fillStyle = lvl===3?'#d4af37':'#d4a827';
  ctx.beginPath(); ctx.ellipse(0,-14*sc,9*sc,2.5*sc,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = lvl===3?'#b8901f':'#c8920a';
  ctx.beginPath();
  ctx.moveTo(-5*sc,-14*sc); ctx.lineTo(5*sc,-14*sc);
  ctx.lineTo(3.5*sc,-20*sc+Math.sin(t*1.8)*0.5*sc); ctx.lineTo(-3.5*sc,-20*sc+Math.sin(t*1.8)*0.5*sc);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = lvl===1?'#cc3300':lvl===2?'#2266cc':'#22aa44';
  ctx.fillRect(-5*sc,-14.8*sc,10*sc,1.5*sc);
  if (lvl===3){
    // mini celeiro no topo do chapéu — assinatura "fazenda grande"
    ctx.fillStyle = '#a03030';
    ctx.fillRect(-2*sc,-24*sc,4*sc,3*sc);
    ctx.beginPath(); ctx.moveTo(-2.3*sc,-24*sc); ctx.lineTo(0,-27*sc); ctx.lineTo(2.3*sc,-24*sc); ctx.closePath();
    ctx.fillStyle = '#7a2020'; ctx.fill();
  }

  const coinPhase = (t*0.8)%1;
  if (coinPhase < 0.5){
    ctx.globalAlpha = Math.sin(coinPhase*Math.PI);
    ctx.font = `${7*sc}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('💰', 10*sc, -22*sc - coinPhase*18*sc);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ---- FAZENDEIRO HYPE ----
function drawHypeFarmerModel(ctx, px, py, s, t, tower) {
  const lvl = tower.level || 1;
  const sc = s / 28;
  const bob = Math.sin(t*2.4)*1.2;
  const bodyCol = lvl===1?'#cc4a9a':lvl===2?'#a02a8a':'#6a1a8a';

  ctx.save();
  ctx.translate(px, py+bob);

  const confettiCount = lvl===1?5:lvl===2?7:9;
  for (let i=0;i<confettiCount;i++){
    const ang = (i/confettiCount)*Math.PI*2 + t*1.5;
    const r = (11+Math.sin(t*3+i)*2)*sc;
    ctx.save();
    ctx.translate(Math.cos(ang)*r, Math.sin(ang)*r*0.6 - 4*sc);
    ctx.rotate(t*4+i);
    ctx.fillStyle = ['#ff66cc','#ffdd44','#44ddff','#88ff66'][i%4];
    ctx.fillRect(-1.2*sc,-1.2*sc,2.4*sc,2.4*sc);
    ctx.restore();
  }

  const legSwing = Math.sin(t*2.4)*0.3;
  [-3,3].forEach((dx,i)=>{
    ctx.save();
    ctx.translate(dx*sc,5*sc);
    ctx.rotate((i===0?1:-1)*legSwing*0.15);
    ctx.fillStyle = '#2a1a3a';
    ctx.fillRect(-2*sc,0,4*sc,6*sc);
    ctx.fillStyle = '#ffdd00';
    ctx.fillRect(-2.5*sc,5*sc,5*sc,2*sc);
    ctx.restore();
  });

  ctx.fillStyle = bodyCol;
  ctx.fillRect(-5.5*sc,-5*sc,11*sc,11*sc);
  ctx.fillStyle = '#ff99dd';
  ctx.fillRect(-3.5*sc,-4*sc,7*sc,6*sc);

  if (lvl===1){
    // corneta/megafone
    ctx.save();
    ctx.translate(7*sc,-1*sc); ctx.rotate(-0.3);
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath(); ctx.moveTo(0,-3*sc); ctx.lineTo(10*sc,-6*sc); ctx.lineTo(10*sc,6*sc); ctx.lineTo(0,3*sc); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (lvl===2){
    // caixa de som
    ctx.fillStyle = '#222';
    ctx.fillRect(6*sc,-4*sc,7*sc,8*sc);
    ctx.fillStyle = '#666';
    ctx.beginPath(); ctx.arc(9.5*sc,-1*sc,2*sc,0,Math.PI*2); ctx.arc(9.5*sc,2.5*sc,1.3*sc,0,Math.PI*2); ctx.fill();
    // headphones
    ctx.strokeStyle = '#222'; ctx.lineWidth = 1.4*sc;
    ctx.beginPath(); ctx.arc(0,-10*sc,5.5*sc,Math.PI*1.1,Math.PI*1.9); ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-5*sc,-9*sc,1.6*sc,0,Math.PI*2); ctx.arc(5*sc,-9*sc,1.6*sc,0,Math.PI*2); ctx.fill();
  } else {
    // microfone + disco ball flutuante
    ctx.save();
    ctx.translate(7*sc,0); ctx.rotate(-0.2);
    ctx.strokeStyle = '#999'; ctx.lineWidth = 1.4*sc;
    ctx.beginPath(); ctx.moveTo(0,8*sc); ctx.lineTo(0,-6*sc); ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(0,-8*sc,2.6*sc,0,Math.PI*2); ctx.fill();
    ctx.restore();
    const discoY = -20*sc + Math.sin(t*2)*1.5*sc;
    ctx.save();
    ctx.translate(-2*sc, discoY);
    ctx.fillStyle = '#cfd8e0';
    ctx.beginPath(); ctx.arc(0,0,3.6*sc,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.5*sc;
    for (let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(-3.6*sc,i*1.2*sc); ctx.lineTo(3.6*sc,i*1.2*sc); ctx.stroke(); }
    ctx.restore();
  }

  ctx.fillStyle = bodyCol;
  ctx.fillRect(-7*sc,-3*sc,3*sc,2.5*sc);
  ctx.fillRect(3*sc,-3*sc,3*sc,2.5*sc);

  ctx.fillStyle = '#f5c09a';
  ctx.beginPath(); ctx.arc(0,-10*sc,5*sc,0,Math.PI*2); ctx.fill();
  // oculos de sol sempre, maiores no nivel 3
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(-2.2*sc,-10.5*sc, (lvl===3?2.4:2)*sc, 1.6*sc,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2.2*sc,-10.5*sc, (lvl===3?2.4:2)*sc, 1.6*sc,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 0.6*sc;
  ctx.beginPath(); ctx.moveTo(-0.4*sc,-10.5*sc); ctx.lineTo(0.4*sc,-10.5*sc); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,-8.3*sc,2*sc,0.1,Math.PI-0.1); ctx.stroke();

  // festa hat
  ctx.fillStyle = lvl===1?'#ffdd00':lvl===2?'#ff66cc':'#44ddff';
  ctx.beginPath();
  ctx.moveTo(-4*sc,-13.5*sc); ctx.lineTo(4*sc,-13.5*sc); ctx.lineTo(0,-22*sc-lvl*1.5*sc);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(0,-22*sc-lvl*1.5*sc,1.3*sc,0,Math.PI*2); ctx.fill();

  ctx.restore();
}

// ---- MORTEIRO ----
function drawMortarModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const recoil = firing ? (tower.firing/0.18)*4 : 0;
  const tubeAngle = -1.15;

  ctx.save();
  ctx.translate(px, py);

  ctx.fillStyle = lvl===3?'#2a2a30':'#3a3526';
  ctx.beginPath();
  ctx.moveTo(-9*sc,9*sc); ctx.lineTo(-3*sc,3*sc); ctx.lineTo(3*sc,3*sc); ctx.lineTo(9*sc,9*sc);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a2618';
  ctx.fillRect(-10*sc,8*sc,20*sc,3*sc);

  // caixas de munição (1, 2 ou torre de radar no nivel 3)
  ctx.fillStyle = lvl===3?'#3a4a3a':'#5a4a28';
  ctx.fillRect(6*sc,1*sc,7*sc,6*sc);
  ctx.strokeStyle = '#3a2e18'; ctx.lineWidth = 0.8*sc;
  ctx.strokeRect(6*sc,1*sc,7*sc,6*sc);
  ctx.fillStyle = '#cc8822';
  ctx.beginPath(); ctx.arc(9.5*sc,4*sc,1.8*sc,0,Math.PI*2); ctx.fill();
  if (lvl>=2){
    ctx.fillStyle = lvl===3?'#3a4a3a':'#5a4a28';
    ctx.fillRect(-13*sc,2*sc,6*sc,5*sc);
    ctx.strokeRect(-13*sc,2*sc,6*sc,5*sc);
  }
  if (lvl===3){
    // antena/radar
    ctx.strokeStyle = '#888'; ctx.lineWidth = 1*sc;
    ctx.beginPath(); ctx.moveTo(-10*sc,2*sc); ctx.lineTo(-10*sc,-6*sc); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,60,60,0.7)';
    ctx.beginPath(); ctx.arc(-10*sc,-6*sc,2*sc + Math.sin(t*4)*0.6*sc,0,Math.PI*2); ctx.stroke();
  }

  ctx.save();
  ctx.translate(0, 2*sc+recoil);
  ctx.rotate(tubeAngle);
  const tubeW = lvl===1?6:lvl===2?7.5:9;
  ctx.fillStyle = lvl===3?'#2e2e34':'#444036';
  ctx.fillRect(-tubeW/2*sc,-22*sc,tubeW*sc,24*sc);
  ctx.fillStyle = lvl===3?'#4a4a54':'#5a5648';
  ctx.fillRect(-tubeW/2*sc,-22*sc,2*sc,24*sc);
  if (lvl===3){
    // aletas na base do cano — visual "estratégico"
    ctx.fillStyle = '#2e2e34';
    ctx.fillRect(-tubeW/2*sc-2*sc, -2*sc, 2*sc, 6*sc);
    ctx.fillRect(tubeW/2*sc, -2*sc, 2*sc, 6*sc);
  }
  ctx.fillStyle = '#262420';
  ctx.fillRect(-(tubeW/2+0.6)*sc,-23*sc,(tubeW+1.2)*sc,3*sc);
  ctx.restore();

  if (firing && tower.firing>0.1){
    const mx = Math.cos(tubeAngle-Math.PI/2)*24*sc;
    const my = 2*sc + Math.sin(tubeAngle-Math.PI/2)*24*sc;
    ctx.save();
    ctx.globalAlpha = tower.firing*1.3;
    ctx.shadowColor = '#ffaa33'; ctx.shadowBlur = 16*sc;
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath(); ctx.arc(mx,my,5*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff0cc';
    ctx.beginPath(); ctx.arc(mx,my,2.5*sc,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = tower.firing*0.6;
    ctx.fillStyle = '#999';
    ctx.beginPath(); ctx.arc(mx,my-4*sc,7*sc*(1+(0.18-tower.firing)*3),0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ============================================================
//  TORRES ESPECIAIS (existentes) — redesenhadas
//  Observação: Investidor e Arcturus têm elementos FUNCIONAIS
//  (auras, anéis de cooldown, contadores) que comunicam estado
//  de jogo — esses foram mantidos intactos; só o "corpo" do
//  personagem ganhou variação forte por nível.
// ============================================================

// ---- INVESTIDOR ----
function drawInvestidorModel(ctx, px, py, s, t, tower, stats) {
  const mult = stats.multiplier || 1.0;
  const lvl = tower.level || 1;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
  const farmerCount = state.towers.filter(x=>x.type==='farmer'||x.type==='hypefarmer').length;
  const sc = s / 28;

  ctx.save();
  ctx.translate(px, py);

  if (farmerCount > 0) {
    const auraR = s * (1.0 + (mult - 1.5) * 0.4 + pulse * 0.18);
    const ag = ctx.createRadialGradient(0,0,auraR*0.3,0,0,auraR);
    ag.addColorStop(0, `rgba(40,220,80,${0.18 + pulse*0.12})`);
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(0,0,auraR,0,Math.PI*2); ctx.fill();
  }

  const bob = Math.sin(t*1.6)*0.6;
  ctx.save();
  ctx.translate(0, bob);

  const suit = lvl===1?'#5a5f66':lvl===2?'#233a5e':lvl===3?'#171717':'#161005';
  const tie  = lvl===1?'#8a1a2a':lvl===2?'#c9a227':lvl===3?'#c9a227':'#ffd54a';

  if (lvl===4){
    ctx.fillStyle = '#0d0d0d';
    ctx.beginPath();
    ctx.moveTo(-6*sc,-4*sc); ctx.lineTo(-11*sc,11*sc); ctx.lineTo(11*sc,11*sc); ctx.lineTo(6*sc,-4*sc);
    ctx.closePath(); ctx.fill();
  }

  [-3,3].forEach(dx=>{
    ctx.fillStyle = lvl===4?'#0d0d0d':suit;
    ctx.fillRect(dx*sc-2*sc,5*sc,4*sc,6*sc);
    ctx.fillStyle = '#111';
    ctx.fillRect(dx*sc-2.3*sc,10.3*sc,4.6*sc,1.8*sc);
  });

  ctx.fillStyle = suit;
  ctx.fillRect(-6*sc,-4*sc,12*sc,9*sc);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-1*sc,-4*sc); ctx.lineTo(-3.5*sc,-1*sc); ctx.lineTo(0,0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(1*sc,-4*sc); ctx.lineTo(3.5*sc,-1*sc); ctx.lineTo(0,0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tie;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-1.4*sc,2.5*sc); ctx.lineTo(0,4.5*sc); ctx.lineTo(1.4*sc,2.5*sc); ctx.closePath(); ctx.fill();

  if (lvl>=3){
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(-5.5*sc,-3.6*sc,11*sc,0.8*sc);
  }

  ctx.fillStyle = suit;
  ctx.fillRect(-8*sc,-2*sc,3*sc,6*sc);
  ctx.fillRect(5*sc,-2*sc,3*sc,6*sc);

  ctx.save();
  ctx.translate(7.5*sc,4*sc);
  const caseCol = lvl<=2?'#5a3a1a':lvl===3?'#3a2a10':'#c9a227';
  ctx.fillStyle = caseCol;
  roundRect(ctx,-3.2*sc,-2.5*sc,6.4*sc,5*sc,1*sc); ctx.fill();
  ctx.strokeStyle = lvl===4?'#fff2b0':'#33220a'; ctx.lineWidth = 0.6*sc;
  ctx.strokeRect(-3.2*sc,-2.5*sc,6.4*sc,5*sc);
  ctx.fillStyle = lvl===4?'#fff2b0':'#ddd';
  ctx.fillRect(-0.8*sc,-3.2*sc,1.6*sc,1.4*sc);
  ctx.restore();

  ctx.fillStyle = '#f0c080';
  ctx.beginPath(); ctx.arc(0,-9*sc,4.5*sc,0,Math.PI*2); ctx.fill();
  if (lvl===4){
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(-4.5*sc,-16*sc,9*sc,5*sc);
    ctx.fillRect(-6*sc,-11.5*sc,12*sc,1.6*sc);
  } else {
    ctx.fillStyle = '#2a2015';
    ctx.beginPath(); ctx.arc(0,-11*sc,4.3*sc,Math.PI,Math.PI*2); ctx.fill();
  }
  if (lvl>=2){
    ctx.strokeStyle = '#222'; ctx.lineWidth = 0.7*sc;
    ctx.beginPath(); ctx.arc(-2*sc,-9*sc,1.6*sc,0,Math.PI*2); ctx.arc(2*sc,-9*sc,1.6*sc,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.4*sc,-9*sc); ctx.lineTo(0.4*sc,-9*sc); ctx.stroke();
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(-2.3*sc,-9.4*sc,1.6*sc,1.2*sc);
    ctx.fillRect(0.7*sc,-9.4*sc,1.6*sc,1.2*sc);
  }
  ctx.strokeStyle = '#8a6a40'; ctx.lineWidth = sc*0.8;
  ctx.beginPath(); ctx.arc(0,-7.4*sc,1.6*sc,0.15,Math.PI-0.15); ctx.stroke();

  ctx.restore(); // bob

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(s*0.28)}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`x${mult}`, 0, s*0.5);

  if (farmerCount > 0) {
    const ringR = s * (0.8 + lvl * 0.08) + pulse * 4;
    ctx.strokeStyle = `rgba(68,255,136,${0.3 + pulse*0.2})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(0,0,ringR,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

// ---- ARCTURUS ----
// Mantidos 100% intactos: anel de carga, anel de invocação, anel de nova,
// flash da nova e contadores em HUD (são feedback de jogo). Só o "corpo"
// da estrela ganha escala/coroa de chamas crescente por nível.
function drawArcturusModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const isOver = tower.arcOvercharging;
  const isStab = tower.arcStabilising;
  const charges = tower.arcCharges || 0;
  const chargeThreshold = stats.overChargeThreshold || 30;
  const chargeRatio = Math.min(charges / chargeThreshold, 1);

  const coronaPulse = 0.5 + 0.5 * Math.sin(t * (isOver ? 12 : 4));
  const coronaR = s * (isOver ? 1.5 : 0.75 + lvl*0.045) + coronaPulse * (isOver ? 10 : 4);
  const coronaAlpha = isOver ? 0.55 + coronaPulse * 0.3 : 0.2 + chargeRatio * 0.3;
  const coronaColor = isOver ? '#ff4400' : isStab ? '#aaaaaa' : '#ffaa00';
  const cg = ctx.createRadialGradient(px, py, coronaR*0.3, px, py, coronaR);
  cg.addColorStop(0, coronaColor + Math.round(coronaAlpha*255).toString(16).padStart(2,'0'));
  cg.addColorStop(1, 'transparent');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(px, py, coronaR, 0, Math.PI*2); ctx.fill();

  const coreR = s * (0.42 + lvl * 0.024);
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

  // coroa de chamas — só aparece nos níveis mais altos (Colapso / Estrela Absoluta)
  if (lvl >= 4) {
    const spikeCount = lvl === 4 ? 4 : 6;
    for (let i = 0; i < spikeCount; i++) {
      const a = (i/spikeCount)*Math.PI*2 + t*0.6;
      const spikeLen = coreR * (lvl===5?0.75:0.55) + Math.sin(t*4+i)*coreR*0.1;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a);
      ctx.fillStyle = lvl===5 ? '#fff2b0' : '#ffcc44';
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(coreR*0.7, -coreR*0.18);
      ctx.lineTo(coreR+spikeLen, 0);
      ctx.lineTo(coreR*0.7, coreR*0.18);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  const rayCount = isOver ? 10 : 4 + lvl;
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

  // fragmentos orbitando perto do núcleo — quantidade cresce por nível (preview do Fragmento Solar)
  const emberCount = Math.max(0, lvl - 1);
  for (let i = 0; i < emberCount; i++) {
    const a = t*1.8 + (i/emberCount)*Math.PI*2;
    const ex = px + Math.cos(a)*(coreR+3);
    const ey = py + Math.sin(a)*(coreR+3);
    ctx.save();
    ctx.globalAlpha = 0.7 + Math.sin(t*3+i)*0.2;
    ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath(); ctx.arc(ex, ey, coreR*0.16, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

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

  if (isStab) {
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(px, py, coreR + 6, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  const summonInterval = stats.summonInterval || 12;
  const summonTimer   = tower.arcSummonTimer !== undefined ? tower.arcSummonTimer : summonInterval;
  const summonRatio   = 1 - Math.max(0, Math.min(1, summonTimer / summonInterval));
  const summonR = coreR + (isOver ? 17 : 13);
  ctx.save();
  ctx.strokeStyle = '#88ee44';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.arc(px, py, summonR, 0, Math.PI*2); ctx.stroke();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = summonRatio >= 1 ? '#ccff44' : '#88ee44';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(px, py, summonR, -Math.PI/2, -Math.PI/2 + Math.PI*2*summonRatio);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

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

// ---- GOJO ----
// Efeitos de ataque (infinity/blue/purple) ficam por conta da técnica,
// que já é 1:1 com o nível — mantidos intactos. O visual do corpo
// (roupa, aura, capa) agora escala com o nível também.
function drawGojoModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const technique = tower.lastTechnique || stats.technique || 'infinity';
  const sc = s / 28;
  const bob = Math.sin(t * 1.6) * 1.0;
  const auraT = globalTime;

  ctx.save();
  ctx.translate(px, py + bob);

  const auraSize = (14 + lvl*3)*sc + Math.sin(auraT * 3) * 2*sc;
  const auraAlpha = 0.12 + Math.sin(auraT * 4) * 0.06 + lvl*0.02;
  ctx.save();
  ctx.globalAlpha = auraAlpha;
  const auraGrad = ctx.createRadialGradient(0, 0, 2*sc, 0, 0, auraSize);
  auraGrad.addColorStop(0, lvl===3 ? '#ff00ff' : '#cc00ff');
  auraGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = auraGrad;
  ctx.beginPath(); ctx.arc(0, 0, auraSize, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // capa longa — só no nível 3 (Expansão Máxima)
  if (lvl === 3) {
    ctx.fillStyle = '#1a0a2a';
    ctx.beginPath();
    ctx.moveTo(-6*sc,-5*sc); ctx.lineTo(-12*sc,12*sc); ctx.lineTo(12*sc,12*sc); ctx.lineTo(6*sc,-5*sc);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(176,122,255,0.5)'; ctx.lineWidth = 0.8*sc;
    ctx.beginPath(); ctx.moveTo(-6*sc,-5*sc); ctx.lineTo(-12*sc,12*sc); ctx.moveTo(6*sc,-5*sc); ctx.lineTo(12*sc,12*sc); ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = 0.25 + Math.sin(auraT * 2) * 0.1;
  ctx.strokeStyle = '#b07aff';
  ctx.lineWidth = 1.2*sc;
  const inf = (9+lvl)*sc;
  ctx.translate(0, -20*sc);
  ctx.rotate(auraT * 0.5);
  ctx.beginPath();
  ctx.arc(-inf*0.5, 0, inf*0.5, 0, Math.PI*2);
  ctx.arc( inf*0.5, 0, inf*0.5, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();

  const legSwing = Math.sin(t * 1.6) * 0.25;
  ctx.fillStyle = '#111';
  ctx.save();
  ctx.translate(-3*sc, 5*sc);
  ctx.rotate(legSwing * 0.12);
  ctx.fillRect(-2.5*sc, 0, 5*sc, 7*sc);
  ctx.fillStyle = '#222'; ctx.fillRect(-2.5*sc, 6*sc, 5*sc, 2*sc);
  ctx.restore();
  ctx.fillStyle = '#111';
  ctx.save();
  ctx.translate(3*sc, 5*sc);
  ctx.rotate(-legSwing * 0.12);
  ctx.fillRect(-2.5*sc, 0, 5*sc, 7*sc);
  ctx.fillStyle = '#222'; ctx.fillRect(-2.5*sc, 6*sc, 5*sc, 2*sc);
  ctx.restore();

  ctx.fillStyle = '#111';
  ctx.fillRect(-6*sc, -5*sc, 12*sc, 11*sc);
  // jaqueta aberta nos níveis 2/3 revela camisa com linhas de energia
  if (lvl >= 2) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-2.5*sc, -4*sc, 5*sc, 9*sc);
    ctx.strokeStyle = lvl===3 ? '#ff66ff' : '#4488ff';
    ctx.lineWidth = 0.6*sc;
    ctx.globalAlpha = 0.6 + Math.sin(t*3)*0.2;
    for (let i=0;i<3;i++){
      ctx.beginPath(); ctx.moveTo(-2*sc, -3*sc+i*2.8*sc); ctx.lineTo(2*sc, -3*sc+i*2.8*sc); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-1*sc, -5*sc); ctx.lineTo(-4*sc, -2*sc); ctx.lineTo(0, -1*sc); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1*sc, -5*sc); ctx.lineTo(4*sc, -2*sc); ctx.lineTo(0, -1*sc); ctx.closePath();
  ctx.fill();
  if (lvl===1){
    ctx.fillStyle = '#7b2fff';
    ctx.beginPath();
    ctx.moveTo(0, -1*sc); ctx.lineTo(-1.5*sc, 2*sc); ctx.lineTo(0, 5*sc); ctx.lineTo(1.5*sc, 2*sc);
    ctx.closePath(); ctx.fill();
  }

  ctx.fillStyle = '#111';
  const lArmRot = firing && technique === 'infinity' ? Math.sin(t * 20) * 0.3 : Math.sin(t * 1.6) * 0.1;
  ctx.save();
  ctx.translate(-8*sc, -2*sc);
  ctx.rotate(lArmRot);
  ctx.fillRect(0, 0, 3*sc, 8*sc);
  const handGlow = technique === 'infinity' ? '#b07aff' : (technique === 'blue' ? '#4488ff' : '#ff00ff');
  ctx.shadowColor = handGlow;
  ctx.shadowBlur = firing ? 14 : 5;
  ctx.fillStyle = handGlow;
  ctx.beginPath(); ctx.arc(1.5*sc, 9*sc, 2.5*sc, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.fillStyle = '#111';
  const rArmRot = firing && technique !== 'infinity' ? -Math.PI/4 + Math.sin(t*15)*0.2 : Math.sin(t * 1.6 + 1) * 0.1;
  ctx.save();
  ctx.translate(5*sc, -2*sc);
  ctx.rotate(rArmRot);
  ctx.fillRect(0, 0, 3*sc, 8*sc);
  ctx.shadowColor = handGlow;
  ctx.shadowBlur = firing ? 14 : 5;
  ctx.fillStyle = handGlow;
  ctx.beginPath(); ctx.arc(1.5*sc, 9*sc, 2.5*sc, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.fillStyle = '#f0c880';
  ctx.beginPath(); ctx.arc(0, -11*sc, 5*sc, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -15*sc, 4.5*sc, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-4*sc, -13*sc, 3*sc, Math.PI, Math.PI*1.8);
  ctx.arc( 4*sc, -13*sc, 3*sc, Math.PI*1.2, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-1.5*sc + Math.sin(t*2)*sc, -17*sc, 2*sc, 0, Math.PI*2);
  ctx.arc( 1.5*sc + Math.cos(t*2)*sc, -17*sc, 2*sc, 0, Math.PI*2);
  ctx.fill();

  // coroa de energia flutuante no nível 3
  if (lvl === 3) {
    ctx.save();
    ctx.globalAlpha = 0.6 + Math.sin(t*3)*0.2;
    ctx.shadowColor = '#ff66ff'; ctx.shadowBlur = 8;
    for (let i=0;i<5;i++){
      const a = (i/5)*Math.PI*2 + t*0.8;
      ctx.fillStyle = '#e0aaff';
      ctx.beginPath(); ctx.arc(Math.cos(a)*7*sc, -22*sc+Math.sin(a)*2*sc, 1*sc, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(-5.5*sc, -13*sc, 11*sc, 3.5*sc);
  ctx.fillStyle = 'rgba(150,120,255,0.3)';
  ctx.fillRect(-5.5*sc, -13*sc, 11*sc, 1*sc);
  ctx.fillStyle = '#7b2fff';
  ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = 8;
  ctx.fillRect(-3.5*sc, -12.8*sc, 2.5*sc, 1.5*sc);
  ctx.fillRect(1*sc, -12.8*sc, 2.5*sc, 1.5*sc);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#c07050';
  ctx.lineWidth = sc * 0.9;
  ctx.beginPath();
  ctx.arc(1.5*sc, -9.2*sc, 2.5*sc, 0.2, Math.PI - 0.2);
  ctx.stroke();

  if (firing) {
    if (technique === 'infinity') {
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

  ctx.restore();
}

// ============================================================
//  TORRES NOVAS — antes só mostravam o emoji do ícone, agora
//  ganham modelo de personagem completo com 3 níveis cada.
// ============================================================

// ---- BARRICADA (defensora de linha de frente) ----
function drawBarricadaModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.3)*0.5;
  const bash = firing ? Math.sin(Math.min(1,(0.25-tower.firing)/0.25)*Math.PI) : 0;

  ctx.save();
  ctx.translate(px, py+bob);

  const metal = lvl===1?'#7a5a30':lvl===2?'#7a828c':'#aab4bc';
  const metalHi = lvl===1?'#9a7a4a':lvl===2?'#a0aab4':'#d8e0e6';

  [-4,4].forEach(dx=>{
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(dx*sc-2.2*sc,6*sc,4.4*sc,4*sc);
  });

  ctx.save();
  ctx.translate(2*sc + bash*3*sc, 0);
  ctx.fillStyle = metal;
  if (lvl===1){
    roundRect(ctx,-6*sc,-9*sc,11*sc,17*sc,1.5*sc); ctx.fill();
    ctx.strokeStyle = '#4a3a1a'; ctx.lineWidth = 1*sc;
    for (let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(-6*sc,i*5*sc); ctx.lineTo(5*sc,i*5*sc); ctx.stroke(); }
  } else if (lvl===2){
    roundRect(ctx,-7*sc,-10*sc,13*sc,20*sc,2*sc); ctx.fill();
    ctx.fillStyle = metalHi;
    roundRect(ctx,-5*sc,-8*sc,9*sc,16*sc,1.5*sc); ctx.fill();
    ctx.fillStyle = '#444';
    [[-6,-8],[5,-8],[-6,8],[5,8]].forEach(([x,y])=>{ ctx.beginPath(); ctx.arc(x*sc,y*sc,0.8*sc,0,Math.PI*2); ctx.fill(); });
  } else {
    roundRect(ctx,-8*sc,-11*sc,15*sc,22*sc,2*sc); ctx.fill();
    ctx.fillStyle = metalHi;
    roundRect(ctx,-6*sc,-9*sc,11*sc,18*sc,1.5*sc); ctx.fill();
    ctx.fillStyle = '#8a1a1a';
    ctx.beginPath(); ctx.arc(0,-1*sc,2.6*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = metal;
    ctx.beginPath(); ctx.arc(-1*sc,-1.5*sc,0.7*sc,0,Math.PI*2); ctx.arc(1*sc,-1.5*sc,0.7*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#666';
    for (let i=0;i<6;i++){
      const yy = -10*sc + i*4*sc;
      ctx.beginPath(); ctx.moveTo(-8*sc,yy); ctx.lineTo(-11*sc,yy+1.5*sc); ctx.lineTo(-8*sc,yy+3*sc); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();

  ctx.fillStyle = metal;
  ctx.beginPath(); ctx.arc(-3*sc,-6*sc,3.2*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.fillRect(-4.5*sc,-6.6*sc,3*sc,1.2*sc);

  if (firing){
    ctx.globalAlpha = tower.firing*1.5;
    ctx.strokeStyle = metalHi; ctx.lineWidth = 2*sc;
    ctx.beginPath(); ctx.arc(2*sc,0, 4*sc+(0.25-tower.firing)*40*sc, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- TESLA ----
function drawTeslaModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const hum = Math.sin(t*6)*0.3;

  ctx.save();
  ctx.translate(px, py);

  ctx.fillStyle = '#2a2a30';
  roundRect(ctx,-7*sc,4*sc,14*sc,6*sc,1.5*sc); ctx.fill();
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(-5*sc,2*sc,10*sc,3*sc);

  const coilCount = lvl;
  const coilCol = lvl===1?'#00ccff':lvl===2?'#33ddff':'#aaffff';
  for (let c=0;c<coilCount;c++){
    const cx = (coilCount===1?0:(c - (coilCount-1)/2)*7)*sc;
    const coilH = 12 + lvl*2;
    ctx.save();
    ctx.translate(cx, 2*sc);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2*sc;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-coilH*sc); ctx.stroke();
    ctx.strokeStyle = '#888';
    for (let i=0;i<4;i++){
      ctx.beginPath(); ctx.ellipse(0,-coilH*sc*0.3-i*2.5*sc,3*sc,1.2*sc,0,0,Math.PI*2); ctx.stroke();
    }
    ctx.shadowColor = coilCol; ctx.shadowBlur = (firing?18:8)+hum*4;
    ctx.fillStyle = coilCol;
    ctx.beginPath(); ctx.arc(0,-coilH*sc,3.5*sc,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  const arcCount = firing ? 4+lvl : 1+Math.floor(lvl/2);
  ctx.strokeStyle = coilCol;
  ctx.lineWidth = 0.8*sc;
  ctx.globalAlpha = 0.8;
  for (let i=0;i<arcCount;i++){
    if (Math.sin(t*20+i*7) > 0.3){
      const x1 = (Math.sin(i*12.9)*5)*sc, y1 = -8*sc-Math.abs(Math.sin(i*7.3))*8*sc;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      for (let j=0;j<3;j++){ ctx.lineTo(x1+Math.sin(t*30+i+j)*4*sc, y1+Math.cos(t*25+i+j)*4*sc); }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ---- CANHAO ----
function drawCannonModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const recoil = firing ? (tower.firing/0.15)*3 : 0;

  ctx.save();
  ctx.translate(px, py);

  const metal = lvl===1?'#8a5a3a':lvl===2?'#6a6a70':'#4a4a52';
  const metalHi = lvl===1?'#aa7a50':lvl===2?'#8a8a90':'#6a6a72';

  [-7,7].forEach(dx=>{
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath(); ctx.arc(dx*sc,6*sc,4*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5a3a20';
    ctx.beginPath(); ctx.arc(dx*sc,6*sc,1.6*sc,0,Math.PI*2); ctx.fill();
    if (lvl===3){
      ctx.strokeStyle = '#222'; ctx.lineWidth = 0.8*sc;
      for (let i=0;i<6;i++){ const a=(i/6)*Math.PI*2; ctx.beginPath(); ctx.moveTo(dx*sc,6*sc); ctx.lineTo(dx*sc+Math.cos(a)*5*sc, 6*sc+Math.sin(a)*5*sc); ctx.stroke(); }
    }
  });

  ctx.fillStyle = metal;
  ctx.fillRect(-8*sc,1*sc,16*sc,5*sc);

  const barrelLen = lvl===1?16:lvl===2?19:23;
  const barrelW = lvl===1?7:lvl===2?8:9.5;
  ctx.save();
  ctx.translate(-2*sc - recoil, -1*sc);
  ctx.rotate(-0.18);
  ctx.fillStyle = metal;
  ctx.fillRect(0,-barrelW/2*sc, barrelLen*sc, barrelW*sc);
  ctx.fillStyle = metalHi;
  ctx.fillRect(0,-barrelW/2*sc, barrelLen*sc, 2*sc);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(barrelLen*sc, 0, barrelW/2*sc, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1*sc;
  for (let i=1;i<=2;i++){ ctx.beginPath(); ctx.moveTo(barrelLen*sc*i/3,-barrelW/2*sc); ctx.lineTo(barrelLen*sc*i/3,barrelW/2*sc); ctx.stroke(); }
  if (lvl===3){
    ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffcc44';
    ctx.beginPath(); ctx.arc(barrelLen*0.5*sc, -barrelW/2*sc-1.5*sc, 1*sc,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  ctx.fillStyle = metal;
  ctx.beginPath(); ctx.arc(0,-1*sc,5*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = metalHi;
  ctx.beginPath(); ctx.arc(-1.5*sc,-2.5*sc,2*sc,0,Math.PI*2); ctx.fill();

  if (firing && tower.firing > 0.1){
    const mx = -2*sc-recoil + Math.cos(-0.18)*barrelLen*sc;
    const my = -1*sc + Math.sin(-0.18)*barrelLen*sc;
    ctx.save();
    ctx.globalAlpha = tower.firing*1.2;
    ctx.shadowColor = '#ffaa33'; ctx.shadowBlur = 16*sc;
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath(); ctx.arc(mx,my,6*sc,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

// ---- GELO ----
function drawIceModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.4)*0.7;
  const iceCol = lvl===1?'#88ddff':lvl===2?'#aeeeff':'#e8fbff';
  const iceDark = '#3399cc';

  ctx.save();
  ctx.translate(px, py+bob);

  const flakeCount = lvl+1;
  for (let i=0;i<flakeCount;i++){
    const a = t*0.8 + (i/flakeCount)*Math.PI*2;
    const r = (10+lvl)*sc;
    ctx.save();
    ctx.translate(Math.cos(a)*r, Math.sin(a)*r*0.5-4*sc);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    ctx.font = `${4*sc}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('❄', 0, 0);
    ctx.restore();
  }

  if (lvl===1){
    ctx.fillStyle = iceCol;
    ctx.beginPath();
    ctx.moveTo(0,-14*sc); ctx.lineTo(5*sc,0); ctx.lineTo(0,10*sc); ctx.lineTo(-5*sc,0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = iceDark;
    ctx.beginPath(); ctx.moveTo(0,-14*sc); ctx.lineTo(5*sc,0); ctx.lineTo(0,-2*sc); ctx.closePath(); ctx.fill();
  } else if (lvl===2){
    ctx.fillStyle = iceCol;
    ctx.fillRect(-5.5*sc,-5*sc,11*sc,10*sc);
    ctx.fillStyle = iceDark;
    ctx.fillRect(-4*sc,-3*sc,8*sc,3*sc);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(-5.5*sc,-5*sc); ctx.lineTo(0,-16*sc); ctx.lineTo(5.5*sc,-5*sc); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = iceCol;
    ctx.fillRect(-7*sc,-6*sc,14*sc,13*sc);
    ctx.fillStyle = iceDark;
    ctx.fillRect(-5*sc,-3*sc,10*sc,4*sc);
    ctx.fillStyle = '#fff';
    for (let i=-1;i<=1;i++){
      ctx.beginPath();
      ctx.moveTo(i*4*sc-1.5*sc,-6*sc); ctx.lineTo(i*4*sc,-18*sc-Math.sin(t*2+i)*sc); ctx.lineTo(i*4*sc+1.5*sc,-6*sc);
      ctx.closePath(); ctx.fill();
    }
  }

  const eyeGlow = firing ? '#fff' : iceDark;
  ctx.save();
  ctx.shadowColor = '#aeeeff'; ctx.shadowBlur = firing?12:5;
  ctx.fillStyle = eyeGlow;
  ctx.beginPath(); ctx.arc(-2*sc,-2*sc,1.1*sc,0,Math.PI*2); ctx.arc(2*sc,-2*sc,1.1*sc,0,Math.PI*2); ctx.fill();
  ctx.restore();

  if (firing){
    ctx.globalAlpha = tower.firing*0.6;
    ctx.fillStyle = iceCol;
    ctx.beginPath(); ctx.arc(0,0,11*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- VENENO ----
function drawPoisonModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.7)*0.8;
  const toxCol = lvl===1?'#66cc44':lvl===2?'#8fdc3a':'#c8f52a';

  ctx.save();
  ctx.translate(px, py+bob);

  for (let i=0;i<2+lvl;i++){
    const ph = (t*0.6+i*0.4)%1;
    ctx.globalAlpha = (1-ph)*0.6;
    ctx.fillStyle = toxCol;
    ctx.beginPath(); ctx.arc((Math.sin(i*3)*6)*sc, (6-ph*16)*sc, (1+ph)*sc, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  [-3,3].forEach(dx=>{
    ctx.fillStyle = '#2a3a1a';
    ctx.fillRect(dx*sc-2*sc,5*sc,4*sc,6*sc);
  });

  if (lvl===1){
    ctx.fillStyle = '#3a4a2a';
    ctx.beginPath();
    ctx.moveTo(-6*sc,-4*sc); ctx.lineTo(6*sc,-4*sc); ctx.lineTo(8*sc,10*sc); ctx.lineTo(-8*sc,10*sc);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a3a1a';
    ctx.beginPath(); ctx.arc(0,-9*sc,5*sc,Math.PI*0.9,Math.PI*2.1); ctx.fill();
    ctx.save(); ctx.translate(7*sc,-1*sc);
    ctx.fillStyle = toxCol; ctx.beginPath(); ctx.arc(0,0,2*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#888'; ctx.fillRect(-0.6*sc,-3.5*sc,1.2*sc,2*sc);
    ctx.restore();
  } else if (lvl===2){
    ctx.fillStyle = '#4a5a2a';
    ctx.fillRect(-6*sc,-5*sc,12*sc,11*sc);
    ctx.fillStyle = toxCol;
    ctx.fillRect(-4*sc,-3*sc,3*sc,5*sc);
    ctx.fillRect(1*sc,-3*sc,3*sc,5*sc);
    ctx.strokeStyle = toxCol; ctx.lineWidth = 1.5*sc;
    ctx.beginPath();
    ctx.moveTo(7*sc,-1*sc);
    ctx.quadraticCurveTo(12*sc+Math.sin(t*3)*2*sc, -4*sc, 10*sc+Math.sin(t*3)*2*sc, -10*sc);
    ctx.stroke();
    ctx.fillStyle = '#2a3a1a';
    ctx.beginPath(); ctx.arc(0,-9*sc,4.5*sc,0,Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(-7*sc,-5*sc,14*sc,12*sc);
    ctx.fillStyle = toxCol;
    ctx.globalAlpha = 0.5+Math.sin(t*3)*0.2;
    ctx.beginPath(); ctx.arc(0,-1*sc,6*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(-8*sc,3*sc,3.5*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = toxCol;
    ctx.beginPath(); ctx.arc(-8*sc,1.5*sc,2*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#e8e4d0';
    ctx.beginPath(); ctx.moveTo(-4*sc,-9*sc); ctx.lineTo(4*sc,-9*sc); ctx.lineTo(3*sc,-2*sc); ctx.lineTo(0,-1*sc); ctx.lineTo(-3*sc,-2*sc);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = toxCol;
    ctx.beginPath(); ctx.arc(-1.8*sc,-7*sc,1.1*sc,0,Math.PI*2); ctx.arc(1.8*sc,-7*sc,1.1*sc,0,Math.PI*2); ctx.fill();
  }

  if (lvl < 3){
    ctx.fillStyle = '#e8c9a0';
    ctx.beginPath(); ctx.arc(0,-9.5*sc,3.2*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = toxCol;
    ctx.beginPath(); ctx.arc(-1.4*sc,-9.8*sc,0.8*sc,0,Math.PI*2); ctx.arc(1.4*sc,-9.8*sc,0.8*sc,0,Math.PI*2); ctx.fill();
  }

  if (firing){
    ctx.globalAlpha = tower.firing*0.5;
    ctx.fillStyle = toxCol;
    ctx.beginPath(); ctx.arc(0,0,11*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- LASER ----
function drawLaserModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const hum = Math.sin(t*4)*0.4;
  const lensCol = '#ff3366';

  ctx.save();
  ctx.translate(px, py);

  const body = lvl===1?'#5a2030':lvl===2?'#7a1a30':'#3a1018';
  const bodyHi = lvl===1?'#8a3a4a':lvl===2?'#aa2a44':'#5a1a28';
  let lensY = -1;

  if (lvl===1){
    ctx.fillStyle = body;
    roundRect(ctx,-6*sc,-6*sc,12*sc,12*sc,2*sc); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(0,-1*sc,3.5*sc,0,Math.PI*2); ctx.fill();
  } else if (lvl===2){
    lensY = -8;
    [-3,3].forEach(dx=>{ ctx.fillStyle='#333'; ctx.fillRect(dx*sc-1.5*sc,4*sc,3*sc,5*sc); });
    ctx.fillStyle = body;
    ctx.fillRect(-6*sc,-6*sc,12*sc,10*sc);
    ctx.fillStyle = bodyHi;
    ctx.fillRect(-4*sc,-4*sc,8*sc,4*sc);
    ctx.save(); ctx.translate(6*sc,-3*sc); ctx.rotate(-0.15);
    ctx.fillStyle = '#222'; ctx.fillRect(0,-1.5*sc,10*sc,3*sc);
    ctx.restore();
  } else {
    lensY = -9;
    [-4,4].forEach(dx=>{ ctx.fillStyle='#222'; ctx.fillRect(dx*sc-2*sc,5*sc,4*sc,6*sc); });
    ctx.fillStyle = body;
    ctx.fillRect(-7*sc,-7*sc,14*sc,12*sc);
    ctx.fillStyle = bodyHi;
    ctx.beginPath(); ctx.arc(0,-2*sc,3*sc,0,Math.PI*2); ctx.fill();
    ctx.shadowColor = lensCol; ctx.shadowBlur = 10;
    ctx.fillStyle = lensCol;
    ctx.beginPath(); ctx.arc(0,-2*sc,1.6*sc,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    [-6,6].forEach(dx=>{
      ctx.save(); ctx.translate(dx*sc,-4*sc); ctx.rotate(dx>0?-0.2:0.2);
      ctx.fillStyle = '#222'; ctx.fillRect(0,-1.3*sc,9*sc,2.6*sc);
      ctx.restore();
    });
  }

  ctx.save();
  ctx.shadowColor = lensCol; ctx.shadowBlur = 8+hum*6;
  ctx.fillStyle = lensCol;
  ctx.beginPath(); ctx.arc(0,lensY*sc,2*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.6+hum*0.3;
  ctx.beginPath(); ctx.arc(0,lensY*sc,0.8*sc,0,Math.PI*2); ctx.fill();
  ctx.restore();

  if (firing){
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = lensCol;
    ctx.beginPath(); ctx.arc(0,lensY*sc,6*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- ARPAO (PERFURADOR) ----
function drawPerfuradorModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.5)*0.7;
  const recoil = firing ? (tower.firing/0.2)*3 : 0;
  const suitCol = '#1a5a56';
  const suitHi = '#3fd0c9';

  ctx.save();
  ctx.translate(px, py+bob);

  [-3,3].forEach(dx=>{
    ctx.fillStyle = '#0a3a38';
    ctx.fillRect(dx*sc-2*sc,5*sc,4*sc,6*sc);
  });

  ctx.fillStyle = suitCol;
  ctx.fillRect(-6*sc,-4*sc,12*sc,9*sc);
  ctx.fillStyle = suitHi;
  ctx.fillRect(-4*sc,-3*sc,8*sc,3*sc);

  if (lvl===3){
    ctx.fillStyle = '#0a2a28';
    ctx.beginPath(); ctx.moveTo(-6*sc,-4*sc); ctx.lineTo(-10*sc,9*sc); ctx.lineTo(-4*sc,9*sc); ctx.lineTo(-4*sc,-3*sc);
    ctx.closePath(); ctx.fill();
  }

  ctx.save();
  ctx.translate(6*sc - recoil, -1*sc);
  ctx.rotate(-0.1);
  const launcherCount = lvl===2?2:1;
  for (let i=0;i<launcherCount;i++){
    const oy = launcherCount===2?(i===0?-2.5:2.5)*sc:0;
    ctx.fillStyle = '#333';
    ctx.fillRect(-2*sc, oy-1.3*sc, 12*sc, 2.6*sc);
    ctx.strokeStyle = suitHi; ctx.lineWidth = 0.6*sc;
    ctx.beginPath(); ctx.moveTo(-2*sc,oy); ctx.lineTo(10*sc,oy); ctx.stroke();
  }
  if (lvl===3){
    ctx.fillStyle = '#ccddee';
    ctx.beginPath(); ctx.moveTo(10*sc,-1.5*sc); ctx.lineTo(15*sc,-4*sc); ctx.lineTo(12*sc,-1*sc); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10*sc,0); ctx.lineTo(16*sc,0); ctx.lineTo(12*sc,0.6*sc); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10*sc,1.5*sc); ctx.lineTo(15*sc,4*sc); ctx.lineTo(12*sc,1*sc); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = '#e8c9a0';
  ctx.beginPath(); ctx.arc(0,-9*sc,4.3*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = suitCol;
  ctx.fillRect(-5*sc,-13*sc,10*sc,3*sc);
  ctx.fillStyle = suitHi;
  ctx.fillRect(-4.5*sc,-11.5*sc,9*sc,1.4*sc);

  if (firing){
    ctx.globalAlpha = tower.firing*0.6;
    ctx.fillStyle = suitHi;
    ctx.beginPath(); ctx.arc(6*sc,-1*sc,4*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- CORROSIVO ----
function drawCorrosivoModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.6)*0.7;
  const acidCol = '#c7e04d';

  ctx.save();
  ctx.translate(px, py+bob);

  for (let i=0;i<lvl+1;i++){
    const ph = (t*0.7+i*0.5)%1;
    ctx.globalAlpha = (1-ph)*0.7;
    ctx.fillStyle = acidCol;
    ctx.beginPath(); ctx.ellipse((-5+i*4)*sc, (7+ph*8)*sc, 1*sc,1.6*sc,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (lvl===1){
    ctx.fillStyle = '#4a5a2a';
    ctx.beginPath(); ctx.arc(0,0,6*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = acidCol;
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(0,-1*sc,3*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#888';
    ctx.fillRect(-1*sc,-9*sc,2*sc,3.5*sc);
  } else if (lvl===2){
    ctx.fillStyle = '#3a4a1a';
    ctx.beginPath();
    ctx.moveTo(-6*sc,4*sc); ctx.quadraticCurveTo(-8*sc,-6*sc,0,-8*sc); ctx.quadraticCurveTo(8*sc,-6*sc,6*sc,4*sc);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = acidCol;
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.arc(-2*sc,-2*sc,2*sc,0,Math.PI*2); ctx.arc(3*sc,0,2.4*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = '#2a3a10';
    ctx.beginPath();
    ctx.moveTo(-8*sc,6*sc); ctx.quadraticCurveTo(-10*sc,-9*sc,0,-11*sc); ctx.quadraticCurveTo(10*sc,-9*sc,8*sc,6*sc);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = acidCol;
    ctx.globalAlpha = 0.55+Math.sin(t*3)*0.15;
    ctx.beginPath(); ctx.arc(-3*sc,-3*sc,2.4*sc,0,Math.PI*2); ctx.arc(3*sc,-1*sc,3*sc,0,Math.PI*2); ctx.arc(0,3*sc,2*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(199,224,77,0.5)'; ctx.lineWidth = 1*sc;
    ctx.setLineDash([2*sc,2*sc]);
    ctx.beginPath(); ctx.ellipse(0,9*sc,10*sc,3*sc,0,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = firing ? '#fff' : '#1a1a0a';
  ctx.beginPath(); ctx.arc(-2*sc,-2*sc,0.9*sc,0,Math.PI*2); ctx.arc(2*sc,-2*sc,0.9*sc,0,Math.PI*2); ctx.fill();

  if (firing){
    ctx.globalAlpha = tower.firing*0.5;
    ctx.fillStyle = acidCol;
    ctx.beginPath(); ctx.arc(0,0,10*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- PRISMA ----
function drawPrismaModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.3)*0.8;
  const rot = t*0.4;
  const crystalCol = '#6ea8ff';
  const crystalHi = '#c9e2ff';

  ctx.save();
  ctx.translate(px, py+bob);

  const facetCount = lvl+1;
  for (let i=0;i<facetCount;i++){
    const a = rot + (i/facetCount)*Math.PI*2;
    const r = 10*sc;
    ctx.save();
    ctx.translate(Math.cos(a)*r, Math.sin(a)*r*0.5);
    ctx.rotate(a+t*2);
    ctx.fillStyle = crystalHi;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(0,-2.4*sc); ctx.lineTo(1.8*sc,0); ctx.lineTo(0,2.4*sc); ctx.lineTo(-1.8*sc,0);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  ctx.save();
  ctx.shadowColor = crystalCol; ctx.shadowBlur = firing?16:8;
  ctx.fillStyle = crystalCol;
  const cr = 6+lvl*1.2;
  if (lvl===1){
    ctx.beginPath();
    ctx.moveTo(0,-cr*sc); ctx.lineTo(cr*0.8*sc,0); ctx.lineTo(0,cr*sc); ctx.lineTo(-cr*0.8*sc,0);
    ctx.closePath(); ctx.fill();
  } else if (lvl===2){
    ctx.beginPath();
    ctx.moveTo(0,-cr*sc); ctx.lineTo(cr*0.7*sc,-cr*0.3*sc); ctx.lineTo(cr*0.7*sc,cr*0.3*sc);
    ctx.lineTo(0,cr*sc); ctx.lineTo(-cr*0.7*sc,cr*0.3*sc); ctx.lineTo(-cr*0.7*sc,-cr*0.3*sc);
    ctx.closePath(); ctx.fill();
  } else {
    mStar(ctx,0,0,6,cr*sc,cr*0.45*sc); ctx.fill();
  }
  ctx.fillStyle = crystalHi;
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.arc(-1.5*sc,-2*sc,cr*0.3*sc,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  if (firing){
    const beamCount = lvl+1;
    for (let i=0;i<beamCount;i++){
      const a = (i/beamCount)*Math.PI*2 + rot;
      ctx.globalAlpha = tower.firing*0.7;
      ctx.strokeStyle = crystalHi;
      ctx.lineWidth = 1*sc;
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(Math.cos(a)*14*sc, Math.sin(a)*14*sc);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();
}

// ---- UMBRA ----
function drawUmbraModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.1)*1.0;
  const voidCol = '#7a3fd6';
  const voidDark = '#160828';

  ctx.save();
  ctx.translate(px, py+bob);

  const tendrilCount = 2+lvl;
  for (let i=0;i<tendrilCount;i++){
    const a = t*0.9 + (i/tendrilCount)*Math.PI*2;
    const r = (9+lvl*1.5)*sc;
    ctx.strokeStyle = `rgba(122,63,214,${0.4+Math.sin(t*2+i)*0.2})`;
    ctx.lineWidth = 1.2*sc;
    ctx.beginPath();
    ctx.moveTo(0,4*sc);
    ctx.quadraticCurveTo(Math.cos(a)*r, Math.sin(a)*r*0.6, Math.cos(a)*r*1.4, Math.sin(a)*r*0.6-4*sc);
    ctx.stroke();
  }

  ctx.save();
  ctx.shadowColor = voidCol; ctx.shadowBlur = 10;
  ctx.fillStyle = voidDark;
  const bw = 6+lvl*1.3, bh = 12+lvl*1.5;
  ctx.beginPath();
  ctx.moveTo(0,-bh*sc*0.6);
  ctx.quadraticCurveTo(bw*sc,-bh*sc*0.2, bw*0.8*sc, bh*sc*0.4);
  ctx.lineTo(0, bh*sc*0.55 + Math.sin(t*2)*sc);
  ctx.lineTo(-bw*0.8*sc, bh*sc*0.4);
  ctx.quadraticCurveTo(-bw*sc,-bh*sc*0.2, 0, -bh*sc*0.6);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(0,-3*sc,3.5*sc+lvl*0.3*sc,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = firing ? '#e0c9ff' : voidCol;
  ctx.shadowColor = voidCol; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(-1.4*sc,-3*sc,0.9*sc,0,Math.PI*2); ctx.arc(1.4*sc,-3*sc,0.9*sc,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;

  if (lvl===3){
    ctx.fillStyle = voidDark;
    for (let i=-2;i<=2;i++){
      ctx.beginPath();
      ctx.moveTo(i*2.2*sc,-9*sc); ctx.lineTo(i*2.2*sc+1*sc,-9*sc-4*sc-Math.abs(i)*sc); ctx.lineTo(i*2.2*sc+2*sc,-9*sc);
      ctx.closePath(); ctx.fill();
    }
  }

  if (firing){
    ctx.globalAlpha = tower.firing*0.5;
    ctx.fillStyle = voidCol;
    ctx.beginPath(); ctx.arc(0,0,11*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- NEMESIS ----
function drawNemesisModel(ctx, px, py, s, t, tower, stats) {
  const lvl = tower.level || 1;
  const firing = tower.firing > 0;
  const sc = s / 28;
  const bob = Math.sin(t*1.5)*0.8;
  const cometCol = '#c81c4a';
  const cometHi = '#ff6fa8';

  ctx.save();
  ctx.translate(px, py+bob);

  const tailLen = 8+lvl*4;
  ctx.save();
  ctx.globalAlpha = 0.5;
  const tg = ctx.createLinearGradient(0,4*sc,0,(4+tailLen)*sc);
  tg.addColorStop(0, cometHi); tg.addColorStop(1,'transparent');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-3*sc,4*sc); ctx.lineTo(3*sc,4*sc); ctx.lineTo(0,(4+tailLen)*sc);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  const fragCount = lvl+1;
  for (let i=0;i<fragCount;i++){
    const a = t*2 + (i/fragCount)*Math.PI*2;
    ctx.save();
    ctx.globalAlpha = 0.6+Math.sin(t*3+i)*0.2;
    ctx.shadowColor = cometHi; ctx.shadowBlur = 6;
    ctx.fillStyle = cometHi;
    ctx.beginPath(); ctx.arc(Math.cos(a)*(9+lvl)*sc, Math.sin(a)*(5+lvl)*sc-3*sc, 1.3*sc,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.shadowColor = cometCol; ctx.shadowBlur = firing?18:10;
  const coreR = 5+lvl*1.1;
  ctx.fillStyle = cometCol;
  if (lvl===3){
    mStar(ctx,0,-2*sc,7,coreR*sc,coreR*0.5*sc); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0,-2*sc,coreR*sc,0,Math.PI*2); ctx.fill();
  }
  const grad = ctx.createRadialGradient(-2*sc,-4*sc,1,0,-2*sc,coreR*sc);
  grad.addColorStop(0,'#fff'); grad.addColorStop(0.5,cometHi); grad.addColorStop(1,cometCol);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0,-2*sc,coreR*sc*0.7,0,Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.fillStyle = firing?'#fff':'#3a000f';
  ctx.beginPath(); ctx.arc(-1.6*sc,-3*sc,0.8*sc,0,Math.PI*2); ctx.arc(1.6*sc,-3*sc,0.8*sc,0,Math.PI*2); ctx.fill();

  if (firing){
    ctx.globalAlpha = tower.firing*0.5;
    ctx.fillStyle = cometHi;
    ctx.beginPath(); ctx.arc(0,-2*sc,coreR*sc+5*sc,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ============================================================
//  DISPATCHER — redefine drawTower para incluir todos os tipos
//  novos no switch. Resto da função (tile de fundo, pontinhos
//  de nível, contorno de seleção) é idêntico ao original.
// ============================================================
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

  const grad = ctx.createLinearGradient(px-s/2, py-s/2, px+s/2, py+s/2);
  grad.addColorStop(0, base.color + 'cc');
  grad.addColorStop(1, base.glow + 'cc');
  ctx.fillStyle = grad;
  roundRect(ctx, px-s/2, py-s/2, s, s, 6);
  ctx.fill();

  ctx.save();
  switch (tower.type) {
    case 'gladiator':  drawGladiatorModel(ctx, px, py, s, t, tower, stats);   break;
    case 'archer':     drawArcherModel(ctx, px, py, s, t, tower, stats);     break;
    case 'mage':       drawMageModel(ctx, px, py, s, t, tower, stats);       break;
    case 'sniper':     drawSniperModel(ctx, px, py, s, t, tower, stats);     break;
    case 'farmer':     drawFarmerModel(ctx, px, py, s, t, tower);            break;
    case 'hypefarmer': drawHypeFarmerModel(ctx, px, py, s, t, tower);        break;
    case 'gojo':       drawGojoModel(ctx, px, py, s, t, tower, stats);       break;
    case 'investidor': drawInvestidorModel(ctx, px, py, s, t, tower, stats); break;
    case 'arcturus':   drawArcturusModel(ctx, px, py, s, t, tower, stats);   break;
    case 'mortar':     drawMortarModel(ctx, px, py, s, t, tower, stats);     break;
    case 'barricada':  drawBarricadaModel(ctx, px, py, s, t, tower, stats);  break;
    case 'tesla':      drawTeslaModel(ctx, px, py, s, t, tower, stats);      break;
    case 'cannon':     drawCannonModel(ctx, px, py, s, t, tower, stats);     break;
    case 'ice':        drawIceModel(ctx, px, py, s, t, tower, stats);        break;
    case 'poison':     drawPoisonModel(ctx, px, py, s, t, tower, stats);     break;
    case 'laser':      drawLaserModel(ctx, px, py, s, t, tower, stats);      break;
    case 'perfurador': drawPerfuradorModel(ctx, px, py, s, t, tower, stats); break;
    case 'corrosivo':  drawCorrosivoModel(ctx, px, py, s, t, tower, stats);  break;
    case 'prisma':     drawPrismaModel(ctx, px, py, s, t, tower, stats);     break;
    case 'umbra':      drawUmbraModel(ctx, px, py, s, t, tower, stats);      break;
    case 'nemesis':    drawNemesisModel(ctx, px, py, s, t, tower, stats);    break;
    default:
      ctx.font = `${Math.floor(s*0.52)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(getAllTowerBase()[tower.type]?.icon || '?', px, py);
      break;
  }
  ctx.restore();

  for (let lv=0; lv<tower.level; lv++){
    ctx.fillStyle = lv===0?'#aaa':(lv===1?'#88aaff':'#ffdd00');
    ctx.beginPath(); ctx.arc(px-s/2+5+lv*8, py+s/2-5, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=0.8; ctx.stroke();
  }

  if (isSelected){
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.strokeRect(px-TILE/2+2, py-TILE/2+2, TILE-4, TILE-4);
  }
  ctx.restore();
}

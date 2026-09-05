import { 
  Track, 
  KartState, 
  Projectile, 
  HazardTrap, 
  PowerCrate, 
  Particle, 
  SkidMark 
} from '../types';
import { KART_RADIUS } from './physics';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  track: Track,
  karts: KartState[],
  projectiles: Projectile[],
  traps: HazardTrap[],
  crates: PowerCrate[],
  particles: Particle[],
  skidMarks: SkidMark[],
  elapsedTime: number
) {
  // Clear canvas
  ctx.fillStyle = track.backgroundColor;
  ctx.fillRect(0, 0, track.width, track.height);

  // 1. Render Track Grid / Floor Pattern
  renderTrackFloor(ctx, track, elapsedTime);

  // 2. Render Skid Marks
  renderSkidMarks(ctx, skidMarks);

  // 3. Render Boost Pads
  renderBoostPads(ctx, track, elapsedTime);

  // 4. Render Oil Slicks & Ground Traps
  renderTraps(ctx, traps);

  // 5. Render Power Crates
  renderPowerCrates(ctx, crates, elapsedTime);

  // 6. Render Obstacles & Walls
  renderWallsAndObstacles(ctx, track, elapsedTime);

  // 7. Render Projectiles
  renderProjectiles(ctx, projectiles);

  // 8. Render Karts
  for (const kart of karts) {
    renderKart(ctx, kart, elapsedTime);
  }

  // 9. Render Particles
  renderParticles(ctx, particles);
}

function renderTrackFloor(ctx: CanvasRenderingContext2D, track: Track, elapsedTime: number) {
  ctx.save();
  ctx.strokeStyle = track.gridColor;
  ctx.lineWidth = 1;

  const gridSize = 60;
  // Vertical lines
  for (let x = 0; x <= track.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, track.height);
    ctx.stroke();
  }
  // Horizontal lines
  for (let y = 0; y <= track.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(track.width, y);
    ctx.stroke();
  }

  // Track specific floor details
  if (track.theme === 'rainbow') {
    // Subtle shifting rainbow glow
    const grad = ctx.createLinearGradient(0, 0, track.width, track.height);
    grad.addColorStop(0, 'rgba(255, 0, 128, 0.05)');
    grad.addColorStop(0.33, 'rgba(0, 240, 255, 0.05)');
    grad.addColorStop(0.66, 'rgba(255, 230, 0, 0.05)');
    grad.addColorStop(1, 'rgba(191, 0, 255, 0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, track.width, track.height);
  } else if (track.theme === 'glacier') {
    // Ice crack highlights
    ctx.strokeStyle = 'rgba(200, 245, 255, 0.06)';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 100, track.width - 200, track.height - 200);
  } else if (track.theme === 'white_pearl') {
    // Elegant pearlescent sheen + racing curbing
    const pearlGrad = ctx.createLinearGradient(0, 0, track.width, track.height);
    pearlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    pearlGrad.addColorStop(0.5, 'rgba(240, 249, 255, 0.3)');
    pearlGrad.addColorStop(1, 'rgba(255, 245, 245, 0.6)');
    ctx.fillStyle = pearlGrad;
    ctx.fillRect(0, 0, track.width, track.height);

    // Inner racetrack guide lanes
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, track.width - 120, track.height - 120);
  } else if (track.theme === 'snow_white') {
    // Pure sparkling snow with ice glimmers
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, track.width, track.height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(50, 50, track.width - 100, track.height - 100);
  }
  ctx.restore();
}

function renderSkidMarks(ctx: CanvasRenderingContext2D, skidMarks: SkidMark[]) {
  ctx.save();
  for (let i = skidMarks.length - 1; i >= 0; i--) {
    const s = skidMarks[i];
    s.alpha -= 0.002;
    if (s.alpha <= 0) {
      skidMarks.splice(i, 1);
      continue;
    }
    ctx.fillStyle = `rgba(10, 10, 15, ${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderBoostPads(ctx: CanvasRenderingContext2D, track: Track, elapsedTime: number) {
  ctx.save();
  for (const pad of track.boostPads) {
    ctx.save();
    ctx.translate(pad.x + pad.width / 2, pad.y + pad.height / 2);
    ctx.rotate(pad.angle);

    // Pad base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-pad.width / 2, -pad.height / 2, pad.width, pad.height);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-pad.width / 2, -pad.height / 2, pad.width, pad.height);

    // Animated chevron arrows
    const arrowOffset = (elapsedTime * 60) % 24;
    ctx.fillStyle = '#00f0ff';
    for (let i = -1; i <= 1; i++) {
      const x = i * 20 + (arrowOffset - 12);
      if (x > -pad.width / 2 + 8 && x < pad.width / 2 - 8) {
        ctx.beginPath();
        ctx.moveTo(x - 6, -10);
        ctx.lineTo(x + 4, 0);
        ctx.lineTo(x - 6, 10);
        ctx.lineTo(x - 2, 10);
        ctx.lineTo(x + 8, 0);
        ctx.lineTo(x - 2, -10);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

function renderTraps(ctx: CanvasRenderingContext2D, traps: HazardTrap[]) {
  ctx.save();
  for (const trap of traps) {
    if (trap.type === 'oil') {
      // Dark slick with oily rainbow sheen
      ctx.fillStyle = '#111318';
      ctx.beginPath();
      ctx.ellipse(trap.x, trap.y, trap.radius, trap.radius * 0.7, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function renderPowerCrates(ctx: CanvasRenderingContext2D, crates: PowerCrate[], elapsedTime: number) {
  ctx.save();
  for (const crate of crates) {
    if (!crate.active) continue;

    const bobOffset = Math.sin(elapsedTime * 4 + crate.x) * 4;
    const cy = crate.y + bobOffset;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(crate.x, crate.y + 14, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing aura
    ctx.save();
    ctx.translate(crate.x, cy);
    ctx.rotate(crate.rotation);

    // Box outer glow
    ctx.shadowColor = '#ffd200';
    ctx.shadowBlur = 12;

    const size = 30;
    // Box gradient
    const grad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    grad.addColorStop(0, '#ffe066');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#d97706');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Rounded box
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, 6);
    ctx.fill();
    ctx.stroke();

    // Question mark
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);

    ctx.restore();
  }
  ctx.restore();
}

function renderWallsAndObstacles(ctx: CanvasRenderingContext2D, track: Track, elapsedTime: number) {
  ctx.save();

  // Walls
  for (const wall of track.walls) {
    // Wall shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(wall.x + 4, wall.y + 4, wall.width, wall.height);

    // Wall body
    ctx.fillStyle = track.wallColor;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

    // Wall neon border
    ctx.strokeStyle = track.wallBorderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

    // Hazard stripes if boundary
    if (wall.width > 200 || wall.height > 200) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x + 4, wall.y + 4, wall.width - 8, wall.height - 8);
    }
  }

  // Obstacles
  for (const obs of track.obstacles) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(obs.x + obs.width / 2 + 3, obs.y + obs.height / 2 + 3, obs.width / 2, 0, Math.PI * 2);
    ctx.fill();

    if (obs.type === 'bumper') {
      // Pinball-style pulsating bumper
      const pulse = Math.sin(elapsedTime * 6) * 2;
      ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

      ctx.fillStyle = obs.color || '#ff0055';
      ctx.beginPath();
      ctx.arc(0, 0, obs.width / 2 + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner ring
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, obs.width / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'magma') {
      // Bubbling lava pool
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 16);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2 - 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      const bubble = Math.sin(elapsedTime * 4) * 5;
      ctx.arc(obs.x + obs.width / 2 + bubble, obs.y + obs.height / 2 - bubble, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Solid rock / pillar
      ctx.fillStyle = obs.color || '#475569';
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
  ctx.save();
  for (const p of projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    const angle = Math.atan2(p.vy, p.vx);
    ctx.rotate(angle);

    if (p.type === 'rocket') {
      // Rocket body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -4, 16, 8);

      // Red nosecone
      ctx.fillStyle = '#ff2a55';
      ctx.beginPath();
      ctx.moveTo(6, -4);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();

      // Tail fins
      ctx.fillStyle = '#ff2a55';
      ctx.fillRect(-12, -7, 4, 3);
      ctx.fillRect(-12, 4, 4, 3);
    } else if (p.type === 'bomb') {
      // Bomb sphere
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff9500';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sizzling spark
      ctx.fillStyle = '#ffd200';
      ctx.beginPath();
      ctx.arc(0, -p.radius, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'freeze_beam') {
      // Laser pulse
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'tornado') {
      // Swirling wind vortex
      ctx.save();
      const spin = p.life * 0.25;
      ctx.rotate(spin);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spiral swirl bands
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        const startA = (Math.PI * 2 / 3) * arm;
        ctx.arc(0, 0, p.radius * 0.7, startA, startA + 1.2);
        ctx.strokeStyle = '#f3e8ff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'laser') {
      // High-energy ricocheting laser bolt
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;

      // Glow envelope
      ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sharp core beam
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-20, -3.5, 40, 7);

      // Searing white center line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-14, -1.5, 28, 3);
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}

function renderKart(ctx: CanvasRenderingContext2D, kart: KartState, elapsedTime: number) {
  if (kart.isDead) return;

  ctx.save();

  // Invulnerability flashing
  if (kart.invulnerableTimer > 0) {
    const flash = Math.floor(kart.invulnerableTimer * 10) % 2 === 0;
    if (flash) {
      ctx.globalAlpha = 0.5;
    }
  }

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(kart.x + 4, kart.y + 5, KART_RADIUS + 6, KART_RADIUS - 1, kart.angle, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(kart.x, kart.y);
  ctx.rotate(kart.angle);

  // 1. Wheels (4 large black performance tires)
  ctx.fillStyle = '#18181b';
  // Front-Left & Front-Right
  ctx.fillRect(14, -25, 17, 8);
  ctx.fillRect(14, 17, 17, 8);
  // Rear-Left & Rear-Right
  ctx.fillRect(-25, -26, 18, 9);
  ctx.fillRect(-25, 17, 18, 9);

  // Wheel Rims
  ctx.fillStyle = kart.config.secondaryColor;
  ctx.fillRect(18, -23, 8, 4);
  ctx.fillRect(18, 19, 8, 4);
  ctx.fillRect(-21, -24, 9, 4);
  ctx.fillRect(-21, 19, 9, 4);

  // 2. Chassis Body (Larger, crisp high-contrast outlines)
  const grad = ctx.createLinearGradient(-28, -18, 28, 18);
  grad.addColorStop(0, kart.color);
  grad.addColorStop(1, kart.config.secondaryColor);

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  if (kart.config.chassis === 'speedster') {
    // Sleek wedge
    ctx.moveTo(28, 0);
    ctx.lineTo(12, -18);
    ctx.lineTo(-24, -18);
    ctx.lineTo(-28, 0);
    ctx.lineTo(-24, 18);
    ctx.lineTo(12, 18);
    ctx.closePath();
  } else if (kart.config.chassis === 'heavy') {
    // Bulky tank bumper
    ctx.roundRect(-27, -21, 54, 42, 6);
  } else {
    // Classic / Buggy
    ctx.roundRect(-25, -19, 50, 38, 10);
  }
  ctx.fill();
  ctx.stroke();

  // Cockpit / Tinted Windshield
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-3, -12, 19, 24, 5);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Twin Headlights with small glowing front beam
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(24, -14, 4, 6);
  ctx.fillRect(24, 8, 4, 6);

  // Spoiler / Rear engine block
  ctx.fillStyle = kart.config.secondaryColor;
  ctx.fillRect(-31, -17, 5, 34);

  // 3. Topper Hat
  if (kart.config.topper !== 'none') {
    renderTopper(ctx, kart.config.topper);
  }

  // 4. Hammer Power-Up (Orbiting giant battle hammer)
  if (kart.hammerTimer > 0) {
    ctx.save();
    const swingAngle = elapsedTime * 14;
    ctx.rotate(swingAngle);
    // Shaft
    ctx.fillStyle = '#78350f';
    ctx.fillRect(24, -5, 28, 10);
    // Heavy head
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(50, -18, 22, 36, 5);
    ctx.fill();
    ctx.stroke();
    // Glowing shockwave trail
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, KART_RADIUS + 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Lightning Shock effect
  if (kart.shockTimer > 0) {
    ctx.save();
    ctx.strokeStyle = Math.random() < 0.5 ? '#fde047' : '#00f0ff';
    ctx.lineWidth = 3;
    for (let z = 0; z < 4; z++) {
      const a = (Math.PI * 2 / 4) * z + Math.random() * 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
      ctx.lineTo(Math.cos(a) * (KART_RADIUS + 16), Math.sin(a) * (KART_RADIUS + 16));
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Spikes active effect
  if (kart.spikesTimer > 0) {
    ctx.save();
    ctx.rotate(elapsedTime * 12);
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.rotate((Math.PI * 2) / 6);
      ctx.beginPath();
      ctx.moveTo(28, -4);
      ctx.lineTo(42, 0);
      ctx.lineTo(28, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Shield active effect
  if (kart.shieldActive) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, KART_RADIUS + 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 8. Frozen Ice Cube
  if (kart.frozenTimer > 0) {
    ctx.fillStyle = 'rgba(165, 243, 252, 0.65)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.fillRect(-32, -26, 64, 52);
    ctx.strokeRect(-32, -26, 64, 52);
  }

  ctx.restore(); // Restore kart angle transformation

  // 9. Overhead Name & HP Bar
  renderOverheadHUD(ctx, kart);
}

function renderTopper(ctx: CanvasRenderingContext2D, topper: string) {
  ctx.save();
  if (topper === 'crown') {
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-6, -16);
    ctx.lineTo(-2, -10);
    ctx.lineTo(0, -18);
    ctx.lineTo(2, -10);
    ctx.lineTo(6, -16);
    ctx.lineTo(6, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (topper === 'shades') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, -8, 8, 5);
    ctx.fillRect(4, 3, 8, 5);
    ctx.fillRect(4, -3, 2, 6);
  } else if (topper === 'party') {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.lineTo(0, -18);
    ctx.lineTo(5, -6);
    ctx.closePath();
    ctx.fill();
  } else if (topper === 'horns') {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-2, -12, 4, 0, Math.PI * 2);
    ctx.arc(-2, 12, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (topper === 'helmet') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderOverheadHUD(ctx: CanvasRenderingContext2D, kart: KartState) {
  ctx.save();
  const hudY = kart.y - 42;

  // Name Tag
  ctx.font = 'bold 12px Fredoka, sans-serif';
  ctx.textAlign = 'center';

  // Background tag pill
  const nameText = `${kart.config.isBot ? '🤖 ' : ''}${kart.config.name}`;
  const textWidth = ctx.measureText(nameText).width;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(kart.x - textWidth / 2 - 8, hudY - 16, textWidth + 16, 18, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(nameText, kart.x, hudY - 2);

  // HP Bar (Clearer, larger, bordered)
  const barWidth = 46;
  const barHeight = 5;
  const hpRatio = Math.max(0, kart.hp / kart.maxHp);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(kart.x - barWidth / 2, hudY + 4, barWidth, barHeight);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(kart.x - barWidth / 2, hudY + 4, barWidth, barHeight);

  ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(kart.x - barWidth / 2, hudY + 4, barWidth * hpRatio, barHeight);

  // Power-up badge if holding one
  if (kart.currentPower) {
    const badgeY = hudY - 28;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(kart.x, badgeY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd200';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Power icon emoji
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let icon = '🚀';
    if (kart.currentPower === 'nitro') icon = '⚡';
    else if (kart.currentPower === 'shield') icon = '🛡️';
    else if (kart.currentPower === 'bomb') icon = '💣';
    else if (kart.currentPower === 'freeze') icon = '❄️';
    else if (kart.currentPower === 'spikes') icon = '🌀';
    else if (kart.currentPower === 'oil') icon = '🍌';
    else if (kart.currentPower === 'lightning') icon = '🌩️';
    else if (kart.currentPower === 'hammer') icon = '🔨';
    else if (kart.currentPower === 'tornado') icon = '🌪️';
    else if (kart.currentPower === 'laser') icon = '🔫';
    ctx.fillText(icon, kart.x, badgeY);
  }

  ctx.restore();
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

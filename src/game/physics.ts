import { 
  KartState, 
  Track, 
  Projectile, 
  HazardTrap, 
  PowerCrate, 
  Particle, 
  SkidMark, 
  PowerType, 
  KillFeedEvent 
} from '../types';
import { sounds } from '../audio/soundEffects';

export const KART_RADIUS = 28;
export const CRATE_RADIUS = 26;

export function createInitialKart(
  config: KartState['config'], 
  spawn: { x: number; y: number; angle: number }
): KartState {
  // Stats adjusted slightly based on chassis
  let maxSpeed = 7.2;
  let acceleration = 0.24;
  let handling = 0.058;
  let maxHp = 100;

  if (config.chassis === 'speedster') {
    maxSpeed = 8.0;
    acceleration = 0.28;
    handling = 0.052;
    maxHp = 90;
  } else if (config.chassis === 'heavy') {
    maxSpeed = 6.4;
    acceleration = 0.20;
    handling = 0.048;
    maxHp = 130;
  } else if (config.chassis === 'buggy') {
    maxSpeed = 7.4;
    acceleration = 0.26;
    handling = 0.065;
    maxHp = 95;
  }

  return {
    id: config.id,
    config,
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    angle: spawn.angle,
    speed: 0,
    maxSpeed,
    acceleration,
    handling,
    hp: maxHp,
    maxHp,
    smashes: 0,
    score: 0,
    damageDealt: 0,
    currentPower: null,
    shieldActive: false,
    nitroTimer: 0,
    frozenTimer: 0,
    spikesTimer: 0,
    spinTimer: 0,
    hammerTimer: 0,
    shockTimer: 0,
    isDead: false,
    respawnCountdown: 0,
    invulnerableTimer: 3, // 3 seconds safe on match start
    isDrifting: false,
    driftDirection: 0,
    driftCharge: 0,
    color: config.color,
  };
}

export function updateKartMovement(
  kart: KartState,
  inputs: { forward: boolean; backward: boolean; left: boolean; right: boolean; drift: boolean },
  track: Track,
  particles: Particle[],
  skidMarks: SkidMark[]
) {
  if (kart.isDead) {
    kart.respawnCountdown -= 1 / 60;
    if (kart.respawnCountdown <= 0) {
      respawnKart(kart, track);
    }
    return;
  }

  if (kart.invulnerableTimer > 0) {
    kart.invulnerableTimer = Math.max(0, kart.invulnerableTimer - 1 / 60);
  }

  // Handle spin-out (from oil slick)
  if (kart.spinTimer > 0) {
    kart.spinTimer -= 1 / 60;
    kart.angle += 0.25;
    kart.speed *= 0.94;
    kart.vx = Math.cos(kart.angle) * kart.speed;
    kart.vy = Math.sin(kart.angle) * kart.speed;
    kart.x += kart.vx;
    kart.y += kart.vy;
    handleWallCollisions(kart, track, particles);
    return;
  }

  // Handle frozen state
  if (kart.frozenTimer > 0) {
    kart.frozenTimer -= 1 / 60;
    kart.speed *= 0.98; // sliding uncontrollably on ice
    kart.x += kart.vx;
    kart.y += kart.vy;
    handleWallCollisions(kart, track, particles);
    // Frost particles
    if (Math.random() < 0.3) {
      particles.push({
        x: kart.x + (Math.random() * 20 - 10),
        y: kart.y + (Math.random() * 20 - 10),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 2,
        color: '#a5f3fc',
        alpha: 0.8,
        decay: 0.04,
        type: 'frost'
      });
    }
    return;
  }

  // Handle nitro boost
  let activeMaxSpeed = kart.maxSpeed;
  let activeAccel = kart.acceleration;

  if (kart.nitroTimer > 0) {
    kart.nitroTimer -= 1 / 60;
    activeMaxSpeed = kart.maxSpeed * 1.65;
    activeAccel = kart.acceleration * 2.2;

    // Nitro exhaust flame particles
    const rearAngle = kart.angle + Math.PI;
    const rearDist = 20;
    particles.push({
      x: kart.x + Math.cos(rearAngle) * rearDist + (Math.random() * 6 - 3),
      y: kart.y + Math.sin(rearAngle) * rearDist + (Math.random() * 6 - 3),
      vx: Math.cos(rearAngle) * (Math.random() * 5 + 4),
      vy: Math.sin(rearAngle) * (Math.random() * 5 + 4),
      radius: Math.random() * 4 + 3,
      color: Math.random() < 0.5 ? '#ff3b30' : '#ffcc00',
      alpha: 1,
      decay: 0.08,
      type: 'spark',
    });
  }

  if (kart.spikesTimer > 0) {
    kart.spikesTimer -= 1 / 60;
  }

  if (kart.hammerTimer > 0) {
    kart.hammerTimer -= 1 / 60;
  }

  // Handle electric shock/lightning stun
  if (kart.shockTimer > 0) {
    kart.shockTimer -= 1 / 60;
    kart.speed *= 0.88;
    kart.angle += (Math.random() - 0.5) * 0.08;
    if (Math.random() < 0.25) {
      particles.push({
        x: kart.x + (Math.random() * 30 - 15),
        y: kart.y + (Math.random() * 30 - 15),
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: Math.random() * 3 + 1,
        color: Math.random() < 0.5 ? '#fde047' : '#00f0ff',
        alpha: 0.9,
        decay: 0.09,
        type: 'spark',
      });
    }
  }

  // Drifting mechanic
  let turnSpeed = kart.handling;
  if (inputs.drift && Math.abs(kart.speed) > 3) {
    if (!kart.isDrifting) {
      kart.isDrifting = true;
      kart.driftDirection = inputs.left ? -1 : inputs.right ? 1 : 0;
      kart.driftCharge = 0;
    }
    turnSpeed = kart.handling * 1.45;
    kart.driftCharge += 1 / 60;

    // Drift sparks
    const sparkColor = kart.driftCharge > 1.2 ? '#bf00ff' : kart.driftCharge > 0.6 ? '#00f0ff' : '#ffea00';
    if (Math.random() < 0.5) {
      const rearAngle = kart.angle + Math.PI + (kart.driftDirection * 0.4);
      particles.push({
        x: kart.x + Math.cos(rearAngle) * 18,
        y: kart.y + Math.sin(rearAngle) * 18,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: Math.random() * 3 + 2,
        color: sparkColor,
        alpha: 0.9,
        decay: 0.06,
        type: 'spark'
      });
      skidMarks.push({
        x: kart.x + Math.cos(rearAngle) * 16,
        y: kart.y + Math.sin(rearAngle) * 16,
        angle: kart.angle,
        alpha: 0.35,
      });
    }
  } else {
    // Released drift with mini-turbo!
    if (kart.isDrifting) {
      if (kart.driftCharge >= 0.6) {
        // Apply mini-turbo burst!
        kart.speed = Math.min(kart.speed + 2.5, activeMaxSpeed * 1.3);
        kart.nitroTimer = Math.max(kart.nitroTimer, kart.driftCharge >= 1.2 ? 1.5 : 0.8);
        sounds.playNitro();
      }
      kart.isDrifting = false;
      kart.driftCharge = 0;
    }
  }

  // Steering
  if (inputs.left) {
    kart.angle -= turnSpeed;
  }
  if (inputs.right) {
    kart.angle += turnSpeed;
  }

  // Acceleration & Braking
  if (inputs.forward) {
    kart.speed += activeAccel;
    if (kart.speed > activeMaxSpeed) {
      kart.speed = activeMaxSpeed;
    }
  } else if (inputs.backward) {
    kart.speed -= activeAccel * 0.7;
    if (kart.speed < -activeMaxSpeed * 0.45) {
      kart.speed = -activeMaxSpeed * 0.45;
    }
  } else {
    // Natural friction / deceleration
    kart.speed *= 0.96;
    if (Math.abs(kart.speed) < 0.05) {
      kart.speed = 0;
    }
  }

  // Position update
  kart.vx = Math.cos(kart.angle) * kart.speed;
  kart.vy = Math.sin(kart.angle) * kart.speed;

  kart.x += kart.vx;
  kart.y += kart.vy;

  // Boost pads interaction
  for (const pad of track.boostPads) {
    if (
      kart.x >= pad.x &&
      kart.x <= pad.x + pad.width &&
      kart.y >= pad.y &&
      kart.y <= pad.y + pad.height
    ) {
      kart.speed = activeMaxSpeed * 1.5;
      kart.angle = pad.angle;
      kart.nitroTimer = Math.max(kart.nitroTimer, 1.2);
      sounds.playNitro();
    }
  }

  // Wall and obstacle collisions
  handleWallCollisions(kart, track, particles);
}

export function handleWallCollisions(kart: KartState, track: Track, particles: Particle[] = []) {
  // Boundary clamping
  const minX = 24 + KART_RADIUS;
  const maxX = track.width - 24 - KART_RADIUS;
  const minY = 24 + KART_RADIUS;
  const maxY = track.height - 24 - KART_RADIUS;

  if (kart.x < minX) { kart.x = minX; kart.speed *= -0.4; sounds.playBumperBounce(); }
  if (kart.x > maxX) { kart.x = maxX; kart.speed *= -0.4; sounds.playBumperBounce(); }
  if (kart.y < minY) { kart.y = minY; kart.speed *= -0.4; sounds.playBumperBounce(); }
  if (kart.y > maxY) { kart.y = maxY; kart.speed *= -0.4; sounds.playBumperBounce(); }

  // Walls inside track
  for (const wall of track.walls) {
    // Circle vs AABB collision
    const closestX = Math.max(wall.x, Math.min(kart.x, wall.x + wall.width));
    const closestY = Math.max(wall.y, Math.min(kart.y, wall.y + wall.height));
    const dx = kart.x - closestX;
    const dy = kart.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < KART_RADIUS * KART_RADIUS && distanceSquared > 0) {
      const distance = Math.sqrt(distanceSquared);
      const overlap = KART_RADIUS - distance;
      const nx = dx / distance;
      const ny = dy / distance;

      kart.x += nx * overlap;
      kart.y += ny * overlap;
      kart.speed *= -0.4;
      sounds.playBumperBounce();
    }
  }

  // Obstacles
  for (const obs of track.obstacles) {
    const closestX = Math.max(obs.x, Math.min(kart.x, obs.x + obs.width));
    const closestY = Math.max(obs.y, Math.min(kart.y, obs.y + obs.height));
    const dx = kart.x - closestX;
    const dy = kart.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < KART_RADIUS * KART_RADIUS) {
      const distance = Math.max(0.1, Math.sqrt(distanceSquared));
      const nx = dx / distance;
      const ny = dy / distance;

      if (obs.type === 'bumper') {
        // High spring bounce!
        kart.x += nx * 18;
        kart.y += ny * 18;
        kart.speed = -kart.speed * 1.2;
        kart.angle = Math.atan2(ny, nx);
        sounds.playBumperBounce();
      } else if (obs.type === 'magma') {
        // Magma burns kart
        kart.hp -= 0.5;
        kart.speed *= 0.9;
        if (kart.hp <= 0 && !kart.isDead) {
          smashKart(kart, null, 'Magma Hazard', particles, []);
        }
      } else {
        kart.x += nx * (KART_RADIUS - distance);
        kart.y += ny * (KART_RADIUS - distance);
        kart.speed *= -0.35;
      }
    }
  }
}

export function handleKartToKartCollisions(
  karts: KartState[],
  particles: Particle[],
  killFeed: KillFeedEvent[]
) {
  for (let i = 0; i < karts.length; i++) {
    for (let j = i + 1; j < karts.length; j++) {
      const k1 = karts[i];
      const k2 = karts[j];

      if (k1.isDead || k2.isDead) continue;

      const dx = k2.x - k1.x;
      const dy = k2.y - k1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = KART_RADIUS * 2;

      if (dist < minDist && dist > 0) {
        // Collision normal
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) / 2;

        // Push apart
        k1.x -= nx * overlap;
        k1.y -= ny * overlap;
        k2.x += nx * overlap;
        k2.y += ny * overlap;

        // Hammer Smash check!
        const k1Hammer = k1.hammerTimer > 0;
        const k2Hammer = k2.hammerTimer > 0;

        if (k1Hammer && !k2Hammer) {
          applyDamage(k2, k1, 70, particles, killFeed, 'hammer');
          k2.vx = nx * 18;
          k2.vy = ny * 18;
          k2.speed = -8;
          sounds.playHammer();
        } else if (k2Hammer && !k1Hammer) {
          applyDamage(k1, k2, 70, particles, killFeed, 'hammer');
          k1.vx = -nx * 18;
          k1.vy = -ny * 18;
          k1.speed = -8;
          sounds.playHammer();
        } else {
          // Nitro or Spike Smash check!
          const k1Attacking = k1.nitroTimer > 0 || k1.spikesTimer > 0;
          const k2Attacking = k2.nitroTimer > 0 || k2.spikesTimer > 0;

          if (k1Attacking && !k2Attacking) {
            applyDamage(k2, k1, 55, particles, killFeed, k1.nitroTimer > 0 ? 'nitro' : 'spikes');
            k2.vx = nx * 10;
            k2.vy = ny * 10;
            k2.speed = -5;
          } else if (k2Attacking && !k1Attacking) {
            applyDamage(k1, k2, 55, particles, killFeed, k2.nitroTimer > 0 ? 'nitro' : 'spikes');
            k1.vx = -nx * 10;
            k1.vy = -ny * 10;
            k1.speed = -5;
          } else {
            // Normal kart bumper bump
            const tempSpeed = k1.speed;
            k1.speed = (k2.speed * 0.7) - 1;
            k2.speed = (tempSpeed * 0.7) + 1;

            sounds.playBumperBounce();

            // Spark particles
            const midX = (k1.x + k2.x) / 2;
            const midY = (k1.y + k2.y) / 2;
            for (let p = 0; p < 4; p++) {
              particles.push({
                x: midX,
                y: midY,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                radius: Math.random() * 3 + 1,
                color: '#ffffff',
                alpha: 0.9,
                decay: 0.1,
                type: 'spark'
              });
            }
          }
        }
      }
    }
  }
}

export function activateKartPower(
  kart: KartState,
  karts: KartState[],
  projectiles: Projectile[],
  traps: HazardTrap[],
  particles: Particle[],
  killFeed: KillFeedEvent[] = []
): PowerType | null {
  if (!kart.currentPower || kart.isDead || kart.frozenTimer > 0 || kart.spinTimer > 0) {
    return null;
  }

  const power = kart.currentPower;
  kart.currentPower = null;

  if (power === 'rocket') {
    // Find closest opponent
    let closestTarget: KartState | null = null;
    let minDist = Infinity;
    for (const other of karts) {
      if (other.id !== kart.id && !other.isDead) {
        const d = Math.hypot(other.x - kart.x, other.y - kart.y);
        if (d < minDist) {
          minDist = d;
          closestTarget = other;
        }
      }
    }

    const noseX = kart.x + Math.cos(kart.angle) * (KART_RADIUS + 12);
    const noseY = kart.y + Math.sin(kart.angle) * (KART_RADIUS + 12);
    const rocketSpeed = 12;

    projectiles.push({
      id: Math.random().toString(),
      ownerId: kart.id,
      type: 'rocket',
      x: noseX,
      y: noseY,
      vx: Math.cos(kart.angle) * rocketSpeed,
      vy: Math.sin(kart.angle) * rocketSpeed,
      radius: 8,
      life: 180, // 3 seconds at 60 fps
      targetId: closestTarget?.id,
      color: '#ff2a55',
    });
    sounds.playRocketLaunch();
  } else if (power === 'nitro') {
    kart.nitroTimer = 3.5;
    sounds.playNitro();
  } else if (power === 'shield') {
    kart.shieldActive = true;
    sounds.playShield();
  } else if (power === 'bomb') {
    const noseX = kart.x + Math.cos(kart.angle) * (KART_RADIUS + 16);
    const noseY = kart.y + Math.sin(kart.angle) * (KART_RADIUS + 16);
    projectiles.push({
      id: Math.random().toString(),
      ownerId: kart.id,
      type: 'bomb',
      x: noseX,
      y: noseY,
      vx: Math.cos(kart.angle) * 7,
      vy: Math.sin(kart.angle) * 7,
      radius: 12,
      life: 150,
      color: '#ff7700',
    });
    sounds.playRocketLaunch();
  } else if (power === 'freeze') {
    const noseX = kart.x + Math.cos(kart.angle) * (KART_RADIUS + 10);
    const noseY = kart.y + Math.sin(kart.angle) * (KART_RADIUS + 10);
    projectiles.push({
      id: Math.random().toString(),
      ownerId: kart.id,
      type: 'freeze_beam',
      x: noseX,
      y: noseY,
      vx: Math.cos(kart.angle) * 16,
      vy: Math.sin(kart.angle) * 16,
      radius: 6,
      life: 60,
      color: '#00f0ff',
    });
    sounds.playFreeze();
  } else if (power === 'spikes') {
    kart.spikesTimer = 5.0;
    sounds.playShield();
  } else if (power === 'oil') {
    // Drop oil behind kart
    const rearX = kart.x - Math.cos(kart.angle) * (KART_RADIUS + 16);
    const rearY = kart.y - Math.sin(kart.angle) * (KART_RADIUS + 16);
    traps.push({
      id: Math.random().toString(),
      ownerId: kart.id,
      type: 'oil',
      x: rearX,
      y: rearY,
      radius: 22,
      life: 900, // 15 seconds
    });
    sounds.playBumperBounce();
  } else if (power === 'lightning') {
    // Zap all other karts with electric strike
    for (const other of karts) {
      if (other.id !== kart.id && !other.isDead) {
        if (other.shieldActive) {
          other.shieldActive = false;
          sounds.playShield();
        } else {
          other.shockTimer = 2.4;
          applyDamage(other, kart, 32, particles, killFeed, 'lightning');
        }
        for (let p = 0; p < 14; p++) {
          particles.push({
            x: other.x + (Math.random() * 36 - 18),
            y: other.y + (Math.random() * 36 - 18),
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            radius: Math.random() * 4 + 2,
            color: Math.random() < 0.5 ? '#fde047' : '#00f0ff',
            alpha: 1,
            decay: 0.08,
            type: 'spark'
          });
        }
      }
    }
    sounds.playLightning();
  } else if (power === 'hammer') {
    kart.hammerTimer = 4.5;
    sounds.playHammer();
  } else if (power === 'tornado') {
    const noseX = kart.x + Math.cos(kart.angle) * (KART_RADIUS + 18);
    const noseY = kart.y + Math.sin(kart.angle) * (KART_RADIUS + 18);
    projectiles.push({
      id: Math.random().toString(),
      ownerId: kart.id,
      type: 'tornado',
      x: noseX,
      y: noseY,
      vx: Math.cos(kart.angle) * 8.5,
      vy: Math.sin(kart.angle) * 8.5,
      radius: 24,
      life: 180,
      color: '#a855f7'
    });
    sounds.playTornado();
  } else if (power === 'laser') {
    const noseX = kart.x + Math.cos(kart.angle) * (KART_RADIUS + 16);
    const noseY = kart.y + Math.sin(kart.angle) * (KART_RADIUS + 16);
    projectiles.push({
      id: Math.random().toString(),
      ownerId: kart.id,
      type: 'laser',
      x: noseX,
      y: noseY,
      vx: Math.cos(kart.angle) * 18,
      vy: Math.sin(kart.angle) * 18,
      radius: 8,
      life: 180,
      bounces: 4,
      color: '#00f0ff'
    });
    sounds.playLaser();
  }

  return power;
}

export function updateProjectiles(
  projectiles: Projectile[],
  karts: KartState[],
  track: Track,
  particles: Particle[],
  killFeed: KillFeedEvent[]
) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life--;

    // Homing logic for rockets
    if (p.type === 'rocket' && p.targetId) {
      const target = karts.find(k => k.id === p.targetId && !k.isDead);
      if (target) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(p.vy, p.vx);
        let diff = targetAngle - currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const turn = Math.sign(diff) * Math.min(Math.abs(diff), 0.08);
        const newAngle = currentAngle + turn;
        const speed = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(newAngle) * speed;
        p.vy = Math.sin(newAngle) * speed;
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    // Rocket exhaust particle
    if (p.type === 'rocket') {
      particles.push({
        x: p.x - p.vx * 0.4,
        y: p.y - p.vy * 0.4,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 2,
        color: Math.random() < 0.6 ? '#ff6600' : '#ffff00',
        alpha: 0.8,
        decay: 0.08,
        type: 'smoke'
      });
    } else if (p.type === 'tornado') {
      // Swirl particles & suction effect
      const angle = (p.life * 0.3);
      particles.push({
        x: p.x + Math.cos(angle) * 16,
        y: p.y + Math.sin(angle) * 16,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 4 + 2,
        color: Math.random() < 0.5 ? '#c084fc' : '#e9d5ff',
        alpha: 0.8,
        decay: 0.08,
        type: 'smoke'
      });

      for (const kart of karts) {
        if (kart.isDead || kart.id === p.ownerId) continue;
        const dist = Math.hypot(kart.x - p.x, kart.y - p.y);
        if (dist < 130 && dist > 0) {
          const pull = 0.9;
          kart.x += ((p.x - kart.x) / dist) * pull;
          kart.y += ((p.y - kart.y) / dist) * pull;
        }
      }
    } else if (p.type === 'laser') {
      // High-energy laser trail
      particles.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
        color: '#00f0ff',
        alpha: 0.9,
        decay: 0.09,
        type: 'spark'
      });
    }

    // Check hit against track walls
    let hitWall = false;
    let hitHorizontal = false;
    let hitVertical = false;

    if (p.x < 24 || p.x > track.width - 24) {
      hitWall = true;
      hitVertical = true;
    }
    if (p.y < 24 || p.y > track.height - 24) {
      hitWall = true;
      hitHorizontal = true;
    }

    if (!hitWall) {
      for (const w of track.walls) {
        if (p.x >= w.x && p.x <= w.x + w.width && p.y >= w.y && p.y <= w.y + w.height) {
          hitWall = true;
          // Determine reflection surface
          const distToLeft = Math.abs(p.x - w.x);
          const distToRight = Math.abs(p.x - (w.x + w.width));
          const distToTop = Math.abs(p.y - w.y);
          const distToBottom = Math.abs(p.y - (w.y + w.height));
          const minH = Math.min(distToLeft, distToRight);
          const minV = Math.min(distToTop, distToBottom);
          if (minH < minV) {
            hitVertical = true;
          } else {
            hitHorizontal = true;
          }
          break;
        }
      }
    }

    // Ricochet logic for Laser Beam
    if (hitWall && p.type === 'laser' && p.bounces && p.bounces > 0) {
      if (hitVertical) p.vx = -p.vx;
      if (hitHorizontal) p.vy = -p.vy;
      p.bounces--;
      sounds.playLaser();
      for (let s = 0; s < 6; s++) {
        particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          radius: Math.random() * 3 + 1,
          color: '#00f0ff',
          alpha: 1,
          decay: 0.08,
          type: 'spark'
        });
      }
      continue;
    }

    if (hitWall || p.life <= 0) {
      explodeProjectile(p, particles);
      projectiles.splice(i, 1);
      continue;
    }

    // Check hit against karts
    let hitKart = false;
    for (const kart of karts) {
      if (kart.isDead || kart.id === p.ownerId) continue;

      const dist = Math.hypot(kart.x - p.x, kart.y - p.y);
      if (dist < KART_RADIUS + p.radius) {
        hitKart = true;
        const attacker = karts.find(k => k.id === p.ownerId) || null;

        if (kart.shieldActive) {
          kart.shieldActive = false;
          sounds.playShield();
          explodeProjectile(p, particles);
        } else if (p.type === 'freeze_beam') {
          kart.frozenTimer = 2.2;
          applyDamage(kart, attacker, 20, particles, killFeed, 'freeze');
          explodeProjectile(p, particles);
        } else if (p.type === 'bomb') {
          explodeBomb(p, karts, particles, killFeed);
        } else if (p.type === 'tornado') {
          kart.spinTimer = 1.8;
          kart.vx = p.vx * 1.5;
          kart.vy = p.vy * 1.5;
          applyDamage(kart, attacker, 45, particles, killFeed, 'tornado');
          explodeProjectile(p, particles);
        } else if (p.type === 'laser') {
          applyDamage(kart, attacker, 50, particles, killFeed, 'laser');
          explodeProjectile(p, particles);
        } else {
          // Rocket hit!
          applyDamage(kart, attacker, 60, particles, killFeed, 'rocket');
          explodeProjectile(p, particles);
        }
        break;
      }
    }

    if (hitKart) {
      projectiles.splice(i, 1);
    }
  }
}

export function updateTraps(traps: HazardTrap[], karts: KartState[]) {
  for (let i = traps.length - 1; i >= 0; i--) {
    const trap = traps[i];
    trap.life--;
    if (trap.life <= 0) {
      traps.splice(i, 1);
      continue;
    }

    for (const kart of karts) {
      if (kart.isDead || kart.invulnerableTimer > 0) continue;

      const dist = Math.hypot(kart.x - trap.x, kart.y - trap.y);
      if (dist < KART_RADIUS + trap.radius) {
        if (trap.type === 'oil') {
          kart.spinTimer = 1.2;
          sounds.playBumperBounce();
          traps.splice(i, 1);
          break;
        }
      }
    }
  }
}

export function updatePowerCrates(crates: PowerCrate[], karts: KartState[]) {
  const POWERS: PowerType[] = [
    'rocket', 
    'nitro', 
    'shield', 
    'bomb', 
    'freeze', 
    'spikes', 
    'oil', 
    'lightning', 
    'hammer', 
    'tornado', 
    'laser'
  ];

  for (const crate of crates) {
    crate.rotation += 0.04;
    if (!crate.active) {
      crate.respawnTimer -= 1 / 60;
      if (crate.respawnTimer <= 0) {
        crate.active = true;
      }
      continue;
    }

    // Check collision with karts
    for (const kart of karts) {
      if (kart.isDead) continue;
      const dist = Math.hypot(kart.x - crate.x, kart.y - crate.y);
      if (dist < KART_RADIUS + CRATE_RADIUS) {
        crate.active = false;
        crate.respawnTimer = 6.0; // 6 sec respawn

        if (!kart.currentPower) {
          const picked = POWERS[Math.floor(Math.random() * POWERS.length)];
          kart.currentPower = picked;
          sounds.playCrateCollect();
        }
        break;
      }
    }
  }
}

export function applyDamage(
  victim: KartState,
  attacker: KartState | null,
  damage: number,
  particles: Particle[],
  killFeed: KillFeedEvent[],
  powerUsed?: PowerType
) {
  if (victim.isDead || victim.invulnerableTimer > 0) return;

  if (victim.shieldActive) {
    victim.shieldActive = false;
    sounds.playShield();
    return;
  }

  victim.hp = Math.max(0, victim.hp - damage);
  if (attacker) {
    attacker.damageDealt += damage;
    attacker.score += Math.round(damage / 2);
  }

  // Knockback recoil
  if (attacker) {
    const angle = Math.atan2(victim.y - attacker.y, victim.x - attacker.x);
    victim.vx = Math.cos(angle) * 8;
    victim.vy = Math.sin(angle) * 8;
  }

  if (victim.hp <= 0) {
    smashKart(victim, attacker, attacker ? attacker.config.name : 'Hazard', particles, killFeed, powerUsed);
  }
}

export function smashKart(
  victim: KartState,
  attacker: KartState | null,
  killerName: string,
  particles: Particle[],
  killFeed: KillFeedEvent[],
  powerUsed?: PowerType
) {
  victim.isDead = true;
  victim.respawnCountdown = 2.0;
  victim.currentPower = null;
  victim.nitroTimer = 0;
  victim.frozenTimer = 0;
  victim.spikesTimer = 0;
  victim.spinTimer = 0;

  if (attacker && attacker.id !== victim.id) {
    attacker.smashes += 1;
    attacker.score += 150;
  }

  sounds.playExplosion();

  // Massive explosion particles
  for (let p = 0; p < 35; p++) {
    const pAngle = Math.random() * Math.PI * 2;
    const pSpeed = Math.random() * 8 + 2;
    particles.push({
      x: victim.x,
      y: victim.y,
      vx: Math.cos(pAngle) * pSpeed,
      vy: Math.sin(pAngle) * pSpeed,
      radius: Math.random() * 6 + 3,
      color: Math.random() < 0.4 ? victim.color : Math.random() < 0.7 ? '#ff3b30' : '#ffcc00',
      alpha: 1,
      decay: Math.random() * 0.03 + 0.02,
      type: 'explosion'
    });
  }

  // Killfeed log
  killFeed.unshift({
    id: Math.random().toString(),
    attackerName: killerName,
    attackerColor: attacker ? attacker.color : '#ff4444',
    victimName: victim.config.name,
    victimColor: victim.color,
    powerUsed,
    timestamp: Date.now(),
  });
  if (killFeed.length > 5) {
    killFeed.pop();
  }
}

export function respawnKart(kart: KartState, track: Track) {
  kart.isDead = false;
  kart.hp = kart.maxHp;
  kart.invulnerableTimer = 2.5; // Safe shield on spawn
  kart.speed = 0;
  kart.vx = 0;
  kart.vy = 0;

  // Pick random spawn point with least enemies nearby
  const spawn = track.playerSpawns[Math.floor(Math.random() * track.playerSpawns.length)];
  kart.x = spawn.x + (Math.random() * 60 - 30);
  kart.y = spawn.y + (Math.random() * 60 - 30);
  kart.angle = spawn.angle;
}

function explodeProjectile(p: Projectile, particles: Particle[]) {
  sounds.playExplosion();
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 1;
    particles.push({
      x: p.x,
      y: p.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 4 + 2,
      color: p.color,
      alpha: 1,
      decay: 0.05,
      type: 'explosion'
    });
  }
}

function explodeBomb(
  p: Projectile, 
  karts: KartState[], 
  particles: Particle[], 
  killFeed: KillFeedEvent[]
) {
  sounds.playExplosion();
  const blastRadius = 90;

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7 + 2;
    particles.push({
      x: p.x,
      y: p.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 5 + 3,
      color: Math.random() < 0.5 ? '#ff3b30' : '#ff9500',
      alpha: 1,
      decay: 0.03,
      type: 'explosion'
    });
  }

  const attacker = karts.find(k => k.id === p.ownerId) || null;
  for (const kart of karts) {
    if (kart.isDead) continue;
    const dist = Math.hypot(kart.x - p.x, kart.y - p.y);
    if (dist < blastRadius) {
      const damageRatio = 1 - (dist / blastRadius);
      const damage = Math.round(75 * damageRatio);
      applyDamage(kart, attacker, damage, particles, killFeed, 'bomb');
    }
  }
}

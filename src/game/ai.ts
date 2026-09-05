import { KartState, Track, PowerCrate, Projectile, HazardTrap, Particle } from '../types';
import { activateKartPower } from './physics';

export interface BotDecision {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  drift: boolean;
}

export function updateBotAI(
  bot: KartState,
  karts: KartState[],
  track: Track,
  crates: PowerCrate[],
  projectiles: Projectile[],
  traps: HazardTrap[],
  particles: Particle[],
  fairFiftyPercentBalancing: boolean = true
): BotDecision {
  if (bot.isDead) {
    return { forward: false, backward: false, left: false, right: false, drift: false };
  }

  // 1. Determine dynamic handicap relative to human players
  const humanPlayers = karts.filter(k => !k.config.isBot && !k.isDead);
  const highestHumanScore = humanPlayers.reduce((max, h) => Math.max(max, h.score), 0);
  const highestHumanSmashes = humanPlayers.reduce((max, h) => Math.max(max, h.smashes), 0);

  // Score parity factor: if human has more score, bot becomes more aggressive/skilled
  // If bot is ahead, bot eases off slightly to target the 50% win probability
  let skillModifier = 1.0;
  if (fairFiftyPercentBalancing && humanPlayers.length > 0) {
    const scoreDiff = highestHumanScore - bot.score;
    const smashDiff = highestHumanSmashes - bot.smashes;
    if (scoreDiff > 100 || smashDiff >= 1) {
      // Human leading: Boost bot accuracy and aggression
      skillModifier = 1.35;
    } else if (scoreDiff < -100 || smashDiff <= -1) {
      // Bot leading: Relax bot slightly to maintain 50% balance
      skillModifier = 0.75;
    }
  }

  // 2. Select target: either a nearby active power crate, or the nearest enemy kart
  let targetX = track.width / 2;
  let targetY = track.height / 2;
  let targetFound = false;

  // If no powerup, look for closest active crate
  if (!bot.currentPower) {
    let closestCrate: PowerCrate | null = null;
    let minDist = Infinity;
    for (const crate of crates) {
      if (crate.active) {
        const d = Math.hypot(crate.x - bot.x, crate.y - bot.y);
        if (d < minDist) {
          minDist = d;
          closestCrate = crate;
        }
      }
    }
    if (closestCrate) {
      targetX = closestCrate.x;
      targetY = closestCrate.y;
      targetFound = true;
    }
  }

  // If already have powerup or no crate found, chase nearest enemy kart (preferring humans if skillModifier is high)
  if (!targetFound) {
    let closestOpponent: KartState | null = null;
    let minDist = Infinity;
    for (const other of karts) {
      if (other.id !== bot.id && !other.isDead) {
        let d = Math.hypot(other.x - bot.x, other.y - bot.y);
        // Prioritize human if human is ahead
        if (!other.config.isBot && skillModifier > 1.0) {
          d *= 0.7;
        }
        if (d < minDist) {
          minDist = d;
          closestOpponent = other;
        }
      }
    }
    if (closestOpponent) {
      targetX = closestOpponent.x;
      targetY = closestOpponent.y;
      targetFound = true;
    }
  }

  // 3. Obstacle & wall avoidance raycasting
  let steerAngle = Math.atan2(targetY - bot.y, targetX - bot.x);

  // Check ahead for walls
  const lookAheadDist = 70;
  const probeX = bot.x + Math.cos(bot.angle) * lookAheadDist;
  const probeY = bot.y + Math.sin(bot.angle) * lookAheadDist;

  // Boundary repulsion
  if (probeX < 80) steerAngle = 0;
  else if (probeX > track.width - 80) steerAngle = Math.PI;
  else if (probeY < 80) steerAngle = Math.PI / 2;
  else if (probeY > track.height - 80) steerAngle = -Math.PI / 2;

  // Wall repulsion
  for (const wall of track.walls) {
    if (
      probeX >= wall.x - 20 &&
      probeX <= wall.x + wall.width + 20 &&
      probeY >= wall.y - 20 &&
      probeY <= wall.y + wall.height + 20
    ) {
      // Steer perpendicular
      steerAngle += (Math.random() < 0.5 ? 1 : -1) * 1.2;
      break;
    }
  }

  // 4. Calculate steering difference
  let angleDiff = steerAngle - bot.angle;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

  const left = angleDiff < -0.15;
  const right = angleDiff > 0.15;
  const drift = Math.abs(angleDiff) > 0.8 && bot.speed > 3.5;
  const forward = Math.abs(angleDiff) < 1.8;
  const backward = Math.abs(angleDiff) >= 1.8 && bot.speed < 1;

  // 5. Intelligent Power-up Activation
  if (bot.currentPower) {
    const power = bot.currentPower;
    let shouldFire = false;

    if (power === 'nitro' || power === 'spikes') {
      // Fire when facing an opponent within medium range
      for (const other of karts) {
        if (other.id !== bot.id && !other.isDead) {
          const dist = Math.hypot(other.x - bot.x, other.y - bot.y);
          if (dist < 220) {
            shouldFire = true;
            break;
          }
        }
      }
    } else if (power === 'shield') {
      // Fire if HP low or projectiles approaching
      if (bot.hp < 70) {
        shouldFire = true;
      }
      for (const p of projectiles) {
        if (p.ownerId !== bot.id && Math.hypot(p.x - bot.x, p.y - bot.y) < 160) {
          shouldFire = true;
          break;
        }
      }
    } else if (power === 'rocket' || power === 'freeze' || power === 'bomb') {
      // Fire if roughly lined up with an opponent
      for (const other of karts) {
        if (other.id !== bot.id && !other.isDead) {
          const dist = Math.hypot(other.x - bot.x, other.y - bot.y);
          if (dist < 450) {
            const angleToTarget = Math.atan2(other.y - bot.y, other.x - bot.x);
            let diff = angleToTarget - bot.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            // Aim tolerance adjusted by skillModifier
            const tolerance = 0.35 * skillModifier;
            if (Math.abs(diff) < tolerance) {
              shouldFire = true;
              break;
            }
          }
        }
      }
    } else if (power === 'oil') {
      // Drop if someone is trailing behind
      for (const other of karts) {
        if (other.id !== bot.id && !other.isDead) {
          const dist = Math.hypot(other.x - bot.x, other.y - bot.y);
          if (dist < 150) {
            shouldFire = true;
            break;
          }
        }
      }
    }

    // Fire powerup with slight chance check for human-like reaction time
    const fireProbability = 0.12 * skillModifier;
    if (shouldFire && Math.random() < fireProbability) {
      activateKartPower(bot, karts, projectiles, traps, particles);
    }
  }

  return { forward, backward, left, right, drift };
}

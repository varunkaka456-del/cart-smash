export type GameMode = 'smash_race' | 'timed_battle';

export type PowerType = 
  | 'rocket' 
  | 'nitro' 
  | 'shield' 
  | 'bomb' 
  | 'freeze' 
  | 'spikes' 
  | 'oil'
  | 'lightning'
  | 'hammer'
  | 'tornado'
  | 'laser';

export type CartChassis = 'speedster' | 'heavy' | 'buggy' | 'classic';

export type TopperType = 'none' | 'crown' | 'helmet' | 'horns' | 'party' | 'shades' | 'stars';

export interface PlayerConfig {
  id: string;
  name: string;
  isBot: boolean;
  color: string;
  secondaryColor: string;
  chassis: CartChassis;
  topper: TopperType;
  controls?: {
    up: string;
    down: string;
    left: string;
    right: string;
    action: string;
    drift: string;
  };
}

export interface TrackObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'rock' | 'magma' | 'pillar' | 'bumper';
  color?: string;
}

export interface BoostPad {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number; // direction of boost
  speed: number;
}

export interface PowerCrate {
  id: string;
  x: number;
  y: number;
  active: boolean;
  respawnTimer: number;
  rotation: number;
}

export interface Track {
  id: string;
  name: string;
  subtitle: string;
  theme: 'neon' | 'sunset' | 'emerald' | 'rainbow' | 'glacier' | 'white_pearl' | 'snow_white';
  backgroundColor: string;
  gridColor: string;
  wallColor: string;
  wallBorderColor: string;
  hazardColor?: string;
  width: number;
  height: number;
  walls: { x: number; y: number; width: number; height: number }[];
  obstacles: TrackObstacle[];
  boostPads: BoostPad[];
  crateSpawns: { x: number; y: number }[];
  playerSpawns: { x: number; y: number; angle: number }[];
}

export interface Projectile {
  id: string;
  ownerId: string;
  type: 'rocket' | 'bomb' | 'freeze_beam' | 'tornado' | 'laser';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  targetId?: string;
  color: string;
  bounces?: number;
}

export interface HazardTrap {
  id: string;
  ownerId: string;
  type: 'oil' | 'mine';
  x: number;
  y: number;
  radius: number;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type?: 'smoke' | 'spark' | 'explosion' | 'star' | 'frost';
}

export interface SkidMark {
  x: number;
  y: number;
  angle: number;
  alpha: number;
}

export interface KartState {
  id: string;
  config: PlayerConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // in radians
  speed: number;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  
  // Combat stats
  hp: number;
  maxHp: number;
  smashes: number;
  score: number;
  damageDealt: number;
  
  // Powerups & effects
  currentPower: PowerType | null;
  shieldActive: boolean;
  nitroTimer: number;
  frozenTimer: number;
  spikesTimer: number;
  spinTimer: number;
  hammerTimer: number;
  shockTimer: number;
  
  // Respawn & invulnerability
  isDead: boolean;
  respawnCountdown: number;
  invulnerableTimer: number;
  
  // Drifting
  isDrifting: boolean;
  driftDirection: number; // -1 or 1
  driftCharge: number;
  
  // Stats
  color: string;
}

export interface KillFeedEvent {
  id: string;
  attackerName: string;
  attackerColor: string;
  victimName: string;
  victimColor: string;
  powerUsed?: PowerType;
  timestamp: number;
}

export interface MatchScoreboardItem {
  playerId: string;
  name: string;
  isBot: boolean;
  color: string;
  smashes: number;
  damageDealt: number;
  score: number;
  rank: number;
}

export interface MatchRecord {
  id: string;
  date: string;
  timestamp: number;
  trackName: string;
  gameMode: GameMode;
  humanPlayersCount: number;
  botCount: number;
  winnerName: string;
  winnerColor: string;
  isWinnerBot: boolean;
  durationSeconds: number;
  scoreboard: MatchScoreboardItem[];
}

export interface OverallStats {
  totalMatches: number;
  humanWins: number;
  botWins: number;
  totalSmashes: number;
  totalDamage: number;
  powerUpsUsedCount: Record<PowerType, number>;
  mostPlayedTrack: string;
}

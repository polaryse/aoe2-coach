import type { IdleTcStats, PlayerIdentity, ResourceStats, TimelineEvent } from '../types';

interface ReplayBinaryAnalysis {
  players: PlayerIdentity[];
  events: TimelineEvent[];
  resourceStats: ResourceStats[];
  idleTcStats: IdleTcStats[];
  durationMs: number;
  notes: string[];
}

interface SyncPlayerSnapshot {
  totalResources: number;
  objectCount: number;
}

interface VillagerQueuePoint {
  playerId: string;
  time: number;
  objectId: number;
  amount: number;
}

interface ParsedAction {
  playerId?: number;
  technologyId?: number;
  buildingId?: number;
  unitId?: number;
  amount?: number;
  objectIds?: number[];
}

interface MilitaryProductionSummary {
  firstTime: number;
  totalQueued: number;
  unitTypes: Set<number>;
}

const OP_ACTION = 1;
const OP_SYNC = 2;
const OP_VIEWLOCK = 3;
const OP_CHAT = 4;
const OP_POSTGAME = 6;
const ACTION_RESIGN = 11;
const ACTION_MAKE = 100;
const ACTION_RESEARCH = 101;
const ACTION_BUILD = 102;
const ACTION_DE_QUEUE = 129;
const VILLAGER_ID = 83;
const VILLAGER_TRAIN_MS = 25_000;

const civilizationNames: Record<number, string> = {
  1: 'Britons', 2: 'Franks', 3: 'Goths', 4: 'Teutons', 5: 'Japanese', 6: 'Chinese', 7: 'Byzantines',
  8: 'Persians', 9: 'Saracens', 10: 'Turks', 11: 'Vikings', 12: 'Mongols', 13: 'Celts', 14: 'Spanish',
  15: 'Aztecs', 16: 'Mayans', 17: 'Huns', 18: 'Koreans', 19: 'Italians', 20: 'Hindustanis', 21: 'Incas',
  22: 'Magyars', 23: 'Slavs', 24: 'Portuguese', 25: 'Ethiopians', 26: 'Malians', 27: 'Berbers', 28: 'Khmer',
  29: 'Malay', 30: 'Burmese', 31: 'Vietnamese', 32: 'Bulgarians', 33: 'Tatars', 34: 'Cumans',
  35: 'Lithuanians', 36: 'Burgundians', 37: 'Sicilians', 38: 'Poles', 39: 'Bohemians', 40: 'Dravidians',
  41: 'Bengalis', 42: 'Gurjaras', 43: 'Romans', 44: 'Armenians', 45: 'Georgians',
};

const buildingNames: Record<number, string> = {
  12: 'Barracks', 45: 'Dock', 49: 'Siege Workshop', 82: 'Castle', 84: 'Market', 87: 'Archery Range',
  101: 'Stable', 103: 'Blacksmith', 104: 'Monastery', 109: 'Town Center', 209: 'University',
};

const ageResearch: Record<number, string> = {
  101: 'Feudal Age',
  102: 'Castle Age',
  103: 'Imperial Age',
};

export async function parseAoe2Replay(buffer: ArrayBuffer): Promise<ReplayBinaryAnalysis | null> {
  const bytes = new Uint8Array(buffer);
  if (bytes.byteLength < 64) return null;

  const headerLength = readUint32(bytes, 0);
  if (headerLength < 16 || headerLength >= bytes.byteLength) return null;

  try {
    const header = await inflateHeader(bytes.slice(8, headerLength));
    const players = parsePlayers(header);
    const parsedBody = await parseBody(bytes, headerLength, players);
    if (!parsedBody.events.length || parsedBody.durationMs <= 0) return null;

    return {
      players,
      events: parsedBody.events,
      resourceStats: buildResourceStats(parsedBody.lastSnapshots, players),
      idleTcStats: estimateIdleTc(parsedBody.villagerQueues, parsedBody.ageTimes, players),
      durationMs: parsedBody.durationMs,
      notes: [
        'Native operation stream decoded locally: age transitions and action timestamps come from replay game time.',
        'Player names, AI status, and civilizations were read from the compressed replay header.',
        'Economy totals are the final synchronized resource-bank snapshot, not lifetime resources collected.',
        'Idle TC time is estimated from gaps in recorded villager queue coverage; new or destroyed Town Centers and civilization train-time bonuses can make it over- or under-count.',
      ],
    };
  } catch {
    return null;
  }
}

async function inflateHeader(compressed: Uint8Array) {
  const Decompression = globalThis.DecompressionStream as unknown as undefined | (new (format: string) => {
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
  });
  if (!Decompression) throw new Error('Replay decompression is not supported in this browser.');
  const compressedBuffer = compressed.slice().buffer as ArrayBuffer;
  const stream = new Blob([compressedBuffer]).stream().pipeThrough(new Decompression('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function parsePlayers(header: Uint8Array): PlayerIdentity[] {
  const reader = new BinaryReader(header);
  reader.skip(8);
  const oldSaveVersion = reader.float32();
  const saveVersion = oldSaveVersion === -1 ? reader.uint32() / 65_536 : oldSaveVersion;

  if (saveVersion < 25) throw new Error('Unsupported replay header version.');
  reader.skip(4); // build
  if (saveVersion >= 26.16) reader.skip(4); // timestamp
  reader.skip(12);
  const dlcCount = reader.uint32();
  if (dlcCount > 128) throw new Error('Invalid replay DLC block.');
  reader.skip(dlcCount * 4 + 4);
  reader.skip(4); // map dimension or difficulty
  reader.skip(4);
  reader.skip(4); // RMS map
  reader.skip(4);
  reader.skip(16); // victory, resources, starting age, ending age
  reader.skip(12);
  reader.skip(4); // speed
  reader.skip(8); // treaty and population
  const numberOfPlayers = reader.uint32();
  if (numberOfPlayers < 1 || numberOfPlayers > 8) throw new Error('Invalid player count.');
  reader.skip(14);
  if (saveVersion >= 61.5) reader.skip(1);
  reader.skip(2); // random positions, all technologies
  reader.skip(1);
  reader.skip(10); // lobby flags
  reader.skip(12);
  if (saveVersion >= 25.06) reader.skip(1);
  if (saveVersion > 50) reader.skip(1);

  const players: PlayerIdentity[] = [];
  for (let index = 0; index < numberOfPlayers; index += 1) {
    reader.skip(4);
    reader.skip(4); // color
    reader.skip(2);
    reader.skip(1); // team
    reader.skip(9);
    const civilizationId = reader.uint32();
    if (saveVersion >= 61.5) {
      const customCivilizationCount = reader.uint32();
      if (customCivilizationCount > 128) throw new Error('Invalid custom civilization block.');
      if (saveVersion >= 63) reader.skip(customCivilizationCount * 4);
    }

    const slotName = reader.deString();
    reader.skip(1);
    const aiName = reader.deString();
    const censoredName = saveVersion >= 66.3 ? reader.deString() : '';
    const name = reader.deString();
    const playerType = reader.uint32();
    const profileId = reader.uint32();
    reader.skip(4);
    const playerNumber = reader.int32();
    reader.skip(2);
    if (saveVersion >= 25.06) reader.skip(8);
    if (saveVersion >= 64.3) reader.skip(4);
    if (reader.isDeString()) reader.deString(); // Added to newer DE headers.

    const isAi = playerType === 4 || profileId === 0xffffffff;
    const displayName = cleanName(name || censoredName || (isAi ? aiName : slotName) || slotName || aiName) || `Player ${playerNumber}`;
    players.push({
      id: String(playerNumber),
      name: displayName,
      isAi,
      civilizationId,
      civilization: civilizationNames[civilizationId] ?? `Civilization ${civilizationId}`,
    });
  }

  return players.sort((left, right) => Number(left.id) - Number(right.id));
}

async function parseBody(bytes: Uint8Array, bodyStart: number, players: PlayerIdentity[]) {
  const reader = new BinaryReader(bytes, bodyStart);
  skipBodyMeta(reader);

  let gameTime = 0;
  let operations = 0;
  const events: TimelineEvent[] = [];
  const ageTimes = new Map<string, Map<string, number>>();
  const lastSnapshots = new Map<string, SyncPlayerSnapshot>();
  const villagerQueues: VillagerQueuePoint[] = [];
  const firstBuildings = new Set<string>();
  const militaryProduction = new Map<string, MilitaryProductionSummary>();

  while (reader.remaining >= 4) {
    const operation = reader.uint32();
    operations += 1;

    if (operation === OP_SYNC) {
      const sync = parseSync(reader);
      gameTime += sync.increment;
      for (const [playerId, snapshot] of sync.snapshots) lastSnapshots.set(playerId, snapshot);
    } else if (operation === OP_VIEWLOCK) {
      reader.skip(12);
    } else if (operation === OP_CHAT) {
      reader.skip(4);
      const length = reader.uint32();
      const message = new TextDecoder().decode(reader.take(length));
      const ageEvent = parseAgeChat(message, gameTime, players);
      if (ageEvent) {
        events.push(ageEvent.event);
        const playerAges = ageTimes.get(ageEvent.playerId) ?? new Map<string, number>();
        playerAges.set(ageEvent.age, gameTime);
        ageTimes.set(ageEvent.playerId, playerAges);
      }
    } else if (operation === OP_ACTION) {
      const length = reader.uint32();
      if (length < 1 || length > reader.remaining) throw new Error('Invalid replay action length.');
      const actionId = reader.uint8();
      const payload = reader.take(length - 1);
      reader.skip(4); // sequence
      const action = parseAction(actionId, payload);
      const playerId = action.playerId ? String(action.playerId) : undefined;

      if (actionId === ACTION_RESEARCH && playerId && action.technologyId && ageResearch[action.technologyId]) {
        const age = ageResearch[action.technologyId];
        events.push(makeEvent(gameTime, `Clicked ${age}`, playerId, players, 'Macro', 'Info'));
      }
      if (actionId === ACTION_BUILD && playerId && action.buildingId && buildingNames[action.buildingId]) {
        const key = `${playerId}:${action.buildingId}`;
        if (!firstBuildings.has(key)) {
          firstBuildings.add(key);
          events.push(makeEvent(gameTime, `First ${buildingNames[action.buildingId]}`, playerId, players, 'Decision-making', 'Info'));
        }
      }
      if ((actionId === ACTION_DE_QUEUE || actionId === ACTION_MAKE) && playerId && action.unitId === VILLAGER_ID) {
        for (const objectId of action.objectIds ?? [0]) {
          villagerQueues.push({ playerId, time: gameTime, objectId, amount: Math.max(1, action.amount ?? 1) });
        }
      }
      if ((actionId === ACTION_DE_QUEUE || actionId === ACTION_MAKE) && playerId && action.unitId && action.unitId !== VILLAGER_ID) {
        const existing = militaryProduction.get(playerId) ?? { firstTime: gameTime, totalQueued: 0, unitTypes: new Set<number>() };
        existing.totalQueued += Math.max(1, action.amount ?? 1);
        existing.unitTypes.add(action.unitId);
        militaryProduction.set(playerId, existing);
      }
      if (actionId === ACTION_RESIGN && playerId) {
        events.push(makeEvent(gameTime, 'Resigned', playerId, players, 'Decision-making', 'Info'));
      }
    } else if (operation === OP_POSTGAME) {
      break;
    } else {
      throw new Error(`Unsupported replay operation ${operation}.`);
    }

    if (operations % 75_000 === 0) await pauseForUi();
  }

  for (const [playerId, production] of militaryProduction) {
    events.push({
      ...makeEvent(production.firstTime, 'Military Production Began', playerId, players, 'Micro', 'Info'),
      detail: `${production.totalQueued.toLocaleString()} units queued across ${production.unitTypes.size} detected unit types.`,
    });
  }

  events.push({
    minute: formatGameTime(gameTime),
    label: 'Match End',
    detail: `Recorded duration ${formatGameTime(gameTime)}.`,
    category: 'Decision-making',
    severity: 'Info',
  });

  return {
    durationMs: gameTime,
    events: sortAndLimitEvents(events),
    ageTimes,
    lastSnapshots,
    villagerQueues,
  };
}

function skipBodyMeta(reader: BinaryReader) {
  const first = reader.uint32();
  if (first !== 500) reader.skip(4);
  reader.skip(20);
  const blockStart = reader.position;
  const firstValue = reader.uint32();
  const secondValue = reader.uint32();
  reader.skip(4);
  if (firstValue !== 0) reader.seek(blockStart);
  if (secondValue === 2) reader.seek(reader.position - 8);
}

function parseSync(reader: BinaryReader) {
  const increment = reader.uint32();
  const marker = reader.uint32();
  const snapshots = new Map<string, SyncPlayerSnapshot>();
  if (marker !== 0) {
    reader.seek(reader.position - 4);
    return { increment, snapshots };
  }

  const checksumBlock = reader.position;
  reader.skip(4);
  reader.skip(4);
  reader.skip(4);
  const isDe = reader.uint32();
  if (!isDe) {
    reader.skip(8);
    return { increment, snapshots };
  }

  reader.seek(checksumBlock);
  const values = Array.from({ length: 88 }, () => reader.uint32());
  const currentTime = reader.uint32();
  for (let offset = 0; offset < values.length; offset += 11) {
    const totalResources = values[offset + 1];
    const playerId = values[offset + 8];
    if (!totalResources || !playerId) continue;
    snapshots.set(String(playerId), { totalResources, objectCount: values[offset + 6] });
  }
  return { increment, currentTime, snapshots };
}

function parseAction(actionId: number, payload: Uint8Array): ParsedAction {
  if (!payload.length) return {};
  if (actionId === ACTION_RESIGN) return { playerId: payload[0] };
  if (payload.length < 3) return {};

  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const playerId = view.getInt8(0);
  const declaredLength = view.getInt16(1, true);
  if (declaredLength + 3 !== payload.length) return { playerId };
  const raw = payload.subarray(3);
  const rawView = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);

  if (actionId === ACTION_RESEARCH && raw.length >= 13) {
    return { playerId, technologyId: rawView.getInt16(6, true) };
  }
  if (actionId === ACTION_BUILD && raw.length >= 16) {
    return { playerId, buildingId: rawView.getUint32(12, true) };
  }
  if (actionId === ACTION_DE_QUEUE && raw.length >= 16) {
    const selected = rawView.getInt16(0, true);
    const objectIds = readObjectIds(rawView, 16, selected);
    return {
      playerId,
      unitId: rawView.getInt16(8, true),
      amount: rawView.getInt16(10, true),
      objectIds,
    };
  }
  if (actionId === ACTION_MAKE && raw.length >= 10) {
    return { playerId, buildingId: rawView.getUint16(0, true), unitId: rawView.getInt16(8, true), amount: 1, objectIds: [rawView.getUint16(0, true)] };
  }
  return { playerId };
}

function parseAgeChat(message: string, time: number, players: PlayerIdentity[]) {
  const playerId = message.match(/<player_id,(\d+),-?\d+>/i)?.[1] ?? message.match(/"player"\s*:\s*(\d+)/i)?.[1];
  const age = message.match(/advanced to the (Feudal|Castle|Imperial) Age/i)?.[1];
  if (!playerId || !age) return null;
  const ageName = `${age} Age`;
  return {
    playerId,
    age: ageName,
    event: makeEvent(time, `${ageName} Transition`, playerId, players, age === 'Imperial' ? 'Decision-making' : 'Macro', 'Info'),
  };
}

function makeEvent(
  time: number,
  label: string,
  playerId: string,
  players: PlayerIdentity[],
  category: TimelineEvent['category'],
  severity: TimelineEvent['severity'],
): TimelineEvent {
  return {
    minute: formatGameTime(time),
    label,
    playerId,
    playerName: players.find((player) => player.id === playerId)?.name ?? `Player ${playerId}`,
    category,
    severity,
  };
}

function buildResourceStats(snapshots: Map<string, SyncPlayerSnapshot>, players: PlayerIdentity[]): ResourceStats[] {
  return [...snapshots.entries()].map(([playerId, snapshot]) => ({
    playerId,
    player: players.find((player) => player.id === playerId)?.name ?? `Player ${playerId}`,
    total: snapshot.totalResources,
    objectCount: snapshot.objectCount,
    snapshotType: 'Current bank' as const,
  }));
}

function estimateIdleTc(
  queuePoints: VillagerQueuePoint[],
  ageTimes: Map<string, Map<string, number>>,
  players: PlayerIdentity[],
): IdleTcStats[] {
  const byPlayer = new Map<string, Map<number, VillagerQueuePoint[]>>();
  for (const point of queuePoints) {
    const playerQueues = byPlayer.get(point.playerId) ?? new Map<number, VillagerQueuePoint[]>();
    playerQueues.set(point.objectId, [...(playerQueues.get(point.objectId) ?? []), point]);
    byPlayer.set(point.playerId, playerQueues);
  }

  return [...byPlayer.entries()].map(([playerId, objectQueues]) => {
    const ages = ageTimes.get(playerId) ?? new Map<string, number>();
    const byAge: NonNullable<IdleTcStats['byAge']> = {};
    [...objectQueues.values()].forEach((points, queueIndex) => {
      points.sort((left, right) => left.time - right.time);
      let coverageEnd = queueIndex === 0 ? 0 : points[0].time;
      for (const point of points) {
        if (point.time > coverageEnd) addIdleInterval(byAge, coverageEnd, point.time, ages);
        coverageEnd = Math.max(coverageEnd, point.time) + point.amount * VILLAGER_TRAIN_MS;
      }
    });
    const seconds = Object.values(byAge).reduce((total, value) => total + (value ?? 0), 0);
    return {
      playerId,
      player: players.find((player) => player.id === playerId)?.name ?? `Player ${playerId}`,
      seconds,
      byAge,
      estimated: true,
    };
  });
}

function addIdleInterval(
  byAge: NonNullable<IdleTcStats['byAge']>,
  start: number,
  end: number,
  ages: Map<string, number>,
) {
  const boundaries: Array<{ age: keyof NonNullable<IdleTcStats['byAge']>; start: number; end: number }> = [
    { age: 'Dark Age', start: 0, end: ages.get('Feudal Age') ?? Number.POSITIVE_INFINITY },
    { age: 'Feudal Age', start: ages.get('Feudal Age') ?? Number.POSITIVE_INFINITY, end: ages.get('Castle Age') ?? Number.POSITIVE_INFINITY },
    { age: 'Castle Age', start: ages.get('Castle Age') ?? Number.POSITIVE_INFINITY, end: ages.get('Imperial Age') ?? Number.POSITIVE_INFINITY },
    { age: 'Imperial Age', start: ages.get('Imperial Age') ?? Number.POSITIVE_INFINITY, end: Number.POSITIVE_INFINITY },
  ];
  for (const boundary of boundaries) {
    const overlap = Math.max(0, Math.min(end, boundary.end) - Math.max(start, boundary.start));
    if (overlap > 0) byAge[boundary.age] = (byAge[boundary.age] ?? 0) + Math.round(overlap / 1_000);
  }
}

function sortAndLimitEvents(events: TimelineEvent[]) {
  const uniqueEvents = new Map<string, TimelineEvent>();
  for (const event of events) {
    const key = `${event.playerId ?? 'match'}:${event.label}`;
    const existing = uniqueEvents.get(key);
    if (!existing) {
      uniqueEvents.set(key, event);
      continue;
    }
    // Some DE versions repeat starting-age messages near 00:00. The later
    // transition is the real in-game advancement and each age occurs once.
    if (/Age Transition$/i.test(event.label) && clockToSeconds(event.minute) > clockToSeconds(existing.minute)) {
      uniqueEvents.set(key, event);
    }
  }
  return [...uniqueEvents.values()]
    .sort((left, right) => clockToSeconds(left.minute) - clockToSeconds(right.minute))
    .slice(0, 40);
}

function readObjectIds(view: DataView, offset: number, count: number) {
  if (count < 0 || count > 64 || offset + count * 4 > view.byteLength) return [];
  return Array.from({ length: count }, (_, index) => view.getUint32(offset + index * 4, true));
}

function formatGameTime(milliseconds: number) {
  const seconds = Math.max(0, Math.round(milliseconds / 1_000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function clockToSeconds(value: string) {
  const [minutes, seconds] = value.split(':').map(Number);
  return minutes * 60 + seconds;
}

function cleanName(value: string) {
  return value.replace(/[\u0000-\u001f]/g, '').trim();
}

function readUint32(bytes: Uint8Array, offset: number) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

function pauseForUi() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

class BinaryReader {
  private readonly view: DataView;
  private readonly bytes: Uint8Array;
  position: number;

  constructor(bytes: Uint8Array, position = 0) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.position = position;
  }

  get remaining() {
    return this.bytes.byteLength - this.position;
  }

  seek(position: number) {
    if (position < 0 || position > this.bytes.byteLength) throw new Error('Replay read moved out of bounds.');
    this.position = position;
  }

  skip(length: number) {
    this.seek(this.position + length);
  }

  take(length: number) {
    if (length < 0 || length > this.remaining) throw new Error('Replay block is truncated.');
    const value = this.bytes.subarray(this.position, this.position + length);
    this.position += length;
    return value;
  }

  uint8() {
    const value = this.view.getUint8(this.position);
    this.position += 1;
    return value;
  }

  uint16() {
    const value = this.view.getUint16(this.position, true);
    this.position += 2;
    return value;
  }

  uint32() {
    const value = this.view.getUint32(this.position, true);
    this.position += 4;
    return value;
  }

  int32() {
    const value = this.view.getInt32(this.position, true);
    this.position += 4;
    return value;
  }

  float32() {
    const value = this.view.getFloat32(this.position, true);
    this.position += 4;
    return value;
  }

  isDeString() {
    return this.remaining >= 4 && this.bytes[this.position] === 0x60 && this.bytes[this.position + 1] === 0x0a;
  }

  deString() {
    if (!this.isDeString()) throw new Error('Invalid DE string marker.');
    this.skip(2);
    const length = this.uint16();
    return new TextDecoder().decode(this.take(length));
  }
}

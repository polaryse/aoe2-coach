import type { IdleTcStats, PlayerIdentity, ResourceStats, ReviewCategory, TimelineEvent } from '../types';
import { parseAoe2Replay } from './aoe2ReplayParser';

type IdleTcAgeName = keyof NonNullable<IdleTcStats['byAge']>;

export interface CaptureAgeAnalysis {
  fileName: string;
  sourceType: 'Readable export' | 'AoE2 .aoe2record' | 'CaptureAge .caderec';
  parserConfidence: 'High' | 'Medium' | 'Low';
  parserNotes: string[];
  players: PlayerIdentity[];
  events: TimelineEvent[];
  coachingNotes: string[];
  resourceStats: ResourceStats[];
  idleTcStats: IdleTcStats[];
  likelyLostControlMinute: string;
  likelyCause: string;
  category: ReviewCategory;
  nextGameMission: string;
}

const signalRules: Array<{
  pattern: RegExp;
  label: string;
  category: ReviewCategory;
  severity: TimelineEvent['severity'];
  note: string;
  mission: string;
}> = [
  {
    pattern: /idle|tc idle|town center idle|villager production/i,
    label: 'Town Center Idle Time',
    category: 'Macro',
    severity: 'Critical',
    note: 'Macro rhythm broke down. Prioritize constant villager production during the next ranked set.',
    mission: 'Keep villagers queued through every Dark Age and Feudal fight.',
  },
  {
    pattern: /housed|population capped|pop capped|house block/i,
    label: 'House Block',
    category: 'Macro',
    severity: 'Warning',
    note: 'Housing interrupted production. Add a house checkpoint before each new production building.',
    mission: 'Do not get housed before Castle Age.',
  },
  {
    pattern: /feudal age|reached feudal|advanced to feudal|age.*feudal/i,
    label: 'Feudal Age Transition',
    category: 'Macro',
    severity: 'Info',
    note: 'Feudal timing is the first major checkpoint. Review whether military production, scouting, and houses were ready on arrival.',
    mission: 'Arrive in Feudal with a clear first military building and no house block.',
  },
  {
    pattern: /castle age|reached castle|advanced to castle/i,
    label: 'Castle Age Transition',
    category: 'Macro',
    severity: 'Info',
    note: 'Use the Castle timing as a checkpoint: add TCs, upgrades, or military immediately.',
    mission: 'Spend your first Castle Age minute before taking another fight.',
  },
  {
    pattern: /imperial age|reached imperial|advanced to imperial/i,
    label: 'Imperial Age Transition',
    category: 'Decision-making',
    severity: 'Info',
    note: 'Imperial timing is a strategic checkpoint. Review whether the click was supported by economy, map control, and army survival.',
    mission: 'Before clicking Imperial, name the unit upgrade or tech switch that wins the next five minutes.',
  },
  {
    pattern: /apm|eapm|actions per minute/i,
    label: 'Actions Per Minute',
    category: 'Micro',
    severity: 'Info',
    note: 'APM is only useful when connected to outcomes. Compare busy moments with villager production and fight quality.',
    mission: 'During fights, use hotkeys to queue villagers before microing army.',
  },
  {
    pattern: /resource|food|wood|gold|stone|floating|banked/i,
    label: 'Resource balance signal',
    category: 'Macro',
    severity: 'Warning',
    note: 'Resource imbalance may indicate delayed farms, missing production, or a late tech switch.',
    mission: 'Spend down floating resources before adding new tech choices.',
  },
  {
    pattern: /villager count|villagers|worker count|economy count|eco count/i,
    label: 'Villager Count',
    category: 'Macro',
    severity: 'Info',
    note: 'Villager count is a core CaptureAge-style stat. Compare dips or gaps against raids, idle TC, and age-up timing.',
    mission: 'Check villager count at Feudal, Castle, and after every major fight.',
  },
  {
    pattern: /military count|army count|army value|military value|units killed|units lost|k\/d|kill death/i,
    label: 'Military Value Or KD',
    category: 'Decision-making',
    severity: 'Warning',
    note: 'Military value or KD signals can reveal bad engagements, missing production, or overbooming.',
    mission: 'Before the next major fight, confirm upgrades, numbers, and reinforcement path.',
  },
  {
    pattern: /relic|map control|neutral|gold control|stone control/i,
    label: 'Map Control',
    category: 'Decision-making',
    severity: 'Info',
    note: 'Map control stats are useful for deciding whether to boom, push, or tech switch.',
    mission: 'Scout neutral resources before committing to Castle Age economy or aggression.',
  },
  {
    pattern: /scout|scouted|enemy opening|stable|archery range|barracks/i,
    label: 'Scouting or enemy opening signal',
    category: 'Scouting',
    severity: 'Info',
    note: 'Scouting information appeared in the timeline. Connect it to a concrete defensive or attacking choice.',
    mission: 'Identify the enemy military building before 8:30.',
  },
  {
    pattern: /raid|villagers killed|villager killed|lost villagers|eco damage/i,
    label: 'Economy damage event',
    category: 'Decision-making',
    severity: 'Critical',
    note: 'A raid or economy damage event likely shifted control. Review walling, army position, and minimap checks before this minute.',
    mission: 'Check the minimap every 10 seconds during Feudal pressure.',
  },
  {
    pattern: /fight|battle|army lost|military lost|engagement|bad fight/i,
    label: 'Major fight or army loss',
    category: 'Micro',
    severity: 'Critical',
    note: 'A key engagement may have decided the game. Review whether reinforcements, upgrades, or terrain made the fight bad.',
    mission: 'Take fights only with a numbers, upgrade, or position advantage.',
  },
  {
    pattern: /town center|tc added|second tc|third tc|boom/i,
    label: 'Town Center expansion signal',
    category: 'Macro',
    severity: 'Info',
    note: 'Town Center expansion appeared in the timeline. Check whether villager production and farms stayed active afterward.',
    mission: 'Add 2 extra TCs within one minute of Castle Age and keep all TCs producing.',
  },
];

const replayStatSignalRules: Array<{
  label: string;
  detailPrefix: string;
  category: ReviewCategory;
  severity: TimelineEvent['severity'];
  tokens: Array<{ name: string; pattern: RegExp }>;
}> = [
  {
    label: 'Military Production Buildings',
    detailPrefix: 'Detected military buildings',
    category: 'Micro',
    severity: 'Info',
    tokens: [
      { name: 'Barracks', pattern: /\bBarracks\b|\bBLAC[234]?\b/i },
      { name: 'Stable', pattern: /\bStable\b|\bSTBL[234]?\b/i },
      { name: 'Archery Range', pattern: /ArcheryRange|Camp Archery Range|\bARRG[234]?\b/i },
      { name: 'Siege Workshop', pattern: /SiegeWorkshop|Camp Siege Workshop/i },
      { name: 'Castle', pattern: /\bCastle Age[34]? \(Rubble\)|\bCSTL[234]?\b/i },
      { name: 'Dock', pattern: /\bDOCK[234]?\b/i },
    ],
  },
  {
    label: 'Military Units',
    detailPrefix: 'Detected military unit families',
    category: 'Micro',
    severity: 'Info',
    tokens: [
      { name: 'Knights', pattern: /\bKNGHT\b|\bKNGHT_D\b/i },
      { name: 'Archers', pattern: /\bARCHR\b|\bARCHR_D\b|\bXBOWM?\b|\bHXBOW\b/i },
      { name: 'Scouts', pattern: /\bSCOUT\b|\bHSCOUT\b/i },
      { name: 'Infantry', pattern: /\bSWDMN\b|\bTHSWD\b|\bPKEMN\b|\bSPRMN\b/i },
      { name: 'Monks', pattern: /\bMONK[A-Z_]*\b/i },
      { name: 'Siege', pattern: /\bMANGO\b|\bBTRAM\b|\bTREBU\b|\bBCANN\b/i },
    ],
  },
  {
    label: 'Economy Buildings',
    detailPrefix: 'Detected economy buildings',
    category: 'Macro',
    severity: 'Info',
    tokens: [
      { name: 'Town Centers', pattern: /TownCenter|\bRTWC[234]?\b/i },
      { name: 'Mills', pattern: /\bMILL[234]?\b|Mill Age/i },
      { name: 'Farms', pattern: /\bFARM\b|\bRFARM\b/i },
      { name: 'Lumber Camps', pattern: /LumberCamp|\bLUMBER\b/i },
      { name: 'Mining Camps', pattern: /MiningCamp/i },
      { name: 'Markets', pattern: /\bMRKT[34]?\b/i },
    ],
  },
  {
    label: 'Resource Objects',
    detailPrefix: 'Detected map/resource objects',
    category: 'Macro',
    severity: 'Info',
    tokens: [
      { name: 'Food', pattern: /\bPFOOD\b|forage|boar|deer|fish/i },
      { name: 'Wood', pattern: /\bPWOOD\b|wood/i },
      { name: 'Gold', pattern: /\bPGOLD\b|\bGOLDM\b|gold/i },
      { name: 'Stone', pattern: /\bSTONM\b|stone/i },
    ],
  },
  {
    label: 'Society Infrastructure',
    detailPrefix: 'Detected society/map-control structures',
    category: 'Decision-making',
    severity: 'Info',
    tokens: [
      { name: 'Houses', pattern: /\bHOUS[234]?\b|House Age|House DARK/i },
      { name: 'Walls', pattern: /\bWALL[234]?\b|PalisadeWall|StoneWall|FortifiedWall/i },
      { name: 'Relics', pattern: /\bRELIC\b|relic/i },
      { name: 'Monastery', pattern: /Monastery|\bMONK/i },
      { name: 'Blacksmith', pattern: /Blacksmith|\bBLAC[234]?\b/i },
    ],
  },
  {
    label: 'Technology Structures',
    detailPrefix: 'Detected tech structures or age variants',
    category: 'Decision-making',
    severity: 'Info',
    tokens: [
      { name: 'Blacksmith', pattern: /Blacksmith|\bBLAC[234]?\b/i },
      { name: 'University', pattern: /University/i },
      { name: 'Monastery', pattern: /Monastery/i },
      { name: 'Age-up building variants', pattern: /Age2 \(Rubble\)|Age3 \(Rubble\)|Age4 \(Rubble\)/i },
      { name: 'Imperial/Castle tech objects', pattern: /\bCSTL4\b|\bBLAC4\b|\bMILL4\b|\bDOCK4\b/i },
    ],
  },
];

export async function analyseReplayFile(fileName: string, buffer: ArrayBuffer): Promise<CaptureAgeAnalysis> {
  if (fileName.toLowerCase().endsWith('.aoe2record')) {
    const binary = await parseAoe2Replay(buffer);
    if (binary) {
      return buildAnalysis({
        fileName,
        sourceType: 'AoE2 .aoe2record',
        parserConfidence: 'High',
        parserNotes: binary.notes,
        players: binary.players,
        events: binary.events,
        resourceStats: binary.resourceStats,
        idleTcStats: binary.idleTcStats,
      });
    }
  }
  const extraText = await getBrowserInflatedText(fileName, buffer);
  return analyseCaptureAgeBuffer(fileName, buffer, extraText);
}

export function analyseCaptureAgeBuffer(fileName: string, buffer: ArrayBuffer, extraText = ''): CaptureAgeAnalysis {
  const normalizedFileName = fileName.toLowerCase();
  const isCaderec = normalizedFileName.endsWith('.caderec');
  const isAoe2Record = normalizedFileName.endsWith('.aoe2record');
  const decoded = decodeReplayLikeBuffer(buffer, extraText);
  const lines = flattenInput(decoded.text);
  const players = extractPlayers(lines, { allowLooseNames: !isAoe2Record && !isCaderec });
  const idleTcStats = extractIdleTcStats(lines, players);
  const events = normalizeEvents([
    ...extractEvents(lines, { inferMissingMinutes: !isAoe2Record && !isCaderec, players }),
    ...extractReplayStatEvents(lines),
    ...buildIdleTcEvents(idleTcStats),
  ]);
  const resourceStats = extractResourceStats(lines, players);
  const parserNotes = getParserNotes({ isAoe2Record, isCaderec, decoded, eventCount: events.length, resourceStatsCount: resourceStats.length, idleTcStatsCount: idleTcStats.length });
  const confidence = getParserConfidence({ isAoe2Record, isCaderec, eventCount: events.length, readableRatio: decoded.readableRatio });

  return buildAnalysis({
    fileName,
    sourceType: isAoe2Record ? 'AoE2 .aoe2record' : isCaderec ? 'CaptureAge .caderec' : 'Readable export',
    parserConfidence: confidence,
    parserNotes,
    players,
    events,
    resourceStats,
    idleTcStats,
  });
}

export function analyseCaptureAgeText(fileName: string, text: string): CaptureAgeAnalysis {
  const lines = flattenInput(text);
  const players = extractPlayers(lines, { allowLooseNames: true });
  const idleTcStats = extractIdleTcStats(lines, players);
  const events = normalizeEvents([
    ...extractEvents(lines, { inferMissingMinutes: true, players }),
    ...extractReplayStatEvents(lines),
    ...buildIdleTcEvents(idleTcStats),
  ]);
  const resourceStats = extractResourceStats(lines, players);
  return buildAnalysis({
    fileName,
    sourceType: 'Readable export',
    parserConfidence: events.length >= 4 ? 'High' : events.length > 0 ? 'Medium' : 'Low',
    parserNotes: ['Parsed as readable text/JSON-style timeline data.'],
    players,
    events,
    resourceStats,
    idleTcStats,
  });
}

function buildAnalysis({
  fileName,
  sourceType,
  parserConfidence,
  parserNotes,
  players,
  events,
  resourceStats,
  idleTcStats,
}: {
  fileName: string;
  sourceType: CaptureAgeAnalysis['sourceType'];
  parserConfidence: CaptureAgeAnalysis['parserConfidence'];
  parserNotes: string[];
  players: PlayerIdentity[];
  events: TimelineEvent[];
  resourceStats: ResourceStats[];
  idleTcStats: IdleTcStats[];
}): CaptureAgeAnalysis {
  const importantEvents = events.filter((event) => event.severity !== 'Info');
  const firstImportant = importantEvents[0];
  const notes = unique(
    events
      .map((event) => signalRules.find((rule) => rule.label === event.label)?.note)
      .filter((note): note is string => Boolean(note)),
  ).slice(0, 5);
  const hasKnownMinute = Boolean(firstImportant?.minute && firstImportant.minute !== 'Unknown');
  const category = firstImportant?.category ?? 'Decision-making';
  const nextGameMission = signalRules.find((rule) => rule.label === firstImportant?.label)?.mission ?? 'Pick one replay moment and turn it into a single next-game mission.';

  return {
    fileName,
    sourceType,
    parserConfidence,
    parserNotes,
    players,
    events,
    resourceStats,
    idleTcStats,
    coachingNotes: notes.length ? notes : ['No strong timeline signals were detected. Add a manual note for the minute where control changed.'],
    likelyLostControlMinute: hasKnownMinute ? firstImportant.minute : '',
    likelyCause: firstImportant ? `${firstImportant.label}: ${hasKnownMinute ? `review the decisions leading into ${firstImportant.minute}.` : 'review the decisions around this event.'}` : 'No obvious turning point detected from the uploaded file.',
    category,
    nextGameMission,
  };
}

function decodeReplayLikeBuffer(buffer: ArrayBuffer, extraText = '') {
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  const utf16 = new TextDecoder('utf-16le', { fatal: false }).decode(bytes);
  const asciiStrings = extractAsciiStrings(bytes).join('\n');
  const candidates = [utf8, utf16, asciiStrings, extraText].filter(Boolean).map((text) => ({
    text,
    readableRatio: getReadableRatio(text),
  }));
  return candidates.sort((a, b) => b.readableRatio - a.readableRatio)[0];
}

async function getBrowserInflatedText(fileName: string, buffer: ArrayBuffer) {
  if (!fileName.toLowerCase().endsWith('.aoe2record')) return '';
  if (typeof Blob === 'undefined' || typeof Response === 'undefined') return '';

  const Decompression = globalThis.DecompressionStream as unknown as undefined | (new (format: string) => GenericDecompressionStream);
  if (!Decompression) return '';

  try {
    const bytes = new Uint8Array(buffer);
    const compressedBody = bytes.slice(8);
    const stream = new Blob([compressedBody]).stream().pipeThrough(new Decompression('deflate-raw'));
    const inflated = await new Response(stream).arrayBuffer();
    return extractAsciiStrings(new Uint8Array(inflated)).join('\n');
  } catch {
    return '';
  }
}

type GenericDecompressionStream = {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
};

function extractAsciiStrings(bytes: Uint8Array) {
  const strings: string[] = [];
  let current = '';

  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= 4) strings.push(current);
      current = '';
    }
  }

  if (current.length >= 4) strings.push(current);
  return strings;
}

function getReadableRatio(text: string) {
  if (!text.length) return 0;
  const sample = text.slice(0, 20000);
  const readable = sample.match(/[a-z0-9:|,._\-\s]/gi)?.length ?? 0;
  return readable / sample.length;
}

function getParserConfidence({
  isAoe2Record,
  isCaderec,
  eventCount,
  readableRatio,
}: {
  isAoe2Record: boolean;
  isCaderec: boolean;
  eventCount: number;
  readableRatio: number;
}): CaptureAgeAnalysis['parserConfidence'] {
  if (!isCaderec && !isAoe2Record) return eventCount >= 4 ? 'High' : eventCount > 0 ? 'Medium' : 'Low';
  if (isAoe2Record && eventCount >= 2) return 'Medium';
  if (eventCount >= 4 && readableRatio > 0.35) return 'Medium';
  return eventCount > 0 ? 'Low' : 'Low';
}

function getParserNotes({
  isAoe2Record,
  isCaderec,
  decoded,
  eventCount,
  resourceStatsCount,
  idleTcStatsCount,
}: {
  isAoe2Record: boolean;
  isCaderec: boolean;
  decoded: { readableRatio: number };
  eventCount: number;
  resourceStatsCount: number;
  idleTcStatsCount: number;
}) {
  if (!isCaderec && !isAoe2Record) return ['Parsed as readable text/JSON-style timeline data.'];

  if (isAoe2Record) {
    const notes = [
      'Experimental native .aoe2record parser: scans embedded readable game-message strings locally in the browser.',
      'Validated against a real AoE2 DE recorded-game sample containing embedded age-up chat/message JSON.',
      'True replay timestamps and age-up times require operation-stream decoding and are not decoded yet.',
      resourceStatsCount > 0
        ? 'Readable resource totals were detected.'
        : 'Resource totals are likely stored as binary post-game stats and are not decoded from native .aoe2record files yet.',
      idleTcStatsCount > 0
        ? 'Readable idle TC totals were detected.'
        : 'Idle TC totals require operation-stream/stat decoding for native .aoe2record files, so enter them manually when reviewing.',
    ];

    if (eventCount === 0) notes.push('No timeline strings were found. This recording may require decompression support before deeper parsing is possible.');
    if (decoded.readableRatio < 0.2) notes.push('Low readable-text ratio detected, so extracted events are likely incomplete.');

    return notes;
  }

  const notes = [
    'Experimental native .caderec parser: scans embedded readable strings and metadata-like blocks locally in the browser.',
    'CaptureAge .caderec is treated as a replay recording container; exact binary schema support still needs validation against real sample files.',
  ];

  if (eventCount === 0) notes.push('No timeline strings were found. This file may be compressed, encrypted, or require a deeper parser.');
  if (decoded.readableRatio < 0.2) notes.push('Low readable-text ratio detected, so extracted events may be incomplete.');

  return notes;
}

function extractPlayers(lines: string[], options: { allowLooseNames: boolean }): PlayerIdentity[] {
  const headerPlayers = extractHeaderPlayers(lines);
  if (headerPlayers.length) return headerPlayers;

  const chatPlayers = extractChatPlayers(lines);
  if (chatPlayers.length) return withReferencedPlayerFallbacks(chatPlayers, lines);

  if (!options.allowLooseNames) return withReferencedPlayerFallbacks([], lines);

  const players: PlayerIdentity[] = [];
  const seen = new Set<string>();

  for (const line of lines.slice(0, 80)) {
    const name = cleanPlayerCandidate(line);
    if (!name || seen.has(name.toLowerCase())) continue;
    if (/^(ver|gaia|none|false|true|old-|legion|archr|wall|farm|mill|dock|goldm|stonm)$/i.test(name)) continue;

    seen.add(name.toLowerCase());
    players.push({ id: String(players.length + 1), name });
    if (players.length >= 8) break;
  }

  return withReferencedPlayerFallbacks(players, lines);
}

function extractHeaderPlayers(lines: string[]): PlayerIdentity[] {
  const headerEnd = lines.findIndex((line) => /^NONE:NONE/i.test(line));
  const headerLines = lines.slice(0, headerEnd > 0 ? headerEnd : 24);
  const counts = new Map<string, number>();
  const displayNames = new Map<string, string>();

  for (const line of headerLines) {
    const name = cleanPlayerCandidate(line);
    if (!name || /^ver\b/i.test(name)) continue;

    const key = name.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
    displayNames.set(key, name);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([key], index) => ({ id: String(index + 1), name: displayNames.get(key) ?? `Player ${index + 1}` }))
    .slice(0, 8);
}

function extractChatPlayers(lines: string[]): PlayerIdentity[] {
  const players = new Map<string, string>();

  for (const line of lines) {
    const playerId = extractPlayerRef(line);
    const chatName = line.match(/<platform_icon_[^>]+>\s*([^:"]{2,32}):/i)?.[1]?.trim();
    const cleanName = chatName ? cleanPlayerCandidate(chatName) : null;
    if (playerId && cleanName) players.set(playerId, cleanName);
  }

  return [...players.entries()].map(([id, name]) => ({ id, name })).slice(0, 8);
}

function withReferencedPlayerFallbacks(players: PlayerIdentity[], lines: string[]) {
  const merged = [...players];

  for (const line of lines) {
    const id = extractPlayerRef(line);
    if (!id || merged.some((player) => player.id === id)) continue;
    merged.push({ id, name: `Player ${id}` });
  }

  return merged.sort((a, b) => Number(a.id) - Number(b.id)).slice(0, 8);
}

function cleanPlayerCandidate(line: string) {
  const cleaned = line.replace(/[`"'{}[\]]/g, '').trim();
  if (!/^[A-Za-z0-9_ -]{2,32}$/.test(cleaned)) return null;
  if (!/[a-z]/.test(cleaned)) return null;
  if (/^[a-z]?[A-Z0-9]{2,5}$/i.test(cleaned) && !/[aeiou]/i.test(cleaned)) return null;
  if (cleaned.includes(':')) return null;
  return cleaned;
}

function extractResourceStats(lines: string[], players: PlayerIdentity[]): ResourceStats[] {
  const statsByPlayer = new Map<string, ResourceStats>();

  for (const line of lines) {
    const playerId = extractPlayerRef(line);
    const player = getPlayerName(playerId, players) ?? extractPlayerName(line);
    const resourceValues = extractResourceValues(line);
    if (!resourceValues) continue;

    const key = player ?? `Player ${statsByPlayer.size + 1}`;
    const existing = statsByPlayer.get(key) ?? { player: key };
    statsByPlayer.set(key, {
      ...existing,
      playerId,
      ...resourceValues,
      total: sumResources({ ...existing, ...resourceValues }),
    });
  }

  return [...statsByPlayer.values()];
}

function extractIdleTcStats(lines: string[], players: PlayerIdentity[]): IdleTcStats[] {
  const statsByPlayer = new Map<string, IdleTcStats>();

  for (const line of lines) {
    const seconds = extractIdleTcSeconds(line);
    if (seconds === null) continue;
    const age = extractIdleTcAge(line);

    const playerId = extractPlayerRef(line);
    const player = getPlayerName(playerId, players) ?? extractPlayerName(line) ?? `Player ${playerId ?? statsByPlayer.size + 1}`;
    const key = playerId ?? player;
    const existing = statsByPlayer.get(key) ?? { player, playerId, seconds: 0, byAge: {} };

    if (age) {
      statsByPlayer.set(key, {
        ...existing,
        player,
        playerId,
        byAge: {
          ...existing.byAge,
          [age]: seconds,
        },
        seconds: sumIdleTcByAge({ ...existing.byAge, [age]: seconds }),
      });
      continue;
    }

    if (seconds > existing.seconds) {
      statsByPlayer.set(key, { ...existing, player, playerId, seconds });
    }
  }

  return [...statsByPlayer.values()];
}

function extractIdleTcSeconds(line: string) {
  if (!/(?:idle\s*(?:tc|town\s*cent(?:er|re))|(?:tc|town\s*cent(?:er|re))\s*idle|villager\s*idle)/i.test(line)) return null;

  const clockMatch = line.match(/(?:idle\s*(?:tc|town\s*cent(?:er|re))|(?:tc|town\s*cent(?:er|re))\s*idle|villager\s*idle)[^0-9]{0,24}(\d{1,2}):(\d{2})/i);
  if (clockMatch) return Number(clockMatch[1]) * 60 + Number(clockMatch[2]);

  const secondsMatch = line.match(/(?:idle\s*(?:tc|town\s*cent(?:er|re))|(?:tc|town\s*cent(?:er|re))\s*idle|villager\s*idle)[^0-9]{0,24}(\d{1,5})\s*(?:s|sec|secs|second|seconds)?\b/i);
  if (!secondsMatch) return null;

  return Number(secondsMatch[1]);
}

function extractIdleTcAge(line: string): IdleTcAgeName | null {
  if (/dark\s*age/i.test(line)) return 'Dark Age';
  if (/feudal\s*age/i.test(line)) return 'Feudal Age';
  if (/castle\s*age/i.test(line)) return 'Castle Age';
  if (/imperial\s*age/i.test(line)) return 'Imperial Age';
  return null;
}

function sumIdleTcByAge(byAge: NonNullable<IdleTcStats['byAge']>) {
  return (byAge['Dark Age'] ?? 0) + (byAge['Feudal Age'] ?? 0) + (byAge['Castle Age'] ?? 0) + (byAge['Imperial Age'] ?? 0);
}

function buildIdleTcEvents(stats: IdleTcStats[]): TimelineEvent[] {
  if (!stats.length) return [];

  const worstIdle = Math.max(...stats.map((stat) => stat.seconds));
  return [{
    minute: 'Unknown',
    label: 'Town Center Idle Time',
    detail: `Idle TC totals: ${stats.map((stat) => `${stat.player} ${formatSeconds(stat.seconds)}`).join(', ')}`,
    category: 'Macro',
    severity: worstIdle > 60 ? 'Critical' : worstIdle > 25 ? 'Warning' : 'Info',
  }];
}

function extractPlayerName(line: string) {
  const namedPlayer = line.match(/\b(?:player|name)\s*[:=]\s*"?([A-Za-z0-9_ -]{2,32})"?/i);
  return namedPlayer?.[1]?.trim();
}

function extractResourceValues(line: string): Partial<ResourceStats> | null {
  const resourceLine = /food|wood|gold|stone|resource/i.test(line);
  if (!resourceLine) return null;

  const values: Partial<ResourceStats> = {};
  const food = extractNamedNumber(line, 'food');
  const wood = extractNamedNumber(line, 'wood');
  const gold = extractNamedNumber(line, 'gold');
  const stone = extractNamedNumber(line, 'stone');

  if (food !== null) values.food = food;
  if (wood !== null) values.wood = wood;
  if (gold !== null) values.gold = gold;
  if (stone !== null) values.stone = stone;

  return Object.keys(values).length ? values : null;
}

function extractNamedNumber(line: string, name: 'food' | 'wood' | 'gold' | 'stone') {
  const match = line.match(new RegExp(`\\b${name}\\b\\s*(?:collected|total|gathered)?\\s*[:=,]?\\s*(\\d{2,7})`, 'i'));
  if (match) return Number(match[1]);

  const reverseMatch = line.match(new RegExp(`\\b(\\d{2,7})\\s+${name}\\b`, 'i'));
  return reverseMatch ? Number(reverseMatch[1]) : null;
}

function sumResources(stats: Partial<ResourceStats>) {
  return (stats.food ?? 0) + (stats.wood ?? 0) + (stats.gold ?? 0) + (stats.stone ?? 0);
}

function flattenInput(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    return flattenJson(parsed);
  } catch {
    return trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }
}

function flattenJson(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(flattenJson);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const ownLine = Object.entries(record)
      .filter(([, entry]) => typeof entry !== 'object')
      .map(([key, entry]) => `${key}: ${String(entry)}`)
      .join(' | ');
    const childLines = Object.values(record).filter((entry) => typeof entry === 'object').flatMap(flattenJson);
    return ownLine ? [ownLine, ...childLines] : childLines;
  }
  return [String(value)];
}

function extractEvents(lines: string[], options: { inferMissingMinutes: boolean; players: PlayerIdentity[] }): TimelineEvent[] {
  return lines.flatMap((line, index) => {
    const minute = extractMinute(line) ?? (options.inferMissingMinutes ? inferMinute(index) : 'Unknown');
    const playerId = extractPlayerRef(line);
    const playerName = getPlayerName(playerId, options.players);
    return signalRules
      .filter((rule) => rule.pattern.test(line))
      .map((rule) => ({
        minute,
        label: rule.label,
        playerId,
        playerName,
        category: rule.category,
        severity: rule.severity,
      }));
  }).slice(0, 24);
}

function extractReplayStatEvents(lines: string[]): TimelineEvent[] {
  return replayStatSignalRules.flatMap((rule) => {
    const detected = rule.tokens
      .filter((token) => lines.some((line) => token.pattern.test(line)))
      .map((token) => token.name);

    if (!detected.length) return [];

    return [{
      minute: 'Unknown',
      label: rule.label,
      detail: `${rule.detailPrefix}: ${detected.join(', ')}`,
      category: rule.category,
      severity: rule.severity,
    }];
  });
}

function normalizeEvents(events: TimelineEvent[]) {
  const seen = new Set<string>();
  const normalized: TimelineEvent[] = [];

  for (const event of events) {
    const key = getEventDedupeKey(event);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    normalized.push(event);
  }

  return normalized.slice(0, 24);
}

function getEventDedupeKey(event: TimelineEvent) {
  const age = event.label.match(/^(Feudal|Castle|Imperial) Age Transition$/i)?.[1]?.toLowerCase();
  if (!age) return null;

  return `age:${event.playerId ?? event.playerName ?? 'unknown'}:${age}`;
}

function extractPlayerRef(line: string) {
  const explicitPlayer = line.match(/"player"\s*:\s*"?(\d+)"?/i);
  if (explicitPlayer) return explicitPlayer[1];

  const playerId = line.match(/<player_id,(\d+),\d+>/i);
  return playerId?.[1];
}

function getPlayerName(playerId: string | undefined, players: PlayerIdentity[]) {
  if (!playerId) return undefined;
  return players.find((player) => player.id === playerId)?.name ?? `Player ${playerId}`;
}

function extractMinute(line: string) {
  const clock = line.match(/\b(\d{1,2}:\d{2})(?::\d{2})?\b/);
  if (clock) return clock[1];

  const minute = line.match(/\b(?:minute|min|time)\D{0,8}(\d{1,2})(?:\.(\d))?\b/i);
  if (!minute) return null;

  const whole = minute[1].padStart(2, '0');
  const seconds = minute[2] ? `${Number(minute[2]) * 6}`.padStart(2, '0') : '00';
  return `${whole}:${seconds}`;
}

function inferMinute(index: number) {
  const minute = Math.min(45, Math.floor(index / 3) + 1);
  return `${String(minute).padStart(2, '0')}:00`;
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function unique(values: string[]) {
  return [...new Set(values)];
}


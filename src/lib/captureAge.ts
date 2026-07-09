import type { ReviewCategory, TimelineEvent } from '../types';

export interface CaptureAgeAnalysis {
  fileName: string;
  sourceType: 'Readable export' | 'CaptureAge .caderec';
  parserConfidence: 'High' | 'Medium' | 'Low';
  parserNotes: string[];
  events: TimelineEvent[];
  coachingNotes: string[];
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
    label: 'Town Center idle time detected',
    category: 'Macro',
    severity: 'Critical',
    note: 'Macro rhythm broke down. Prioritize constant villager production during the next ranked set.',
    mission: 'Keep villagers queued through every Dark Age and Feudal fight.',
  },
  {
    pattern: /housed|population capped|pop capped|house block/i,
    label: 'House block detected',
    category: 'Macro',
    severity: 'Warning',
    note: 'Housing interrupted production. Add a house checkpoint before each new production building.',
    mission: 'Do not get housed before Castle Age.',
  },
  {
    pattern: /feudal age|reached feudal|advanced to feudal|age.*feudal/i,
    label: 'Feudal Age timing found',
    category: 'Macro',
    severity: 'Info',
    note: 'Feudal timing is the first major checkpoint. Review whether military production, scouting, and houses were ready on arrival.',
    mission: 'Arrive in Feudal with a clear first military building and no house block.',
  },
  {
    pattern: /castle age|reached castle|advanced to castle/i,
    label: 'Castle Age timing found',
    category: 'Macro',
    severity: 'Info',
    note: 'Use the Castle timing as a checkpoint: add TCs, upgrades, or military immediately.',
    mission: 'Spend your first Castle Age minute before taking another fight.',
  },
  {
    pattern: /imperial age|reached imperial|advanced to imperial/i,
    label: 'Imperial Age timing found',
    category: 'Decision-making',
    severity: 'Info',
    note: 'Imperial timing is a strategic checkpoint. Review whether the click was supported by economy, map control, and army survival.',
    mission: 'Before clicking Imperial, name the unit upgrade or tech switch that wins the next five minutes.',
  },
  {
    pattern: /apm|eapm|actions per minute/i,
    label: 'Actions per minute stat found',
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
    label: 'Villager count stat found',
    category: 'Macro',
    severity: 'Info',
    note: 'Villager count is a core CaptureAge-style stat. Compare dips or gaps against raids, idle TC, and age-up timing.',
    mission: 'Check villager count at Feudal, Castle, and after every major fight.',
  },
  {
    pattern: /military count|army count|army value|military value|units killed|units lost|k\/d|kill death/i,
    label: 'Military value or KD stat found',
    category: 'Decision-making',
    severity: 'Warning',
    note: 'Military value or KD signals can reveal bad engagements, missing production, or overbooming.',
    mission: 'Before the next major fight, confirm upgrades, numbers, and reinforcement path.',
  },
  {
    pattern: /relic|map control|neutral|gold control|stone control/i,
    label: 'Map control stat found',
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

export function analyseCaptureAgeBuffer(fileName: string, buffer: ArrayBuffer): CaptureAgeAnalysis {
  const isCaderec = fileName.toLowerCase().endsWith('.caderec');
  const decoded = decodeReplayLikeBuffer(buffer);
  const lines = flattenInput(decoded.text);
  const events = extractEvents(lines);
  const parserNotes = getParserNotes(isCaderec, decoded, events.length);
  const confidence = getParserConfidence(isCaderec, events.length, decoded.readableRatio);

  return buildAnalysis({
    fileName,
    sourceType: isCaderec ? 'CaptureAge .caderec' : 'Readable export',
    parserConfidence: confidence,
    parserNotes,
    events,
  });
}

export function analyseCaptureAgeText(fileName: string, text: string): CaptureAgeAnalysis {
  const lines = flattenInput(text);
  const events = extractEvents(lines);
  return buildAnalysis({
    fileName,
    sourceType: 'Readable export',
    parserConfidence: events.length >= 4 ? 'High' : events.length > 0 ? 'Medium' : 'Low',
    parserNotes: ['Parsed as readable text/JSON-style timeline data.'],
    events,
  });
}

function buildAnalysis({
  fileName,
  sourceType,
  parserConfidence,
  parserNotes,
  events,
}: {
  fileName: string;
  sourceType: CaptureAgeAnalysis['sourceType'];
  parserConfidence: CaptureAgeAnalysis['parserConfidence'];
  parserNotes: string[];
  events: TimelineEvent[];
}): CaptureAgeAnalysis {
  const importantEvents = events.filter((event) => event.severity !== 'Info');
  const firstImportant = importantEvents[0] ?? events[0];
  const notes = unique(
    events
      .map((event) => signalRules.find((rule) => rule.label === event.label)?.note)
      .filter((note): note is string => Boolean(note)),
  ).slice(0, 5);
  const category = firstImportant?.category ?? 'Decision-making';
  const nextGameMission = signalRules.find((rule) => rule.label === firstImportant?.label)?.mission ?? 'Pick one replay moment and turn it into a single next-game mission.';

  return {
    fileName,
    sourceType,
    parserConfidence,
    parserNotes,
    events,
    coachingNotes: notes.length ? notes : ['No strong timeline signals were detected. Add a manual note for the minute where control changed.'],
    likelyLostControlMinute: firstImportant?.minute ?? '',
    likelyCause: firstImportant ? `${firstImportant.label}: review the decisions leading into ${firstImportant.minute}.` : 'No obvious turning point detected from the uploaded file.',
    category,
    nextGameMission,
  };
}

function decodeReplayLikeBuffer(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  const utf16 = new TextDecoder('utf-16le', { fatal: false }).decode(bytes);
  const asciiStrings = extractAsciiStrings(bytes).join('\n');
  const candidates = [utf8, utf16, asciiStrings].map((text) => ({
    text,
    readableRatio: getReadableRatio(text),
  }));
  return candidates.sort((a, b) => b.readableRatio - a.readableRatio)[0];
}

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

function getParserConfidence(isCaderec: boolean, eventCount: number, readableRatio: number): CaptureAgeAnalysis['parserConfidence'] {
  if (!isCaderec) return eventCount >= 4 ? 'High' : eventCount > 0 ? 'Medium' : 'Low';
  if (eventCount >= 4 && readableRatio > 0.35) return 'Medium';
  return eventCount > 0 ? 'Low' : 'Low';
}

function getParserNotes(isCaderec: boolean, decoded: { readableRatio: number }, eventCount: number) {
  if (!isCaderec) return ['Parsed as readable text/JSON-style timeline data.'];

  const notes = [
    'Experimental native .caderec parser: scans embedded readable strings and metadata-like blocks locally in the browser.',
    'CaptureAge .caderec is treated as a replay recording container; exact binary schema support still needs validation against real sample files.',
  ];

  if (eventCount === 0) notes.push('No timeline strings were found. This file may be compressed, encrypted, or require a deeper parser.');
  if (decoded.readableRatio < 0.2) notes.push('Low readable-text ratio detected, so extracted events may be incomplete.');

  return notes;
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

function extractEvents(lines: string[]): TimelineEvent[] {
  return lines.flatMap((line, index) => {
    const minute = extractMinute(line) ?? inferMinute(index);
    return signalRules
      .filter((rule) => rule.pattern.test(line))
      .map((rule) => ({
        minute,
        label: rule.label,
        category: rule.category,
        severity: rule.severity,
      }));
  }).slice(0, 24);
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

function unique(values: string[]) {
  return [...new Set(values)];
}


import type { Civilization } from '../types';

const palette = [
  ['#7e2230', '#e6bd62'],
  ['#173b4f', '#d8bd83'],
  ['#4f7d4f', '#f2dfaf'],
  ['#6e3423', '#c59246'],
  ['#46336f', '#d8bd83'],
  ['#8a5a22', '#f2dfaf'],
] as const;

const civRows: Array<Omit<Civilization, 'colors'>> = [
  { id: 'armenians', name: 'Armenians', initials: 'AR', focus: 'Infantry', region: 'Caucasus', beginnerTier: 'Advanced', beginnerReason: 'Powerful but asks for timing and composition discipline.' },
  { id: 'achaemenids', name: 'Achaemenids', initials: 'AC', focus: 'Flexible', region: 'Chronicles', beginnerTier: 'Advanced', beginnerReason: 'Chronicles civ; keep it as a specialty pick after core ranked habits.' },
  { id: 'athenians', name: 'Athenians', initials: 'AT', focus: 'Flexible', region: 'Chronicles', beginnerTier: 'Advanced', beginnerReason: 'Chronicles civ with less beginner ladder reference material.' },
  { id: 'aztecs', name: 'Aztecs', initials: 'AZ', focus: 'Infantry', region: 'Americas', beginnerTier: 'Advanced', beginnerReason: 'Strong economy and monks, but no cavalry safety net.' },
  { id: 'bengalis', name: 'Bengalis', initials: 'BE', focus: 'Elephants', region: 'South Asia', beginnerTier: 'Advanced', beginnerReason: 'Great economy, harder army transitions for new players.' },
  { id: 'berbers', name: 'Berbers', initials: 'BR', focus: 'Cavalry', region: 'North Africa', beginnerTier: 'Friendly', beginnerReason: 'Simple cavalry identity with forgiving stable play.' },
  { id: 'bohemians', name: 'Bohemians', initials: 'BO', focus: 'Monks', region: 'Central Europe', beginnerTier: 'Advanced', beginnerReason: 'Excellent late game, but unusual tech priorities.' },
  { id: 'britons', name: 'Britons', initials: 'BI', focus: 'Archers', region: 'Western Europe', beginnerTier: 'Recommended', beginnerReason: 'Clear archer plan, smooth sheep bonus, easy range identity.' },
  { id: 'bulgarians', name: 'Bulgarians', initials: 'BU', focus: 'Infantry', region: 'Balkans', beginnerTier: 'Friendly', beginnerReason: 'Straightforward pressure and strong blacksmith timings.' },
  { id: 'burgundians', name: 'Burgundians', initials: 'BG', focus: 'Cavalry', region: 'Western Europe', beginnerTier: 'Advanced', beginnerReason: 'Eco upgrades are strong but easy to mistime.' },
  { id: 'burmese', name: 'Burmese', initials: 'BM', focus: 'Infantry', region: 'Southeast Asia', beginnerTier: 'Advanced', beginnerReason: 'Great melee power, weaker archer defense for beginners.' },
  { id: 'byzantines', name: 'Byzantines', initials: 'BY', focus: 'Flexible', region: 'Mediterranean', beginnerTier: 'Recommended', beginnerReason: 'Defensive bonuses and cheap counters teach good reactions.' },
  { id: 'celts', name: 'Celts', initials: 'CE', focus: 'Siege', region: 'Western Europe', beginnerTier: 'Friendly', beginnerReason: 'Wood bonus feels good and siege plans are memorable.' },
  { id: 'chinese', name: 'Chinese', initials: 'CH', focus: 'Flexible', region: 'East Asia', beginnerTier: 'Advanced', beginnerReason: 'Fantastic civ, but the start is demanding.' },
  { id: 'cumans', name: 'Cumans', initials: 'CU', focus: 'Cavalry', region: 'Steppe', beginnerTier: 'Advanced', beginnerReason: 'Unique 2 TC Feudal options can distract from basics.' },
  { id: 'dravidians', name: 'Dravidians', initials: 'DR', focus: 'Naval', region: 'South Asia', beginnerTier: 'Advanced', beginnerReason: 'Strong identity, but land transitions are less forgiving.' },
  { id: 'ethiopians', name: 'Ethiopians', initials: 'ET', focus: 'Archers', region: 'East Africa', beginnerTier: 'Friendly', beginnerReason: 'Good archer rhythm and helpful age-up resources.' },
  { id: 'franks', name: 'Franks', initials: 'FR', focus: 'Cavalry', region: 'Western Europe', beginnerTier: 'Recommended', beginnerReason: 'Simple scouts-to-knights plan and forgiving economy.' },
  { id: 'georgians', name: 'Georgians', initials: 'GE', focus: 'Cavalry', region: 'Caucasus', beginnerTier: 'Advanced', beginnerReason: 'Strong but more specialized than classic beginner cavalry civs.' },
  { id: 'goths', name: 'Goths', initials: 'GO', focus: 'Infantry', region: 'Central Europe', beginnerTier: 'Friendly', beginnerReason: 'Teaches production and flooding, though early defense matters.' },
  { id: 'gurjaras', name: 'Gurjaras', initials: 'GU', focus: 'Camels', region: 'South Asia', beginnerTier: 'Advanced', beginnerReason: 'Excellent counters, but unusual economy and unit choices.' },
  { id: 'hindustanis', name: 'Hindustanis', initials: 'HI', focus: 'Camels', region: 'South Asia', beginnerTier: 'Friendly', beginnerReason: 'Strong economy and counters, with clear anti-cavalry tools.' },
  { id: 'huns', name: 'Huns', initials: 'HU', focus: 'Cavalry archers', region: 'Steppe', beginnerTier: 'Friendly', beginnerReason: 'No houses makes them forgiving, but they can hide house-planning fundamentals.' },
  { id: 'incas', name: 'Incas', initials: 'IN', focus: 'Infantry', region: 'Americas', beginnerTier: 'Friendly', beginnerReason: 'Flexible counter units and sturdy villagers are forgiving.' },
  { id: 'italians', name: 'Italians', initials: 'IT', focus: 'Naval', region: 'Mediterranean', beginnerTier: 'Friendly', beginnerReason: 'Cheaper age-ups make macro mistakes less punishing.' },
  { id: 'japanese', name: 'Japanese', initials: 'JA', focus: 'Infantry', region: 'East Asia', beginnerTier: 'Friendly', beginnerReason: 'Cheap camps smooth early economy and infantry are clear.' },
  { id: 'jurchens', name: 'Jurchens', initials: 'JU', focus: 'Cavalry', region: 'East Asia', beginnerTier: 'Advanced', beginnerReason: 'Newer civ identity; best after fundamentals are stable.' },
  { id: 'khmer', name: 'Khmer', initials: 'KH', focus: 'Elephants', region: 'Southeast Asia', beginnerTier: 'Friendly', beginnerReason: 'No building requirements simplify age-up flow, but beginners should still practice clean structure habits.' },
  { id: 'khitans', name: 'Khitans', initials: 'KI', focus: 'Cavalry archers', region: 'East Asia', beginnerTier: 'Advanced', beginnerReason: 'Mobile army control and timing matter a lot.' },
  { id: 'koreans', name: 'Koreans', initials: 'KO', focus: 'Naval', region: 'East Asia', beginnerTier: 'Advanced', beginnerReason: 'Defensive and siege strengths need map awareness.' },
  { id: 'lac-viet', name: 'Lac Viet', initials: 'LV', focus: 'Flexible', region: 'Return of Rome', beginnerTier: 'Advanced', beginnerReason: 'Special roster context; learn standard ranked civs first.' },
  { id: 'lithuanians', name: 'Lithuanians', initials: 'LI', focus: 'Cavalry', region: 'Baltics', beginnerTier: 'Recommended', beginnerReason: 'Extra starting food and strong knights support clean openings.' },
  { id: 'magyars', name: 'Magyars', initials: 'MA', focus: 'Cavalry', region: 'Central Europe', beginnerTier: 'Recommended', beginnerReason: 'Free attack upgrades and cheap scouts reward active practice.' },
  { id: 'malay', name: 'Malay', initials: 'ML', focus: 'Naval', region: 'Southeast Asia', beginnerTier: 'Advanced', beginnerReason: 'Fast age-ups are powerful but easy to mismanage.' },
  { id: 'malians', name: 'Malians', initials: 'MS', focus: 'Flexible', region: 'West Africa', beginnerTier: 'Friendly', beginnerReason: 'Flexible tech tree and wood savings support learning.' },
  { id: 'mapuche', name: 'Mapuche', initials: 'MP', focus: 'Flexible', region: 'Americas', beginnerTier: 'Advanced', beginnerReason: 'Newer civ; keep notes conservative until you have matchup data.' },
  { id: 'macedonians', name: 'Macedonians', initials: 'MC', focus: 'Infantry', region: 'Chronicles', beginnerTier: 'Advanced', beginnerReason: 'Chronicles civ; use after core openings feel automatic.' },
  { id: 'mayans', name: 'Mayans', initials: 'MY', focus: 'Archers', region: 'Americas', beginnerTier: 'Friendly', beginnerReason: 'Strong economy and archers, though no cavalry.' },
  { id: 'mongols', name: 'Mongols', initials: 'MO', focus: 'Cavalry archers', region: 'Steppe', beginnerTier: 'Friendly', beginnerReason: 'Fast hunt creates exciting scout openings.' },
  { id: 'muisca', name: 'Muisca', initials: 'MU', focus: 'Flexible', region: 'Americas', beginnerTier: 'Advanced', beginnerReason: 'Newer civ; best treated as an exploration pick for now.' },
  { id: 'persians', name: 'Persians', initials: 'PE', focus: 'Cavalry', region: 'Middle East', beginnerTier: 'Recommended', beginnerReason: 'Extra resources and sturdy TCs make them forgiving.' },
  { id: 'poles', name: 'Poles', initials: 'PO', focus: 'Cavalry', region: 'Central Europe', beginnerTier: 'Advanced', beginnerReason: 'Powerful economy, but folwark placement takes practice.' },
  { id: 'portuguese', name: 'Portuguese', initials: 'PT', focus: 'Naval', region: 'Iberia', beginnerTier: 'Friendly', beginnerReason: 'Discounted gold units make army plans flexible.' },
  { id: 'puru', name: 'Puru', initials: 'PU', focus: 'Elephants', region: 'Chronicles', beginnerTier: 'Advanced', beginnerReason: 'Chronicles civ; save for later learning blocks.' },
  { id: 'romans', name: 'Romans', initials: 'RO', focus: 'Infantry', region: 'Mediterranean', beginnerTier: 'Friendly', beginnerReason: 'Durable infantry and economy bonuses are easy to feel.' },
  { id: 'saracens', name: 'Saracens', initials: 'SA', focus: 'Camels', region: 'Middle East', beginnerTier: 'Advanced', beginnerReason: 'Market play is strong but not beginner-obvious.' },
  { id: 'sicilians', name: 'Sicilians', initials: 'SI', focus: 'Cavalry', region: 'Mediterranean', beginnerTier: 'Friendly', beginnerReason: 'Reduced bonus damage makes fights more forgiving.' },
  { id: 'slavs', name: 'Slavs', initials: 'SL', focus: 'Infantry', region: 'Eastern Europe', beginnerTier: 'Friendly', beginnerReason: 'Farm economy supports simple knight or infantry plans.' },
  { id: 'spanish', name: 'Spanish', initials: 'SP', focus: 'Cavalry', region: 'Iberia', beginnerTier: 'Friendly', beginnerReason: 'Broad tech tree and strong late-game identity.' },
  { id: 'spartans', name: 'Spartans', initials: 'SR', focus: 'Infantry', region: 'Chronicles', beginnerTier: 'Advanced', beginnerReason: 'Chronicles civ; less useful for standard beginner ranked plans.' },
  { id: 'shu', name: 'Shu', initials: 'SH', focus: 'Infantry', region: 'East Asia', beginnerTier: 'Advanced', beginnerReason: 'Newer civ with specialized options; learn after classic openings.' },
  { id: 'tatars', name: 'Tatars', initials: 'TA', focus: 'Cavalry archers', region: 'Steppe', beginnerTier: 'Advanced', beginnerReason: 'Elevation and cavalry archer play need extra control.' },
  { id: 'teutons', name: 'Teutons', initials: 'TE', focus: 'Infantry', region: 'Central Europe', beginnerTier: 'Recommended', beginnerReason: 'Defensive economy and strong knights teach stable macro.' },
  { id: 'thracians', name: 'Thracians', initials: 'TH', focus: 'Infantry', region: 'Chronicles', beginnerTier: 'Advanced', beginnerReason: 'Chronicles civ; useful later as a specialty study.' },
  { id: 'tupi', name: 'Tupi', initials: 'TP', focus: 'Archers', region: 'Americas', beginnerTier: 'Advanced', beginnerReason: 'Newer civ; start with classic beginner civs before specializing.' },
  { id: 'turks', name: 'Turks', initials: 'TU', focus: 'Gunpowder', region: 'Middle East', beginnerTier: 'Advanced', beginnerReason: 'Power spikes are sharp, but trash options are limited.' },
  { id: 'vietnamese', name: 'Vietnamese', initials: 'VI', focus: 'Archers', region: 'Southeast Asia', beginnerTier: 'Recommended', beginnerReason: 'Enemy TC reveal makes early scouting less punishing.' },
  { id: 'vikings', name: 'Vikings', initials: 'VK', focus: 'Infantry', region: 'Northern Europe', beginnerTier: 'Friendly', beginnerReason: 'Free wheelbarrow/hand cart teaches economy rhythm, but they are less cavalry-comfortable for first ladder blocks.' },
  { id: 'wei', name: 'Wei', initials: 'WE', focus: 'Cavalry', region: 'East Asia', beginnerTier: 'Advanced', beginnerReason: 'Newer civ with less beginner reference material.' },
  { id: 'wu', name: 'Wu', initials: 'WU', focus: 'Archers', region: 'East Asia', beginnerTier: 'Advanced', beginnerReason: 'Newer civ; better once archer fundamentals are reliable.' },
];

export const civilizations: Civilization[] = civRows.map((civ, index) => {
  const colors = palette[index % palette.length];
  return { ...civ, colors: { primary: colors[0], secondary: colors[1] } };
});

export const beginnerCivilizations = civilizations.filter((civ) => civ.beginnerTier === 'Recommended');

export function findCivilization(name: string) {
  const normalized = name.trim().toLowerCase();
  return civilizations.find((civ) => civ.name.toLowerCase() === normalized);
}


# AoE2 Coach Roadmap

This roadmap tracks planned requirements and product direction for AoE2 Coach.

## v0.1 Foundation

- Local-first React + TypeScript + Vite app.
- Dark AoE2-inspired companion UI.
- Dashboard with Elo, peak Elo, games played, win rate, XP, current mission, recommendations, recent games, and Elo trend.
- Ranked game log stored in LocalStorage.
- Coach analysis based on common beginner improvement signals.
- Mission board with XP rewards.
- Skill tree from Dark Age through Imperial Age.
- Build-order cards for beginner scout openings.
- Replay review notes stored locally.
- Civilization guide with beginner recommendations and custom civ crests.
- GitHub-ready README with screenshot and privacy notes.

## v0.2 CaptureAge Replay Intelligence

Goal: let users upload a local AoE2 `.aoe2record`, CaptureAge `.caderec`, or readable export and receive useful timeline-based coaching without requiring a backend.

Requirements:

- Add a replay upload flow to the Replay Review screen, with guidance for the usual AoE2 DE savegame path: `C:\Users\<you>\Games\Age of Empires 2 DE\<profile-id>\savegame`, plus the CaptureAge Vault path: `C:\Users\<you>\AppData\Roaming\CaptureAge\Vault`. *(implemented)*
- Detect native `.aoe2record` and `.caderec` files and parse them locally. *(native `.aoe2record` operation-stream parsing implemented; `.caderec` remains experimental)*
- Replace string scanning with a real `.aoe2record` operation-stream parser inspired by `mgz`. *(implemented for current DE recordings: compressed player header, sync time/resource snapshots, chat, research, build, queue, resign, and postgame boundaries; string scanning remains as fallback)*
- Validate `.caderec` parsing against real CaptureAge sample files.
- Implement deeper native `.caderec` timeline parsing or identify a reliable local parsing library/format bridge.
- Keep uploaded files local to the browser.
- Extract key timeline events where possible:
  - Dark Age idle TC or villager production gaps.
  - Idle TC by age, with grand total. *(estimated from villager queue coverage)*
  - Feudal, Castle, and Imperial Age transition timing. *(implemented)*
  - House blocks.
  - Enemy opening/scouting signals.
  - Feudal pressure moments.
  - Villager losses or economy damage.
  - Castle Age timing.
  - 2 TC / 3 TC transition signals.
  - Major fights or army losses.
- Convert extracted signals into coaching output:
  - likely minute control was lost,
  - likely cause,
  - category: macro, micro, scouting, or decision-making,
  - next-game mission,
  - timeline event list.
- Plot extracted replay signals on a timeline graph, highlighting age transitions and critical/warning events. *(implemented with native game-time timestamps)*
- Build CaptureAge-style replay statistics panels:
  - age timing comparison,
  - TC queue gap estimates,
  - villager queue rhythm,
  - military/economy/society action counts,
  - resource trend from sync packets where available.
- Allow users to save extracted coaching as a Replay Review.
- Gracefully handle unknown or unsupported file formats.
- Avoid uploading replay data to any server.

## v0.3 Coaching Depth

- Add match-up notes by civilization and opening.
- Expand build orders beyond scout openings.
- Add map-specific beginner advice.
- Add weekly training blocks.
- Add trend summaries over the last 5, 10, and 20 games.

## v0.4 Data Portability

- Export and import local app data.
- Add optional local backup files.
- Keep private exports ignored by Git by default.

## Later Ideas

- More detailed timeline visualizations.
- Practice plans based on repeated weaknesses.
- Custom user-defined missions.
- More polished civ pages with strengths, weaknesses, and beginner plans.

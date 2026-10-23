# AoE2 Record Parser Research

## Goal

Move AoE2 Coach from string-scanning `.aoe2record` files to real recorded-game parsing similar to CaptureAge-style analysis.

## Findings

- CaptureAge does not appear to publish its parser internals. Treat it as a reference for expected capabilities, not as an integration source.
- The strongest open-source baseline is `mgz` / `aoc-mgz`, a Python parser for Age of Empires II recorded games.
- `mgz` models recorded games as:
  - a compressed header containing initial game state
  - a body stream containing operations such as sync, action, chat, viewlock, postgame
- `mgz` confirms that full resource/kills-at-time data generally requires replaying the match state forward, not simply reading a stat table from the file.

## Local Experiment

Replay tested:

`C:\Users\borki\Games\Age of Empires 2 DE\76561198041989517\savegame\MP Replay v101.103.46651.0 @2026.06.05 205318 (2).aoe2record`

High-level `mgz.model.parse_match` currently fails on this replay's DE header, likely due to current AoE2 DE header/version drift.

However, direct body parsing with `mgz.fast.operation` works after skipping the compressed header plus newer extra header bytes. The local experiment parsed:

- 322,325 operations
- 160,210 sync operations
- 160,210 viewlock operations
- 1,897 player action operations
- 7 chat records
- 1 postgame record

Useful extracted examples:

- Feudal age-up messages with timestamps:
  - Player 1 Feudal: about `10:45`
  - Player 2 Feudal: about `11:11`
  - Player 1 Castle: about `23:52`
- Villager queue actions:
  - `Action.DE_QUEUE`
  - `unit_id: 83`
  - includes player id, TC object id, sequence, and nearby sync-derived time
- Build actions:
  - `Action.BUILD`
  - includes player id, building id, x/y coordinates, sequence
- Research actions:
  - `Action.RESEARCH`
  - includes player id, technology id, object id, sequence
- Sync payloads:
  - include `current_time`
  - include per-player guessed `total_res`, object counts, displayable object counts

## Implementation Path

### Phase 1: Real Timeline Parser

Port a minimal subset of `mgz.fast` to TypeScript:

- read compressed header size
- locate body start with offset detection
- parse operation IDs
- parse sync current time
- parse chat messages
- parse selected action types:
  - `DE_QUEUE`
  - `RESEARCH`
  - `BUILD`
  - `RESIGN`

Use the nearest previous sync `current_time` to timestamp actions and age-up chat messages.

### Phase 2: Useful Coaching Stats

From parsed body operations:

- age timings from chat/research events
- first-to-age comparison
- villager queue timestamps
- TC queue gap estimates
- building timing events
- military production building timing
- research timing events
- total resource trend from sync packets where available

### Phase 3: Idle TC By Age

Estimate idle TC by modeling each TC's villager queue:

- detect villager queue action: `unit_id 83`
- group by producing building/object id
- assume villager train time by civ/age where known
- track queue coverage over time
- split uncovered TC time by age windows

This will be an estimate until the parser reconstructs full game state and production queues perfectly.

### Phase 4: CaptureAge-Level Statistics

For military/economy/society totals, resources collected, kills/losses, and exact idle TC:

- reconstruct object ownership/state from header
- apply body operations over time
- resolve unit/building/technology IDs with `aocref` or an equivalent local lookup table
- maintain per-player counters by game time

## Recommendation

Do not keep expanding string scanning. Build a real operation-stream parser in TypeScript, informed by `mgz`, with a conservative fallback to the current string parser when the binary parser cannot align.

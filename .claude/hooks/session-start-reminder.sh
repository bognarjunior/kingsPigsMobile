#!/usr/bin/env bash
# Injects a reminder into the model context at the start of every session.
# Goal: ensure CLAUDE.md and the docs (which are NOT auto-loaded) are read before
# developing anything.
cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"PROJECT REMINDER — Kings and Pigs Mobile. Before writing or changing ANY code, follow the CLAUDE.md checklist: (1) read docs/CONVENTIONS.md (ALL types/interfaces in types/, never inline; logic in a dedicated file; named exports), (2) read docs/BEST_PRACTICES.md (SOLID/OOP + TS/JS/React Native/Phaser best practices), (3) read docs/PATTERNS.md (entities, scenes, events, abstract input), (4) do ONLY what the current phase in docs/ROADMAP.md asks, (5) raise questions before coding — do not start with open points. Hard rules: TS strict, no any/enum; everything written (code, comments, commits, docs) in English, only the live conversation in pt-BR; zero magic numbers outside GameConstants.ts; entities communicate only via Phaser events; I/O only in services/."}}
JSON

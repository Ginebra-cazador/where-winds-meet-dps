# LOCALE-REFERENCE.md — official ZH↔EN string pairs

`reference/locale/zhToEnOfficial.json` — ~250k official Chinese→English string
pairs extracted from the Where Winds Meet game client.

**What it's for.** Naming a new domain term without hand-inventing a translation:
look the Chinese up here and copy the official English into `src/`. This is the
sanctioned source CLAUDE.md's language rule points at.

**Dev-only reference data — never import it from `src/` or `tests/`.** It lives
outside `src/` on purpose: the app is English-only and CLAUDE.md rule 1 requires
`grep -rlP '[\x{4e00}-\x{9fff}]' src tests` to return nothing.

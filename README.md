# agent-context-kit

Kit para generar archivos de contexto para agentes de código en cualquier stack.

## Uso
```bash
npx agent-context-kit init
npx agent-context-kit init --format compact --dry-run
```

## Archivos generados
- AGENTS.md
- docs/AGENT_QUICKSTART.md
- opencode.json
- .claude/CLAUDE.md

No sobrescribe archivos existentes. Usa --force para forzar.

## Config
Crea `.agent-context-kitrc.json` con:
```json
{"format":"full","detect":{"license":true,"readme":true}}
```

# agent-context-kit

Kit para generar archivos de contexto para agentes de código en cualquier stack. Detecta el proyecto y crea archivos estándar para que cualquier agente —opencode, Claude Code, Copilot— entienda el repositorio sin leer línea por línea.

## Instalación

```bash
npm i -g agent-context-kit
# o usa npx sin instalar
npx agent-context-kit init
```

## Uso

```bash
# Generar en el directorio actual
npx agent-context-kit init

# Modo compacto para máxima compresión
npx agent-context-kit init --format compact

# Simular sin escribir
npx agent-context-kit init --dry-run

# Forzar sobrescritura
npx agent-context-kit init --force
```

## Archivos generados

- `AGENTS.md` — guía operativa completa o compacta
- `docs/AGENT_QUICKSTART.md` — arranque rápido
- `opencode.json` — instrucciones para opencode
- `.claude/CLAUDE.md` — contexto para Claude Code

No sobrescribe archivos existentes por defecto.

## Configuración

Crea `.agent-context-kitrc.json`:

```json
{
  "format": "full",
  "detect": { "license": true, "readme": true }
}
```

`format`: `full` detallado, `compact` máxima compresión.

## Desarrollo

```bash
git clone <repo>
npm install
node bin/cli.js .
```

## Licencia

MIT

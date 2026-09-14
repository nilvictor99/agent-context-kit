import ejs from 'ejs';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { detect } from './detector/stackDetector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadConfig(cwd) {
  const cfgPath = join(cwd, '.agent-context-kitrc.json');
  if (!existsSync(cfgPath)) return {};
  try {
    return JSON.parse(readFileSync(cfgPath, 'utf8'));
  } catch {
    return {};
  }
}

export async function generateBrief(opts) {
  const cwd = opts.cwd || process.cwd();
  const config = loadConfig(cwd);
  const format = opts.format || config.format || 'full';
  const force = opts.force || false;
  const dryRun = opts.dryRun || false;

  const ctx = detect(cwd);
  ctx.format = format;

  const templatesDir = join(__dirname, 'templates');
  const outputs = [
    { tmpl: 'AGENTS.md.ejs', out: 'AGENTS.md' },
    { tmpl: 'AGENT_QUICKSTART.md.ejs', out: 'docs/AGENT_QUICKSTART.md' },
    { tmpl: 'opencode.json.ejs', out: 'opencode.json' },
    { tmpl: 'CLAUDE.md.ejs', out: '.claude/CLAUDE.md' },
  ];

  const results = [];

  for (const {tmpl, out} of outputs) {
    const tmplPath = join(templatesDir, tmpl);
    const template = readFileSync(tmplPath, 'utf8');
    const rendered = ejs.render(template, ctx);
    const outPath = join(cwd, out);
    const exists = existsSync(outPath);
    if (exists && !force) {
      results.push({file: out, skipped: true});
      continue;
    }
    if (dryRun) {
      results.push({file: out, skipped: false, content: rendered});
      continue;
    }
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, rendered);
    results.push({file: out, skipped: false});
  }

  return {context: ctx, results};
}

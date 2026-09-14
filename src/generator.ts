import ejs from 'ejs';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { detect } from './detector/stackDetector.js';

export interface Options {
  cwd: string;
  format?: 'full' | 'compact';
  force?: boolean;
  dryRun?: boolean;
}

export async function generateBrief(opts: Options) {
  const cwd = opts.cwd || process.cwd();
  const format = opts.format || 'full';
  const force = opts.force || false;
  const dryRun = opts.dryRun || false;

  const ctx = detect(cwd);
  ctx['format'] = format;

  const templatesDir = join(import.meta.dirname, 'templates');
  const outputs = [
    { tmpl: 'AGENTS.md.ejs', out: 'AGENTS.md' },
    { tmpl: 'AGENT_QUICKSTART.md.ejs', out: 'docs/AGENT_QUICKSTART.md' },
    { tmpl: 'opencode.json.ejs', out: 'opencode.json' },
    { tmpl: 'CLAUDE.md.ejs', out: '.claude/CLAUDE.md' },
  ];

  const results: {file: string, skipped: boolean, content?: string}[] = [];

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

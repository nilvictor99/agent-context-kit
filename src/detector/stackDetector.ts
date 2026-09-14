import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ProjectContext {
  name: string;
  description: string;
  stack: string[];
  frameworks: string[];
  db: string[];
  scripts: Record<string, string>;
  paths: string[];
  license: string | null;
  readme: string | null;
}

function safeRead(p: string) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

export function detect(cwd: string): ProjectContext {
  const pkgPath = join(cwd, 'package.json');
  let pkg: any = {};
  if (existsSync(pkgPath)) {
    try { pkg = JSON.parse(safeRead(pkgPath) || '{}'); } catch {}
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack: string[] = [];
  const frameworks: string[] = [];
  const db: string[] = [];

  const depNames = Object.keys(deps);

  if (depNames.includes('next')) { frameworks.push('Next.js'); stack.push('React'); }
  if (depNames.includes('react')) stack.push('React');
  if (depNames.includes('vue')) { frameworks.push('Vue'); stack.push('Vue'); }
  if (depNames.includes('svelte')) { frameworks.push('Svelte'); stack.push('Svelte'); }
  if (depNames.includes('@prisma/client')) db.push('Prisma');
  if (depNames.includes('typeorm')) db.push('TypeORM');
  if (existsSync(join(cwd, 'prisma', 'schema.prisma'))) db.push('Prisma');
  if (existsSync(join(cwd, 'docker-compose.yml'))) stack.push('Docker');
  if (existsSync(join(cwd, 'vite.config.ts')) || existsSync(join(cwd, 'vite.config.js'))) frameworks.push('Vite');

  const license = detectLicense(cwd);
  const readme = detectReadme(cwd);

  const paths: string[] = [];
  ['src', 'app', 'lib', 'components'].forEach(d => { if (existsSync(join(cwd, d))) paths.push(d); });

  return {
    name: pkg.name || 'project',
    description: pkg.description || readme || '',
    stack: [...new Set(stack)],
    frameworks: [...new Set(frameworks)],
    db: [...new Set(db)],
    scripts: pkg.scripts || {},
    paths,
    license,
    readme
  };
}

function detectLicense(cwd: string) {
  for (const f of ['LICENSE', 'LICENSE.md', 'COPYING']) {
    const p = join(cwd, f);
    if (existsSync(p)) {
      const txt = safeRead(p)?.slice(0, 200);
      if (txt && txt.toLowerCase().includes('mit')) return 'MIT';
      if (txt && txt.toLowerCase().includes('apache')) return 'Apache-2.0';
      return f;
    }
  }
  return null;
}

function detectReadme(cwd: string) {
  const p = join(cwd, 'README.md');
  if (existsSync(p)) {
    const txt = safeRead(p);
    if (txt) return txt.slice(0, 500);
  }
  return null;
}

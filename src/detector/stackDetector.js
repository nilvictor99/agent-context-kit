import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function safeRead(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

export function detect(cwd) {
  const pkgPath = join(cwd, 'package.json');
  let pkg = {};
  if (existsSync(pkgPath)) {
    try { pkg = JSON.parse(safeRead(pkgPath) || '{}'); } catch {}
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack = [];
  const frameworks = [];
  const db = [];

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

  const paths = [];
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

function detectLicense(cwd) {
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

function detectReadme(cwd) {
  const p = join(cwd, 'README.md');
  if (existsSync(p)) {
    const txt = safeRead(p);
    if (txt) return txt.slice(0, 500);
  }
  return null;
}

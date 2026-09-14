#!/usr/bin/env node
import { Command } from 'commander';
import { generateBrief } from '../src/generator.js';

const program = new Command();
program
  .name('agent-context-kit')
  .description('Genera archivos de contexto para agentes en cualquier stack')
  .argument('[path]', 'ruta del proyecto', process.cwd())
  .option('-f, --format <type>', 'full o compact', 'full')
  .option('--force', 'sobrescribir archivos existentes')
  .option('--dry-run', 'no escribir archivos')
  .action(async (path, options) => {
    const res = await generateBrief({
      cwd: path,
      format: options.format,
      force: options.force,
      dryRun: options.dryRun
    });
    console.log('Contexto detectado:', res.context.name);
    res.results.forEach(r => {
      if (r.skipped) console.log(`⏭️  Omitido existente: ${r.file}`);
      else if (options.dryRun) console.log(`👁️  Dry-run: ${r.file}`);
      else console.log(`✅  Generado: ${r.file}`);
    });
  });

program.parse();

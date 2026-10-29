import { readFileSync } from 'node:fs';
import { ruleCoverage, loadRules } from './coverage.js';

interface ImplementedMap {
  [story: string]: string[];
}

interface Options {
  resultsPath: string;
  story: string | null;
  all: boolean;
  map: ImplementedMap | null;
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    resultsPath: process.env.VITEST_RESULTS ?? '.vitest-results.json',
    story: null,
    all: false,
    map: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--story') {
      options.story = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--map') {
      const path = argv[index + 1];
      if (path) options.map = JSON.parse(readFileSync(path, 'utf8')) as ImplementedMap;
      index += 1;
    } else if (arg && !arg.startsWith('--')) {
      options.resultsPath = arg;
    }
  }

  return options;
}

/**
 * Gate entry point.
 *
 * The SPMP asks for 100% of the domain rules covered before the final
 * deployment, and for no story to be considered done while a rule it
 * implements has no test. Running the gate story-scoped keeps CI green during
 * development; running it with `--all` enforces the final 100%.
 */
function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const result = ruleCoverage(options.resultsPath);
  const rules = loadRules();

  const criticalByStory = options.story && options.map ? (options.map[options.story] ?? null) : null;
  const blocking = criticalByStory ? criticalByStory.filter((id) => result.missing.includes(id)) : [];

  console.log(`Reglas cubiertas: ${result.covered}/${result.total} (${result.percentage}%)`);
  if (result.missing.length > 0) {
    console.log(`Sin test: ${result.missing.join(', ')}`);
  }
  if (result.duplicated.length > 0) {
    console.log(`Con mas de un test: ${result.duplicated.join(', ')}`);
  }
  if (options.story) {
    if (!criticalByStory) {
      console.error(`La historia ${options.story} no esta declarada en el mapa de reglas implementadas.`);
      process.exit(1);
    }
    console.log(`Historia ${options.story}: implementa ${criticalByStory.join(', ')}`);
  }

  const rulesById = new Map(rules.reglas.map((rule) => [rule.id, rule]));
  if (blocking.length > 0) {
    console.error(`Reglas implementadas sin test que pasa: ${blocking.join(', ')}`);
    process.exit(1);
  }

  if (options.all && result.percentage < 100) {
    console.error(
      `Gate final: se exige el 100% de las ${result.total} reglas del dominio antes del despliegue final.`,
    );
    for (const id of result.missing) {
      console.error(`  ${id} :: ${rulesById.get(id)?.texto ?? 'regla desconocida'}`);
    }
    process.exit(1);
  }
}

main();

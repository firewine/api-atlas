// @ts-check
import { readdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';
import { caseInputSchema, caseMarkdown, duplicateCaseIssues } from '../src/lib/case-study.mjs';
import { verifyCaseEvidence } from './case-evidence.mjs';

/** @param {string} root */
export async function existingGuides(root) {
  const directory = resolve(root, 'src/data/guides');
  return Promise.all((await readdir(directory)).filter((file) => file.endsWith('.md')).map(async (file) => {
    const source = await readFile(resolve(directory, file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!frontmatter) throw new Error(`Missing frontmatter: ${file}`);
    const data = parse(frontmatter[1]);
    return { slug: file.slice(0, -3), title: data.title, description: data.description ?? data.summary,
      summary: data.summary, body: source.slice(frontmatter[0].length), problemId: data.caseStudy?.problemId };
  }));
}

/** @param {unknown} recipe @param {string} root */
export async function generateCaseStudy(recipe, root) {
  const input = caseInputSchema.parse(recipe);
  await verifyCaseEvidence(root, input.caseStudy);
  const providerFiles = await readdir(resolve(root, 'src/data/apis'));
  for (const id of input.caseStudy.providers) {
    if (!providerFiles.includes(`${id}.md`)) throw new Error(`Unknown provider: ${id}`);
  }
  const { sections, ...data } = input;
  const body = caseMarkdown(input);
  const issues = duplicateCaseIssues([...(await existingGuides(root)), {
    slug: input.caseStudy.slug, title: data.title, description: data.description,
    summary: data.summary, body, problemId: input.caseStudy.problemId,
  }]);
  if (issues.length) throw new Error(issues.join('\n'));
  const markdown = `---\n${stringify(data, { defaultStringType: 'QUOTE_DOUBLE' })}---\n\n${body}`;
  const target = resolve(root, `src/data/guides/${input.caseStudy.slug}.md`);
  await writeFile(target, markdown, { flag: 'wx' });
  return target;
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const inputFile = process.argv[2];
  if (!inputFile || process.argv.length !== 3) throw new Error('Usage: npm run generate:case -- /path/to/reviewed-case.json');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const target = await generateCaseStudy(JSON.parse(await readFile(resolve(inputFile), 'utf8')), root);
  console.log(`Generated reviewed case: ${target}`);
}

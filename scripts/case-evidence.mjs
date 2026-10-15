// @ts-check
import { readFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';

/** Local receipts are reviewed snapshots, not proof of live provider success.
 * @param {string} root
 * @param {import('../src/lib/case-study.mjs').CaseStudy} study
 */
export async function verifyCaseEvidence(root, study) {
  const evidenceRoot = await realpath(resolve(root, 'case-studies/evidence'));
  for (const item of study.evidence) {
    const path = await realpath(resolve(root, item.snapshot));
    if (!path.startsWith(`${evidenceRoot}${sep}`)) throw new Error(`Evidence escapes snapshot directory: ${item.snapshot}`);
    const bytes = await readFile(path);
    if (createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error(`Evidence hash mismatch: ${item.id}`);
    if (!bytes.toString('utf8').includes(item.excerpt)) throw new Error(`Evidence excerpt not found: ${item.id}`);
  }
}

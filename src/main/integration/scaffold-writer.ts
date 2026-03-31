import fs from 'fs/promises';
import path from 'path';
import { normalizePath } from '../utils/paths.js';
import type { IntegrationPlan } from './types.js';

/** Recursively list all files under a directory, returning paths relative to that directory. */
async function listFilesRecursive(dir: string, base?: string): Promise<string[]> {
  const root = base ?? dir;
  const results: string[] = [];

  let entries: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch { /* expected: directory may not exist */
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(fullPath, root);
      results.push(...nested);
    } else {
      results.push(normalizePath(path.relative(root, fullPath)));
    }
  }

  return results;
}

/** Map a scaffold-relative path to its target-relative path. */
function scaffoldPathToTarget(scaffoldRelative: string): string {
  if (scaffoldRelative === '.scaffold-version') return '.claude/specify/.scaffold-version';
  if (scaffoldRelative === 'CLAUDE.md.template') return 'CLAUDE.md';
  return normalizePath(path.join('.claude', scaffoldRelative));
}

/**
 * Execute the integration: write scaffold files to the target project.
 *
 * Side effects (in order):
 * 1. Delete .claude/specs/ recursively if it exists
 * 2. Delete deprecated files flagged in the plan
 * 3. Create directory structure for all scaffold paths
 * 4. Copy each scaffold file to the corresponding .claude/ path
 * 5. Create CLAUDE.md from template if it doesn't exist (skip if present)
 * 6. Write .scaffold-version
 * 7. Ensure context/ and memory/ directories exist
 */
export async function executeIntegration(targetPath: string, scaffoldDir: string, plan?: IntegrationPlan): Promise<void> {
  console.log(`[integration] executing integration: scaffold=${scaffoldDir} → target=${targetPath}`);

  // Step 1: Wipe .claude/specs/ (FR-016)
  const specsDir = path.join(targetPath, '.claude', 'specs');
  try {
    await fs.rm(specsDir, { recursive: true, force: true });
    console.log('[integration] wiped .claude/specs/');
  } catch {
    // Directory might not exist — that's fine
  }

  // Step 2: Delete deprecated files
  if (plan) {
    for (const entry of plan.files) {
      if (entry.action !== 'delete') continue;
      const filePath = path.join(targetPath, entry.relativePath);
      try {
        await fs.rm(filePath, { force: true });
        console.log(`[integration] deleted deprecated: ${entry.relativePath}`);
      } catch {
        // File may not exist — that's fine
      }
    }
  }

  // Step 3-4: List scaffold files and copy each
  const scaffoldFiles = await listFilesRecursive(scaffoldDir);
  const claudeMdExists = await fileExists(path.join(targetPath, 'CLAUDE.md'));

  for (const scaffoldRel of scaffoldFiles) {
    const targetRel = scaffoldPathToTarget(scaffoldRel);

    // FR-014: Never overwrite existing CLAUDE.md
    if (targetRel === 'CLAUDE.md' && claudeMdExists) continue;

    // FR-005: Never overwrite template overrides
    if (targetRel.includes('specify/templates/overrides/')) continue;

    const sourcePath = path.join(scaffoldDir, scaffoldRel);
    const destPath = path.join(targetPath, targetRel);

    // Create parent directory
    await fs.mkdir(path.dirname(destPath), { recursive: true });

    // Copy file
    await fs.copyFile(sourcePath, destPath);
    console.log(`[integration] copied: ${targetRel}`);
  }

  // Step 6: Ensure context/ and memory/ directories exist (even if empty)
  await fs.mkdir(path.join(targetPath, '.claude', 'specify', 'context'), { recursive: true });
  await fs.mkdir(path.join(targetPath, '.claude', 'specify', 'memory'), { recursive: true });
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

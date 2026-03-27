import fs from 'fs/promises';
import path from 'path';

const SCAFFOLD_VERSION_PATH = '.claude/specify/.scaffold-version';

/**
 * Resolve the path to the bundled scaffold directory.
 * In electron-vite builds, __dirname resolves to out/main/.
 * Accept an optional override for testing (Vitest __dirname differs from electron-vite).
 */
export function getScaffoldDir(base?: string): string {
  const root = base ?? path.join(__dirname, '../../');
  return path.join(root, 'resources/scaffold');
}

/** Read the scaffold version from a target project. Returns null if not found. */
export async function readScaffoldVersion(projectPath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(path.join(projectPath, SCAFFOLD_VERSION_PATH), 'utf-8');
    return content.trim();
  } catch { /* expected: file may not exist in non-integrated projects */
    return null;
  }
}

/** Write the scaffold version stamp to a target project. */
export async function writeScaffoldVersion(projectPath: string, version: string): Promise<void> {
  const filePath = path.join(projectPath, SCAFFOLD_VERSION_PATH);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, version + '\n', 'utf-8');
}

/** Read the bundled scaffold version from the app resources. */
export async function getBundledScaffoldVersion(scaffoldDir?: string): Promise<string> {
  const dir = scaffoldDir ?? getScaffoldDir();
  const content = await fs.readFile(path.join(dir, '.scaffold-version'), 'utf-8');
  return content.trim();
}

/** Check if a project's scaffold is outdated compared to a given app version. */
export async function isScaffoldOutdated(projectPath: string, appVersion: string): Promise<boolean> {
  const projectVersion = await readScaffoldVersion(projectPath);
  if (projectVersion === null) return true;
  return projectVersion !== appVersion;
}

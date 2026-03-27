import fs from 'fs';
import path from 'path';

export interface ScanResult {
  currentBranch: string;
  hasSpeckitContent: boolean;
  specDir: string | null;
  artifactFiles: string[];
}

export async function scanProject(projectPath: string): Promise<ScanResult> {
  const gitDir = path.join(projectPath, '.git');
  try {
    await fs.promises.access(gitDir);
  } catch {
    throw new Error(`"${projectPath}" is not a git repository (no .git directory)`);
  }

  const currentBranch = await detectBranch(gitDir);
  const specDir = path.join(projectPath, '.claude', 'specs', currentBranch);

  try {
    await fs.promises.access(specDir);
  } catch {
    return {
      currentBranch,
      hasSpeckitContent: false,
      specDir: null,
      artifactFiles: [],
    };
  }

  const entries = await fs.promises.readdir(specDir);
  const artifactFiles = entries.filter((f) => f.endsWith('.md'));

  return {
    currentBranch,
    hasSpeckitContent: artifactFiles.length > 0,
    specDir,
    artifactFiles,
  };
}

async function detectBranch(gitDir: string): Promise<string> {
  const headPath = path.join(gitDir, 'HEAD');
  const headContent = (await fs.promises.readFile(headPath, 'utf-8')).trim();

  // HEAD can be "ref: refs/heads/branch-name" or a direct commit hash
  if (headContent.startsWith('ref: ')) {
    return headContent.replace('ref: refs/heads/', '');
  }
  return headContent;
}

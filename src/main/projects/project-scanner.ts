import fs from 'fs';
import path from 'path';

export interface ScanResult {
  currentBranch: string;
  hasSpeckitContent: boolean;
  specDir: string | null;
  artifactFiles: string[];
}

export function scanProject(projectPath: string): ScanResult {
  const gitDir = path.join(projectPath, '.git');
  if (!fs.existsSync(gitDir)) {
    throw new Error(`"${projectPath}" is not a git repository (no .git directory)`);
  }

  const currentBranch = detectBranch(gitDir);
  const specDir = path.join(projectPath, '.claude', 'specs', currentBranch);

  if (!fs.existsSync(specDir)) {
    return {
      currentBranch,
      hasSpeckitContent: false,
      specDir: null,
      artifactFiles: [],
    };
  }

  const artifactFiles = fs
    .readdirSync(specDir)
    .filter((f) => f.endsWith('.md'));

  return {
    currentBranch,
    hasSpeckitContent: artifactFiles.length > 0,
    specDir,
    artifactFiles,
  };
}

function detectBranch(gitDir: string): string {
  const headPath = path.join(gitDir, 'HEAD');
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  // HEAD can be "ref: refs/heads/branch-name" or a direct commit hash
  if (headContent.startsWith('ref: ')) {
    return headContent.replace('ref: refs/heads/', '');
  }
  return headContent;
}

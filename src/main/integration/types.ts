export type FileAction = 'create' | 'overwrite' | 'preserve';
export type FileCategory = 'command' | 'script' | 'template' | 'best-practice' | 'meta' | 'user';

export interface IntegrationFileEntry {
  relativePath: string;
  action: FileAction;
  category: FileCategory;
}

export interface IntegrationPlan {
  targetPath: string;
  scaffoldVersion: string;
  files: IntegrationFileEntry[];
  createCount: number;
  overwriteCount: number;
  preserveCount: number;
  specsWillBeWiped: boolean;
  claudeMdExists: boolean;
}

export type IntegrationState = 'not-integrated' | 'needs-constitution' | 'current' | 'outdated';

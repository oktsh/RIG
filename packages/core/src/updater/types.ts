export interface UpdatePlan {
  currentVersion: string;
  newVersion: string;
  changes: ComponentChange[];
  hasChanges: boolean;
}

export interface ComponentChange {
  component: string; // 'agents' | 'rules' | 'hooks' | 'formats' | 'templates'
  currentVersion: string;
  newVersion: string;
  files: FileChange[];
}

export interface FileChange {
  path: string;
  action: 'add' | 'update' | 'remove';
  customized: boolean; // true if user modified since last generate
}

export interface UpdateResult {
  applied: FileChange[];
  skipped: FileChange[]; // customized files that were preserved
  errors: { path: string; error: string }[];
  summary: UpdateSummary;
  backupPath?: string;
}

export interface UpdateSummary {
  whatsNew: string[];
  whatChanged: string[];
  whatToReview: string[];
  migrationNotes: string[];
}

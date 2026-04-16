export interface GenerationResult {
  files: GeneratedFile[];
  duration: number;
}

export interface GeneratedFile {
  path: string;
  content: string;
  component: 'agents' | 'rules' | 'hooks' | 'formats' | 'templates' | 'config';
}

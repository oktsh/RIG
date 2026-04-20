import { join } from 'node:path';
import type { Manifest } from '../schemas/index.js';
import type { UpdatePlan, ComponentChange, FileChange } from './types.js';
import { computeHash } from '../utils/index.js';
import { readFileSafe } from '../utils/index.js';

/**
 * Compare two manifests and produce an UpdatePlan describing what changed.
 *
 * Customization detection: reads the actual file from disk, computes its hash,
 * and compares with the currentManifest hash. If disk hash != manifest hash,
 * the file was customized by the user.
 */
export async function compareVersions(
  currentManifest: Manifest,
  newManifest: Manifest,
  projectDir: string,
): Promise<UpdatePlan> {
  const currentFiles = currentManifest.files;
  const newFiles = newManifest.files;

  const allPaths = new Set([...Object.keys(currentFiles), ...Object.keys(newFiles)]);

  // Group changes by component
  const changesByComponent = new Map<string, FileChange[]>();

  for (const path of allPaths) {
    const inCurrent = path in currentFiles;
    const inNew = path in newFiles;

    let action: FileChange['action'];
    if (!inCurrent && inNew) {
      action = 'add';
    } else if (inCurrent && !inNew) {
      action = 'remove';
    } else if (currentFiles[path] !== newFiles[path]) {
      action = 'update';
    } else {
      // Hashes match — no change
      continue;
    }

    // Detect customization: read disk file, compare with current manifest hash
    let customized = false;
    if (inCurrent) {
      const diskContent = await readFileSafe(join(projectDir, path));
      if (diskContent !== null) {
        const diskHash = computeHash(diskContent);
        customized = diskHash !== currentFiles[path];
      }
    }

    const component = detectComponent(path);
    if (!changesByComponent.has(component)) {
      changesByComponent.set(component, []);
    }
    changesByComponent.get(component)!.push({ path, action, customized });
  }

  const changes: ComponentChange[] = [];
  for (const [component, files] of changesByComponent) {
    const currentVersion = getComponentVersion(currentManifest, component);
    const newVersion = getComponentVersion(newManifest, component);
    changes.push({ component, currentVersion, newVersion, files });
  }

  return {
    currentVersion: currentManifest.gyrd_version,
    newVersion: newManifest.gyrd_version,
    changes,
    hasChanges: changes.length > 0,
  };
}

function detectComponent(path: string): string {
  if (path.startsWith('.claude/agents/')) return 'agents';
  if (path.startsWith('.claude/rules/')) return 'rules';
  if (path.startsWith('.claude/hooks/')) return 'hooks';
  if (path.startsWith('.claude/templates/')) return 'templates';
  if (path.startsWith('.cursor/rules/')) return 'formats';
  if (path === 'CLAUDE.md' || path === 'AGENTS.md') return 'formats';
  return 'config';
}

function getComponentVersion(manifest: Manifest, component: string): string {
  const comp = manifest.components as Record<string, unknown>;
  if (component in comp) {
    const entry = comp[component] as Record<string, unknown>;
    if ('version' in entry && typeof entry.version === 'string') {
      return entry.version;
    }
  }
  return manifest.gyrd_version;
}

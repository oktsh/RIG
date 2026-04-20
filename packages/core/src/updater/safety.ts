import type { Manifest } from '../schemas/index.js';

/**
 * Patterns for files that GYRD must NEVER overwrite or manage.
 * These are user-owned files that should survive any update.
 */
const NEVER_MANAGED: (string | RegExp)[] = [
  'PROGRESS.md',
  'DECISIONS.md',
  /^memory\//,
  /^specs\//,
  /^\.rig\/backups\//,
];

/**
 * Get the set of files that are managed by GYRD (tracked in the manifest).
 */
export function getManagedFiles(manifest: Manifest): Set<string> {
  return new Set(Object.keys(manifest.files));
}

/**
 * Check if a path is explicitly unmanaged (in the NEVER_MANAGED list)
 * or not tracked in the manifest.
 */
export function isUnmanagedFile(path: string, manifest: Manifest): boolean {
  // Check against NEVER_MANAGED patterns first
  for (const pattern of NEVER_MANAGED) {
    if (typeof pattern === 'string') {
      if (path === pattern) return true;
    } else {
      if (pattern.test(path)) return true;
    }
  }

  // If it's not in the manifest, it's unmanaged
  return !(path in manifest.files);
}

/**
 * Validate that a path is a managed file and safe to update.
 * Throws if the path is unmanaged.
 */
export function validateUpdateTarget(path: string, manifest: Manifest): void {
  for (const pattern of NEVER_MANAGED) {
    if (typeof pattern === 'string') {
      if (path === pattern) {
        throw new Error(`Cannot update '${path}': this file is never managed by GYRD`);
      }
    } else {
      if (pattern.test(path)) {
        throw new Error(`Cannot update '${path}': matches protected pattern ${pattern}`);
      }
    }
  }

  if (!(path in manifest.files)) {
    throw new Error(`Cannot update '${path}': not tracked in manifest`);
  }
}

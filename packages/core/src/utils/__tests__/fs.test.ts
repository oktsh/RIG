import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ensureDir, writeFileAtomic, readFileSafe } from '../fs.js';

let tmpDir: string;

afterEach(async () => {
  if (tmpDir) {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

describe('ensureDir', () => {
  it('creates nested directories', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'rig-test-'));
    const nested = join(tmpDir, 'a', 'b', 'c');
    await ensureDir(nested);
    const { stat } = await import('node:fs/promises');
    const s = await stat(nested);
    expect(s.isDirectory()).toBe(true);
  });
});

describe('writeFileAtomic', () => {
  it('writes content to file and creates parent directories', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'rig-test-'));
    const filePath = join(tmpDir, 'sub', 'file.txt');
    await writeFileAtomic(filePath, 'hello world');
    const content = await readFile(filePath, 'utf8');
    expect(content).toBe('hello world');
  });
});

describe('readFileSafe', () => {
  it('returns null for a missing file', async () => {
    const result = await readFileSafe('/tmp/rig-nonexistent-file-xyz-12345.txt');
    expect(result).toBeNull();
  });
});

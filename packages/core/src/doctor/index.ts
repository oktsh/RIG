import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parse as parseToml } from '@iarna/toml';
import { GyrdConfigSchema } from '../schemas/index.js';
import { readManifest } from '../manifest/index.js';
import {
  checkSchemaFreshness,
  checkFormatSync,
  checkHookCoverage,
  checkDeadReferences,
  checkRuleContradictions,
  checkTemplateDrift,
  checkDeprecationScan,
  checkSecurityBaseline,
} from './checks/index.js';
import type { CheckResult, CheckStatus, DoctorResult } from './types.js';

export interface RunChecksOptions {
  /** Override content root for format-sync check */
  contentRoot?: string;
}

/**
 * Clean parsed TOML data before Zod validation.
 * Same logic as in gyrd-cli generate command.
 */
function cleanParsedConfig(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...data };

  for (const key of ['agents', 'hooks', 'formats', 'updates']) {
    if (cleaned[key] && typeof cleaned[key] === 'object') {
      const section = { ...(cleaned[key] as Record<string, unknown>) };
      let hasValues = false;

      for (const [k, v] of Object.entries(section)) {
        if (v === '' || (Array.isArray(v) && v.length === 0)) {
          delete section[k];
        } else {
          hasValues = true;
        }
      }

      if (hasValues) {
        cleaned[key] = section;
      } else {
        delete cleaned[key];
      }
    }
  }

  return cleaned;
}

function worstStatus(statuses: CheckStatus[]): CheckStatus {
  if (statuses.includes('fail')) return 'fail';
  if (statuses.includes('warn')) return 'warn';
  return 'pass';
}

/**
 * Run all doctor checks against a project directory.
 */
export async function runChecks(dir: string, options?: RunChecksOptions): Promise<DoctorResult> {
  // 1. Read gyrd.toml
  const rigTomlPath = join(dir, 'gyrd.toml');
  if (!existsSync(rigTomlPath)) {
    return {
      checks: [{
        name: 'config',
        status: 'fail',
        message: 'No gyrd.toml found. This does not appear to be a GYRD project.',
        remediation: 'Run `npx create-gyrd` to initialize.',
      }],
      overall: 'fail',
    };
  }

  const raw = await readFile(rigTomlPath, 'utf8');
  let parsed: unknown;
  try {
    parsed = parseToml(raw);
  } catch {
    return {
      checks: [{
        name: 'config',
        status: 'fail',
        message: 'Invalid TOML syntax in gyrd.toml',
        remediation: 'Fix the syntax error in gyrd.toml.',
      }],
      overall: 'fail',
    };
  }

  const cleaned = cleanParsedConfig(parsed as Record<string, unknown>);
  const configResult = GyrdConfigSchema.safeParse(cleaned);
  if (!configResult.success) {
    return {
      checks: [{
        name: 'config',
        status: 'fail',
        message: 'Invalid gyrd.toml config: ' + configResult.error.issues.map((i) => i.message).join(', '),
        remediation: 'Fix the config errors in gyrd.toml.',
      }],
      overall: 'fail',
    };
  }

  const config = configResult.data;

  // 2. Read manifest (may be null)
  const manifest = await readManifest(dir);

  // 3. Run all 8 checks
  const checks: CheckResult[] = await Promise.all([
    checkSchemaFreshness(dir),
    checkFormatSync(dir, config, options?.contentRoot),
    checkHookCoverage(dir),
    checkDeadReferences(dir),
    checkRuleContradictions(dir),
    checkTemplateDrift(dir, manifest),
    checkDeprecationScan(dir),
    checkSecurityBaseline(dir),
  ]);

  return {
    checks,
    overall: worstStatus(checks.map((c) => c.status)),
  };
}

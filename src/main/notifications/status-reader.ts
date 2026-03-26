import fs from 'fs/promises';

export type StatusValue = 'started' | 'completed';

export interface StatusEvent {
  command: string;
  status: StatusValue;
  timestamp: string;
}

const VALID_STATUSES: ReadonlySet<string> = new Set<StatusValue>(['started', 'completed']);

function isValidStatus(value: unknown): value is StatusValue {
  return typeof value === 'string' && VALID_STATUSES.has(value);
}

export async function readStatus(statusFilePath: string): Promise<StatusEvent | null> {
  try {
    const raw = await fs.readFile(statusFilePath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) return null;

    const obj = parsed as Record<string, unknown>;
    if (typeof obj.command !== 'string') return null;
    if (!isValidStatus(obj.status)) return null;
    if (typeof obj.timestamp !== 'string') return null;

    return {
      command: obj.command,
      status: obj.status,
      timestamp: obj.timestamp,
    };
  } catch {
    return null;
  }
}

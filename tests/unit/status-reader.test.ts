import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readStatus } from '../../src/main/notifications/status-reader.js';
import fs from 'fs/promises';

vi.mock('fs/promises');

const mockedReadFile = vi.mocked(fs.readFile);

describe('status-reader', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves to StatusEvent for valid completed status.json', async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ command: 'speckit.plan', status: 'completed', timestamp: '2026-03-26T12:00:00.000Z' }),
    );
    const result = await readStatus('/some/path/status.json');
    expect(result).toEqual({
      command: 'speckit.plan',
      status: 'completed',
      timestamp: '2026-03-26T12:00:00.000Z',
    });
  });

  it('resolves to StatusEvent for valid started status.json', async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ command: 'speckit.specify', status: 'started', timestamp: '2026-03-26T11:00:00.000Z' }),
    );
    const result = await readStatus('/some/path/status.json');
    expect(result).toEqual({
      command: 'speckit.specify',
      status: 'started',
      timestamp: '2026-03-26T11:00:00.000Z',
    });
  });

  it('resolves to null when the file does not exist', async () => {
    mockedReadFile.mockRejectedValue(new Error('ENOENT: no such file'));
    const result = await readStatus('/nonexistent/status.json');
    expect(result).toBeNull();
  });

  it('resolves to null for malformed JSON', async () => {
    mockedReadFile.mockResolvedValue('not valid json {{{');
    const result = await readStatus('/some/path/status.json');
    expect(result).toBeNull();
  });

  it('resolves to null when command field is missing', async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ status: 'completed', timestamp: '2026-03-26T12:00:00.000Z' }),
    );
    const result = await readStatus('/some/path/status.json');
    expect(result).toBeNull();
  });

  it('resolves to null when status field is missing', async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ command: 'speckit.plan', timestamp: '2026-03-26T12:00:00.000Z' }),
    );
    const result = await readStatus('/some/path/status.json');
    expect(result).toBeNull();
  });

  it('resolves to null when status has an invalid value', async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ command: 'speckit.plan', status: 'running', timestamp: '2026-03-26T12:00:00.000Z' }),
    );
    const result = await readStatus('/some/path/status.json');
    expect(result).toBeNull();
  });

  it('resolves to null when timestamp field is missing', async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ command: 'speckit.plan', status: 'completed' }),
    );
    const result = await readStatus('/some/path/status.json');
    expect(result).toBeNull();
  });

  it('ignores extra fields and still returns valid StatusEvent', async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ command: 'speckit.plan', status: 'completed', timestamp: '2026-03-26T12:00:00.000Z', extra: 'field', count: 42 }),
    );
    const result = await readStatus('/some/path/status.json');
    expect(result).toEqual({
      command: 'speckit.plan',
      status: 'completed',
      timestamp: '2026-03-26T12:00:00.000Z',
    });
  });
});

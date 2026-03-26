import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execFile } from 'child_process';

vi.mock('child_process', () => ({
  execFile: vi.fn(),
}));

const mockExecFile = vi.mocked(execFile);

// Need to import after mocking
import { playNotificationSound } from '../../src/main/notifications/sound-player.js';

describe('sound-player', () => {
  const originalPlatform = process.platform;

  beforeEach(() => {
    mockExecFile.mockReset();
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    vi.restoreAllMocks();
  });

  function setPlatform(p: string) {
    Object.defineProperty(process, 'platform', { value: p });
  }

  function simulateExecSuccess() {
    mockExecFile.mockImplementation((_cmd: any, _args: any, callback: any) => {
      callback(null, '', '');
      return undefined as any;
    });
  }

  it('does not spawn any process when volume is off', async () => {
    await playNotificationSound('off', 'spec.plan');
    expect(mockExecFile).not.toHaveBeenCalled();
  });

  it('calls powershell.exe with MediaPlayer and volume on Windows', async () => {
    setPlatform('win32');
    simulateExecSuccess();

    await playNotificationSound('medium', 'spec.plan');

    expect(mockExecFile).toHaveBeenCalledWith(
      'powershell.exe',
      expect.arrayContaining(['-NoProfile', '-NonInteractive', '-Command']),
      expect.any(Function),
    );

    const script = mockExecFile.mock.calls[0]![3] as unknown as string;
    const args = mockExecFile.mock.calls[0]![1] as string[];
    const cmdArg = args[args.indexOf('-Command') + 1]!;
    expect(cmdArg).toContain('PresentationCore');
    expect(cmdArg).toContain('MediaPlayer');
    expect(cmdArg).toContain('.Volume = 0.5');
  });

  it('maps volume levels correctly on Windows', async () => {
    setPlatform('win32');
    simulateExecSuccess();

    await playNotificationSound('high', 'spec.plan');
    const argsHigh = mockExecFile.mock.calls[0]![1] as string[];
    const cmdHigh = argsHigh[argsHigh.indexOf('-Command') + 1]!;
    expect(cmdHigh).toContain('.Volume = 1');

    mockExecFile.mockReset();
    simulateExecSuccess();

    await playNotificationSound('low', 'spec.plan');
    const argsLow = mockExecFile.mock.calls[0]![1] as string[];
    const cmdLow = argsLow[argsLow.indexOf('-Command') + 1]!;
    expect(cmdLow).toContain('.Volume = 0.2');
  });

  it('calls afplay with volume flag on macOS', async () => {
    setPlatform('darwin');
    simulateExecSuccess();

    await playNotificationSound('medium', 'spec.plan');

    expect(mockExecFile).toHaveBeenCalledWith(
      'afplay',
      expect.arrayContaining([expect.stringContaining('plan.wav'), '-v', '0.5']),
      expect.any(Function),
    );
  });

  it('maps high volume to 1.0 on macOS', async () => {
    setPlatform('darwin');
    simulateExecSuccess();

    await playNotificationSound('high', 'spec.implement');

    expect(mockExecFile).toHaveBeenCalledWith(
      'afplay',
      expect.arrayContaining(['-v', '1']),
      expect.any(Function),
    );
  });

  it('maps low volume to 0.2 on macOS', async () => {
    setPlatform('darwin');
    simulateExecSuccess();

    await playNotificationSound('low', 'spec.conclude');

    expect(mockExecFile).toHaveBeenCalledWith(
      'afplay',
      expect.arrayContaining(['-v', '0.2']),
      expect.any(Function),
    );
  });

  it('does not spawn any process on unsupported platform', async () => {
    setPlatform('linux');

    await playNotificationSound('medium', 'spec.plan');

    expect(mockExecFile).not.toHaveBeenCalled();
  });

  it('does not throw when playback fails', async () => {
    setPlatform('win32');
    mockExecFile.mockImplementation((_cmd: any, _args: any, callback: any) => {
      callback(new Error('powershell not found'), '', '');
      return undefined as any;
    });

    await expect(playNotificationSound('medium', 'spec.plan')).resolves.toBeUndefined();
  });

  it('plays specify.wav for spec.specify command', async () => {
    setPlatform('darwin');
    simulateExecSuccess();

    await playNotificationSound('high', 'spec.specify');
    expect(mockExecFile).toHaveBeenCalledWith('afplay', expect.arrayContaining([expect.stringContaining('specify.wav')]), expect.any(Function));
  });

  it('plays conclude.wav for spec.conclude command', async () => {
    setPlatform('darwin');
    simulateExecSuccess();

    await playNotificationSound('high', 'spec.conclude');
    expect(mockExecFile).toHaveBeenCalledWith('afplay', expect.arrayContaining([expect.stringContaining('conclude.wav')]), expect.any(Function));
  });

  it('falls back to default sound for unknown commands', async () => {
    setPlatform('darwin');
    simulateExecSuccess();

    await playNotificationSound('high', 'spec.unknown');
    expect(mockExecFile).toHaveBeenCalledWith('afplay', expect.arrayContaining([expect.stringContaining('plan.wav')]), expect.any(Function));
  });
});

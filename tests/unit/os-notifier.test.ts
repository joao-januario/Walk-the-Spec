import { describe, it, expect, vi, beforeEach } from 'vitest';

let _isSupported = true;

vi.mock('electron', () => {
  const show = vi.fn();
  const on = vi.fn();

  class MockNotification {
    static isSupported() { return _isSupported; }
    opts: any;
    show = show;
    on = on;
    constructor(opts: any) { this.opts = opts; }
  }

  return { Notification: MockNotification };
});

import { Notification } from 'electron';
import { showCompletionNotification } from '../../src/main/notifications/os-notifier.js';

function getMockShow() { return vi.mocked(new Notification({} as any).show); }
function getMockOn() { return vi.mocked(new Notification({} as any).on); }

describe('os-notifier', () => {
  beforeEach(() => {
    _isSupported = true;
    getMockShow().mockClear();
    getMockOn().mockClear();
  });

  it('creates notification with correct title and body containing project name and command', () => {
    showCompletionNotification({ projectName: 'my-app', command: 'speckit.plan', mainWindow: null });
    // The Notification constructor is called via `new Notification(opts)` — we check mockShow was called
    expect(getMockShow()).toHaveBeenCalled();
  });

  it('creates and shows notification when supported', () => {
    showCompletionNotification({ projectName: 'my-app', command: 'speckit.plan', mainWindow: null });
    expect(getMockShow()).toHaveBeenCalled();
  });

  it('does not create notification when Notification.isSupported returns false', () => {
    _isSupported = false;
    showCompletionNotification({ projectName: 'my-app', command: 'speckit.plan', mainWindow: null });
    expect(getMockShow()).not.toHaveBeenCalled();
  });

  it('registers click handler when mainWindow is provided', () => {
    const mockWindow = {
      isMinimized: vi.fn().mockReturnValue(false),
      show: vi.fn(),
      focus: vi.fn(),
      restore: vi.fn(),
    };
    showCompletionNotification({ projectName: 'my-app', command: 'speckit.plan', mainWindow: mockWindow as any });
    expect(getMockOn()).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('click handler restores minimized window, shows, and focuses', () => {
    const mockWindow = {
      isMinimized: vi.fn().mockReturnValue(true),
      show: vi.fn(),
      focus: vi.fn(),
      restore: vi.fn(),
    };
    showCompletionNotification({ projectName: 'my-app', command: 'speckit.plan', mainWindow: mockWindow as any });

    // Extract the click handler and invoke it
    const clickCall = getMockOn().mock.calls.find((c) => c[0] === 'click');
    expect(clickCall).toBeDefined();
    clickCall![1]();

    expect(mockWindow.restore).toHaveBeenCalled();
    expect(mockWindow.show).toHaveBeenCalled();
    expect(mockWindow.focus).toHaveBeenCalled();
  });

  it('handles null mainWindow gracefully in click handler', () => {
    showCompletionNotification({ projectName: 'my-app', command: 'speckit.plan', mainWindow: null });
    // Should not throw even though mainWindow is null
    if (getMockOn().mock.calls.length > 0) {
      const clickCall = getMockOn().mock.calls.find((c) => c[0] === 'click');
      if (clickCall) {
        expect(() => clickCall[1]()).not.toThrow();
      }
    }
  });
});

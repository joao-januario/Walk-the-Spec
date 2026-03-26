import http from 'http';

export interface NotifyPayload {
  command: string;
  status: 'started' | 'completed';
  projectPath: string;
}

type NotifyHandler = (payload: NotifyPayload) => void;

const PORT = 3847;
let server: http.Server | null = null;

export function startNotifyServer(onNotify: NotifyHandler): void {
  server = http.createServer((req, res) => {
    // CORS for local use
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== 'POST' || req.url !== '/notify') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end('{"error":"not found"}');
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end('{"error":"payload too large"}');
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const parsed: unknown = JSON.parse(body);
        if (typeof parsed !== 'object' || parsed === null) throw new Error('invalid payload');

        const obj = parsed as Record<string, unknown>;
        if (typeof obj.command !== 'string') throw new Error('missing command');
        if (obj.status !== 'started' && obj.status !== 'completed') throw new Error('invalid status');
        if (typeof obj.projectPath !== 'string') throw new Error('missing projectPath');

        const payload: NotifyPayload = {
          command: obj.command,
          status: obj.status,
          projectPath: obj.projectPath,
        };

        console.log(`[notify-server] ${payload.status}: ${payload.command} (${payload.projectPath})`);
        onNotify(payload);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'unknown error';
        console.warn(`[notify-server] bad request: ${msg}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(`{"error":"${msg}"}`);
      }
    });
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[notify-server] listening on http://127.0.0.1:${PORT}/notify`);
  });

  server.on('error', (err) => {
    console.error('[notify-server] failed to start:', err);
  });
}

export function stopNotifyServer(): void {
  if (server) {
    server.removeAllListeners('error');
    server.close();
  }
  server = null;
}

export { PORT as NOTIFY_PORT };

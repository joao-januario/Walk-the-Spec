import pkg from 'electron-log';
const log = pkg;

// 20 MB max log file size, rotate to one backup
log.transports.file.maxSize = 20 * 1024 * 1024;
log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';

// Override console.log/warn/error so all existing console calls go to file
log.initialize();

export default log;

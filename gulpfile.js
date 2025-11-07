// gulpfile.js
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const os = require('os');
const qrcode = require('qrcode-terminal');

// --- Wi-Fi adaptör adı desenleri ---
const WIFI_PATTERNS = [
  /wi-?fi/i,
  /wireless/i,
  /wlan/i,
  /^wlp/i,
  /^wl/i,
  /^en0$/,
];

// --- LAN IP tespiti ---
function getLocalIP() {
  if (process.env.LOCAL_IP) return process.env.LOCAL_IP.trim();

  const nets = os.networkInterfaces();
  const addrs = [];
  for (const name in nets) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal)
        addrs.push({ name, address: net.address });
    }
  }
  if (!addrs.length) return '127.0.0.1';

  for (const pat of WIFI_PATTERNS) {
    const found = addrs.find(n => pat.test(n.name));
    if (found) return found.address;
  }
  return addrs[0].address;
}

// --- BrowserSync başlat ---
function serve(done) {
  const localIP = getLocalIP();

  browserSync.init({
    server: {
      baseDir: './',
      index: 'index.html'
    },
    host: localIP,
    port: 3000,
    open: true,
    notify: false,
    cors: true,
    https: true
  });

  const url = `https://${localIP}:3000`;
  console.log('\n====================================');
  console.log('🔥 Gulp Live Server running');
  console.log('------------------------------------');
  console.log(`Local:   https://localhost:3000`);
  console.log(`LAN:     ${url}`);
  console.log('------------------------------------');
  console.log('📱 QR kod ile tarayıp telefondan aç:');
  qrcode.generate(url, { small: true });
  console.log('====================================\n');

  done();
}

// --- Dosya izleme ---
function watchFiles() {
  gulp.watch('**/*.html').on('change', browserSync.reload);
  gulp.watch('css/**/*.css').on('change', browserSync.reload);
  gulp.watch('js/**/*.js').on('change', browserSync.reload);
}

// --- Ana görev ---
const dev = gulp.series(serve, watchFiles);
exports.dev = dev;
exports.default = dev;

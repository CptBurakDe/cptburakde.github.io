// ========================================
// GULP DEV SERVER - FULL VERSION
// No SCSS, No Minify — Just Live Reload
// LAN üzerinden erişilebilir
// ========================================

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const os = require('os');

// ----------------------------------------
// Bilgisayarın yerel IP adresini bulur
// ----------------------------------------
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // IPv4 adresi ve dahili (localhost) olmayanları filtrele
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  // Hiçbiri bulunamazsa localhost döndür
  return '127.0.0.1';
}

// ----------------------------------------
// BrowserSync başlat
// ----------------------------------------
function serve(done) {
  const localIP = getLocalIP();

  browserSync.init({
    server: {
      baseDir: './',        // Proje kök dizini
      index: 'index.html'   // Açılacak ana dosya
    },
    host: localIP,           // LAN IP (telefon erişimi için)
    port: 3000,              // Port (gerekirse değiştirilebilir)
    notify: false,           // Sağ üstteki BrowserSync bildirimi kapalı
    open: false,             // Tarayıcıyı otomatik açma
    cors: true,              // CORS açık (gerekirse)
  });

  console.log('\n========================================');
  console.log('  🔥 Gulp Live Server Çalışıyor!');
  console.log('----------------------------------------');
  console.log(`  💻 Local:   http://localhost:3000`);
  console.log(`  📱 LAN IP:  http://${localIP}:3000`);
  console.log('----------------------------------------');
  console.log('  Değişiklik yap → sayfa otomatik yenilenir');
  console.log('========================================\n');

  done();
}

// ----------------------------------------
// İzleme (HTML, CSS, JS)
// ----------------------------------------
function watchFiles() {
  gulp.watch('**/*.html').on('change', browserSync.reload);
  gulp.watch('css/**/*.css').on('change', browserSync.reload);
  gulp.watch('js/**/*.js').on('change', browserSync.reload);
}

// ----------------------------------------
// DEV Task
// (Sadece canlı yenileme, derleme yok)
// ----------------------------------------
const dev = gulp.series(
  serve,
  watchFiles
);

// ----------------------------------------
// Export (terminal komutları)
// ----------------------------------------
exports.dev = dev;
exports.default = dev;

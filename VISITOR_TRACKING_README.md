# Visitor Tracking System

Bu proje, web sitesi ziyaretçilerini takip etmek için bir JavaScript tabanlı sistem içerir.

## 🔒 Admin Dashboard Şifresi

Admin dashboard'a erişmek için şifre gereklidir. Varsayılan şifre:
- **Şifre**: `admin123`



## Özellikler

- ✅ Sayfa görüntüleme takibi
- ✅ Benzersiz ziyaretçi sayısı (IP bazlı)
- ✅ Cihaz bilgisi takibi (mobil, tablet, masaüstü)
- ✅ Tarayıcı bilgisi takibi
- ✅ Referrer (yönlendirme kaynağı) takibi
- ✅ Zaman damgası takibi
- ✅ Quiz sonuçları takibi (başarı oranı, IP, zaman)
- ✅ Quiz istatistikleri (ortalama skor, skor dağılımı)
- ✅ Admin dashboard ile istatistik görüntüleme
- ✅ Şifre korumalı admin dashboard

## Kullanım

### Otomatik Takip

Tracking sistemi, `visitor-tracking.js` dosyası yüklendiğinde otomatik olarak çalışır. Tüm sayfalarda:

```html
<script src="js/visitor-tracking.js"></script>
```

### Manuel Takip

Belirli bir sayfayı manuel olarak takip etmek için:

```javascript
VisitorTracking.track('/my-page');
```

## Admin Dashboard

İstatistikleri görüntülemek için admin dashboard'a erişin:

```
/admin/stats.html
```

veya tarayıcınızda:

```
https://your-domain.com/admin/stats.html
```

### Şifre Koruma

Admin dashboard şifre korumalıdır. Varsayılan şifre: `admin123`

### Dashboard Özellikleri

- 📊 Toplam sayfa görüntüleme sayısı
- 👥 Benzersiz ziyaretçi sayısı
- 🌐 Benzersiz IP adresi sayısı
- 📄 Sayfa bazlı görüntüleme istatistikleri
- 📱 Cihaz tipi istatistikleri
- 🌐 Tarayıcı istatistikleri
- 🔗 Referrer istatistikleri
- 📋 Son ziyaretçiler listesi
- 👥 Tüm ziyaretçiler listesi
- 📝 Quiz sonuçları ve istatistikleri
- 📊 Quiz başarı oranları
- 🎯 Quiz skor dağılımı
- 💯 Quiz bazlı ortalama skorlar

### Dashboard İşlemleri

- **Refresh**: İstatistikleri yenile
- **Export Data**: Tüm veriyi JSON formatında dışa aktar
- **Clear Data**: Tüm takip verilerini temizle (dikkatli kullanın!)

## Veri Depolama

Veriler tarayıcının `localStorage`'ında saklanır. Bu nedenle:
- Veriler sadece aynı tarayıcıda görülebilir
- Tarayıcı verilerini temizlerse, tüm takip verileri silinir
- Farklı cihazlardan erişim için backend API gereklidir

## IP Adresi Takibi

Sistem, ziyaretçi IP adreslerini şu şekilde takip eder:
1. Önce `api.ipify.org` API'sini kullanarak gerçek IP'yi almaya çalışır
2. API başarısız olursa, tarayıcı parmak izi (fingerprint) kullanır

## Yapılandırma

`js/visitor-tracking.js` dosyasındaki `CONFIG` objesini düzenleyerek takibi yapılandırabilirsiniz:

```javascript
const CONFIG = {
  STORAGE_KEY: 'visitor_tracking_data',
  SESSION_KEY: 'visitor_session',
  API_ENDPOINT: null, // Backend API endpoint (opsiyonel)
  TRACK_PAGES: true,
  TRACK_REFERRER: true,
  TRACK_DEVICE: true,
  TRACK_BROWSER: true,
  TRACK_LOCATION: false,
  DEBUG: false
};
```

## API Entegrasyonu

Backend API kullanmak istiyorsanız, `API_ENDPOINT` değerini ayarlayın:

```javascript
API_ENDPOINT: 'https://your-api.com/track'
```

API endpoint'i POST isteği beklemelidir ve aşağıdaki formatta veri almalıdır:

```json
{
  "ip": "123.45.67.89",
  "sessionId": "sess_1234567890_abc123",
  "page": "/index.html",
  "referrer": "https://google.com",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "device": {
    "type": "desktop",
    "userAgent": "...",
    "screen": { "width": 1920, "height": 1080 },
    "language": "en-US",
    "platform": "Win32"
  },
  "browser": "Chrome",
  "url": "https://your-domain.com/index.html"
}
```

## Sınırlamalar

1. **localStorage Sınırı**: Tarayıcı localStorage'ı genellikle 5-10MB ile sınırlıdır. Sistem otomatik olarak eski verileri temizler.

2. **Tarayıcı Bazlı**: Veriler sadece aynı tarayıcıda saklanır. Farklı tarayıcılarda görüntülenemez.

3. **IP Takibi**: Gerçek IP adresi API'den alınır. API erişilemezse, tarayıcı parmak izi kullanılır.

4. **Gizlilik**: Kullanıcıların tarayıcılarını temizlemesi durumunda veriler kaybolur.

## Güvenlik

- Admin dashboard şu anda herkese açıktır. Gizlilik için:
  - Dashboard'u password ile koruyun
  - `.htaccess` ile erişimi kısıtlayın
  - Backend authentication ekleyin

## Geliştirme

### Test Etme

1. Tarayıcı konsolunu açın
2. `VisitorTracking.getStats()` komutunu çalıştırın
3. İstatistikleri görüntüleyin

### Veri Temizleme

```javascript
VisitorTracking.clearData();
```

### Veri Dışa Aktarma

```javascript
const data = VisitorTracking.exportData();
console.log(JSON.stringify(data, null, 2));
```

## Sorun Giderme

### Veriler görünmüyor
- Tarayıcı konsolunda hata var mı kontrol edin
- localStorage'ın etkin olduğundan emin olun
- Sayfanın `visitor-tracking.js` dosyasını yüklediğinden emin olun

### IP adresi "unknown" görünüyor
- API erişilemiyor olabilir
- İnternet bağlantınızı kontrol edin
- API endpoint'inin çalıştığından emin olun

### Dashboard boş görünüyor
- Veri toplanmamış olabilir
- Sayfayı yenileyin
- Tarayıcı konsolunda hata var mı kontrol edin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Destek

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

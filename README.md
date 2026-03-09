# Unlimited Stacked Bar Chart - Looker Studio Community Visualization

Community Visualization untuk Looker Studio yang mendukung **unlimited series** dengan stacked bar chart menggunakan D3.js.

## 🎯 Fitur Utama

- ✅ **Unlimited Series**: Support 20, 50, 100+ series tanpa batasan
- ✅ **Toggle Orientation**: Bisa vertical atau horizontal
- ✅ **Auto Color Generation**: Generate warna otomatis untuk banyak series
- ✅ **Scrollable Legend**: Legend otomatis scrollable jika series terlalu banyak
- ✅ **Interactive Tooltips**: Tooltip detail per bar segment
- ✅ **Native Looker Studio Integration**: Semua fitur native Looker Studio (filter, drill-down)
- ✅ **Responsive**: Menyesuaikan dengan ukuran container

## 📁 File Structure

```
stacked-bar-viz/
├── manifest.json           # Looker Studio manifest
├── visualization.js        # Main visualization code (D3.js)
├── styles.css             # Styling
├── test.html              # Local testing file
└── README.md              # Documentation (this file)
```

## 🚀 Deployment Steps

### 1. Host Files

Upload semua file ke hosting yang support HTTPS. Pilihan:

#### Option A: GitHub Pages (Recommended - GRATIS)

```bash
# 1. Buat repository baru di GitHub
# 2. Upload semua file ke folder docs/
# 3. Enable GitHub Pages di Settings > Pages
# 4. Pilih source: main branch > /docs folder
# 5. URL akan jadi: https://YOUR_USERNAME.github.io/YOUR_REPO/
```

#### Option B: Google Cloud Storage

```bash
# 1. Buat bucket di GCS
gsutil mb gs://your-bucket-name

# 2. Set public access
gsutil iam ch allUsers:objectViewer gs://your-bucket-name

# 3. Upload files
gsutil -h "Cache-Control:public, max-age=3600" cp -r * gs://your-bucket-name/

# 4. Enable CORS
echo '[{"origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600}]' > cors.json
gsutil cors set cors.json gs://your-bucket-name
```

#### Option C: CDN/Hosting Lainnya

- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront

### 2. Update manifest.json

Setelah hosting, update URL di `manifest.json`:

```json
{
  "packageUrl": "https://YOUR_HOSTING_URL/visualization.js",
  "components": [
    {
      "resource": {
        "js": "https://YOUR_HOSTING_URL/visualization.js",
        "config": "https://YOUR_HOSTING_URL/visualization.js",
        "css": "https://YOUR_HOSTING_URL/styles.css"
      }
    }
  ]
}
```

### 3. Test Locally (Optional)

Sebelum deploy, test dulu secara lokal:

```bash
# Buka test.html di browser
# atau gunakan local server
python3 -m http.server 8000
# Buka http://localhost:8000/test.html
```

### 4. Add to Looker Studio

Ada 2 cara:

#### Cara 1: Developer Mode (untuk testing)

1. Buka Looker Studio report
2. Tambah chart → Community visualization
3. Klik "Build your own visualization"
4. Paste URL manifest: `https://YOUR_HOSTING_URL/manifest.json`
5. Klik "Submit"

#### Cara 2: Component ID (setelah approved)

1. Submit visualization ke Google untuk review
2. Tunggu approval (bisa 1-2 minggu)
3. Dapat Component ID
4. User bisa add via Component ID langsung

## ⚙️ Configuration Options

### Data Mapping

- **Dimension** (Category): 1 field - nama kategori/bar
- **Metrics** (Values): 1-1000 fields - setiap metric jadi 1 series di stacked bar

### Style Options

#### Orientation

- **Vertical**: Bar naik ke atas (default)
- **Horizontal**: Bar ke samping

#### Colors

- **Auto**: Generate warna otomatis
- **Custom**: (untuk development masa depan)

#### Axes

- **Show Axis Labels**: Toggle on/off
- **Axis Label Font Size**: Ukuran font label

#### Legend

- **Show Legend**: Toggle on/off
- **Legend Position**: Right / Bottom / Top
- **Legend Max Height**: Maksimal tinggi legend (px) - akan scroll jika melebihi

#### Chart

- **Bar Padding**: Jarak antar bar (0-0.5)
- **Show Values on Bars**: (untuk development masa depan)

## 📊 Data Requirements

Minimum data structure:

```
Category | Metric 1 | Metric 2 | Metric 3 | ... | Metric N
---------|----------|----------|----------|-----|----------
Cat A    | 100      | 150      | 80       | ... | 120
Cat B    | 120      | 160      | 95       | ... | 110
Cat C    | 140      | 180      | 110      | ... | 130
```

## 🎨 Color Generation

Untuk unlimited series, library otomatis generate warna:

- **1-15 series**: Warna predefined yang optimal
- **16+ series**: Generate via HSL dengan hue rotation
- Semua warna dijamin kontras dan mudah dibedakan

## 🐛 Troubleshooting

### Chart tidak muncul

- Cek console browser untuk error
- Pastikan D3.js dan dscc library loaded
- Verify URL hosting accessible via HTTPS

### Legend terpotong

- Increase "Legend Max Height" di style settings
- Atau ubah position ke "bottom"

### Warna series tidak jelas

- Dengan 50+ series, warna mulai mirip
- Consider filtering data atau grouping series

### Performance lambat

- Limit kategori (bars) maks 100
- Jika series sangat banyak (200+), consider agregasi

## 🔧 Customization

Edit `visualization.js` untuk:

- Custom color schemes
- Different tooltip formats
- Add animations
- Custom interactions

## 📝 Notes

- Tested dengan up to 100 series
- Performance optimal: < 50 series, < 100 categories
- Compatible dengan semua Looker Studio features (filter, drill-down, date range)
- Mobile responsive

## 📄 License

Free to use and modify.

## 🤝 Support

Jika ada issue atau pertanyaan, silakan contact developer atau buat issue di repository.

---

**Version**: 1.0.0  
**Last Updated**: 2026-03-09  
**D3.js Version**: v7  
**Looker Studio API**: Community Visualization v1

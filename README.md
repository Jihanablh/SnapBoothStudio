# SnapBooth Studio 🎭

**Studio Photobooth Rental & Self Photo Experience**

Sistem informasi penyewaan studio photobooth berbasis web dengan stack full-stack modern. Siap deploy di AWS EC2 Learning Lab.

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat
- Node.js v18+
- npm v9+

### Step 1 — Jalankan Backend API

Buka **Terminal 1**:

```powershell
cd backend
npm install    # hanya pertama kali
npm run dev
```

Backend berjalan di: **http://localhost:4000**

Cek backend: buka http://localhost:4000/api/health di browser → harus muncul `{"success":true}`

### Step 2 — Jalankan Frontend

Buka **Terminal 2** (JANGAN tutup terminal backend):

```powershell
npm install    # hanya pertama kali
npm run dev
```

Frontend berjalan di: **http://localhost:8080**

---

## 🔐 Akun Demo

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@snapbooth.com      | admin123  |
| User  | user@snapbooth.com       | user123   |

---

## 🌐 Endpoint API

| Method | URL                              | Deskripsi                |
|--------|----------------------------------|--------------------------|
| GET    | /api/health                      | Health check             |
| POST   | /api/auth/login                  | Login                    |
| POST   | /api/auth/register               | Register (role: user)    |
| GET    | /api/auth/me                     | Get current user         |
| GET    | /api/studios                     | List studios             |
| GET    | /api/packages                    | List paket               |
| GET    | /api/frames                      | List frame               |
| GET    | /api/bookings                    | List booking (auth)      |
| POST   | /api/bookings                    | Buat booking             |
| GET    | /api/dashboard/stats             | Stats admin (admin only) |
| GET    | /api/dashboard/activities        | Aktivitas (admin only)   |
| GET    | /api/export/bookings/csv         | Export CSV (admin only)  |
| GET    | /api/export/bookings/xlsx        | Export XLSX (admin only) |

---

## 🧪 Test via PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:4000/api/health"

# Login admin
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
  -Method Post -ContentType "application/json" `
  -Body '{"email":"admin@snapbooth.com","password":"admin123"}'

# Register user baru
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
  -Method Post -ContentType "application/json" `
  -Body '{"name":"Test User","email":"testuser@snapbooth.com","password":"SnapUser123!"}'
```

---

## 🛠️ Troubleshooting

### ❌ "Server tidak terhubung"

1. Pastikan backend sudah berjalan: `cd backend && npm run dev`
2. Cek health: http://localhost:4000/api/health
3. Pastikan tidak ada error di terminal backend
4. Pastikan file `backend/.env` ada dengan isi:
   ```env
   PORT=4000
   JWT_SECRET=snapbooth_secret_key_2024
   DATABASE_PATH=./src/database/snapbooth.db
   CLIENT_URL=http://localhost:8080
   NODE_ENV=development
   ```

### ❌ "Endpoint tidak ditemukan"

- Pastikan `VITE_API_URL=http://localhost:4000/api` di file `.env` (root frontend)
- Jangan ada `/api` ganda: URL tidak boleh menjadi `http://localhost:4000/api/api/...`

### ❌ Database locked

Hapus file lock lalu restart:
```powershell
Remove-Item "backend/src/database/snapbooth.db.lock" -Recurse -Force -ErrorAction SilentlyContinue
```

### ❌ CORS Error di browser

Backend sudah mengizinkan semua origin `localhost`. Pastikan frontend berjalan di localhost (bukan IP lain).

---

## 📁 Struktur Project

```
photobooth/
├── .env                      # VITE_API_URL=http://localhost:4000/api
├── src/
│   ├── routes/               # Halaman (TanStack Router)
│   │   ├── index.tsx         # Beranda
│   │   ├── login.tsx         # Login & Register
│   │   ├── booking.tsx       # Booking Studio
│   │   ├── kamera.tsx        # Camera Photobooth
│   │   ├── admin.tsx         # Layout Admin
│   │   └── admin.index.tsx   # Dashboard Admin
│   ├── components/           # Komponen reusable
│   │   ├── photo-booth-camera.tsx  # Kamera portrait 3:4
│   │   └── frame-canvas.tsx        # Frame dinamis
│   ├── lib/
│   │   └── auth-store.ts     # Auth state management
│   └── services/
│       └── api.ts            # API service (fetch wrapper)
└── backend/
    ├── .env                  # PORT, JWT_SECRET, DATABASE_PATH
    └── src/
        ├── server.ts         # Express app entry
        ├── routes/           # Route handlers
        ├── controllers/      # Business logic
        ├── middleware/        # Auth, role, error
        └── database/         # SQLite + seed data
```

---

## ☁️ Deploy ke AWS EC2

```bash
# 1. Update & install Node.js
sudo apt update && sudo apt install -y nodejs npm

# 2. Install PM2 & Nginx
sudo npm install -g pm2
sudo apt install -y nginx

# 3. Clone & install
git clone <repo-url> /home/ubuntu/photobooth
cd /home/ubuntu/photobooth
npm install && cd backend && npm install && cd ..

# 4. Build frontend
npm run build

# 5. Start backend dengan PM2
cd backend
pm2 start npm --name "snapbooth-api" -- run start
pm2 save

# 6. Konfigurasi Nginx
sudo nano /etc/nginx/sites-available/snapbooth
# (lihat nginx.conf di bawah)

# 7. Test Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Nginx config (`/etc/nginx/sites-available/snapbooth`):

```nginx
server {
    listen 80;
    server_name your-ec2-public-ip;

    # Frontend (static build)
    root /home/ubuntu/photobooth/.output/public;
    index index.html;

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> **Catatan AWS**: Ubah `VITE_API_URL=/api` di `.env` sebelum build untuk deployment (tidak perlu port 4000 karena Nginx proxy).

---

## 🎯 Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React + TypeScript      |
| Router    | TanStack Start/Router   |
| Styling   | Tailwind CSS v4         |
| Backend   | Node.js + Express       |
| Database  | SQLite (node-sqlite3-wasm) |
| Auth      | JWT + bcrypt            |
| Export    | CSV + XLSX              |
| Deploy    | AWS EC2 + Nginx + PM2   |

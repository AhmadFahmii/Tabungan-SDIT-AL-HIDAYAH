const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const app = express();
const port = 5000;
const JWT_SECRET = 'rahasia_dapur_sdit_alhidayah_2025'; // Kunci rahasia (Bisa diganti apa saja)

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE: Cek Token (Satpam) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Format header: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) return res.status(401).json({ message: "Akses Ditolak: Token tidak ada!" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid!" });
    req.user = user; // Simpan data user di request
    next(); // Lanjut ke fungsi berikutnya
  });
};

// --- 1. Cek Server (Public) ---
app.get('/', (req, res) => {
  res.send('Server Backend SDIT AL-HIDAYAH Berjalan Lancar!');
});

// --- 2. API LOGIN (Public - Menghasilkan Token) ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username/NIS dan Password wajib diisi!" });
  }

  // Cek Admin
  const sqlAdmin = "SELECT * FROM admin WHERE username = ?";
  db.query(sqlAdmin, [username], async (err, resultAdmin) => {
    if (err) return res.status(500).json(err);
    
    if (resultAdmin.length > 0) {
      const user = resultAdmin[0];
      // Cek Password (Admin masih plain text di tutorial ini, idealnya di-hash)
      if (user.password === password) { 
         // BUAT TOKEN ADMIN
         const token = jwt.sign({ id: user.id, role: 'admin', nama: user.nama_lengkap }, JWT_SECRET, { expiresIn: '24h' });
         return res.json({ success: true, token, role: 'admin', user: { id: user.id, nama: user.nama_lengkap } });
      }
    } 
    
    // Cek Siswa
    const sqlSiswa = "SELECT * FROM siswa WHERE nis = ?";
    db.query(sqlSiswa, [username], async (err, resultSiswa) => {
      if (err) return res.status(500).json(err);

      if (resultSiswa.length > 0) {
        const user = resultSiswa[0];
        
        const isHashMatch = await bcrypt.compare(password, user.password);
        const isPlainMatch = user.password === password;
        
        if (isHashMatch || isPlainMatch) {
            // BUAT TOKEN SISWA
            const token = jwt.sign({ id: user.id, role: 'siswa', nama: user.nama, nis: user.nis }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({ success: true, token, role: 'siswa', user: { id: user.id, nama: user.nama, nis: user.nis } });
        }
      } 
      
      return res.status(401).json({ message: "Username/NIS atau Password salah!" });
    });
  });
});

// ============================================
//  AREA TERPROTEKSI (Wajib Pakai Token)
// ============================================

// API Profil Siswa
app.get('/api/siswa/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM siswa WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    return res.json(result[0]);
  });
});

// API Saldo
app.get('/api/saldo/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.query("SELECT saldo FROM siswa WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json(result[0]);
  });
});

// API Riwayat Transaksi
app.get('/api/transaksi/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM transaksi WHERE siswa_id = ? ORDER BY tanggal DESC";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json(result);
  });
});

// ADMIN: Ambil Semua Siswa
app.get('/api/admin/students', authenticateToken, (req, res) => {
  const sql = "SELECT id, nis, nama, jenis_kelamin, kelas, saldo, no_hp, alamat FROM siswa ORDER BY nama ASC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json(result);
  });
});

// ADMIN: Ambil Daftar Kelas
app.get('/api/admin/kelas', authenticateToken, (req, res) => {
  const sql = "SELECT * FROM data_kelas ORDER BY tingkat ASC, nama_kelas ASC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json(result);
  });
});

// ADMIN: Input Transaksi
app.post('/api/admin/transaksi', authenticateToken, (req, res) => {
  const { siswa_id, tipe, jumlah, keterangan, tanggal } = req.body;
  // ... (Validasi sama seperti sebelumnya) ...
  if (!siswa_id || !tipe || !jumlah || !tanggal) return res.status(400).json({ message: "Data tidak lengkap" });

  const sqlInsert = "INSERT INTO transaksi (siswa_id, tipe, jumlah, keterangan, tanggal) VALUES (?, ?, ?, ?, ?)";
  db.query(sqlInsert, [siswa_id, tipe, jumlah, keterangan, tanggal], (err, result) => {
    if (err) return res.status(500).json(err);

    let sqlUpdateSaldo = tipe === 'masuk' 
      ? "UPDATE siswa SET saldo = saldo + ? WHERE id = ?" 
      : "UPDATE siswa SET saldo = saldo - ? WHERE id = ?";

    db.query(sqlUpdateSaldo, [jumlah, siswa_id], (errUpdate, resUpdate) => {
      if (errUpdate) return res.status(500).json(errUpdate);
      return res.json({ message: "Transaksi Berhasil Disimpan!" });
    });
  });
});

// ADMIN: Tambah Siswa
app.post('/api/admin/students', authenticateToken, async (req, res) => {
  const { nis, nama, jenis_kelamin, kelas, no_hp, alamat, password } = req.body;
  const plainPassword = password || '123456'; 
  const jk = jenis_kelamin || 'L';

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const sql = "INSERT INTO siswa (nis, nama, jenis_kelamin, kelas, no_hp, alamat, password, saldo) VALUES (?, ?, ?, ?, ?, ?, ?, 0)";
    
    db.query(sql, [nis, nama, jk, kelas, no_hp, alamat, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "NIS sudah terdaftar!" });
        return res.status(500).json(err);
      }
      return res.json({ message: "Siswa berhasil ditambahkan!" });
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal enkripsi" });
  }
});

// ADMIN: Update Siswa
app.put('/api/admin/students/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { nis, nama, jenis_kelamin, kelas, no_hp, alamat } = req.body;
  const sql = "UPDATE siswa SET nis = ?, nama = ?, jenis_kelamin = ?, kelas = ?, no_hp = ?, alamat = ? WHERE id = ?";

  db.query(sql, [nis, nama, jenis_kelamin, kelas, no_hp, alamat, id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "NIS sudah dipakai!" });
      return res.status(500).json(err);
    }
    return res.json({ message: "Data siswa berhasil diupdate!" });
  });
});

// ADMIN: Laporan
app.get('/api/admin/laporan', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT t.id, t.tipe, t.jumlah, t.tanggal, s.nama, s.kelas, s.nis
    FROM transaksi t
    JOIN siswa s ON t.siswa_id = s.id
    WHERE DATE(t.tanggal) BETWEEN ? AND ?
    ORDER BY t.tanggal DESC
  `;
  db.query(sql, [startDate, endDate], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json(result);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
});
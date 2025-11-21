const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;
const JWT_SECRET = 'rahasia_dapur_sdit_alhidayah_2025'; 

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE AUTH (Pengecekan Token) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ message: "Akses Ditolak" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token Invalid" });
    req.user = user;
    next();
  });
};

// --- 1. Cek Server ---
app.get('/', (req, res) => {
  res.send('Server Backend SDIT AL-HIDAYAH Berjalan Lancar!');
});

// --- 2. API LOGIN (Siswa & Admin) ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Lengkapi data!" });

  // A. Cek di Tabel Admin
  const sqlAdmin = "SELECT * FROM admin WHERE username = ?";
  db.query(sqlAdmin, [username], async (err, resultAdmin) => {
    if (err) return res.status(500).json(err);
    
    if (resultAdmin.length > 0) {
       const user = resultAdmin[0];
       // Cek Password (Support Plain text atau Hash)
       const isMatch = await bcrypt.compare(password, user.password) || user.password === password;
       
       if (isMatch) {
          const token = jwt.sign({ id: user.id, role: 'admin', nama: user.nama_lengkap }, JWT_SECRET, { expiresIn: '24h' });
          return res.json({ 
            success: true, 
            token, 
            role: 'admin', 
            user: { id: user.id, nama: user.nama_lengkap } 
          });
       }
    }
    
    // B. Cek di Tabel Siswa
    const sqlSiswa = "SELECT * FROM siswa WHERE nis = ?";
    db.query(sqlSiswa, [username], async (errS, resultS) => {
       if (errS) return res.status(500).json(errS);
       
       if (resultS.length > 0) {
          const user = resultS[0];
          const isMatch = await bcrypt.compare(password, user.password) || user.password === password;
          
          if (isMatch) {
             const token = jwt.sign({ id: user.id, role: 'siswa', nama: user.nama, nis: user.nis }, JWT_SECRET, { expiresIn: '24h' });
             return res.json({ 
                success: true, 
                token, 
                role: 'siswa', 
                user: { 
                    id: user.id, 
                    nama: user.nama, 
                    nis: user.nis,
                    jenis_kelamin: user.jenis_kelamin // Penting untuk foto profil
                } 
             });
          }
       }
       return res.status(401).json({ message: "Username/NIS atau Password salah!" });
    });
  });
});

// --- API SISWA (Protected) ---

// Data Profil Siswa
app.get('/api/siswa/:id', authenticateToken, (req, res) => {
  db.query("SELECT * FROM siswa WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json(result[0]);
  });
});

// Saldo Siswa
app.get('/api/saldo/:id', authenticateToken, (req, res) => {
  db.query("SELECT saldo FROM siswa WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// Riwayat Transaksi Siswa
app.get('/api/transaksi/:id', authenticateToken, (req, res) => {
  db.query("SELECT * FROM transaksi WHERE siswa_id = ? ORDER BY tanggal DESC", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// --- API ADMIN (Protected) ---

// List Semua Siswa
app.get('/api/admin/students', authenticateToken, (req, res) => {
  db.query("SELECT id, nis, nama, jenis_kelamin, kelas, saldo, no_hp, alamat FROM siswa ORDER BY nama ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// List Data Kelas
app.get('/api/admin/kelas', authenticateToken, (req, res) => {
  db.query("SELECT * FROM data_kelas ORDER BY tingkat ASC, nama_kelas ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Input Transaksi (Setor/Tarik) + Update Saldo
app.post('/api/admin/transaksi', authenticateToken, (req, res) => {
  const { siswa_id, tipe, jumlah, keterangan, tanggal } = req.body;
  
  if (!siswa_id || !tipe || !jumlah || !tanggal) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const sql = "INSERT INTO transaksi (siswa_id, tipe, jumlah, keterangan, tanggal) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [siswa_id, tipe, jumlah, keterangan, tanggal], (err, result) => {
    if (err) return res.status(500).json(err);
    
    const sqlUpdate = tipe === 'masuk' ? 
      "UPDATE siswa SET saldo = saldo + ? WHERE id = ?" : 
      "UPDATE siswa SET saldo = saldo - ? WHERE id = ?";
      
    db.query(sqlUpdate, [jumlah, siswa_id], (errUp) => {
       if (errUp) return res.status(500).json(errUp);
       res.json({ message: "Transaksi Berhasil Disimpan!" });
    });
  });
});

// Tambah Siswa Baru
app.post('/api/admin/students', authenticateToken, async (req, res) => {
  const { nis, nama, jenis_kelamin, kelas, no_hp, alamat, password } = req.body;
  const plainPassword = password || '123456';
  const jk = jenis_kelamin || 'L';
  
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const sql = "INSERT INTO siswa (nis, nama, jenis_kelamin, kelas, no_hp, alamat, password, saldo) VALUES (?, ?, ?, ?, ?, ?, ?, 0)";
    db.query(sql, [nis, nama, jk, kelas, no_hp, alamat, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "NIS sudah terdaftar" });
            return res.status(500).json(err);
        }
        res.json({ message: "Siswa berhasil ditambahkan" });
    });
  } catch (error) {
      res.status(500).json({ message: "Error hashing password" });
  }
});

// Update Data Siswa
app.put('/api/admin/students/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { nis, nama, jenis_kelamin, kelas, no_hp, alamat, password } = req.body;
  
  try {
    let sql, params;
    if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = "UPDATE siswa SET nis = ?, nama = ?, jenis_kelamin = ?, kelas = ?, no_hp = ?, alamat = ?, password = ? WHERE id = ?";
        params = [nis, nama, jenis_kelamin, kelas, no_hp, alamat, hashedPassword, id];
    } else {
        sql = "UPDATE siswa SET nis = ?, nama = ?, jenis_kelamin = ?, kelas = ?, no_hp = ?, alamat = ? WHERE id = ?";
        params = [nis, nama, jenis_kelamin, kelas, no_hp, alamat, id];
    }
    
    db.query(sql, params, (err, result) => {
        if (err) {
           if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "NIS sudah digunakan!" }); 
           return res.status(500).json(err);
        }
        res.json({ message: "Data siswa berhasil diupdate" });
    });
  } catch (error) {
      res.status(500).json({ message: "Error updating student" });
  }
});

// Laporan Keuangan
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
    res.json(result);
  });
});

// Manajemen Akun Admin
app.get('/api/admin/accounts', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
    db.query("SELECT id, username, nama_lengkap, created_at FROM admin ORDER BY nama_lengkap ASC", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.post('/api/admin/accounts', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
    const { username, password, nama_lengkap } = req.body;
    const sql = "INSERT INTO admin (username, password, nama_lengkap) VALUES (?, ?, ?)";
    db.query(sql, [username, password, nama_lengkap], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Admin added" });
    });
});

app.delete('/api/admin/accounts/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ message: "Cannot delete self" });
    db.query("DELETE FROM admin WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Admin deleted" });
    });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
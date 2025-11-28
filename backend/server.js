const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'rahasia_akses_sdit_2025'; 
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'rahasia_refresh_sdit_super_secure';

app.use(cors());
app.use(express.json());

// --- Middleware Auth ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ message: "Akses Ditolak" });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token Invalid" });
    req.user = user;
    next();
  });
};

// Helper Tokens
const generateAccessToken = (user) => {
  return jwt.sign({ 
    id: user.id, 
    role: user.role, 
    nama: user.nama 
  }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ 
    id: user.id, 
    role: user.role, 
    nama: user.nama 
  }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

app.get('/', (req, res) => res.send('Server Ready!'));

// --- 1. LOGIN (Generate 2 Tokens) ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Lengkapi data!" });

  const sqlAdmin = "SELECT * FROM admin WHERE username = ?";
  db.query(sqlAdmin, [username], async (err, resultAdmin) => {
    if (err) return res.status(500).json(err);
    
    let user = null;
    let role = '';

    if (resultAdmin.length > 0) {
       const u = resultAdmin[0];
       const isMatch = await bcrypt.compare(password, u.password) || u.password === password;
       if (isMatch) { 
         user = u; 
         role = 'admin'; 
       }
    } 
    
    if (!user) {
        const sqlSiswa = "SELECT * FROM siswa WHERE nis = ?";
        db.query(sqlSiswa, [username], async (errS, resultS) => {
           if (errS) return res.status(500).json(errS);
           if (resultS.length > 0) {
              const u = resultS[0];
              const isMatch = await bcrypt.compare(password, u.password) || u.password === password;
              if (isMatch) { 
                user = u; 
                role = 'siswa'; 
              }
           }
           
           if (!user) return res.status(401).json({ message: "Login Gagal" });

           // PERBAIKAN: Standardisasi userData
           const userData = { 
             id: user.id, 
             role, 
             nama: user.nama, // siswa menggunakan field 'nama'
             nis: user.nis 
           };
           
           const accessToken = generateAccessToken(userData);
           const refreshToken = generateRefreshToken(userData);

           // Simpan Refresh Token ke DB
           db.query("INSERT INTO refresh_tokens (token, user_id) VALUES (?, ?)", 
             [refreshToken, user.id], (errT) => {
               if (errT) console.error("Gagal simpan token:", errT);
               res.json({ 
                 success: true, 
                 accessToken, 
                 refreshToken, 
                 role, 
                 user: userData 
               });
           });
        });
    } else {
        // PERBAIKAN: Standardisasi userData untuk admin
        const userData = { 
          id: user.id, 
          role, 
          nama: user.nama_lengkap // admin menggunakan 'nama_lengkap'
        };
        
        const accessToken = generateAccessToken(userData);
        const refreshToken = generateRefreshToken(userData);

        db.query("INSERT INTO refresh_tokens (token, user_id) VALUES (?, ?)", 
          [refreshToken, user.id], (errT) => {
            if (errT) console.error("Gagal simpan token:", errT);
            res.json({ 
              success: true, 
              accessToken, 
              refreshToken, 
              role, 
              user: userData 
            });
        });
    }
  });
});

// --- 2. REFRESH TOKEN (PERBAIKAN) ---
app.post('/api/refresh-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  // Cek di Database apakah Refresh Token valid
  db.query("SELECT * FROM refresh_tokens WHERE token = ?", [token], (err, result) => {
      if (err) {
        console.error("DB Error saat cek refresh token:", err);
        return res.sendStatus(500);
      }
      
      if (result.length === 0) {
        console.warn("Refresh token tidak ditemukan di database");
        return res.sendStatus(403);
      }

      jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
          if (err) {
            console.error("JWT Verify Error:", err);
            return res.sendStatus(403);
          }
          
          // Generate access token baru dengan data yang sama
          const userData = { 
            id: user.id, 
            role: user.role, 
            nama: user.nama 
          };
          
          const accessToken = generateAccessToken(userData);
          console.log("✅ Access token berhasil di-refresh untuk user:", user.nama);
          res.json({ accessToken });
      });
  });
});

// --- 3. LOGOUT ---
app.post('/api/logout', (req, res) => {
    const { token } = req.body;
    db.query("DELETE FROM refresh_tokens WHERE token = ?", [token], (err) => {
        if(err) return res.status(500).json(err);
        res.sendStatus(204);
    });
});

// --- API DATA SISWA & ADMIN ---
app.get('/api/siswa/:id', authenticateToken, (req, res) => {
  db.query("SELECT * FROM siswa WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

app.get('/api/saldo/:id', authenticateToken, (req, res) => {
  db.query("SELECT saldo, target_tabungan FROM siswa WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

app.put('/api/siswa/:id/target', authenticateToken, (req, res) => {
    const { target } = req.body;
    db.query("UPDATE siswa SET target_tabungan = ? WHERE id = ?", [target, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Target updated" });
    });
});

app.get('/api/transaksi/:id', authenticateToken, (req, res) => {
  db.query("SELECT * FROM transaksi WHERE siswa_id = ? ORDER BY tanggal DESC", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get('/api/admin/students', authenticateToken, (req, res) => {
  db.query("SELECT * FROM siswa ORDER BY nama ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get('/api/admin/kelas', authenticateToken, (req, res) => {
  db.query("SELECT * FROM data_kelas ORDER BY tingkat ASC, nama_kelas ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/admin/transaksi', authenticateToken, (req, res) => {
  const { siswa_id, tipe, jumlah, keterangan, tanggal } = req.body;
  const sql = "INSERT INTO transaksi (siswa_id, tipe, jumlah, keterangan, tanggal) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [siswa_id, tipe, jumlah, keterangan, tanggal], (err, result) => {
    if (err) return res.status(500).json(err);
    const sqlUpdate = tipe === 'masuk' ? "UPDATE siswa SET saldo = saldo + ? WHERE id = ?" : "UPDATE siswa SET saldo = saldo - ? WHERE id = ?";
    db.query(sqlUpdate, [jumlah, siswa_id], (errUp) => {
       if (errUp) return res.status(500).json(errUp);
       res.json({ message: "Transaksi Berhasil" });
    });
  });
});

app.post('/api/admin/students', authenticateToken, async (req, res) => {
    const { nis, nama, jenis_kelamin, kelas, no_hp, alamat, password } = req.body;
    const pass = password || '123456';
    try {
        const hash = await bcrypt.hash(pass, 10);
        db.query("INSERT INTO siswa (nis, nama, jenis_kelamin, kelas, no_hp, alamat, password, saldo) VALUES (?, ?, ?, ?, ?, ?, ?, 0)", 
        [nis, nama, jenis_kelamin || 'L', kelas, no_hp, alamat, hash], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Siswa added" });
        });
    } catch(e) { res.status(500).json(e); }
});

app.put('/api/admin/students/:id', authenticateToken, async (req, res) => {
    const { nis, nama, jenis_kelamin, kelas, no_hp, alamat, password } = req.body;
    try {
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            db.query("UPDATE siswa SET nis=?, nama=?, jenis_kelamin=?, kelas=?, no_hp=?, alamat=?, password=? WHERE id=?", 
            [nis, nama, jenis_kelamin, kelas, no_hp, alamat, hash, req.params.id], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Updated" });
            });
        } else {
            db.query("UPDATE siswa SET nis=?, nama=?, jenis_kelamin=?, kelas=?, no_hp=?, alamat=? WHERE id=?", 
            [nis, nama, jenis_kelamin, kelas, no_hp, alamat, req.params.id], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Updated" });
            });
        }
    } catch(e) { res.status(500).json(e); }
});

app.delete('/api/admin/students/:id', authenticateToken, (req, res) => {
    db.query("DELETE FROM transaksi WHERE siswa_id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        db.query("DELETE FROM siswa WHERE id = ?", [req.params.id], (errS) => {
            if (errS) return res.status(500).json(errS);
            res.json({ message: "Deleted" });
        });
    });
});

app.get('/api/admin/laporan', authenticateToken, (req, res) => {
    const { startDate, endDate } = req.query;
    db.query(`SELECT t.*, s.nama, s.kelas, s.nis FROM transaksi t JOIN siswa s ON t.siswa_id = s.id WHERE DATE(t.tanggal) BETWEEN ? AND ? ORDER BY t.tanggal DESC`, 
    [startDate, endDate], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

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
    db.query("INSERT INTO admin (username, password, nama_lengkap) VALUES (?, ?, ?)", [username, password, nama_lengkap], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Admin added" });
    });
});

app.delete('/api/admin/accounts/:id', authenticateToken, (req, res) => {
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({message: "Cannot delete self"});
    db.query("DELETE FROM admin WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Admin deleted" });
    });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
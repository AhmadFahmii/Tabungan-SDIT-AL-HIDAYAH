const mysql = require('mysql2');

// Konfigurasi koneksi ke database XAMPP
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Default user XAMPP
  password: '',      // Default password XAMPP (kosong)
  database: 'db_tabungan_sdit' // Nama database yang baru kita buat
});

// Cek koneksi
db.connect((err) => {
  if (err) {
    console.error('❌ Gagal Konek ke Database:', err.message);
  } else {
    console.log('✅ Berhasil Terhubung ke Database MySQL!');
  }
});

module.exports = db;
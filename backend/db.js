const mysql = require('mysql2');
require('dotenv').config();

// Konfigurasi Database
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_tabungan_sdit',
  port: process.env.DB_PORT || 3306,
  // TAMBAHAN WAJIB UNTUK AZURE:
  ssl: {
    rejectUnauthorized: false
  }
});

// Test Koneksi
db.connect((err) => {
  if (err) {
    console.error('❌ Gagal Konek ke Database:', err.message);
    console.error('📝 Cek konfigurasi di file .env / App Settings Azure:');
    console.error(`   DB_HOST: ${process.env.DB_HOST}`);
    console.error(`   DB_USER: ${process.env.DB_USER}`);
    process.exit(1);
  }
  console.log('✅ Berhasil Terhubung ke Database MySQL!');
});

module.exports = db;
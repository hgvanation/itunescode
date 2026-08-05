require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 1. Khởi tạo Kết nối PostgreSQL (Supabase)
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Khởi tạo bảng dữ liệu trên Cloud
// Khởi tạo bảng dữ liệu trên Supabase PostgreSQL
const initDb = async () => {
  try {
    // 1. Tạo các bảng nếu chưa có
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'AVAILABLE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS redemptions (
        id SERIAL PRIMARY KEY,
        code_id INTEGER UNIQUE NOT NULL REFERENCES codes(id),
        recipient_identifier VARCHAR(255) UNIQUE NOT NULL,
        claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tạo tài khoản Admin mặc định
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    const hash = bcrypt.hashSync(adminPassword, 10);

    await pool.query(
      `INSERT INTO admins (username, password_hash) 
       VALUES ($1, $2) 
       ON CONFLICT (username) DO NOTHING`,
      [adminUsername, hash]
    );

    console.log(`[INIT] Khởi tạo hệ thống & Admin tài khoản: ${adminUsername}`);
  } catch (err) {
    console.error('[DATABASE INIT ERROR]:', err);
  }
};

initDb();

// Helper kiểm tra Email / Threads
function isValidIdentifier(input) {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const threadsRegex = /^@?[a-zA-Z0-9._]{1,30}$/;
  return emailRegex.test(trimmed) || threadsRegex.test(trimmed);
}

// Middleware xác thực Admin JWT
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Yêu cầu Token xác thực!' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, admin) => {
    if (err) return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    req.admin = admin;
    next();
  });
}

// ==========================================
// 2. PUBLIC APIs
// ==========================================

// Khách nhận mã iTunes
app.post('/api/v1/claim-code', async (req, res) => {
  const { identifier } = req.body;

  if (!identifier || !isValidIdentifier(identifier)) {
    return res.status(400).json({
      success: false,
      message: 'Thông tin nhập không hợp lệ! Vui lòng nhập đúng Email hoặc Threads Username.'
    });
  }

  const cleanIdentifier = identifier.trim();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Kiểm tra xem người dùng đã từng lấy mã chưa
    const existingClaim = await client.query(
      `SELECT c.code FROM redemptions r JOIN codes c ON r.code_id = c.id WHERE r.recipient_identifier = $1`,
      [cleanIdentifier]
    );

    if (existingClaim.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Bạn đã nhận mã trước đó rồi!',
        code: existingClaim.rows[0].code
      });
    }

    // 2. Lấy 1 mã chưa dùng
    const availableCode = await client.query(
      `SELECT * FROM codes WHERE status = 'AVAILABLE' LIMIT 1 FOR UPDATE`
    );

    if (availableCode.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Rất tiếc, kho mã hiện tại đã hết!'
      });
    }

    const codeObj = availableCode.rows[0];

    // 3. Cập nhật trạng thái & lưu lịch sử
    await client.query(`UPDATE codes SET status = 'USED' WHERE id = $1`, [codeObj.id]);
    await client.query(
      `INSERT INTO redemptions (code_id, recipient_identifier) VALUES ($1, $2)`,
      [codeObj.id, cleanIdentifier]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Nhận mã thành công!',
      code: codeObj.code
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi nhận mã:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống server!' });
  } finally {
    client.release();
  }
});

// ==========================================
// 3. ADMIN APIs
// ==========================================

// Đăng nhập Admin
app.post('/api/v1/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng nhập!' });
  }

  try {
    const adminRes = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = adminRes.rows[0];

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không đúng!' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi đăng nhập server!' });
  }
});

// Nạp mã vào Kho
app.post('/api/v1/admin/codes', authenticateAdmin, async (req, res) => {
  const { codes } = req.body;

  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách mã không được rỗng!' });
  }

  let addedCount = 0;
  let duplicateCount = 0;

  for (let rawCode of codes) {
    const cleanCode = String(rawCode).trim();
    if (!cleanCode) continue;

    try {
      await pool.query('INSERT INTO codes (code) VALUES ($1)', [cleanCode]);
      addedCount++;
    } catch (err) {
      if (err.code === '23505') { // Mã lỗi lặp trùng trong PostgreSQL
        duplicateCount++;
      }
    }
  }

  return res.json({
    success: true,
    message: `Thành công! Đã thêm ${addedCount} mã mới.`,
    data: { addedCount, duplicateCount }
  });
});

// Lấy danh sách kho mã & thống kê
app.get('/api/v1/admin/codes', authenticateAdmin, async (req, res) => {
  try {
    const codesRes = await pool.query('SELECT * FROM codes ORDER BY created_at DESC');
    const totalRes = await pool.query('SELECT COUNT(*) FROM codes');
    const availRes = await pool.query("SELECT COUNT(*) FROM codes WHERE status = 'AVAILABLE'");
    const usedRes = await pool.query("SELECT COUNT(*) FROM codes WHERE status = 'USED'");

    return res.json({
      success: true,
      stats: {
        total: parseInt(totalRes.rows[0].count),
        available: parseInt(availRes.rows[0].count),
        used: parseInt(usedRes.rows[0].count)
      },
      data: codesRes.rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách mã!' });
  }
});

// Lịch sử nhận mã
app.get('/api/v1/admin/history', authenticateAdmin, async (req, res) => {
  try {
    const historyRes = await pool.query(`
      SELECT r.id, r.recipient_identifier, c.code, r.claimed_at
      FROM redemptions r
      JOIN codes c ON r.code_id = c.id
      ORDER BY r.claimed_at DESC
    `);

    return res.json({
      success: true,
      data: historyRes.rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử!' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 1. Khởi tạo Cơ sở dữ liệu SQLite
// ==========================================
const db = new Database('database.db');

// Khởi tạo cấu trúc bảng
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE' hoặc 'USED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER UNIQUE NOT NULL,
    recipient_identifier TEXT NOT NULL,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES codes (id)
  );
`);

// Tạo tài khoản Admin mặc định nếu chưa tồn tại
const initAdmin = () => {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
  
  const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get(adminUsername);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(adminUsername, hash);
    console.log(`[INIT] Da tao tài khoản Admin: ${adminUsername}`);
  }
};
initAdmin();

// ==========================================
// 2. Helper & Middleware
// ==========================================

// Kiểm tra định dạng Email hoặc Threads ID
function isValidIdentifier(input) {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  
  // Regex kiểm tra Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Regex kiểm tra Threads Username (cho phép @ ở đầu, chữ, số, dấu chấm, gạch dưới, độ dài 1-30)
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
// 3. API cho Khách Vãng Lai (Public)
// ==========================================

/**
 * POST /api/v1/claim-code
 * Body: { "identifier": "user@gmail.com" } hoặc { "identifier": "@threads_user" }
 */
app.post('/api/v1/claim-code', (req, res) => {
  const { identifier } = req.body;

  if (!identifier || !isValidIdentifier(identifier)) {
    return res.status(400).json({
      success: false,
      message: 'Thông tin nhập không hợp lệ! Vui lòng nhập đúng Email hoặc Threads Username.'
    });
  }

  const cleanIdentifier = identifier.trim();

  // Sử dụng Database Transaction để tránh Race Condition khi cấp mã
  const claimTransaction = db.transaction(() => {
    // 1. Kiểm tra xem người dùng này đã nhận mã trước đó chưa (Chống spam)
    const existingClaim = db.prepare('SELECT * FROM redemptions WHERE recipient_identifier = ?').get(cleanIdentifier);
    if (existingClaim) {
      const claimedCode = db.prepare('SELECT code FROM codes WHERE id = ?').get(existingClaim.code_id);
      return { status: 'ALREADY_CLAIMED', code: claimedCode.code };
    }

    // 2. Tìm mã chưa sử dụng
    const availableCode = db.prepare('SELECT * FROM codes WHERE status = "AVAILABLE" LIMIT 1').get();
    if (!availableCode) {
      return { status: 'OUT_OF_STOCK' };
    }

    // 3. Đánh dấu mã đã dùng
    db.prepare('UPDATE codes SET status = "USED" WHERE id = ?').run(availableCode.id);

    // 4. Lưu lịch sử nhận mã
    db.prepare('INSERT INTO redemptions (code_id, recipient_identifier) VALUES (?, ?)').run(availableCode.id, cleanIdentifier);

    return { status: 'SUCCESS', code: availableCode.code };
  });

  try {
    const result = claimTransaction();

    if (result.status === 'ALREADY_CLAIMED') {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã nhận mã trước đó rồi!',
        code: result.code
      });
    }

    if (result.status === 'OUT_OF_STOCK') {
      return res.status(404).json({
        success: false,
        message: 'Rất tiếc, kho mã hiện tại đã hết! Vui lòng quay lại sau.'
      });
    }

    return res.json({
      success: true,
      message: 'Nhận mã thành công!',
      code: result.code
    });
  } catch (error) {
    console.error('Lỗi nhận mã:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống server!' });
  }
});

// ==========================================
// 4. API Quản Trị Viên (Admin)
// ==========================================

/**
 * POST /api/v1/admin/login
 * Body: { "username": "admin", "password": "adminpassword123" }
 */
app.post('/api/v1/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng nhập!' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không đúng!' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '12h' }
  );

  return res.json({
    success: true,
    message: 'Đăng nhập thành công!',
    token
  });
});

/**
 * POST /api/v1/admin/codes
 * Body: { "codes": ["CODE1", "CODE2", "CODE3"] }
 */
app.post('/api/v1/admin/codes', authenticateAdmin, (req, res) => {
  const { codes } = req.body;

  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ success: false, message: 'Mảng mã nhập vào không được rỗng!' });
  }

  const addedCodes = [];
  const duplicateCodes = [];

  const insertStmt = db.prepare('INSERT INTO codes (code) VALUES (?)');

  for (let rawCode of codes) {
    const cleanCode = String(rawCode).trim();
    if (!cleanCode) continue;

    try {
      insertStmt.run(cleanCode);
      addedCodes.push(cleanCode);
    } catch (err) {
      // Mã lỗi UNIQUE constraint trong SQLite
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        duplicateCodes.push(cleanCode);
      } else {
        console.error('Lỗi thêm mã:', err);
      }
    }
  }

  return res.json({
    success: true,
    message: `Đã nhập thành công ${addedCodes.length} mã.`,
    data: {
      addedCount: addedCodes.length,
      duplicateCount: duplicateCodes.length,
      duplicates: duplicateCodes
    }
  });
});

/**
 * GET /api/v1/admin/codes
 * Lấy danh sách kho mã & tổng quan thống kê
 */
app.get('/api/v1/admin/codes', authenticateAdmin, (req, res) => {
  const codes = db.prepare('SELECT * FROM codes ORDER BY created_at DESC').all();
  
  const total = db.prepare('SELECT COUNT(*) as count FROM codes').get().count;
  const available = db.prepare('SELECT COUNT(*) as count FROM codes WHERE status = "AVAILABLE"').get().count;
  const used = db.prepare('SELECT COUNT(*) as count FROM codes WHERE status = "USED"').get().count;

  return res.json({
    success: true,
    stats: { total, available, used },
    data: codes
  });
});

/**
 * GET /api/v1/admin/history
 * Xem lịch sử nhận mã
 */
app.get('/api/v1/admin/history', authenticateAdmin, (req, res) => {
  const history = db.prepare(`
    SELECT 
      r.id,
      r.recipient_identifier,
      c.code,
      r.claimed_at
    FROM redemptions r
    JOIN codes c ON r.code_id = c.id
    ORDER BY r.claimed_at DESC
  `).all();

  return res.json({
    success: true,
    data: history
  });
});

// Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server dang chay tai port: http://localhost:${PORT}`);
});
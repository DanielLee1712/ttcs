const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// Kết nối MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root", // Thay bằng tên người dùng MySQL của bạn
  password: "miximoi12", // Thay bằng mật khẩu MySQL của bạn
  database: "auth_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tạo bảng users nếu chưa tồn tại
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `;
  const connection = await pool.getConnection();
  await connection.query(createTableQuery);
  connection.release();
}

initializeDatabase().then(() => console.log("Database initialized"));

// Đăng ký người dùng
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();
    await connection.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );
    connection.release();

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
});

// Đăng nhập
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    connection.release();

    const user = rows[0];
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Khởi động server
app.listen(3000, () => console.log("Server running on port 3000"));

const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint cơ bản
app.get("/api", (req, res) => {
  res.json({ message: "Xin chào từ backend Node.js!" });
});

// API endpoint mẫu (danh sách người dùng)
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Nguyễn Văn A" },
    { id: 2, name: "Trần Thị B" },
  ];
  res.json(users);
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

// /backend/index.js

const { Client } = require('pg');
const express = require('express');
const cors = require('cors'); // 引入 CORS 函式庫
const app = express();
const port = process.env.PORT || 3001; 

// --- 数据库连接 (略) ---
const client = new Client({
    connectionString: process.env.DATABASE_URL 
});

client.connect()
    .then(() => console.log('Backend: Database connected successfully!'))
    .catch(err => console.error('Backend: Database connection error (Local runs may fail if no DB is set):', err.stack));

// --- 中间件 ---
// 【CORS 修正點：允許所有來源呼叫，解決前端的連線錯誤 (CORS Error)】
app.use(cors({
    origin: '*', // 允許所有來源 (必須，用於演示)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允許的 HTTP 方法
})); 
app.post('/api/links', async (req, res) => {
  const { short_code, target_url } = req.body;
  
  // 驗證輸入
  if (!short_code || !target_url) {
    return res.status(400).json({ message: '短碼和目標網址都不能為空' });
  }
  
  try {
    // 保存到數據庫
    // ... 你的數據庫邏輯
    
    res.status(200).json({ message: '連結已建立' });
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.use(express.json());
// --- API 路由 (略) ---
// ... (後續的 API 路由和重導向邏輯不變)
// ...
// ...
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});


app.listen(port, () => {
    console.log(`Backend service running on port ${port}`);
});

// 确保连线在服务器关闭时结束 (优雅停机)
process.on('SIGINT', () => {
    client.end(() => {
        console.log('Database client disconnected.');
        process.exit();
    });
});
```
eof

### 步驟二：提交並重新部署後端

這次是修改後端服務，所以我們需要重新部署 `microlink` 服務。

1.  **提交變更：**

    ```bash
    # 確保您在專案根目錄
    git add backend/
    git commit -m "fix: Enable universal CORS in backend for frontend API calls"
    git push
    

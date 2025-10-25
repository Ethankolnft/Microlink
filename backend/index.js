// /backend/index.js

const { Client } = require('pg');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// --- 數據庫連接 ---
const client = new Client({
    connectionString: process.env.POSTGRES_URI || process.env.DATABASE_URL
});

client.connect()
    .then(() => console.log('Backend: Database connected successfully!'))
    .catch(err => console.error('Backend: Database connection error:', err.stack));

// --- 中間件 ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// --- API 路由 ---

// 健康檢查
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// 創建短連結
app.post('/api/links', async (req, res) => {
    const { short_code, target_url } = req.body;

    // 驗證輸入
    if (!short_code || !target_url) {
        return res.status(400).json({ 
            message: '短碼和目標網址都不能為空' 
        });
    }

    try {
        // 檢查短碼是否已存在
        const checkResult = await client.query(
            'SELECT * FROM links WHERE short_code = $1',
            [short_code]
        );

        if (checkResult.rows.length > 0) {
            return res.status(409).json({ 
                message: '短碼已存在' 
            });
        }

        // 插入新的短連結
        const insertResult = await client.query(
            'INSERT INTO links (short_code, target_url) VALUES ($1, $2) RETURNING *',
            [short_code, target_url]
        );

        res.status(201).json({
            message: '連結已建立',
            data: insertResult.rows[0]
        });
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ 
            message: '伺服器錯誤',
            error: error.message 
        });
    }
});

// 獲取短連結
app.get('/api/links/:short_code', async (req, res) => {
    const { short_code } = req.params;

    try {
        const result = await client.query(
            'SELECT * FROM links WHERE short_code = $1',
            [short_code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                message: '連結不存在' 
            });
        }

        res.status(200).json({
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching link:', error);
        res.status(500).json({ 
            message: '伺服器錯誤',
            error: error.message 
        });
    }
});

// 重定向短連結
app.get('/:short_code', async (req, res) => {
    const { short_code } = req.params;

    try {
        const result = await client.query(
            'SELECT * FROM links WHERE short_code = $1',
            [short_code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                message: '連結不存在' 
            });
        }

        // 重定向到目標 URL
        res.redirect(301, result.rows[0].target_url);
    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ 
            message: '伺服器錯誤',
            error: error.message 
        });
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`Backend service running on port ${port}`);
});

// 優雅停機
process.on('SIGINT', () => {
    client.end(() => {
        console.log('Database client disconnected.');
        process.exit();
    });
});

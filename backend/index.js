const { Client } = require('pg');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// --- 数据库连接 ---
const client = new Client({
    connectionString: process.env.DATABASE_URL 
});

client.connect()
    .then(() => console.log('Backend: Database connected successfully!'))
    .catch(err => console.error('Backend: Database connection error (Local runs may fail if no DB is set):', err.stack));

// --- 中间件 ---
app.use(cors()); 
app.use(express.json());

// --- API 路由：管理 (Admin API) ---
// 1. 创建新链接
app.post('/api/links', async (req, res) => {
    const { short_code, target_url } = req.body;
    if (!short_code || !target_url) {
        return res.status(400).json({ message: "Missing short_code or target_url" });
    }
    try {
        const result = await client.query(
            'INSERT INTO links (short_code, target_url) VALUES ($1, $2) RETURNING *',
            [short_code, target_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating link:", error);
        res.status(500).json({ message: "Error creating link" });
    }
});

// 2. 获取所有链接及点击数据
app.get('/api/links', async (req, res) => {
    try {
        const result = await client.query('SELECT short_code, target_url, clicks, created_at FROM links ORDER BY clicks DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching links:", error);
        res.status(500).json({ message: "Error fetching links" });
    }
});

// --- 核心路由：重定向 (Redirect Logic) ---
// 3. 链接重定向与点击追踪
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    try {
        const linkResult = await client.query('SELECT target_url FROM links WHERE short_code = $1', [shortCode]);

        if (linkResult.rows.length > 0) {
            const targetUrl = linkResult.rows[0].target_url;
            client.query('UPDATE links SET clicks = clicks + 1 WHERE short_code = $1', [shortCode])
                  .catch(err => console.error('Click tracking failed:', err.stack));
            return res.redirect(302, targetUrl);
        } else {
            return res.status(404).send('Micro-Link not found (404)');
        }
    } catch (error) {
        console.error("Redirect Server Error:", error);
        res.status(500).send('Server Error');
    }
});

// 部署展示：Zeabur 需要的健康檢查
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Backend service running on port ${port}`);
});

// 优雅停机
process.on('SIGINT', () => {
    client.end(() => {
        console.log('Database client disconnected.');
        process.exit();
    });
});
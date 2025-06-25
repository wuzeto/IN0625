import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// 配置数据库连接
const pool = mysql.createPool({
  host: 'localhost',
  user: 'nct',
  password: 'Wzt040824!',
  database: 'geo_visualization',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 中间件
app.use(cors());
app.use(express.json());

// 测试数据库连接
app.get('/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({message: 'Database connected successfully', data: rows});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 点位数据接口
app.get('/api/points', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM geo_points');
    res.json(rows);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 热力图数据接口
app.get('/api/points/heatmap', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT lat, lon, value
      FROM geo_points
      WHERE point_time BETWEEN ? AND ?
    `, [
      req.query.start_time || '1970-01-01',
      req.query.end_time || '2100-12-31'
    ]);

    // 转换为热力图所需的数据格式
    const heatmapData = rows.map(point => ({
      lat: point.lat,
      lng: point.lon,
      value: point.value
    }));

    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['leaflet', 'leaflet.heat']
  }
});
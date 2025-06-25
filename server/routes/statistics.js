import express from 'express';
import { executeQuery } from '../config/db.js';

const router = express.Router();

// 获取总体统计数据
router.get('/summary', async (req, res) => {
  try {
    const summary = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM points) as total_points,
        (SELECT COUNT(*) FROM layers) as total_layers,
        (SELECT COUNT(*) FROM regions) as total_regions,
        (SELECT AVG(value) FROM points) as avg_value,
        (SELECT MAX(value) FROM points) as max_value,
        (SELECT MIN(value) FROM points) as min_value
    `);
    
    res.json(summary[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取时间序列数据
router.get('/timeseries', async (req, res) => {
  try {
    const { interval = 'hour', count = 24 } = req.query;
    
    let groupFormat;
    switch(interval) {
      case 'minute':
        groupFormat = '%Y-%m-%d %H:%i:00';
        break;
      case 'hour':
        groupFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        groupFormat = '%Y-%m-%d';
        break;
      default:
        groupFormat = '%Y-%m-%d %H:00:00';
    }

    const query = `
      SELECT 
        DATE_FORMAT(timestamp, ?) as time_interval,
        COUNT(*) as count,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value
      FROM points
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? ${interval})
      GROUP BY time_interval
      ORDER BY time_interval DESC
    `;

    const timeseries = await executeQuery(query, [groupFormat, count]);
    res.json(timeseries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取区域统计
router.get('/regions', async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        r.id,
        r.name,
        COUNT(p.id) as point_count,
        AVG(p.value) as avg_value,
        MAX(p.value) as max_value,
        MIN(p.value) as min_value
      FROM regions r
      LEFT JOIN points p ON ST_Contains(
        ST_GeomFromGeoJSON(r.geometry),
        ST_Point(p.longitude, p.latitude)
      )
      GROUP BY r.id
    `);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取热力图统计
router.get('/heatmap', async (req, res) => {
  try {
    const { resolution = 1 } = req.query; // 网格分辨率（度）
    
    const query = `
      SELECT 
        FLOOR(latitude/${resolution})*${resolution} as lat_grid,
        FLOOR(longitude/${resolution})*${resolution} as lng_grid,
        COUNT(*) as point_count,
        AVG(value) as avg_value
      FROM points
      GROUP BY lat_grid, lng_grid
      HAVING point_count > 0
    `;

    const heatmap = await executeQuery(query);
    res.json(heatmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
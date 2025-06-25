const express = require('express');
const router = express.Router();
const { query } = require('../db');

// 获取时间趋势数据
router.get('/trends', async (req, res) => {
  try {
    const { 
      layerId, 
      regionId, 
      startDate, 
      endDate,
      interval = 'day' // 'hour', 'day', 'week', 'month'
    } = req.query;
    
    // 根据不同的时间间隔设置不同的SQL日期格式化
    let dateFormat;
    switch(interval) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u'; // ISO周格式 YYYY-WW
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    let sql = `
      SELECT 
        DATE_FORMAT(timestamp, ?) as time_period,
        COUNT(*) as count,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value,
        SUM(value) as sum_value
      FROM points
      WHERE 1=1
    `;
    
    const params = [dateFormat];
    
    if (layerId) {
      sql += ' AND layer_id = ?';
      params.push(layerId);
    }
    
    if (regionId) {
      sql += ' AND region_id = ?';
      params.push(regionId);
    }
    
    if (startDate && endDate) {
      sql += ' AND timestamp BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    sql += ' GROUP BY time_period ORDER BY time_period';
    
    const trends = await query(sql, params);
    res.json(trends);
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({ error: '获取趋势数据失败' });
  }
});

// 获取区域分布数据
router.get('/distribution/regions', async (req, res) => {
  try {
    const { layerId, startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        r.id,
        r.name,
        COUNT(p.id) as point_count,
        AVG(p.value) as avg_value,
        MAX(p.value) as max_value,
        MIN(p.value) as min_value,
        SUM(p.value) as sum_value
      FROM regions r
      LEFT JOIN points p ON r.id = p.region_id
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (layerId) {
      whereConditions.push('p.layer_id = ?');
      params.push(layerId);
    }
    
    if (startDate && endDate) {
      whereConditions.push('p.timestamp BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    sql += ' GROUP BY r.id ORDER BY point_count DESC';
    
    const distribution = await query(sql, params);
    res.json(distribution);
  } catch (error) {
    console.error('获取区域分布数据失败:', error);
    res.status(500).json({ error: '获取区域分布数据失败' });
  }
});

// 获取图层分布数据
router.get('/distribution/layers', async (req, res) => {
  try {
    const { regionId, startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        l.id,
        l.name,
        l.color,
        COUNT(p.id) as point_count,
        AVG(p.value) as avg_value,
        MAX(p.value) as max_value,
        MIN(p.value) as min_value,
        SUM(p.value) as sum_value
      FROM layers l
      LEFT JOIN points p ON l.id = p.layer_id
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (regionId) {
      whereConditions.push('p.region_id = ?');
      params.push(regionId);
    }
    
    if (startDate && endDate) {
      whereConditions.push('p.timestamp BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    sql += ' GROUP BY l.id ORDER BY point_count DESC';
    
    const distribution = await query(sql, params);
    res.json(distribution);
  } catch (error) {
    console.error('获取图层分布数据失败:', error);
    res.status(500).json({ error: '获取图层分布数据失败' });
  }
});

// 获取数值分布数据（分段统计）
router.get('/distribution/values', async (req, res) => {
  try {
    const { 
      layerId, 
      regionId, 
      startDate, 
      endDate,
      segments = 10 // 分段数量
    } = req.query;
    
    // 首先获取最大值和最小值
    let rangeSql = `
      SELECT 
        MIN(value) as min_value,
        MAX(value) as max_value
      FROM points
      WHERE 1=1
    `;
    
    const rangeParams = [];
    
    if (layerId) {
      rangeSql += ' AND layer_id = ?';
      rangeParams.push(layerId);
    }
    
    if (regionId) {
      rangeSql += ' AND region_id = ?';
      rangeParams.push(regionId);
    }
    
    if (startDate && endDate) {
      rangeSql += ' AND timestamp BETWEEN ? AND ?';
      rangeParams.push(startDate, endDate);
    }
    
    const [range] = await query(rangeSql, rangeParams);
    
    if (!range.min_value && !range.max_value) {
      return res.json([]);
    }
    
    const min = range.min_value;
    const max = range.max_value;
    const step = (max - min) / segments;
    
    // 构建分段查询
    const result = [];
    
    for (let i = 0; i < segments; i++) {
      const lowerBound = min + i * step;
      const upperBound = i === segments - 1 ? max : min + (i + 1) * step;
      
      let segmentSql = `
        SELECT COUNT(*) as count
        FROM points
        WHERE value >= ? AND value < ?
      `;
      
      const segmentParams = [lowerBound, upperBound];
      
      if (layerId) {
        segmentSql += ' AND layer_id = ?';
        segmentParams.push(layerId);
      }
      
      if (regionId) {
        segmentSql += ' AND region_id = ?';
        segmentParams.push(regionId);
      }
      
      if (startDate && endDate) {
        segmentSql += ' AND timestamp BETWEEN ? AND ?';
        segmentParams.push(startDate, endDate);
      }
      
      const [segmentResult] = await query(segmentSql, segmentParams);
      
      result.push({
        segment: i + 1,
        range: {
          min: lowerBound,
          max: upperBound
        },
        count: segmentResult.count
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('获取数值分布数据失败:', error);
    res.status(500).json({ error: '获取数值分布数据失败' });
  }
});

// 获取汇总统计数据
router.get('/summary', async (req, res) => {
  try {
    const { layerId, regionId, startDate, endDate } = req.query;
    
    // 点数据统计
    let pointsSql = `
      SELECT 
        COUNT(*) as total_points,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value,
        SUM(value) as sum_value,
        STDDEV(value) as std_dev_value
      FROM points
      WHERE 1=1
    `;
    
    const pointsParams = [];
    
    if (layerId) {
      pointsSql += ' AND layer_id = ?';
      pointsParams.push(layerId);
    }
    
    if (regionId) {
      pointsSql += ' AND region_id = ?';
      pointsParams.push(regionId);
    }
    
    if (startDate && endDate) {
      pointsSql += ' AND timestamp BETWEEN ? AND ?';
      pointsParams.push(startDate, endDate);
    }
    
    const [pointsStats] = await query(pointsSql, pointsParams);
    
    // 图层统计
    const [layersCount] = await query('SELECT COUNT(*) as count FROM layers');
    
    // 区域统计
    const [regionsCount] = await query('SELECT COUNT(*) as count FROM regions');
    
    // 时间范围统计
    let timeSql = `
      SELECT 
        MIN(timestamp) as earliest_time,
        MAX(timestamp) as latest_time
      FROM points
      WHERE 1=1
    `;
    
    const timeParams = [];
    
    if (layerId) {
      timeSql += ' AND layer_id = ?';
      timeParams.push(layerId);
    }
    
    if (regionId) {
      timeSql += ' AND region_id = ?';
      timeParams.push(regionId);
    }
    
    if (startDate && endDate) {
      timeSql += ' AND timestamp BETWEEN ? AND ?';
      timeParams.push(startDate, endDate);
    }
    
    const [timeStats] = await query(timeSql, timeParams);
    
    res.json({
      points: pointsStats,
      layers: {
        total: layersCount.count
      },
      regions: {
        total: regionsCount.count
      },
      time_range: {
        earliest: timeStats.earliest_time,
        latest: timeStats.latest_time
      }
    });
  } catch (error) {
    console.error('获取汇总统计数据失败:', error);
    res.status(500).json({ error: '获取汇总统计数据失败' });
  }
});

// 导出统计数据
router.get('/export', async (req, res) => {
  try {
    const { format, layerId, regionId, startDate, endDate } = req.query;
    
    // 获取点数据
    let sql = `
      SELECT 
        p.id,
        p.lat,
        p.lng,
        p.value,
        p.timestamp,
        l.name as layer_name,
        r.name as region_name
      FROM points p
      LEFT JOIN layers l ON p.layer_id = l.id
      LEFT JOIN regions r ON p.region_id = r.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (layerId) {
      sql += ' AND p.layer_id = ?';
      params.push(layerId);
    }
    
    if (regionId) {
      sql += ' AND p.region_id = ?';
      params.push(regionId);
    }
    
    if (startDate && endDate) {
      sql += ' AND p.timestamp BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    sql += ' ORDER BY p.timestamp DESC';
    
    const data = await query(sql, params);
    
    // 根据请求的格式返回数据
    if (format === 'csv') {
      // 生成CSV格式
      const fields = ['id', 'lat', 'lng', 'value', 'timestamp', 'layer_name', 'region_name'];
      const csv = [
        fields.join(','),
        ...data.map(row => fields.map(field => `"${row[field] || ''}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=geo_data_export.csv');
      res.send(csv);
    } else if (format === 'json') {
      // 返回JSON格式
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=geo_data_export.json');
      res.json(data);
    } else {
      // 默认返回JSON
      res.json(data);
    }
  } catch (error) {
    console.error('导出统计数据失败:', error);
    res.status(500).json({ error: '导出统计数据失败' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { query } = require('../db');

// 获取所有区域
router.get('/', async (req, res) => {
  try {
    const regions = await query('SELECT * FROM regions ORDER BY name');
    res.json(regions);
  } catch (error) {
    console.error('获取区域失败:', error);
    res.status(500).json({ error: '获取区域失败' });
  }
});

// 获取单个区域
router.get('/:id', async (req, res) => {
  try {
    const [region] = await query('SELECT * FROM regions WHERE id = ?', [req.params.id]);
    
    if (!region) {
      return res.status(404).json({ error: '区域不存在' });
    }
    
    res.json(region);
  } catch (error) {
    console.error('获取区域失败:', error);
    res.status(500).json({ error: '获取区域失败' });
  }
});

// 获取区域边界数据
router.get('/:id/boundary', async (req, res) => {
  try {
    const [region] = await query(
      'SELECT id, name, boundary FROM regions WHERE id = ?', 
      [req.params.id]
    );
    
    if (!region) {
      return res.status(404).json({ error: '区域不存在' });
    }
    
    // 解析GeoJSON边界数据
    let boundary;
    try {
      boundary = region.boundary ? JSON.parse(region.boundary) : null;
    } catch (e) {
      console.error('解析边界数据失败:', e);
      boundary = null;
    }
    
    res.json({
      id: region.id,
      name: region.name,
      boundary
    });
  } catch (error) {
    console.error('获取区域边界失败:', error);
    res.status(500).json({ error: '获取区域边界失败' });
  }
});

// 获取区域统计数据
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, layerId } = req.query;
    
    let sql = `
      SELECT COUNT(*) as pointCount, 
             AVG(value) as avgValue, 
             MAX(value) as maxValue, 
             MIN(value) as minValue
      FROM points 
      WHERE region_id = ?
    `;
    
    const params = [id];
    
    if (startDate && endDate) {
      sql += ' AND timestamp BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    if (layerId) {
      sql += ' AND layer_id = ?';
      params.push(layerId);
    }
    
    const [stats] = await query(sql, params);
    res.json(stats);
  } catch (error) {
    console.error('获取区域统计失败:', error);
    res.status(500).json({ error: '获取区域统计失败' });
  }
});

// 创建区域
router.post('/', async (req, res) => {
  const { name, description, boundary, center_lat, center_lng } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '区域名称不能为空' });
  }
  
  try {
    // 将GeoJSON边界转换为字符串存储
    const boundaryStr = boundary ? JSON.stringify(boundary) : null;
    
    const result = await query(
      `INSERT INTO regions (name, description, boundary, center_lat, center_lng) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || '', boundaryStr, center_lat || null, center_lng || null]
    );
    
    const [newRegion] = await query('SELECT * FROM regions WHERE id = ?', [result.insertId]);
    res.status(201).json(newRegion);
  } catch (error) {
    console.error('创建区域失败:', error);
    res.status(500).json({ error: '创建区域失败' });
  }
});

// 更新区域
router.put('/:id', async (req, res) => {
  const { name, description, boundary, center_lat, center_lng } = req.body;
  const { id } = req.params;
  
  try {
    const [region] = await query('SELECT * FROM regions WHERE id = ?', [id]);
    
    if (!region) {
      return res.status(404).json({ error: '区域不存在' });
    }
    
    // 将GeoJSON边界转换为字符串存储
    const boundaryStr = boundary ? JSON.stringify(boundary) : region.boundary;
    
    await query(
      `UPDATE regions 
       SET name = ?, description = ?, boundary = ?, center_lat = ?, center_lng = ? 
       WHERE id = ?`,
      [name || region.name, 
       description !== undefined ? description : region.description, 
       boundaryStr,
       center_lat !== undefined ? center_lat : region.center_lat,
       center_lng !== undefined ? center_lng : region.center_lng,
       id]
    );
    
    const [updatedRegion] = await query('SELECT * FROM regions WHERE id = ?', [id]);
    res.json(updatedRegion);
  } catch (error) {
    console.error('更新区域失败:', error);
    res.status(500).json({ error: '更新区域失败' });
  }
});

// 删除区域
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [region] = await query('SELECT * FROM regions WHERE id = ?', [id]);
    
    if (!region) {
      return res.status(404).json({ error: '区域不存在' });
    }
    
    await query('DELETE FROM regions WHERE id = ?', [id]);
    res.json({ message: '区域删除成功' });
  } catch (error) {
    console.error('删除区域失败:', error);
    res.status(500).json({ error: '删除区域失败' });
  }
});

module.exports = router;
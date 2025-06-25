import express from 'express';
import { executeQuery } from '../config/db.js';
import { validateRegion } from '../utils/validators.js';

const router = express.Router();

// 获取所有区域
router.get('/', async (req, res) => {
  try {
    const { layer_id } = req.query;
    
    let query = 'SELECT * FROM regions WHERE 1=1';
    const params = [];

    if (layer_id) {
      query += ' AND layer_id = ?';
      params.push(layer_id);
    }

    const regions = await executeQuery(query, params);
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建新区域
router.post('/', async (req, res) => {
  try {
    const regionData = req.body;
    const validation = validateRegion(regionData);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors });
    }

    const query = `
      INSERT INTO regions 
      (name, geometry, properties, layer_id) 
      VALUES (?, ?, ?, ?)
    `;
    
    const params = [
      regionData.name,
      JSON.stringify(regionData.geometry),
      JSON.stringify(regionData.properties || {}),
      regionData.layer_id
    ];

    const result = await executeQuery(query, params);
    res.status(201).json({ 
      id: result.insertId,
      message: 'Region created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新区域
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const validation = validateRegion(updateData);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors });
    }

    const query = `
      UPDATE regions 
      SET name = ?, geometry = ?, properties = ?
      WHERE id = ?
    `;
    
    const params = [
      updateData.name,
      JSON.stringify(updateData.geometry),
      JSON.stringify(updateData.properties || {}),
      id
    ];

    const result = await executeQuery(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    res.json({ message: 'Region updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除区域
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeQuery('DELETE FROM regions WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    res.json({ message: 'Region deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取区域内的点
router.get('/:id/points', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 这里使用 MySQL 的 ST_Contains 函数来判断点是否在区域内
    const query = `
      SELECT p.* 
      FROM points p, regions r 
      WHERE r.id = ? 
      AND ST_Contains(
        ST_GeomFromGeoJSON(r.geometry),
        ST_Point(p.longitude, p.latitude)
      )
    `;
    
    const points = await executeQuery(query, [id]);
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
import express from 'express';
import { executeQuery } from '../config/db.js';
import { validatePoint } from '../utils/validators.js';

const router = express.Router();

// 获取所有点数据
router.get('/', async (req, res) => {
  try {
    const { layer_id, time_range, limit = 1000 } = req.query;
    
    let query = 'SELECT * FROM points WHERE 1=1';
    const params = [];

    if (layer_id) {
      query += ' AND layer_id = ?';
      params.push(layer_id);
    }

    if (time_range) {
      query += ' AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)';
      params.push(parseInt(time_range));
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));

    const points = await executeQuery(query, params);
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取热力图数据
router.get('/heatmap', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const query = `
      SELECT latitude, longitude, value 
      FROM points 
      WHERE timestamp > DATE_SUB(NOW(), INTERVAL ? HOUR)
      AND layer_id = (SELECT id FROM layers WHERE type = 'heatmap' LIMIT 1)
    `;
    
    const heatmapData = await executeQuery(query, [hours]);
    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加新点
router.post('/', async (req, res) => {
  try {
    const pointData = req.body;
    const validation = validatePoint(pointData);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors });
    }

    const query = `
      INSERT INTO points 
      (latitude, longitude, value, name, description, layer_id, properties) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      pointData.latitude,
      pointData.longitude,
      pointData.value,
      pointData.name,
      pointData.description,
      pointData.layer_id,
      JSON.stringify(pointData.properties || {})
    ];

    const result = await executeQuery(query, params);
    res.status(201).json({ 
      id: result.insertId,
      message: 'Point created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新点数据
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const validation = validatePoint(updateData);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors });
    }

    const query = `
      UPDATE points 
      SET latitude = ?, longitude = ?, value = ?, 
          name = ?, description = ?, properties = ?
      WHERE id = ?
    `;
    
    const params = [
      updateData.latitude,
      updateData.longitude,
      updateData.value,
      updateData.name,
      updateData.description,
      JSON.stringify(updateData.properties || {}),
      id
    ];

    const result = await executeQuery(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Point not found' });
    }
    
    res.json({ message: 'Point updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除点
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeQuery('DELETE FROM points WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Point not found' });
    }
    
    res.json({ message: 'Point deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量添加点
router.post('/batch', async (req, res) => {
  try {
    const { points } = req.body;
    
    if (!Array.isArray(points) || points.length === 0) {
      return res.status(400).json({ error: 'Invalid points data' });
    }

    const query = `
      INSERT INTO points 
      (latitude, longitude, value, name, description, layer_id, properties) 
      VALUES ?
    `;
    
    const values = points.map(point => [
      point.latitude,
      point.longitude,
      point.value,
      point.name,
      point.description,
      point.layer_id,
      JSON.stringify(point.properties || {})
    ]);

    const result = await executeQuery(query, [values]);
    res.status(201).json({ 
      message: `${result.affectedRows} points created successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
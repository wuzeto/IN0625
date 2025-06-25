import express from 'express';
import { executeQuery } from '../config/db.js';
import { validateLayer } from '../utils/validators.js';

const router = express.Router();

// 获取所有图层
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT l.*, 
        (SELECT COUNT(*) FROM points WHERE layer_id = l.id) as point_count,
        (SELECT COUNT(*) FROM regions WHERE layer_id = l.id) as region_count
      FROM layers l
      ORDER BY l.created_at DESC
    `;
    
    const layers = await executeQuery(query);
    res.json(layers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建新图层
router.post('/', async (req, res) => {
  try {
    const layerData = req.body;
    const validation = validateLayer(layerData);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors });
    }

    const query = `
      INSERT INTO layers 
      (name, type, visible, style, properties) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      layerData.name,
      layerData.type,
      layerData.visible !== false,
      JSON.stringify(layerData.style || {}),
      JSON.stringify(layerData.properties || {})
    ];

    const result = await executeQuery(query, params);
    res.status(201).json({ 
      id: result.insertId,
      message: 'Layer created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新图层
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const validation = validateLayer(updateData);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors });
    }

    const query = `
      UPDATE layers 
      SET name = ?, type = ?, visible = ?,
          style = ?, properties = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      updateData.name,
      updateData.type,
      updateData.visible !== false,
      JSON.stringify(updateData.style || {}),
      JSON.stringify(updateData.properties || {}),
      id
    ];

    const result = await executeQuery(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Layer not found' });
    }
    
    res.json({ message: 'Layer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除图层
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 开启事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 先删除关联的点和区域
      await connection.query('DELETE FROM points WHERE layer_id = ?', [id]);
      await connection.query('DELETE FROM regions WHERE layer_id = ?', [id]);
      
      // 删除图层
      const [result] = await connection.query('DELETE FROM layers WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Layer not found' });
      }
      
      await connection.commit();
      connection.release();
      res.json({ message: 'Layer and associated data deleted successfully' });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 切换图层可见性
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE layers 
      SET visible = NOT visible,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Layer not found' });
    }
    
    res.json({ message: 'Layer visibility toggled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
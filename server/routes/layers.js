const express = require('express');
const router = express.Router();
const { query } = require('../db');

// 获取所有图层
router.get('/', async (req, res) => {
  try {
    const layers = await query('SELECT * FROM layers ORDER BY name');
    res.json(layers);
  } catch (error) {
    console.error('获取图层失败:', error);
    res.status(500).json({ error: '获取图层失败' });
  }
});

// 获取单个图层
router.get('/:id', async (req, res) => {
  try {
    const [layer] = await query('SELECT * FROM layers WHERE id = ?', [req.params.id]);
    
    if (!layer) {
      return res.status(404).json({ error: '图层不存在' });
    }
    
    res.json(layer);
  } catch (error) {
    console.error('获取图层失败:', error);
    res.status(500).json({ error: '获取图层失败' });
  }
});

// 创建图层
router.post('/', async (req, res) => {
  const { name, description, color, visible } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '图层名称不能为空' });
  }
  
  try {
    const result = await query(
      'INSERT INTO layers (name, description, color, visible) VALUES (?, ?, ?, ?)',
      [name, description || '', color || '#4facfe', visible !== undefined ? visible : true]
    );
    
    const [newLayer] = await query('SELECT * FROM layers WHERE id = ?', [result.insertId]);
    res.status(201).json(newLayer);
  } catch (error) {
    console.error('创建图层失败:', error);
    res.status(500).json({ error: '创建图层失败' });
  }
});

// 更新图层
router.put('/:id', async (req, res) => {
  const { name, description, color, visible } = req.body;
  const { id } = req.params;
  
  try {
    const [layer] = await query('SELECT * FROM layers WHERE id = ?', [id]);
    
    if (!layer) {
      return res.status(404).json({ error: '图层不存在' });
    }
    
    await query(
      'UPDATE layers SET name = ?, description = ?, color = ?, visible = ? WHERE id = ?',
      [name || layer.name, 
       description !== undefined ? description : layer.description, 
       color || layer.color, 
       visible !== undefined ? visible : layer.visible, 
       id]
    );
    
    const [updatedLayer] = await query('SELECT * FROM layers WHERE id = ?', [id]);
    res.json(updatedLayer);
  } catch (error) {
    console.error('更新图层失败:', error);
    res.status(500).json({ error: '更新图层失败' });
  }
});

// 删除图层
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [layer] = await query('SELECT * FROM layers WHERE id = ?', [id]);
    
    if (!layer) {
      return res.status(404).json({ error: '图层不存在' });
    }
    
    await query('DELETE FROM layers WHERE id = ?', [id]);
    res.json({ message: '图层删除成功' });
  } catch (error) {
    console.error('删除图层失败:', error);
    res.status(500).json({ error: '删除图层失败' });
  }
});

module.exports = router;
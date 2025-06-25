const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有设置
router.get('/', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings WHERE id = 1');
    
    if (settings && settings.length > 0) {
      // 解析JSON字符串为对象
      const settingsData = settings[0].settings_data ? JSON.parse(settings[0].settings_data) : {};
      res.json(settingsData);
    } else {
      // 如果没有设置记录，返回空对象
      res.json({});
    }
  } catch (error) {
    console.error('获取设置失败:', error);
    res.status(500).json({ error: '获取设置失败' });
  }
});

// 保存设置
router.post('/', async (req, res) => {
  try {
    const settingsData = req.body;
    
    // 将设置对象转换为JSON字符串
    const settingsJson = JSON.stringify(settingsData);
    
    // 检查是否已存在设置记录
    const [existingSettings] = await db.query('SELECT * FROM settings WHERE id = 1');
    
    if (existingSettings && existingSettings.length > 0) {
      // 更新现有设置
      await db.query('UPDATE settings SET settings_data = ?, updated_at = NOW() WHERE id = 1', [settingsJson]);
    } else {
      // 创建新设置记录
      await db.query('INSERT INTO settings (id, settings_data, created_at, updated_at) VALUES (1, ?, NOW(), NOW())', [settingsJson]);
    }
    
    res.json({ success: true, message: '设置已保存' });
  } catch (error) {
    console.error('保存设置失败:', error);
    res.status(500).json({ error: '保存设置失败' });
  }
});

// 重置设置
router.post('/reset', async (req, res) => {
  try {
    // 默认设置
    const defaultSettings = {
      mapCenter: { lat: 39.9, lng: 116.4 },
      zoomLevel: 12,
      mapType: 'standard',
      showHeatmap: true,
      showCluster: false,
      showMarkers: true,
      showRegions: true,
      heatmapColorScheme: 'default',
      refreshInterval: 30,
      maxPoints: 1000,
      cacheTime: 5,
      theme: 'light',
      showStatistics: true,
      showLegend: true
    };
    
    // 将默认设置转换为JSON字符串
    const settingsJson = JSON.stringify(defaultSettings);
    
    // 更新设置
    await db.query('UPDATE settings SET settings_data = ?, updated_at = NOW() WHERE id = 1', [settingsJson]);
    
    res.json({ success: true, message: '设置已重置为默认值', settings: defaultSettings });
  } catch (error) {
    console.error('重置设置失败:', error);
    res.status(500).json({ error: '重置设置失败' });
  }
});

module.exports = router;
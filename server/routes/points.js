const express = require('express');
      const router = express.Router();
      const { query } = require('../db');
      const excel = require('exceljs');

      // 添加统计聚合接口
      router.get('/statistics/summary', async (req, res) => {
        try {
          const { layerId, regionId, startDate, endDate } = req.query;

          let sql = `
            SELECT 
              COUNT(*) as total,
              AVG(value) as average,
              MAX(value) as maximum,
              MIN(value) as minimum,
              SUM(value) as sum
            FROM points
            WHERE 1=1
          `;

          const params = [];

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

          const [stats] = await query(sql, params);
          res.json(stats);
        } catch (error) {
          console.error('获取统计数据失败:', error);
          res.status(500).json({ error: '获取统计数据失败' });
        }
      });

      // 添加按区域分组统计接口
      router.get('/statistics/by-region', async (req, res) => {
        try {
          const { layerId, startDate, endDate } = req.query;

          let sql = `
            SELECT 
              r.name as region_name,
              COUNT(*) as point_count,
              AVG(p.value) as average_value,
              MAX(p.value) as max_value,
              MIN(p.value) as min_value
            FROM points p
            JOIN regions r ON p.region_id = r.id
            WHERE 1=1
          `;

          const params = [];

          if (layerId) {
            sql += ' AND p.layer_id = ?';
            params.push(layerId);
          }

          if (startDate && endDate) {
            sql += ' AND p.timestamp BETWEEN ? AND ?';
            params.push(startDate, endDate);
          }

          sql += ' GROUP BY r.id, r.name';

          const stats = await query(sql, params);
          res.json(stats);
        } catch (error) {
          console.error('获取区域统计失败:', error);
          res.status(500).json({ error: '获取区域统计失败' });
        }
      });

      // 添加时间维度分析接口
      router.get('/analysis/time-series', async (req, res) => {
        try {
          const {
            layerId,
            regionId,
            startDate,
            endDate,
            interval = 'day' // 支持 day/week/month
          } = req.query;

          let timeFormat;
          switch (interval) {
            case 'week':
              timeFormat = 'YEARWEEK(timestamp)';
              break;
            case 'month':
              timeFormat = 'DATE_FORMAT(timestamp, "%Y-%m")';
              break;
            default:
              timeFormat = 'DATE(timestamp)';
          }

          let sql = `
            SELECT 
              ${timeFormat} as time_period,
              COUNT(*) as count,
              AVG(value) as average,
              MAX(value) as maximum,
              MIN(value) as minimum
            FROM points
            WHERE 1=1
          `;

          const params = [];

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

          sql += ` GROUP BY ${timeFormat} ORDER BY time_period`;

          const data = await query(sql, params);
          res.json(data);
        } catch (error) {
          console.error('获取时间序列数据失败:', error);
          res.status(500).json({ error: '获取时间序列数据失败' });
        }
      });

      // 添加数据导出接口
      router.get('/export', async (req, res) => {
        try {
          const { format = 'excel', ...filters } = req.query;

          // 获取数据
          const points = await query(
            `SELECT p.*, l.name as layer_name, r.name as region_name
             FROM points p
             LEFT JOIN layers l ON p.layer_id = l.id
             LEFT JOIN regions r ON p.region_id = r.id
             WHERE 1=1`,
            []
          );

          if (format === 'excel') {
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Points Data');

            worksheet.columns = [
              { header: 'ID', key: 'id' },
              { header: '图层', key: 'layer_name' },
              { header: '区域', key: 'region_name' },
              { header: '纬度', key: 'lat' },
              { header: '经度', key: 'lng' },
              { header: '数值', key: 'value' },
              { header: '时间', key: 'timestamp' }
            ];

            worksheet.addRows(points);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=points-data.xlsx');

            await workbook.xlsx.write(res);
            res.end();
          } else if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=points-data.csv');

            const csv = points.map(point =>
              `${point.id},${point.layer_name},${point.region_name},${point.lat},${point.lng},${point.value},${point.timestamp}`
            ).join('\n');

            res.send(csv);
          }
        } catch (error) {
          console.error('导出数据失败:', error);
          res.status(500).json({ error: '导出数据失败' });
        }
      });

      // 修改热力图接口，增加区域过滤
      router.get('/heatmap/data', async (req, res) => {
        try {
          const {
            layerId,
            regionId,
            startDate,
            endDate,
            limit = 50000,
            useCache = 'true'
          } = req.query;

          // ... 原有的缓存逻辑 ...

          let sql = `
            SELECT p.lat, p.lng, p.value
            FROM points p
            WHERE 1=1
          `;

          if (regionId) {
            sql += `
              AND ST_Contains(
                (SELECT boundary FROM regions WHERE id = ?),
                POINT(p.lng, p.lat)
              )
            `;
            params.push(regionId);
          }

          // ... 其余原有逻辑 ...

        } catch (error) {
          console.error('获取热力图数据失败:', error);
          res.status(500).json({ error: '获取热力图数据失败' });
        }
      });

      module.exports = router;
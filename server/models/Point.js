import BaseModel from './BaseModel.js';
import { executeQuery } from '../config/db.js';

export default class Point extends BaseModel {
  constructor() {
    super('points');
  }

  async findInTimeRange(hours = 24, layerId = null) {
    let query = `
      SELECT * FROM points 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;
    const params = [hours];

    if (layerId) {
      query += ` AND layer_id = ?`;
      params.push(layerId);
    }

    query += ` ORDER BY timestamp DESC`;
    return await executeQuery(query, params);
  }

  async getHeatmapData(hours = 24) {
    const query = `
      SELECT 
        latitude, 
        longitude, 
        value,
        COUNT(*) as intensity
      FROM points 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY 
        ROUND(latitude, 4), 
        ROUND(longitude, 4)
    `;
    return await executeQuery(query, [hours]);
  }

  async createBatch(points) {
    if (!Array.isArray(points) || points.length === 0) {
      throw new Error('Invalid points data');
    }

    const keys = Object.keys(points[0]);
    const placeholders = points.map(() => 
      `(${keys.map(() => '?').join(', ')})`
    ).join(', ');

    const values = points.flatMap(point => 
      keys.map(key => 
        typeof point[key] === 'object' ? JSON.stringify(point[key]) : point[key]
      )
    );

    const query = `
      INSERT INTO points 
      (${keys.join(', ')}) 
      VALUES ${placeholders}
    `;

    const result = await executeQuery(query, values);
    return result.affectedRows;
  }

  async findInRegion(regionGeometry) {
    const query = `
      SELECT p.* 
      FROM points p 
      WHERE ST_Contains(
        ST_GeomFromGeoJSON(?),
        ST_Point(p.longitude, p.latitude)
      )
    `;
    return await executeQuery(query, [JSON.stringify(regionGeometry)]);
  }

  async getStatistics(layerId = null) {
    let query = `
      SELECT 
        COUNT(*) as total,
        AVG(value) as average,
        MAX(value) as maximum,
        MIN(value) as minimum,
        STD(value) as std_dev
      FROM points
    `;
    const params = [];

    if (layerId) {
      query += ` WHERE layer_id = ?`;
      params.push(layerId);
    }

    const results = await executeQuery(query, params);
    return results[0];
  }
}
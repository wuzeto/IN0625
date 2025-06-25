import BaseModel from './BaseModel.js';
import { executeQuery } from '../config/db.js';

export default class Region extends BaseModel {
  constructor() {
    super('regions');
  }

  async findWithPoints() {
    const query = `
      SELECT 
        r.*,
        COUNT(p.id) as point_count,
        AVG(p.value) as average_value
      FROM regions r
      LEFT JOIN points p ON ST_Contains(
        ST_GeomFromGeoJSON(r.geometry),
        ST_Point(p.longitude, p.latitude)
      )
      GROUP BY r.id
    `;
    return await executeQuery(query);
  }

  async getPointsInRegion(regionId) {
    const query = `
      SELECT p.* 
      FROM points p, regions r
      WHERE r.id = ?
      AND ST_Contains(
        ST_GeomFromGeoJSON(r.geometry),
        ST_Point(p.longitude, p.latitude)
      )
    `;
    return await executeQuery(query, [regionId]);
  }

  async createWithGeometry(data) {
    const { name, geometry, properties, layer_id } = data;
    
    // 验证GeoJSON geometry的有效性
    const validationQuery = `
      SELECT ST_IsValid(ST_GeomFromGeoJSON(?)) as is_valid
    `;
    const validation = await executeQuery(validationQuery, [JSON.stringify(geometry)]);
    
    if (!validation[0].is_valid) {
      throw new Error('Invalid geometry');
    }

    return await this.create({
      name,
      geometry: JSON.stringify(geometry),
      properties: JSON.stringify(properties || {}),
      layer_id
    });
  }

  async getStatistics(regionId) {
    const query = `
      SELECT 
        r.id,
        r.name,
        COUNT(p.id) as point_count,
        AVG(p.value) as average_value,
        MAX(p.value) as max_value,
        MIN(p.value) as min_value,
        ST_Area(ST_GeomFromGeoJSON(r.geometry)) as area
      FROM regions r
      LEFT JOIN points p ON ST_Contains(
        ST_GeomFromGeoJSON(r.geometry),
        ST_Point(p.longitude, p.latitude)
      )
      WHERE r.id = ?
      GROUP BY r.id
    `;
    const results = await executeQuery(query, [regionId]);
    return results[0];
  }
}
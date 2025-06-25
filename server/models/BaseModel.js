import { executeQuery } from '../config/db.js';

export default class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  async findAll(conditions = {}) {
    let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    const params = [];

    Object.entries(conditions).forEach(([key, value]) => {
      query += ` AND ${key} = ?`;
      params.push(value);
    });

    return await executeQuery(query, params);
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `
      INSERT INTO ${this.tableName} 
      (${keys.join(', ')}) 
      VALUES (${placeholders})
    `;

    const result = await executeQuery(query, values);
    return result.insertId;
  }

  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const query = `
      UPDATE ${this.tableName}
      SET ${sets}
      WHERE id = ?
    `;

    const result = await executeQuery(query, values);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  async count(conditions = {}) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE 1=1`;
    const params = [];

    Object.entries(conditions).forEach(([key, value]) => {
      query += ` AND ${key} = ?`;
      params.push(value);
    });

    const result = await executeQuery(query, params);
    return result[0].count;
  }
}
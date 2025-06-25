import BaseModel from './BaseModel.js';
import { executeQuery } from '../config/db.js';

export default class Layer extends BaseModel {
  constructor() {
    super('layers');
  }

  async findWithCounts() {
    const query = `
      SELECT 
        l.*,
        (SELECT COUNT(*) FROM points WHERE layer_id = l.id) as point_count,
        (SELECT COUNT(*) FROM regions WHERE layer_id = l.id) as region_count
      FROM layers l
      ORDER BY l.created_at DESC
    `;
    return await executeQuery(query);
  }

  async toggleVisibility(id) {
    const query = `
      UPDATE layers 
      SET visible = NOT visible,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  async updateStyle(id, style) {
    const query = `
      UPDATE layers 
      SET style = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [JSON.stringify(style), id]);
    return result.affectedRows > 0;
  }

  async deleteWithData(id) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query('DELETE FROM points WHERE layer_id = ?', [id]);
      await connection.query('DELETE FROM regions WHERE layer_id = ?', [id]);
      const [result] = await connection.query('DELETE FROM layers WHERE id = ?', [id]);
      
      await connection.commit();
      connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }
}
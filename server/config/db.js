import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: 'nct',
  password: 'Wzt040824!',
  database: 'geo_data',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // 允许执行多条SQL语句
});

export const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');

    // 读取初始化SQL脚本
    const initSqlPath = path.join(__dirname, '..', 'init-db.sql');
    const initSql = await fs.readFile(initSqlPath, 'utf8');

    // 执行初始化脚本
    await connection.query(initSql);
    console.log('Database initialized successfully');

    // 验证数据
    const [layers] = await connection.query('SELECT COUNT(*) as count FROM layers');
    const [points] = await connection.query('SELECT COUNT(*) as count FROM points');
    
    console.log(`Initialized with ${layers[0].count} layers and ${points[0].count} points`);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// 辅助函数：执行查询并处理错误
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default pool;
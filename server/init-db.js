const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'nct',
  password: 'Wzt040824!',
  database: 'geo_visualization'
});

const createTables = `
CREATE TABLE IF NOT EXISTS data_layers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT DEFAULT NULL,
  boundary GEOMETRY NOT NULL,
  spatial_index SPATIAL(boundary),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geo_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  layer_id INT NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lon DECIMAL(9,6) NOT NULL,
  value DECIMAL(10,2),
  point_time DATE,
  FOREIGN KEY (layer_id) REFERENCES data_layers(id)
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name ENUM('admin', 'user') NOT NULL
);
`;

connection.query(createTables, err => {
  if (err) throw err;
  console.log('数据库表已创建或存在');
  connection.end();
});

-- 创建数据库
CREATE DATABASE IF NOT EXISTS geo_data DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE geo_data;

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS points;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS layers;
DROP TABLE IF EXISTS statistics;

-- 创建图层表
CREATE TABLE layers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('point', 'heatmap', 'region') NOT NULL,
    visible BOOLEAN DEFAULT true,
    style JSON,
    properties JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建点数据表
CREATE TABLE points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    value FLOAT,
    name VARCHAR(255),
    description TEXT,
    layer_id INT,
    properties JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (layer_id) REFERENCES layers(id) ON DELETE SET NULL,
    INDEX idx_timestamp (timestamp),
    INDEX idx_layer (layer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建区域表
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    geometry JSON NOT NULL,
    properties JSON,
    layer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (layer_id) REFERENCES layers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建统计数据表
CREATE TABLE statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL,
    value JSON NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_timestamp (type, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认图层
INSERT INTO layers (name, type, style, properties) VALUES 
('热力图层', 'heatmap', 
 '{"radius": 25, "blur": 15, "gradient": {"0.4": "blue", "0.6": "cyan", "0.7": "lime", "0.8": "yellow", "1.0": "red"}}',
 '{"description": "显示数据密度的热力图", "minZoom": 3, "maxZoom": 18}'
),
('点标记图层', 'point',
 '{"icon": "default", "color": "#3388ff", "weight": 3, "opacity": 1.0}',
 '{"description": "显示具体位置的标记点", "cluster": true}'
);

-- 创建生成测试数据的存储过程
DELIMITER //
CREATE PROCEDURE generate_test_data()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE heatmap_layer_id INT;
    DECLARE point_layer_id INT;
    
    -- 获取图层ID
    SELECT id INTO heatmap_layer_id FROM layers WHERE type = 'heatmap' LIMIT 1;
    SELECT id INTO point_layer_id FROM layers WHERE type = 'point' LIMIT 1;
    
    -- 生成1000个测试点
    WHILE i < 1000 DO
        -- 在中国地图范围内生成随机点
        INSERT INTO points (
            latitude, 
            longitude, 
            value,
            name,
            description,
            layer_id,
            properties,
            timestamp
        ) VALUES (
            18 + RAND() * 35,  -- 纬度范围：18-53
            73 + RAND() * 62,  -- 经度范围：73-135
            RAND() * 100,      -- 随机值：0-100
            CONCAT('测试点 ', i),
            CONCAT('这是测试点 ', i, ' 的描述'),
            CASE WHEN RAND() > 0.5 THEN heatmap_layer_id ELSE point_layer_id END,
            JSON_OBJECT(
                'category', ELT(FLOOR(RAND() * 3) + 1, '类别A', '类别B', '类别C'),
                'intensity', ROUND(RAND() * 10, 2)
            ),
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 24) HOUR)
        );
        SET i = i + 1;
    END WHILE;
    
    -- 生成一些统计数据
    INSERT INTO statistics (type, value) VALUES
    ('density', JSON_OBJECT(
        'total_points', 1000,
        'avg_value', (SELECT AVG(value) FROM points),
        'max_value', (SELECT MAX(value) FROM points),
        'min_value', (SELECT MIN(value) FROM points)
    )),
    ('distribution', JSON_OBJECT(
        'north', (SELECT COUNT(*) FROM points WHERE latitude > 35),
        'south', (SELECT COUNT(*) FROM points WHERE latitude <= 35),
        'east', (SELECT COUNT(*) FROM points WHERE longitude > 105),
        'west', (SELECT COUNT(*) FROM points WHERE longitude <= 105)
    ));
END //
DELIMITER ;

-- 执行存储过程生成测试数据
CALL generate_test_data();
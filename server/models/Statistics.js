import { executeQuery } from '../config/db.js';

export default class Statistics {
  async getSummary() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM points) as total_points,
        (SELECT COUNT(*) FROM layers) as total_layers,
        (SELECT COUNT(*) FROM regions) as total_regions,
        (SELECT AVG(value) FROM points) as avg_value,
        (SELECT MAX(value) FROM points) as max_value,
        (SELECT MIN(value) FROM points) as min_value,
        NOW() as timestamp
    `;
    const results = await executeQuery(query);
    return results[0];
  }

  async getTimeSeriesData(interval = 'hour', count = 24) {
    const formats = {
      minute: '%Y-%m-%d %H:%i:00',
      hour: '%Y-%m-%d %H:00:00',
      day: '%Y-%m-%d',
      month: '%Y-%m'
    };

    const query = `
      SELECT 
        DATE_FORMAT(timestamp, ?) as time_interval,
        COUNT(*) as count,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value
      FROM points
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? ${interval})
      GROUP BY time_interval
      ORDER BY time_interval DESC
    `;

    return await executeQuery(query, [formats[interval] || formats.hour, count]);
  }

  async getHeatmapStats(resolution = 1) {
    const query = `
      SELECT 
        FLOOR(latitude/${resolution})*${resolution} as lat_grid,
        FLOOR(longitude/${resolution})*${resolution} as lng_grid,
        COUNT(*) as point_count,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value
      FROM points
      GROUP BY lat_grid, lng_grid
      HAVING point_count > 0
    `;
    return await executeQuery(query);
  }
}
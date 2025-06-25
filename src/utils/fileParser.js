/**
 * CSV 文件解析器
 * @param {string} content - CSV文件内容
 * @param {Object} options - 解析选项
 * @param {string} options.delimiter - 分隔符，默认为逗号
 * @param {boolean} options.hasHeader - 是否包含表头，默认为 true
 * @param {Object} options.mapping - 字段映射，例如 { latitude: 'lat', longitude: 'lng' }
 * @returns {Array} 解析后的数据数组
 */
export const parseCSV = (content, options = {}) => {
    const {
        delimiter = ',',
        hasHeader = true,
        mapping = {}
    } = options;

    // 分割行
    const lines = content.trim().split('\n');
    if (lines.length === 0) {
        throw new Error('Empty CSV file');
    }

    // 获取表头
    let headers = [];
    if (hasHeader) {
        headers = lines[0].split(delimiter).map(h => h.trim());
        lines.shift();
    } else {
        // 如果没有表头，使用默认字段名
        headers = ['name', 'latitude', 'longitude', 'value', 'category', 'timestamp'];
    }

    // 处理字段映射
    const fieldMap = new Map();
    headers.forEach((header, index) => {
        const mappedField = mapping[header] || header;
        fieldMap.set(index, mappedField);
    });

    // 解析数据行
    return lines.map((line, lineIndex) => {
        const values = line.split(delimiter).map(v => v.trim());
        const row = {};

        values.forEach((value, index) => {
            const field = fieldMap.get(index);
            if (field) {
                // 类型转换
                switch (field) {
                    case 'latitude':
                    case 'longitude':
                    case 'value':
                        row[field] = parseFloat(value);
                        break;
                    case 'timestamp':
                        row[field] = new Date(value);
                        break;
                    default:
                        row[field] = value;
                }
            }
        });

        // 验证必要字段
        if (!row.latitude || !row.longitude) {
            throw new Error(`Invalid coordinates at line ${lineIndex + 2}`);
        }

        return row;
    });
};

/**
 * JSON 文件解析器
 * @param {string} content - JSON文件内容
 * @param {Object} options - 解析选项
 * @param {Object} options.mapping - 字段映射
 * @param {Function} options.transform - 数据转换函数
 * @returns {Array} 解析后的数据数组
 */
export const parseJSON = (content, options = {}) => {
    const { mapping = {}, transform } = options;

    try {
        let data = JSON.parse(content);

        // 确保数据是数组
        if (!Array.isArray(data)) {
            if (data.features) {
                // 处理 GeoJSON
                data = data.features.map(feature => ({
                    ...feature.properties,
                    latitude: feature.geometry.coordinates[1],
                    longitude: feature.geometry.coordinates[0]
                }));
            } else if (data.data) {
                // 处理包装在 data 字段中的数组
                data = data.data;
            } else {
                throw new Error('Invalid JSON structure');
            }
        }

        // 应用字段映射和转换
        return data.map((item, index) => {
            const mappedItem = {};

            // 应用字段映射
            Object.entries(item).forEach(([key, value]) => {
                const mappedKey = mapping[key] || key;
                mappedItem[mappedKey] = value;
            });

            // 验证必要字段
            if (!mappedItem.latitude || !mappedItem.longitude) {
                throw new Error(`Invalid coordinates at index ${index}`);
            }

            // 应用自定义转换
            if (transform) {
                return transform(mappedItem);
            }

            return mappedItem;
        });
    } catch (error) {
        throw new Error(`JSON parsing error: ${error.message}`);
    }
};

/**
 * 自动检测并解析文件内容
 * @param {File} file - 文件对象
 * @param {Object} options - 解析选项
 * @returns {Promise<Array>} 解析后的数据数组
 */
export const parseFile = (file, options = {}) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;

                // 根据文件类型选择解析器
                if (file.name.endsWith('.csv')) {
                    resolve(parseCSV(content, options));
                } else if (file.name.endsWith('.json')) {
                    resolve(parseJSON(content, options));
                } else {
                    reject(new Error('Unsupported file type'));
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('File reading failed'));
        };

        reader.readAsText(file);
    });
};

/**
 * 验证数据格式
 * @param {Array} data - 要验证的数据数组
 * @param {Object} schema - 数据模式定义
 * @returns {Object} 验证结果 { valid: boolean, errors: Array }
 */
export const validateData = (data, schema = {}) => {
    const errors = [];
    const requiredFields = schema.required || ['latitude', 'longitude'];
    const fieldTypes = schema.types || {
        latitude: 'number',
        longitude: 'number',
        value: 'number',
        timestamp: 'date'
    };

    data.forEach((item, index) => {
        // 检查必要字段
        requiredFields.forEach(field => {
            if (!(field in item)) {
                errors.push(`Missing required field '${field}' at index ${index}`);
            }
        });

        // 检查字段类型
        Object.entries(fieldTypes).forEach(([field, type]) => {
            if (field in item) {
                const value = item[field];
                switch (type) {
                    case 'number':
                        if (typeof value !== 'number' || isNaN(value)) {
                            errors.push(`Invalid number for field '${field}' at index ${index}`);
                        }
                        break;
                    case 'date':
                        if (!(value instanceof Date) || isNaN(value.getTime())) {
                            errors.push(`Invalid date for field '${field}' at index ${index}`);
                        }
                        break;
                    case 'string':
                        if (typeof value !== 'string') {
                            errors.push(`Invalid string for field '${field}' at index ${index}`);
                        }
                        break;
                }
            }
        });
    });

    return {
        valid: errors.length === 0,
        errors
    };
};
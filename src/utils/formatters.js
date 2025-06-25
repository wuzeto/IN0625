/**
 * 格式化日期时间
 * @param {Date|string|number} date 要格式化的日期
 * @param {string} format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * 格式化数字
 * @param {number} num 要格式化的数字
 * @param {number} digits 保留的小数位数，默认为 2
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num, digits = 2) => {
    if (num === null || num === undefined) return '';

    // 如果是整数，不显示小数位
    if (Number.isInteger(num)) {
        return num.toLocaleString();
    }

    // 处理小数
    return num.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
};

/**
 * 格式化坐标
 * @param {number} coordinate 坐标值
 * @param {string} direction 方向（N/S/E/W）
 * @returns {string} 格式化后的坐标字符串
 */
export const formatCoordinate = (coordinate, direction) => {
    if (coordinate === null || coordinate === undefined) return '';

    const abs = Math.abs(coordinate);
    const degrees = Math.floor(abs);
    const minutes = ((abs - degrees) * 60).toFixed(3);

    return `${degrees}°${minutes}'${direction}`;
};

/**
 * 格式化距离
 * @param {number} distance 距离（米）
 * @returns {string} 格式化后的距离字符串
 */
export const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return '';

    if (distance < 1000) {
        return `${Math.round(distance)}m`;
    } else if (distance < 10000) {
        return `${(distance / 1000).toFixed(2)}km`;
    } else {
        return `${Math.round(distance / 1000)}km`;
    }
};

/**
 * 格式化文件大小
 * @param {number} bytes 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 格式化持续时间
 * @param {number} seconds 持续时间（秒）
 * @returns {string} 格式化后的持续时间字符串
 */
export const formatDuration = (seconds) => {
    if (seconds < 60) {
        return `${seconds}秒`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}分${seconds % 60}秒`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}时${minutes % 60}分`;
    }

    const days = Math.floor(hours / 24);
    return `${days}天${hours % 24}时`;
};

/**
 * 格式化百分比
 * @param {number} value 要格式化的值
 * @param {number} total 总值
 * @param {number} digits 保留的小数位数，默认为 1
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercent = (value, total, digits = 1) => {
    if (!total) return '0%';
    return `${((value / total) * 100).toFixed(digits)}%`;
};

/**
 * 格式化时间差
 * @param {Date|string|number} date 要比较的日期
 * @returns {string} 格式化后的时间差字符串
 */
export const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) {
        return '刚刚';
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分钟前`;
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}小时前`;
    } else if (diff < 2592000) {
        return `${Math.floor(diff / 86400)}天前`;
    } else if (diff < 31536000) {
        return `${Math.floor(diff / 2592000)}个月前`;
    } else {
        return `${Math.floor(diff / 31536000)}年前`;
    }
};
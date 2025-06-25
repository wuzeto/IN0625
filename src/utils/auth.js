// 模拟用户数据
const users = [
    {
        username: 'wuzeto',
        password: '123456', // 实际项目中应该使用加密密码
        name: '吴泽涛',
        role: 'admin'
    },
    {
        username: 'test',
        password: 'test123',
        name: '测试用户',
        role: 'user'
    }
];

/**
 * 用户登录验证
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<Object>} 用户信息
 */
export const login = (username, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(
                u => u.username === username && u.password === password
            );

            if (user) {
                const { password, ...userInfo } = user;
                resolve(userInfo);
            } else {
                reject(new Error('用户名或密码错误'));
            }
        }, 300);
    });
};

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息
 */
export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');

    if (!token || !userInfo) {
        return null;
    }

    try {
        return JSON.parse(userInfo);
    } catch {
        return null;
    }
};

/**
 * 退出登录
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
};
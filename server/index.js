import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';

// 导入路由
import layersRouter from './routes/layers.js';
import pointsRouter from './routes/points.js';
import regionsRouter from './routes/regions.js';
import statisticsRouter from './routes/statistics.js';

// 导入WebSocket处理
import { setupSocketIO } from './utils/socket.js';

// 初始化环境变量
dotenv.config();

// 创建Express应用
const app = express();
const httpServer = createServer(app);

// 配置Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 中间件配置
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api/layers', layersRouter);
app.use('/api/points', pointsRouter);
app.use('/api/regions', regionsRouter);
app.use('/api/statistics', statisticsRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 设置Socket.IO事件处理
setupSocketIO(io);

// 启动服务器
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    
    // 启动HTTP服务器
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server is ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// 优雅退出处理
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
import process from 'node:process';

export default () => ({
  host: process.env.HOST || '0.0.0.0',
  port: Number.parseInt(process.env.PORT || '5001', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/techrun-server',
  jwtSecret: process.env.JWT_SECRET || 'THIS_IS_A_SECRET',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
});

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { PORT, CORS_ORIGIN } from './src/config/env.js';
import { notFoundHandler, errorHandler } from './src/middleware/errorHandler.js';
import { setIo } from './src/sockets/ioInstance.js';
import { registerMarketSocket } from './src/sockets/marketSocket.js';
import { sweepExpiredAuctions } from './src/controllers/marketController.js';

import authRoutes from './src/routes/authRoutes.js';
import farmerRoutes from './src/routes/farmerRoutes.js';
import buyerRoutes from './src/routes/buyerRoutes.js';
import marketRoutes from './src/routes/marketRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import priceRoutes from './src/routes/priceRoutes.js';
import weatherRoutes from './src/routes/weatherRoutes.js';

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'kisan-setu-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/weather', weatherRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CORS_ORIGIN, credentials: true } });
setIo(io);
registerMarketSocket(io);

// Periodic sweep so auctions time out even when nobody is polling the list.
setInterval(sweepExpiredAuctions, 5000);

server.listen(PORT, () => {
  console.log(`Kisan Setu backend listening on http://localhost:${PORT}`);
});

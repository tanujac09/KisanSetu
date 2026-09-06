import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'kisan-setu-super-secret-change-me';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

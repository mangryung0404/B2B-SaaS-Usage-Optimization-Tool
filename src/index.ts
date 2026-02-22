import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

// 환경변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Prisma 및 Stripe 초기화
const prisma = new PrismaClient();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16', // 최신(또는 지원) 버전에 맞게 설정
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 헬스 체크 엔드포인트
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'B2B SaaS Optimization Tool API is running!' });
});

// 향후 MCP 및 비즈니스 라우터 연결 영역
// app.use('/api/...', ...);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

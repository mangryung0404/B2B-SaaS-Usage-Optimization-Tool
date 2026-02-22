import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const app = new Hono();

// 기본 미들웨어 설정 (CORS 미들웨어 처리 등)
app.use('*', cors());

// 💡 엣지 환경에선 Prisma Accelerate URL 필요 시 아래처럼 주입 가능합니다. 추후 수정 가능.
// const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

app.get('/', (c) => {
    return c.json({
        status: 'ok',
        message: 'Welcome to B2B SaaS Usage Optimization API!',
        docs: 'Please append /health to check server status.'
    });
});

app.get('/health', (c) => {
    return c.json({ status: 'ok', message: 'B2B SaaS Optimization Tool API is running on Hono (Cloudflare Edge)!' });
});

// Cloudflare Workers와 호환되는 기본 Export 방식
export default app;

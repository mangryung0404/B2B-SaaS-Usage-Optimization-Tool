import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();
const server = new McpServer({
    name: "stripe-optimization-mcp",
    version: "1.0.0"
});

/**
 * 툴 1: 사용자 이메일로 활성 구독 정보 가져오기
 */
server.tool(
    "get_active_subscription",
    { email: z.string().email() },
    async ({ email }: { email: string }) => {
        try {
            // 1. DB에서 사용자 조회
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user || !user.stripeCustomerId) {
                return {
                    content: [{ type: "text", text: `Error: User not found or no Stripe Customer ID for email ${email}` }]
                };
            }

            // 2. Stripe API 호출하여 활성 구독 조회
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'active',
                limit: 1,
            });

            if (subscriptions.data.length === 0) {
                return {
                    content: [{ type: "text", text: `No active subscriptions found for user ${email}` }]
                };
            }

            const activeSub = subscriptions.data[0];
            const planInfo = activeSub.items.data[0].plan;

            return {
                content: [{
                    type: "text",
                    text: `Active Subscription Found:\nStatus: ${activeSub.status}\nCurrent Period End: ${new Date(activeSub.current_period_end * 1000).toLocaleDateString()}\nPlan Amount: ${(planInfo.amount || 0) / 100} ${planInfo.currency}`
                }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error retrieving subscription: ${error.message}` }]
            };
        }
    }
);

// 서버 구동 함수 (Express index.ts 등에서 호출 가능하지만, 기본적으로 Stdio 통신을 가정)
export async function startMcpServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP Server running on stdio");
}

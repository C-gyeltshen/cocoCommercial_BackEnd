import { Hono } from 'hono';
import { PrismaClient} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()

app.get('/merchant', (c) => {
    return c.text('Hello its cocoCommercial')
})
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Prisma } from '@prisma/client';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient()

import test from './merchnat.js';
import products from './product.js';
import stores from './stores.js';
import customers from './customers.js'
import orders from './orders.js'
import orderStatus from './orderStatus.js'
import orderDashbord from './orderDashbord.js'

const app = new Hono()

app.route('/merchant',test)
app.route('/products',products)
app.route('/stores',stores)
app.route('/customers',customers)
app.route('/orders',orders)
app.route('/orderStatus',orderStatus)
app.route('/orderDashbord', orderDashbord)

app.get('/', (c) => {
  return c.text('Hello its cocoCommercial')
})

const port = 8080
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
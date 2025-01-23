import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Prisma } from '@prisma/client';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { supabase } from './supabaseClient.js';

const prisma = new PrismaClient()

import test from './merchnat.js';
import products from './product.js';
import stores from './stores.js';
import customers from './customers.js'
import orders from './orders.js'
import orderStatus from './orderStatus.js'
import orderDashbord from './orderDashbord.js'
import auth from './auth.js'
import type { Context } from 'hono';

const app = new Hono()

app.route('/merchant',test)
app.route('/products',products)
app.route('/stores',stores)
app.route('/customers',customers)
app.route('/orders',orders)
app.route('/orderStatus',orderStatus)
app.route('/orderDashbord', orderDashbord)
app.route('/auth', auth)

app.get('/', (c) => {
  return c.text('Hello its cocoCommercial')
})

interface CustomContext extends Context {
  user?: Record<string, any>; // Add properties you want to attach
}

app.use('/secure/*', async (c: CustomContext, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.user = data.user;
  await next();
});


app.get('/secure/data', (c: CustomContext) => {
  const user = c.user; // Access the user from context
  return c.json({ message: 'Secure data', user });
});


const port = 8080
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
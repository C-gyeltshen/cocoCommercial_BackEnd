import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { supabase } from './supabaseClient.js';

const prisma = new PrismaClient();
const app = new Hono();

app.get('/auth', (c) => {
    return c.text('Hello! You are in the auth route.');
});

app.post('/signup', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ message: 'Signup successful', data });
});

app.post('/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ message: 'Login successful', data });
});

app.post('/logout', async (c) => {
    const { error } = await supabase.auth.signOut();
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ message: 'Logged out successfully' });
});

export default app;

import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { supabase } from "./supabaseClient.js";
import { cors } from "hono/cors";

const prisma = new PrismaClient();
const app = new Hono();

app.get("/auth", (c) => {
  return c.text("Hello! You are in the auth route.");
});

app.use(
  "*",
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies if needed
  })
);

app.post("/signup", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password)
    return c.json({ error: "Email and password are required" }, 400);

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ message: "Signup successful", data });
});

app.post("/merchant/signup", async (c) => {
  try {
    const body = await c.req.json();
    const {
      email,
      password,
      name,
      phoneNumber,
      dzongkhag,
      gewog,
      storeName,
      storeDescription,
      storeDzongkhag,
      storeGewog,
    } = body;
    if (!email || !password || !name || !phoneNumber || !dzongkhag || !gewog) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    console.log("Received data:", body);
    // Sign up user in Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });
    console.log("signup success", data);
    if (error) {
      return c.json({ error: error.message }, 400);
    }
    // Check if merchant already exists
    const existingMerchant = await prisma.merchant.findUnique({
      where: { email: data.user?.email },
      select: { email: true, name: true },
    });
    if (existingMerchant) {
      return c.json(
        { error: `Merchant with email ${email} already exists` },
        400
      );
    }
    // Create new merchant
    const newMerchant = await prisma.merchant.create({
      data: {
        name: name,
        email: email,
        password: password,
        dzongkhag: dzongkhag,
        gewog: gewog,
      },
    });
    // Create associated store
    const newStore = await prisma.store.create({
      data: {
        storeName,
        storeDescription,
        storeDzongkhag,
        storeGewog,
        merchantId: newMerchant.id,
      },
    });
    console.log(
      `Merchant ${name} created with store ID ${newStore.id} and merchant ID ${newMerchant.id}`
    );
    return c.json(
      { message: `User successfully created with username ${name}` },
      200
    );
  } catch (err) {
    return c.json({ error: "Invalid JSON data" }, 400);
    console.error("Signup error:", err);
    // return c.json({ error: "Invalid request data" }, 400);
  }
});

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password)
    return c.json({ error: "Email and password are required" }, 400);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ message: "Login successful", data });
});

app.post("/logout", async (c) => {
  const { error } = await supabase.auth.signOut();

  if (error) return c.json({ error: error.message }, 400);

  return c.json({ message: "Logged out successfully" });
});

export default app;

import { Hono } from 'hono';
import { PrismaClient} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()

app.get('/merchant', (c) => {
    return c.text('Hello its cocoCommercial')
})

// Creating a new merchnat
app.post('/create/merchants/stores', async (c) => {
    try {
        const body = await c.req.json();
        // Check if the email already exists
        const check = await prisma.merchant.findUnique({
            where: {
            email: body.email,
            },
            select: {
            email: true,
            name: true
            }
        });
        if (check) {
            return c.json({ error: `Merchant with this ${body.email} with username ${body.name} already exists` }, 400);
        }
        // Create the new merchant
        const result = await prisma.merchant.create({
            data: {
            name: body.name,
            email: body.email,
            password: body.password,
            dzongkhag: body.dzongkhag,
            gewog: body.gewog,
            image: body.image
            }
        });
        // Creating a new store associated with the merchant
        const stores = await prisma.store.create({
            data:{
                storeName: body.storeName,
                storeDescription:body.storeDescription,
                storeDzongkhag:body.storeDzongkhag,
                storeGewog:body.storeGewog,
                storeVillage:body.storeVillage,
                merchantId:result.id, 
                image: body.image
            }
        })
        console.log(` A new merchnat ${body.name} is been created with store_id ${stores.id} and merchant_id ${result.id}`)
        return c.json({ message: `User Succesfully created with the username ${body.name}` }, 200);
        } catch (error) {
        const err = error as Error
        return c.json({ error: "An error occurred", details: err.message }, 500);
        }
    });// Creating a new merchnat
    app.post('/create/merchants/stores', async (c) => {
        try {
        const body = await c.req.json();
        // Check if the email already exists
        const check = await prisma.merchant.findUnique({
            where: {
            email: body.email,
            },
            select: {
            email: true,
            name: true
            }
        });
        if (check) {
            return c.json({ error: `Merchant with this ${body.email} with username ${body.name} already exists` }, 400);
        }
        // Create the new merchant
        const result = await prisma.merchant.create({
            data: {
                name: body.name,
                email: body.email,
                password: body.password,
                dzongkhag: body.dzongkhag,
                gewog: body.gewog,
                image: body.image
            }
        });
        // Creating a new store associated with the merchant
        const stores = await prisma.store.create({
            data:{
                storeName: body.storeName,
                storeDescription:body.storeDescription,
                storeDzongkhag:body.storeDzongkhag,
                storeGewog:body.storeGewog,
                storeVillage:body.storeVillage,
                merchantId:result.id, 
                image: body.image
            }
        })
        console.log(` A new merchnat ${body.name} is been created with store_id ${stores.id} and merchant_id ${result.id}`)
        return c.json({ message: `User Succesfully created with the username ${body.name}` }, 200);
        } catch (error) {
        const err = error as Error
        return c.json({ error: "An error occurred", details: err.message }, 500);
        }
    });
export default app
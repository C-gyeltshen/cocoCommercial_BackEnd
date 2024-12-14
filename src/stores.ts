import { Hono } from 'hono';
import { PrismaClient} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()

app.get('/ok', async(c)=>{
    return c.json({
        message:"welcome to stores endpoints"
    })
})

// Update the store details of a specific store  
app.patch('/update/stores/:id', async (c)=>{
    try{
        const store_id = c.req.param("id")
        const body = await c.req.json()
    
        const store = await prisma.store.update({
            where: {
            id:parseInt(store_id)
            },
            data :{
            storeName:body.storeName,
            storeDescription:body.storeDescription,
            storeDzongkhag:body.storeDzongkhag,
            storeGewog:body.storeGewog,
            storeVillage:body.storeVillage,
            updatedAt:new Date()
            }
        })
        return c.json(store, 200); 
        }catch(error){
        console.error("Error updating store:", error);
        return c.json({ error: "Unable to update store. Please try again." }, 500);
        }
    })

// Paginated endpoint to get the store list
app.get('/get/stores', async (c)=>{
    try{
        const page = parseInt(c.req.query("page") || "0", 10)
        const limit = parseInt(c.req.query("limit") || "2", 10)
        if (isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid page or limit values" }, 400);
        }
        const total_data = await prisma.store.count()
        // if the page exceeds the data return a empty resond
        if (page * limit >= total_data) {
            return c.json({
            products: [],
            meta_data: {
                total_data,
                total_pages: Math.ceil(total_data / limit),
                page,
                limit,
            },
            });
        }
        const store_list = await prisma.store.findMany({
            skip: page * limit,
            take: limit,
        });
        return c.json({
            products: store_list,
            meta_data: {
            total_data,
            total_pages: Math.ceil(total_data / limit),
            page,
            limit,
            },
        });
        }catch(error){
        console.error("Error fetching store list:", error);
        return c.json({ error: "An unexpected error occurred" }, 500);
        }
    })

export default app
import { Hono } from 'hono';
import { PrismaClient} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()
app.get('/products', (c) => c.json('list products'))



//API Pagination for product listing of a particular store
app.get('/stores/:id/products', async (c) => {
    try {
        const store_id = c.req.param("id");
        const page = parseInt(c.req.query("page") || "0", 10); 
        const limit = parseInt(c.req.query("limit") || "2", 10); 
        if (isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid page or limit values" }, 400); // Bad Request
        }
        const products = await prisma.product.findMany({
            where:{
                storeId:parseInt(store_id)
            },
            select:{
                productName:true,
                productPrice:true,
                stockQuantity:true,
                description:true
            }
        })
        const offset = page * limit;
        const paginatedProducts = products.slice(offset, offset + limit);
        return c.json({
            products: paginatedProducts,
            meta_data: {
            total_data: products.length,
            page,
            limit,
            },
        });
        } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500);
        }
    });


// Add new product to a store
app.post('/stores/:id/products', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.json()
        // Create a new product associated with the store
        const product = await prisma.product.create({
            data: {
                productName: body.productName,
                image: body.image,
                description: body.description,
                stockQuantity: body.stockQuantity,
                productPrice: body.productPrice,
                storeId: parseInt(id) 
            }
        })
        return c.json({ message: `Product ${body.productName} is been successfully added to your products`, product })
        } catch (error) {
            console.error("Error creating product:", error)
            const err = error as Error
            return c.json({
                error: "An error occurred while creating the product",
                details: err.message || "Unknown error"
            }, 500)
        }
    })
    

export default app
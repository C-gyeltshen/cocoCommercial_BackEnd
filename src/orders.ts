import { Hono } from 'hono';
import { PrismaClient, OrderStatus} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()

app.get('/ok', async(c)=>{
    return c.json({
        message:"you are in order page"
    })
})


// Create a new order to a specific store
app.post('/create/orders/stores/:store_id/customer/:customer_id/orders', async (c) => {
    try {
        const body = await c.req.json();
        const store_id = parseInt(c.req.param('store_id'));
        const customer_id = parseInt(c.req.param('customer_id'));
    
        // Validate store
        const store_name = await prisma.store.findUnique({
            where: { id: store_id },
            select: { storeName: true },
        });
        if (!store_name) {
            return c.json({ error: 'Store not found' }, 404);
        }
    
        // Validate order items
        if (!Array.isArray(body.orderItems) || body.orderItems.length === 0) {
            return c.json({ error: 'Order must include at least one item' }, 400);
        }
    
        // Validate stock for each item
        for (const orderItem of body.orderItems) {
            const product = await prisma.product.findUnique({
            where: { id: orderItem.productId },
            });
    
            if (!product) {
            return c.json(
                { error: `Product with ID ${orderItem.productId} not found` },
                404
            );
            }
    
            if (product.stockQuantity < orderItem.quantity) {
            return c.json(
                { error: `Insufficient stock for product ${product.productName}` },
                400
            );
            }
        }
    
        // Create the order with nested order items
        const create_order = await prisma.customerOrder.create({
            data: {
                customerId: customer_id,
                storeId: store_id,
                orderDate: new Date(),
                fulfillmentDate: new Date(body.fulfillmentDate),
                totalAmount: body.totalAmount,
                orderStatus: OrderStatus.AWAITING_PAYMENT, 
                addressDescription: body.addressDescription,
                dzongkhag: body.dzongkhag,
                gewog: body.gewog,
                // image: body.image,
                village: body.village,
                latitude: body.latitude,
                longitude: body.longitude,
                phoneNumber: body.phoneNumber,
                orderItems: {
                    create: body.orderItems.map((orderItem: any) => ({
                    quantity: orderItem.quantity,
                    productId: orderItem.productId,
                    unitPrice: orderItem.unitPrice,
                    })),
                },
            },
            include: { orderItems: true },
        });
    
        // Decrement the stockQuantity when an order is made
        for (const orderItem of body.orderItems) {
            await prisma.product.update({
            where: { id: orderItem.productId },
            data: {
                stockQuantity: {
                decrement: orderItem.quantity,
                },
            },
            });
        }
    
        // Return a success message
        return c.json({
            message: `Your order from ${store_name.storeName} has been placed successfully! Thank you!`,
            order: create_order,
        });
        } catch (error) {
        const err = error as Error;
        console.error('Error creating order:', err.message);
        return c.json({ error: 'An error occurred', details: err.message }, 500);
        }
    });


// Retrive all the order made to a particular store (ALL)
app.get('/get/stores/:id/orders', async (c) => {
    try {
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2", 10);
        // check whether the request parameters are valid or not
        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }
        // Count total orders for the store
        const total_data = await prisma.customerOrder.count({
            where: {
            storeId: store_id,
            },
        });
        // Fetch paginated orders
        const order_list = await prisma.customerOrder.findMany({
            where: {
            storeId: store_id,
            },
            skip: page * limit,
            take: limit,
        });
    
        // Check if the page exceeds available data
        if (page * limit >= total_data) {
            return c.json({
            orders: [],
            meta_data: {
                total_data,
                total_pages: Math.ceil(total_data / limit),
                page,
                limit,
            },
            });
        }
        // Return paginated orders and metadata
        return c.json({
            orders: order_list,
            meta_data: {
            total_data,
            total_pages: Math.ceil(total_data / limit),
            page,
            limit,
            },
        });
        } catch (error) {
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
        }
    });


// Create a new order manually by the store owner 
app.post('/create/order/store/:id/orders', async (c)=>{
    try{
        const body = await c.req.json()
        const store_id = parseInt(c.req.param("id"))
        if (!Array.isArray(body.orderItems) || body.orderItems.length === 0) {
            return c.json({ error: "Order must include at least one item" }, 400);
        }
    
        const customer_ID = await prisma.customer.findUnique({
            where: {
            email:  body.email
            },
            select: {
            id : true
            }
        })
        console.log("Customer id is :",customer_ID)
        if (!customer_ID) {
            return c.json({ error: "Customer not found" }, 404);
        }
    
        const createOrders = await prisma.customerOrder.create({
            data: {
                customerId: customer_ID.id,
                storeId: store_id,
                orderDate: new Date(),
                fulfillmentDate: new Date(body.fulfillmentDate),
                totalAmount: body.totalAmount,
                image: body.image,
                orderStatus: "ORDER_CONFIRMED", 
                addressDescription: body.addressDescription,
                dzongkhag: body.dzongkhag,
                gewog: body.gewog,
                village: body.village,
                latitude: body.latitude,
                longitude: body.longitude,
                phoneNumber: body.phoneNumber,
                orderItems: {                
                    create: [
                    ...body.orderItems.map((orderItem:any)=>{
                        return {
                        "quantity":orderItem.quantity,
                        "productId":orderItem.productId,
                        "unitPrice":orderItem.unitPrice,
                        }
                    })
                    ]
                }
                },
                include: {
                orderItems: true, 
                },
        })
        for (const orderItem of body.orderItems) {
            await prisma.product.update({
            where: { id: orderItem.productId },
            data: {
                stockQuantity: {
                decrement: orderItem.quantity, 
                },
            },
            });
        }
        return c.json({
            message: "You have succesfully added a new order manully",
            order: createOrders,
        });
        }catch(error){
        const err = error as Error;
        console.error("Error creating order:", err.message);
        return c.json({ error: "An error occurred", details: err.message }, 500);
        }
    }) 
    
    
// Retrieve all the orders made by a customer
app.get('/get/orders/customer/:id', async (c) => {
    try {
        const customer_id = parseInt(c.req.param("id"));
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2", 10);
    
        // Validate the request parameters
        if (isNaN(customer_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid customer ID, page, or limit values" }, 400);
        }
    
        // Calculate pagination
        const skip = page * limit;
    
        // Fetch total count of orders for the customer
        const total = await prisma.customerOrder.count({
            where: {
            customerId: customer_id,
            },
        });
        if (total === 0) {
            return c.json({ error: "No orders found for the customer" }, 404);
        }
    
        // Fetch paginated orders for the customer
        const orders = await prisma.customerOrder.findMany({
            where: {
            customerId: customer_id,
            },
            skip: skip,
            take: limit,
        });
    
        // Return the orders and metadata
        return c.json({
            total,
            page,
            limit,
            orders,
        });
        } catch (error) {
        console.error("Error retrieving customer orders:", error);
        return c.json({ error: "Internal server error" }, 500);
        }
    });


export default app
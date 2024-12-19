import { Hono } from 'hono';
import { PrismaClient, OrderStatus} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()

app.get('/dashbord', async(c)=>{
    return c.json({
        message:"you are in order page"
    })
})


// Retrive all the order irrespective of orderStatus
app.get('/get/allOrders/store/:id', async(c)=>{
    try{
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2",10)

        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }

        const totalData = await prisma.customerOrder.count({
            where: {
                storeId:store_id,
            }
        })
        const allOrder = await prisma.customerOrder.findMany({
            where:{
                storeId:store_id,
            },
            skip: page * limit, 
            take:limit
        });
        if (page * limit >= totalData) {
            return c.json({
            orders: [],
            meta_data: {
                totalData,
                total_pages: Math.ceil(totalData / limit),
                page,
                limit,
            },
            });
        }
        return c.json({
            orders: allOrder,
            meta_data: {
            totalData,
            total_pages: Math.ceil(totalData / limit),
            page,
            limit,
            },
        });
    }catch(error){
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
    }
})


// Retrive all the order with orderStatus AWAITING_PAYMENT.
app.get('/get/customerOrder/AWAITING_PAYMENT/store/:id', async(c)=>{
    try{
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2",10)

        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }

        const totalData = await prisma.customerOrder.count({
            where: {
                storeId:store_id,
                orderStatus:OrderStatus.AWAITING_PAYMENT
            }
        })
        const allOrder = await prisma.customerOrder.findMany({
            where:{
                storeId:store_id,
                orderStatus:OrderStatus.AWAITING_PAYMENT
            },
            skip: page * limit, 
            take:limit
        });
        if (page * limit >= totalData) {
            return c.json({
            orders: [],
            meta_data: {
                totalData,
                total_pages: Math.ceil(totalData / limit),
                page,
                limit,
            },
            });
        }
        return c.json({
            orders: allOrder,
            meta_data: {
            totalData,
            total_pages: Math.ceil(totalData / limit),
            page,
            limit,
            },
        });
    }catch(error){
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
    }
})


// Retrive all the order with the orderStatus ORDER_CONFIRMED.
app.get('/get/customerOrder/ORDER_CONFIRMED/store/:id', async(c)=>{
    try{
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2",10)

        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }

        const totalData = await prisma.customerOrder.count({
            where: {
                storeId:store_id,
                orderStatus:OrderStatus.ORDER_CONFIRMED
            }
        })
        const allOrder = await prisma.customerOrder.findMany({
            where:{
                storeId:store_id,
                orderStatus:OrderStatus.ORDER_CONFIRMED
            },
            skip: page * limit, 
            take:limit
        });
        if (page * limit >= totalData) {
            return c.json({
            orders: [],
            meta_data: {
                totalData,
                total_pages: Math.ceil(totalData / limit),
                page,
                limit,
            },
            });
        }
        return c.json({
            orders: allOrder,
            meta_data: {
            totalData,
            total_pages: Math.ceil(totalData / limit),
            page,
            limit,
            },
        });
    }catch(error){
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
    }
})


// Retrive all the order with the orderStatus of ORDER_PROCESSING.
app.get('/get/customerOrder/ORDER_PROCESSING/store/:id', async(c)=>{
    try{
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2",10)

        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }

        const totalData = await prisma.customerOrder.count({
            where: {
                storeId:store_id,
                orderStatus:OrderStatus.ORDER_PROCESSING
            }
        })
        const allOrder = await prisma.customerOrder.findMany({
            where:{
                storeId:store_id,
                orderStatus:OrderStatus.ORDER_PROCESSING
            },
            skip: page * limit, 
            take:limit
        });
        if (page * limit >= totalData) {
            return c.json({
            orders: [],
            meta_data: {
                totalData,
                total_pages: Math.ceil(totalData / limit),
                page,
                limit,
            },
            });
        }
        return c.json({
            orders: allOrder,
            meta_data: {
            totalData,
            total_pages: Math.ceil(totalData / limit),
            page,
            limit,
            },
        });
    }catch(error){
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
    }
})


// Retrive all the order with the orderStatus of IN_TRANSIT.
app.get('/get/customerOrder/IN_TRANSIT/store/:id', async(c)=>{
    try{
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2",10)

        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }

        const totalData = await prisma.customerOrder.count({
            where: {
                storeId:store_id,
                orderStatus:OrderStatus.IN_TRANSIT
            }
        })
        const allOrder = await prisma.customerOrder.findMany({
            where:{
                storeId:store_id,
                orderStatus:OrderStatus.IN_TRANSIT
            },
            skip: page * limit, 
            take:limit
        });
        if (page * limit >= totalData) {
            return c.json({
            orders: [],
            meta_data: {
                totalData,
                total_pages: Math.ceil(totalData / limit),
                page,
                limit,
            },
            });
        }
        return c.json({
            orders: allOrder,
            meta_data: {
            totalData,
            total_pages: Math.ceil(totalData / limit),
            page,
            limit,
            },
        });
    }catch(error){
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
    }
})



// Retrive all the order with the orderStatus of DELIVERED.
app.get('/get/customerOrder/DELIVERED/store/:id', async(c)=>{
    try{
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2",10)

        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }

        const totalData = await prisma.customerOrder.count({
            where: {
                storeId:store_id,
                orderStatus:OrderStatus.DELIVERED
            }
        })
        const allOrder = await prisma.customerOrder.findMany({
            where:{
                storeId:store_id,
                orderStatus:OrderStatus.DELIVERED
            },
            skip: page * limit, 
            take:limit
        });
        if (page * limit >= totalData) {
            return c.json({
            orders: [],
            meta_data: {
                totalData,
                total_pages: Math.ceil(totalData / limit),
                page,
                limit,
            },
            });
        }
        return c.json({
            orders: allOrder,
            meta_data: {
            totalData,
            total_pages: Math.ceil(totalData / limit),
            page,
            limit,
            },
        });
    }catch(error){
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
    }
})



// Retrive all the order with the orderStatus of DELIVERED.
app.get('/get/customerOrder/CANCELED/store/:id', async(c)=>{
    try{
        const store_id = parseInt(c.req.param("id"), 10);
        const page = parseInt(c.req.query("page") || "0", 10);
        const limit = parseInt(c.req.query("limit") || "2",10)

        if (isNaN(store_id) || isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
            return c.json({ error: "Invalid store ID, page, or limit values" }, 400);
        }

        const totalData = await prisma.customerOrder.count({
            where: {
                storeId:store_id,
                orderStatus:OrderStatus.CANCELED
            }
        })
        const allOrder = await prisma.customerOrder.findMany({
            where:{
                storeId:store_id,
                orderStatus:OrderStatus.CANCELED
            },
            skip: page * limit, 
            take:limit
        });
        if (page * limit >= totalData) {
            return c.json({
            orders: [],
            meta_data: {
                totalData,
                total_pages: Math.ceil(totalData / limit),
                page,
                limit,
            },
            });
        }
        return c.json({
            orders: allOrder,
            meta_data: {
            totalData,
            total_pages: Math.ceil(totalData / limit),
            page,
            limit,
            },
        });
    }catch(error){
        const err = error as Error;
        return c.json({ error: "An error occurred", details: err.message }, 500);
    }
})


export default app;
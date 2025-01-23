import { Hono } from 'hono';
import { Prisma } from '@prisma/client';

import { PrismaClient, OrderStatus} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()

app.get('/ok', async(c)=>{
    return c.json({
        message:"you are in orderStatus page"
    })
})

// Update order status form AWAITING_PAYMENT to ORDER_CONFIRMED for a specific order
app.patch('/update/orderStatus/awaitingPayment/customerOrders/:order_ID', async (c) => {
    try {
      // Parse and validate the order_ID parameter
        const orderID = parseInt(c.req.param("order_ID"), 10);
        if (isNaN(orderID)) {
            return c.json({ error: "Invalid order ID, must be a number" }, 400);
        }
    
        // Attempt to update the order status
        const updatedOrder = await prisma.customerOrder.update({
            where: { id: orderID },
            data: {
            orderStatus: OrderStatus.ORDER_CONFIRMED 
            },
        });
        // Return success response
        return c.json({
            message: "Order status updated successfully",
            order: updatedOrder,
        });
        } catch (error) {
        const err = error as Error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
            // Record not found
            return c.json({ error: "Order not found" }, 404);
            }
        }
        
        return c.json(
            {
            error: "An unexpected error occurred",
            details: err.message,
            },
            500
        );
        }
    });


// Update orderStatus from ORDER_CONFIRMED to ORDER_PROCESSING
app.patch('/update/orderStatus/orderConfirmed/customerOrders/:order_ID', async (c)=>{
    try{
       // Parse and validate the order_ID parameter
        const orderID = parseInt(c.req.param("order_ID"), 10);
        if (isNaN(orderID)) {
            return c.json({ error: "Invalid order ID, must be a number" }, 400);
            }
            
            // Attempt to update the order status
            const updatedOrder = await prisma.customerOrder.update({
            where: { id: orderID },
            data: {
                orderStatus: OrderStatus.ORDER_PROCESSING 
            },
            });
            // Return success response
            return c.json({
            message: "Order status updated successfully",
            order: updatedOrder,
            });
        }catch(error){
        const err = error as Error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
            // Record not found
            return c.json({ error: "Order not found" }, 404);
            }
        }
        
        return c.json(
            {
            error: "An unexpected error occurred",
            details: err.message,
            },
            500
        );
        }
    })


// Update orderStatus from ORDER_PROCESSING to IN_TRANSIT
app.patch('/update/orderStatus/inTransit/customerOrders/:order_ID', async (c)=>{
    try{
       // Parse and validate the order_ID parameter
        const orderID = parseInt(c.req.param("order_ID"), 10);
        if (isNaN(orderID)) {
            return c.json({ error: "Invalid order ID, must be a number" }, 400);
            }
        
            // Attempt to update the order status
            const updatedOrder = await prisma.customerOrder.update({
            where: { id: orderID },
            data: {
                orderStatus: OrderStatus.IN_TRANSIT
            },
            });
            // Return success response
            return c.json({
            message: "Order status updated successfully",
            order: updatedOrder,
            });
        }catch(error){
        const err = error as Error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
            // Record not found
            return c.json({ error: "Order not found" }, 404);
            }
        }
        
        return c.json(
            {
            error: "An unexpected error occurred",
            details: err.message,
            },
            500
        );
        }
    })


// Update orderStatus from IN_TRANSIT to DELEVERED
app.patch('/update/orderStatus/delevered/customerOrders/:order_ID', async (c)=>{
    try{
       // Parse and validate the order_ID parameter
        const orderID = parseInt(c.req.param("order_ID"), 10);
        if (isNaN(orderID)) {
            return c.json({ error: "Invalid order ID, must be a number" }, 400);
            }
        
            // Attempt to update the order status
            const updatedOrder = await prisma.customerOrder.update({
            where: { id: orderID },
            data: {
                orderStatus: OrderStatus.DELIVERED
            },
            });
            // Return success response
            return c.json({
            message: "Order status updated successfully",
            order: updatedOrder,
            });
        }catch(error){
        const err = error as Error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
            // Record not found
            return c.json({ error: "Order not found" }, 404);
            }
        }
        
        return c.json(
            {
            error: "An unexpected error occurred",
            details: err.message,
            },
            500
        );
        }
    })


// Update orderStatus from DELEVERED to CANCELED
app.patch('/update/orderStatus/canceled/customerOrders/:order_ID', async (c)=>{
    try{
       // Parse and validate the order_ID parameter
        const orderID = parseInt(c.req.param("order_ID"), 10);
        if (isNaN(orderID)) {
            return c.json({ error: "Invalid order ID, must be a number" }, 400);
            }
        
            // Attempt to update the order status
            const updatedOrder = await prisma.customerOrder.update({
            where: { id: orderID },
            data: {
                orderStatus: OrderStatus.CANCELED
            },
            });
            // Return success response
            return c.json({
            message: "Order status updated successfully",
            order: updatedOrder,
            });
        }catch(error){
        const err = error as Error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
            // Record not found
            return c.json({ error: "Order not found" }, 404);
            }
        }
        
        return c.json(
            {
            error: "An unexpected error occurred",
            details: err.message,
            },
            500
        );
        }
    })
    

export default app
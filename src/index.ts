import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient, type OrderItem } from '@prisma/client'
const prisma = new PrismaClient()

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello its chimiq')
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
        village: body.village
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
        merchantId:result.id
      }
    })
    console.log(` A new merchnat ${body.name} is been created with store_id ${stores.id} and merchant_id ${result.id}`)
    return c.json({ message: `User Succesfully created with the username ${body.name}` }, 200);
  } catch (error) {
    const err = error as Error
    return c.json({ error: "An error occurred", details: err.message }, 500);
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


// Get the customer profile data
app.get('/get/customer/:id', async (c)=>{
  try{
    const customer_id = c.req.param("id")
    if (isNaN(parseInt(customer_id))) {
      return c.json({ error: "Invalid customer ID Bad Request" }, 400); 
    }
    const customer_data = await prisma.customer.findUnique({
      where:{
        id:parseInt(customer_id)
      },
      select:{
        name:true,
        email:true,
        phoneNumber:true,
        dzongkhag:true,
        gewog:true,
        village:true,
      }
    })
    if (!customer_data) {
      return c.json({ error: "Customer not found" }, 404); 
    }
    return c.json({customerProfile:customer_data})
  }catch(error){
    console.error("Error fetching customer data:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
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


//Create customer
app.post('/create/customer', async (c)=>{
  try{
    const body =  await c.req.json()
    const check = await prisma.customer.findUnique({
      where:{
        email:body.email
      },
      select:{
        name:true,
      }
    })
    if (check){
      return c.json({message:`Customer ${body.name} with email ${body.email} already exist`},404)
    }else{
      const customer = await prisma.customer.create({
        data:{
          name :body.name,
          email:body.email,
          phoneNumber:body.phoneNumber,
          dzongkhag:body.dzongkhag,
          gewog:body.gewog,
          village:body.village
        }
      })
    }
    return c.json({message:`Customer ${body.name} is created succesfull`},200)
  }catch(error){
    const err = error as Error
    return c.json({ error: "An error occurred", details: err.message }, 500);
  }
})


// Update the customer profile details
app.patch('/update/customers/:id', async (c)=>{
  try{
    const body = await c.req.json()
    const customer_id = parseInt(c.req.param("id"))
    const customer_data = await prisma.customer.update({
      where:{
        id: customer_id
      },
      data:{
        name : body.name,
        email: body.email,
        phoneNumber: body.phoneNumber,
        dzongkhag: body.dzongkhag,
        gewog: body.gewog,
        village: body.village,
        updatedAt: new Date()
      }
    })
    return c.json({message:"Customer data updated succesfully"})
  }catch(error){
    const err = error as Error
    return c.json({ error: "An error occurred", details: err.message }, 500);
  }
})

// =================================================
// Create a new order to a specific store
app.post('/create/orders/stores/:store_id/customer/:customer_id/orders', async (c) => {
  try {
    const body = await c.req.json();
    const store_id = parseInt(c.req.param("store_id"));
    const customer_id = parseInt(c.req.param("customer_id"));

    // Validate store
    const store_name = await prisma.store.findUnique({
      where: { id: store_id },
      select: { storeName: true },
    });
    if (!store_name) {
      return c.json({ error: "Store not found" }, 404);
    }

    // Validate order items
    if (!Array.isArray(body.orderItems) || body.orderItems.length === 0) {
      return c.json({ error: "Order must include at least one item" }, 400);
    }

    // Validate stock for each item
    for (const orderItem of body.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: orderItem.productId },
      });

      if (!product) {
        return c.json({ error: `Product with ID ${orderItem.productId} not found` }, 404);
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
        orderStatus: false,
        addressDescription: body.addressDescription,
        dzongkhag: body.dzongkhag,
        gewog: body.gewog,
        village: body.village,
        latitude: body.latitude,
        longitude: body.longitude,
        phoneNumber: body.phoneNumber,
        orderItems: {
          create: body.orderItems.map((orderItem: any) => ({
            quantity: orderItem.quantity,
            productId: orderItem.productId,
          })),
        },
      },
      include: { orderItems: true },
    });

    // decrement the stockQuantity when an order is made
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
    console.error("Error creating order:", err.message);
    return c.json({ error: "An error occurred", details: err.message }, 500);
  }
});



// Retrive all the order made to a particular store
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
    const createOrders = await prisma.customerOrder.create({
      data: {
        customerId: store_id,
        storeId: store_id,
        orderDate: new Date(),
        fulfillmentDate: new Date(body.fulfillmentDate),
        totalAmount: body.totalAmount,
        orderStatus: false, 
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
                "productId":orderItem.productId
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


// Update the order status of a particular product
app.patch('/update/orders/:order_id', async (c)=>{
  try{
    const order_id = parseInt(c.req.param("order_id"))
    // check whether order exist or not
    const existingOrder = await prisma.customerOrder.findUnique({
      where: { id: order_id },
    });
    if (!existingOrder) {
      return c.json({ message: "Order not found" }, 404);
    }
    if (isNaN(order_id)) {
      return c.json({ message: "Invalid order ID" }, 400); 
    }
    const update_order = await prisma.customerOrder.update({
      where:{
        id:order_id,
      },
      data:{
        orderStatus:true
      }
    })
    return c.json({ message: "Order status updated successfully", order: update_order });
  } catch (error) {
    console.error("Error updating order:", error); // Log the error for debugging
    return c.json({ message: "Internal server error" }, 500);
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


const port = 8080
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
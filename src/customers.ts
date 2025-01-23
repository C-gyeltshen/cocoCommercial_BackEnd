import { Hono } from 'hono';
import { PrismaClient} from '@prisma/client';
const prisma = new PrismaClient()

const app = new Hono()

app.get('/customers', (c) => {
    return c.text('Hello its cocoCommercial')
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
                village:body.village,
                image: body.image
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


export default app
import { Hono } from 'hono';
import { PrismaClient} from '@prisma/client';
import { cors } from 'hono/cors';
const prisma = new PrismaClient()

const app = new Hono()

app.use('*', cors()); 

app.get('/masterData', (c) => {
    return c.text('Hello its cocoCommercial')
})

app.get('/get/dzongkhags', async (c) => {
    try {
        // Fetch dzongkhags from the database
        const dzongkhags = await prisma.dzongkhags.findMany();

        // Return the data with a success message
        return c.json({
            message: "Successfully retrieved dzongkhags",
            dzongkhags, // Include the fetched data in the response
        });
    } catch (error) {
        console.error("Error in retrieving dzongkhags:", error);

        // Return an error response
        return c.json({
            message: "Internal server error",
            error: error.message, // Optionally include error details
        });
    }
});
app.post('/create/dzongkhags', async (c) => {
    try {
        const body = await c.req.json();
        if (!body.name || typeof body.name !== 'string') {
            return c.json(
                { error: 'Invalid input: "name" is required and must be a string.' },
                400
            );
        }
        const dzongkhag = await prisma.dzongkhags.create({
            data: {
                name: body.name,
            },
        });
        return c.json({
            message: `Successfully created dzongkhag: ${dzongkhag.name}`,
            dzongkhag,
        });
    } catch (error) {
        console.error('Error creating dzongkhag:', error);
        return c.json(
            { error: 'Failed to create dzongkhag. Please try again later.' },
            500
        );
    }
});


app.post('/create/gewogs/:id', async (c) => {
    try {
        const body = await c.req.json();
        console.log(body)
        
        const id = parseInt(c.req.param("id"));

        // Input validation: check if body is an array and each element has name and dzongkhag_id
        if (!Array.isArray(body) || !body.every((gewog: any) => typeof gewog.name === 'string' && typeof gewog.dzongkhag_id === 'number')) {
            return c.json(
                { error: 'Invalid input: Each gewog must have a "name" as string and "dzongkhag_id" as a number.' },
                400
            );
        }

        // Check if the dzongkhag_id is valid
        const dzongkhagId = Number(body[0].dzongkhag_id);
        if (isNaN(dzongkhagId)) {
            return c.json(
                { error: 'Invalid input: "dzongkhag_id" must be a valid number.' },
                400
            );
        }

        // Prepare the data to be inserted
        const gewogsData = body.map((gewog: { name: string; dzongkhag_id: number }) => ({
            name: gewog.name,
            dzongkhag_id: gewog.dzongkhag_id,
        }));

        // Create multiple gewogs using createMany
        const result = await prisma.gewogs.createMany({
            data: gewogsData,
        });

        return c.json({
            message: `Successfully created ${result.count} gewogs.`,
            gewogs: gewogsData, // Return the inserted gewogs data
        });
    } catch (error: unknown) {
        console.error('Error creating gewog:', error);
        
        // Handle database foreign key constraint error
        if (error instanceof Error && 'code' in error && error.code === 'P2003') {
            return c.json(
                { error: 'Invalid "dzongkhag_id": No corresponding Dzongkhag found.' },
                400
            );
        }

        return c.json(
            { error: 'Failed to create gewog. Please try again later.' },
            500
        );
    }
});




app.post('/many/create/dzongkhags', async (c) => {
    try {
        const body = await c.req.json();

        // Validate if the body is an array of dzongkhags
        if (!Array.isArray(body) || body.length === 0) {
            return c.json(
                { error: 'Invalid input: Expected an array of dzongkhags.' },
                400
            );
        }

        // Validate each dzongkhag in the array
        const invalidDzongkhags = body.filter(
            (dzongkhag) => !dzongkhag.name || typeof dzongkhag.name !== 'string'
        );
        
        if (invalidDzongkhags.length > 0) {
            return c.json(
                { error: 'Invalid input: Each dzongkhag must have a valid name (string).' },
                400
            );
        }

        // Create multiple dzongkhags at once
        const createdDzongkhags = await prisma.dzongkhags.createMany({
            data: body,
        });

        return c.json({
            message: `Successfully created ${createdDzongkhags.count} dzongkhags.`,
        });
    } catch (error: unknown) {
        console.error('Error creating dzongkhags:', error);

        return c.json(
            { error: 'Failed to create dzongkhags. Please try again later.' },
            500
        );
    }
});

app.patch('/delete', async (c) => {
    const body = await c.req.json();
    
    if (!body.id || typeof body.id !== 'number') {
        return c.json(
            { error: 'Invalid input: id must be a number.' },
            400
        );
    }
    try {
        const dzo = await prisma.dzongkhags.update({
            where: {
                id: body.id,
            },
            data: {
                name: body.name
            }
        });
        if (!dzo) {
            return c.json(
                { error: `Dzongkhag with id ${body.id} not found.` },
                404
            );
        }

        return c.json({ message: `Successfully deleted Dzongkhag with id ${body.id}.` });
    } catch (error: unknown) {
        console.error('Error deleting dzongkhag:', error);

        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            // P2025 error code indicates no record was found to delete
            return c.json(
                { error: `Dzongkhag with id ${body.id} does not exist.` },
                404
            );
        }

        // Generic error fallback
        return c.json(
            { error: 'Failed to delete dzongkhag. Please try again later.' },
            500
        );
    }
});

app.get('/get/gewogs/:id', async (c) => {
    const id = parseInt(c.req.param('id')); // Parse the ID from the request params
    
        try {
        // Use findMany to fetch all gewogs with the given dzongkhag_id
        const getGewogs = await prisma.gewogs.findMany({
            where: {
            dzongkhag_id: id, // Use direct comparison for filtering by dzongkhag_id
            },
            select: {
                name: true, // Select only the "name" field
            },
        });
        // Return the list of gewogs
        return c.json({
            gewogs: getGewogs,
        });
        } catch (error) {
        console.error(error); // Log the error for debugging
        return c.json({
            message: 'Internal server error',
        }, 500);
        }
    });
    


export default app
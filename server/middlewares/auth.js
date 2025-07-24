// Import Clerk's backend client to interact with users and metadata
import { clerkClient } from "@clerk/express"

// Middleware to check if the user is authenticated, and whether they have a premium plan
export const auth = async (req, res, next) => {
    try {
        // Extract userId and the `has()` function from Clerk's request helper
        const { userId, has } = await req.auth(); // This only works because of clerkMiddleware earlier
        
        // Check if the user has a premium plan using Clerk's plan checker
        const hasPermiumPlan = await has({ plan: 'premium' }); // returns true/false

        // Get full user details from Clerk using userId
        const user = await clerkClient.users.getUser(userId);

        // If the user is NOT premium and has some free usage stored in metadata
        if (!hasPermiumPlan && user.privateMetadata.free_usage) {
            // Attach that free_usage value to the request so routes can use it
            req.free_usage = user.privateMetadata.free_usage;
        } else {
            // If user is premium OR has no free usage left, reset free usage to 0
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });

            // Also attach 0 to the request for use in route handlers
            req.free_usage = 0;
        }

        // Tag the user’s current plan ("premium" or "free") to the request
        req.plan = hasPermiumPlan ? 'premium' : 'free';

        // All done, continue to the next middleware or route
        next();
    } catch (error) {
        // If anything fails (e.g., no user, Clerk error), return a JSON error response
        res.json({
            success: false,
            message: error.message
        });
    }
}

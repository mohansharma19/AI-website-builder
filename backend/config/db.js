import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://sharmamohan3537_db_user:qZOoeoMSaOrjU8tW@cluster0.eddf2j9.mongodb.net/AI_website_builder"
        );

        console.log("DB CONNECTED");
    } catch (error) {
        console.log("DB CONNECTION ERROR:", error);
    }
};
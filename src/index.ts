import 'dotenv/config';
import connectDB from "./lib/mongodb.js";
import app from './app.js';
import { PORT_ENV } from "./config/env.js";

const port = Number(PORT_ENV ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

async function startServer() {
  try {
    // 1. الاتصال بقاعدة البيانات أولاً والانتظار حتى ينجح
    await connectDB();
    console.log("Database connected successfully");

    // 2. تشغيل السيرفر بعد ضمان الاتصال
    app.listen(port, () => {
      console.log(`Embedding server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB, server not started:", error);
    process.exit(1);
  }
}

startServer();
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongodb/connect.js";
import postRoutes from './routes/postRoutes.js'; // Import postRoutes

dotenv.config();

const app = express();

app.use(cors());

//app.use((req, res, next) => {
  //res.header('Access-Control-Allow-Origin', '*');
  //res.header('Access-Control-Allow-Methods', 'POST');
  //res.header('Access-Control-Allow-Headers', 'Content-Type');
  //next();
//});

app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/post', postRoutes); // Mount the router

app.get('/', async (req, res) => {
  res.send('Hello from otherside-store');
});

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(3000, () => console.log('Server started on port http://localhost:3000'));
  } catch (error) {
    console.error(error);
  }
};

startServer();

export default app;

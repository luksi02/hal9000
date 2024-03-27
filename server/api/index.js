import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "../mongodb/connect.js";
import postRoutes from '../routes/postRoutes.js'; // Import postRoutes

dotenv.config();

await connectDB(process.env.MONGODB_URL);

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

app.listen(3000, () => console.log('Server ready on port 3000.'));

export default app;

import express from "express";
import mongoose from "mongoose";

// Define the Text schema
const TextSchema = new mongoose.Schema({
    text: {
        type: String,
        // required: true,
    },
});

// Create the Text model
const Text = mongoose.model("Text", TextSchema);

const router = express.Router();

//GET ALL POSTS
router.route('/').get(async (req, res) => {

    try {
        const posts = await Text.find({});
        res.status(200).json({ success: true, data: posts })
    } catch (error) {
        res.status(500).json({ success: false, message: error })
    }

});

// CREATE A POST

router.route('/').post(async (req, res) => {
    try {

        console.log('Received request body:', req.body); // Log the entire request body



      const { prompt } = req.body; // Access data from request body

      console.log('Extracted text:', prompt); // Log the extracted value
  
      // Validate prompt (example - replace with your validation logic)
      if (!prompt || prompt.trim() === '') {
        throw new Error('Prompt is required');
      }

      const newPost = new Text({ text: prompt }); // Create a new document with the text

    const savedPost = await newPost.save(); // Save the document
  
    //   const newPost = await Text.create({ prompt }); // Use create method
  
      res.status(201).json({ success: true, data: newPost });
    } catch (error) {
      console.error(error);
      let statusCode = 500;
      let message = 'Internal Server Error';
  
      if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error: ' + error.message;
      }
  
      res.status(statusCode).json({ success: false, message });
    }
  });


router.route('/upload/').post(async (req, res) => {
    try {
        const { prompt } = "propmp";
        // const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Text.create({
            // name,
            prompt,
            // photo: photoUrl.url,
        })

        const result = await Collection.insertOne(newPost);

        // res.status(201).json({ success: true, data: newPost });
        res.send(result).status(204);

        // res.status(201).json({ success: true, data: newPost });
        console.log('seems fine')
    } catch (error) {
        res.status(500).json({ success: false, message: error })
        console.log('failed')
        console.log(error)
    }
});


export default router;
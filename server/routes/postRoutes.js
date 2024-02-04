import express from "express";
import mongoose from "mongoose";

// Define the Text schema
const TextSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

// Create the Text model
const Text = mongoose.model("Text", TextSchema);

const router = express.Router();

//GET ALL POSTS
router.route('/').get(async (req,res) => {

    try {
        const posts = await Text.find({});
        res.status(200).json({ success: true, data: posts })
    } catch (error) {
        res.status(500).json({ success: false, message: error })
    }

});

// CREATE A POST

router.route('/').post(async (req,res) => {
    try {
        const { prompt } = req.body;
        // const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Text.create({
            // name,
            prompt,
            // photo: photoUrl.url,
        })

        res.status(201).json({ success: true, data: newPost });
        console.log('seems fine')
    } catch (error) {
        res.status(500).json({ success: false, message: error })
        console.log('failed')
        console.log(error)
    }
});

export default router;
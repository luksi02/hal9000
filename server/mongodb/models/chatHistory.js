// const mongoose = require("mongoose");
import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

// module.exports = ChatHistory;

export default ChatHistory;
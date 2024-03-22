"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import ChatForm from "./components/ChatForm";
import Message from "./components/Message";
import SlideOver from "./components/SlideOver";
import EmptyState from "./components/EmptyState";
import QueuedSpinner from "./components/QueuedSpinner";
import { Cog6ToothIcon, CodeBracketIcon } from "@heroicons/react/20/solid";
import { useCompletion } from "ai/react";
import { Toaster, toast } from "react-hot-toast";
import { LlamaTemplate } from "../src/prompt_template";

import { countTokens } from "./src/tokenizer.js";

// const Post = require("../server/mongodb/models/post");
// import PostSchema from "../server/mongodb/models/post";

// import ChatHistory from "../server/mongodb/models/chatHistory";
import SendServerButton from "./components_hal/ServerSendButtom";

import Replicate from "replicate";

import TextToSpeech from "./components_hal/TextToSpeech.js";

// import { Canvas, useFrame } from '@react-three/fiber';
// import { Environment, Mesh } from '@react-three/drei';

import axios from 'axios'; // Install axios for HTTP requests

// Replace 'model.glb' with the path to your 3D model file
const modelPath = 'model.glb';

// function Model() {
//   const meshRef = useRef(null);

//   useFrame(() => {
//     meshRef.current.rotation.y += 0.01; // Rotate the model slightly on each frame
//   });



const MODELS = [
  {
    id: "meta/llama-2-7b-chat",
    name: "Llama 2 7B",
    shortened: "7B",
  },
  {
    id: "meta/llama-2-13b-chat",
    name: "Llama 2 13B",
    shortened: "13B",
  },
  {
    id: "meta/llama-2-70b-chat",
    name: "Llama 2 70B",
    shortened: "70B",
  },
  {
    id: "yorickvp/llava-13b",
    name: "Llava 13B",
    shortened: "Llava",
  },
  {
    id: "nateraw/salmonn",
    name: "Salmonn",
    shortened: "Salmonn",
  },
];

const llamaTemplate = LlamaTemplate();

const generatePrompt = (template, systemPrompt, messages) => {
  const chat = messages.map((message) => ({
    role: message.isUser ? "user" : "assistant",
    content: message.text,
  }));

  return template([
    {
      role: "system",
      content: systemPrompt,
    },
    ...chat,
  ]);
};

function CTA({ shortenedModelName }) {
  if (shortenedModelName == "Llava") {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Run and fine-tune Llava in the cloud.
      </a>
    );
  } else if (shortenedModelName == "Salmonn") {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Run and fine-tune Salmonn in the cloud.
      </a>
    );
  } else {
    return (
      <a
        href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
        target="_blank"
        className="underline"
      >
        Run and fine-tune Llama 2 in the cloud.
      </a>
    );
  }
}

const metricsReducer = (state, action) => {
  switch (action.type) {
    case "START":
      return { startedAt: new Date() };
    case "FIRST_MESSAGE":
      return { ...state, firstMessageAt: new Date() };
    case "COMPLETE":
      return { ...state, completedAt: new Date() };
    default:
      throw new Error(`Unsupported action type: ${action.type}`);
  }
};

export default function HomePage() {
  const MAX_TOKENS = 4096;
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  // HAL9000 state
  const [spokenText, setSpokenText] = useState('');

  //   Llama params
  const [model, setModel] = useState(MODELS[2]); // default to 70B
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful frog and also assistant, when responding to user's input, remember to ribbit!."
  );
  const [temp, setTemp] = useState(0.75);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(800);

  //  Llava params
  const [image, setImage] = useState(null);

  // Salmonn params
  const [audio, setAudio] = useState(null);

  const [metrics, dispatch] = useReducer(metricsReducer, {
    startedAt: null,
    firstMessageAt: null,
    completedAt: null,
  });

  const { complete, completion, setInput, input } = useCompletion({
    api: "/api",
    body: {
      model: model.id,
      systemPrompt: systemPrompt,
      temperature: parseFloat(temp),
      topP: parseFloat(topP),
      maxTokens: parseInt(maxTokens),
      image: image,
      audio: audio,
    },

    onError: (error) => {
      setError(error);
    },
    onResponse: (response) => {
      setStarting(false);
      setError(null);
      dispatch({ type: "FIRST_MESSAGE" });
    },
    onFinish: () => {
      dispatch({ type: "COMPLETE" });
    },
  });

  const handleFileUpload = (file) => {
    if (file) {
      // determine if file is image or audio
      if (
        ["audio/mpeg", "audio/wav", "audio/ogg"].includes(
          file.originalFile.mime
        )
      ) {
        setAudio(file.fileUrl);
        setModel(MODELS[4]);
        toast.success(
          "You uploaded an audio file, so you're now speaking with Salmonn."
        );
      } else if (["image/jpeg", "image/png"].includes(file.originalFile.mime)) {
        setImage(file.fileUrl);
        setModel(MODELS[3]);
        toast.success(
          "You uploaded an image, so you're now speaking with Llava."
        );
      } else {
        toast.error(
          `Sorry, we don't support that file type (${file.originalFile.mime}) yet. Feel free to push a PR to add support for it!`
        );
      }
    }
  };

  const setAndSubmitPrompt = (newPrompt) => {
    handleSubmit(newPrompt);
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setOpen(false);
    setSystemPrompt(event.target.systemPrompt.value);
  };

  const handleSubmit = async (userMessage) => {
    setStarting(true);
    const SNIP = "<!-- snip -->";

    const messageHistory = [...messages];
    if (completion.length > 0) {
      messageHistory.push({
        text: completion,
        isUser: false,
      });
    }
    messageHistory.push({
      text: userMessage,
      isUser: true,
    });

    // Generate initial prompt and calculate tokens
    let prompt = `${generatePrompt(
      llamaTemplate,
      systemPrompt,
      messageHistory
    )}\n`;
    // Check if we exceed max tokens and truncate the message history if so.
    while (countTokens(prompt) > MAX_TOKENS) {
      if (messageHistory.length < 3) {
        setError(
          "Your message is too long. Please try again with a shorter message."
        );

        return;
      }

      // Remove the third message from history, keeping the original exchange.
      messageHistory.splice(1, 2);

      // Recreate the prompt
      prompt = `${SNIP}\n${generatePrompt(
        llamaTemplate,
        systemPrompt,
        messageHistory
      )}\n`;
    }

    setMessages(messageHistory);

    dispatch({ type: "START" });

    complete(prompt);

    // Speak and HAL9000 shall answer
    const makeSpokenText = () => {
      if (messageHistory.length > 0) {
        const latestText = messageHistory[messageHistory.length - 1].text;
        const secondLatestText = messageHistory.length >= 2 ? messageHistory[messageHistory.length - 2].text : "";

        setSpokenText(`Prompt: ${latestText || ""}${secondLatestText ? `Answer: ${secondLatestText}` : ""}`);
      } else {
        setSpokenText("no text yet");
      }
    };

    try {
      console.log(prompt);
      console.log(completion);
      console.log(messageHistory);

      console.log(messageHistory[0]);

      console.log(messageHistory[0].text);

      makeSpokenText(messageHistory)

      console.log(spokenText)
    } catch (error) {
      console.error("console log problems", error);
    }
  };

  // HAL9000 connection to server, beware!
  const sendToServer = async (event) => {   
    event.preventDefault();
    setLoading(true);
    setCurrentAnimation("hit");

    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: "Łukasz Gniewek",
          from_email: form.email,
          to_email: "lukaszgniewek@gmail.com",
          message: form.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          showAlert({
            show: true,
            text: "Thank you for your message 😃",
            type: "success",
          });

          setTimeout(() => {
            hideAlert(false);
            setCurrentAnimation("idle");
            setForm({
              name: "",
              email: "",
              message: "",
            });
          }, [3000]);
        },
        (error) => {
          setLoading(false);
          console.error(error);
          setCurrentAnimation("idle");

          showAlert({
            show: true,
            text: "I didn't receive your message 😢",
            type: "danger",
          });
        }
      );
  };

  //   try {
  //     const newChatHistory = new ChatHistory({
  //       // prompt: "prompt",
  //       // response: "completion",
  //       prompt: prompt,
  //       response: completion,
  //     });

  //     // console.log(typeof newChatHistory)
  //     // console.log(newChatHistory instanceof ChatHistory)
  //     // console.log(newChatHistory)
  //     // console.log(Object.getOwnPropertyNames(newChatHistory))

  //     await newChatHistory.$__save();
  //     console.log("Chat data saved to MongoDB");
  //     console.log("this seems to be working, the problem is in sending the content to MongoDB?")

  //   } catch (error) {
  //     console.error("Error saving chat data to MongoDB:", error);
  //   }

  //   console.log("Butt-oned this butt-on!")
  // }

  // const mongodb = require('mongodb'); // Assuming you're using the MongoDB driver

  // const sendToServer = async () => {
  //   // const sendToServer = async ({ prompt, completion }, client) => {
  //   // try {
  //   //   // Deconstruct `prompt` and `completion` from event for readability
  //   //   // const { prompt, completion } = event;

  //   //   // Check if `client` is already provided to avoid unnecessary connection creation
  //   //   const mongoClient = client;
  //   //   //   // const mongoClient = client || await mongodb.MongoClient.connect(
  //   //   //   // Replace with your actual connection string
  //   //   //   'mongodb://localhost:8080', // Example connection string
  //   //   // //   { useNewUrlParser: true, useUnifiedTopology: true }
  //   //   // // );

  //   //   const db = mongoClient.db('your_database_name'); // Replace with your database name
  //   //   const chatHistoryCollection = db.collection('chatHistory'); // Replace with your collection name

  //   //   const newChatHistory = new ChatHistory({
  //   //     prompt,
  //   //     response: "compl"
  //   //   });

  //   //   await chatHistoryCollection.insertOne(newChatHistory); // Use insertOne for clearer intent
  //   //   console.log("Chat data saved to MongoDB");
  //   // } catch (error) {
  //   //   console.error("Error saving chat data to MongoDB:", error);
  //   //   // Consider adding more specific error handling based on the error type
  //   // } finally {
  //   //   // Close the connection if it was created within the function
  //   //   // if (!client) {
  //   //   //   await mongoClient.close();
  //   //   // }
  //   // }

  //   // console.log("Sent data to server successfully!");
    console.log("not working yet");
  };

  useEffect(() => {
    if (messages?.length > 0 || completion?.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, completion]);

  const makeAnimation = async () => {
    console.log("not working yet!")

    // const replicate = new Replicate({
    //   auth: process.env.REPLICATE_API_TOKEN,
    // });

    // // const output = await replicate.run(
    // //   "anotherjesse/zeroscope-v2-xl:1f0dd155aeff719af56f4a2e516c7f7d4c91a38c7b8e9e81808e7c71bde9b868",
    // //   {
    // //     input: {
    // //       fps: 24,
    // //       fast: false,
    // //       width: 1024,
    // //       height: 576,
    // //       prompt: "A deep sea video of a bioluminescent siphonophore, 8k, beautiful, award winning, close up",
    // //       num_frames: 24,
    // //       guidance_scale: 17.5,
    // //       negative_prompt: "noisy, washed out, ugly, distorted, broken",
    // //       num_inference_steps: 50
    // //     }
    // //   }
    // // );
    // // console.log(output);

    // const output = await replicate.run(
    //   "lucataco/animate-diff:1531004ee4c98894ab11f8a4ce6206099e732c1da15121987a8eef54828f0663",
    //   {
    //     input: {
    //       path: "rcnzCartoon3d_v10.safetensors",
    //       seed: 255224557,
    //       steps: 25,
    //       prompt: "Jane Eyre with headphones, natural skin texture,4mm,k textures, soft cinematic light, adobe lightroom, photolab, hdr, intricate, elegant, highly detailed, sharp focus, cinematic look, soothing tones, insane details, intricate details, hyperdetailed, low contrast, soft cinematic light, dim colors, exposure blend, hdr, faded",
    //       n_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands and fingers, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation",
    //       motion_module: "mm_sd_v14",
    //       guidance_scale: 7.5
    //     }
    //   }
    // );
    // console.log(output);

  }

  // server-connection
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmitToServer = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setServerError(null);
    setSuccess(false);

    try {
      const response = await axios.post('https://hal9000-server.vercel.app/api/post/', {
      // const response = await axios.post('http://localhost:8080/api/post/', {
        prompt,
      });

      if (response.status === 201) {
        setSuccess(true);
        setPrompt(''); // Clear input after successful submission (optional)
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error(error);
      setServerError(error.message || 'An error occurred while adding the element.');
    } finally {
      setIsLoading(false);
    }
  };

  // const [texts, setTexts] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await axios.get('http://localhost:8080/api/post'); // Replace with your endpoint
  //     setTexts(response.data);
  //   };

  //   fetchData();
  // }, []);

  // const handleClick = async () => {
  //   // const fetchData = async () => {
  //   //   const response = await axios.get('http://localhost:8080/api/post'); // Replace with your endpoint
  //   //   setTexts(response.data);
  //   // };

  //   // fetchData();



  //   await fetchData(); // Call the data fetching function
  // };

  return (
    <>
      <div className="bg-slate-700 flex flex-col">
        <div className="z-0 fixed top-0 left-0 right-0 bg-slate-600 border-t-2 border-yellow-500 border-2 container max-w-2xl mx-auto px-0 pb-0">

          {typeof window !== 'undefined' && <TextToSpeech text={spokenText || "I'm HAL NINE THOUSAND, this vessel AI, welcome, please do tell what do you wish to know."} />}

          {/* Server-conncetion form */}
          <form onSubmit={handleSubmitToServer}
          className="bg-black border-yellow-500 border-2 hover:bg-purple-800 items-center font-semibold text-yellow-500 rounded-r-md px-1 py-"
          >
            <label>
              Prompt:
              <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
            </label>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Element'}
            </button>

            {/* {success && <p>Element added successfully!</p>} */}
            {error && <p className="error">{error}</p>}
          </form>


          {/* <div>
            <button onClick={handleClick}>Get Texts</button>
            {texts.length > 0 && ( // Check if texts is not empty before rendering
              <ul>
                {texts.map((text) => (
                  <li key={text._id}>{text.text}</li>
                ))}
              </ul>
            )}
          </div> */}


          {/* <div className="w-full flex border-yellow-500 border-2 bg-black hover:bg-purple-800 font-semibold text-yellow-500 text-center rounded-md px-3 py-3">
            <SendServerButton onSubmit={sendToServer} /> 
          </div> fgvfsd */}

        </div>

        {/* <Canvas>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <Environment preset="city" />
          {/* <Mesh ref={meshRef}> */}
        {/* <gltfRef={modelPath} /> */}
        {/* </Mesh> */}
        {/* </Canvas> */}

        <Toaster position="top-left" reverseOrder={false} />

        <main className="flex flex-col max-w-2xl pb-2 mx-auto mt-28 mb-28 sm:px-4 bg-slate-700">
          <div className="text-center"></div>
          {messages.length == 0 && !image && !audio && (
            <EmptyState setPrompt={setAndSubmitPrompt} setOpen={setOpen} />
          )}

          {/* <SlideOver
          open={open}
          setOpen={setOpen}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          handleSubmit={handleSettingsSubmit}
          temp={temp}
          setTemp={setTemp}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          topP={topP}
          setTopP={setTopP}
          models={MODELS}
          size={model}
          setSize={setModel}
        /> */}

          {image && (
            <div>
              <img src={image} className="mt-6 sm:rounded-xl" />
            </div>
          )}

          {audio && (
            <div>
              <audio controls src={audio} className="mt-6 sm:rounded-xl" />
            </div>
          )}

          <ChatForm
            prompt={input}
            setPrompt={setInput}
            onSubmit={handleSubmit}
            handleFileUpload={handleFileUpload}
            completion={completion}
            metrics={metrics}
            onSubmitSendToServer={sendToServer}
          />

          {/* <button onClick={makeAnimation}>Animate!</button> */}

          {error && <div>{error}</div>}

          <article className="z-24 pb-24">
            {messages.map((message, index) => (
              <Message
                key={`message-${index}`}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
            <Message message={completion} isUser={false} />

            {starting && <QueuedSpinner />}

            <div ref={bottomRef} />
          </article>

        </main>
      </div>

    </>
  );
}

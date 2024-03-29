import { Uploader } from "uploader";
import { UploadButton } from "react-uploader";
import Metrics from "./Metrics";
const uploader = Uploader({
  apiKey: "public_kW15biSARCJN7FAz6rANdRg3pNkh",
});

const options = {
  apiKey: "public_kW15biSARCJN7FAz6rANdRg3pNkh",
  maxFileCount: 1,
  mimeTypes: [
    "image/jpeg",
    "image/png",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
  ],
  showFinishButton: false,
  preview: true,
  editor: {
    images: {
      preview: false,
      crop: false,
    },
  },
  styles: {
    colors: {
      active: "#1f2937",
      error: "#d23f4d",
      primary: "#4b5563",
    },
    fontFamilies: {
      base: "inter, -apple-system, blinkmacsystemfont, Segoe UI, helvetica, arial, sans-serif",
    },
    fontSizes: {
      base: 16,
    },
  },
};

const ChatForm = ({
  prompt,
  setPrompt,
  onSubmit,
  handleFileUpload,
  metrics,
  completion,
  onSubmitSendToServer,
}) => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmit(prompt);
    setPrompt("");
    event.target.rows = 1;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // HAL9000 - beware!
  const sendToServer = async (event) => {
    event.preventDefault();
    onSubmitSendToServer();
    // setPrompt("");
    // event.target.rows = 1;
  }


  return (
    <footer className="z-0 fixed bottom-0 left-0 right-0 bg-slate-600 border-t-2">
      <div className="border-yellow-500 border-2 container max-w-2xl mx-auto px-1 pb-1">
        {/* <Metrics
          startedAt={metrics.startedAt}
          firstMessageAt={metrics.firstMessageAt}
          completedAt={metrics.completedAt}
          completion={completion}
        /> */}

        <form className="w-full flex" onSubmit={handleSubmit}>
          <UploadButton
            uploader={uploader}
            options={options}
            onComplete={(files) => handleFileUpload(files[0])}
          >
            {({ onClick }) => (
              <button
                className="p-3 bg-black border-yellow-500 border-2 text-yellow-500 inline-flex hover:bg-purple-800 rounded-md mr-3"
                // className="bg-black hover:bg-purple-800 items-center font-semibold text-yellow-500 rounded-r-md px-5 py-3"
                onClick={onClick}
              >
                Upload
              </button>
            )}
          </UploadButton>
          <textarea
            autoComplete="off"
            autoFocus
            name="prompt"
            className="flex-grow block w-full rounded-l-md border-yellow-500 border-2 py-1.5 text-yellow-500 ring-1 ring-inset ring-gray-300 placeholder:text-yellow-500 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:leading-6"
            placeholder="Send a message"
            required={true}
            value={prompt}
            rows={1}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={(e) => {
              const lineCount = e.target.value.split("\n").length;
              e.target.rows = lineCount > 10 ? 10 : lineCount;
            }}
          />
          <button
            className="bg-black border-yellow-500 border-2 hover:bg-purple-800 items-center font-semibold text-yellow-500 rounded-r-md px-5 py-3"
            type="submit"
          >
            Chat
          </button>

        </form>
        {/* <form className="w-full flex" onSubmit={sendToServer}>
          <button
            className="w-full flex border-yellow-500 border-2 bg-black hover:bg-purple-800 font-semibold text-yellow-500 text-center rounded-md px-5 py-3"
            type="submit"
          >
            Send to server
          </button>
        </form> */}
      </div>
    </footer>
  );
};

export default ChatForm;

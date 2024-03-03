const ServerSendButton = ({
  onSubmit, 
}) => {
  const sendToServer = async (event) => {
    event.preventDefault();
    onSubmit();
    // setPrompt("");
    // event.target.rows = 1;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (    
      <div className="container max-w-2xl mx-auto">      

        {/* <form className="w-full flex" onSubmit={handleSubmit}>    */}
        <form className="w-full flex" onSubmit={sendToServer}>      
          
          <button
            // className="bg-gray-600 hover:bg-gray-800 items-center font-semibold text-white rounded-r-md px-5 py-3"
            type="submit"
          >
            Send to server
          </button>
        </form>
      </div>    
  );
};

export default ServerSendButton;

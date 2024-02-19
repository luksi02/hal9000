const Message = ({ message, isUser }) => {
  let containerClass = "bg-slate-800";
  if (isUser) {
    containerClass = "";
  }

  if (Array.isArray(message)) {
    message = message.join("");
  }

  if (!message || message === "") {
    return null;
  }

  return (
    <div
      className={`flex gap-x-4 rounded-md ${containerClass} py-2 px-2 mb-1 text-red bg-black`}
    >
      {isUser ? (
        <span className="text-xl sm:text-2xl" title="user">
          🥸
        </span>
      ) : (
        <span className="text-xl sm:text-2xl" title="AI">
          🦙
        </span>
      )}

      <div className="flex flex-col text-sm sm:text-base flex-1 gap-y-1 mt-1 text-yellow-500 rounded-md">
        {message.split("\n").map(
          (text, index) =>
            text.length > 0 && (
              <span key={index} className="min-w-0">
                {text}
              </span>
            )
        )}
      </div>
    </div>
  );
};

export default Message;

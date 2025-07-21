import { Zap } from "lucide-react";
import ChatInput from "./ChatInput";

const Interface = ({ input, setInput, onSendMessage, loading }) => {
  const refinedPrompts = {
    "Todo List":
      "Create a todo list app with add, delete, and mark complete features",
    "Weather App":
      "Build a weather app that shows current conditions and forecasts",
    "Note Taking":
      "Create a note-taking app with categories and search functionality",
    "Timer App": "Build a timer app with countdown and stopwatch features",
    "Quiz app":
      "Make me a quiz app about Java Script. Make sure to give the user an explanation on each question whether they got it right or wrong and keep a score going",
  };
  return (
    <div className="bg-zinc-900 text-white flex flex-col items-center justify-center px-4 py-12 space-y-8">
      <div className="flex items-center justify-center">
        <div className="-mx-4">
          <img src="/CodeFlash.svg" alt="CodeFlash" />
        </div>
        <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          CodeFlash
        </div>
      </div>
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#F1F1F1] leading-tight">
          Turn your{" "}
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            idea
          </span>
          <br />
          into an{" "}
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent ">
            app
          </span>
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
        {Object.entries(refinedPrompts).map(([label, refined]) => (
          <button
            key={label}
            onClick={() => setInput(refined)}
            className="px-6 py-3 text-sm sm:text-base bg-zinc-800/50 border border-zinc-700/50 rounded-lg cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500/70" />
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl mb-4">
        <ChatInput
          onSendMessage={onSendMessage}
          loading={loading}
          formClassName="w-full"
          placeholder="Build me an calculator app..."
          input={input}
          setInput={setInput}
        />
      </div>
      <div className="text-center text-xs text-zinc-500">
        Press Enter or click Send to start building your app
      </div>
    </div>
  );
};

export default Interface;

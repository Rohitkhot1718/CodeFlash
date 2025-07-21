import { useEffect, useRef } from "react";
import { Send } from "lucide-react";

const ChatInput = ({
  onSendMessage,
  loading = false,
  formClassName = "",
  placeholder = "",
  input,
  setInput,
  formHeight,
}) => {
  const textareaRef = useRef();
  const formRef = useRef();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.overflowY = "hidden";

    if (el.scrollHeight <= 160) {
      el.style.height = `${el.scrollHeight}px`;
      formRef.current.style.height = formHeight ? "60px" : "80px";
    } else {
      formRef.current.style.height = "auto";
      el.style.height = "160px";
      el.style.overflowY = "auto";
    }
  }, [input, formHeight]);

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  function handleSend(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`bg-[#1A1A1A] flex items-center justify-between rounded-xl px-4 py-3 shadow-md border border-[#2E2E2E] ${formClassName}`}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder={placeholder}
        className="flex-1 mx-3 bg-transparent text-sm placeholder-gray-400 resize-none outline-none overflow-y-auto"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
        onKeyDown={handleSend}
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-md flex justify-center items-center h-8 w-8"
        disabled={loading}
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default ChatInput;

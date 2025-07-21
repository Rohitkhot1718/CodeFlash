import { useEffect, useRef, useState } from "react";
import {
  Eye,
  CodeXml,
  Clipboard,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ChatInput from "./ChatInput";
import Preview from "./Preview";
import CodeEditor from "./CodeEditor";
import Interface from "./Interface";

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeText, setCodeText] = useState("");
  const [resetCode, setResetCode] = useState(null);
  const scrollRef = useRef(null);
  const editorRef = useRef(null);
  const [formHeight, setFormHeight] = useState(80);

  const [selectedDependencies, setSelectedDependencies] = useState(null);
  const [selectVersionLabel, setSelectVersionLabel] = useState("");
  const lastMsg =
    messages.findLast((msg) => msg.text?.res?.code)?.text.res.code || "";
  const hasCode = Boolean(lastMsg);

  let version = 1;

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) setFormHeight(60);
    else setFormHeight(80);
  }, [messages]);

  function handleCopy() {
    const code = editorRef.current.getValue();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }

  const handleSend = async (input) => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: { text: input },
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/code-flash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: input }),
      });

      const data = await response.json();
      const botText = data.response;
      let parsed;

      try {
        if (botText.trim().startsWith("{")) {
          const cleaned = botText.replace(/```json\s*|\s*```/g, "").trim();
          parsed = JSON.parse(cleaned);
        } else {
          throw new Error("Plain text response");
        }
      } catch (err) {
        parsed = { text: "Something went wrong. Please try again later" };
        console.log(err);
      }

      if (parsed?.res?.code) {
        const botMessage = {
          id: Date.now() + 1,
          text: parsed,
          isUser: false,
        };
        setCodeText(parsed.res.code);
        setResetCode(parsed.res.code);
        setSelectedDependencies(parsed.res.dependencies);
        setSelectVersionLabel(parsed.res.versionLabel);
        setMessages((prev) => [...prev, botMessage]);
      } else if (parsed?.text) {
        const botMessage = {
          id: Date.now() + 1,
          text: { text: parsed.text },
          isUser: false,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Unexpected bot response structure");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: "Sorry, something went wrong.",
          isUser: false,
        },
      ]);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full h-full ${
        messages.length === 0 ? "flex justify-center" : "flex"
      }`}
    >
      {messages.length === 0 ? (
        <Interface
          onSendMessage={handleSend}
          loading={loading}
          input={input}
          setInput={setInput}
        />
      ) : (
        <>
          <div className="flex flex-col h-[640px] w-1/2 px-4 pt-0.5 pb-3">
            <div className="py-2 w-1/8 flex items-center">
              <a href="/">
                <img src="/CodeFlash.svg" alt="CodeFlash" />
              </a>
            </div>
            <div
              className="flex-1 flex flex-col space-y-4 overflow-y-auto"
              ref={scrollRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[70%] break-words white-space-wrap m-2 ${
                      message.isUser
                        ? "bg-[#47281C] text-white mr-2"
                        : "bg-[#2E2E2E] text-white ml-2"
                    }`}
                  >
                    <div>
                      <ReactMarkdown
                        children={
                          message.text.res
                            ? message.text.res.description
                            : message.text.text
                        }
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      />
                      {message.text.res && (
                        <div
                          className="w-full bg-zinc-800 rounded-[5px] my-2 py-3 px-2 border-4 border-zinc-700 cursor-pointer flex items-center"
                          onClick={() => {
                            setCodeText(message.text.res.code);
                            setSelectedDependencies(
                              message.text.res.dependencies
                            );
                            setResetCode(message.text.res.code);
                            setSelectVersionLabel(
                              message.text.res.versionLabel
                            );
                          }}
                        >
                          <div className="bg-zinc-700 p-2 rounded-[5px]">
                            V{version++}
                          </div>

                          <div className="ml-2">
                            {message.text.res.versionLabel}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start mb-2">
                  <div className="mx-4">
                    <div className="wrapper">
                      <div className="cssload-loader"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <ChatInput
              onSendMessage={handleSend}
              loading={loading}
              placeholder="Follow Up"
              input={input}
              setInput={setInput}
              formHeight={formHeight}
            />
          </div>

          <div className="bg-zinc-800 h-screen w-1/2 p-2">
            <div className="flex justify-between items-center py-1 ">
              <div className="flex items-center gap-2">
                <div className="flex justify-center items-center gap-1 bg-zinc-900 px-2 p-1 rounded-[10px]">
                  <CodeXml
                    className={`${
                      isPreview && hasCode ? "bg-zinc-800" : ""
                    } p-1 rounded-[5px] cursor-pointer ${
                      !hasCode ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                    size={25}
                    onClick={() => hasCode && setIsPreview(true)}
                  />
                  <Eye
                    className={`${
                      !isPreview && hasCode ? "bg-zinc-800" : ""
                    } p-1 rounded-[5px] cursor-pointer ${
                      !hasCode ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                    size={25}
                    onClick={() => hasCode && setIsPreview(false)}
                  />
                </div>
                <p className="text-[15px]">{selectVersionLabel}</p>
              </div>
              <div className="flex gap-2">
                <div
                  className={`bg-zinc-900 px-1 py-2 rounded-[5px] cursor-pointer ${
                    !hasCode ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  onClick={() => setCodeText(resetCode)}
                >
                  <RotateCcw size={20} />
                </div>
                <div
                  className={`bg-zinc-900 px-1 py-2 rounded-[5px] cursor-pointer ${
                    !hasCode ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <ClipboardCheck size={20} />
                  ) : (
                    <Clipboard size={20} />
                  )}
                </div>
              </div>
            </div>
            <div className="h-[94%] overflow-auto">
              {hasCode ? (
                isPreview ? (
                  <CodeEditor
                    codeText={codeText}
                    setCodeText={setCodeText}
                    editorRef={editorRef}
                  />
                ) : (
                  <div className="bg-zinc-800 overflow-hidden h-full">
                    <Preview
                      codeText={codeText}
                      dependencies={selectedDependencies}
                      handleSend={handleSend}
                    />
                  </div>
                )
              ) : (
                <div className="text-zinc-500 text-xl p-4 italic flex justify-center items-center h-[90%]">
                  No code to preview yet...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;

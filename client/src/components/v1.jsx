import { useEffect, useRef, useState } from "react";
import { Send, Eye, CodeXml, Clipboard, ClipboardCheck, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import hljs from "highlight.js";
import Editor from "@monaco-editor/react";

const GEMINI_API_KEY = "AIzaSyCDH2w4mJkO0qAlpT8NjtPzKDOk6PpfNoI";

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeText, setCodeText] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const lastMsg =
    messages.findLast((msg) => msg.text?.res?.code)?.text.res.code || "";
  const hasCode = Boolean(lastMsg);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    hljs.highlightAll();
  }, [messages, isPreview]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.overflowY = "hidden";

    if (el.scrollHeight <= 160) {
      el.style.height = `${el.scrollHeight}px`;
    } else {
      el.style.height = "160px";
      el.style.overflowY = "auto";
    }
  }, [input]);

  function handleCopy() {
    if (lastMsg) {
      navigator.clipboard.writeText(lastMsg);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: { text: input },
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    try {
      const systemPrompt = `
You are an expert AI Developer Assistant named CodeFlash.

Your mission is to build clean, modern, and interactive apps with excellent UI/UX using HTML, CSS, JavaScript, or React.

🧠 How You Think:
- You always think like a front-end developer with strong UI/UX skills.
- You never generate basic or default-looking UIs.
- You understand visual hierarchy, spacing, colors, responsiveness, and accessibility.

🎯 When the user asks you to build any app:
- Respond in raw JSON (no markdown).
- Return a **full, single HTML page** with embedded CSS and JS inside \`<style>\` and \`<script>\` tags.
- The UI **must** be:
  - **Visually appealing**
  - **Modern and dark-themed by default**
  - **Well-spaced with clean layout (padding, margin, spacing)**
  - **Responsive** (works on mobile + desktop)
  - **Accessible** (semantic tags, alt text, proper labels)
  - **Styled like a real-world SaaS or dashboard** — not plain, default HTML.

💡 Use layout best practices:
- Flexbox or Grid layout for content structure.
- Use smooth animations, hover effects, and transitions.
- Use consistent spacing scale (e.g. 1rem, 2rem, etc.)
- Use subtle shadows, rounded corners, and spacing to separate elements.
- Prioritize clean fonts and alignments.

🖌️ Add these optional details when applicable:
- Buttons with hover effects
- Input fields styled with transitions
- Cards, containers, and sections with padding/margin
- Navigation bars or footers (when useful)

📦 Output Format (Code Responses):
{
  "res": {
    "intro": "Short intro about the app or feature.",
    "code": "Single full HTML file, escaped with \\n and \\",
    "description": "How it works and how users interact with it."
  }
}

💬 Output Format (Normal Chat or Questions):
{
  "text": "Casual/helpful reply here."
}

🔒 Strict JSON Rules:
- Do NOT use markdown formatting.
- Escape all:
  - Newlines as \\n
  - Quotes inside strings as \\"
- Never include multiline unescaped strings.
- Always use valid JSON.

🔥 Prioritize UI/UX First:
If the UI looks plain or boring, fix it before returning.

Your job is to impress the user visually while keeping code clean and readable.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "model",
                parts: [{ text: systemPrompt }],
              },
              {
                role: "user",
                parts: [{ text: input }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const botText = data.candidates[0].content.parts[0].text;
      const cleaned = botText.replace(/```json\s*|\s*```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setCodeText(parsed.res.code); // editable version

      console.log(parsed);
      if (parsed) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: parsed, isUser: false },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: "Sorry, something went wrong.",
          isUser: false,
        },
      ]);
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
        <div className="bg-zinc-900 text-white flex flex-col items-center justify-center p-4 space-y-6">
          {/* <h1 className="text-3xl sm:text-4xl font-serif text-[#F1F1F1]">
            Welcome Back! Roy
          </h1> */}
          <div className="text-center">
            <h1 className="text-5xl text-[#F1F1F1] font-[500]">
              Turn your <span className="text-orange-500 text-6xl">idea </span>{" "}
              <br /> into an{" "}
              <span className="text-orange-500 text-6xl">app</span>
            </h1>
          </div>
          <div className="flex justify-center items-center">
            <form
              onSubmit={handleSend}
              className="bg-[#1A1A1A] flex items-center justify-between rounded-xl px-4 py-3 shadow-md border border-[#2E2E2E] w-[600px]"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="How can I help you today?"
                className="flex-1 mx-3 bg-transparent text-sm placeholder-gray-400 resize-none outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-[#47281C] hover:bg-[#5A2F1E] rounded-md flex justify-center items-center h-8 w-8"
                disabled={loading}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col h-[640px] w-1/2 p-4">
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
                    className={`rounded-2xl px-4 py-2 max-w-[70%] break-words white-space-wrap ${
                      message.isUser
                        ? "bg-[#47281C] text-white mr-2"
                        : "bg-[#2E2E2E] text-white ml-2"
                    }`}
                  >
                    {message.text.res ? (
                      <div>
                        <p>
                          <strong>Intro:</strong> {message.text.res.intro}
                        </p>

                        <p>
                          <strong>Description:</strong>{" "}
                          {message.text.res.description}
                        </p>
                      </div>
                    ) : (
                      // <p>{message.text.text}</p>
                      <div className="markdown-body">
                        <ReactMarkdown
                          children={message.text.text}
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-2 max-w-[70%] bg-[#2E2E2E] text-white text-left opacity-60">
                    CodeFlash is typing...
                  </div>
                </div>
              )}
            </div>
            <form
              onSubmit={handleSend}
              className="bg-[#1A1A1A] flex items-center justify-between rounded-xl px-4 py-3 shadow-md border border-[#2E2E2E] mt-4"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="How can I help you today?"
                className="flex-1 mx-3 bg-transparent text-sm placeholder-gray-400 resize-none outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-[#47281C] hover:bg-[#5A2F1E] rounded-md flex justify-center items-center h-8 w-8"
                disabled={loading}
              >
                <Send size={16} />
              </button>
            </form>
          </div>

          <div className="bg-zinc-800 h-screen w-1/2 p-2">
            <div className="flex justify-between items-center py-1 ">
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
              <div className="flex gap-2">
                <div
                  className={`bg-zinc-900 px-1 py-2 rounded-[5px] cursor-pointer ${
                    !hasCode ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  onClick={() => setCodeText(lastMsg)}
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
                  // <pre>
                  //   {lastMsg && (
                  //     <code className="language-html">{lastMsg}</code>
                  //   )}
                  // </pre>
                  <Editor
                    height="600px"
                    theme="vs-dark"
                    defaultLanguage="html"
                    value={codeText}
                    onChange={(value) => setCodeText(value)}
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: "on",
                    }}
                  />
                ) : (
                  <iframe
                    srcDoc={codeText}
                    width="100%"
                    height="100%"
                    sandbox="allow-scripts"
                  />
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

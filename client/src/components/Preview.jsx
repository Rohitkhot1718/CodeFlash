import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { gruvboxDark } from "@codesandbox/sandpack-themes";
import { useEffect, useState } from "react";
import { CircleAlert, Loader, Settings } from "lucide-react";

function SandpackErrorOverlay({ handleSend }) {
  const { sandpack } = useSandpack();
  const { error } = sandpack;
  const [errorFixing, setErrorFixing] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!error) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!errorFixing) {
      handleSend(error.message);
      setErrorFixing(true);
    }
  }, [countdown, errorFixing, error, handleSend]);

  if (!error) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      {errorFixing ? (
        <div className="flex flex-col items-center p-6 backdrop-blur-sm rounded-lg">
          <Settings
            style={{ animationDuration: "2s" }}
            className="w-10 h-10 mb-4 text-white animate-spin"
          />
          <h3 className="text-lg font-medium text-white mb-2">
            Fixing your code...
          </h3>

          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 animate-fixing-progress relative"></div>
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-lg rounded-lg">
          <div className="flex items-center gap-1">
            <CircleAlert size={22} />
            <h3 className="font-bold">Something went wrong</h3>
          </div>
          <div className="mt-2 text-sm">
            <p className="font-mono whitespace-pre-wrap">{error.message}</p>
          </div>
          <div className="mt-4 px-4 py-2 bg-red-600 text-white text-[15px] font-semibold rounded-md flex items-center justify-center gap-1">
           <Loader size={20} className="animate-pulse"/>  
           <p>Auto-fixing in {countdown}...</p>
           
          </div>
        </div>
      )}
    </div>
  );
}

const Preview = ({ codeText, dependencies, handleSend }) => {
  const defaultFiles = {
    indexHtml: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>CodeFlash Preview</title>
      </head>
      <body>
        <div id="root"></div>
      </body>
      </html>
    `.trim(),
    indexJs: `
      import React from "react";
      import { createRoot } from "react-dom/client";
      import App from "./App";

      const rootElement = document.getElementById("root");
      const root = createRoot(rootElement);
      root.render(<App />);
    `.trim(),
    packageJson: `
      {
        "name": "CodeFlash-sandbox",
        "version": "1.0.0",
        "dependencies": ${JSON.stringify(dependencies)}
      }
    `.trim(),
  };

  return (
    <SandpackProvider
      template="react"
      theme={gruvboxDark}
      files={{
        "/index.html": { code: defaultFiles.indexHtml },
        "/App.js": { code: codeText },
        "/index.js": { code: defaultFiles.indexJs },
        "/package.json": { code: defaultFiles.packageJson },
      }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
      }}
    >
      <SandpackLayout>
        <div className="relative w-full h-[580px]">
          <SandpackErrorOverlay handleSend={handleSend} newCode={codeText} />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showNavigator={false}
            style={{ height: "100%" }}
          />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default Preview;

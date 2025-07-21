import Editor from "@monaco-editor/react";

const CodeEditor = ({ codeText, setCodeText, editorRef }) => {

  const defineReactDarkTheme = (monaco) => {
    monaco.editor.defineTheme("react-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "C586C0" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "tag", foreground: "569CD6" },
        { token: "delimiter.html", foreground: "808080" },
        { token: "attribute.name", foreground: "9CDCFE" },
        { token: "attribute.value", foreground: "CE9178" },
        { token: "type", foreground: "4EC9B0" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "function", foreground: "DCDCAA" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2A2A2A",
        "editor.selectionBackground": "#264F78",
        "editorLineNumber.foreground": "#858585",
        "editorIndentGuide.background": "#404040",
        "editorIndentGuide.activeBackground": "#707070",
      },
    });
  };

  return (
    <>
      <Editor
        height="600px"
        language="javascript"
        theme="react-dark"
        value={codeText}
        onChange={(value) => setCodeText(value)}
        onMount={(editor, monaco) => {
          defineReactDarkTheme(monaco);
          monaco.editor.setTheme("react-dark");
          editorRef.current = editor;
        }}
        options={{
          minimap: { enabled: false },
          lineNumbers: "on",
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
        }}
      />
    </>
  );
};

export default CodeEditor;

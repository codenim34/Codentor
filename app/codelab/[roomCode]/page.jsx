"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@monaco-editor/react";
import { executeCode } from "@/app/api/Piston/api";
import { CODE_SNIPPETS } from "@/app/constants";
import { 
  Play, 
  Copy, 
  RotateCcw, 
  Download, 
  Users, 
  Sparkles,
  ChevronRight,
  Terminal,
  X,
  Check,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚙️' },
  { id: 'csharp', name: 'C#', icon: '💎' },
  { id: 'php', name: 'PHP', icon: '🐘' },
];

export default function CodeLabSession() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const editorRef = useRef(null);

  const [roomCode] = useState(params.roomCode);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(CODE_SNIPPETS.javascript);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (isLoaded && user) {
      // Add current user as participant
      setParticipants([
        {
          id: user.id,
          name: user.firstName || user.username,
          image: user.imageUrl,
          role: 'creator',
        }
      ]);
    }
  }, [isLoaded, user]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    // Add keyboard shortcut for running code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(CODE_SNIPPETS[newLanguage] || "");
    setOutput([]);
    setShowOutput(false);
  };

  const handleRunCode = async () => {
    if (!editorRef.current) {
      toast.error("Editor not ready");
      return;
    }

    const sourceCode = editorRef.current.getValue();
    if (!sourceCode.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setOutput(["Running code..."]);
    
    try {
      const startTime = performance.now();
      const { run: result } = await executeCode(language, sourceCode);
      const endTime = performance.now();
      
      setExecutionTime(Math.round(endTime - startTime));
      
      if (result.output) {
        setOutput(result.output.split("\n"));
        setIsError(!!result.stderr);
      } else if (result.stderr) {
        setOutput(result.stderr.split("\n"));
        setIsError(true);
      } else {
        setOutput(["Code executed successfully with no output"]);
        setIsError(false);
      }
      
      toast.success("Code executed successfully!");
    } catch (error) {
      console.error("Execution error:", error);
      setOutput([error.message || "An error occurred while running the code"]);
      setIsError(true);
      toast.error("Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the code?")) {
      setCode(CODE_SNIPPETS[language] || "");
      setOutput([]);
      setShowOutput(false);
      toast.success("Code reset!");
    }
  };

  const handleDownload = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      const fileExtensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        csharp: 'cs',
        php: 'php'
      };
      
      const blob = new Blob([code], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codelab-${roomCode}.${fileExtensions[language]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Code downloaded!");
    }
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied! Share it with others to collaborate.");
  };

  if (!isLoaded) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold">CodeLab Session</h1>
                <button
                  onClick={handleCopyRoomCode}
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center"
                >
                  Room: {roomCode}
                  <Copy className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Participants */}
            <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{participants.length} online</span>
              <div className="flex -space-x-2">
                {participants.map((participant) => (
                  <img
                    key={participant.id}
                    src={participant.image}
                    alt={participant.name}
                    className="w-6 h-6 rounded-full border-2 border-slate-800"
                    title={participant.name}
                  />
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyCode}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                title="Download code"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                title="Reset code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Consolas', monospace",
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 2,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              wordWrap: "on",
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              folding: true,
              contextmenu: true,
              mouseWheelZoom: true,
              parameterHints: { enabled: true },
            }}
          />

          {/* Keyboard Shortcut Hint */}
          <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700">
            <p className="text-xs text-gray-400">
              Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-gray-300">Ctrl+Enter</kbd> to run
            </p>
          </div>
        </div>

        {/* Output Panel */}
        {showOutput && (
          <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
            {/* Output Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <h3 className="text-white font-medium">Output</h3>
                {executionTime && (
                  <span className="text-xs text-gray-500">
                    ({executionTime}ms)
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowOutput(false)}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              {isRunning ? (
                <div className="flex items-center space-x-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing code...</span>
                </div>
              ) : (
                <div className={isError ? "text-red-400" : "text-green-400"}>
                  {output.map((line, index) => (
                    <div key={index} className="py-0.5">
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Output Footer */}
            <div className="px-4 py-2 border-t border-slate-700 bg-slate-900/50">
              <div className="flex items-center space-x-2 text-xs">
                {isError ? (
                  <>
                    <X className="w-3 h-3 text-red-400" />
                    <span className="text-red-400">Execution failed</span>
                  </>
                ) : isRunning ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span className="text-blue-400">Running...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Success</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


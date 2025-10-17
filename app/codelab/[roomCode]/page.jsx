"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@monaco-editor/react";
import { executeCode } from "@/app/api/Piston/api";
import { CODE_SNIPPETS } from "@/app/constants";
import { pusherClient } from "@/lib/pusher-client";
import AIAssistant from "@/app/components/playground/AIAssistant";
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
  Loader2,
  Share2,
  ArrowLeft
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
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [executionTime, setExecutionTime] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [lastUpdateFromServer, setLastUpdateFromServer] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(600); // Open wide by default
  const [isResizing, setIsResizing] = useState(false);

  // Pusher real-time collaboration
  useEffect(() => {
    if (!roomCode || !user) return;

    const userId = user.id;
    const username = user.firstName || user.username || 'Anonymous';

    console.log('Setting up Pusher for room:', roomCode);
    const channel = pusherClient.subscribe(`room-${roomCode}`);
    
    // Join room
    const joinRoom = async () => {
      try {
        const response = await fetch('/api/socket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: roomCode,
            userId,
            username,
            event: 'join-room',
          }),
        });
        if (!response.ok) {
          console.error('Failed to join room');
        } else {
          toast.success(`Joined room ${roomCode}`);
        }
      } catch (error) {
        console.error('Error joining room:', error);
      }
    };
    
    joinRoom();

    // Listen for collaborator updates
    channel.bind('collaboratorsUpdate', (data) => {
      console.log('Collaborators updated:', data);
      if (Array.isArray(data)) {
        setParticipants(data);
      }
    });

    // Request current room state when joining
    channel.bind('roomState', (data) => {
      console.log('Received room state:', data);
      if (data && !hasInitialized) {
        if (data.code) {
          setCode(data.code);
          setLastUpdateFromServer(data.code);
        }
        if (data.language) {
          setLanguage(data.language);
        }
        setHasInitialized(true);
      }
    });

    // Listen for code updates from other users
    channel.bind('codeUpdate', (data) => {
      console.log('Code update from:', data.username);
      if (data && data.userId !== userId) {
        setLastUpdateFromServer(data.data);
        setCode(data.data);
        toast(`${data.username} updated the code`, {
          icon: '✏️',
          duration: 2000,
        });
      }
    });

    // Listen for language changes
    channel.bind('languageChange', (data) => {
      if (data && data.userId !== userId) {
        setLanguage(data.language);
        setCode(CODE_SNIPPETS[data.language] || "");
        toast(`${data.username} changed language to ${data.language}`, {
          icon: '🔄',
          duration: 2000,
        });
      }
    });

    // Debug Pusher connection
    pusherClient.connection.bind('connected', () => {
      console.log('Pusher connected successfully');
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('Pusher error:', err);
    });

    return () => {
      // Leave room on cleanup
      fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomCode,
          userId,
          username,
          event: 'leave-room',
        }),
      }).catch(err => console.error('Error leaving room:', err));

      channel.unbind_all();
      pusherClient.unsubscribe(`room-${roomCode}`);
    };
  }, [roomCode, user]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    // Debounced code update broadcast
    let updateTimeout;
    editor.onDidChangeModelContent(() => {
      const newCode = editor.getValue();
      
      // Don't broadcast if this was from a server update
      if (newCode === lastUpdateFromServer) {
        return;
      }

      // Debounce to avoid too many updates
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        if (user && roomCode) {
          fetch('/api/socket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: roomCode,
              userId: user.id,
              username: user.firstName || user.username || 'Anonymous',
              event: 'codeUpdate',
              data: newCode,
            }),
          }).catch(err => console.error('Error broadcasting code:', err));
        }
      }, 500); // Wait 500ms before broadcasting
    });

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

    // Broadcast language change to other collaborators
    if (user && roomCode) {
      fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomCode,
          userId: user.id,
          username: user.firstName || user.username || 'Anonymous',
          event: 'languageChange',
          data: newLanguage,
        }),
      }).catch(err => console.error('Error broadcasting language change:', err));
    }
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

  const handleCopyCode = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code);
          toast.success("Code copied to clipboard!");
        } else {
          // Fallback
          const textArea = document.createElement("textarea");
          textArea.value = code;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success("Code copied to clipboard!");
        }
      } catch (error) {
        console.error('Failed to copy:', error);
        toast.error("Failed to copy code");
      }
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

  const handleCopyRoomCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(roomCode);
        setShowCopiedNotification(true);
        setTimeout(() => setShowCopiedNotification(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = roomCode;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShowCopiedNotification(true);
        setTimeout(() => setShowCopiedNotification(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error("Failed to copy room code");
    }
  };

  const handleShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/codelab/${roomCode}`;
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied! Anyone with this link can join the session.");
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success("Share link copied! Anyone with this link can join the session.");
        } catch (err) {
          toast.error("Failed to copy link. Please copy manually: " + shareUrl);
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  // Redirect to sign-in if not authenticated
  if (!isLoaded) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return (
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to sign in...</div>
      </div>
    );
  }

  const handleAICodeUpdate = (newCode) => {
    setCode(newCode);
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
    
    // Broadcast the AI-generated code update to other collaborators
    if (user && roomCode) {
      fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomCode,
          userId: user.id,
          username: 'AI Assistant',
          event: 'codeUpdate',
          data: newCode,
        }),
      }).catch(err => console.error('Error broadcasting AI code update:', err));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      {/* Global overlay to capture mouse while resizing */}
      {isResizing && (
        <div
          onMouseMove={(e) => {
            const viewportWidth = window.innerWidth;
            const maxWidth = Math.min(Math.floor(viewportWidth * 0.9), 1200);
            const newWidth = Math.min(maxWidth, Math.max(240, e.clientX));
            setSidebarWidth(newWidth);
          }}
          onTouchMove={(e) => {
            if (e.touches && e.touches[0]) {
              const clientX = e.touches[0].clientX;
              const viewportWidth = window.innerWidth;
              const maxWidth = Math.min(Math.floor(viewportWidth * 0.9), 1200);
              const newWidth = Math.min(maxWidth, Math.max(240, clientX));
              setSidebarWidth(newWidth);
            }
          }}
          onMouseUp={() => setIsResizing(false)}
          onTouchEnd={() => setIsResizing(false)}
          onMouseLeave={() => setIsResizing(false)}
          className="fixed inset-0 z-40"
          style={{ cursor: 'ew-resize' }}
        />
      )}
      

      {/* Header */}
      <header className="bg-gray-800 border-b border-emerald-900/30 px-6 py-1">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold">CodeLab Session</h1>
                <button
                  onClick={handleCopyRoomCode}
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center relative"
                >
                  Room: {roomCode}
                  <Copy className="w-3 h-3 ml-1" />
                  {showCopiedNotification && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-fadeIn">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* AI Assistant Toggle */}
            <button
              onClick={() => {
                if (!showAISidebar) {
                  setSidebarWidth(600);
                  setShowAISidebar(true);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                showAISidebar 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
              title="AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-emerald-900/30 focus:outline-none focus:border-emerald-500 transition-colors"
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
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                title="Download code"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
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
        {/* AI Assistant Sidebar */}
        {showAISidebar && (
          <div 
            className={`bg-gray-800 border-r border-emerald-900/30 flex flex-col ${isResizing ? '' : 'transition-all duration-300'} relative`}
            style={{ width: `${sidebarWidth}px` }}
          >
            {/* Slim top bar with only close */}
            <div className="flex items-center justify-end px-2 py-2 border-b border-emerald-900/30">
              <button
                onClick={() => setShowAISidebar(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Close assistant"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* AI Assistant Content */}
            <div className="flex-1 overflow-hidden">
              <AIAssistant 
                code={code} 
                language={language} 
                onCodeUpdate={handleAICodeUpdate}
                isSidebar={true}
                sidebarWidth={sidebarWidth}
              />
            </div>

            {/* Drag resize handle at the right edge */}
            <div
              onMouseDown={() => setIsResizing(true)}
              onTouchStart={() => setIsResizing(true)}
              className="absolute top-0 right-0 h-full w-2 md:w-3 cursor-col-resize bg-transparent hover:bg-emerald-500/30"
              title="Drag to resize"
            />
          </div>
        )}

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
          <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-emerald-900/30">
            <p className="text-xs text-gray-400">
              Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+Enter</kbd> to run
            </p>
          </div>
        </div>

        {/* Output Panel - Bottom Terminal */}
        {showOutput && (
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gray-800 border-t border-emerald-900/30 flex flex-col z-10">
            {/* Output Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-900/30">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <h3 className="text-white font-medium text-sm">Terminal</h3>
                {executionTime && (
                  <span className="text-xs text-gray-500">
                    ({executionTime}ms)
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowOutput(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-auto p-3 font-mono text-xs">
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
            <div className="px-3 py-1 border-t border-emerald-900/30 bg-gray-900/50">
              <div className="flex items-center space-x-2 text-xs">
                {isError ? (
                  <>
                    <X className="w-3 h-3 text-red-400" />
                    <span className="text-red-400">Execution failed</span>
                  </>
                ) : isRunning ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                    <span className="text-emerald-400">Running...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Success</span>
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


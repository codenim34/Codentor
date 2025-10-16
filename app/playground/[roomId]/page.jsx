"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { executeCode } from "@/app/api/Piston/api";
import { CODE_SNIPPETS } from "@/app/constants";
import EditorHeader from "@/components/playground/editor/EditorHeader";
import EditorFooter from "@/components/learn/editor/EditorFooter";
import OutputPanel from "@/components/learn/editor/OutputPanel";
import CollaboratorAvatars from "../../../components/playground/CollaboratorAvatars";
import { pusherClient } from '../../../lib/pusher-client';

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'php', name: 'PHP' },
];

const getFileExtension = (lang) => {
  const extensions = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    php: 'php'
  };
  return extensions[lang] || 'txt';
};

const RoomPage = () => {
  const { roomId } = useParams();
  const { userId } = useAuth();
  const { user } = useUser();
  const [collaborators, setCollaborators] = useState([]);
  const [code, setCode] = useState(CODE_SNIPPETS['javascript']);
  const [lastUpdateFromServer, setLastUpdateFromServer] = useState(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState([]);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [wordCount, setWordCount] = useState(0);
  const [executionTime, setExecutionTime] = useState(null);
  const [executionTimestamp, setExecutionTimestamp] = useState(null);
  const [fileName, setFileName] = useState(`main.${getFileExtension('javascript')}`);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState({ code: false, link: false });

  const getDisplayName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress;
    }
    return 'Anonymous';
  };

  useEffect(() => {
    if (!roomId || !userId) return;

    console.log('Subscribing to channel:', `room-${roomId}`);
    const channel = pusherClient.subscribe(`room-${roomId}`);
    
    // Join room
    const joinRoom = async () => {
      try {
        const response = await fetch('/api/socket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId,
            userId,
            username: getDisplayName(user),
            event: 'join-room',
          }),
        });
        if (!response.ok) {
          console.error('Failed to join room:', await response.text());
        }
      } catch (error) {
        console.error('Error joining room:', error);
      }
    };
    
    joinRoom();

    channel.bind('collaboratorsUpdate', (data) => {
      console.log('Received collaborators update:', data);
      if (Array.isArray(data)) {
        // Sort collaborators by timestamp to ensure consistent order
        const sortedCollaborators = [...data].sort((a, b) => b.timestamp - a.timestamp);
        setCollaborators(sortedCollaborators);
      }
    });

    channel.bind('codeUpdate', (data) => {
      console.log('Received code update from:', data.username || data.userId);
      if (data && data.userId !== userId) {
        setLastUpdateFromServer(data.data);
        setCode(data.data);
      }
    });

    // Debug Pusher connection
    pusherClient.connection.bind('state_change', (states) => {
      console.log('Pusher state changed:', states);
    });

    pusherClient.connection.bind('connected', () => {
      console.log('Pusher client connected successfully');
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('Pusher connection error:', err);
    });

    return () => {
      // Leave room
      fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          userId,
          username: getDisplayName(user),
          event: 'leave-room',
        }),
      }).catch(error => console.error('Error leaving room:', error));

      console.log('Unsubscribing from channel:', `room-${roomId}`);
      channel.unbind_all();
      pusherClient.unsubscribe(`room-${roomId}`);
    };
  }, [roomId, userId, user]);

  useEffect(() => {
    if (output.length > 0) {
      setShowOutput(true);
    }
  }, [output]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom Codentor theme
    monaco.editor.defineTheme('codentor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '34d399', fontStyle: 'bold' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: '6ee7b7' },
        { token: 'function', foreground: '059669' },
        { token: 'variable', foreground: 'd1d5db' },
        { token: 'type', foreground: '047857' },
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#e5e7eb',
        'editor.lineHighlightBackground': '#111827',
        'editor.selectionBackground': '#065f4630',
        'editor.selectionHighlightBackground': '#065f4620',
        'editorCursor.foreground': '#10b981',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#10b981',
        'editor.inactiveSelectionBackground': '#065f4615',
        'editorIndentGuide.background': '#1f2937',
        'editorIndentGuide.activeBackground': '#374151',
        'editorBracketMatch.background': '#065f4640',
        'editorBracketMatch.border': '#10b981',
        'scrollbarSlider.background': '#374151',
        'scrollbarSlider.hoverBackground': '#4b5563',
        'scrollbarSlider.activeBackground': '#6b7280',
      }
    });

    editor.focus();

    // Enhanced editor configuration
    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      },
      wordBasedSuggestions: true,
      parameterHints: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true,
      tabCompletion: 'on',
      folding: true,
      foldingStrategy: 'auto',
      showFoldingControls: 'always',
      matchBrackets: 'always',
      renderWhitespace: 'selection',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      fontLigatures: true,
      bracketPairColorization: { enabled: true },
      lightbulb: { enabled: true },
      codeActionsOnSave: true,
    });

    // Set up inline error checking for JavaScript/TypeScript
    if (language === 'javascript' || language === 'typescript') {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        allowJs: true,
        checkJs: true,
      });
    }

    // Set up Python syntax validation (basic)
    if (language === 'python') {
      const validatePython = () => {
        const model = editor.getModel();
        const code = model.getValue();
        const markers = [];

        const lines = code.split('\n');
        lines.forEach((line, index) => {
          // Check for unclosed strings
          const singleQuotes = (line.match(/(?<!\\)'/g) || []).length;
          const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;
          
          if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: index + 1,
              startColumn: 1,
              endLineNumber: index + 1,
              endColumn: line.length + 1,
              message: 'Unclosed string literal',
            });
          }

          // Check for missing colons
          if (/^\s*(if|elif|else|for|while|def|class|try|except|finally|with)\s+.+[^:]$/.test(line.trim())) {
            if (line.trim() !== 'else' && line.trim() !== 'finally') {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: index + 1,
                startColumn: line.length,
                endLineNumber: index + 1,
                endColumn: line.length + 1,
                message: 'Missing colon at end of statement',
              });
            }
          }
        });

        monaco.editor.setModelMarkers(model, 'python', markers);
      };

      let validationTimeout;
      editor.onDidChangeModelContent(() => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(validatePython, 300);
      });

      validatePython();
    }

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      setCursorPosition({
        line: position.lineNumber,
        column: position.column,
      });
    });

    let timeout;
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      setWordCount(content.trim().split(/\s+/).length);
      setHasChanges(true);
      
      // Debounce the update
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleEditorChange(content);
      }, 500);
    });

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    // Format document shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  const handleEditorChange = (value) => {
    if (value === lastUpdateFromServer) return;
    
    fetch('/api/socket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        userId,
        username: getDisplayName(user),
        event: 'codeUpdate',
        data: value,
      }),
    });
  };

  const handleLanguageChange = (newLanguage) => {
    if (hasChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to change languages?"
      );
      if (!confirm) return;
    }
    setLanguage(newLanguage);
    const newCode = CODE_SNIPPETS[newLanguage] || "";
    setCode(newCode);
    setFileName(`main.${getFileExtension(newLanguage)}`);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleRunCode = async () => {
    if (!editorRef.current) {
      console.error('Editor not initialized');
      return;
    }

    try {
      setLoading(true);
      setIsRunning(true);
      const startTime = performance.now();
      
      const result = await executeCode(language, code);
      console.log('Execution result:', result);
      
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setExecutionTimestamp(new Date());
      
      // Handle different response structures
      let output = '';
      let hasError = false;
      
      if (result.run) {
        // Piston API v2 format
        output = result.run.output || '';
        hasError = !!result.run.stderr;
      } else if (result.stdout || result.stderr) {
        // Alternative format
        output = result.stdout || result.stderr || '';
        hasError = !!result.stderr;
      } else if (typeof result === 'string') {
        output = result;
      } else {
        output = JSON.stringify(result, null, 2);
      }
      
      setOutput(output.split("\n"));
      setIsError(hasError);
    } catch (error) {
      console.error("Error running code:", error);
      setOutput([error.message || "An error occurred while running the code"]);
      setIsError(true);
    } finally {
      setLoading(false);
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleClear = () => {
    const newCode = "";
    setCode(newCode);
    fetch('/api/socket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        userId,
        username: getDisplayName(user),
        event: 'codeUpdate',
        data: newCode,
      }),
    });
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setShowCopySuccess(prev => ({ ...prev, code: true }));
      setTimeout(() => setShowCopySuccess(prev => ({ ...prev, code: false })), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://codentor-xtradrill.vercel.app/playground/${roomId}`);
      setShowCopySuccess(prev => ({ ...prev, link: true }));
      setTimeout(() => setShowCopySuccess(prev => ({ ...prev, link: false })), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleCloseOutput = () => {
    setShowOutput(false);
  };

  const handleClearOutput = () => {
    setOutput([]);
    setShowOutput(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-codeBlack-900 to-deepGreen-950">
      <div className="flex items-center justify-between p-4 border-b border-deepGreen-800/30 bg-codeBlack-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white">Code Studio: <span className="text-deepGreen-400">{roomId}</span></h1>
          <div className="flex items-center space-x-2">
            <CollaboratorAvatars collaborators={collaborators} />
            <span className="text-sm text-gray-400">
              {collaborators.length} {collaborators.length === 1 ? 'developer' : 'developers'} active
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCopyRoomCode}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2
              ${showCopySuccess.code 
                ? 'bg-deepGreen-500/20 text-deepGreen-400 hover:bg-deepGreen-500/30' 
                : 'bg-codeBlack-800 text-gray-300 hover:bg-codeBlack-700 border border-deepGreen-800/30'
              }`}
          >
            {showCopySuccess.code ? (
              <>
                <span>Copied!</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Copy Code</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </>
            )}
          </button>
          <button
            onClick={handleCopyShareLink}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2
              ${showCopySuccess.link 
                ? 'bg-deepGreen-500/20 text-deepGreen-400 hover:bg-deepGreen-500/30' 
                : 'bg-codeBlack-800 text-gray-300 hover:bg-codeBlack-700 border border-deepGreen-800/30'
              }`}
          >
            {showCopySuccess.link ? (
              <>
                <span>Copied!</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Share Link</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <EditorHeader
          fileName={fileName}
          language={language}
          languages={SUPPORTED_LANGUAGES}
          onLanguageChange={handleLanguageChange}
          onFileNameChange={setFileName}
          onCopy={handleCopy}
          onClear={handleClear}
          onRun={handleRunCode}
          isRunning={isRunning}
          code={code}
          onCodeChange={handleEditorChange}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme="codentor-dark"
              options={{
                minimap: { enabled: true, scale: 1 },
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                lineNumbers: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                  useShadows: true,
                },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: false,
                overviewRulerLanes: 2,
                padding: { top: 16, bottom: 16 },
                // Enhanced features
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true
                },
                wordBasedSuggestions: true,
                parameterHints: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnPaste: true,
                formatOnType: true,
                tabCompletion: 'on',
                folding: true,
                foldingStrategy: 'auto',
                showFoldingControls: 'always',
                matchBrackets: 'always',
                renderWhitespace: 'selection',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                fontLigatures: true,
                bracketPairColorization: { enabled: true },
                lightbulb: { enabled: true },
                // Error detection
                glyphMargin: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'all',
                renderLineHighlightOnlyWhenFocus: false,
              }}
              onMount={handleEditorDidMount}
            />
          </div>
          {showOutput && (
            <div className="w-1/3 overflow-hidden bg-codeBlack-950 border-l border-deepGreen-800/30">
              <OutputPanel
                output={output}
                isError={isError}
                executionTime={executionTime}
                executionTimestamp={executionTimestamp}
                onClose={handleCloseOutput}
                onClear={handleClearOutput}
              />
            </div>
          )}
        </div>
      </div>
      <EditorFooter
        language={language}
        position={cursorPosition}
        wordCount={wordCount}
        onRun={handleRunCode}
        loading={loading}
        hasChanges={hasChanges}
      />
      
      {/* Keyboard Shortcuts Info */}
      <div className="fixed bottom-20 right-6 group">
        <button className="flex items-center justify-center w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition-all duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-12 right-0 w-80 p-4 bg-gray-900 border border-emerald-500/30 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Keyboard Shortcuts
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Save Code</span>
              <kbd className="px-2 py-1 bg-gray-800 text-emerald-400 rounded border border-emerald-500/30 font-mono text-xs">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + S
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Run Code</span>
              <kbd className="px-2 py-1 bg-gray-800 text-emerald-400 rounded border border-emerald-500/30 font-mono text-xs">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Format Code</span>
              <kbd className="px-2 py-1 bg-gray-800 text-emerald-400 rounded border border-emerald-500/30 font-mono text-xs">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Shift + F
              </kbd>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500 italic">
                ✨ Inline error checking enabled for JS & Python
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;

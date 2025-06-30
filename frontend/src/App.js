import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import io from 'socket.io-client';
import { 
  Settings, 
  Search, 
  Plus, 
  X, 
  ChevronDown,
  Play,
  Send,
  Key,
  Sparkles,
  User,
  Bot,
  Download,
  Zap,
  Code,
  GitBranch,
  Folder,
  FileText,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Activity
} from 'lucide-react';
import 'xterm/css/xterm.css';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Kitty/Fish inspired color scheme
const THEME = {
  background: '#1e1e2e',
  foreground: '#cdd6f4',
  cursor: '#f5e0dc',
  cursorAccent: '#1e1e2e',
  selection: '#45475a',
  black: '#45475a',
  red: '#f38ba8',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  blue: '#89b4fa',
  magenta: '#cba6f7',
  cyan: '#94e2d5',
  white: '#bac2de',
  brightBlack: '#585b70',
  brightRed: '#f38ba8',
  brightGreen: '#a6e3a1',
  brightYellow: '#f9e2af',
  brightBlue: '#89b4fa',
  brightMagenta: '#cba6f7',
  brightCyan: '#94e2d5',
  brightWhite: '#a6adc8'
};

const Header = ({ onSettingsClick, onApiKeyClick, systemInfo }) => (
  <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 border-b border-purple-600 shadow-lg">
    <div className="flex items-center space-x-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Terminal className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            KittyWarp
          </span>
          <div className="text-xs text-gray-300 flex items-center space-x-2">
            <Monitor className="w-3 h-3" />
            <span>{systemInfo?.platform || 'Loading...'}</span>
          </div>
        </div>
      </div>
      <nav className="flex items-center space-x-6">
        <button className="text-cyan-300 hover:text-cyan-100 transition-colors font-medium">Terminal</button>
        <button className="text-gray-300 hover:text-white transition-colors">AI Assistant</button>
        <button className="text-gray-300 hover:text-white transition-colors">Settings</button>
      </nav>
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3 text-sm text-gray-300">
        <div className="flex items-center space-x-1">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>{systemInfo?.cpu_count || 0} cores</span>
        </div>
        <div className="flex items-center space-x-1">
          <HardDrive className="w-4 h-4 text-green-400" />
          <span>{systemInfo ? Math.round(systemInfo.memory_available / 1024 / 1024 / 1024) : 0}GB</span>
        </div>
        <div className="flex items-center space-x-1">
          <Wifi className="w-4 h-4 text-purple-400" />
          <span className="text-green-400">●</span>
        </div>
      </div>
      <button 
        onClick={onApiKeyClick}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Key className="w-4 h-4" />
        <span>AI Setup</span>
      </button>
    </div>
  </header>
);

const Sidebar = ({ sessions, activeSession, onSessionChange, systemInfo, currentPath }) => (
  <div className="w-72 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 border-r border-purple-600 flex flex-col shadow-2xl">
    <div className="p-4 border-b border-purple-600">
      <button className="flex items-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
        <Plus className="w-5 h-5" />
        <span className="font-medium">New Session</span>
      </button>
    </div>
    
    <div className="flex-1 p-4">
      <h3 className="text-cyan-400 text-sm font-bold mb-4 uppercase tracking-wide flex items-center">
        <Activity className="w-4 h-4 mr-2" />
        Active Sessions
      </h3>
      <div className="space-y-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionChange(session.id)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              session.active 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Terminal className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">{session.name}</div>
                <div className="text-xs opacity-70">{session.type}</div>
              </div>
            </div>
            {session.active && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-cyan-400 text-sm font-bold mb-4 uppercase tracking-wide flex items-center">
          <Code className="w-4 h-4 mr-2" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-cyan-400 rounded-lg transition-colors">
            <GitBranch className="w-4 h-4" />
            <span>Git Status</span>
          </button>
          <button className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-cyan-400 rounded-lg transition-colors">
            <Folder className="w-4 h-4" />
            <span>File Explorer</span>
          </button>
          <button className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-cyan-400 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span>Edit Config</span>
          </button>
        </div>
      </div>
    </div>
    
    <div className="p-4 border-t border-purple-600 bg-gray-800">
      <div className="text-gray-300 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-cyan-400 font-medium">Current Path:</span>
        </div>
        <div className="font-mono text-xs bg-gray-900 p-2 rounded border border-gray-700 text-green-400">
          {currentPath || '~'}
        </div>
        <div className="flex items-center justify-between">
          <span>Host:</span>
          <span className="text-purple-400">{systemInfo?.hostname || 'localhost'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Platform:</span>
          <span className="text-blue-400">{systemInfo?.platform || 'Unknown'}</span>
        </div>
      </div>
    </div>
  </div>
);

const AIAssistant = ({ isOpen, onClose, apiKey, socket }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'ai', 
      content: '¡Hola! Soy tu asistente de IA integrado. Puedo ayudarte a:\n\n• Ejecutar comandos y analizar resultados\n• Explicar errores y sugerir soluciones\n• Generar planes de acción\n• Optimizar flujos de trabajo\n• Manejar contingencias\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toLocaleTimeString()
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('ai_response', (data) => {
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: data.analysis,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      });

      socket.on('ai_error', (data) => {
        const errorMessage = {
          id: Date.now(),
          type: 'ai',
          content: `Error: ${data.error}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      });
    }

    return () => {
      if (socket) {
        socket.off('ai_response');
        socket.off('ai_error');
      }
    };
  }, [socket]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { 
      id: Date.now(), 
      type: 'user', 
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    if (socket && apiKey) {
      socket.emit('ai_analyze', {
        message: currentInput,
        context: messages.slice(-5).map(m => `${m.type}: ${m.content}`).join('\n'),
        api_key: apiKey,
        provider: 'openai'
      });
    } else {
      // Mock response when no API key
      setTimeout(() => {
        const mockResponse = {
          id: Date.now(),
          type: 'ai',
          content: `He recibido tu mensaje: "${currentInput}"\n\nPara obtener respuestas completas de IA, necesitas configurar tu API key. Mientras tanto, puedo ayudarte con:\n\n• Comandos básicos de terminal\n• Navegación de archivos\n• Operaciones Git básicas\n• Gestión de procesos\n\n¿Necesitas ayuda con algún comando específico?`,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, mockResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-96 h-full bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 border-l border-purple-600 flex flex-col z-50 shadow-2xl"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-600 bg-gradient-to-r from-purple-800 to-pink-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold">AI Assistant</span>
            <div className="text-xs text-gray-300">
              {apiKey ? 'Conectado' : 'Sin API Key'}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-purple-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div 
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}>
                {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' 
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}>
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{message.content}</pre>
                <div className="text-xs opacity-70 mt-2">{message.timestamp}</div>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 bg-gray-800 rounded-2xl border border-gray-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="p-4 border-t border-purple-600 bg-gray-800">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregúntame sobre comandos, errores, o necesidades..."
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          <button
            onClick={handleSend}
            className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ApiKeyModal = ({ isOpen, onClose, apiKey, onApiKeyChange }) => {
  const [key, setKey] = useState(apiKey || '');
  const [provider, setProvider] = useState('openai');

  if (!isOpen) return null;

  const handleSave = () => {
    onApiKeyChange(key, provider);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-purple-900 border border-purple-600 rounded-2xl p-8 w-96 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-white text-xl font-bold">Configurar IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-cyan-400 text-sm font-bold mb-3">Proveedor de IA</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            >
              <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google (Gemini)</option>
              <option value="perplexity">Perplexity</option>
            </select>
          </div>
          
          <div>
            <label className="block text-cyan-400 text-sm font-bold mb-3">API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Introduce tu API key..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-300 text-sm">
              <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <Key className="w-4 h-4" />
                <span className="font-medium">Privacidad y Seguridad</span>
              </div>
              <p className="text-xs leading-relaxed">
                Tu API key se almacena localmente y nunca se envía a nuestros servidores. 
                Se usa directamente para comunicarse con tu proveedor de IA elegido.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

function App() {
  const [socket, setSocket] = useState(null);
  const [terminal, setTerminal] = useState(null);
  const [sessions, setSessions] = useState([
    { id: 1, name: 'main', type: 'PowerShell', active: true },
    { id: 2, name: 'server', type: 'Bash', active: false },
    { id: 3, name: 'tests', type: 'Python', active: false }
  ]);
  const [activeSession, setActiveSession] = useState(1);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('aiApiKey') || '');
  const [apiProvider, setApiProvider] = useState(localStorage.getItem('aiProvider') || 'openai');
  const [systemInfo, setSystemInfo] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [terminalMode, setTerminalMode] = useState('terminal'); // 'terminal' or 'ai'
  const [aiInput, setAiInput] = useState('');
  const terminalRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Initialize terminal
    const term = new Terminal({
      theme: THEME,
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: true,
      macOptionIsMeta: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(searchAddon);

    fitAddonRef.current = fitAddon;
    setTerminal(term);

    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
      
      // Welcome message
      term.writeln('\x1b[1;36m╭─────────────────────────────────────────────────────────────╮\x1b[0m');
      term.writeln('\x1b[1;36m│  \x1b[1;35m🚀 KittyWarp Terminal - Powered by AI\x1b[1;36m                   │\x1b[0m');
      term.writeln('\x1b[1;36m│  \x1b[1;33m⚡ Ejecuta comandos reales con asistente IA integrado\x1b[1;36m      │\x1b[0m');
      term.writeln('\x1b[1;36m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
      term.writeln('');
      term.write('\x1b[1;32m❯ \x1b[0m');
    }

    // Handle command input
    let currentLine = '';
    term.onData((data) => {
      const code = data.charCodeAt(0);
      
      if (code === 13) { // Enter
        term.writeln('');
        if (currentLine.trim()) {
          executeCommand(currentLine.trim(), newSocket, term);
        } else {
          term.write('\x1b[1;32m❯ \x1b[0m');
        }
        currentLine = '';
      } else if (code === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code >= 32) { // Printable characters
        currentLine += data;
        term.write(data);
      }
    });

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('get_system_info', {});
    });

    newSocket.on('system_info', (info) => {
      setSystemInfo(info);
      setCurrentPath(info.current_directory);
    });

    newSocket.on('command_result', (data) => {
      const { result } = data;
      if (result.stdout) {
        term.writeln(result.stdout);
      }
      if (result.stderr) {
        term.writeln(`\x1b[1;31m${result.stderr}\x1b[0m`);
      }
      if (result.working_directory) {
        setCurrentPath(result.working_directory);
      }
      term.write('\x1b[1;32m❯ \x1b[0m');
    });

    newSocket.on('command_error', (data) => {
      term.writeln(`\x1b[1;31mError: ${data.error}\x1b[0m`);
      term.write('\x1b[1;32m❯ \x1b[0m');
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (newSocket) {
        newSocket.disconnect();
      }
      if (term) {
        term.dispose();
      }
    };
  }, []);

  const executeCommand = (command, socket, term) => {
    if (socket) {
      socket.emit('execute_command_event', {
        command: command,
        session_id: activeSession
      });
    }
  };

  const handleApiKeyChange = (key, provider) => {
    setApiKey(key);
    setApiProvider(provider);
    localStorage.setItem('aiApiKey', key);
    localStorage.setItem('aiProvider', provider);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col overflow-hidden">
      <Header 
        onSettingsClick={() => {}}
        onApiKeyClick={() => setIsApiModalOpen(true)}
        systemInfo={systemInfo}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          sessions={sessions}
          activeSession={activeSession}
          onSessionChange={setActiveSession}
          systemInfo={systemInfo}
          currentPath={currentPath}
        />
        
        <main className="flex-1 flex flex-col bg-gray-950">
          <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-800 to-purple-800 border-b border-purple-600">
            <div className="flex items-center space-x-4">
              <h1 className="text-white font-bold flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span>Terminal Interactiva</span>
              </h1>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en historial..."
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAIOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>IA Assistant</span>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div 
            ref={terminalRef}
            className="flex-1 p-2 bg-gray-950"
            style={{ minHeight: '400px' }}
          />
        </main>
      </div>

      <AnimatePresence>
        {isAIOpen && (
          <AIAssistant
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            apiKey={apiKey}
            socket={socket}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isApiModalOpen && (
          <ApiKeyModal
            isOpen={isApiModalOpen}
            onClose={() => setIsApiModalOpen(false)}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
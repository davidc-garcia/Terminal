import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Settings, 
  Search, 
  Plus, 
  X, 
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Send,
  Key,
  Sparkles,
  User,
  Bot,
  Menu,
  Download,
  Github,
  ExternalLink
} from 'lucide-react';
import './App.css';

// Mock data for terminal sessions
const mockSessions = [
  { id: 1, name: 'main', active: true },
  { id: 2, name: 'server', active: false },
  { id: 3, name: 'tests', active: false }
];

const mockCommands = [
  { id: 1, command: 'ls -la', output: 'total 48\ndrwxr-xr-x  12 user  staff   384 Dec 15 10:30 .\ndrwxr-xr-x   8 user  staff   256 Dec 15 10:29 ..\n-rw-r--r--   1 user  staff  1234 Dec 15 10:30 package.json\n-rw-r--r--   1 user  staff   567 Dec 15 10:29 README.md', timestamp: '10:30 AM' },
  { id: 2, command: 'git status', output: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git checkout -- <file>..." to discard changes in working directory)\n\n\tmodified:   src/App.js\n\nno changes added to commit (use "git add" or "git commit -a")', timestamp: '10:32 AM' },
];

const Header = ({ onSettingsClick, onApiKeyClick }) => (
  <header className="flex items-center justify-between px-6 py-4 bg-black border-b border-gray-800">
    <div className="flex items-center space-x-8">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-semibold text-lg">warp</span>
      </div>
      <nav className="flex items-center space-x-6">
        <button className="text-gray-300 hover:text-white transition-colors">Features</button>
        <button className="text-gray-300 hover:text-white transition-colors">Resources</button>
        <button className="text-gray-300 hover:text-white transition-colors">Pricing</button>
        <button className="text-gray-300 hover:text-white transition-colors">Careers</button>
        <button className="text-gray-300 hover:text-white transition-colors">Enterprise</button>
      </nav>
    </div>
    <div className="flex items-center space-x-4">
      <button 
        onClick={onApiKeyClick}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        <Key className="w-4 h-4" />
        <span>API Keys</span>
      </button>
      <button className="text-gray-300 hover:text-white transition-colors">Contact sales</button>
      <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors">
        <Download className="w-4 h-4" />
        <span>Download Warp</span>
      </button>
    </div>
  </header>
);

const Sidebar = ({ sessions, activeSession, onSessionChange }) => (
  <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
    <div className="p-4 border-b border-gray-800">
      <button className="flex items-center space-x-2 w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
        <Plus className="w-4 h-4" />
        <span>New Session</span>
      </button>
    </div>
    <div className="flex-1 p-4">
      <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">Sessions</h3>
      <div className="space-y-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionChange(session.id)}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
              session.active ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Terminal className="w-4 h-4" />
              <span>{session.name}</span>
            </div>
            {session.active && <div className="w-2 h-2 bg-green-400 rounded-full" />}
          </button>
        ))}
      </div>
    </div>
    <div className="p-4 border-t border-gray-800">
      <div className="text-gray-400 text-xs">
        <div className="mb-2">Session: main</div>
        <div>Path: ~/projects/warp-clone</div>
      </div>
    </div>
  </div>
);

const TerminalBlock = ({ command, output, timestamp, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-700 rounded-lg bg-gray-900 mb-4 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
          </button>
          <span className="text-green-400 font-mono text-sm">$</span>
          <span className="text-white font-mono text-sm">{command}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-xs">{timestamp}</span>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Play className="w-3 h-3" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <pre className="p-4 text-gray-300 font-mono text-sm whitespace-pre-wrap">{output}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AIAssistant = ({ isOpen, onClose, apiKey }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', content: 'Hello! I\'m your AI assistant. How can I help you with your terminal commands today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { id: messages.length + 1, type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: getAIResponse(input)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput) => {
    const responses = {
      'help': 'I can help you with various terminal commands. Try asking me about git, npm, docker, or any other command!',
      'git': 'Here are some common git commands:\n- `git status` - Check repository status\n- `git add .` - Stage all changes\n- `git commit -m "message"` - Commit changes\n- `git push` - Push to remote repository',
      'npm': 'Common npm commands:\n- `npm install` - Install dependencies\n- `npm start` - Start development server\n- `npm run build` - Build for production\n- `npm test` - Run tests',
      'docker': 'Docker commands:\n- `docker build -t name .` - Build image\n- `docker run -p 3000:3000 name` - Run container\n- `docker ps` - List running containers\n- `docker stop container_id` - Stop container'
    };

    const lowerInput = userInput.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }
    
    return `I understand you're asking about "${userInput}". While I'd love to help with that specific command, I need a valid API key to provide detailed assistance. You can configure your API key in the settings.`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 flex flex-col z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span className="text-white font-medium">AI Assistant</span>
          {!apiKey && <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">No API Key</span>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-orange-600' : 'bg-gray-700'}`}>
                {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                <pre className="whitespace-pre-wrap text-sm font-mono">{message.content}</pre>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about terminal commands..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-96"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">Configure AI API Key</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google (Gemini)</option>
              <option value="perplexity">Perplexity</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          
          <div className="text-gray-400 text-xs">
            <p>Your API key is stored locally and never sent to our servers. It's used directly to communicate with your chosen AI provider.</p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CommandInput = ({ onCommand }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setHistory(prev => [...prev, input]);
    onCommand(input);
    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border-t border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <span className="text-green-400 font-mono">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          className="flex-1 bg-transparent text-white font-mono placeholder-gray-500 focus:outline-none"
          autoFocus
        />
      </div>
    </form>
  );
};

function App() {
  const [sessions, setSessions] = useState(mockSessions);
  const [activeSession, setActiveSession] = useState(1);
  const [commands, setCommands] = useState(mockCommands);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('openai');

  const handleCommand = (command) => {
    const newCommand = {
      id: commands.length + 1,
      command,
      output: getMockOutput(command),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCommands(prev => [...prev, newCommand]);
  };

  const getMockOutput = (command) => {
    const outputs = {
      'ls': 'package.json\nREADME.md\nsrc/\npublic/',
      'pwd': '/Users/user/projects/warp-clone',
      'whoami': 'user',
      'date': new Date().toString(),
      'clear': '',
      'help': 'Available commands: ls, pwd, whoami, date, clear, git, npm, python, node'
    };

    if (command.startsWith('echo ')) {
      return command.substring(5);
    }

    if (command.includes('git')) {
      return 'git version 2.39.0';
    }

    if (command.includes('npm')) {
      return 'npm version 9.2.0';
    }

    return outputs[command] || `Command not found: ${command}`;
  };

  const handleApiKeyChange = (key, provider) => {
    setApiKey(key);
    setApiProvider(provider);
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <Header 
        onSettingsClick={() => {}}
        onApiKeyClick={() => setIsApiModalOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          sessions={sessions}
          activeSession={activeSession}
          onSessionChange={setActiveSession}
        />
        
        <main className="flex-1 flex flex-col bg-gray-950">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <h1 className="text-white font-medium">Terminal</h1>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAIOpen(true)}
                className="flex items-center space-x-2 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {commands.map((cmd, index) => (
              <TerminalBlock
                key={cmd.id}
                command={cmd.command}
                output={cmd.output}
                timestamp={cmd.timestamp}
                isLast={index === commands.length - 1}
              />
            ))}
          </div>
          
          <CommandInput onCommand={handleCommand} />
        </main>
      </div>

      <AnimatePresence>
        {isAIOpen && (
          <AIAssistant
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            apiKey={apiKey}
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
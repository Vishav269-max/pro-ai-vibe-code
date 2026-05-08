import React, { useState, useEffect, useRef } from 'react';
import {
  FolderTree,
  MessageSquare,
  Cpu,
  Settings,
  Play,
  Download,
  Mic,
  Terminal as TerminalIcon,
  Plus,
  Code,
  Zap,
  Globe,
  Bug,
  Layout,
  Layers,
  ShieldCheck,
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import Editor from "@monaco-editor/react";
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState('// Welcome to Ultron AI\n\nconsole.log("Hello, Ultron!");');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Greetings. I am Ultron. How can I assist your coding journey today?' }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('files');
  const [selectedModel, setSelectedModel] = useState('DeepSeek-Coder-V2');
  const [systemStatus, setSystemStatus] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchFiles();
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/files`);
      setFiles(res.data);
    } catch (err) {
      console.error('Error fetching files', err);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/system/status`);
      setSystemStatus(res.data);
    } catch (err) {
      console.error('Error fetching system status', err);
    }
  };

  const handleFileClick = async (name) => {
    if (selectedFile) await handleSave();
    try {
      const res = await axios.get(`${API_BASE}/files/${name}`);
      setSelectedFile(name);
      setCode(res.data.content);
    } catch (err) {
      console.error('Error loading file', err);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    try {
      await axios.post(`${API_BASE}/files`, { name: selectedFile, content: code });
    } catch (err) {
      console.error('Error saving file', err);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName) return;
    try {
      await axios.post(`${API_BASE}/files`, { name: newFileName });
      setNewFileName('');
      setShowModal(false);
      fetchFiles();
    } catch (err) {
      console.error('Error creating file', err);
    }
  };

  const handleSendMessage = async (msg) => {
    const messageToSend = msg || chatMessage;
    if (!messageToSend) return;
    const newHistory = [...chatHistory, { role: 'user', content: messageToSend }];
    setChatHistory(newHistory);
    setChatMessage('');

    try {
      const res = await axios.post(`${API_BASE}/ai/chat`, {
        message: messageToSend,
        model: selectedModel
      });
      setChatHistory([...newHistory, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Error communicating with Ultron Core.' }]);
    }
  };

  const handleAIAction = (action) => {
    handleSendMessage(`${action} the current code.`);
  };

  const handleBuild = async (type) => {
    setIsBuilding(true);
    setBuildProgress(0);
    try {
      await axios.post(`${API_BASE}/build/${type}`);
      const interval = setInterval(() => {
        setBuildProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsBuilding(false);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    } catch (err) {
      setIsBuilding(false);
      console.error('Build failed', err);
    }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    if (!isRecording) {
      setIsRecording(true);
      recognition.start();
      recognition.onresult = (e) => {
        handleSendMessage(e.results[0][0].transcript);
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="flex h-screen bg-ultron-bg text-ultron-text overflow-hidden font-sans text-sm">
      {/* Sidebar Navigation */}
      <div className="w-16 flex flex-col items-center py-4 bg-ultron-sidebar border-r border-ultron-border space-y-6">
        <div className="text-ultron-accent mb-4 animate-pulse">
          <Zap size={28} fill="currentColor" />
        </div>
        {[
          { id: 'files', icon: FolderTree },
          { id: 'ai', icon: Cpu },
          { id: 'build', icon: Layers },
          { id: 'settings', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-ultron-accent text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
          >
            <tab.icon size={22} />
          </button>
        ))}
        <div className="flex-1"></div>
        <div className={`w-2 h-2 rounded-full ${systemStatus ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
      </div>

      {/* Explorer Sidebar */}
      <div className="w-64 bg-ultron-sidebar border-r border-ultron-border flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-ultron-border h-12">
          <span className="font-bold tracking-widest text-[10px] uppercase text-gray-400">
            {activeTab === 'files' ? 'Explorer' : activeTab.toUpperCase()}
          </span>
          {activeTab === 'files' && (
            <button onClick={() => setShowModal(true)} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
              <Plus size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'files' && (
            <div className="space-y-1">
              {files.map(f => (
                <div
                  key={f}
                  onClick={() => handleFileClick(f)}
                  className={`flex items-center px-3 py-1.5 cursor-pointer rounded-md transition-colors ${selectedFile === f ? 'bg-ultron-accent/10 text-ultron-accent border border-ultron-accent/20' : 'hover:bg-gray-800/50 text-gray-400'}`}
                >
                  <Code size={14} className="mr-3 opacity-70" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ai' && systemStatus && (
            <div className="space-y-4 p-2">
              <div className="p-3 bg-gray-900/50 rounded-lg border border-ultron-border">
                <div className="text-[10px] text-gray-500 uppercase mb-2">Internal Knowledge</div>
                <div className="flex items-center text-xs text-green-400">
                  <CheckCircle size={12} className="mr-2" />
                  {systemStatus.indexingStatus}
                </div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-ultron-border">
                <div className="text-[10px] text-gray-500 uppercase mb-2">Resource Usage</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span>CPU</span>
                    <span>{systemStatus.cpuUsage}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-ultron-accent h-full" style={{ width: systemStatus.cpuUsage }}></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                 <button onClick={() => handleAIAction('Optimize')} className="w-full text-left p-2 hover:bg-gray-800 rounded flex items-center text-xs text-gray-300">
                   <Zap size={14} className="mr-2 text-yellow-500" /> Performance Profile
                 </button>
                 <button onClick={() => handleAIAction('Security check')} className="w-full text-left p-2 hover:bg-gray-800 rounded flex items-center text-xs text-gray-300">
                   <ShieldCheck size={14} className="mr-2 text-blue-500" /> Vulnerability Scan
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-2 p-2">
              {['Android (APK)', 'Windows (EXE)', 'Web (Vercel)', 'Linux (AppImage)'].map(t => (
                <button
                  key={t}
                  onClick={() => handleBuild(t.split(' ')[0].toLowerCase())}
                  disabled={isBuilding}
                  className="w-full flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-ultron-border hover:border-ultron-accent hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  <span className="text-xs">{t}</span>
                  <Download size={14} className="text-gray-500" />
                </button>
              ))}
              {isBuilding && (
                <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-blue-500/30">
                  <div className="flex justify-between text-[10px] mb-2 text-blue-400 animate-pulse">
                    <span>Compiling Assets...</span>
                    <span>{buildProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${buildProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b border-ultron-border flex items-center justify-between px-4 bg-ultron-sidebar/50 backdrop-blur-md">
          <div className="flex items-center space-x-4">
             <div className="flex items-center text-xs font-mono px-2 py-1 bg-gray-800 rounded border border-ultron-border">
                <Code size={12} className="mr-2 text-ultron-accent" />
                {selectedFile || 'Untitled.js'}
             </div>
             <div className="h-4 w-[1px] bg-ultron-border"></div>
             <div className="flex space-x-1">
                <button onClick={() => handleAIAction('Refactor')} className="px-2 py-1 hover:bg-gray-800 rounded text-xs text-gray-400 hover:text-white transition-colors">Refactor</button>
                <button onClick={() => handleAIAction('Explain')} className="px-2 py-1 hover:bg-gray-800 rounded text-xs text-gray-400 hover:text-white transition-colors">Explain</button>
             </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleSave} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all">
              <Save size={18} />
            </button>
            <button className="flex items-center bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg font-bold transition-all shadow-lg shadow-green-600/20">
              <Play size={14} fill="white" className="mr-2" /> RUN
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              padding: { top: 20 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              lineHeight: 22,
              backgroundColor: '#0d1117'
            }}
          />
        </div>

        <div className="h-40 bg-[#05070a] border-t border-ultron-border flex flex-col font-mono">
           <div className="flex items-center px-4 py-1.5 border-b border-ultron-border bg-gray-900/30">
              <TerminalIcon size={12} className="mr-2 text-gray-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Terminal</span>
           </div>
           <div className="flex-1 overflow-y-auto p-4 text-[11px] space-y-1">
              <div className="text-blue-400 flex items-center">
                <Zap size={10} className="mr-2" /> Ultron Engine v2.4.0 started.
              </div>
              <div className="text-gray-500">Connecting to global neural network... [OK]</div>
              <div className="text-gray-500">Indexing local repository... [OK]</div>
              <div className="text-gray-300">$ node app.js</div>
              <div className="text-green-500">Listening on port 3000</div>
           </div>
        </div>
      </div>

      {/* AI Panel */}
      <div className="w-80 bg-ultron-sidebar border-l border-ultron-border flex flex-col">
        <div className="h-12 flex items-center justify-between px-4 border-b border-ultron-border bg-gray-900/20">
          <div className="flex items-center font-bold text-[10px] uppercase tracking-widest text-gray-400">
            <MessageSquare size={14} className="mr-2 text-ultron-accent" />
            Ultron Neural Core
          </div>
          <button
            onClick={toggleRecording}
            className={`p-1.5 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'hover:bg-gray-800 text-gray-500 hover:text-white'}`}
          >
            <Mic size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20">
          {chatHistory.map((chat, i) => (
            <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${chat.role === 'user' ? 'bg-ultron-accent text-white rounded-br-none shadow-lg shadow-blue-600/10' : 'bg-gray-800/80 text-gray-300 border border-ultron-border rounded-bl-none'}`}>
                {chat.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-ultron-border bg-gray-900/10 backdrop-blur-sm">
          <div className="relative group">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Query Ultron..."
              className="w-full bg-gray-800 border border-ultron-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-ultron-accent transition-all group-hover:bg-gray-750"
            />
            <button onClick={() => handleSendMessage()} className="absolute right-2 top-1.5 p-1 text-ultron-accent hover:bg-ultron-accent hover:text-white rounded-lg transition-all">
              <Zap size={14} fill="currentColor" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-[10px] text-gray-500 font-mono focus:outline-none cursor-pointer hover:text-gray-300"
            >
              <option value="DeepSeek-Coder-V2">DeepSeek Coder V2</option>
              <option value="Mistral-7B-Free">Mistral 7B (Free)</option>
              <option value="Claude-3-Haiku">Claude 3 Haiku</option>
              <option value="Llama-3-70B">Llama 3 70B</option>
            </select>
            <span className="text-[10px] text-gray-600 font-mono tracking-tighter italic flex items-center">
              <Loader2 size={8} className="mr-1 animate-spin" />
              Real-time Failover Active
            </span>
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ultron-sidebar border border-ultron-border rounded-2xl w-full max-w-xs shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-xs uppercase tracking-widest">New Resource</span>
              <button onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <input
              autoFocus
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js"
              className="w-full bg-gray-800 border border-ultron-border rounded-xl px-4 py-2.5 text-xs mb-4 focus:outline-none focus:border-ultron-accent"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <button
              onClick={handleCreateFile}
              className="w-full bg-ultron-accent text-white py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity"
            >
              INITIALIZE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

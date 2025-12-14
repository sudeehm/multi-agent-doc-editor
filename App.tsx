import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, Play, Download, CheckCircle, Loader2, AlertCircle, RefreshCw, Cpu, Cloud } from 'lucide-react';
import { AgentState, FileData, AgentLog, QuestionItem } from './types';
import { AgentTerminal } from './components/AgentTerminal';
import { extractTextFromDocx, extractTextFromTxt, generateFilledDocx } from './services/documentService';
import { analyzeQuestions, solveQuestion, setModelProvider, getModelProvider, type ModelProvider } from './services/geminiService';
import { checkOllamaStatus } from './services/ollamaService';

const App: React.FC = () => {
  const [state, setState] = useState<AgentState>(AgentState.IDLE);
  const [logs, setLogs] = useState<AgentLog[]>([]);

  // Model Provider Selection
  const [modelProvider, setModelProviderState] = useState<ModelProvider>('gemini');
  const [ollamaAvailable, setOllamaAvailable] = useState(false);

  // Files
  const [qbFile, setQbFile] = useState<FileData | null>(null);
  const [sourceFiles, setSourceFiles] = useState<FileData[]>([]);

  // Data
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [progress, setProgress] = useState({ total: 0, current: 0 });

  // Check Ollama availability on mount
  useEffect(() => {
    checkOllamaStatus().then(available => {
      setOllamaAvailable(available);
      if (available) {
        addLog('SYSTEM', '🟢 Ollama detected - Local AI available!');
      } else {
        addLog('SYSTEM', '🔵 Using Gemini API (Ollama not detected)');
      }
    });
  }, []);

  // Update provider when selection changes
  const handleProviderChange = (provider: ModelProvider) => {
    setModelProviderState(provider);
    setModelProvider(provider);
    const providerName = provider === 'ollama' ? 'Ollama (Gemma 2B - Local)' : 'Gemini API (Cloud)';
    addLog('SYSTEM', `Switched to ${providerName}`);
  };

  const addLog = useCallback((agent: AgentLog['agent'], message: string) => {
    setLogs(prev => [...prev, { timestamp: Date.now(), agent, message }]);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'qb' | 'source') => {
    if (e.target.files && e.target.files.length > 0) {
      if (type === 'qb') {
        const file = e.target.files[0];
        setQbFile({ name: file.name, type: 'question-bank', content: '', fileObject: file });
        addLog('SYSTEM', `Question Bank loaded: ${file.name}`);
      } else {
        const newFiles = Array.from(e.target.files).map(f => ({
          name: f.name,
          type: 'source-material' as const,
          content: '',
          fileObject: f
        }));
        setSourceFiles(prev => [...prev, ...newFiles]);
        addLog('SYSTEM', `Added ${newFiles.length} source file(s).`);
      }
    }
  };

  const startPipeline = async () => {
    if (!qbFile || sourceFiles.length === 0) return;

    try {
      // 1. Reader Agent
      setState(AgentState.READING_FILES);
      addLog('READER', 'Initiating document ingestion sequence...');

      let qbText = '';
      if (qbFile.fileObject.name.endsWith('.docx')) {
        qbText = await extractTextFromDocx(qbFile.fileObject);
      } else {
        qbText = await extractTextFromTxt(qbFile.fileObject);
      }
      addLog('READER', `Question Bank ingested (${qbText.length} chars).`);

      let combinedSourceText = '';
      for (const sf of sourceFiles) {
        let text = '';
        if (sf.name.endsWith('.docx')) {
          text = await extractTextFromDocx(sf.fileObject);
        } else {
          text = await extractTextFromTxt(sf.fileObject);
        }
        combinedSourceText += `\n--- SOURCE: ${sf.name} ---\n${text}`;
        addLog('READER', `Ingested source: ${sf.name}`);
      }

      // 2. Analyst Agent
      setState(AgentState.ANALYZING_QUESTIONS);
      addLog('ANALYST', 'Scanning Question Bank for distinct queries...');
      const rawQuestions = await analyzeQuestions(qbText);
      addLog('ANALYST', `Identified ${rawQuestions.length} distinct questions.`);

      const qItems: QuestionItem[] = rawQuestions.map((q, i) => ({
        id: `q-${i}`,
        originalText: q,
        status: 'pending'
      }));
      setQuestions(qItems);
      setProgress({ total: qItems.length, current: 0 });

      // 3. Solver Agent
      setState(AgentState.SOLVING);
      addLog('SOLVER', 'Spinning up solver threads...');

      const solvedItems = [...qItems];
      for (let i = 0; i < solvedItems.length; i++) {
        const item = solvedItems[i];
        addLog('SOLVER', `Solving Q${i + 1}: "${item.originalText.substring(0, 40)}..."`);

        // Update status to solving
        item.status = 'solving';
        setQuestions([...solvedItems]);

        // Call Gemini
        const answer = await solveQuestion(item.originalText, combinedSourceText);

        // Update status to done
        item.answer = answer;
        item.status = 'done';
        setQuestions([...solvedItems]);
        setProgress({ total: solvedItems.length, current: i + 1 });

        // Small artificial delay to prevent rate limits if using free tier heavily
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 4. Writer Agent
      setState(AgentState.COMPLETED);
      addLog('WRITER', 'All questions processed. Ready to compile.');

    } catch (error) {
      console.error(error);
      setState(AgentState.ERROR);
      addLog('SYSTEM', `Critical Error: ${(error as Error).message}`);
    }
  };

  const handleDownload = async () => {
    setState(AgentState.COMPILING);
    addLog('WRITER', 'Compiling final DOCX document...');
    await generateFilledDocx(questions);
    addLog('WRITER', 'Document generated and downloaded.');
    setState(AgentState.COMPLETED);
  };

  const reset = () => {
    setState(AgentState.IDLE);
    setQbFile(null);
    setSourceFiles([]);
    setQuestions([]);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Loader2 className={`w-6 h-6 text-white ${state === AgentState.IDLE || state === AgentState.COMPLETED ? '' : 'animate-spin'}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AutoSolver AI</h1>
              <p className="text-xs text-gray-400">Multi-Agent Document Processor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Model Provider Selector */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => handleProviderChange('gemini')}
                disabled={state !== AgentState.IDLE && state !== AgentState.COMPLETED}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${modelProvider === 'gemini'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Cloud className="w-3.5 h-3.5" />
                Gemini
              </button>
              <button
                onClick={() => handleProviderChange('ollama')}
                disabled={!ollamaAvailable || (state !== AgentState.IDLE && state !== AgentState.COMPLETED)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${modelProvider === 'ollama'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!ollamaAvailable ? 'Ollama not detected. Please install Ollama.' : 'Use local Gemma 2B model'}
              >
                <Cpu className="w-3.5 h-3.5" />
                Gemma 2B
                {!ollamaAvailable && <span className="text-[10px] opacity-60">(offline)</span>}
              </button>
            </div>

            {state === AgentState.COMPLETED && (
              <button onClick={reset} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            )}
            <div className={`px-3 py-1 rounded-full text-xs font-mono border ${state === AgentState.ERROR ? 'border-red-500/50 bg-red-500/10 text-red-400' :
                state === AgentState.COMPLETED ? 'border-green-500/50 bg-green-500/10 text-green-400' :
                  state === AgentState.IDLE ? 'border-gray-700 bg-gray-800 text-gray-400' :
                    'border-indigo-500/50 bg-indigo-500/10 text-indigo-400 animate-pulse'
              }`}>
              STATUS: {state}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Controls & Inputs */}
        <div className="lg:col-span-4 space-y-6">

          {/* File Upload Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Input Documents
            </h2>

            <div className="space-y-4">
              {/* Question Bank Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Question Bank (.docx/.txt)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".docx,.txt"
                    onChange={(e) => handleFileUpload(e, 'qb')}
                    disabled={state !== AgentState.IDLE}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-all ${qbFile ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    }`}>
                    {qbFile ? (
                      <div className="flex items-center gap-2 text-indigo-300">
                        <CheckCircle className="w-4 h-4" />
                        <span className="truncate text-sm">{qbFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs">Drop or Click to Upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Source Materials Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Source Notes (.docx/.txt)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".docx,.txt"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'source')}
                    disabled={state !== AgentState.IDLE}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-all ${sourceFiles.length > 0 ? 'border-green-500/50 bg-green-500/10' : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    }`}>
                    {sourceFiles.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-green-300">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{sourceFiles.length} files selected</span>
                        </div>
                        <div className="text-xs text-green-400/60 truncate pl-6">
                          {sourceFiles.map(f => f.name).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs">Drop Source Files Here</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8">
              {state === AgentState.IDLE ? (
                <button
                  onClick={startPipeline}
                  disabled={!qbFile || sourceFiles.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Processing
                </button>
              ) : state === AgentState.COMPLETED ? (
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                >
                  <Download className="w-5 h-5" />
                  Download Solved Doc
                </button>
              ) : (
                <div className="w-full bg-gray-800 text-gray-400 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-wait">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          </div>

          {/* Agent Terminal */}
          <AgentTerminal logs={logs} />

        </div>

        {/* Right Column: Preview & Results */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)]">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-1 flex-1 flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
              <h3 className="font-semibold text-gray-200">Live Preview</h3>
              {state === AgentState.SOLVING && (
                <span className="text-xs font-mono text-indigo-400">
                  Progress: {progress.current} / {progress.total}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-950/50">
              {questions.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <FileText className="w-8 h-8 opacity-50" />
                  </div>
                  <p>Upload documents to generate a preview.</p>
                </div>
              )}

              {questions.map((q, idx) => (
                <div key={q.id} className={`border rounded-lg p-5 transition-all ${q.status === 'done' ? 'border-green-900/50 bg-green-900/5' :
                    q.status === 'solving' ? 'border-indigo-500/50 bg-indigo-900/10' :
                      'border-gray-800 bg-gray-900/30'
                  }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${q.status === 'done' ? 'bg-green-900 text-green-400' :
                        q.status === 'solving' ? 'bg-indigo-900 text-indigo-400' :
                          'bg-gray-800 text-gray-500'
                      }`}>
                      Q{idx + 1}
                    </span>
                    <h4 className="text-sm font-medium text-gray-200 leading-relaxed">{q.originalText}</h4>
                  </div>

                  {q.status === 'solving' && (
                    <div className="ml-10 flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating answer from notes...
                    </div>
                  )}

                  {q.status === 'done' && (
                    <div className="ml-10 mt-3 pl-4 border-l-2 border-gray-700">
                      <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
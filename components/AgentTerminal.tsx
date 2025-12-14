import React, { useEffect, useRef } from 'react';
import { AgentLog } from '../types';
import { Terminal, Cpu, Search, PenTool, BookOpen } from 'lucide-react';

interface AgentTerminalProps {
  logs: AgentLog[];
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (agent: string) => {
    switch (agent) {
      case 'READER': return <BookOpen className="w-3 h-3 text-blue-400" />;
      case 'ANALYST': return <Search className="w-3 h-3 text-yellow-400" />;
      case 'SOLVER': return <Cpu className="w-3 h-3 text-green-400" />;
      case 'WRITER': return <PenTool className="w-3 h-3 text-purple-400" />;
      default: return <Terminal className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-64 shadow-inner">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        <span className="text-xs text-gray-400 font-mono ml-2">SYSTEM_LOGS // AGENT_SWARM</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2"
      >
        {logs.length === 0 && (
          <div className="text-gray-600 italic text-center mt-10">Waiting for initialization...</div>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-gray-600 min-w-[60px]">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
            <span className="flex items-center gap-2 uppercase tracking-wider text-[10px] font-bold min-w-[80px]">
              {getIcon(log.agent)}
              <span className={
                log.agent === 'READER' ? 'text-blue-400' :
                log.agent === 'ANALYST' ? 'text-yellow-400' :
                log.agent === 'SOLVER' ? 'text-green-400' :
                log.agent === 'WRITER' ? 'text-purple-400' : 'text-gray-400'
              }>
                {log.agent}
              </span>
            </span>
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

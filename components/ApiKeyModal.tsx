import React, { useState } from 'react';
import { Key, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gray-800 rounded-full border border-gray-700">
              <Key className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Access Credentials</h2>
          <p className="text-center text-gray-400 mb-6 text-sm">
            Enter your Google Gemini API Key to activate the multi-agent system.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-950 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!inputKey}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              Initialize Agents
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Get an API Key
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

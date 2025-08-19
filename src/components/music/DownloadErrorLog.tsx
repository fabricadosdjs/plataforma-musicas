"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, RefreshCw, Clock } from 'lucide-react';

interface DownloadError {
  trackName: string;
  attempts: number;
  lastError: string;
  timestamp: number;
}

interface DownloadErrorLogProps {
  errors: DownloadError[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function DownloadErrorLog({ errors, isOpen, onToggle }: DownloadErrorLogProps) {
  if (errors.length === 0) return null;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  return (
    <div className="mt-4 border-t border-gray-700/50 pt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left p-3 bg-red-900/20 border border-red-500/30 rounded-xl hover:bg-red-900/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-red-300 font-semibold">
            Erros de Download ({errors.length})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-red-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-red-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          {errors.map((error, index) => (
            <div
              key={index}
              className="bg-red-900/10 border border-red-500/20 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium text-sm truncate flex-1 mr-2">
                  {error.trackName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <Clock className="h-3 w-3" />
                  {formatTime(error.timestamp)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm">
                  {error.attempts} tentativas
                </span>
              </div>

              <div className="bg-gray-900/50 rounded p-2">
                <p className="text-red-300 text-xs font-mono">
                  {error.lastError}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

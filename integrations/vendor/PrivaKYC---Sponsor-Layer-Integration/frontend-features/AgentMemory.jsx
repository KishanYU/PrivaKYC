import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgentMemory = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/sponsors/memory/logs');
      setLogs(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch memory context.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Immutable Audit Logs</h2>
            <p className="text-sm text-gray-400">Powered by Backbone.io</p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh Logs
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-red-400 bg-red-900/20 p-3 rounded border border-red-800">{error}</div>}

      <div className="bg-black rounded-lg border border-gray-800 p-4 h-96 overflow-y-auto font-mono text-sm shadow-inner">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">No agent memory found.</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, idx) => {
              const isHttp = log.type === 'HTTP_REQUEST';
              const isBusiness = log.event_type !== undefined;
              
              return (
                <div key={idx} className="border-l-2 border-gray-700 pl-3 py-1">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="text-gray-500">[{new Date(log.timestamp).toISOString()}]</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isHttp ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'}`}>
                      {isHttp ? 'HTTP_REQ' : 'BUSINESS_EVENT'}
                    </span>
                    <span className="text-gray-400">ID: {log.id.slice(0, 8)}...</span>
                  </div>
                  
                  {isHttp && (
                    <div className="text-gray-300">
                      <span className={`font-bold ${log.method === 'POST' ? 'text-green-400' : 'text-blue-400'}`}>{log.method}</span> {log.path} 
                      <span className={`ml-2 ${log.status_code >= 400 ? 'text-red-400' : 'text-green-400'}`}>[{log.status_code}]</span>
                      <span className="text-gray-500 ml-2">({log.duration_ms}ms)</span>
                    </div>
                  )}

                  {isBusiness && (
                    <div className="text-gray-200">
                      <span className="text-purple-300 font-semibold">{log.event_type}</span>
                      <span className="text-gray-500 ml-2">User: {log.user_id}</span>
                      {log.metadata && (
                        <span className="text-gray-400 ml-2">Meta: {JSON.stringify(log.metadata)}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMemory;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FraudDashboard = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHeatmap = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/sponsors/fraud/heatmap?minutes=60');
      setHeatmapData(res.data.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch fraud heatmap.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
    
    // Auto-refresh every 3 seconds for real-time feel
    const interval = setInterval(() => {
      fetchHeatmap();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const simulateFraudEvent = async () => {
    setIsSimulating(true);
    try {
      await axios.post('http://localhost:3000/api/sponsors/fraud/log', {
        alertType: 'TOKEN_REUSE',
        bankId: 'HDFC',
        nullifierHash: '0x' + Math.random().toString(16).substring(2, 8),
        riskScore: Math.floor(Math.random() * 20) + 80 // 80-99
      });
      await fetchHeatmap();
    } catch (err) {
      console.error(err);
      setError('Failed to simulate fraud event.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Fraud Intelligence Heatmap</h2>
            <p className="text-sm text-gray-500">Powered by Snowflake • <span className="text-[10px] text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHeatmap}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-100"
            title="Manual Refresh"
          >
            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
          <button
            onClick={simulateFraudEvent}
            disabled={isSimulating}
            className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSimulating ? (
              <svg className="animate-spin h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            )}
            Simulate Fraud Alert
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <div className="space-y-4">
        {!heatmapData || Object.keys(heatmapData).length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No fraud alerts detected in the last hour.
          </div>
        ) : (
          Object.entries(heatmapData).map(([alertType, data]) => (
            <div key={alertType} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="font-medium text-gray-900">{alertType.replace('_', ' ')}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">Events: <span className="font-semibold text-gray-900">{data.count}</span></span>
                  <span className="text-gray-600">Avg Risk: <span className="font-semibold text-red-600">{Math.round(data.avgRisk)}</span></span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-white">
                    <tr>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Bank ID</th>
                      <th className="px-4 py-2">Nullifier Hash</th>
                      <th className="px-4 py-2">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.alerts.slice(0, 5).map((alert, idx) => (
                      <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-gray-600">{new Date(alert.timestamp || alert.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{alert.bank_id}</td>
                        <td className="px-4 py-2 font-mono text-xs">{alert.nullifier_hash}</td>
                        <td className="px-4 py-2 text-red-600 font-semibold">{alert.risk_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FraudDashboard;

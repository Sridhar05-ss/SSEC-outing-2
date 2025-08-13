import React, { useState, useEffect } from 'react';
import { useZKTecoAuth } from '../../lib/zktecoAuth';
import { deviceAPI } from '../../services/deviceAPI';

interface AttendanceLog {
  id: string;
  employeeId: string;
  name: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  deviceId: string;
}

export const LogTable = () => {
  const { isConnected } = useZKTecoAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchLogs = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const logs = await deviceAPI.getAttendanceLogs({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setLogs(logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [dateRange, isConnected]);

  return (
    <div className="log-table-container">
      <div className="controls">
        <div className="date-range">
          <label>From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          />
          
          <label>To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          />
          
          <button onClick={fetchLogs} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.employeeId}</td>
              <td>{log.name}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td className={`log-type ${log.type.toLowerCase()}`}>
                {log.type}
              </td>
              <td>{log.deviceId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
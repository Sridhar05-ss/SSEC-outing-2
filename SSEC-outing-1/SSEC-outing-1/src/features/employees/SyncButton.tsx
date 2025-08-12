import React, { useState } from 'react';
import { useZKTecoAuth } from '../../lib/zktecoAuth';
import { easyTimeAPI } from '../../services/easyTimeAPI';

export const SyncButton = () => {
  const { isConnected, syncEmployees } = useZKTecoAuth();
  const [status, setStatus] = useState('');

  const handleSync = async () => {
    setStatus('Syncing...');
    try {
      // 1. Get employees from EasyTime
      const employees = await easyTimeAPI.getEmployees();
      
      // 2. Sync with ZKTeco device
      if (isConnected) {
        await syncEmployees();
        setStatus('Sync completed successfully!');
      } else {
        setStatus('Device not connected. Sync failed.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setStatus('Sync failed. Please try again.');
    }
  };

  return (
    <div className="sync-button-container">
      <button 
        onClick={handleSync} 
        disabled={status === 'Syncing...'}
        className="sync-button"
      >
        {status === 'Syncing...' ? 'Syncing...' : 'Sync Employees'}
      </button>
      {status && <div className="sync-status">{status}</div>}
    </div>
  );
};
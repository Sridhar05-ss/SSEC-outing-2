import React from 'react';
import { LogTable } from '../features/attendance/LogTable';
import { RealTimeFeed } from '../features/attendance/RealTimeFeed';
import { useZKTecoAuth } from '../lib/zktecoAuth';

export const DeviceDashboard = () => {
  const { isConnected, deviceStatus } = useZKTecoAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Gate Management Dashboard</h1>
        <div className="device-status">
          Status: <span className={isConnected ? 'connected' : 'disconnected'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {isConnected && (
            <div className="status-details">
              <div>Users: {deviceStatus.users}</div>
              <div>Logs: {deviceStatus.logs}</div>
              <div>Firmware: {deviceStatus.firmware}</div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="main-content">
          <LogTable />
        </div>
        <div className="sidebar">
          <RealTimeFeed />
        </div>
      </div>
    </div>
  );
};
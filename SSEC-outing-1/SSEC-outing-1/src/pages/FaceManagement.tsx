import React, { useState } from 'react';
import { useZKTecoAuth } from '../lib/zktecoAuth';
import { EmployeeForm } from '../features/employees/EmployeeForm';
import { SyncButton } from '../features/employees/SyncButton';

export const FaceManagement = () => {
  const { isConnected } = useZKTecoAuth();
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="face-management">
      <h1>Face Template Management</h1>
      
      <div className="tabs">
        <button
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
        >
          Register New
        </button>
        <button
          className={activeTab === 'sync' ? 'active' : ''}
          onClick={() => setActiveTab('sync')}
        >
          Sync Employees
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'register' ? (
          <EmployeeForm />
        ) : (
          <div className="sync-section">
            <h2>Sync Employees with Device</h2>
            <p>
              {isConnected 
                ? 'Sync all employees from EasyTime to ZKTeco device'
                : 'Connect to device first to enable sync'}
            </p>
            <SyncButton />
          </div>
        )}
      </div>
    </div>
  );
};
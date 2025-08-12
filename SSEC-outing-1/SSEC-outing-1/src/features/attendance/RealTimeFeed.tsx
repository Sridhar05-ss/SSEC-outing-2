import React, { useState, useEffect } from 'react';
import { useZKTecoAuth } from '../../lib/zktecoAuth';

interface LiveEvent {
  id: string;
  employeeId: string;
  name: string;
  timestamp: string;
  type: 'IN' | 'OUT';
}

export const RealTimeFeed = () => {
  const { isConnected } = useZKTecoAuth();
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ATTENDANCE_EVENT') {
        setEvents(prev => [data.event, ...prev.slice(0, 9)]); // Keep last 10 events
      }
    };

    return () => ws.close();
  }, [isConnected]);

  return (
    <div className="real-time-feed">
      <h3>Real-Time Events</h3>
      <div className="events-list">
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className="event-item">
              <span className="event-type">{event.type}</span>
              <span className="employee-name">{event.name}</span>
              <span className="event-time">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : (
          <div className="no-events">No recent events</div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useRef } from "react";
import { db } from "../lib/firebase";
import { ref, set, remove } from "firebase/database";

// Department mapping with IDs for EasyTime Pro
const departments = [
  { id: 1, name: "Department" },
  { id: 2, name: "CSE" },
  { id: 4, name: "ECE" },
  { id: 5, name: "MECH" },
  { id: 6, name: "CIVIL" },
  { id: 7, name: "IT" },
  { id: 8, name: "AIML" },
  { id: 9, name: "CYBER SECURITY" },
  { id: 10, name: "AIDS" },
  { id: 11, name: "EEE" },
];

// Position mapping with IDs for EasyTime Pro
const positions = [
  { id: 1, name: "Position" },
  { id: 13, name: "Non teaching" },
  { id: 5, name: "Principal" },
  { id: 6, name: "CEO" },
  { id: 7, name: "DEAN" },
  { id: 8, name: "HOD" },
  { id: 9, name: "Proffessor" },
  { id: 10, name: "ASP" },
  { id: 11, name: "AP" },
  { id: 12, name: "LA" }
];

// Area mapping with IDs for EasyTime Pro
const areas = [
  { id: 2, name: "HO" }
];

const StaffManagement: React.FC = () => {
  const [name, setName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState(departments[0].id);
  const [position, setPosition] = useState(positions[0].id);
  const [area, setArea] = useState(areas[0].id);
  const [removeId, setRemoveId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Camera modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");

  const openCamera = (staffId: string) => {
    setCurrentStaffId(staffId);
    setCameraOpen(true);
    setCameraError("");
    navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
    }).catch(() => setCameraError("Camera not available or permission denied."));
  };

  const closeCamera = () => {
    setCameraOpen(false);
    setCurrentStaffId(null);
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const captureFace = async () => {
    if (videoRef.current && canvasRef.current && currentStaffId) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        // Save to Firebase
        await set(ref(db, `Attendance_Log_staffs/${currentStaffId}/face`), dataUrl);
        setStatus({ type: 'success', message: 'Face captured and saved!' });
        closeCamera();
      }
    }
  };

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  };

  const handleAddStaff = async () => {
    // Validation
    if (!staffId.trim() || !name.trim()) {
      showStatus('error', 'Please fill all required fields.');
      return;
    }
    
    // Validate staff ID format (alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(staffId.trim())) {
      showStatus('error', 'Staff ID should contain only alphanumeric characters.');
      return;
    }
    
    // Validate name length
    if (name.trim().length === 0 || name.length > 100) {
      showStatus('error', 'Please enter a valid name (1-100 characters).');
      return;
    }
    
    setLoading(true);
    try {
      // Format data for EasyTime Pro API
      const easyTimeProData = {
        emp_code: staffId.trim(),
        first_name: name.trim(),
        department: department,
        position: position,
        area: [area], // Convert to list as required by EasyTime Pro
        area_code: "2",
        area_name: "HO"
      };

      console.log('Sending data to EasyTime Pro:', easyTimeProData);
      console.log('Full data structure:', JSON.stringify(easyTimeProData, null, 2));

      // Add staff to EasyTime Pro via backend API
      const response = await fetch('http://127.0.0.1:3001/api/easytime/add-employee', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(easyTimeProData)
      });

      const result = await response.json();

      if (result.success) {
        // If successful, also add to Firebase
        await set(ref(db, `Attendance_Log_staffs/${staffId.trim()}`), {
          username: staffId.trim(),
          name: name.trim(),
          department: departments.find(d => d.id === department)?.name || 'Unknown',
          position: positions.find(p => p.id === position)?.name || 'Unknown',
          captureStatus: "Not Captured",
          easyTimeProId: result.data?.id || null
        });

        showStatus('success', 'Staff added successfully to both EasyTime Pro and Firebase!');
        
        // Clear form
        setName("");
        setStaffId("");
        setDepartment(departments[0].id);
        setPosition(positions[0].id);
        setArea(areas[0].id);
      } else {
        showStatus('error', `Failed to add staff to EasyTime Pro: ${result.error}`);
      }
    } catch (err) {
      console.error("Failed to add staff:", err);
      showStatus('error', 'Failed to add staff. Please check the console for details.');
    }
    setLoading(false);
  };

  const handleRemoveStaff = async () => {
    if (!removeId.trim()) {
      showStatus('error', 'Enter Staff ID to remove.');
      return;
    }
    
    // Validate staff ID format
    if (!/^[a-zA-Z0-9]+$/.test(removeId.trim())) {
      showStatus('error', 'Staff ID should contain only alphanumeric characters.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to remove staff member with ID: ${removeId.trim()}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      // Remove from EasyTime Pro via backend API
      const response = await fetch(`http://127.0.0.1:3001/api/easytime/delete-employee/${removeId.trim()}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // If successful, also remove from Firebase
        await remove(ref(db, `Attendance_Log_staffs/${removeId.trim()}`));
        showStatus('success', 'Staff removed successfully from both EasyTime Pro and Firebase!');
        setRemoveId("");
      } else {
        showStatus('error', `Failed to remove staff from EasyTime Pro: ${result.error}`);
      }
    } catch (err) {
      console.error("Failed to remove staff:", err);
      showStatus('error', 'Failed to remove staff. Please check the console for details.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', background: 'white', borderRadius: 18, boxShadow: '0 8px 32px #0001', padding: 32 }}>
      <h2 style={{fontWeight: 700, color: '#1848c1', marginBottom: 24, fontSize: 28}}>Staff Management</h2>
      
      {/* Status Message */}
      {status && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          backgroundColor: status.type === 'success' ? '#bbf7d0' : status.type === 'error' ? '#fecaca' : '#dbeafe',
          color: status.type === 'success' ? '#15803d' : status.type === 'error' ? '#b91c1c' : '#1d4ed8',
          border: `1px solid ${status.type === 'success' ? '#86efac' : status.type === 'error' ? '#fca5a5' : '#93c5fd'}`
        }}>
          {status.message}
        </div>
      )}

      {/* Add Staff Section */}
      <div style={{background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 24}}>
        <h3 style={{fontWeight: 600, color: '#1e293b', marginBottom: 16, fontSize: 20}}>Add New Staff</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16}}>
          <div>
            <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Staff ID *</label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Enter Staff ID"
              style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}}
            />
          </div>
          <div>
            <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Full Name"
              style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}}
            />
          </div>
          <div>
            <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Department *</label>
            <select
              value={department}
              onChange={(e) => setDepartment(parseInt(e.target.value))}
              style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}}
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Position *</label>
            <select
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value))}
              style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}}
            >
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Area</label>
            <select
              value={area}
              onChange={(e) => setArea(parseInt(e.target.value))}
              style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}}
            >
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAddStaff}
          disabled={loading}
          style={{
            marginTop: 16,
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '12px 24px',
            fontWeight: 500,
            fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Adding Staff...' : 'Add Staff'}
        </button>
      </div>

      {/* Remove Staff Section */}
      <div style={{background: '#fef2f2', borderRadius: 12, padding: 24}}>
        <h3 style={{fontWeight: 600, color: '#991b1b', marginBottom: 16, fontSize: 20}}>Remove Staff</h3>
        <div style={{display: 'flex', gap: 16, alignItems: 'end'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Staff ID *</label>
            <input
              type="text"
              value={removeId}
              onChange={(e) => setRemoveId(e.target.value)}
              placeholder="Enter Staff ID to remove"
              style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}}
            />
          </div>
          <button
            onClick={handleRemoveStaff}
            disabled={loading}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              fontWeight: 500,
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Removing...' : 'Remove Staff'}
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px #0003', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, color: '#1848c1', marginBottom: 12 }}>Capture Face</h3>
            <div style={{ color: '#2563eb', marginBottom: 8, fontWeight: 500, fontSize: 15 }}>
              For best results, ensure your face is well-lit and clearly visible.
            </div>
            {cameraError ? (
              <div style={{ color: 'red', margin: 16 }}>{cameraError}</div>
            ) : (
              <video ref={videoRef} width={320} height={240} autoPlay style={{ borderRadius: 8, background: '#000' }} />
            )}
            <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button onClick={captureFace} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 15 }}>Capture</button>
              <button onClick={closeCamera} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 15 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
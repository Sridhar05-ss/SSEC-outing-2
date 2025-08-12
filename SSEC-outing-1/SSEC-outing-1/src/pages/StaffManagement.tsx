import React, { useState, useRef } from "react";
import { db } from "../lib/firebase";
import { ref, set, remove } from "firebase/database";
import { authenticate, addStaffMember, deleteStaffMember } from "../lib/easytimeproStaffService";

const departments = [
  { id: 1, name: "CSE" },
  { id: 2, name: "ECE" },
  { id: 3, name: "MECH" },
  { id: 4, name: "CIVIL" },
  { id: 5, name: "IT" },
  { id: 6, name: "AIML" },
  { id: 7, name: "CYBER SECURITY" },
  { id: 8, name: "AIDS" },
  { id: 9, name: "EEE" },
  { id: 10, name: "DCSE" },
  { id: 11, name: "DECE" },
  { id: 12, name: "DMECH" }
];

const positions = [
  { id: 1, name: "Staff" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Student" }
];

const areas = [
  { id: 2, name: "HO" }
];

const StaffManagement: React.FC = () => {
  const [name, setName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState(departments[0].id);
  const [position, setPosition] = useState(positions[0].id);
  const [role, setRole] = useState("");
  const [area, setArea] = useState(areas[0].id);
  const [removeId, setRemoveId] = useState("");
  const [loading, setLoading] = useState(false);

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
        alert('Face captured and saved!');
        closeCamera();
      }
    }
  };

  const handleAddStaff = async () => {
    if (!staffId || !name || !department || !role) {
      alert("Please fill all fields.");
      return;
    }
    
    // Validate staff ID format (assuming it should be alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(staffId)) {
      alert("Staff ID should contain only alphanumeric characters.");
      return;
    }
    
    // Validate name (assuming it should not be empty and not too long)
    if (name.trim().length === 0 || name.length > 100) {
      alert("Please enter a valid name (1-100 characters).");
      return;
    }
    
    setLoading(true);
    try {
      // Authenticate with EasyTime Pro first
      const authSuccess = await authenticate("admin", "Admin123");

      if (authSuccess) {
        // Add staff to EasyTime Pro first
        const staffData = {
          name: name.trim(),
          user_id: staffId.trim(),
          privilege: 0, // Default privilege level
          department: department,
          position: position,
          area: [area],
          area_code: area.toString(),
          area_name: areas.find(a => a.id === area)?.name || "HO",
          role: role.trim()
        };

        const easyTimeProSuccess = await addStaffMember(staffData);

        if (easyTimeProSuccess) {
          // Post staff data to /easytime/add-employee
          const employeeObject = {
            username: staffId.trim(),
            name: name.trim(),
            department,
            role: role.trim()
          };
  
          const response = await fetch('/easytime/add-employee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeObject)
          });
  
          if (!response.ok) {
            alert("Failed to add staff to EasyTime system.");
            setLoading(false);
            return;
          }

          // If successful, also add to Firebase
          await set(ref(db, `Attendance_Log_staffs/${staffId}`), {
            username: staffId.trim(),
            name: name.trim(),
            department,
            role: role.trim(),
            captureStatus: "Not Captured"
          });
          alert("Staff added successfully to both systems!");
        } else {
          alert("Failed to add staff to EasyTime Pro. Please try again.");
        }
      } else {
        alert("Failed to authenticate with EasyTime Pro. Please try again.");
      }

      setName(""); setStaffId(""); setDepartment("CSE"); setRole("");
    } catch (err) {
      console.error("Failed to add staff:", err);
      alert("Failed to add staff. Please check the console for details.");
    }
    setLoading(false);
  };

  
  const handleRemoveStaff = async () => {
    if (!removeId) {
      alert("Enter Staff ID to remove.");
      return;
    }
    
    // Validate staff ID format (assuming it should be alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(removeId)) {
      alert("Staff ID should contain only alphanumeric characters.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to remove staff member with ID: ${removeId}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      // Authenticate with EasyTime Pro first
      // In a real implementation, you would use actual credentials
      // For now, we'll use dummy credentials
      const authSuccess = await authenticate("admin", "Admin123");
      
      if (authSuccess) {
        // Remove staff from EasyTime Pro first
        const easyTimeProSuccess = await deleteStaffMember(removeId);
        
        if (easyTimeProSuccess) {
          // If successful, also remove from Firebase
          await remove(ref(db, `Attendance_Log_staffs/${removeId}`));
          alert("Staff removed successfully from both systems!");
        } else {
          alert("Failed to remove staff from EasyTime Pro. Please try again.");
        }
      } else {
        alert("Failed to authenticate with EasyTime Pro. Please try again.");
      }
      setRemoveId("");
    } catch (err) {
      console.error("Failed to remove staff:", err);
      alert("Failed to remove staff. Please check the console for details.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px #0001', padding: 40, width: 500, maxWidth: '95%' }}>
        <h2 style={{ color: '#1848c1', fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Add Staff</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={e => { e.preventDefault(); handleAddStaff(); }}>
          <input placeholder="Staff Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
          <input placeholder="Staff ID" value={staffId} onChange={e => setStaffId(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
          <select value={department} onChange={e => setDepartment(parseInt(e.target.value))} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}>
            {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
          </select>
          <select value={position} onChange={e => setPosition(parseInt(e.target.value))} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16, marginTop: 8 }}>
            {positions.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
          </select>
          <select value={area} onChange={e => setArea(parseInt(e.target.value))} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16, marginTop: 8 }}>
            {areas.map(ar => <option key={ar.id} value={ar.id}>{ar.name}</option>)}
          </select>
          <input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16, marginTop: 8 }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={() => openCamera(staffId)} style={{ flex: 1, background: '#e0e7ff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: 6, padding: '10px 0', fontWeight: 500, cursor: 'pointer' }}>📷 Capture Face</button>
            <button type="submit" disabled={loading} style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>Add Staff</button>
        </div>
        </form>
        <h3 style={{ color: '#1848c1', fontWeight: 700, fontSize: 18, margin: '32px 0 12px' }}>Remove Staff</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={e => { e.preventDefault(); handleRemoveStaff(); }}>
          <input placeholder="Staff ID" value={removeId} onChange={e => setRemoveId(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>Remove Staff</button>
        </form>
        {/* Camera Modal */}
        {cameraOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px #0003', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, color: '#1848c1', marginBottom: 12 }}>Camera</h3>
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
        )}a
          </div>
    </div>
  );
};

export default StaffManagement;
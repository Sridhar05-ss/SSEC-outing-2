import React, { useState } from "react";
import { db } from "../lib/firebase";
import { ref, set, remove } from "firebase/database";

// Department mapping with IDs for EasyTime Pro (same as StaffManagement)
const departments = [
  { id: 1, name: "Department" },
  { id: 6, name: "CSE" },
  { id: 7, name: "ECE" },
  { id: 8, name: "MECH" },
  { id: 9, name: "CIVIL" },
  { id: 10, name: "IT" },
  { id: 11, name: "AIML" },
  { id: 12, name: "CYBER SECURITY" },
  { id: 13, name: "AIDS" },
  { id: 14, name: "EEE" },
];

// Position mapping for students (Dayscholar and Hosteller)
const positions = [
  { id: 16, name: "Dayscholar" },
  { id: 17, name: "Hosteller" }
];

// Area mapping with IDs for EasyTime Pro (same as StaffManagement)
const areas = [
  { id: 2, name: "HO" }
];

const StudentManagement: React.FC = () => {
  const [name, setName] = useState("");
  const [register, setRegister] = useState("");
  const [studentId, setStudentId] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [department, setDepartment] = useState(departments[0].id);
  const [position, setPosition] = useState(positions[0].id);
  const [area, setArea] = useState(areas[0].id);
  const [dob, setDob] = useState("");
  const [removeId, setRemoveId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  };

  const handleAddStudent = async () => {
    // Validation
    if (!studentId.trim() || !name.trim() || !register.trim() || !parentPhone.trim()) {
      showStatus('error', 'Please fill all required fields.');
      return;
    }
    
    // Validate student ID format (alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(studentId.trim())) {
      showStatus('error', 'Student ID should contain only alphanumeric characters.');
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
        emp_code: studentId.trim(),
        first_name: name.trim(),
        department: department,
        position: position,
        area: [area], // Convert to list as required by EasyTime Pro
        "aadhaar no": register.trim(),
        "contact no": parentPhone.trim(),
        "birthday": dob,
        area_code: "2",
        area_name: "HO"
      };

      console.log('Sending student data to EasyTime Pro:', easyTimeProData);
      console.log('Full data structure:', JSON.stringify(easyTimeProData, null, 2));

      // Add student to EasyTime Pro via backend API
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
         await set(ref(db, `students/${departments.find(d => d.id === department)?.name || 'Unknown'}/${studentId.trim()}`), {
           emp_code: studentId.trim(),
           first_name: name.trim(),
           department: departments.find(d => d.id === department)?.name || 'Unknown',
           position: positions.find(p => p.id === position)?.name || 'Unknown',
           registernumber: register.trim(),
           parentphone: parentPhone.trim(),
           birthday: dob,
           easyTimeProId: result.data?.id || null
         });

        showStatus('success', 'Student added successfully to both EasyTime Pro and Firebase!');
        
        // Clear form
        setName("");
        setRegister("");
        setStudentId("");
        setParentPhone("");
        setDepartment(departments[0].id);
        setPosition(positions[0].id);
        setArea(areas[0].id);
        setDob("");
      } else {
        showStatus('error', `Failed to add student to EasyTime Pro: ${result.error}`);
      }
    } catch (err) {
      console.error("Failed to add student:", err);
      showStatus('error', 'Failed to add student. Please check the console for details.');
    }
    setLoading(false);
  };

  const handleRemoveStudent = async () => {
    if (!removeId.trim()) {
      showStatus('error', 'Enter Student ID to remove.');
      return;
    }
    
    // Validate student ID format
    if (!/^[a-zA-Z0-9]+$/.test(removeId.trim())) {
      showStatus('error', 'Student ID should contain only alphanumeric characters.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to remove student with ID: ${removeId.trim()}?`)) {
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
        await remove(ref(db, `students/${departments.find(d => d.id === department)?.name || 'Unknown'}/${removeId.trim()}`));
        showStatus('success', 'Student removed successfully from both EasyTime Pro and Firebase!');
      setRemoveId("");
      } else {
        showStatus('error', `Failed to remove student from EasyTime Pro: ${result.error}`);
      }
    } catch (err) {
      console.error("Failed to remove student:", err);
      showStatus('error', 'Failed to remove student. Please check the console for details.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', background: 'white', borderRadius: 18, boxShadow: '0 8px 32px #0001', padding: 32 }}>
      <h2 style={{fontWeight: 700, color: '#1848c1', marginBottom: 24, fontSize: 28}}>Student Management</h2>
      
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

      {/* Add Student Section */}
      <div style={{background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 24}}>
        <h3 style={{fontWeight: 600, color: '#1e293b', marginBottom: 16, fontSize: 20}}>Add New Student</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={e => { e.preventDefault(); handleAddStudent(); }}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16}}>
            <div>
              <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Student ID *</label>
              <input 
                placeholder="Enter Student ID" 
                value={studentId} 
                onChange={e => setStudentId(e.target.value)} 
                style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}} 
              />
            </div>
            <div>
              <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Name *</label>
              <input 
                placeholder="Enter Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}} 
              />
            </div>
            <div>
              <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Aadhaar Number *</label>
              <input 
                placeholder="Enter Aadhaar Number" 
                value={register} 
                onChange={e => setRegister(e.target.value)} 
                style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}} 
              />
            </div>
            <div>
              <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Contact Number *</label>
              <input 
                placeholder="Enter Contact Number" 
                value={parentPhone} 
                onChange={e => setParentPhone(e.target.value)} 
                style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}} 
              />
            </div>
            <div>
              <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Date of Birth *</label>
              <input 
                type="date" 
                value={dob} 
                onChange={e => setDob(e.target.value)} 
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
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>
            <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '12px 24px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontSize: 16 }}>
              {loading ? 'Adding Student...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>

      {/* Remove Student Section */}
      <div style={{background: '#fef2f2', borderRadius: 12, padding: 24}}>
        <h3 style={{fontWeight: 600, color: '#991b1b', marginBottom: 16, fontSize: 20}}>Remove Student</h3>
        <div style={{display: 'flex', gap: 16, alignItems: 'end'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', fontWeight: 500, marginBottom: 8, color: '#374151'}}>Student ID *</label>
            <input
              type="text"
              value={removeId}
              onChange={(e) => setRemoveId(e.target.value)}
              placeholder="Enter Student ID to remove"
              style={{width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14}}
            />
              </div>
          <button
            onClick={handleRemoveStudent}
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
            {loading ? 'Removing...' : 'Remove Student'}
          </button>
            </div>
          </div>


    </div>
  );
};

export default StudentManagement;
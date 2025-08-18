import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { ref, get, set, update } from "firebase/database";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

interface Student {
  username?: string;
  name?: string;
  Name?: string;
  department?: string;
  role?: string;
  mode?: string;
  password?: string;
  emp_code?: string;
  first_name?: string;
  position?: string;
  easyTimeProId?: string;
}

interface StudentDetailsProps {
  department: string;
}

const departments = [
  "CSE", "ECE", "MECH", "CIVIL", "IT", "AIML", "CYBER SECURITY", "AIDS", "EEE", "DCSE", "DECE", "DMECH", "DIPLOMA", "ADMIN"
];

const StudentDetails: React.FC<StudentDetailsProps> = ({ department }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState<{ open: boolean; student?: Student }>({ open: false });
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = () => {
    setLoading(true);
    setError("");
    get(ref(db, `students/${department}`))
      .then(snapshot => {
        const data = snapshot.val();
        setStudents(data ? Object.values(data) : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [department]);

  const handleEditOpen = (student: Student) => {
    setEditData({ ...student });
    setEditModal({ open: true, student });
  };

  // Helper function to send student data to /easytime/add-employee
  const postStudentToEasytime = async (studentData: {
    username?: string;
    name: string;
    department: string;
    position: string;
    registernumber?: string;
    parentphone?: string;
    birthday?: string;
    easyTimeProId?: string;
  }) => {
    try {
      // Convert department name to ID
      const departmentMap: { [key: string]: number } = {
        "CSE": 6, "ECE": 7, "MECH": 8, "CIVIL": 9, "IT": 10, 
        "AIML": 11, "CYBER SECURITY": 12, "AIDS": 13, "EEE": 14,
        "DIPLOMA": 15, "ADMIN": 16, "DCSE": 17, "DECE": 18, "DMECH": 19
      };

      // Convert position name to ID (for students)
      const positionMap: { [key: string]: number } = {
        "Dayscholar": 16, "Hosteller": 17, "DayScholar": 16
      };

      const departmentId = departmentMap[studentData.department] || 6; // Default to CSE
      const positionId = positionMap[studentData.position] || 16; // Default to Dayscholar

      if (studentData.easyTimeProId) {
        // Update existing employee using PATCH method with easyTimeProId
        const response = await fetch(getApiUrl(`${API_ENDPOINTS.EASYTIME.UPDATE_EMPLOYEE}/${studentData.easyTimeProId}`), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emp_code: studentData.username,
            first_name: studentData.name,
            department: departmentId,
            position: positionId,
            "aadhaar no": studentData.registernumber,
            "contact no": studentData.parentphone,
            "birthday": studentData.birthday,
            area: [2], // Default area
            area_code: "2",
            area_name: "HO"
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to update student data: ${response.statusText}`);
        }
      } else {
        // Add new employee if not found
        const response = await fetch(getApiUrl(API_ENDPOINTS.EASYTIME.ADD_EMPLOYEE), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emp_code: studentData.username,
            first_name: studentData.name,
            department: departmentId,
            position: positionId,
            "aadhaar no": studentData.registernumber,
            "contact no": studentData.parentphone,
            "birthday": studentData.birthday,
            area: [2], // Default area
            area_code: "2",
            area_name: "HO"
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to add student data: ${response.statusText}`);
        }
      }
      return true;
    } catch (error) {
      console.error('Error posting student data to EasyTime Pro:', error);
      return false;
    }
  };

  const handleEditSave = async () => {
    if (!editData.username || !editData.department) return;
    setSaving(true);
    try {
      // Update Firebase
      await update(ref(db, `students/${editData.department}/${editData.username}`), {
        username: editData.username,
        Name: editData.name || editData.Name,
        department: editData.department,
        role: editData.role,
        mode: editData.mode,
        password: editData.password
      });

      // Post the same data to EasyTime Pro
      const postSuccess = await postStudentToEasytime({
        username: editData.username,
        name: editData.name || editData.Name || '',
        department: editData.department || '',
        position: editData.mode || editData.position || 'Dayscholar',
        registernumber: editData.password || '', // Using password field for DOB
        parentphone: '', // Not available in current form
        birthday: editData.password || '', // Using password field for DOB
        easyTimeProId: editData.easyTimeProId || '' // Pass the existing ID if available
      });

      if (!postSuccess) {
        alert("Warning: Student updated in Firebase but failed to update EasyTime Pro system.");
      } else {
        alert("Student updated successfully in both systems!");
      }

      setEditModal({ open: false });
      setEditData({});
      fetchStudents();
    } catch (err) {
      alert("Failed to update student.");
      console.error(err);
    }
    setSaving(false);
  };

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      (student.username && student.username.toLowerCase().includes(query)) ||
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.Name && student.Name.toLowerCase().includes(query)) ||
      (student.department && student.department.toLowerCase().includes(query)) ||
      (student.mode && student.mode.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', background: 'white', borderRadius: 18, boxShadow: '0 8px 32px #0001', padding: 32 }}>
      <h2 style={{fontWeight: 700, color: '#1848c1', marginBottom: 24, fontSize: 24}}>Student Details - {department}</h2>
      {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
      {/* Search Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      {/* Student Table */}
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 900}}>
          <thead>
            <tr style={{background: '#2563eb', color: 'white', fontWeight: 700, fontSize: 18}}>
              <th style={{padding: '12px 16px', width: 120, textAlign: 'left', whiteSpace: 'nowrap'}}>Student ID</th>
              <th style={{padding: '12px 16px', width: 220, textAlign: 'left', whiteSpace: 'nowrap'}}>Name</th>
              <th style={{padding: '12px 16px', width: 160, textAlign: 'left', whiteSpace: 'nowrap'}}>Department</th>
              <th style={{padding: '12px 16px', width: 120, textAlign: 'left', whiteSpace: 'nowrap'}}>Mode</th>
              <th style={{padding: '12px 16px', width: 160, textAlign: 'center', whiteSpace: 'nowrap'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{padding: 24, textAlign: 'center'}}>Loading...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan={5} style={{padding: 24, textAlign: 'center'}}>No students found.</td></tr>
            ) : (
              filteredStudents.map((s, i) => (
                <tr key={s.username || i} style={{background: i % 2 === 0 ? '#f1f5fb' : 'white'}}>
                  <td style={{padding: '10px 16px', fontFamily: 'monospace', fontWeight: 500, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.username || s.emp_code || ''}</td>
                  <td style={{padding: '10px 16px', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.name || s.Name || s.first_name || ''}</td>
                  <td style={{padding: '10px 16px', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.department || department}</td>
                  <td style={{padding: '10px 16px', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.mode || s.position || ''}</td>
                  <td style={{padding: '10px 16px', textAlign: 'center'}}>
                    <button onClick={() => handleEditOpen(s)} style={{background: '#fde68a', color: '#92400e', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontWeight: 500, fontSize: 15}}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px #0003', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 340 }}>
            <h3 style={{ fontWeight: 700, color: '#1848c1', marginBottom: 12 }}>Edit Student</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8, width: '100%' }} onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
              <label style={{ fontWeight: 500 }}>Student ID</label>
              <input value={editData.username || editData.emp_code || ''} onChange={e => setEditData(prev => ({ ...prev, username: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <label style={{ fontWeight: 500 }}>Name</label>
              <input value={editData.name || editData.Name || editData.first_name || ''} onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <label style={{ fontWeight: 500 }}>Department</label>
              <select value={editData.department || departments[0]} onChange={e => setEditData(prev => ({ ...prev, department: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <label style={{ fontWeight: 500 }}>Role</label>
              <input value={editData.role || ''} onChange={e => setEditData(prev => ({ ...prev, role: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <label style={{ fontWeight: 500 }}>Mode</label>
              <select value={editData.mode || editData.position || 'Hosteller'} onChange={e => setEditData(prev => ({ ...prev, mode: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                <option value="Hosteller">Hosteller</option>
                <option value="DayScholar">DayScholar</option>
              </select>
              <label style={{ fontWeight: 500 }}>DOB</label>
              <input type="date" value={editData.password || ''} onChange={e => setEditData(prev => ({ ...prev, password: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <div style={{ display: 'flex', gap: 12, marginTop: 16, width: '100%' }}>
                <button type="button" onClick={() => setEditModal({ open: false })} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 15, flex: 1 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 15, flex: 1, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;

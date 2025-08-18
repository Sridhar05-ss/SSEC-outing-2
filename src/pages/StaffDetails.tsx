import React, { useEffect, useState, useRef } from "react";
import { db } from "../lib/firebase";
import { ref, get, update, set } from "firebase/database";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "../components/ui/dialog";


type Staff = {
  username?: string;
  id?: string;
  name: string;
  department: string;
  position: string; // Changed from role to position
  captureStatus?: string;
  face?: string;
  easyTimeProId?: string;
};

const departments = [
  "CSE", "ECE", "MECH", "CIVIL", "IT", "AIML", "CYBER SECURITY", "AIDS", "EEE", "DCSE", "DECE", "DMECH", "ADMIN"
];

const StaffDetails: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState<{ open: boolean; staff?: Staff }>({ open: false });
  const [editData, setEditData] = useState<Partial<Staff>>({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStaff = () => {
    setLoading(true);
    setError("");
    get(ref(db, "staff"))
      .then(snapshot => {
        const data = snapshot.val();
        setStaff(data ? Object.values(data) : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleEditOpen = (s: Staff) => {
    setEditData({ ...s });
    setEditModal({ open: true, staff: s });
  };

  // Helper function to send staff data to /easytime/add-employee
  const postStaffToEasytime = async (staffData: {
    username?: string;
    name: string;
    department: string;
    position: string;
    easyTimeProId?: string;
  }) => {
    try {
      // Convert department name to ID
      const departmentMap: { [key: string]: number } = {
        "CSE": 6, "ECE": 7, "MECH": 8, "CIVIL": 9, "IT": 10, 
        "AIML": 11, "CYBER SECURITY": 12, "AIDS": 13, "EEE": 14,
        "DIPLOMA": 15, "ADMIN": 16, "DCSE": 17, "DECE": 18, "DMECH": 19
      };

      // Convert position name to ID
      const positionMap: { [key: string]: number } = {
        "Non teaching": 16, "Principal": 8, "CEO": 9, "DEAN": 10,
        "HOD": 11, "Proffessor": 12, "ASP": 13, "AP": 14, "LA": 15, "COE HEAD": 17
      };

      const departmentId = departmentMap[staffData.department] || 6; // Default to CSE
      const positionId = positionMap[staffData.position] || 16; // Default to Non teaching

      if (staffData.easyTimeProId) {
        // Update existing employee using PATCH method with easyTimeProId
        const response = await fetch(`http://127.0.0.1:3001/api/easytime/update-employee/${staffData.easyTimeProId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emp_code: staffData.username,
            first_name: staffData.name,
            department: departmentId,
            position: positionId,
            area: [2], // Default area
            area_code: "2",
            area_name: "HO"
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to update staff data: ${response.statusText}`);
        }
      } else {
        // Add new employee if not found
        const response = await fetch('http://127.0.0.1:3001/api/easytime/add-employee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emp_code: staffData.username,
            first_name: staffData.name,
            department: departmentId,
            position: positionId,
            area: [2], // Default area
            area_code: "2",
            area_name: "HO"
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to add staff data: ${response.statusText}`);
        }
      }
      return true;
    } catch (error) {
      console.error('Error posting staff data to EasyTime Pro:', error);
      return false;
    }
  };

  // Modify handleEditSave to also post to /easytime/add-employee
  const handleEditSave = async () => {
    if (!editData.username && !editData.id) return;
    setSaving(true);
    try {
      // Update Firebase
      await update(ref(db, `staff/${editData.username || editData.id}`), {
        username: editData.username,
        name: editData.name,
        department: editData.department,
        position: editData.position // Changed from role to position
      });

      // Post the same data to /easytime/add-employee
      const postSuccess = await postStaffToEasytime({
        username: editData.username,
        name: editData.name || '',
        department: editData.department || '',
        position: editData.position || '', // Changed from role to position
        easyTimeProId: editData.easyTimeProId || editData.id // Use easyTimeProId if available, fallback to id
      });

      if (!postSuccess) {
        alert("Warning: Staff updated in Firebase but failed to update Easytime system.");
      } else {
        alert("Staff updated successfully in both systems!");
      }

      setEditModal({ open: false });
      setEditData({});
      fetchStaff();
    } catch (err) {
      alert("Failed to update staff.");
      console.error(err);
    }
    setSaving(false);
  };

  // Filter staff based on search query
  const filteredStaff = staff.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      (s.username && s.username.toLowerCase().includes(query)) ||
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.department && s.department.toLowerCase().includes(query)) ||
      (s.position && s.position.toLowerCase().includes(query)) // Changed from role to position
    );
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', background: 'white', borderRadius: 18, boxShadow: '0 8px 32px #0001', padding: 32 }}>
      <h2 style={{fontWeight: 700, color: '#1848c1', marginBottom: 24, fontSize: 28}}>Staff Details</h2>
      {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
      {/* Search Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      {/* Staff Table */}
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 900}}>
      <thead>
            <tr style={{background: '#2563eb', color: 'white', fontWeight: 700, fontSize: 18}}>
              <th style={{padding: '12px 16px', width: 120, textAlign: 'left', whiteSpace: 'nowrap'}}>Staff ID</th>
              <th style={{padding: '12px 16px', width: 220, textAlign: 'left', whiteSpace: 'nowrap'}}>Name</th>
              <th style={{padding: '12px 16px', width: 160, textAlign: 'left', whiteSpace: 'nowrap'}}>Department</th>
              <th style={{padding: '12px 16px', width: 160, textAlign: 'left', whiteSpace: 'nowrap'}}>Role</th>
              <th style={{padding: '12px 16px', width: 160, textAlign: 'center', whiteSpace: 'nowrap'}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
              <tr><td colSpan={5} style={{padding: 24, textAlign: 'center'}}>Loading...</td></tr>
        ) : filteredStaff.length === 0 ? (
              <tr><td colSpan={5} style={{padding: 24, textAlign: 'center'}}>No staff found.</td></tr>
        ) : (
              filteredStaff.map((s, i) => (
                <tr key={s.username || s.id} style={{background: i % 2 === 0 ? '#f1f5fb' : 'white'}}>
                  <td style={{padding: '10px 16px', fontFamily: 'monospace', fontWeight: 500, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.username || s.id || ''}</td>
                  <td style={{padding: '10px 16px', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.name}</td>
                  <td style={{padding: '10px 16px', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.department}</td>
                  <td style={{padding: '10px 16px', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.position}</td>
                  <td style={{padding: '10px 16px', textAlign: 'center'}}>
                    <Dialog open={editModal.open && editModal.staff?.username === s.username} onOpenChange={open => setEditModal(open ? { open: true, staff: s } : { open: false })}>
                      <DialogTrigger asChild>
                        <button style={{background: '#fde68a', color: '#92400e', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontWeight: 500, fontSize: 15}} onClick={() => handleEditOpen(s)}>Edit</button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Staff</DialogTitle>
                        </DialogHeader>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }} onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                          <label style={{ fontWeight: 500 }}>Staff ID</label>
                          <input value={editData.username || ''} onChange={e => setEditData(prev => ({ ...prev, username: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                          <label style={{ fontWeight: 500 }}>Name</label>
                          <input value={editData.name || ''} onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                          <label style={{ fontWeight: 500 }}>Department</label>
                          <select value={editData.department || departments[0]} onChange={e => setEditData(prev => ({ ...prev, department: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                          </select>
                          <label style={{ fontWeight: 500 }}>Role</label>
                          <input value={editData.position || ''} onChange={e => setEditData(prev => ({ ...prev, position: e.target.value }))} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                          <DialogFooter>
                            <DialogClose asChild>
                              <button type="button" style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 15, marginRight: 8 }}>Cancel</button>
                            </DialogClose>
                            <button type="submit" disabled={saving} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>Save</button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
      </div>
    </div>
  );
};

export default StaffDetails;
import React, { useState, useRef, useEffect } from "react";
import { UserCircle, LogOut, FileText, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fakeAuth } from "../lib/fakeAuth";

const departments = [
  "AIML", "CYBER SECURITY", "AIDS", "IT", "ECE", "CSE", "EEE", "MECH", "CIVIL", "DCSE", "DECE", "DMECH"
];

// Interface for staff logs
interface StaffLog {
  id: string;
  name: string;
  department: string;
  in: string | null;
  out: string | null;
  status: "Inside" | "EXIT";
  timestamp: string;
}

// Interface for student logs
interface StudentLog {
  id: string;
  name: string;
  department: string;
  in: string | null;
  out: string | null;
  status: "Inside" | "EXIT";
  timestamp: string;
}

// Interface for ZKteco API transaction
interface ZKtecoTransaction {
  id: number;
  emp_code: string;
  punch_time: string;
  punch_state: string;
  verify_type: number;
  work_code: string;
  terminal_sn: string;
  terminal_alias: string;
  area_alias: string;
  longitude: string | null;
  latitude: string | null;
  gps_location: string | null;
  mobile: string | null;
  source: number;
  purpose: number;
  crc: string;
  is_attendance: string | null;
  reserved: string | null;
  upload_time: string;
  sync_status: string | null;
  sync_time: string | null;
  temperature: string | null;
  mask_flag: string | null;
  company: string;
  emp: string;
  terminal: number;
}

// Interface for Firebase staff data
interface FirebaseStaff {
  username: string;
  name: string;
  department: string;
  position: string;
}

// Interface for Firebase student data
interface FirebaseStudent {
  emp_code?: string;
  username?: string;
  id?: string;
  student_id?: string;
  first_name?: string;
  Name?: string;
  department: string;
  mode?: string;
}

function Sidebar({ active, setActive }) {
  const navItems = [
    { key: "all", label: "All Logs" },
    { key: "staff", label: "Staff Logs" },
    { key: "students", label: "Students Logs" },
  ];
  return (
    <aside className="min-h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-400 text-white flex flex-col py-8 px-4 shadow-2xl print:hidden">
      <img src="/college_logo.png" alt="College Logo" className="h-16 w-auto object-contain mx-auto mt-4 mb-4" />
      <div className="mb-6 text-xl font-bold text-center tracking-wide">Management Panel</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <div key={item.key}>
            <button
              className={`w-full flex items-center text-left py-2 px-3 rounded-lg transition font-semibold relative ${active === item.key ? "bg-blue-300/30 text-white shadow-lg ring-2 ring-blue-200 animate-pulse-slow" : "hover:bg-blue-500/20"}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
              {active === item.key && <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-200 rounded-full animate-ping" />}
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SearchBar({ search, setSearch, date, setDate, onClear, onDownloadPDF, onWeekly }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
      <div className="relative w-full md:w-1/2">
        <input
          className="rounded-md border border-gray-300 px-8 py-2 text-sm focus:ring-blue-500 w-full bg-white/80 placeholder:text-gray-400"
          placeholder="Search by ID or Name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400">🔍</span>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <label className="text-blue-700 font-medium">Date:</label>
        <input
          type="date"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 bg-white/80"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      <button
        className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-1 rounded font-medium transition print:hidden"
        onClick={onClear}
        type="button"
      >Clear Filters</button>
      <button
        className="bg-green-600 hover:bg-green-700 text-white rounded shadow px-4 py-2 font-semibold transition-all duration-150 active:scale-95 print:hidden"
        onClick={onDownloadPDF}
        type="button"
      >Download as PDF</button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white rounded shadow px-4 py-2 font-semibold transition-all duration-150 active:scale-95 print:hidden"
        onClick={onWeekly}
        type="button"
      >Weekly Records</button>
    </div>
  );
}

function getStatusBadge(inTime, outTime) {
  if (inTime && !outTime) {
    return <span className="bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">IN</span>;
  } else if (inTime && outTime) {
    return <span className="bg-red-200 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">OUT</span>;
  } else {
    return <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">-</span>;
  }
}

function AllLogsTable({ logs }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  return (
    <div className="w-[95%] mx-auto bg-white rounded-2xl shadow-lg p-4 overflow-y-auto max-h-[70vh] print:p-0 print:shadow-none print:bg-white">
      <table className="w-full text-left rounded text-sm table-fixed">
        <thead>
          <tr className="bg-blue-600 text-white text-center">
            <th className="py-3 px-6">ID</th>
            <th className="py-3 px-6">Name</th>
            <th className="py-3 px-6">Department</th>
            <th className="py-3 px-6">IN</th>
            <th className="py-3 px-6">OUT</th>
            <th className="py-3 px-6">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={6} className="py-6 text-center text-blue-700">No logs found.</td></tr>
          ) : (
            logs.map((log, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-blue-50 transition-all hover:bg-blue-100" : "bg-white transition-all hover:bg-blue-50"}>
                <td className="py-3 px-6 text-center break-words truncate max-w-[8rem]">{log.id}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{log.name}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[10rem]">{log.department}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{formatTime(log.in)}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{formatTime(log.out)}</td>
                <td className="py-3 px-6 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    log.status === "EXIT" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StaffLogsTable({ logs }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  return (
    <div className="w-[95%] mx-auto bg-white rounded-2xl shadow-lg p-4 overflow-y-auto max-h-[70vh] print:p-0 print:shadow-none print:bg-white">
      <table className="w-full text-left rounded text-sm table-fixed">
        <thead>
          <tr className="bg-blue-600 text-white text-center">
            <th className="py-3 px-6">ID</th>
            <th className="py-3 px-6">Name</th>
            <th className="py-3 px-6">Department</th>
            <th className="py-3 px-6">IN</th>
            <th className="py-3 px-6">OUT</th>
            <th className="py-3 px-6">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={6} className="py-6 text-center text-blue-700">No logs found.</td></tr>
          ) : (
            logs.map((log, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-blue-50 transition-all hover:bg-blue-100" : "bg-white transition-all hover:bg-blue-50"}>
                <td className="py-3 px-6 text-center break-words truncate max-w-[8rem]">{log.id}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{log.name}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[10rem]">{log.department}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{formatTime(log.in)}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{formatTime(log.out)}</td>
                <td className="py-3 px-6 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    log.status === "EXIT" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StudentLogsTable({ logs }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  return (
    <div className="w-[95%] mx-auto bg-white rounded-2xl shadow-lg p-4 overflow-y-auto max-h-[70vh] print:p-0 print:shadow-none print:bg-white">
      <table className="w-full text-left rounded text-sm table-fixed">
        <thead>
          <tr className="bg-blue-600 text-white text-center">
            <th className="py-3 px-6">ID</th>
            <th className="py-3 px-6">Name</th>
            <th className="py-3 px-6">Department</th>
            <th className="py-3 px-6">IN</th>
            <th className="py-3 px-6">OUT</th>
            <th className="py-3 px-6">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={6} className="py-6 text-center text-blue-700">No logs found.</td></tr>
          ) : (
            logs.map((log, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-blue-50 transition-all hover:bg-blue-100" : "bg-white transition-all hover:bg-blue-50"}>
                <td className="py-3 px-6 text-center break-words truncate max-w-[8rem]">{log.id}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{log.name}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[10rem]">{log.department}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{formatTime(log.in)}</td>
                <td className="py-3 px-6 text-center break-words truncate max-w-[12rem]">{formatTime(log.out)}</td>
                <td className="py-3 px-6 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    log.status === "EXIT" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Management() {
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [showWeekly, setShowWeekly] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const weeklyRef = useRef(null);
  
  // State for logs from ZKteco API and Firebase
  const [allLogs, setAllLogs] = useState<(StaffLog | StudentLog)[]>([]);
  const [staffLogs, setStaffLogs] = useState<StaffLog[]>([]);
  const [studentLogs, setStudentLogs] = useState<StudentLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Get today's date string (YYYY-MM-DD) - Automatically updated
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch ZKteco transactions and build logs
  const fetchZKtecoTransactions = async () => {
    console.log('=== STARTING FETCH PROCESS ===');
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD - Automatically updated
      
      // Fetch transactions from backend (which calls ZKteco API)
      console.log('Fetching transactions from backend...');
      const response = await fetch(getApiUrl(API_ENDPOINTS.ZKTECO.TRANSACTIONS));
      console.log('Backend response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Backend API response:', result);
      console.log('Backend API response structure:', {
        success: result.success,
        dataType: typeof result.data,
        dataLength: Array.isArray(result.data) ? result.data.length : 'Not an array',
        hasData: !!result.data
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
      
      const transactions: ZKtecoTransaction[] = Array.isArray(result.data) ? result.data : [];

      // Filter transactions for today only (automatically updated)
      console.log('Filtering for date:', today);
      console.log('All transactions before filtering:', transactions.length);
      const todayTransactions = transactions.filter(transaction => {
        const matches = transaction.punch_time && transaction.punch_time.startsWith(today);
                    if (!matches) {
              console.log(`Transaction ${transaction.emp_code}: ${transaction.punch_time} - SKIPPED (not today)`);
            }
        return matches;
      });

      console.log('Today\'s ZKteco transactions:', todayTransactions);
      console.log('Total transactions found:', todayTransactions.length);
      
      // Log cache information if available
      if (result.metadata) {
        console.log('Cache information:', {
          totalTransactions: result.metadata.totalTransactions,
          newTransactions: result.metadata.newTransactions,
          cachedTransactions: result.metadata.cachedTransactions,
          note: result.metadata.note
        });
      }
      
      // Check for multiple transactions for ID 077
      const transactionsFor077 = todayTransactions.filter(t => t.emp_code === '077');
      if (transactionsFor077.length > 0) {
        console.log(`🔍 Found ${transactionsFor077.length} transactions for ID 077:`, transactionsFor077);
      }

      // Fetch staff and student data from Firebase
      const staffRef = ref(db, 'staff');
      const studentsRef = ref(db, 'students');
      
      const [staffSnapshot, studentsSnapshot] = await Promise.all([
        get(staffRef),
        get(studentsRef)
      ]);

      const staffData: Record<string, FirebaseStaff> = staffSnapshot.exists() ? staffSnapshot.val() : {};
      const studentsData: Record<string, FirebaseStudent> = studentsSnapshot.exists() ? studentsSnapshot.val() : {};

      console.log('Firebase staff data:', staffData);
      console.log('Firebase students data:', studentsData);
      console.log('Firebase students data keys:', Object.keys(studentsData));
      console.log('Sample student data:', Object.values(studentsData)[0]);
      
      // Debug: Check if students data is properly structured
      console.log('Firebase departments found:', Object.keys(studentsData));
      Object.entries(studentsData).forEach(([deptKey, deptStudents]) => {
        console.log(`Department ${deptKey}: ${Object.keys(deptStudents || {}).length} students`);
      });

      // Build logs from transactions
      const staffLogsMap = new Map<string, StaffLog>();
      const studentLogsMap = new Map<string, StudentLog>();

      todayTransactions.forEach(transaction => {
        const empCode = transaction.emp_code;
        const punchTime = transaction.punch_time;

        console.log(`Processing transaction for emp_code: ${empCode}, punch_time: ${punchTime}`);
        
        // Special debugging for ID 077
        if (empCode === '077') {
          console.log(`🔍 DEBUG for ID 077: Processing punch at ${punchTime}`);
        }

        // Check if emp_code exists in staff collection
        const staffEntry = Object.entries(staffData).find(([key, staff]) => {
          return staff.username === empCode;
        });

        if (staffEntry) {
          const [staffId, staffInfo] = staffEntry;
          const existingLog = staffLogsMap.get(staffId);
          
          if (existingLog) {
            // Special debugging for ID 077
            if (empCode === '077') {
              console.log(`🔍 DEBUG for ID 077: Found existing log - IN: ${existingLog.in}, OUT: ${existingLog.out}`);
            }
            
            // Update existing log - earliest punch becomes IN, latest becomes OUT
            if (!existingLog.in || punchTime < existingLog.in) {
              existingLog.in = punchTime;
            }
            if (!existingLog.out || punchTime > existingLog.out) {
              existingLog.out = punchTime;
            }
            existingLog.timestamp = existingLog.out || existingLog.in || punchTime;
            existingLog.status = existingLog.out ? "EXIT" : "Inside";
            
            // Special debugging for ID 077
            if (empCode === '077') {
              console.log(`🔍 DEBUG for ID 077: Updated log - IN: ${existingLog.in}, OUT: ${existingLog.out}, Status: ${existingLog.status}`);
            }
          } else {
            // Create new staff log
            const staffLog: StaffLog = {
              id: staffInfo.username,
              name: staffInfo.name,
              department: staffInfo.department,
              in: punchTime,
              out: null,
              status: "Inside",
              timestamp: punchTime
            };
            staffLogsMap.set(staffId, staffLog);
            
            // Special debugging for ID 077
            if (empCode === '077') {
              console.log(`🔍 DEBUG for ID 077: Created new log - IN: ${staffLog.in}, OUT: ${staffLog.out}, Status: ${staffLog.status}`);
            }
          }
        } else {
          console.log(`Staff not found for emp_code: ${empCode}, checking students...`);
          // Check if emp_code exists in students collection (nested by department)
          let studentEntry = null;
          let studentDepartment = '';
          
          // Search through all departments
          for (const [deptKey, deptStudents] of Object.entries(studentsData)) {
            if (typeof deptStudents === 'object' && deptStudents !== null) {
              const foundStudent = Object.entries(deptStudents).find(([studentKey, studentData]) => {
                // Check if emp_code matches
                return studentData && studentData.emp_code === empCode;
              });
              
              if (foundStudent) {
                studentEntry = foundStudent;
                studentDepartment = deptKey;
                break;
              }
            }
          }

                      if (studentEntry) {
              const [studentId, studentInfo] = studentEntry;
              console.log(`Student found! ID: ${studentId}, Department: ${studentDepartment}, Info:`, studentInfo);
              const existingLog = studentLogsMap.get(studentId);
            
            if (existingLog) {
              // Update existing log - earliest punch becomes IN, latest becomes OUT
              if (!existingLog.in || punchTime < existingLog.in) {
                existingLog.in = punchTime;
              }
              if (!existingLog.out || punchTime > existingLog.out) {
                existingLog.out = punchTime;
              }
              existingLog.timestamp = existingLog.out || existingLog.in || punchTime;
              existingLog.status = existingLog.out ? "EXIT" : "Inside";
            } else {
              // Create new student log
              const studentLog: StudentLog = {
                id: studentInfo.emp_code || empCode,
                name: studentInfo.first_name || studentInfo.Name || 'Unknown',
                department: studentInfo.department || studentDepartment || 'Unknown',
                in: punchTime,
                out: null,
                status: "Inside",
                timestamp: punchTime
              };
              studentLogsMap.set(studentId, studentLog);
            }
          } else {
            console.log(`No student found for emp_code: ${empCode} - Transaction will be ignored`);
            console.log(`Searched through all departments: ${Object.keys(studentsData).join(', ')}`);
            console.log(`Available student emp_codes:`, Object.entries(studentsData).flatMap(([deptKey, deptStudents]) => {
              if (deptStudents && typeof deptStudents === 'object') {
                return Object.entries(deptStudents).map(([studentKey, studentData]) => ({
                  dept: deptKey,
                  studentKey,
                  emp_code: studentData?.emp_code,
                  username: studentData?.username
                }));
              }
              return [];
            }));
          }
        }
      });

      // Convert maps to arrays and sort by timestamp
      const staffLogsArray = Array.from(staffLogsMap.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const studentLogsArray = Array.from(studentLogsMap.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Combine for all logs
      const allLogsCombined = [...staffLogsArray, ...studentLogsArray].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setStaffLogs(staffLogsArray);
      setStudentLogs(studentLogsArray);
      setAllLogs(allLogsCombined);

      console.log('=== FETCH PROCESS COMPLETE ===');
      console.log('Final results:', {
        transactions: todayTransactions.length,
        staff: staffLogsArray.length,
        students: studentLogsArray.length,
        all: allLogsCombined.length
      });
      
      console.log('Staff logs details:', staffLogsArray);
      console.log('Student logs details:', studentLogsArray);
      console.log('All logs details:', allLogsCombined);

    } catch (error) {
      console.error('Error fetching ZKteco transactions:', error);
      setAllLogs([]);
      setStaffLogs([]);
      setStudentLogs([]);
      
      // Show user-friendly error message
      if (error.message.includes('Failed to fetch')) {
        console.error('Network error - please check if backend server is running on port 3001');
      } else if (error.message.includes('401')) {
        console.error('Authentication error - please check EasyTime Pro credentials');
      } else if (error.message.includes('503')) {
        console.error('EasyTime Pro server is not reachable - please check if it\'s running on port 8081');
      }
    }
  };

  useEffect(() => {
    // Only fetch data once on component mount
    console.log('=== COMPONENT MOUNTED - STARTING INITIALIZATION ===');
    const initializeData = async () => {
      try {
        await fetchZKtecoTransactions();
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
        console.log('=== INITIALIZATION COMPLETE ===');
      }
    };
    
    initializeData();
  }, []);

  // Filter functions for different log types
  const filterToday = (logs: StaffLog[] | StudentLog[]) => logs.filter(log => log.timestamp && log.timestamp.startsWith(todayStr));
  const todayStaffLogs = staffLogs.filter(log => log.timestamp && log.timestamp.startsWith(todayStr));
  const todayStudentLogs = studentLogs.filter(log => log.timestamp && log.timestamp.startsWith(todayStr));

  // Staff Logs Info Boxes
  const totalEntries = todayStaffLogs.filter(log => log.in && !log.out).length;
  const totalExits = todayStaffLogs.filter(log => log.out).length;
  const currentlyInside = totalEntries - totalExits;

  // Student Logs Info Boxes
  const studentTotalEntries = todayStudentLogs.filter(log => log.in && !log.out).length;
  const studentTotalExits = todayStudentLogs.filter(log => log.out).length;
  const studentCurrentlyInside = studentTotalEntries - studentTotalExits;

  // Filtering logic for real data
  const filterLogs = (logs: StaffLog[] | StudentLog[]) => {
    return logs.filter(log =>
      (!search || log.id.toLowerCase().includes(search.toLowerCase()) || 
       (log.name && log.name.toLowerCase().includes(search.toLowerCase()))) &&
      (!date || (log.timestamp && log.timestamp.startsWith(date)))
    );
  };

  // Separate filter functions for each log type
  const filterStaffLogs = (logs: StaffLog[]) => {
    return logs.filter(log =>
      (!search || log.id.toLowerCase().includes(search.toLowerCase()) || 
       (log.name && log.name.toLowerCase().includes(search.toLowerCase()))) &&
      (!date || (log.timestamp && log.timestamp.startsWith(date)))
    );
  };

  const filterStudentLogs = (logs: StudentLog[]) => {
    return logs.filter(log =>
      (!search || log.id.toLowerCase().includes(search.toLowerCase()) || 
       (log.name && log.name.toLowerCase().includes(search.toLowerCase()))) &&
      (!date || (log.timestamp && log.timestamp.startsWith(date)))
    );
  };

  // Filter function for mixed log types (AllLogs - staff and students)
  const filterAllLogs = (logs: (StaffLog | StudentLog)[]) => {
    return logs.filter(log =>
      (!search || log.id.toLowerCase().includes(search.toLowerCase()) || 
       (log.name && log.name.toLowerCase().includes(search.toLowerCase()))) &&
      (!date || (log.timestamp && log.timestamp.startsWith(date)))
    );
  };

  // Logout handler
  const handleLogout = () => {
    fakeAuth.logout();
    navigate("/login");
  };

  const handleClearFilters = () => {
    setSearch("");
    setDate("");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const table = tableRef.current;
    if (!table) return;
    const canvas = await html2canvas(table, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    let logType = "AllLogs";
    if (active === "students") logType = "StudentLogs";
    if (active === "staff") logType = "StaffLogs";
    pdf.save(`${logType}_${dateStr}.pdf`);
  };

  // Helper to get start/end of current week (Monday-Sunday)
  function getWeekRange() {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    return [monday, sunday];
  }

  function filterWeek(logs, field = "in") {
    const [start, end] = getWeekRange();
    return logs.filter(log => {
      const d = log[field] ? new Date(log[field]) : null;
      // Only include logs with all required fields (no null/empty)
      const hasData = log && Object.values(log).some(v => v !== null && v !== undefined && v !== "");
      return d && d >= start && d <= end && hasData;
    });
  }

  // Download PDF for weekly records
  const handleWeeklyDownloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const table = weeklyRef.current;
    if (!table) return;
    const canvas = await html2canvas(table, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    pdf.save(`WeeklyRecords_${dateStr}.pdf`);
  };

  // Show weekly records modal
  const handleShowWeekly = () => {
    let data = [];
    if (active === "all") data = filterWeek(allLogs, "timestamp");
    else if (active === "staff") data = filterWeek(staffLogs, "timestamp");
    else if (active === "students") data = filterWeek(studentLogs, "timestamp");
    setWeeklyData(data);
    setShowWeekly(true);
  };

  let TableComponent = null;
  const logs = [];
  if (active === "all") {
    TableComponent = () => (
      <>
        <SearchBar
          search={search}
          setSearch={setSearch}
          date={date}
          setDate={setDate}
          onClear={handleClearFilters}
          onDownloadPDF={handleDownloadPDF}
          onWeekly={handleShowWeekly}
        />
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Staff & Students Logs</p>
                  <p className="text-2xl font-bold text-blue-800">{allLogs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Currently Inside</p>
                  <p className="text-2xl font-bold text-green-800">{currentlyInside + studentCurrentlyInside}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Total Exits</p>
                  <p className="text-2xl font-bold text-purple-800">{totalExits + studentTotalExits}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => {
              console.log('=== REFRESH BUTTON CLICKED ===');
              fetchZKtecoTransactions();
            }} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Refreshing..." : "Refresh Logs"}
          </Button>
          <Button 
            onClick={async () => {
              console.log('=== TESTING BACKEND CONNECTION ===');
              try {
                // First test if backend server is running
                const healthResponse = await fetch(getApiUrl(API_ENDPOINTS.HEALTH));
                console.log('Backend health check status:', healthResponse.status);
                
                // Then test the transactions endpoint
                const response = await fetch(getApiUrl(API_ENDPOINTS.ZKTECO.TRANSACTIONS));
                const result = await response.json();
                console.log('Backend transactions test result:', result);
              } catch (error) {
                console.error('Backend test failed:', error);
              }
            }} 
            className="bg-green-600 hover:bg-green-700 text-white ml-2"
          >
            Test Backend
          </Button>
          <Button 
            onClick={() => {
              console.log('Current staff logs:', staffLogs);
              console.log('Current student logs:', studentLogs);
              console.log('Current all logs:', allLogs);
            }} 
            className="bg-gray-600 hover:bg-gray-700 text-white ml-2"
          >
            Debug Data
          </Button>
        </div>
        <div ref={tableRef} className="print:bg-white">
          <AllLogsTable logs={filterAllLogs(allLogs)} />
        </div>
      </>
    );
  } else if (active === "staff") {
    TableComponent = () => (
      <>
        <div className="flex flex-row gap-6 mb-6 w-full justify-center">
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[180px] text-center">
            <div className="text-lg font-semibold text-blue-700">Total Entries</div>
            <div className="text-2xl font-bold mt-2">{totalEntries}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[180px] text-center">
            <div className="text-lg font-semibold text-blue-700">Total Exits</div>
            <div className="text-2xl font-bold mt-2">{totalExits}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[180px] text-center">
            <div className="text-lg font-semibold text-blue-700">Currently Inside</div>
            <div className="text-2xl font-bold mt-2">{currentlyInside}</div>
          </div>
        </div>
        <SearchBar
          search={search}
          setSearch={setSearch}
          date={date}
          setDate={setDate}
          onClear={handleClearFilters}
          onDownloadPDF={handleDownloadPDF}
          onWeekly={handleShowWeekly}
        />
        <div ref={tableRef} className="print:bg-white">
          <StaffLogsTable logs={filterStaffLogs(todayStaffLogs)} />
        </div>
      </>
    );
  } else if (active === "students") {
    TableComponent = () => (
      <>
        <div className="flex flex-row gap-6 mb-6 w-full justify-center">
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[180px] text-center">
            <div className="text-lg font-semibold text-blue-700">Total Entries</div>
            <div className="text-2xl font-bold mt-2">{studentTotalEntries}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[180px] text-center">
            <div className="text-lg font-semibold text-blue-700">Total Exits</div>
            <div className="text-2xl font-bold mt-2">{studentTotalExits}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[180px] text-center">
            <div className="text-lg font-semibold text-blue-700">Currently Inside</div>
            <div className="text-2xl font-bold mt-2">{studentCurrentlyInside}</div>
          </div>
        </div>
        <SearchBar
          search={search}
          setSearch={setSearch}
          date={date}
          setDate={setDate}
          onClear={handleClearFilters}
          onDownloadPDF={handleDownloadPDF}
          onWeekly={handleShowWeekly}
        />
        <div ref={tableRef} className="print:bg-white">
          <StudentLogsTable logs={filterStudentLogs(studentLogs)} />
        </div>
      </>
    );
  }

  // Weekly Records Modal
  const WeeklyModal = () => (
    showWeekly && (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative animate-fade-in">
          <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 font-bold" onClick={() => setShowWeekly(false)}>&times;</button>
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Weekly Records</h2>
          <div ref={weeklyRef}>
            {active === "all" && <AllLogsTable logs={weeklyData} />}
            {active === "staff" && <StaffLogsTable logs={weeklyData} />}
            {active === "students" && <StudentLogsTable logs={weeklyData} />}
          </div>
          <div className="flex justify-end mt-6">
            <button className="bg-green-600 hover:bg-green-700 text-white rounded shadow px-6 py-2 font-semibold" onClick={handleWeeklyDownloadPDF}>Download PDF</button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="flex min-h-screen bg-blue-50 font-poppins">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-white shadow p-4 mb-8 print:hidden">
          <h1 className="text-3xl font-bold text-blue-700 ml-4">Management Dashboard</h1>
          <div className="flex items-center gap-4 ml-auto">
            <UserCircle className="w-8 h-8 text-blue-700" />
            <span className="text-blue-700 font-semibold">Management</span>
            <button className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold ml-2" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main className="flex-1 p-8 bg-blue-50 overflow-y-auto flex flex-col gap-8 items-center">
          <div className="w-full">
            <TableComponent logs={logs} />
          </div>
          <WeeklyModal />
      </main>
      </div>
    </div>
  );
}
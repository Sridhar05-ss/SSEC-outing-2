// Firebase Realtime Database service
const { ref, set, get, push, update, remove, child, onValue } = require('firebase/database');
const { database } = require('./firebaseConfig');

class FirebaseRealtimeDBService {
  constructor() {
    this.db = database;
  }

  // Create or update data
  async setData(path, data) {
    try {
      const dataRef = ref(this.db, path);
      await set(dataRef, data);
      return {
        success: true,
        message: 'Data saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Push new data (auto-generated key)
  async pushData(path, data) {
    try {
      const dataRef = ref(this.db, path);
      const newRef = push(dataRef);
      await set(newRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        success: true,
        key: newRef.key,
        data: { ...data, id: newRef.key }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get data
  async getData(path) {
    try {
      const dataRef = ref(this.db, path);
      const snapshot = await get(dataRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val()
        };
      } else {
        return {
          success: false,
          error: 'No data found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update data
  async updateData(path, data) {
    try {
      const dataRef = ref(this.db, path);
      await update(dataRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return {
        success: true,
        message: 'Data updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete data
  async deleteData(path) {
    try {
      const dataRef = ref(this.db, path);
      await remove(dataRef);
      return {
        success: true,
        message: 'Data deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listen for real-time updates
  listenToData(path, callback) {
    const dataRef = ref(this.db, path);
    return onValue(dataRef, (snapshot) => {
      callback(snapshot.val());
    });
  }

  // Attendance specific methods
  async recordAttendance(attendanceData) {
    const timestamp = new Date().toISOString();
    const attendanceRef = ref(this.db, `attendance/${timestamp.replace(/[.]/g, '-')}`);
    
    return this.setData(attendanceRef, {
      ...attendanceData,
      timestamp,
      createdAt: timestamp
    });
  }

  async getAttendanceByUser(userId) {
    return this.getData(`attendance/${userId}`);
  }

  async getAllAttendance() {
    return this.getData('attendance');
  }

  async getAttendanceByDate(date) {
    const datePath = date.replace(/-/g, '');
    return this.getData(`attendance/${datePath}`);
  }

  // Employee management
  async createEmployee(employeeData) {
    const employeeRef = ref(this.db, `employees/${employeeData.id || employeeData.email}`);
    return this.setData(employeeRef, {
      ...employeeData,
      createdAt: new Date().toISOString()
    });
  }

  async getEmployee(employeeId) {
    return this.getData(`employees/${employeeId}`);
  }

  async getAllEmployees() {
    return this.getData('employees');
  }

  async updateEmployee(employeeId, employeeData) {
    const employeeRef = ref(this.db, `employees/${employeeId}`);
    return this.updateData(employeeRef, {
      ...employeeData,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteEmployee(employeeId) {
    return this.deleteData(`employees/${employeeId}`);
  }

  // Device management
  async createDevice(deviceData) {
    const deviceRef = ref(this.db, `devices/${deviceData.id || deviceData.serialNumber}`);
    return this.setData(deviceRef, {
      ...deviceData,
      createdAt: new Date().toISOString()
    });
  }

  async getDevice(deviceId) {
    return this.getData(`devices/${deviceId}`);
  }

  async getAllDevices() {
    return this.getData('devices');
  }

  async updateDevice(deviceId, deviceData) {
    const deviceRef = ref(this.db, `devices/${deviceId}`);
    return this.updateData(deviceRef, {
      ...deviceData,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteDevice(deviceId) {
    return this.deleteData(`devices/${deviceId}`);
  }

  // Attendance logs
  async logAttendance(userId, attendanceData) {
    const timestamp = new Date().toISOString();
    const logRef = ref(this.db, `attendanceLogs/${userId}/${timestamp.replace(/[.]/g, '-')}`);
    
    return this.setData(logRef, {
      ...attendanceData,
      timestamp,
      userId
    });
  }

  async getAttendanceLogs(userId) {
    return this.getData(`attendanceLogs/${userId}`);
  }

  // Face data management
  async saveFaceData(userId, faceData) {
    const faceRef = ref(this.db, `faceData/${userId}`);
    return this.setData(faceRef, {
      ...faceData,
      updatedAt: new Date().toISOString()
    });
  }

  async getFaceData(userId) {
    return this.getData(`faceData/${userId}`);
  }
}

module.exports = new FirebaseRealtimeDBService();

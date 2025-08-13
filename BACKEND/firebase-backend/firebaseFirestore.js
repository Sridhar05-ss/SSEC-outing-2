// Firebase Firestore service
const { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter } = require('firebase/firestore');
const { db } = require('./firebaseConfig');

class FirebaseFirestoreService {
  constructor() {
    this.db = db;
  }

  // Create document
  async createDocument(collectionName, data, customId = null) {
    try {
      const docRef = customId ? doc(this.db, collectionName, customId) : doc(collection(this.db, collectionName));
      
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        id: docRef.id,
        data: { ...data, id: docRef.id }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get document by ID
  async getDocument(collectionName, documentId) {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return {
          success: false,
          error: 'Document not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all documents
  async getAllDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    try {
      let q = collection(this.db, collectionName);

      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return {
        success: true,
        data: documents
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update document
  async updateDocument(collectionName, documentId, data) {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Document updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete document
  async deleteDocument(collectionName, documentId) {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Document deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Attendance specific methods
  async recordAttendance(attendanceData) {
    return this.createDocument('attendance', attendanceData);
  }

  async getAttendanceByUser(userId, startDate = null, endDate = null) {
    const filters = [
      { field: 'userId', operator: '==', value: userId }
    ];

    if (startDate) {
      filters.push({ field: 'timestamp', operator: '>=', value: startDate });
    }

    if (endDate) {
      filters.push({ field: 'timestamp', operator: '<=', value: endDate });
    }

    return this.getAllDocuments('attendance', filters, 'timestamp', 'desc');
  }

  async getAttendanceByDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filters = [
      { field: 'timestamp', operator: '>=', value: startOfDay.toISOString() },
      { field: 'timestamp', operator: '<=', value: endOfDay.toISOString() }
    ];

    return this.getAllDocuments('attendance', filters, 'timestamp', 'desc');
  }

  // Employee management
  async createEmployee(employeeData) {
    return this.createDocument('employees', employeeData);
  }

  async getEmployeeById(employeeId) {
    return this.getDocument('employees', employeeId);
  }

  async getAllEmployees() {
    return this.getAllDocuments('employees', [], 'name', 'asc');
  }

  async updateEmployee(employeeId, employeeData) {
    return this.updateDocument('employees', employeeId, employeeData);
  }

  async deleteEmployee(employeeId) {
    return this.deleteDocument('employees', employeeId);
  }

  // Device management
  async createDevice(deviceData) {
    return this.createDocument('devices', deviceData);
  }

  async getDeviceById(deviceId) {
    return this.getDocument('devices', deviceId);
  }

  async getAllDevices() {
    return this.getAllDocuments('devices', [], 'name', 'asc');
  }

  async updateDevice(deviceId, deviceData) {
    return this.updateDocument('devices', deviceId, deviceData);
  }

  async deleteDevice(deviceId) {
    return this.deleteDocument('devices', deviceId);
  }
}

module.exports = new FirebaseFirestoreService();

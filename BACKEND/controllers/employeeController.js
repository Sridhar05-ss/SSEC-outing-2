// Employee Controller - Handles employee management operations
const ApiService = require('../services/apiService');
const { validateEmployeeData } = require('../utils/deviceHelpers');

class EmployeeController {
  constructor() {
    this.apiService = new ApiService();
  }

  // Get all employees
  async getAllEmployees(req, res) {
    try {
      const employees = await this.apiService.getAllEmployees();
      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Error getting employees:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch employees'
      });
    }
  }

  // Get employee by ID
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await this.apiService.getEmployeeById(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      console.error('Error getting employee:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch employee'
      });
    }
  }

  // Add new employee
  async addEmployee(req, res) {
    try {
      const employeeData = req.body;
      
      // Validate employee data
      const validation = validateEmployeeData(employeeData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.errors.join(', ')
        });
      }

      const result = await this.apiService.addEmployee(employeeData);
      res.status(201).json({
        success: result,
        message: result ? 'Employee added successfully' : 'Failed to add employee'
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add employee'
      });
    }
  }

  // Update employee
  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validate update data
      const validation = validateEmployeeData(updateData, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.errors.join(', ')
        });
      }

      const result = await this.apiService.updateEmployee(id, updateData);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      res.json({
        success: true,
        message: 'Employee updated successfully'
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update employee'
      });
    }
  }

  // Delete employee
  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const result = await this.apiService.deleteEmployee(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      res.json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete employee'
      });
    }
  }

  // Get employee attendance
  async getEmployeeAttendance(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const attendance = await this.apiService.getEmployeeAttendance(id, startDate, endDate);
      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error getting employee attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch employee attendance'
      });
    }
  }

  // Search employees
  async searchEmployees(req, res) {
    try {
      const { query, field } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const employees = await this.apiService.searchEmployees(query, field);
      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Error searching employees:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search employees'
      });
    }
  }

  // Bulk operations
  async bulkOperations(req, res) {
    try {
      const { operation, employeeIds, data } = req.body;
      
      if (!operation || !employeeIds || !Array.isArray(employeeIds)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bulk operation parameters'
        });
      }

      const result = await this.apiService.bulkOperations(operation, employeeIds, data);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error performing bulk operations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk operations'
      });
    }
  }
}

module.exports = new EmployeeController();

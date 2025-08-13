// Attendance Model - MongoDB Schema
// This file defines the schema for attendance records

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // User identification
  user_id: {
    type: String,
    required: true,
    index: true
  },
  
  // User details
  name: {
    type: String,
    required: true
  },
  
  // Timestamp of the attendance record
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  // Type of attendance (in/out)
  status: {
    type: String,
    enum: ['in', 'out'],
    required: true
  },
  
  // Device information
  device_id: {
    type: String,
    required: false
  },
  
  device_name: {
    type: String,
    required: false
  },
  
  // Location information (if available)
  location: {
    type: String,
    required: false
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Source system (ZKTeco, EasyTime Pro, etc.)
  source: {
    type: String,
    enum: ['zkteco', 'easytimepro', 'manual'],
    default: 'zkteco'
  },
  
  // Verification method (fingerprint, card, face, etc.)
  verification_method: {
    type: String,
    enum: ['fingerprint', 'card', 'face', 'password', 'manual'],
    default: 'fingerprint'
  },
  
  // Status of the record (valid, invalid, pending, etc.)
  record_status: {
    type: String,
    enum: ['valid', 'invalid', 'pending', 'corrected'],
    default: 'valid'
  },
  
  // Notes or comments
  notes: {
    type: String,
    required: false
  },
  
  // Created and updated timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
attendanceSchema.index({ user_id: 1, timestamp: -1 });
attendanceSchema.index({ timestamp: -1 });
attendanceSchema.index({ status: 1, timestamp: -1 });
attendanceSchema.index({ device_id: 1, timestamp: -1 });
attendanceSchema.index({ source: 1, timestamp: -1 });

// Virtual for date (YYYY-MM-DD format)
attendanceSchema.virtual('date').get(function() {
  return this.timestamp.toISOString().split('T')[0];
});

// Virtual for time (HH:MM:SS format)
attendanceSchema.virtual('time').get(function() {
  return this.timestamp.toTimeString().split(' ')[0];
});

// Instance method to check if this is a check-in
attendanceSchema.methods.isCheckIn = function() {
  return this.status === 'in';
};

// Instance method to check if this is a check-out
attendanceSchema.methods.isCheckOut = function() {
  return this.status === 'out';
};

// Static method to get attendance for a specific user and date
attendanceSchema.statics.getUserAttendance = function(userId, date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return this.find({
    user_id: userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: 1 });
};

// Static method to get attendance for a date range
attendanceSchema.statics.getAttendanceByDateRange = function(startDate, endDate, filters = {}) {
  const query = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    ...filters
  };
  
  return this.find(query).sort({ timestamp: -1 });
};

// Static method to get daily attendance summary
attendanceSchema.statics.getDailySummary = function(date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          user_id: '$user_id',
          name: '$name',
          status: '$status'
        },
        count: { $sum: 1 },
        first_record: { $min: '$timestamp' },
        last_record: { $max: '$timestamp' }
      }
    },
    {
      $group: {
        _id: {
          user_id: '$_id.user_id',
          name: '$_id.name'
        },
        check_ins: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'in'] }, '$count', 0]
          }
        },
        check_outs: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'out'] }, '$count', 0]
          }
        },
        first_check_in: {
          $min: {
            $cond: [{ $eq: ['$_id.status', 'in'] }, '$first_record', null]
          }
        },
        last_check_out: {
          $max: {
            $cond: [{ $eq: ['$_id.status', 'out'] }, '$last_record', null]
          }
        }
      }
    },
    {
      $project: {
        user_id: '$_id.user_id',
        name: '$_id.name',
        check_ins: 1,
        check_outs: 1,
        first_check_in: 1,
        last_check_out: 1,
        total_records: { $add: ['$check_ins', '$check_outs'] }
      }
    },
    {
      $sort: { name: 1 }
    }
  ]);
};

// Static method to get device statistics
attendanceSchema.statics.getDeviceStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$device_id',
        device_name: { $first: '$device_name' },
        total_records: { $sum: 1 },
        check_ins: {
          $sum: { $cond: [{ $eq: ['$status', 'in'] }, 1, 0] }
        },
        check_outs: {
          $sum: { $cond: [{ $eq: ['$status', 'out'] }, 1, 0] }
        },
        unique_users: { $addToSet: '$user_id' }
      }
    },
    {
      $project: {
        device_id: '$_id',
        device_name: 1,
        total_records: 1,
        check_ins: 1,
        check_outs: 1,
        unique_users_count: { $size: '$unique_users' }
      }
    },
    {
      $sort: { total_records: -1 }
    }
  ]);
};

// Pre-save middleware to update the updated_at field
attendanceSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Pre-save middleware to validate data
attendanceSchema.pre('save', function(next) {
  // Ensure timestamp is a valid date
  if (!this.timestamp || isNaN(this.timestamp.getTime())) {
    return next(new Error('Invalid timestamp'));
  }
  
  // Ensure status is valid
  if (!['in', 'out'].includes(this.status)) {
    return next(new Error('Invalid status. Must be "in" or "out"'));
  }
  
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

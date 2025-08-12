import React, { useState, useRef } from 'react';
import { useZKTecoAuth } from '../../lib/zktecoAuth';
import { easyTimeAPI } from '../../services/easyTimeAPI';
import { deviceAPI } from '../../services/deviceAPI'; // Added this line
import Webcam from 'react-webcam';

export const EmployeeForm = () => {
  const { isConnected } = useZKTecoAuth();
  const webcamRef = useRef<Webcam>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    department: '',
    position: ''
  });
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setImage(imageSrc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Processing...');

    try {
      // 1. Add to EasyTime
      const employee = await easyTimeAPI.addEmployee(formData);
      
      // 2. Register face with ZKTeco if image exists
      if (image && isConnected) {
        await deviceAPI.registerFace(employee.employeeId, image);
      }

      setStatus('Employee registered successfully!');
      resetForm();
    } catch (error) {
      console.error('Registration failed:', error);
      setStatus('Registration failed. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      department: '',
      position: ''
    });
    setImage(null);
  };

  return (
    <div className="employee-form">
      <h2>Register New Employee</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee ID</label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Position</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            required
          />
        </div>

        <div className="face-capture">
          <h3>Face Registration</h3>
          {image ? (
            <img src={image} alt="Captured face" className="captured-image" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam-view"
            />
          )}
          
          <div className="capture-controls">
            {!image ? (
              <button type="button" onClick={capturePhoto}>
                Capture Photo
              </button>
            ) : (
              <button type="button" onClick={() => setImage(null)}>
                Retake
              </button>
            )}
          </div>
        </div>

        <button type="submit" disabled={status === 'Processing...'}>
          {status === 'Processing...' ? 'Processing...' : 'Register Employee'}
        </button>

        {status && <div className="status-message">{status}</div>}
      </form>
    </div>
  );
};
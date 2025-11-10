import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Mail, Plus, Edit, Trash2, Users, Settings, Check, X } from 'lucide-react';

const AppointmentBookingSystem = () => {
  // Initial form configuration
  const initialFormConfig = [
    { id: 'name', label: 'Full Name', type: 'text', required: true },
    { id: 'email', label: 'Email Address', type: 'email', required: true },
    { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
    { id: 'date', label: 'Appointment Date', type: 'date', required: true },
    { id: 'time', label: 'Preferred Time', type: 'time', required: true },
    { id: 'service', label: 'Service Type', type: 'select', required: true, options: ['Consultation', 'Follow-up', 'Emergency', 'Routine Check'] },
    { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
  ];

  // State management
  const [currentView, setCurrentView] = useState('user'); // 'user' or 'admin'
  const [appointments, setAppointments] = useState([]);
  const [formConfig, setFormConfig] = useState(initialFormConfig);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false });
  const [showAddField, setShowAddField] = useState(false);

  // Initialize form data based on config
  useEffect(() => {
    const initialData = {};
    formConfig.forEach(field => {
      // Only add new fields, preserve existing data
      if (!(field.id in formData)) {
        initialData[field.id] = '';
      }
    });
    // Only update if there are new fields
    if (Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [formConfig]);

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    const twoDaysFromNow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
    
    today.setHours(0, 0, 0, 0);
    twoDaysFromNow.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= twoDaysFromNow;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    formConfig.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      } else if (formData[field.id]) {
        if (field.type === 'email' && !validateEmail(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
        } else if (field.type === 'tel' && !validatePhone(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid phone number';
        } else if (field.type === 'date' && !validateDate(formData[field.id])) {
          newErrors[field.id] = 'Please select a date at least 2 days from today';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const newAppointment = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setAppointments([...appointments, newAppointment]);
      
      // Reset form
      const resetData = {};
      formConfig.forEach(field => {
        resetData[field.id] = '';
      });
      setFormData(resetData);
      setErrors({});
      
      alert('Appointment booked successfully!');
    }
  };

  // Handle input change
  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  // Delete appointment
  const deleteAppointment = (id) => {
    setAppointments(appointments.filter(app => app.id !== id));
  };

  // Admin functions for managing form fields
  const addFormField = () => {
    if (newField.label) {
      const fieldId = newField.label.toLowerCase().replace(/\s+/g, '_');
      const field = {
        id: fieldId,
        label: newField.label,
        type: newField.type,
        required: newField.required,
        ...(newField.type === 'select' && { options: ['Option 1', 'Option 2', 'Option 3'] })
      };
      setFormConfig([...formConfig, field]);
      setNewField({ label: '', type: 'text', required: false });
      setShowAddField(false);
    }
  };

  const deleteFormField = (fieldId) => {
    setFormConfig(formConfig.filter(field => field.id !== fieldId));
  };

  const updateFormField = (fieldId, updates) => {
    setFormConfig(formConfig.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    setEditingField(null);
  };

  // Get minimum date (2 days from now)
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  // Render form field
  const renderFormField = (field) => {
    const commonProps = {
      id: field.id,
      value: formData[field.id] || '',
      onChange: (e) => handleInputChange(field.id, e.target.value),
      className: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        errors[field.id] ? 'border-red-500' : ''
      }`
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows="3" placeholder={`Enter ${field.label.toLowerCase()}`} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'date':
        return <input {...commonProps} type="date" min={getMinDate()} />;
      default:
        return <input {...commonProps} type={field.type} placeholder={`Enter ${field.label.toLowerCase()}`} />;
    }
  };

  // User Interface
  const UserInterface = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="text-gray-600 mt-2">Schedule your appointment with ease</p>
          </div>

          <form className="space-y-6">
            {formConfig.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderFormField(field)}
                {errors[field.id] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition duration-200"
            >
              Book Appointment
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentView('admin')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Admin Panel →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Interface
  const AdminInterface = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-gray-700" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <button
                onClick={() => setCurrentView('user')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Back to User View
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Form Configuration Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Form Configuration</h2>
                <button
                  onClick={() => setShowAddField(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>

              {showAddField && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-3">Add New Field</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Field Label"
                      value={newField.label}
                      onChange={(e) => setNewField({...newField, label: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newField.type}
                      onChange={(e) => setNewField({...newField, type: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>
                      <option value="select">Select</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newField.required}
                        onChange={(e) => setNewField({...newField, required: e.target.checked})}
                      />
                      Required
                    </label>
                    <div className="flex gap-2">
                      <button onClick={addFormField} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShowAddField(false)} className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                {formConfig.map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{field.label}</span>
                      <span className="text-sm text-gray-500">({field.type})</span>
                      {field.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingField(field.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFormField(field.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Appointments ({appointments.length})
                </h2>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments booked yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {formConfig.map(field => (
                          <th key={field.id} className="border border-gray-200 px-4 py-2 text-left">
                            {field.label}
                          </th>
                        ))}
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appointment => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          {formConfig.map(field => (
                            <td key={field.id} className="border border-gray-200 px-4 py-2">
                              {appointment[field.id] || '-'}
                            </td>
                          ))}
                          <td className="border border-gray-200 px-4 py-2">
                            <button
                              onClick={() => deleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return currentView === 'user' ? <UserInterface /> : <AdminInterface />;
};

export default AppointmentBookingSystem;
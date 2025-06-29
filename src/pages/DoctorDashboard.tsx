import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, Check, X, Eye, Phone, Mail } from 'lucide-react';
import { Appointment } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    const storedAppointments = JSON.parse(localStorage.getItem('docspot_appointments') || '[]');
    const doctorAppointments = storedAppointments.filter((apt: Appointment) => apt.doctorId === user?.id);
    setAppointments(doctorAppointments);
  };

  const updateAppointmentStatus = (appointmentId: string, status: string, updatedNotes?: string) => {
    const storedAppointments = JSON.parse(localStorage.getItem('docspot_appointments') || '[]');
    const updatedAppointments = storedAppointments.map((apt: Appointment) => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          status,
          notes: updatedNotes || apt.notes,
          updatedAt: new Date(),
        };
      }
      return apt;
    });

    localStorage.setItem('docspot_appointments', JSON.stringify(updatedAppointments));
    loadAppointments();
    toast.success(`Appointment ${status} successfully`);
  };

  const handleApprove = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'confirmed');
  };

  const handleReject = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'cancelled');
  };

  const handleComplete = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'completed', notes);
    setShowDetailModal(false);
    setSelectedAppointment(null);
    setNotes('');
  };

  const openDetailModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(apt => apt.status === status);
  };

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, Dr. {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Manage your appointments and patient care.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{getAppointmentsByStatus('pending').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{getAppointmentsByStatus('confirmed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-600">Appointments will appear here once patients book with you.</p>
            </div>
          ) : (
            appointments.map(appointment => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(appointment.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{appointment.time}</span>
                      </div>
                      <div>
                        <span className="font-medium">Age: </span>
                        <span>{appointment.patientAge} years</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Reason: </span>
                        <span>{appointment.reason}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openDetailModal(appointment)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(appointment.id)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(appointment.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => openDetailModal(appointment)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Appointment Details
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <p className="text-gray-900">{selectedAppointment.patientName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-gray-900">{format(new Date(selectedAppointment.date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <p className="text-gray-900">{selectedAppointment.time}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Patient Age</label>
                <p className="text-gray-900">{selectedAppointment.patientAge} years</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <p className="text-gray-900">{selectedAppointment.reason}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </span>
              </div>
              
              {selectedAppointment.status === 'confirmed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the consultation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
              )}
              
              {selectedAppointment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAppointment(null);
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              {selectedAppointment.status === 'confirmed' && (
                <button
                  onClick={() => handleComplete(selectedAppointment.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
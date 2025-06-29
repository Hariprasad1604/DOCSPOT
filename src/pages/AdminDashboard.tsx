import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, UserCheck, AlertCircle, Check, X, Eye, Clock } from 'lucide-react';
import { User, Appointment } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'appointments'>('overview');
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load doctors
    const users = JSON.parse(localStorage.getItem('docspot_users') || '[]');
    const doctorUsers = users.filter((u: User) => u.role === 'doctor');
    setDoctors(doctorUsers);

    // Load appointments
    const storedAppointments = JSON.parse(localStorage.getItem('docspot_appointments') || '[]');
    setAppointments(storedAppointments);
  };

  const approveDoctor = (doctorId: string) => {
    const users = JSON.parse(localStorage.getItem('docspot_users') || '[]');
    const updatedUsers = users.map((u: User) => {
      if (u.id === doctorId) {
        return { ...u, isApproved: true };
      }
      return u;
    });

    localStorage.setItem('docspot_users', JSON.stringify(updatedUsers));
    loadData();
    toast.success('Doctor approved successfully!');
  };

  const rejectDoctor = (doctorId: string) => {
    const users = JSON.parse(localStorage.getItem('docspot_users') || '[]');
    const filteredUsers = users.filter((u: User) => u.id !== doctorId);
    
    localStorage.setItem('docspot_users', JSON.stringify(filteredUsers));
    loadData();
    toast.success('Doctor registration rejected');
  };

  const openDoctorModal = (doctor: User) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
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

  const pendingDoctors = doctors.filter(doc => !doc.isApproved);
  const approvedDoctors = doctors.filter(doc => doc.isApproved);
  const totalPatients = JSON.parse(localStorage.getItem('docspot_users') || '[]').filter((u: User) => u.role === 'patient').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage doctors, appointments, and platform oversight.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'doctors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Doctor Management ({pendingDoctors.length} pending)
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appointments ({appointments.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedDoctors.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingDoctors.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {pendingDoctors.slice(0, 3).map(doctor => (
                <div key={doctor.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">New doctor registration</p>
                    <p className="text-sm text-gray-600">Dr. {doctor.name} - {doctor.specialization}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveDoctor(doctor.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openDoctorModal(doctor)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
              
              {pendingDoctors.length === 0 && (
                <p className="text-gray-500 text-center py-4">No pending approvals</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div>
          {/* Pending Doctors */}
          {pendingDoctors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
              <div className="bg-white rounded-lg shadow-sm border divide-y divide-gray-200">
                {pendingDoctors.map(doctor => (
                  <div key={doctor.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            Pending Review
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Specialization: </span>
                            <span>{doctor.specialization}</span>
                          </div>
                          <div>
                            <span className="font-medium">Experience: </span>
                            <span>{doctor.experience} years</span>
                          </div>
                          <div>
                            <span className="font-medium">Email: </span>
                            <span>{doctor.email}</span>
                          </div>
                          <div>
                            <span className="font-medium">Phone: </span>
                            <span>{doctor.phone || 'Not provided'}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openDoctorModal(doctor)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => approveDoctor(doctor.id)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectDoctor(doctor.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Doctors */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Approved Doctors</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              {approvedDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No approved doctors yet</h3>
                  <p className="text-gray-600">Approved doctors will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {approvedDoctors.map(doctor => (
                    <div key={doctor.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                          <p className="text-blue-600">{doctor.specialization}</p>
                          <p className="text-sm text-gray-600">{doctor.experience} years experience</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Approved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Appointments</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600">Appointments will appear here as patients book with doctors.</p>
              </div>
            ) : (
              appointments.map(appointment => (
                <div key={appointment.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                      <p className="text-blue-600">with Dr. {appointment.doctorName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
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
                    <div>
                      <span className="font-medium">Specialization: </span>
                      <span>{appointment.doctorSpecialization}</span>
                    </div>
                    <div>
                      <span className="font-medium">Reason: </span>
                      <span>{appointment.reason}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {showDoctorModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Doctor Registration Details
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">Dr. {selectedDoctor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedDoctor.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <p className="text-gray-900">{selectedDoctor.specialization}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <p className="text-gray-900">{selectedDoctor.experience} years</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Education & Qualifications</label>
                <p className="text-gray-900">{selectedDoctor.education}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedDoctor.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="text-gray-900">{format(new Date(selectedDoctor.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              
              {selectedDoctor.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900">{selectedDoctor.address}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDoctorModal(false);
                  setSelectedDoctor(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              {!selectedDoctor.isApproved && (
                <>
                  <button
                    onClick={() => {
                      rejectDoctor(selectedDoctor.id);
                      setShowDoctorModal(false);
                      setSelectedDoctor(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      approveDoctor(selectedDoctor.id);
                      setShowDoctorModal(false);
                      setSelectedDoctor(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
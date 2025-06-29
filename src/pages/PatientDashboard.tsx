import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, Clock, MapPin, Star, User, Phone, Mail } from 'lucide-react';
import { Doctor, Appointment } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'appointments'>('search');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [patientAge, setPatientAge] = useState('');

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const loadDoctors = () => {
    // Mock doctors data with Indian pricing
    const mockDoctors: Doctor[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@docspot.com',
        role: 'doctor',
        specialization: 'Cardiology',
        experience: 12,
        education: 'MD - Cardiology, AIIMS Delhi',
        consultationFee: 1200,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        ],
        rating: 4.8,
        reviewCount: 127,
        bio: 'Experienced cardiologist specializing in preventive cardiology and heart disease management.',
        isApproved: true,
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@docspot.com',
        role: 'doctor',
        specialization: 'Dermatology',
        experience: 8,
        education: 'MD - Dermatology, PGI Chandigarh',
        consultationFee: 950,
        availability: [
          { day: 'Monday', startTime: '10:00', endTime: '16:00', isAvailable: true },
          { day: 'Thursday', startTime: '10:00', endTime: '16:00', isAvailable: true },
          { day: 'Friday', startTime: '10:00', endTime: '16:00', isAvailable: true },
        ],
        rating: 4.6,
        reviewCount: 89,
        bio: 'Board-certified dermatologist with expertise in skin cancer screening and cosmetic procedures.',
        isApproved: true,
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@docspot.com',
        role: 'doctor',
        specialization: 'Pediatrics',
        experience: 15,
        education: 'MD - Pediatrics, KEM Hospital Mumbai',
        consultationFee: 800,
        availability: [
          { day: 'Monday', startTime: '08:00', endTime: '14:00', isAvailable: true },
          { day: 'Tuesday', startTime: '08:00', endTime: '14:00', isAvailable: true },
          { day: 'Wednesday', startTime: '08:00', endTime: '14:00', isAvailable: true },
        ],
        rating: 4.9,
        reviewCount: 203,
        bio: 'Dedicated pediatrician with a passion for child healthcare and development.',
        isApproved: true,
        createdAt: new Date(),
      },
    ];
    setDoctors(mockDoctors);
  };

  const loadAppointments = () => {
    const storedAppointments = JSON.parse(localStorage.getItem('docspot_appointments') || '[]');
    const userAppointments = storedAppointments.filter((apt: Appointment) => apt.patientId === user?.id);
    setAppointments(userAppointments);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(doctors.map(doc => doc.specialization))];

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const submitAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason || !patientAge) {
      toast.error('Please fill in all fields including age');
      return;
    }

    if (parseInt(patientAge) < 1 || parseInt(patientAge) > 120) {
      toast.error('Please enter a valid age between 1 and 120');
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId: user!.id,
      doctorId: selectedDoctor.id,
      patientName: user!.name,
      doctorName: selectedDoctor.name,
      doctorSpecialization: selectedDoctor.specialization,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      reason,
      patientAge: parseInt(patientAge),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const storedAppointments = JSON.parse(localStorage.getItem('docspot_appointments') || '[]');
    storedAppointments.push(newAppointment);
    localStorage.setItem('docspot_appointments', JSON.stringify(storedAppointments));

    setAppointments([...appointments, newAppointment]);
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setPatientAge('');
    toast.success('Appointment booked successfully!');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Manage your healthcare appointments and find the right doctors for you.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Appointments ({appointments.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'search' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors or specializations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Doctors List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{doctor.rating} ({doctor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">₹{doctor.consultationFee} consultation fee</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{doctor.bio}</p>
                  
                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
              <button
                onClick={() => setActiveTab('search')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find Doctors
              </button>
            </div>
          ) : (
            appointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                    <p className="text-blue-600">{appointment.doctorSpecialization}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                    <span className="font-medium">Reason: </span>
                    <span>{appointment.reason}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Book Appointment with {selectedDoctor.name}
            </h2>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultation Fee:</span>
                <span className="text-lg font-semibold text-blue-600">₹{selectedDoctor.consultationFee}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Age *
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  min="1"
                  max="120"
                  placeholder="Enter your age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time *
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for visit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setPatientAge('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAppointment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
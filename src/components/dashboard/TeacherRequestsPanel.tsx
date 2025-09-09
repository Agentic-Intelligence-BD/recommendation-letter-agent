'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { TeacherRequest } from '@/types';

export default function TeacherRequestsPanel() {
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teachers/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load requests');
      }

      const requestsData = await response.json();
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading teacher requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingRequest(requestId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher-requests/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} request`);
      }

      // Reload requests to update the list
      await loadRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${action} request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Requests ({pendingRequests.length})
              </h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Students requesting recommendation letters from you
            </p>
          </div>
          
          <div className="divide-y">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {request.student?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {request.student?.email} • {request.student?.grade} Grade
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.student?.institution}
                      </p>
                      {request.student?.gpa && (
                        <p className="text-sm text-gray-600">
                          GPA: {request.student?.gpa}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="capitalize">{request.status}</span>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-blue-900 mb-2">Personal Message:</h5>
                    <p className="text-blue-800 text-sm leading-relaxed">{request.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Student Profile</span>
                    </button>
                    <span className="text-xs text-gray-500">
                      Requested {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRequestAction(request.id, 'reject')}
                      disabled={processingRequest === request.id}
                      className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {processingRequest === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>Decline</span>
                    </button>
                    
                    <button
                      onClick={() => handleRequestAction(request.id, 'accept')}
                      disabled={processingRequest === request.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {processingRequest === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Requests ({processedRequests.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Previously responded to requests
            </p>
          </div>
          
          <div className="divide-y">
            {processedRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.student?.name}</p>
                      <p className="text-sm text-gray-600">{request.student?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(request.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Requests */}
      {requests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-8 text-center"
        >
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No student requests</h3>
          <p className="text-gray-600">
            When students request recommendation letters, they will appear here for your review.
          </p>
        </motion.div>
      )}

      {/* Student Profile Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Student Profile</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedRequest.student?.name}</h4>
                  <p className="text-gray-600">{selectedRequest.student?.email}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.student?.institution}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Academic Info</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Grade:</span> {selectedRequest.student?.grade}</p>
                    {selectedRequest.student?.gpa && (
                      <p><span className="text-gray-600">GPA:</span> {selectedRequest.student?.gpa}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Target Colleges</h5>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.student?.targetColleges?.length || 0} colleges
                  </p>
                </div>
              </div>

              {selectedRequest.student?.bio && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-2">Student Bio</h5>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedRequest.student.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
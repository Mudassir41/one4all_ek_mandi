'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/components/ui/NotificationToast';
import { User, Edit3, Camera, Star, Shield, MapPin, Phone, Mail, Calendar, Package, TrendingUp, Award, Upload } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  userType: 'vendor' | 'buyer' | 'both';
  location: {
    state: string;
    district: string;
    address: string;
  };
  languages: string[];
  businessInfo?: {
    businessName: string;
    businessType: string;
    gstNumber?: string;
    certifications: string[];
  };
  stats: {
    totalTransactions: number;
    rating: number;
    reviewCount: number;
    joinDate: string;
    totalSales?: number;
    totalPurchases?: number;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    preferredLanguage: string;
  };
  documents: Array<{
    type: string;
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadDate: string;
  }>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    // Mock profile data
    const mockProfile: UserProfile = {
      id: 'user-1',
      name: 'Ravi Kumar',
      phone: '+919876543210',
      email: 'ravi.kumar@example.com',
      avatar: 'https://via.placeholder.com/150x150?text=RK',
      userType: 'vendor',
      location: {
        state: 'Tamil Nadu',
        district: 'Chennai',
        address: 'Village Ramanagara, Chennai District, Tamil Nadu'
      },
      languages: ['ta', 'en', 'hi'],
      businessInfo: {
        businessName: 'Kumar Organic Farms',
        businessType: 'Organic Farming',
        gstNumber: '33ABCDE1234F1Z5',
        certifications: ['Organic Certified', 'Fair Trade', 'Export Quality']
      },
      stats: {
        totalTransactions: 156,
        rating: 4.8,
        reviewCount: 89,
        joinDate: '2023-03-15',
        totalSales: 245000,
        totalPurchases: 0
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        preferredLanguage: 'ta'
      },
      documents: [
        {
          type: 'Aadhaar Card',
          name: 'aadhaar_ravi_kumar.pdf',
          status: 'verified',
          uploadDate: '2023-03-16'
        },
        {
          type: 'PAN Card',
          name: 'pan_ravi_kumar.pdf',
          status: 'verified',
          uploadDate: '2023-03-16'
        },
        {
          type: 'Organic Certificate',
          name: 'organic_cert_2024.pdf',
          status: 'verified',
          uploadDate: '2024-01-10'
        },
        {
          type: 'Bank Statement',
          name: 'bank_statement_dec2024.pdf',
          status: 'pending',
          uploadDate: '2024-12-15'
        }
      ]
    };

    setTimeout(() => {
      setProfile(mockProfile);
      setLoading(false);
    }, 1000);
  };

  const handleSaveProfile = () => {
    addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.'
    });
    setIsEditing(false);
  };

  const handleUploadDocument = () => {
    addNotification({
      type: 'info',
      title: 'Document Upload',
      message: 'Document upload feature will be available soon!'
    });
  };

  const handleAvatarUpload = () => {
    addNotification({
      type: 'info',
      title: 'Avatar Upload',
      message: 'Avatar upload feature will be available soon!'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <Link
            href="/"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-blue-200 transition">
                ← Back to Home
              </Link>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-blue-100 text-sm">Manage your account and preferences</p>
              </div>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-white"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="text-gray-900">
                  {lang.native}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                  />
                  <button
                    onClick={handleAvatarUpload}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 mt-3">{profile.name}</h3>
                <p className="text-gray-600 text-sm">{profile.businessInfo?.businessName}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{profile.stats.rating}</span>
                  <span className="text-gray-500 text-sm">({profile.stats.reviewCount})</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('business')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'business' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Business Info
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'documents' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'stats' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Statistics
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{profile.phone}</p>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Verified</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email || ''}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-900">{profile.email || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.userType === 'vendor' ? 'bg-green-100 text-green-800' :
                        profile.userType === 'buyer' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {profile.userType === 'vendor' ? '🌾 Seller' : 
                         profile.userType === 'buyer' ? '🛒 Buyer' : '🔄 Both'}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={profile.location.state}
                          onChange={(e) => setProfile({
                            ...profile, 
                            location: {...profile.location, state: e.target.value}
                          })}
                          placeholder="State"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={profile.location.district}
                          onChange={(e) => setProfile({
                            ...profile, 
                            location: {...profile.location, district: e.target.value}
                          })}
                          placeholder="District"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={profile.location.address}
                          onChange={(e) => setProfile({
                            ...profile, 
                            location: {...profile.location, address: e.target.value}
                          })}
                          placeholder="Full Address"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-gray-900">{profile.location.address}</p>
                          <p className="text-gray-600 text-sm">{profile.location.district}, {profile.location.state}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <div className="flex gap-2">
                      {profile.languages.map(lang => {
                        const language = languages.find(l => l.code === lang);
                        return (
                          <span key={lang} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                            {language?.native || lang}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Business Info Tab */}
            {activeTab === 'business' && profile.businessInfo && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Business Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <p className="text-gray-900 font-medium">{profile.businessInfo.businessName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <p className="text-gray-900">{profile.businessInfo.businessType}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                    <p className="text-gray-900 font-mono">{profile.businessInfo.gstNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{new Date(profile.stats.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Certifications</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.businessInfo.certifications.map(cert => (
                        <span key={cert} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Documents & Verification</h2>
                  <button
                    onClick={handleUploadDocument}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                </div>

                <div className="space-y-4">
                  {profile.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.status === 'verified' ? 'bg-green-100 text-green-600' :
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.type}</p>
                          <p className="text-sm text-gray-600">{doc.name}</p>
                          <p className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status === 'verified' ? '✓ Verified' :
                         doc.status === 'pending' ? '⏳ Pending' :
                         '❌ Rejected'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{profile.stats.totalTransactions}</p>
                        <p className="text-gray-600 text-sm">Total Transactions</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{profile.stats.rating}</p>
                        <p className="text-gray-600 text-sm">Average Rating</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">₹{profile.stats.totalSales?.toLocaleString()}</p>
                        <p className="text-gray-600 text-sm">Total Sales</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Overview</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Performance charts will be available soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
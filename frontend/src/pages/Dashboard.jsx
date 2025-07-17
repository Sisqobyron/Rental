import React, { useState, useEffect } from 'react';
import { Building, Users, DollarSign, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboard } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    pendingMaintenance: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, summaryResponse] = await Promise.all([
        dashboard.getStats(),
        dashboard.getMonthlySummary(),
      ]);

      setStats(statsResponse.data);
      
      // Format monthly data for chart
      const formattedData = summaryResponse.data.map(item => ({
        month: new Date(item.payment_month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        revenue: parseFloat(item.total_amount || 0),
        payments: item.payment_count,
      })).reverse();

      setMonthlyData(formattedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building,
      color: 'blue',
    },
    {
      title: 'Active Tenants',
      value: stats.totalTenants,
      icon: Users,
      color: 'green',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
    },
    {
      title: 'Pending Maintenance',
      value: stats.pendingMaintenance,
      icon: Wrench,
      color: 'orange',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 text-${card.color}-600`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Monthly Revenue Overview</h2>
          <p className="text-sm text-gray-600">Revenue from confirmed rent payments over the last 12 months</p>
        </div>
        
        {monthlyData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Payments'
                  ]}
                />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No revenue data available yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
            <Building className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Add Property</h3>
            <p className="text-sm text-gray-600">Add a new rental property</p>
          </button>
          
          <button className="text-left p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all">
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Register Tenant</h3>
            <p className="text-sm text-gray-600">Add a new tenant</p>
          </button>
          
          <button className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
            <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Review Payments</h3>
            <p className="text-sm text-gray-600">Confirm pending payments</p>
          </button>
          
          <button className="text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all">
            <Wrench className="h-6 w-6 text-orange-600 mb-2" />
            <h3 className="font-medium text-gray-900">Maintenance</h3>
            <p className="text-sm text-gray-600">Review maintenance requests</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

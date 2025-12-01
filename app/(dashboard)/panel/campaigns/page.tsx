'use client';

import { useState } from 'react';
import { PanelLayout } from '../components/panel-layout';
import { CampaignsSidebar } from '../components/campaigns-sidebar';
import { CampaignsTable } from '../components/campaigns-table';
import { mockCampaigns, formatCurrency } from '@/lib/mock-data';
import { Search, Plus, FilePlus, SlidersHorizontal } from 'lucide-react';

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'suspended' | 'scheduled'>('active');

  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active');
  const suspendedCampaigns = mockCampaigns.filter(c => c.status === 'suspended');
  const scheduledCampaigns = mockCampaigns.filter(c => c.status === 'scheduled');

  const displayedCampaigns = activeTab === 'active'
    ? activeCampaigns
    : activeTab === 'suspended'
    ? suspendedCampaigns
    : scheduledCampaigns;

  return (
    <PanelLayout>
      <div className="flex h-screen">
        {/* Secondary Sidebar */}
        <CampaignsSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Page Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Campaigns</h1>

            {/* Status Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-lavender-50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-khaki-200 text-gray-900 shadow-lg'
                    : 'bg-transparent text-gray-600'
                } cursor-pointer`}
              >
                Active <span
                  className={`ml-2 px-2 py-1 rounded-full ${
                    activeTab === 'active'
                    ? 'bg-yellow-50'
                    : 'bg-peru-200 text-white'
                }`}>
                  {activeCampaigns.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('suspended')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'suspended'
                    ? 'bg-khaki-200 text-gray-900 shadow-lg'
                    : 'bg-transparent text-gray-600'
                } cursor-pointer`}
              >
                Suspended <span className={`ml-2 px-2 py-1 rounded-full ${
                  activeTab === 'suspended'
                  ? 'bg-yellow-50'
                  : 'bg-peru-200 text-white'
                }`}>{suspendedCampaigns.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'scheduled'
                    ? 'bg-khaki-200 text-gray-900 shadow-lg'
                    : 'bg-transparent text-gray-600'
                } cursor-pointer`}
              >
                Scheduled <span className={`ml-2 px-2 py-1 rounded-full ${
                  activeTab === 'scheduled'
                  ? 'bg-yellow-50'
                  : 'bg-peru-200 text-white'
                }`}>{scheduledCampaigns.length}</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Total Amount Spent */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/dollar-sign.png" alt="dollar-alt" />
                  <div>
                    <div className="text-sm text-gray-400">Total Amount Spent</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(12350987.67)}</div>
                  </div>
                </div>
              </div>

              {/* Campaign Health */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-3">Campaign Health</div>
                <button className="px-6 py-2 bg-bisque-50 text-firebrick-500 rounded-xl font-medium flex items-center gap-2 hover:bg-bisque-100 transition-colors font-gilroy-bold">
                  <img src="/mdi_fire.png" alt="fire-alt" />
                  Budget Burn
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-khaki-200 text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-khaki-300 transition-colors">
                  <Plus className="w-5 h-5" />
                  New campaign
                </button>
                <button className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <FilePlus className="w-5 h-5" />
                  Add metric
                </button>
                <button className="px-5 py-2.5 border border-gray-300 bg-white text-peru-200 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filter
                </button>
              </div>
            </div>

            {/* Campaigns Table */}
            <CampaignsTable campaigns={displayedCampaigns} />
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}

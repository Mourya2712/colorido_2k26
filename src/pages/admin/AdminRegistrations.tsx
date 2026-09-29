import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminRegistrations, updateRegistrationStatus } from '../../lib/api';
import { Search, Download, Eye, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegistrationItem {
  id: string;
  registration_number: string;
  event_name: string;
  event_type: string;
  participant_name: string;
  email: string;
  phone: string;
  college_name: string;
  roll_number: string;
  department?: string;
  year_of_study?: string;
  status: string;
  created_at: string;
}

const AdminRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // CSV Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCategories, setExportCategories] = useState({
    cultural: true,
    boysSports: true,
    girlsSports: true,
  });

  const normalizeType = (t: string) => {
    const lower = (t || '').toLowerCase();
    if (lower.includes('cult')) return 'cultural';
    if (lower.includes('boy')) return 'boyssports';
    if (lower.includes('girl')) return 'girlssports';
    return lower;
  };

  const fetchRegistrations = () => {
    setLoading(true);
    getAdminRegistrations({ type: typeFilter !== 'all' ? typeFilter : undefined })
      .then((res) => {
        if (res.data?.registrations) {
          setRegistrations(res.data.registrations);
        } else {
          setRegistrations([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch registrations:', err);
        setRegistrations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRegistrations();
  }, [typeFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      toast.success(`Candidate status changed to ${newStatus}`);
      fetchRegistrations();
    } catch {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(`Candidate status changed to ${newStatus}`);
    }
  };

  const filtered = registrations.filter((r) => {
    const norm = normalizeType(r.event_type);
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'cultural' && norm === 'cultural') ||
      (typeFilter === 'boysSports' && norm === 'boyssports') ||
      (typeFilter === 'girlsSports' && norm === 'girlssports');

    const matchesStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      r.participant_name.toLowerCase().includes(search.toLowerCase()) ||
      r.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      r.college_name.toLowerCase().includes(search.toLowerCase()) ||
      r.event_name.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_number.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    setExportCategories({
      cultural: checked,
      boysSports: checked,
      girlsSports: checked,
    });
  };

  const allSelected = exportCategories.cultural && exportCategories.boysSports && exportCategories.girlsSports;

  const handleExecuteCSVExport = () => {
    const isAnySelected = exportCategories.cultural || exportCategories.boysSports || exportCategories.girlsSports;
    if (!isAnySelected) {
      toast.error('Please select at least one category to export.');
      return;
    }

    const selectedRegs = registrations.filter((r) => {
      const norm = normalizeType(r.event_type);
      if (norm === 'cultural' && exportCategories.cultural) return true;
      if (norm === 'boyssports' && exportCategories.boysSports) return true;
      if (norm === 'girlssports' && exportCategories.girlsSports) return true;
      return false;
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Pass No,Name,Email,Phone,College,Roll No,Dept,Year,Event,Type,Status,Date'].join(',') +
      '\n' +
      selectedRegs
        .map(
          (r) =>
            `"${r.registration_number}","${r.participant_name}","${r.email}","${r.phone}","${r.college_name}","${r.roll_number}","${r.department || ''}","${r.year_of_study || ''}","${r.event_name}","${r.event_type}","${r.status}","${r.created_at}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `colorido_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
    toast.success(`Exported ${selectedRegs.length} candidate records to CSV.`);
  };

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">Candidate Registrations</h1>
          <p className="text-xs text-slate-400">Review, verify, and check-in candidates across all competitions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRegistrations}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, roll no, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Category Types</option>
            <option value="cultural">Cultural Events</option>
            <option value="boysSports">Boys Sports</option>
            <option value="girlsSports">Girls Sports</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Checked In</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Pass No</th>
                <th className="px-5 py-3">Candidate Details</th>
                <th className="px-5 py-3">Event & Category</th>
                <th className="px-5 py-3">College & ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No candidate records match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-mono font-semibold text-purple-300 whitespace-nowrap">
                      {reg.registration_number}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-white">{reg.participant_name}</p>
                      <p className="text-[10px] text-slate-400">{reg.email} • {reg.phone}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-200">{reg.event_name}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {reg.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-300 truncate max-w-xs">{reg.college_name}</p>
                      <p className="text-[10px] text-slate-400">Roll: {reg.roll_number} ({reg.department})</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          reg.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : reg.status === 'checked_in'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : reg.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {reg.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap space-x-1.5">
                      <Link
                        to={`/admin/registrations/${reg.id}`}
                        className="inline-flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {reg.status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(reg.id, 'confirmed')}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]"
                        >
                          Confirm
                        </button>
                      )}
                      {reg.status !== 'checked_in' && (
                        <button
                          onClick={() => handleStatusUpdate(reg.id, 'checked_in')}
                          className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 font-bold text-[10px]"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Export Category Filter Modal */}
      {showExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#120f22] border border-white/15 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center space-x-2">
                <Download className="w-4 h-4 text-purple-400" />
                <span>Export Registrations to CSV</span>
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select category to export:
            </p>

            <div className="space-y-3 bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <label className="flex items-center space-x-3 cursor-pointer group pb-2.5 border-b border-white/10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  Select All
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportCategories.cultural}
                  onChange={(e) =>
                    setExportCategories((prev) => ({ ...prev, cultural: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-200 group-hover:text-white transition-colors">
                  Cultural
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportCategories.boysSports}
                  onChange={(e) =>
                    setExportCategories((prev) => ({ ...prev, boysSports: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-orange-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-200 group-hover:text-white transition-colors">
                  Boys Sports
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={exportCategories.girlsSports}
                  onChange={(e) =>
                    setExportCategories((prev) => ({ ...prev, girlsSports: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-cyan-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-200 group-hover:text-white transition-colors">
                  Girls Sports
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCSVExport}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;

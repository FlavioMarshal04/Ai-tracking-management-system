import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { User, AuditLog, SystemSettings } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import { StatCard } from '../../components/common/StatCard.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import {
  Shield,
  Users,
  BrainCircuit,
  Settings,
  ShieldCheck,
  UserPlus,
  Link,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings' | 'audit'>('overview');

  // Create User modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserRole, setNewUserRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('FACULTY');
  const [creatingUser, setCreatingUser] = useState(false);

  // Assign faculty modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Settings form states
  const [asmtWeight, setAsmtWeight] = useState(50);
  const [masteryWeight, setMasteryWeight] = useState(25);
  const [consWeight, setConsWeight] = useState(15);
  const [impWeight, setImpWeight] = useState(10);
  const [savingSettings, setSavingSettings] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, settRes, logsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminUsers(),
        api.getAdminSettings(),
        api.getAdminAuditLogs(),
      ]);
      setMetrics(dashRes.metrics);
      setUsers(usersRes.users || []);
      setSettings(settRes.settings);
      setAuditLogs(logsRes.auditLogs || []);

      if (settRes.settings) {
        setAsmtWeight(settRes.settings.assessmentWeight);
        setMasteryWeight(settRes.settings.topicMasteryWeight);
        setConsWeight(settRes.settings.consistencyWeight);
        setImpWeight(settRes.settings.improvementWeight);
      }

      const facultyList = (usersRes.users || []).filter((u: any) => u.role === 'FACULTY');
      const studentList = (usersRes.users || []).filter((u: any) => u.role === 'STUDENT');
      if (facultyList.length > 0) setSelectedFacultyId(facultyList[0].id);
      if (studentList.length > 0) setSelectedStudentId(studentList[0].id);
    } catch (err: any) {
      showToast(err.message || 'Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await api.createAdminUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        departmentId: 'dep-cse',
      });
      showToast(`Provisioned ${newUserRole} account for ${newUserName}`, 'success');
      setIsUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await api.assignFaculty(selectedFacultyId, selectedStudentId);
      showToast('Assigned student to faculty mentor', 'success');
      setIsAssignModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign mentor', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const sum = asmtWeight + masteryWeight + consWeight + impWeight;
    if (sum !== 100) {
      showToast(`Weights must sum to 100%! Current total: ${sum}%`, 'error');
      return;
    }

    setSavingSettings(true);
    try {
      await api.updateAdminSettings({
        assessmentWeight: asmtWeight,
        topicMasteryWeight: masteryWeight,
        consistencyWeight: consWeight,
        improvementWeight: impWeight,
      });
      showToast('System progress weights saved and applied across platform', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading administrative controls..." />;
  }

  const weightSum = asmtWeight + masteryWeight + consWeight + impWeight;

  return (
    <div className="space-y-8 animate-in fade-in duration-150 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Administration & Governance
          </h1>
          <p className="text-sm text-slate-500">
            Configure system progress formulas, provision faculty accounts, and inspect audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Link className="w-3.5 h-3.5" /> Assign Mentorship
          </button>

          <button
            onClick={() => setIsUserModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Faculty / User
          </button>
        </div>
      </div>

      {/* Primary Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers || 5}
          subtitle={`${metrics?.totalStudents || 3} Students · ${metrics?.totalFaculty || 1} Faculty`}
          icon={Users}
          accentColor="#6D28D9"
        />

        <StatCard
          title="Tests Completed"
          value={metrics?.totalTestsCompleted || 8}
          subtitle="All examinations scored"
          icon={BrainCircuit}
          accentColor="#2563EB"
        />

        <StatCard
          title="Documents Processed"
          value={metrics?.totalDocumentsProcessed || 3}
          subtitle="Course PDFs parsed"
          icon={FileText}
          accentColor="#059669"
        />

        <StatCard
          title="Platform Average"
          value={`${metrics?.averagePlatformScore || 80}%`}
          subtitle="Institution-wide mean"
          icon={Activity}
          accentColor="#7C3AED"
        />
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#6D28D9] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          User Directory ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-[#6D28D9] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Formula Weights & Settings
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-[#6D28D9] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: User Directory */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Registered Institutional Users</h3>
            <span className="text-xs text-slate-400">Universal RBAC Directory</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User Identity</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Key Metric / Info</th>
                  <th className="px-6 py-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                          u.role === 'ADMIN'
                            ? 'bg-slate-900 text-white'
                            : u.role === 'FACULTY'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-violet-50 text-violet-700 border border-violet-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {u.profile?.departmentName || 'Computer Science & Engineering'}
                    </td>

                    <td className="px-6 py-4">
                      {u.role === 'STUDENT' ? (
                        <div className="font-bold text-slate-800">
                          Score: {u.profile?.overallScore || 0}% · {u.profile?.currentLevel}
                        </div>
                      ) : u.role === 'FACULTY' ? (
                        <div className="text-slate-600 font-medium">
                          {u.profile?.designation || 'Faculty Member'}
                        </div>
                      ) : (
                        <div className="text-slate-600 font-medium">System Super Admin</div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: System Settings & Formula Weights */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-3xl">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg">
              Progress Formula Weights Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust the algorithmic importance of individual components. Weights must sum to exactly 100%.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6D28D9] mb-1">
                  1. Assessment Performance (%)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={asmtWeight}
                    onChange={e => setAsmtWeight(Number(e.target.value))}
                    className="flex-1 accent-[#6D28D9]"
                  />
                  <span className="font-mono font-bold text-sm w-12 text-right text-slate-900">
                    {asmtWeight}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Contribution from online test attempts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                  2. Topic Concept Mastery (%)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={masteryWeight}
                    onChange={e => setMasteryWeight(Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="font-mono font-bold text-sm w-12 text-right text-slate-900">
                    {masteryWeight}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Contribution from topic accuracy breakdown.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                  3. Practice Consistency Streak (%)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={consWeight}
                    onChange={e => setConsWeight(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="font-mono font-bold text-sm w-12 text-right text-slate-900">
                    {consWeight}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Daily study regularity & streak points.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  4. Score Trajectory & Growth (%)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={impWeight}
                    onChange={e => setImpWeight(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-sm w-12 text-right text-slate-900">
                    {impWeight}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Positive delta between recent and baseline tests.
                </p>
              </div>
            </div>

            {/* Sum validation bar */}
            <div
              className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
                weightSum === 100
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {weightSum === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {weightSum === 100
                    ? 'Total formula weight equals exactly 100% (Valid mathematical state).'
                    : `Total formula weight is ${weightSum}% (Must equal exactly 100% to save).`}
                </span>
              </div>
              <span className="font-mono text-sm">{weightSum} / 100%</span>
            </div>

            <button
              type="submit"
              disabled={weightSum !== 100 || savingSettings}
              className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Persisting...' : 'Save & Enforce Platform Weights'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Security & Audit Event Stream</h3>
            <span className="text-xs text-slate-400">Tamper-evident system activity</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[11px] text-[#6D28D9] bg-violet-50 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-500">
                      by <strong className="text-slate-800">{log.userName}</strong>
                    </span>
                    <span className="text-xs text-slate-400 ml-auto font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Provision Institutional User"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Account Role
            </label>
            <select
              value={newUserRole}
              onChange={e => setNewUserRole(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
            >
              <option value="FACULTY">Faculty Member / Mentor</option>
              <option value="STUDENT">Student Candidate</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              placeholder="e.g. Dr. Arthur Pendelton"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={e => setNewUserEmail(e.target.value)}
              placeholder="e.g. arthur.p@edupulse.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Default Password
            </label>
            <input
              type="password"
              required
              value={newUserPassword}
              onChange={e => setNewUserPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingUser}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold disabled:opacity-50"
            >
              {creatingUser ? 'Provisioning...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Mentorship Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Student to Faculty Mentor"
        maxWidth="md"
      >
        <form onSubmit={handleAssignMentor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Faculty Mentor
            </label>
            <select
              value={selectedFacultyId}
              onChange={e => setSelectedFacultyId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
            >
              {users
                .filter(u => u.role === 'FACULTY')
                .map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Student Assignee
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
            >
              {users
                .filter(u => u.role === 'STUDENT')
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.profile?.rollNumber || s.email})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

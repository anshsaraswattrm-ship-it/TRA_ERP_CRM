import { useState, useEffect } from 'react';
import { UserPlus, Users, Key, Mail, Trash2, ShieldCheck, User, Loader2, CheckCircle, AlertCircle, AlertTriangle, Edit2, X } from 'lucide-react';

export default function UserAccounts() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Popups & Modals
  const [popup, setPopup] = useState({ show: false, type: '', message: '', onConfirm: null });
  const [editModal, setEditModal] = useState({ show: false, user: null });

  // Edit Form States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const showPopup = (type, message, onConfirm = null) => {
    setPopup({ show: true, type, message, onConfirm });
    if (type !== 'confirm') {
      setTimeout(() => setPopup((prev) => ({ ...prev, show: false })), 3000);
    }
  };

  const fetchUsers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch('https://tra-erp-crm.onrender.com/api/auth/users', {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      const data = await response.json();
      if (response.ok) setUsersList(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Create User ID Logic
  useEffect(() => {
    if (role) {
      let roleShort = '';
      if (role === 'Founder and Director') roleShort = 'FN';
      else if (role === 'Manager') roleShort = 'MN';
      else if (role === 'Team Leader') roleShort = 'TL';
      else if (role === 'BDE LEVEL1') roleShort = 'BDE-LV1'; 
      else if (role === 'BDE LEVEL2') roleShort = 'BDE-LV2';
      else if (role === 'Receptionist') roleShort = 'REC';

      const currentYear = new Date().getFullYear();
      const sequenceNumber = String(usersList.length + 1).padStart(3, '0');
      setGeneratedId(`RA-${sequenceNumber}-${roleShort}-${currentYear}`.toUpperCase());
    } else {
      setGeneratedId('');
    }
  }, [role, usersList.length]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!name || !email || !role || !password) return;
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const payload = { employeeId: generatedId, name, email, password, role };
      const response = await fetch('https://tra-erp-crm.onrender.com/api/auth/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        showPopup('success', `Account for ${name} provisioned!`);
        fetchUsers(); 
        setName(''); setEmail(''); setRole(''); setPassword('');
      } else {
        showPopup('error', data.message || 'Failed to create user.');
      }
    } catch (error) {
      showPopup('error', "Server is not responding.");
    } finally { setLoading(false); }
  };

  const openEditModal = (user) => {
    if (user.employeeId === 'RA-001-ADMIN-2026') {
      showPopup('error', "Action Denied! Master Super Admin details cannot be modified.");
      return;
    }

    setEditModal({ show: true, user });
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword(''); 
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const payload = { name: editName, email: editEmail, role: editRole };
      
      if (editPassword) payload.password = editPassword;

      const response = await fetch(`https://tra-erp-crm.onrender.com/api/auth/users/${editModal.user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setEditModal({ show: false, user: null });
        showPopup('success', `${data.employeeId} details updated successfully!`);
        fetchUsers();
      } else {
        showPopup('error', data.message || 'Failed to update user.');
      }
    } catch (error) {
      showPopup('error', "Server error while updating.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (dbId, employeeId) => {
    if(employeeId === 'RA-001-ADMIN-2026') {
      showPopup('error', "Action Denied! Cannot delete the Master System Admin.");
      return;
    }
    showPopup('confirm', `Are you sure you want to revoke access for ${employeeId}?`, async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const response = await fetch(`https://tra-erp-crm.onrender.com/api/auth/users/${dbId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        });
        if (response.ok) {
          showPopup('success', `${employeeId} deleted.`);
          fetchUsers(); 
        } else {
          const data = await response.json();
          showPopup('error', data.message);
        }
      } catch (error) { showPopup('error', "Error connecting to server."); }
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      
      {/* NOTIFICATION POPUP */}
      {popup.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex flex-col items-center text-center">
              {popup.type === 'success' && <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4"><CheckCircle size={28} /></div>}
              {popup.type === 'error' && <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4"><AlertCircle size={28} /></div>}
              {popup.type === 'confirm' && <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-4"><AlertTriangle size={28} /></div>}
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {popup.type === 'success' ? 'Success!' : popup.type === 'error' ? 'Action Failed' : 'Confirm Deletion'}
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{popup.message}</p>
              {popup.type === 'confirm' ? (
                <div className="flex gap-3 w-full">
                  <button onClick={() => setPopup({ show: false })} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Cancel</button>
                  <button onClick={() => { popup.onConfirm(); setPopup({ show: false }); }} className="flex-1 px-4 py-2.5 bg-[#e9272e] text-white rounded-lg text-sm font-semibold hover:bg-red-700">Yes, Revoke</button>
                </div>
              ) : (
                <button onClick={() => setPopup({ show: false })} className="w-full px-4 py-2.5 bg-[#084e8d] text-white rounded-lg text-sm font-semibold hover:bg-[#063a6b]">Acknowledge</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="bg-[#084e8d] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold tracking-wide truncate pr-2">Edit: {editModal.user?.employeeId}</h3>
              <button onClick={() => setEditModal({ show: false, user: null })} className="text-white/80 hover:text-white flex-shrink-0">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#084e8d]/20 outline-none" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input required type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#084e8d]/20 outline-none" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role (Warning: May change access level)</label>
                <select required value={editRole} onChange={(e) => setEditRole(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#084e8d]/20 outline-none bg-white">
                  <option value="Founder and Director">Founder and Director</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="BDE LEVEL1">BDE LEVEL1</option>
                  <option value="BDE LEVEL2">BDE LEVEL2</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Password (Optional)</label>
                <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep current password" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#084e8d]/20 outline-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditModal({ show: false, user: null })} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 px-4 py-2.5 bg-[#084e8d] text-white rounded-lg text-sm font-semibold hover:bg-[#063a6b]">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#084e8d] tracking-tight">User Accounts Management</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Provision and manage employee system credentials securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN: Create User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden lg:sticky lg:top-6">
            <div className="bg-slate-50/50 px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center">
              <UserPlus className="text-[#084e8d] mr-2 flex-shrink-0" size={20} />
              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-800 uppercase tracking-wider">Create New User</h3>
            </div>
            
            <form onSubmit={handleCreateAccount} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aman Verma" className="pl-9 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#084e8d]/20" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@raptor.com" className="pl-9 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#084e8d]/20" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">System Role</label>
                <select required value={role} onChange={(e) => setRole(e.target.value)} className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-[#084e8d]/20">
                  <option value="">Select Role</option>
                  <option value="Founder and Director">Founder and Director</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="BDE LEVEL1">BDE LEVEL1</option>
                  <option value="BDE LEVEL2">BDE LEVEL2</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Generated ID</label>
                <input type="text" value={generatedId} readOnly placeholder="Select role to generate ID" className="block w-full px-3 py-2 bg-[#084e8d]/5 border border-[#084e8d]/20 rounded-lg text-sm font-bold text-[#084e8d] outline-none cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Set Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input required type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create strong password" className="pl-9 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#084e8d]/20" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center items-center mt-2 bg-[#084e8d] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#063a6b] shadow-sm transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {loading ? 'Provisioning...' : 'Provision Account'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Users List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden h-full min-h-[400px] sm:min-h-[500px]">
            <div className="bg-slate-50/50 px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="text-[#084e8d] mr-2 flex-shrink-0" size={20} />
                <h3 className="text-sm sm:text-[15px] font-semibold text-slate-800 uppercase tracking-wider">Active System Users</h3>
              </div>
              <span className="bg-[#084e8d]/10 text-[#084e8d] py-1 px-3 rounded-full text-xs font-bold">Total: {usersList.length}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {fetching ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500"><Loader2 className="mx-auto h-8 w-8 animate-spin text-[#084e8d] mb-2" />Fetching Database...</td></tr>
                  ) : usersList.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500"><ShieldCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" /><p className="text-sm">No accounts found.</p></td></tr>
                  ) : (
                    usersList.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><span className="px-2 sm:px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] sm:text-xs font-bold font-mono">{user.employeeId}</span></td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><div className="flex flex-col"><span className="text-xs sm:text-sm font-semibold text-slate-800">{user.name}</span><span className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{user.email}</span></div></td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold inline-block ${
                            user.role === 'Super Admin' ? 'bg-red-100 text-[#e9272e]' : 
                            user.role === 'Founder and Director' ? 'bg-yellow-100 text-yellow-700' : 
                            user.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 
                            user.role === 'Receptionist' ? 'bg-teal-100 text-teal-700' : 
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-1.5 sm:gap-2">
                            <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 bg-white border border-slate-200 hover:border-blue-300 p-1.5 rounded-md shadow-sm transition-colors" title="Edit Details"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteClick(user._id, user.employeeId)} className="text-[#e9272e]/70 hover:text-[#e9272e] bg-white border border-slate-200 hover:border-[#e9272e]/30 p-1.5 rounded-md shadow-sm transition-colors" title="Revoke Access"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
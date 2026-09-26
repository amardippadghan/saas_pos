'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Building2, Save, Loader2 } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<any>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      const userData = await fetchApi('/auth/me');
      if (userData.roles && userData.roles.length > 0) {
        const orgId = userData.roles[0].organizationId;
        const orgData = await fetchApi(`/organizations/${orgId}`);
        setOrganization(orgData);
        setName(orgData.name);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load organization details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization) return;
    
    setIsSaving(true);
    setMessage(null);
    try {
      await fetchApi(`/organizations/${organization.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() })
      });
      setMessage({ type: 'success', text: 'Organization updated successfully.' });
      setOrganization({ ...organization, name: name.trim() });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to update organization.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-8 text-center text-gray-500">
        No organization found for your account.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Organization Settings</h1>
          <p className="text-gray-500">Manage your company details and preferences</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold mb-6">General Information</h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Organization Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Acme Corp"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-500">Organization ID</label>
              <div className="px-4 py-2 border dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 rounded-xl text-gray-500 font-mono text-sm cursor-not-allowed">
                {organization.id}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-500">Created At</label>
              <div className="px-4 py-2 border dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm cursor-not-allowed">
                {new Date(organization.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t dark:border-gray-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || name.trim() === organization.name}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

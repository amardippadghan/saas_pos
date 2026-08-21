'use client';

import { useState, useEffect, FormEvent } from 'react';
import { fetchApi } from '../../../../lib/api';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function PaymentSettingsPage() {
  const [provider, setProvider] = useState('RAZORPAY');
  const [settings, setSettings] = useState<any>({
    provider: 'RAZORPAY',
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    isActive: false,
    isTestMode: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings(provider);
  }, [provider]);

  const loadSettings = async (selectedProvider: string) => {
    try {
      const data = await fetchApi(`/settings/payment-gateways/${selectedProvider}`);
      if (data) {
        setSettings(data);
      }
    } catch (err: any) {
      if (err.message.includes('not found')) {
        setSettings({
          provider: selectedProvider,
          apiKey: '',
          apiSecret: '',
          merchantId: '',
          isActive: false,
          isTestMode: true,
        });
      }
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await fetchApi('/settings/payment-gateways', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      setMessage('Settings saved successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Gateways</h1>
        <p className="text-gray-500 mt-1">Configure your payment providers like Razorpay and PhonePe.</p>
      </div>

      <div className="flex gap-4 border-b dark:border-gray-800 pb-4">
        <button 
          onClick={() => setProvider('RAZORPAY')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${provider === 'RAZORPAY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
        >
          Razorpay
        </button>
        <button 
          onClick={() => setProvider('PHONEPE')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${provider === 'PHONEPE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
        >
          PhonePe
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{provider} Configuration</h2>
        
        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.isActive}
                onChange={e => setSettings({...settings, isActive: e.target.checked})}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-sm">Enable {provider} at checkout</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Environment</label>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={settings.isTestMode}
                onChange={e => setSettings({...settings, isTestMode: e.target.checked})}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-sm">Test Mode (Sandbox)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {provider === 'RAZORPAY' ? 'Key ID' : 'Client ID'}
            </label>
            <Input 
              value={settings.apiKey || ''}
              onChange={e => setSettings({...settings, apiKey: e.target.value})}
              placeholder="e.g. rzp_test_123456"
              required={settings.isActive}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {provider === 'RAZORPAY' ? 'Key Secret' : 'Client Secret'}
            </label>
            <Input 
              type="password"
              value={settings.apiSecret || ''}
              onChange={e => setSettings({...settings, apiSecret: e.target.value})}
              placeholder="••••••••••••••••"
              required={settings.isActive}
            />
          </div>

          {provider === 'PHONEPE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Merchant ID</label>
              <Input 
                value={settings.merchantId || ''}
                onChange={e => setSettings({...settings, merchantId: e.target.value})}
                placeholder="PGTESTPAYUAT"
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 mt-6">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}

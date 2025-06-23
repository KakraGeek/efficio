import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { RequireAuth } from '../components/RequireAuth';

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialSettings, setInitialSettings] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);

  // Track if any field has changed
  const isChanged =
    businessName !== initialSettings.businessName ||
    address !== initialSettings.address ||
    phone !== initialSettings.phone ||
    email !== initialSettings.email ||
    logoPreview !== initialSettings.logoUrl;

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setBusinessName(data.businessName || '');
          setAddress(data.address || '');
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setLogoUrl(data.logoUrl || '');
          setLogoPreview(data.logoUrl || '');
          setInitialSettings({
            businessName: data.businessName || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            logoUrl: data.logoUrl || '',
          });
        } else {
          toast.error('Failed to load settings.');
        }
      } catch (err) {
        toast.error('Network error.');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  function handleReset() {
    setBusinessName(initialSettings.businessName);
    setAddress(initialSettings.address);
    setPhone(initialSettings.phone);
    setEmail(initialSettings.email);
    setLogoFile(null);
    setLogoPreview(initialSettings.logoUrl);
  }

  async function handleSave() {
    setSaving(true);
    let uploadedLogoUrl = logoUrl;
    if (logoFile) {
      const formData = new FormData();
      formData.append('file', logoFile);
      try {
        const res = await fetch('/api/upload-order-image', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedLogoUrl = data.url;
        } else {
          toast.error('Failed to upload logo.');
          setSaving(false);
          return;
        }
      } catch (err) {
        toast.error('Network error during logo upload.');
        setSaving(false);
        return;
      }
    }
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          address,
          phone,
          email,
          logoUrl: uploadedLogoUrl,
        }),
      });
      if (res.ok) {
        toast.success('Settings saved!');
        setLogoUrl(uploadedLogoUrl);
        setInitialSettings({
          businessName,
          address,
          phone,
          email,
          logoUrl: uploadedLogoUrl,
        });
      } else {
        toast.error('Failed to save settings.');
      }
    } catch (err) {
      toast.error('Network error.');
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowConfirm(true);
  }

  return (
    <RequireAuth>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
        {loading && <div className="mb-4 text-gray-500">Loading...</div>}
        <div style={{ width: 350, marginBottom: 32 }}>
          <h2
            style={{
              color: '#2563eb',
              fontWeight: 600,
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Business Info
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>
              Business Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </div>
        </div>
        <div style={{ width: 350, marginBottom: 32 }}>
          <h2
            style={{
              color: '#2563eb',
              fontWeight: 600,
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Contact
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </div>
        </div>
        <div style={{ width: 350, marginBottom: 32 }}>
          <h2
            style={{
              color: '#2563eb',
              fontWeight: 600,
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Business Logo
          </h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            style={{ width: '100%', marginBottom: 8 }}
          />
        </div>
        {logoPreview && (
          <Image
            src={logoPreview}
            alt="Logo Preview"
            width={64}
            height={64}
            className="h-16 my-2 object-contain"
          />
        )}
        <div className="flex gap-2 mt-4 justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center disabled:opacity-50"
            disabled={!isChanged || saving}
            style={{
              width: 200,
              height: 48,
              background: 'linear-gradient(to right, #2563eb, #3b82f6)',
              color: 'white',
              fontSize: 20,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
            }}
          >
            {saving && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            )}
            Save Changes
          </button>
          <button
            type="button"
            style={{
              width: 200,
              height: 48,
              background: 'linear-gradient(to right, #2563eb, #3b82f6)',
              color: 'white',
              fontSize: 20,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
            }}
            onClick={handleReset}
            disabled={saving || !isChanged}
          >
            Reset
          </button>
        </div>
        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Save</h3>
              <p>
                Are you sure you want to save these changes to your business
                settings?
              </p>
              <div
                className="flex justify-center gap-4 mt-6 border-t pt-4"
                style={{ minWidth: 320, width: '100%' }}
              >
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-medium"
                  onClick={() => setShowConfirm(false)}
                  disabled={saving}
                  style={{ minWidth: 100 }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded font-semibold"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    minWidth: 100,
                    background: '#2563eb',
                    color: 'white',
                    border: '2px solid #1d4ed8',
                    fontSize: 18,
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
                  }}
                >
                  {saving ? 'Saving...' : 'Yes, Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </RequireAuth>
  );
}

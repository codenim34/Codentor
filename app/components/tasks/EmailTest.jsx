"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiMail, FiSend, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function EmailTest() {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/tasks/email-status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking email status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);

    try {
      const response = await fetch('/api/tasks/test-email', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`✅ ${data.message}\n\nCheck your inbox!`, {
          duration: 5000,
        });
      } else {
        toast.error(`❌ ${data.error || 'Failed to send test email'}\n\nCheck your .env.local configuration.`, {
          duration: 7000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Failed to send test email. Check console for details.', {
        duration: 5000,
      });
    } finally {
      setTesting(false);
    }
  };

  if (checking) {
    return (
      <div className="bg-gray-800/50 border border-gray-500/30 rounded-lg p-4 animate-pulse">
        <div className="h-20"></div>
      </div>
    );
  }

  const isConfigured = status?.config?.configured;

  return (
    <div className={`border rounded-lg p-4 ${
      isConfigured 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-yellow-500/10 border-yellow-500/30'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isConfigured ? 'bg-green-500/20' : 'bg-yellow-500/20'
        }`}>
          {isConfigured ? (
            <FiCheckCircle className="text-green-400" size={20} />
          ) : (
            <FiAlertCircle className="text-yellow-400" size={20} />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
            Email Configuration
            {isConfigured && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">✓ Ready</span>}
          </h4>
          
          {!isConfigured ? (
            <div className="text-sm text-yellow-300 mb-3">
              <p className="mb-2">⚠️ Email is not configured yet.</p>
              <p className="text-xs text-gray-400">
                Missing: <span className="font-mono text-yellow-400">{status?.config?.missing?.join(', ')}</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Add these to your <span className="font-mono">.env.local</span> file and restart the server.
              </p>
            </div>
          ) : (
            <div className="text-sm mb-3">
              <p className="text-gray-400 mb-1">✅ SMTP configured and ready</p>
              <p className="text-xs text-gray-500">
                Host: {status?.config?.host} | User: {status?.config?.user}
              </p>
            </div>
          )}

          <button
            onClick={handleTestEmail}
            disabled={testing || !isConfigured}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isConfigured
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            title={!isConfigured ? 'Configure email settings first' : 'Send test email'}
          >
            <FiSend size={16} />
            {testing ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>
    </div>
  );
}


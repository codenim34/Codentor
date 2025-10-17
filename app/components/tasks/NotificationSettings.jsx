"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiBell, FiMail, FiSmartphone, FiCheck, FiX } from "react-icons/fi";
import EmailTest from "./EmailTest";

export default function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPushSupport();
    checkPushSubscription();
  }, []);

  const checkPushSupport = () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
    }
    setLoading(false);
  };

  const checkPushSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushEnabled(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const enablePushNotifications = async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        toast.error('Push notifications not configured on server');
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Push notifications enabled!');
        setPushEnabled(true);
      } else {
        toast.error('Failed to enable push notifications');
      }

    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast.error('Failed to enable push notifications');
    }
  };

  const disablePushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from server
        await fetch(`/api/notifications/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE',
        });
      }

      toast.success('Push notifications disabled');
      setPushEnabled(false);

    } catch (error) {
      console.error('Error disabling push notifications:', error);
      toast.error('Failed to disable push notifications');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FiBell className="text-emerald-400" size={24} />
        <h3 className="text-xl font-bold text-white">Notification Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Email Test */}
        <EmailTest />

        {/* Email Notifications */}
        <div className="bg-gray-900/50 border border-emerald-500/10 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <FiMail className="text-emerald-400" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Email Notifications</h4>
              <p className="text-sm text-gray-400 mb-3">
                Receive task reminders via email
              </p>
              <div className="flex items-center gap-2">
                <FiCheck className="text-green-400" size={16} />
                <span className="text-sm text-green-400">Enabled by default</span>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-gray-900/50 border border-emerald-500/10 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              pushEnabled ? 'bg-emerald-500/20' : 'bg-gray-700'
            }`}>
              <FiSmartphone className={pushEnabled ? 'text-emerald-400' : 'text-gray-400'} size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Browser Push Notifications</h4>
              <p className="text-sm text-gray-400 mb-3">
                Get instant alerts in your browser
              </p>
              {pushSupported ? (
                <button
                  onClick={pushEnabled ? disablePushNotifications : enablePushNotifications}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    pushEnabled
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {pushEnabled ? (
                    <>
                      <FiX size={16} />
                      Disable
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} />
                      Enable
                    </>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-500">Not supported in your browser</p>
              )}
            </div>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-gray-900/50 border border-emerald-500/10 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <FiBell className="text-emerald-400" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">In-App Notifications</h4>
              <p className="text-sm text-gray-400 mb-3">
                See notifications in the app's notification center
              </p>
              <div className="flex items-center gap-2">
                <FiCheck className="text-green-400" size={16} />
                <span className="text-sm text-green-400">Always enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Schedule Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-semibold mb-2">📅 Reminder Schedule</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 24 hours before task is due</li>
          <li>• 1 hour before task is due</li>
        </ul>
      </div>
    </div>
  );
}


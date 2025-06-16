import React from 'react';
import { WifiOff, Clock, HardDrive, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline, cacheStatus, refreshCacheStatus } = useOfflineStatus();

  // Don't show banner if online
  if (isOnline) {
    return null;
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const getCacheUsagePercentage = (): number => {
    if (!cacheStatus) return 0;
    return (cacheStatus.cacheSize / cacheStatus.maxSize) * 100;
  };

  return (
    <div className="bg-warning-50 border-b border-warning-200 px-space-6 py-space-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-space-3">
          <div className="flex items-center space-x-space-2">
            <WifiOff className="w-5 h-5 text-warning-600" />
            <span className="font-weight-medium text-warning-800">
              You are offline
            </span>
          </div>
          
          {cacheStatus && (
            <div className="flex items-center space-x-space-4 text-scale-sm text-warning-700">
              <div className="flex items-center space-x-space-1">
                <Clock className="w-4 h-4" />
                <span>Last sync: {formatLastSync(cacheStatus.lastSync)}</span>
              </div>
              
              <div className="flex items-center space-x-space-1">
                <HardDrive className="w-4 h-4" />
                <span>
                  Cache: {formatBytes(cacheStatus.cacheSize)} / {formatBytes(cacheStatus.maxSize)}
                  ({getCacheUsagePercentage().toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-space-3">
          {cacheStatus && (
            <div className="w-24 bg-warning-200 rounded-full h-2">
              <div 
                className="bg-warning-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCacheUsagePercentage()}%` }}
              />
            </div>
          )}
          
          <button
            onClick={refreshCacheStatus}
            className="flex items-center space-x-space-1 text-scale-sm text-warning-700 hover:text-warning-800 transition-colors"
            title="Refresh cache status"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      <div className="mt-space-2 text-scale-sm text-warning-600">
        You can still access previously visited modules and downloaded content while offline.
      </div>
    </div>
  );
};
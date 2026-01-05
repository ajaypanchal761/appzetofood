import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api/config';

/**
 * Hook for delivery boys to share their location in real-time
 * @param {string} orderId - Order ID to track
 * @param {boolean} enabled - Whether location sharing is enabled
 * @returns {object} - { isSharing, startSharing, stopSharing, error }
 */
export const useLocationSharing = (orderId, enabled = false) => {
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const isSharingRef = useRef(false);

  const backendUrl = API_BASE_URL.replace('/api', '');

  const startSharing = () => {
    if (!orderId) {
      console.error('Order ID is required for location sharing');
      return;
    }

    if (isSharingRef.current) {
      console.log('Location sharing already active');
      return;
    }

    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected for location sharing');
        socketRef.current.emit('join-delivery', orderId);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });
    }

    // Start watching position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading } = position.coords;

          // Send location update via socket
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('update-location', {
              orderId,
              lat: latitude,
              lng: longitude,
              heading: heading || 0 // heading may not be available on all devices
            });

            console.log(`📍 Location sent:`, { lat: latitude, lng: longitude, heading });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Handle different error types
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error('User denied geolocation permission');
              break;
            case error.POSITION_UNAVAILABLE:
              console.error('Location information unavailable');
              break;
            case error.TIMEOUT:
              console.error('Location request timed out');
              break;
            default:
              console.error('Unknown geolocation error');
          }
        },
        {
          enableHighAccuracy: true, // Force GPS for accuracy
          maximumAge: 0, // No cache, always get fresh location
          timeout: 5000 // 5 seconds timeout
        }
      );

      isSharingRef.current = true;
      console.log('✅ Location sharing started');
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  };

  const stopSharing = () => {
    // Stop geolocation watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('📍 Geolocation watch stopped');
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log('🔌 Socket disconnected');
    }

    isSharingRef.current = false;
  };

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && orderId) {
      startSharing();
    } else {
      stopSharing();
    }

    return () => {
      stopSharing();
    };
  }, [enabled, orderId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, []);

  return {
    isSharing: isSharingRef.current,
    startSharing,
    stopSharing
  };
};

export default useLocationSharing;


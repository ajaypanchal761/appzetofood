import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api/config';
import { restaurantAPI } from '@/lib/api';
import alertSound from '@/assets/audio/alert.mp3';

/**
 * Hook for restaurant to receive real-time order notifications with sound
 * @returns {object} - { newOrder, playSound, isConnected }
 */
export const useRestaurantNotifications = () => {
  const socketRef = useRef(null);
  const [newOrder, setNewOrder] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef(null);
  const [restaurantId, setRestaurantId] = useState(null);

  // Get restaurant ID from API
  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        const response = await restaurantAPI.getCurrentRestaurant();
        if (response.data?.success && response.data.data?.restaurant) {
          const restaurant = response.data.data.restaurant;
          const id = restaurant._id?.toString() || restaurant.restaurantId;
          setRestaurantId(id);
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    };
    fetchRestaurantId();
  }, []);

  useEffect(() => {
    if (!restaurantId) {
      console.log('⏳ Waiting for restaurantId...');
      return;
    }

    // Normalize backend URL - fix any URL issues first, then remove /api suffix
    let backendUrl = API_BASE_URL;
    
    // Fix malformed protocol patterns first (before removing /api)
    // - https:/ becomes https://
    // - https: becomes https://
    backendUrl = backendUrl.replace(/^(https?):\/?(?=\/|$)/i, (match, protocol) => {
      return `${protocol}://`;
    });
    
    // Fix duplicate protocols (https://https:// becomes https://)
    backendUrl = backendUrl.replace(/^(https?:\/\/)+(https?:\/\/)+/gi, (match) => {
      const protocol = match.match(/^(https?):\/\//i)?.[1] || 'https';
      return `${protocol}://`;
    });
    
    // Fix patterns like https://https:// or http://http://
    backendUrl = backendUrl.replace(/^(https?:\/\/)(https?:\/\/)/i, '$1');
    
    // Fix multiple slashes after protocol (https:/// becomes https://)
    backendUrl = backendUrl.replace(/(https?:\/\/)\/+/g, '$1');
    
    // Remove /api suffix
    backendUrl = backendUrl.replace(/\/api\/?$/, ''); // Remove trailing /api
    backendUrl = backendUrl.replace(/\/+$/, ''); // Remove trailing slashes
    
    // Final protocol fix in case removing /api broke something
    backendUrl = backendUrl.replace(/^(https?):\/?(?=\/)/i, (match, protocol) => {
      return `${protocol}://`;
    });
    
    // Validate backend URL format
    if (!backendUrl || !backendUrl.startsWith('http')) {
      console.error('❌ CRITICAL: Invalid backend URL format:', backendUrl);
      console.error('💡 API_BASE_URL:', API_BASE_URL);
      console.error('💡 Expected format: https://your-domain.com or http://localhost:5000');
      return; // Don't try to connect with invalid URL
    }
    
    // Construct Socket.IO URL
    const socketUrl = `${backendUrl}/restaurant`;
    
    // Validate socket URL format
    try {
      new URL(socketUrl); // This will throw if URL is invalid
    } catch (urlError) {
      console.error('❌ CRITICAL: Invalid Socket.IO URL:', socketUrl);
      console.error('💡 URL validation error:', urlError.message);
      console.error('💡 Backend URL:', backendUrl);
      console.error('💡 API_BASE_URL:', API_BASE_URL);
      return; // Don't try to connect with invalid URL
    }
    
    console.log('🔌 Attempting to connect to Socket.IO:', socketUrl);
    console.log('🔌 Backend URL:', backendUrl);
    console.log('🔌 API_BASE_URL:', API_BASE_URL);
    console.log('🔌 Restaurant ID:', restaurantId);
    console.log('🔌 Environment:', import.meta.env.MODE);
    
    // Warn if trying to connect to localhost in production
    if (import.meta.env.MODE === 'production' && backendUrl.includes('localhost')) {
      console.error('❌ CRITICAL: Trying to connect Socket.IO to localhost in production!');
      console.error('💡 This means VITE_API_BASE_URL was not set during build time');
      console.error('💡 Current socketUrl:', socketUrl);
      console.error('💡 Current API_BASE_URL:', API_BASE_URL);
      console.error('💡 Fix: Rebuild frontend with: VITE_API_BASE_URL=https://your-backend-domain.com/api npm run build');
      console.error('💡 Note: Vite environment variables are embedded at BUILD TIME, not runtime');
      console.error('💡 You must rebuild and redeploy the frontend with correct VITE_API_BASE_URL');
      
      // Don't try to connect to localhost in production - it will fail
      setIsConnected(false);
      return;
    }

    // Initialize socket connection to restaurant namespace
    // Use polling first as it's more reliable, websocket will upgrade automatically
    socketRef.current = io(socketUrl, {
      path: '/socket.io/', // Explicitly set Socket.IO path
      transports: ['polling'], // Start with polling only - more reliable
      upgrade: false, // Disable WebSocket upgrade to prevent WebSocket connection errors
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      auth: {
        token: localStorage.getItem('restaurant_accessToken') || localStorage.getItem('accessToken')
      },
      // Add query parameters if needed
      query: {
        transport: 'polling'
      }
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Restaurant Socket connected, restaurantId:', restaurantId);
      console.log('✅ Socket ID:', socketRef.current.id);
      console.log('✅ Socket URL:', socketUrl);
      setIsConnected(true);
      
      // Join restaurant room immediately after connection with retry
      if (restaurantId) {
        const joinRoom = () => {
          console.log('📢 Joining restaurant room with ID:', restaurantId);
          socketRef.current.emit('join-restaurant', restaurantId);
          
          // Retry join after 2 seconds if no confirmation received
          setTimeout(() => {
            if (socketRef.current?.connected) {
              console.log('🔄 Retrying restaurant room join...');
              socketRef.current.emit('join-restaurant', restaurantId);
            }
          }, 2000);
        };
        
        joinRoom();
      } else {
        console.warn('⚠️ Cannot join restaurant room: restaurantId is missing');
      }
    });

    // Listen for room join confirmation
    socketRef.current.on('restaurant-room-joined', (data) => {
      console.log('✅ Restaurant room joined successfully:', data);
      console.log('✅ Room:', data?.room);
      console.log('✅ Restaurant ID in room:', data?.restaurantId);
    });

    // Listen for connection errors
    socketRef.current.on('connect_error', (error) => {
      // Always log connection errors on production to debug issues
      console.error('❌ Restaurant Socket connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        type: error.type,
        description: error.description,
        socketUrl: socketUrl,
        backendUrl: backendUrl,
        restaurantId: restaurantId
      });
      
      // Check if error is due to CORS or wrong URL
      if (error.message?.includes('CORS') || error.message?.includes('Not allowed')) {
        console.error('🚫 CORS Error: Socket.IO connection blocked by CORS');
        console.error('💡 Fix: Add frontend URL to CORS_ORIGIN in backend .env');
      }
      
      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Failed to fetch')) {
        console.error('🚫 Connection Refused: Backend server not reachable at:', socketUrl);
        console.error('💡 Fix: Check API_BASE_URL is set correctly for production');
      }
      
      setIsConnected(false);
    });

    // Listen for disconnection
    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Restaurant Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, reconnect manually
        socketRef.current.connect();
      }
    });

    // Listen for reconnection attempts
    socketRef.current.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Listen for successful reconnection
    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      
      // Rejoin restaurant room after reconnection
      if (restaurantId) {
        socketRef.current.emit('join-restaurant', restaurantId);
      }
    });

    // Listen for new order notifications
    socketRef.current.on('new_order', (orderData) => {
      console.log('📦 New order received:', orderData);
      setNewOrder(orderData);
      
      // Play notification sound
      playNotificationSound();
    });

    // Listen for sound notification event
    socketRef.current.on('play_notification_sound', (data) => {
      console.log('🔔 Sound notification:', data);
      playNotificationSound();
    });

    // Listen for order status updates
    socketRef.current.on('order_status_update', (data) => {
      console.log('📊 Order status update:', data);
      // You can handle status updates here if needed
    });

    // Load notification sound
    audioRef.current = new Audio(alertSound);
    audioRef.current.volume = 0.7;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [restaurantId]);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.warn('Error playing notification sound:', error);
        });
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };

  const clearNewOrder = () => {
    setNewOrder(null);
  };

  return {
    newOrder,
    clearNewOrder,
    isConnected,
    playNotificationSound
  };
};


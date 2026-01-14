import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api/config';
import { deliveryAPI } from '@/lib/api';
import alertSound from '@/assets/audio/alert.mp3';

export const useDeliveryNotifications = () => {
  const socketRef = useRef(null);
  const [newOrder, setNewOrder] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef(null);
  const [deliveryPartnerId, setDeliveryPartnerId] = useState(null);

  useEffect(() => {
    const fetchDeliveryPartnerId = async () => {
      try {
        // Try to get delivery partner ID from API
        const response = await deliveryAPI.getCurrentDelivery();
        if (response.data?.success && response.data.data?.deliveryPartner) {
          const deliveryPartner = response.data.data.deliveryPartner;
          const id = deliveryPartner._id?.toString() || deliveryPartner.deliveryId;
          setDeliveryPartnerId(id);
          console.log('✅ Delivery Partner ID fetched:', id);
        } else {
          console.warn('⚠️ Could not fetch delivery partner ID from API');
        }
      } catch (error) {
        console.error('Error fetching delivery partner:', error);
      }
    };
    fetchDeliveryPartnerId();
  }, []);

  useEffect(() => {
    if (!deliveryPartnerId) {
      console.log('⏳ Waiting for deliveryPartnerId...');
      return;
    }

    const backendUrl = API_BASE_URL.replace('/api', '');
    const socketUrl = `${backendUrl}/delivery`;
    
    console.log('🔌 Attempting to connect to Delivery Socket.IO:', socketUrl);
    console.log('🔌 Backend URL:', backendUrl);
    console.log('🔌 Delivery Partner ID:', deliveryPartnerId);

    socketRef.current = io(socketUrl, {
      transports: ['polling'], // Start with polling only - more reliable
      upgrade: true, // Allow upgrade to websocket if available
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      auth: {
        token: localStorage.getItem('delivery_accessToken') || localStorage.getItem('accessToken')
      }
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Delivery Socket connected, deliveryPartnerId:', deliveryPartnerId);
      console.log('✅ Socket ID:', socketRef.current.id);
      setIsConnected(true);
      
      if (deliveryPartnerId) {
        console.log('📢 Joining delivery room with ID:', deliveryPartnerId);
        socketRef.current.emit('join-delivery', deliveryPartnerId);
      }
    });

    socketRef.current.on('delivery-room-joined', (data) => {
      console.log('✅ Delivery room joined successfully:', data);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Delivery Socket connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        type: error.type,
        description: error.description
      });
      setIsConnected(false);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Delivery Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        socketRef.current.connect();
      }
    });

    socketRef.current.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      
      if (deliveryPartnerId) {
        socketRef.current.emit('join-delivery', deliveryPartnerId);
      }
    });

    socketRef.current.on('new_order', (orderData) => {
      console.log('📦 New order received:', orderData);
      setNewOrder(orderData);
      playNotificationSound();
    });

    socketRef.current.on('play_notification_sound', (data) => {
      console.log('🔔 Sound notification:', data);
      playNotificationSound();
    });

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
  }, [deliveryPartnerId]);

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


import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import { AGORA_APP_ID, getChannelName } from '../constants/agora';
import livestreamService from '../services/livestreamService';

export default function AgoraBroadcaster({ streamId, isStreaming, onError }) {
  const agoraEngine = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isInitialized && isStreaming && streamId) {
      startBroadcasting();
    } else if (isInitialized && !isStreaming) {
      stopBroadcasting();
    }
  }, [isStreaming, streamId, isInitialized]);

  const initializeAgora = async () => {
    try {
      console.log('📹 Initializing Agora engine...');
      agoraEngine.current = createAgoraRtcEngine();
      
      agoraEngine.current.initialize({
        appId: AGORA_APP_ID,
      });

      agoraEngine.current.registerEventHandler({
        onError: (err, msg) => {
          console.error('❌ Agora error:', err, msg);
          onError?.(msg);
        },
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('✅ Joined Agora channel successfully:', connection.channelId);
        },
        onLeaveChannel: (connection, stats) => {
          console.log('👋 Left Agora channel');
        },
      });

      // Enable video
      agoraEngine.current.enableVideo();
      
      setIsInitialized(true);
      console.log('✅ Agora engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Agora:', error);
      Alert.alert('Error', 'Failed to initialize video streaming');
    }
  };

  const startBroadcasting = async () => {
    try {
      if (!agoraEngine.current || !streamId) {
        console.log('⚠️ Agora engine or streamId not ready');
        return;
      }

      const channelName = getChannelName(streamId);
      console.log('📡 Starting broadcast to channel:', channelName);

      // Set channel profile to live broadcasting
      agoraEngine.current.setChannelProfile(
        ChannelProfileType.ChannelProfileLiveBroadcasting
      );

      // Set client role to broadcaster
      agoraEngine.current.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      // Always use front camera - Agora defaults to front camera
      console.log('📷 Using front camera for broadcasting');

      // Fetch Agora token from backend
      console.log('🔑 Fetching Agora token...');
      const tokenData = await livestreamService.getAgoraToken(channelName, 0);
      
      if (!tokenData || !tokenData.token) {
        throw new Error('Failed to get Agora token from server');
      }
      
      console.log('✅ Token received, joining channel...');

      // Join channel with token
      await agoraEngine.current.joinChannel(tokenData.token, channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

      console.log('✅ Broadcasting started');
    } catch (error) {
      console.error('❌ Failed to start broadcasting:', error);
      Alert.alert('Error', 'Failed to start video broadcast: ' + error.message);
    }
  };

  const stopBroadcasting = async () => {
    try {
      if (agoraEngine.current) {
        await agoraEngine.current.leaveChannel();
        console.log('📴 Broadcasting stopped');
      }
    } catch (error) {
      console.error('❌ Failed to stop broadcasting:', error);
    }
  };

  const cleanup = async () => {
    try {
      if (agoraEngine.current) {
        await agoraEngine.current.leaveChannel();
        agoraEngine.current.release();
        console.log('🧹 Agora engine cleaned up');
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  };

  // This component doesn't render anything visible - the camera is already shown by CameraView
  // Agora runs in the background and broadcasts the video to viewers
  return null;
}

const styles = StyleSheet.create({});

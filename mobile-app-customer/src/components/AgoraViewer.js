import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  VideoSourceType,
} from 'react-native-agora';
import { AGORA_APP_ID, getChannelName } from '../constants/agora';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function AgoraViewer({ streamId, isLive }) {
  const agoraEngine = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isInitialized && isLive && streamId) {
      joinChannel();
    } else if (isInitialized && !isLive) {
      leaveChannel();
    }
  }, [isLive, streamId, isInitialized]);

  const initializeAgora = async () => {
    try {
      console.log('📹 [Viewer] Initializing Agora engine...');
      agoraEngine.current = createAgoraRtcEngine();
      
      agoraEngine.current.initialize({
        appId: AGORA_APP_ID,
      });

      agoraEngine.current.registerEventHandler({
        onError: (err, msg) => {
          console.error('❌ [Viewer] Agora error:', err, msg);
        },
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('✅ [Viewer] Joined channel:', connection.channelId);
          setIsJoined(true);
        },
        onUserJoined: (connection, uid, elapsed) => {
          console.log('👤 [Viewer] Remote user joined:', uid);
          setRemoteUid(uid);
        },
        onUserOffline: (connection, uid, reason) => {
          console.log('👋 [Viewer] Remote user left:', uid);
          setRemoteUid(null);
        },
        onLeaveChannel: (connection, stats) => {
          console.log('👋 [Viewer] Left channel');
          setIsJoined(false);
          setRemoteUid(null);
        },
      });

      // Enable video
      agoraEngine.current.enableVideo();
      
      setIsInitialized(true);
      console.log('✅ [Viewer] Agora engine initialized');
    } catch (error) {
      console.error('❌ [Viewer] Failed to initialize Agora:', error);
    }
  };

  const joinChannel = async () => {
    try {
      if (!agoraEngine.current || !streamId) {
        console.log('⚠️ [Viewer] Engine or streamId not ready');
        return;
      }

      const channelName = getChannelName(streamId);
      console.log('📡 [Viewer] Joining channel:', channelName);

      // Fetch Agora token from backend
      console.log('🔑 [Viewer] Fetching Agora token...');
      const tokenResponse = await api.post('/livestreams/agora/token', {
        channelName,
        uid: 0, // Viewer uses uid 0
      });
      const { token } = tokenResponse.data;
      console.log('✅ [Viewer] Got Agora token');

      // Set channel profile to live broadcasting
      agoraEngine.current.setChannelProfile(
        ChannelProfileType.ChannelProfileLiveBroadcasting
      );

      // Set client role to audience
      agoraEngine.current.setClientRole(ClientRoleType.ClientRoleAudience);

      // Join channel with token
      await agoraEngine.current.joinChannel(token, channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleAudience,
      });

      console.log('✅ [Viewer] Joined as audience');
    } catch (error) {
      console.error('❌ [Viewer] Failed to join channel:', error);
    }
  };

  const leaveChannel = async () => {
    try {
      if (agoraEngine.current && isJoined) {
        await agoraEngine.current.leaveChannel();
        setRemoteUid(null);
        console.log('📴 [Viewer] Left channel');
      }
    } catch (error) {
      console.error('❌ [Viewer] Failed to leave channel:', error);
    }
  };

  const cleanup = async () => {
    try {
      if (agoraEngine.current) {
        await agoraEngine.current.leaveChannel();
        agoraEngine.current.release();
        console.log('🧹 [Viewer] Agora engine cleaned up');
      }
    } catch (error) {
      console.error('❌ [Viewer] Cleanup error:', error);
    }
  };

  // Show remote video if broadcaster is streaming
  if (isLive && remoteUid) {
    return (
      <View style={styles.container}>
        <RtcSurfaceView
          canvas={{
            uid: remoteUid,
            sourceType: VideoSourceType.VideoSourceRemote,
          }}
          style={styles.videoView}
        />
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
    );
  }

  // Show connecting message if live but no video yet
  if (isLive && isJoined) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📡 Connecting to stream...</Text>
      </View>
    );
  }

  // Show placeholder when not live
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderIcon}>🎥</Text>
      <Text style={styles.placeholderText}>No Active Stream</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: width * (9 / 16), // 16:9 aspect ratio
    backgroundColor: '#000',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: width,
    height: width * (9 / 16),
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  liveIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

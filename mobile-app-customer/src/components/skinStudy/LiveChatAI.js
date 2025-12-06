import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { Audio } from 'expo-av';
import { liveChatService, liveChatStorage } from '../../services/skinStudy/api';

const { width, height } = Dimensions.get('window');

// Modern Pink Color Palette
const colors = {
  primary50: '#FDFBF7',
  primary100: '#FDF6F0',
  primary200: '#F8EAE1',
  primary300: '#F0D7CC',
  primary400: '#E4BCC0',
  primary500: '#C97F98',
  primary600: '#A44A6B',
  primary700: '#8C3154',
  primary800: '#7F2548',
  primary900: '#671C39',
  primary950: '#3E0E21'
};

const LiveChatAI = ({ navigation, route }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [aiResponseText, setAiResponseText] = useState('');
  const wordDisplayInterval = useRef(null);
  const scrollViewRef = useRef(null);

  // Add logging whenever conversationHistory changes
  useEffect(() => {
    console.log('📝 [LiveChatAI] conversationHistory updated:', conversationHistory.length, 'messages');
    if (conversationHistory.length > 0) {
      // console.log('📋 [LiveChatAI] First message:', conversationHistory[0]);
      // console.log('📋 [LiveChatAI] Last message:', conversationHistory[conversationHistory.length - 1]);
    }
  }, [conversationHistory]);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('🔄 [LiveChatAI] Component mounted');
    console.log('📋 [LiveChatAI] Route params:', route?.params);

    // Load session from route params if available
    if (route?.params?.loadSession) {
      const session = route.params.loadSession;
      console.log('📥 [LiveChatAI] Loading session from route params');
      setConversationHistory(session.messages);
      setSessionId(session.id);
      setTranscribedText('');
      navigation.setParams({ loadSession: undefined });
    } else {
      const newSessionId = `live-${Date.now()}`;
      setSessionId(newSessionId);
      console.log('🆕 [LiveChatAI] New session created:', newSessionId);
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      
      playbackControlRef.current.shouldContinue = false;
      
      if (playbackControlRef.current.currentSound) {
        playbackControlRef.current.currentSound.stopAsync().catch(console.error);
        playbackControlRef.current.currentSound.unloadAsync().catch(console.error);
      }
      
      if (currentSound) {
        currentSound.stopAsync().catch(console.error);
        currentSound.unloadAsync().catch(console.error);
      }
      
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
      }
    };
  }, []);

  // Watch for route params changes
  useEffect(() => {
    console.log('🔄 [LiveChatAI] Route params changed');
    console.log('📋 [LiveChatAI] New route params:', route?.params);

    if (route?.params?.loadSession) {
      const session = route.params.loadSession;
      console.log('📥 [LiveChatAI] Loading NEW session from updated params');
      console.log('📋 [LiveChatAI] Session ID:', session.id);
      console.log('📋 [LiveChatAI] Session messages count:', session.messages?.length);
      setConversationHistory(session.messages);
      setSessionId(session.id);
      console.log('✅ [LiveChatAI] Session updated successfully');
      navigation.setParams({ loadSession: undefined });
    }
  }, [route?.params?.loadSession]);

  // Start pulsing animation when recording or AI is speaking
  useEffect(() => {
    if (isRecording || isAISpeaking) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording, isAISpeaking]);

  const startRecording = async () => {
    if (isActionInProgress) {
      console.log('⏸️ Action already in progress, skipping...');
      return;
    }

    try {
      setIsActionInProgress(true);
      console.log('🎤 Starting recording...');
      
      // Request audio recording permission first
      console.log('🔐 Requesting audio recording permission...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('🔐 Permission status:', status);
      
      if (status !== 'granted') {
        console.error('❌ Audio recording permission denied');
        Alert.alert(
          'Permission Required',
          'Please allow microphone access in your device settings to use voice chat.',
          [{ text: 'OK' }]
        );
        setIsRecording(false);
        setIsActionInProgress(false);
        return;
      }
      
      console.log('✅ Permission granted, proceeding with recording');
      
      // Set UI state immediately for instant feedback
      setIsRecording(true);
      
      // Stop any ongoing speech
      if (currentSound) {
        console.log('⏹️ Stopping audio...');
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch (e) {
          console.log('Warning: Error stopping audio:', e);
        }
        setCurrentSound(null);
      }
      setIsAISpeaking(false);
      
      // Clean up any existing recording
      if (recording) {
        console.log('⚠️ Cleaning up existing recording...');
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording) {
            await recording.stopAndUnloadAsync();
          }
        } catch (e) {
          console.log('Warning: Error cleaning up recording:', e);
        }
        setRecording(null);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      console.log('✅ Recording started successfully');
      setRecording(newRecording);
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecording(null);
      setIsRecording(false);
      setTranscribedText('');
    } finally {
      setIsActionInProgress(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.log('⚠️ No recording to stop');
      setIsRecording(false);
      return;
    }

    if (isActionInProgress) {
      console.log('⏸️ Action already in progress, skipping stop...');
      return;
    }

    try {
      setIsActionInProgress(true);
      console.log('🛑 Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);
      setTranscribedText('Processing your voice...');

      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        await recording.stopAndUnloadAsync();
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      });

      const uri = recording.getURI();
      console.log('📁 Audio file saved at:', uri);
      
      setRecording(null);

      // Send audio to backend for processing
      await processAudioWithAI(uri);

    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setIsProcessing(false);
      setIsRecording(false);
      setRecording(null);
      Alert.alert('Error', 'Failed to process recording.');
    } finally {
      setIsActionInProgress(false);
    }
  };

  const processAudioWithAI = async (audioUri) => {
    try {
      console.log('🔄 Processing audio from:', audioUri);
      setTranscribedText('Transcribing your voice...');

      // Backend transcription
      const transcriptionResult = await liveChatService.transcribeAudio(audioUri);
      const userMessage = transcriptionResult.transcription;

      if (!userMessage || !userMessage.trim()) {
        throw new Error('Empty transcription');
      }

      console.log('✅ Transcription successful:', userMessage);
      await sendToAI(userMessage.trim());

    } catch (error) {
      console.error('❌ Error processing audio:', error);
      setIsProcessing(false);
      setTranscribedText('Transcription failed. Tap to try again.');
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
    }
  };

  const startPulseAnimation = () => {
    // Main pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();

    // Wave animations with stagger
    const createWaveAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true
          })
        ])
      );
    };

    Animated.parallel([
      createWaveAnimation(waveAnim1, 0),
      createWaveAnimation(waveAnim2, 500),
      createWaveAnimation(waveAnim3, 1000)
    ]).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1);
    waveAnim1.setValue(0);
    waveAnim2.setValue(0);
    waveAnim3.setValue(0);
  };

  const sendToAI = async (userMessage) => {
    try {
      console.log('📝 User message:', userMessage);
      setTranscribedText(`You: ${userMessage}`);

      // Add to conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
      setConversationHistory(newHistory);

      // Get AI response from backend
      console.log('🤖 Sending to AI...');
      const response = await liveChatService.chat(userMessage, newHistory);
      console.log('✅ AI response received:', response.response.substring(0, 100) + '...');

      // Extract detected language from response
      const detectedLanguage = response._performance?.detectedLanguage;
      if (detectedLanguage) {
        console.log('🌍 Detected language:', detectedLanguage);
      }

      setIsProcessing(false);

      // Add AI response to history with detected language
      const fullHistory = [
        ...newHistory,
        { role: 'assistant', content: response.response, detectedLanguage }
      ];
      setConversationHistory(fullHistory);

      // Speak the AI response with detected language
      await speakAIResponse(response.response, detectedLanguage);

    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      setIsProcessing(false);
      setTranscribedText('Sorry, there was an error. Tap to try again.');
      Alert.alert('Error', 'Failed to get AI response');
    }
  };

  // Clean text for speech - remove markdown formatting and citations
  const cleanTextForSpeech = (text) => {
    if (!text) return '';
    
    console.log('\n🔧 [cleanTextForSpeech] ORIGINAL TEXT:');
    console.log(text);
    console.log('\n📏 [cleanTextForSpeech] Original length:', text.length);
    
    let cleanText = text;
    
    // Remove source citations like [1], [2], [3], [1,2], [1-3], [10], etc.
    cleanText = cleanText.replace(/\[\d+(?:[,\-]\d+)*\]/g, '');
    
    // Remove markdown headers (###, ##, #)
    cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
    
    // Remove markdown bold/italic markers (**, *, __)
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1'); // **bold**
    cleanText = cleanText.replace(/\*([^*]+)\*/g, '$1'); // *italic*
    cleanText = cleanText.replace(/__([^_]+)__/g, '$1'); // __bold__
    cleanText = cleanText.replace(/_([^_]+)_/g, '$1'); // _italic_
    
    // Remove bullet points and list markers
    cleanText = cleanText.replace(/^[\*\-•]\s+/gm, '');
    cleanText = cleanText.replace(/^\d+\.\s+/gm, '');
    
    console.log('\n📝 [cleanTextForSpeech] After removing formatting:');
    console.log(cleanText);
    
    // CRITICAL FIX: Handle punctuation to create natural pauses for gTTS
    
    // 1. Handle line breaks first - convert to periods for section breaks
    cleanText = cleanText.replace(/\n\n+/g, '.\n'); // Double newlines become period + single newline
    cleanText = cleanText.replace(/\n/g, '. '); // Remaining newlines become periods with space
    
    // 2. Replace colons with periods for clear pauses (headers/labels)
    cleanText = cleanText.replace(/:/g, '.');
    
    // 3. Replace semicolons with periods
    cleanText = cleanText.replace(/;/g, '.');
    
    // 4. Clean up multiple periods
    cleanText = cleanText.replace(/\.{3,}/g, '...'); // preserve ellipsis
    cleanText = cleanText.replace(/\.{2}(?!\.)/g, '.'); // remove double periods
    
    // 5. Ensure proper spacing after punctuation
    cleanText = cleanText.replace(/([.,!?])(?!\s)/g, '$1 ');
    
    // 6. Clean up multiple spaces
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    // 7. Final cleanup
    cleanText = cleanText.replace(/\.\s+\./g, '.'); // ". ." becomes "."
    cleanText = cleanText.replace(/,\s*\./g, '.'); // ", ." becomes "."
    
    console.log('\n✅ [cleanTextForSpeech] FINAL CLEANED TEXT:');
    console.log(cleanText);
    console.log('\n📏 [cleanTextForSpeech] Final length:', cleanText.length);
    console.log('\n' + '='.repeat(80) + '\n');
    
    return cleanText;
  };

  // Split text into sentences for faster TTS streaming
  // CRITICAL: gTTS internally splits at ~200 chars, breaking mid-sentence
  // Solution: Split at EVERY sentence boundary to give gTTS one sentence at a time
  const splitIntoSentences = (text) => {
    if (!text) return [];
    
    console.log('\n📐 [splitIntoSentences] Starting to split text...');
    
    // Clean the text first
    const cleanedText = cleanTextForSpeech(text);
    
    // Protect common abbreviations
    let protectedText = cleanedText
      .replace(/\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr)\./gi, '$1<PERIOD>')
      .replace(/\b(etc|vs|e\.g|i\.e|approx|min|max|no|dept|Fig|vol|pp|ed)\./gi, '$1<PERIOD>')
      .replace(/(\d+)\.(\d+)/g, '$1<PERIOD>$2')
      .replace(/\.\.\./g, '<ELLIPSIS>');
    
    // Split at EVERY period, exclamation, or question mark
    const sentences = protectedText.split(/([.!?]+)\s+/);
    
    let segments = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const part = sentences[i];
      if (!part || !part.trim()) continue;
      
      const isPunctuation = /^[.!?]+$/.test(part);
      
      if (!isPunctuation) {
        const nextPart = sentences[i + 1];
        const hasPunctuation = nextPart && /^[.!?]+$/.test(nextPart);
        
        let sentence = part.trim();
        if (hasPunctuation) {
          sentence += nextPart;
          i++;
        }
        
        if (sentence) {
          segments.push(sentence);
        }
      }
    }
    
    if (segments.length === 0) {
      segments = [protectedText];
    }
    
    // Restore protected characters
    segments = segments.map(s => 
      s.replace(/<PERIOD>/g, '.')
       .replace(/<ELLIPSIS>/g, '...')
       .trim()
    ).filter(s => s.length > 0);
    
    console.log(`\n✅ [splitIntoSentences] Split into ${segments.length} sentences`);
    segments.forEach((seg, idx) => {
      console.log(`   [${idx + 1}] ${seg.length} chars: "${seg.substring(0, 60)}${seg.length > 60 ? '...' : ''}"`);
    });
    
    return segments;
  };

  // Use ref to track if playback should continue
  const playbackControlRef = useRef({ 
    shouldContinue: false, 
    currentSound: null 
  });

  // Helper function to map language names to language codes
  // Supports 50+ languages with fallback for unmapped languages
  const mapLanguageNameToCode = (languageName) => {
    if (!languageName) return null;
    
    // Comprehensive language map (50+ common languages)
    const languageMap = {
      // Major languages
      'English': 'en',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Italian': 'it',
      'Portuguese': 'pt',
      'Russian': 'ru',
      'Chinese': 'zh',
      'Japanese': 'ja',
      'Korean': 'ko',
      
      // Asian languages
      'Vietnamese': 'vi',
      'Thai': 'th',
      'Indonesian': 'id',
      'Malay': 'ms',
      'Tagalog': 'tl',
      'Filipino': 'tl',
      'Hindi': 'hi',
      'Bengali': 'bn',
      'Tamil': 'ta',
      'Telugu': 'te',
      'Urdu': 'ur',
      'Burmese': 'my',
      'Khmer': 'km',
      'Lao': 'lo',
      
      // European languages
      'Dutch': 'nl',
      'Polish': 'pl',
      'Swedish': 'sv',
      'Norwegian': 'no',
      'Danish': 'da',
      'Finnish': 'fi',
      'Greek': 'el',
      'Turkish': 'tr',
      'Czech': 'cs',
      'Hungarian': 'hu',
      'Romanian': 'ro',
      'Ukrainian': 'uk',
      'Bulgarian': 'bg',
      'Croatian': 'hr',
      'Serbian': 'sr',
      'Slovak': 'sk',
      
      // Other major languages
      'Arabic': 'ar',
      'Hebrew': 'he',
      'Persian': 'fa',
      'Swahili': 'sw',
      'Afrikaans': 'af'
    };
    
    // Try exact match first
    if (languageMap[languageName]) {
      return languageMap[languageName];
    }
    
    // Fallback: Try to convert language name to ISO code
    // e.g., "Icelandic" -> "is", "Latvian" -> "lv"
    // This handles unmapped languages gracefully
    const lowerName = languageName.toLowerCase();
    
    // Common patterns for language codes
    const fallbackMap = {
      'icelandic': 'is',
      'latvian': 'lv',
      'lithuanian': 'lt',
      'estonian': 'et',
      'slovenian': 'sl',
      'albanian': 'sq',
      'macedonian': 'mk',
      'bosnian': 'bs',
      'catalan': 'ca',
      'basque': 'eu',
      'galician': 'gl',
      'maltese': 'mt',
      'welsh': 'cy',
      'irish': 'ga',
      'nepali': 'ne',
      'sinhala': 'si',
      'mongolian': 'mn',
      'armenian': 'hy',
      'georgian': 'ka',
      'kazakh': 'kk',
      'uzbek': 'uz',
      'azerbaijani': 'az'
    };
    
    return fallbackMap[lowerName] || null;
  };

  const speakAIResponse = async (text, detectedLanguage = null) => {
    try {
      console.log('🔊 Speaking AI response with streaming...');
      console.log('📝 Text length:', text.length);
      
      // Get language code for TTS
      const languageCode = mapLanguageNameToCode(detectedLanguage);
      if (languageCode) {
        console.log('🌍 Using detected language:', detectedLanguage, '→', languageCode);
      } else {
        console.log('🌍 No language detected, will auto-detect');
      }
      
      // Stop any currently playing audio first
      playbackControlRef.current.shouldContinue = false;
      
      if (playbackControlRef.current.currentSound) {
        console.log('⏹️ Stopping previous audio...');
        try {
          await playbackControlRef.current.currentSound.stopAsync();
          await playbackControlRef.current.currentSound.unloadAsync();
        } catch (e) {
          console.log('Warning: Error stopping previous audio:', e);
        }
        playbackControlRef.current.currentSound = null;
      }
      
      if (currentSound) {
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch (e) {
          console.log('Sound already stopped');
        }
        setCurrentSound(null);
      }
      
      // Clear any existing word display interval
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
        wordDisplayInterval.current = null;
      }
      
      // Store the full AI response
      setAiResponseText(text);
      
      // Split into sentences for streaming playback
      const sentences = splitIntoSentences(text);
      console.log('📄 Split into', sentences.length, 'sentences');
      
      // Set playback control
      playbackControlRef.current.shouldContinue = true;
      setIsAISpeaking(true);
      
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false
      });

      let displayedText = '';

      // Play sentences sequentially with streaming
      for (let i = 0; i < sentences.length; i++) {
        // Check if user stopped playback
        if (!playbackControlRef.current.shouldContinue) {
          console.log('⏹️ Playback stopped by user');
          break;
        }

        console.log(`🔊 Playing sentence ${i + 1}/${sentences.length}`);
        
        // Request TTS from backend for this sentence with detected language
        const ttsResponse = await liveChatService.textToSpeech(sentences[i], languageCode);
        
        console.log(`✅ Sentence ${i + 1} audio received`);

        // Check again if user stopped during the request
        if (!playbackControlRef.current.shouldContinue) {
          console.log('⏹️ Playback stopped during request');
          break;
        }

        // Update displayed text progressively
        displayedText += (displayedText ? ' ' : '') + sentences[i];
        setTranscribedText(displayedText);
        
        // Auto-scroll to bottom
        if (scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }

        // Create and play sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/mp3;base64,${ttsResponse.audio}` },
          { shouldPlay: true }
        );

        // Store in both state and ref for immediate access
        setCurrentSound(sound);
        playbackControlRef.current.currentSound = sound;
        console.log(`▶️ Playing sentence ${i + 1}/${sentences.length}`);

        // Wait for this sentence to finish before playing the next one
        await new Promise((resolve) => {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              resolve();
            }
            if (status.error) {
              console.error('❌ Playback error:', status.error);
              resolve();
            }
          });
        });

        // Clean up this sound before loading the next one
        await sound.unloadAsync();
        playbackControlRef.current.currentSound = null;
        setCurrentSound(null);
      }

      console.log('✅ All sentences completed');
      playbackControlRef.current.shouldContinue = false;
      playbackControlRef.current.currentSound = null;
      
      // Show complete text briefly before clearing
      setTranscribedText(text);
      
      setTimeout(() => {
        setIsAISpeaking(false);
        setTranscribedText('Tap to speak');
        setAiResponseText('');
        // Reset action flag to allow new recordings
        setIsActionInProgress(false);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error in speakAIResponse:', error);
      playbackControlRef.current.shouldContinue = false;
      playbackControlRef.current.currentSound = null;
      setIsAISpeaking(false);
      setTranscribedText('Speech error: ' + error.message);
      setCurrentSound(null);
      setAiResponseText('');
      // Reset action flag on error
      setIsActionInProgress(false);
      
      // Clear interval on error
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
        wordDisplayInterval.current = null;
      }
    }
  };
  
  const handleMicPress = async () => {
    console.log('👆 Mic button pressed');
    console.log('📊 Current state - isRecording:', isRecording, 'isProcessing:', isProcessing, 'isAISpeaking:', isAISpeaking, 'isActionInProgress:', isActionInProgress);
    
    // Prevent rapid tapping
    if (isActionInProgress) {
      console.log('⏸️ Action in progress, ignoring press');
      return;
    }
    
    if (isProcessing) {
      console.log('⏸️ Currently processing, ignoring press');
      return;
    }
    
    if (isAISpeaking) {
      // Stop AI speaking if tapped during speech
      console.log('⏹️ Stopping AI speech...');
      playbackControlRef.current.shouldContinue = false;
      
      // Clear word display interval
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
        wordDisplayInterval.current = null;
      }
      
      // Stop audio using ref for immediate access
      if (playbackControlRef.current.currentSound) {
        try {
          await playbackControlRef.current.currentSound.stopAsync();
          await playbackControlRef.current.currentSound.unloadAsync();
          console.log('✅ Audio stopped via ref');
        } catch (e) {
          console.log('Warning: Error stopping audio via ref:', e);
        }
        playbackControlRef.current.currentSound = null;
      }
      
      // Also stop via state for safety
      if (currentSound) {
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
          console.log('✅ Audio stopped via state');
        } catch (e) {
          console.log('Warning: Error stopping audio via state:', e);
        }
        setCurrentSound(null);
      }
      
      // Reset action flag to allow new recordings
      setIsActionInProgress(false);
      
      setIsAISpeaking(false);
      setTranscribedText('');
      setAiResponseText('');
      return;
    }

    if (isRecording) {
      console.log('⏹️ Stopping recording...');
      await stopRecording();
    } else {
      console.log('▶️ Starting recording...');
      await startRecording();
    }
  };

  const generateSessionTitle = (messages) => {
    if (messages.length === 0) return 'New Live Chat';
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    return 'Live Chat Session';
  };

  const generateSessionPreview = (messages) => {
    if (messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.substring(0, 80);
    return preview + (lastMessage.content.length > 80 ? '...' : '');
  };

  const saveSessionToHistory = async () => {
    if (conversationHistory.length === 0) {
      console.log('⚠️ [LiveChatAI] No messages to save');
      return;
    }

    try {
      const sessionData = {
        id: sessionId,
        type: 'live',
        title: generateSessionTitle(conversationHistory),
        preview: generateSessionPreview(conversationHistory),
        timestamp: new Date().toISOString(),
        messages: conversationHistory,
        messageCount: conversationHistory.length
      };

      await liveChatStorage.saveSession(sessionId, sessionData);
      console.log('💾 [LiveChatAI] Session saved to history:', sessionId, 'with', conversationHistory.length, 'messages');
    } catch (error) {
      console.error('❌ [LiveChatAI] Failed to save session:', error);
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this live chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            console.log('🔚 Ending session...');
            
            // Save conversation to history before ending
            await saveSessionToHistory();
            
            // Stop recording if active
            if (recording) {
              try {
                await recording.stopAndUnloadAsync();
              } catch (e) {
                console.log('Warning: Error stopping recording on exit:', e);
              }
            }
            
            // Clear word display interval
            if (wordDisplayInterval.current) {
              clearInterval(wordDisplayInterval.current);
              wordDisplayInterval.current = null;
            }
            
            // Stop audio playback
            playbackControlRef.current.shouldContinue = false;
            
            if (playbackControlRef.current.currentSound) {
              try {
                await playbackControlRef.current.currentSound.stopAsync();
                await playbackControlRef.current.currentSound.unloadAsync();
              } catch (e) {
                console.log('Warning: Error stopping audio via ref on exit:', e);
              }
              playbackControlRef.current.currentSound = null;
            }
            
            if (currentSound) {
              try {
                await currentSound.stopAsync();
                await currentSound.unloadAsync();
              } catch (e) {
                console.log('Warning: Error stopping audio on exit:', e);
              }
            }
            
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Beautiful Gradient Background */}
      <View style={styles.gradientBackground}>
        <View style={[styles.gradientCircle, styles.gradient1]} />
        <View style={[styles.gradientCircle, styles.gradient2]} />
        <View style={[styles.gradientCircle, styles.gradient3]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.liveIndicator} />
          <Text style={styles.headerTitle}>Live Chat</Text>
        </View>
      </View>

      {/* Animated Wave Background */}
      <View style={styles.waveContainer}>
        <Animated.View
          style={[
            styles.wave,
            styles.wave1,
            {
              opacity: waveAnim1,
              transform: [
                {
                  scale: waveAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.5]
                  })
                }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave2,
            {
              opacity: waveAnim2.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6]
              }),
              transform: [
                {
                  scale: waveAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.8]
                  })
                }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave3,
            {
              opacity: waveAnim3.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4]
              }),
              transform: [
                {
                  scale: waveAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2]
                  })
                }
              ]
            }
          ]}
        />
      </View>

      {/* Transcription Text - Only show when there's text */}
      {transcribedText ? (
        <View style={styles.textContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.transcriptionText}>{transcribedText}</Text>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.textContainer} />
      )}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Video Button (placeholder) */}
        <TouchableOpacity style={styles.controlButton} disabled>
          <Text style={styles.controlIcon}>📹</Text>
        </TouchableOpacity>

        {/* Upload Button (placeholder) */}
        <TouchableOpacity style={styles.controlButton} disabled>
          <Text style={styles.controlIcon}>⬆️</Text>
        </TouchableOpacity>

        {/* Pause/Resume Button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={async () => {
            if (isAISpeaking) {
              console.log('⏸️ Pause button pressed - stopping audio...');
              playbackControlRef.current.shouldContinue = false;
              
              // Clear word display interval
              if (wordDisplayInterval.current) {
                clearInterval(wordDisplayInterval.current);
                wordDisplayInterval.current = null;
              }
              
              // Stop audio using ref
              if (playbackControlRef.current.currentSound) {
                try {
                  await playbackControlRef.current.currentSound.stopAsync();
                  await playbackControlRef.current.currentSound.unloadAsync();
                  console.log('✅ Audio stopped via ref');
                } catch (e) {
                  console.log('Warning: Error stopping audio via ref:', e);
                }
                playbackControlRef.current.currentSound = null;
              }
              
              // Also stop via state
              if (currentSound) {
                try {
                  await currentSound.stopAsync();
                  await currentSound.unloadAsync();
                } catch (e) {
                  console.log('Sound already stopped');
                }
                setCurrentSound(null);
              }
              
              // Reset action flag to allow new recordings
              setIsActionInProgress(false);
              
              setIsAISpeaking(false);
              setAiResponseText('');
            }
          }}
          disabled={!isAISpeaking}
        >
          <Text style={styles.controlIcon}>⏸️</Text>
        </TouchableOpacity>
        
        {/* End Session Button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.endButton]}
          onPress={handleEndSession}
        >
          <Text style={styles.controlIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Main Recording Button */}
      <TouchableOpacity
        style={styles.micButtonContainer}
        onPress={handleMicPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.micButton,
            {
              transform: [{ scale: pulseAnim }]
            },
            isRecording && styles.micButtonRecording,
            isAISpeaking && styles.micButtonSpeaking
          ]}
        >
          <Text style={styles.micIcon}>
            {isProcessing ? '⏳' : isRecording ? '🎤' : isAISpeaking ? '🔊' : '🎤'}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Status Text */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isRecording
            ? 'Listening...'
            : isProcessing
              ? 'Processing...'
              : isAISpeaking
                ? 'AI is speaking'
                : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  gradientCircle: {
    position: 'absolute',
    borderRadius: 1000
  },
  gradient1: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: 'rgba(243, 176, 250, 0.15)',
    left: width * 0.2 - (width * 0.6),
    bottom: -width * 0.4,
    opacity: 0.6
  },
  gradient2: {
    width: width * 1.1,
    height: width * 1.1,
    backgroundColor: 'rgba(230, 120, 249, 0.12)',
    right: width * 0.2 - (width * 0.55),
    top: -width * 0.3,
    opacity: 0.5
  },
  gradient3: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: 'rgba(252, 248, 252, 0.2)',
    left: width * 0.4 - (width * 0.4),
    top: height * 0.4 - (width * 0.4),
    opacity: 0.4
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(253, 246, 240, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary200,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  liveIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary600,
    shadowColor: colors.primary600,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary800
  },
  waveContainer: {
    position: 'absolute',
    width: width,
    height: height * 0.6,
    top: height * 0.2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  wave: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4
  },
  wave1: {
    backgroundColor: colors.primary300,
    opacity: 0.4
  },
  wave2: {
    backgroundColor: colors.primary400,
    opacity: 0.3
  },
  wave3: {
    backgroundColor: colors.primary500,
    opacity: 0.2
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
    width: '100%'
  },
  scrollView: {
    flex: 1,
    width: '100%',
    maxHeight: height * 0.4
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  transcriptionText: {
    fontSize: 16,
    color: colors.primary900,
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: 'rgba(253, 246, 240, 0.95)',
    padding: 20,
    borderRadius: 24,
    width: width * 0.8,
    elevation: 3,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  historyCount: {
    fontSize: 12,
    color: colors.primary700,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: width * 0.8,
    marginBottom: 40
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary300,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  controlIcon: {
    fontSize: 24
  },
  micButtonContainer: {
    marginBottom: 20
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary300
  },
  micButtonRecording: {
    backgroundColor: colors.primary600,
    borderColor: colors.primary700
  },
  micButtonSpeaking: {
    backgroundColor: colors.primary500,
    borderColor: colors.primary600
  },
  micIcon: {
    fontSize: 36
  },
  statusContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20
  },
  statusText: {
    fontSize: 14,
    color: colors.primary700,
    textAlign: 'center',
    fontWeight: '500'
  }
});

export default LiveChatAI;

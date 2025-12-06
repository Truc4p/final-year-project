import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  useWindowDimensions
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Audio } from 'expo-av';
import { aiDermatologyExpertService, chatStorage, liveChatStorage, liveChatService } from '../../services/skinStudy/api';
import { styles, colors } from './AIDermatologyExpert.styles';
import ChatHistory from './ChatHistory';

// API base URL - Using Wrencos Backend (Port 3000)
// For iOS Simulator: http://localhost:3000
// For Android Emulator: http://10.0.2.2:3000
// For Physical Device: http://YOUR_IP:3000
const API_BASE_URL = 'http://localhost:3000';

// Memoized Message Component to prevent unnecessary re-renders
const MessageComponent = memo(({ 
  message, 
  index, 
  contentWidth, 
  userTagsStyles, 
  assistantTagsStyles, 
  convertMarkdownToHtml,
  formatTime,
  handleSpeak,
  isThisMessageSpeaking
}) => {
  const html = useMemo(() => convertMarkdownToHtml(message.content), [message.content, convertMarkdownToHtml]);
  
  return (
    <View
      style={[
        styles.message,
        message.role === 'user' ? styles.messageUser : styles.messageAssistant
      ]}
    >
      <View style={[
        styles.messageContent,
        message.role === 'user' ? styles.messageContentUser : styles.messageContentAssistant
      ]}>
        <RenderHtml
          contentWidth={contentWidth}
          source={{ html }}
          tagsStyles={message.role === 'user' ? userTagsStyles : assistantTagsStyles}
          baseStyle={message.role === 'user' ? { color: '#FFFFFF' } : { color: colors.gray800 }}
        />
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            message.role === 'user' && styles.messageTimeUser
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {/* Voice Button for Assistant Messages */}
          {message.role === 'assistant' && (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isThisMessageSpeaking && styles.voiceButtonActive
              ]}
              onPress={() => handleSpeak(index)}
            >
              <Text style={styles.voiceButtonIcon}>
                {isThisMessageSpeaking ? '⏸' : '🔊'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if these specific props change
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.isThisMessageSpeaking === nextProps.isThisMessageSpeaking &&
    prevProps.contentWidth === nextProps.contentWidth
  );
});

const AIDermatologyExpert = ({ navigation }) => {
  const { width } = useWindowDimensions();
  // Memoize the content width to prevent frequent re-renders
  const contentWidth = useMemo(() => width * 0.8, [width]);
  
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [sound, setSound] = useState(null);
  const scrollViewRef = useRef(null);

  // Log component mount and navigation availability
  useEffect(() => {
    console.log('🔄 [AIDermatologyExpert] Component mounted');
    console.log('🧭 [AIDermatologyExpert] Navigation available on mount:', !!navigation);
    // console.log('🧭 [AIDermatologyExpert] Navigation object:', navigation);
  }, []);

  // Add logging whenever messages change
  useEffect(() => {
    console.log('📝 [AIDermatologyExpert] messages updated:', messages.length, 'messages');
    if (messages.length > 0) {
      // console.log('📋 [AIDermatologyExpert] First message:', messages[0]);
      // console.log('📋 [AIDermatologyExpert] Last message:', messages[messages.length - 1]);
    }
  }, [messages]);

  const sampleQuestions = [
    "What's a good routine for oily skin?",
    "How do I reduce wrinkles naturally?",
    "What ingredients should I avoid for sensitive skin?",
    "Can you recommend products for acne-prone skin?",
    "How often should I exfoliate?"
  ];

  // Memoized tag styles for RenderHtml to prevent unnecessary re-renders
  const userTagsStyles = useMemo(() => ({
    p: {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      margin: 0,
      marginBottom: 8
    },
    strong: {
      fontWeight: '600',
      color: '#FFFFFF'
    },
    h1: {
      fontSize: 20,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 12,
      marginBottom: 8
    },
    h2: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 12,
      marginBottom: 8
    },
    h3: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 10,
      marginBottom: 6
    },
    h4: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 8,
      marginBottom: 4
    },
    ul: {
      marginTop: 8,
      marginBottom: 8,
      paddingLeft: 20
    },
    ol: {
      marginTop: 8,
      marginBottom: 8,
      paddingLeft: 20
    },
    li: {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      marginBottom: 4
    },
    'ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      marginBottom: 4
    },
    'ul ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      marginBottom: 4
    }
  }), []);

  const assistantTagsStyles = useMemo(() => ({
    body: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800
    },
    p: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      margin: 0,
      marginBottom: 8
    },
    strong: {
      fontWeight: '600',
      color: colors.primary800
    },
    h1: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 12,
      marginBottom: 8
    },
    h2: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 12,
      marginBottom: 8
    },
    h3: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 10,
      marginBottom: 6
    },
    h4: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 8,
      marginBottom: 4
    },
    ul: {
      marginTop: 8,
      marginBottom: 8,
      lineHeight: 24,
      paddingLeft: 20
    },
    ol: {
      marginTop: 8,
      marginBottom: 8,
      paddingLeft: 20
    },
    li: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      marginBottom: 4
    },
    'ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      marginBottom: 4
    },
    'ul ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      marginBottom: 4
    }
  }), []);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  const loadChatHistory = async () => {
    const history = await chatStorage.loadChatHistory();
    setMessages(history);
  };

  const saveChatHistory = async () => {
    await chatStorage.saveChatHistory(messages);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending user message:', userMessage.content);
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    Keyboard.dismiss();

    setIsLoading(true);

    try {
      await getAIResponse(userMessage.content);
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, messages]);

  const getAIResponse = useCallback(async (userMessage) => {
    try {
      console.log('🔍 Preparing API request...');
      console.log('📚 User query:', userMessage);
      console.log('📝 Conversation history (last 10 messages):', messages.slice(-10));

      const response = await aiDermatologyExpertService.chat(
        userMessage,
        messages.slice(-10)
      );

      console.log('✅ Received API response:', response);
      console.log('💡 AI Response:', response.response);

      if (response.sources) {
        console.log('📖 Sources used:', response.sources);
      }

      // Extract detected language from performance data
      const detectedLanguage = response._performance?.detectedLanguage;
      if (detectedLanguage) {
        console.log('🌍 Detected language:', detectedLanguage);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        detectedLanguage: detectedLanguage, // Store for TTS
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('❌ Error calling AI API:', error);
      console.error('❌ Error details:', error.response?.data || error.message);

      // Fallback to local response if API fails
      console.log('⚠️ Falling back to local response');
      const fallbackResponse = generateContextualResponse(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponse + '\n\n*Note: Using offline knowledge base. For best results, ensure backend is running.*',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [messages]);

  const generateContextualResponse = (message) => {
    console.log('🔄 Generating contextual fallback response for:', message);
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('routine') && lowerMessage.includes('oily')) {
      console.log('✅ Matched pattern: oily skin routine');
      return `For oily skin, I recommend a balanced routine:

**Morning:**
1. Gentle foaming cleanser
2. Toner with salicylic acid or niacinamide
3. Lightweight, oil-free moisturizer
4. Broad-spectrum SPF 30+

**Evening:**
1. Oil-based cleanser (double cleanse)
2. Gentle foaming cleanser
3. Treatment (like BHA or retinol)
4. Lightweight moisturizer

**Key ingredients to look for:**
- Niacinamide (reduces oil production)
- Salicylic acid (unclogs pores)
- Hyaluronic acid (hydration without oil)

Would you like product recommendations or have questions about specific products?`;
    }

    if (lowerMessage.includes('wrinkle') || lowerMessage.includes('anti-aging')) {
      console.log('✅ Matched pattern: wrinkles/anti-aging');
      return `To reduce wrinkles naturally and effectively:

**Top Recommendations:**
1. **Retinol/Retinoids** - The gold standard for anti-aging
2. **Vitamin C** - Antioxidant protection and collagen production
3. **Peptides** - Support skin structure and firmness
4. **Sunscreen** - Daily SPF 30+ is crucial!

**Natural approaches:**
- Stay hydrated (drink water)
- Get adequate sleep (7-9 hours)
- Facial massage to improve circulation
- Antioxidant-rich diet
- Avoid smoking and excess alcohol

**Gentle exfoliation** with AHAs (glycolic, lactic acid) can also help improve skin texture.

Start slowly with active ingredients and build tolerance. Would you like specific product recommendations?`;
    }

    if (lowerMessage.includes('sensitive skin') || lowerMessage.includes('avoid')) {
      console.log('✅ Matched pattern: sensitive skin');
      return `For sensitive skin, **avoid these common irritants:**

**❌ Ingredients to avoid:**
- Fragrance (parfum)
- Denatured alcohol
- Essential oils
- Harsh sulfates (SLS)
- High-concentration acids
- Physical exfoliants

**✅ Look for instead:**
- Ceramides
- Centella Asiatica
- Colloidal oatmeal
- Hyaluronic acid
- Niacinamide (low %)
- Squalane

**Tips:**
- Patch test new products
- Introduce one product at a time
- Choose fragrance-free formulas
- Use lukewarm water (not hot)

What specific concerns do you have with your sensitive skin?`;
    }

    if (lowerMessage.includes('acne') || lowerMessage.includes('breakout')) {
      console.log('✅ Matched pattern: acne/breakouts');
      return `For acne-prone skin, here's my recommendation:

**Key Ingredients:**
1. **Salicylic Acid (BHA)** - Unclogs pores, 2% is ideal
2. **Benzoyl Peroxide** - Kills acne bacteria
3. **Niacinamide** - Reduces inflammation and oil
4. **Retinoids** - Prevents clogged pores

**Product Types:**
- Gentle, non-comedogenic cleanser
- BHA toner or treatment
- Lightweight, oil-free moisturizer
- Spot treatment for active breakouts
- Always use SPF!

**Important tips:**
- Don't over-dry your skin
- Be patient (6-8 weeks for results)
- Avoid touching your face
- Change pillowcases regularly
- Consider seeing a dermatologist for persistent acne concerns

Would you like specific product recommendations or have questions about acne scarring?`;
    }

    if (lowerMessage.includes('exfoliate') || lowerMessage.includes('exfoliation')) {
      console.log('✅ Matched pattern: exfoliation');
      return `**Exfoliation Guidelines:**

**How often:**
- **Normal skin:** 2-3 times per week
- **Oily/resilient skin:** 3-4 times per week
- **Dry/sensitive skin:** 1-2 times per week
- **Mature skin:** 2-3 times per week (gentle)

**Types of exfoliation:**

**Chemical (preferred):**
- AHAs (glycolic, lactic) - for surface/dry skin
- BHAs (salicylic) - for oily/acne-prone skin
- PHAs - gentlest option for sensitive skin

**Physical:**
- Use very gentle options
- Avoid harsh scrubs with large particles

**Important rules:**
- Don't combine with retinoids on same night
- Always follow with moisturizer
- Use SPF during the day
- Less is more - don't over-exfoliate!

**Signs of over-exfoliation:**
- Redness, irritation
- Increased sensitivity
- Tight, dry feeling

What's your skin type? I can give you more specific recommendations!`;
    }

    // Generic response
    console.log('No specific pattern matched, using generic response');
    return `Thank you for your question! As a virtual dermatology expert, I'm here to help with skincare, cosmetic, and facial improvement advice.

To provide you with the most accurate and personalized recommendation, could you tell me more about:

- Your skin type (oily, dry, combination, sensitive)?
- Your main skin concerns?
- Any products you're currently using?
- Any allergies or sensitivities?

This will help me give you better tailored advice. You can also ask me about:
- Specific ingredients
- Product recommendations
- Skincare routines
- Treatment options
- Facial improvement techniques

What would you like to know more about?`;
  };

  // Convert markdown to HTML - memoized version
  const convertMarkdownToHtml = useMemo(() => (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Convert headers (must be done before other conversions)
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Convert bold text (before lists to handle bold in list items)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert unordered lists with nested support (support *, -, and • bullet points)
    // Support up to 3 levels: parent (0 spaces), child (2-4 spaces), grandchild (4-8 spaces)
    html = html.replace(/(?:^[\*\-•] .+$\n?(?:^ {2,8}[\*\-•] .+$\n?)*)+/gm, (match) => {
      const lines = match.trim().split('\n').filter(line => line.trim());
      let result = '<ul>';
      let nestedLevel = 0; // Track nesting level
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const level1Match = line.match(/^ {2,4}[\*\-•] /);
        const level2Match = line.match(/^ {5,8}[\*\-•] /);
        
        let currentLevel = 0;
        let content = '';
        
        if (level2Match) {
          // Grandchild (level 2)
          currentLevel = 2;
          content = line.replace(/^ {5,8}[\*\-•] (.+)$/, '$1').trim();
        } else if (level1Match) {
          // Child (level 1)
          currentLevel = 1;
          content = line.replace(/^ {2,4}[\*\-•] (.+)$/, '$1').trim();
        } else {
          // Parent (level 0)
          currentLevel = 0;
          content = line.replace(/^[\*\-•] (.+)$/, '$1').trim();
        }
        
        // Open nested lists if going deeper
        while (nestedLevel < currentLevel) {
          result += '<ul>';
          nestedLevel++;
        }
        
        // Close nested lists if going shallower
        while (nestedLevel > currentLevel) {
          result += '</ul></li>';
          nestedLevel--;
        }
        
        // Add the list item
        result += `<li>${content}`;
        
        // Check if next line is at a deeper level
        const nextLine = i < lines.length - 1 ? lines[i + 1] : null;
        if (nextLine) {
          const nextLevel1 = nextLine.match(/^ {2,4}[\*\-•] /);
          const nextLevel2 = nextLine.match(/^ {5,8}[\*\-•] /);
          const nextLevel = nextLevel2 ? 2 : (nextLevel1 ? 1 : 0);
          
          if (nextLevel <= currentLevel) {
            result += '</li>';
          }
        } else {
          result += '</li>';
        }
      }
      
      // Close all remaining nested lists
      while (nestedLevel > 0) {
        result += '</ul></li>';
        nestedLevel--;
      }
      
      result += '</ul>';
      return result;
    });

    // Convert numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Split by double line breaks to identify paragraphs
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      
      // Don't wrap if it's already a block element
      if (block.match(/^<(h[1-6]|ul|ol|li)/)) {
        return block;
      }
      
      // Wrap in paragraph and convert single line breaks to <br/>
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
  }, []);

  const askSampleQuestion = useCallback((question) => {
    setUserInput(question);
    // Auto-send after a brief delay to show the question was selected
    setTimeout(() => {
      sendMessage();
    }, 100);
  }, [sendMessage]);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const startNewChat = () => {
    Alert.alert(
      'Start New Chat',
      'Current conversation will be saved. Start a new chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start New',
          onPress: async () => {
            setMessages([]);
            setUserInput('');
            await chatStorage.clearChatHistory();
          }
        }
      ]
    );
  };

  const handleLoadSession = (session) => {
    console.log('🔍 [AIDermatologyExpert] handleLoadSession called');
    console.log('📋 [AIDermatologyExpert] Session type:', session.type);
    console.log('📋 [AIDermatologyExpert] Session messages:', session.messages?.length);
    
    if (session.type === 'text') {
      // Load text chat
      console.log('💬 [AIDermatologyExpert] Loading text chat session');
      // console.log('📝 [AIDermatologyExpert] Setting messages:', session.messages);
      setMessages(session.messages);
      console.log('✅ [AIDermatologyExpert] Messages set successfully');
    } else if (session.type === 'live') {
      // Navigate to LiveChatAI and load live chat session
      console.log('🎤 [AIDermatologyExpert] Loading live chat session, navigating...');
      navigation.navigate('LiveChatAI', { loadSession: session });
    }
  };

  // Helper function to strip HTML and markdown for speech
  const stripFormattingForSpeech = (text) => {
    if (!text) return '';
    
    console.log('\n🔧 [stripFormattingForSpeech] ORIGINAL TEXT:');
    console.log(text);
    console.log('\n📏 [stripFormattingForSpeech] Original length:', text.length);
    
    // Remove HTML tags
    let cleanText = text.replace(/<[^>]*>/g, ' ');
    
    // Remove markdown bold
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    // Remove markdown headers
    cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
    
    // Remove bullet points and list markers, but preserve line structure
    cleanText = cleanText.replace(/^[\*\-•]\s+/gm, '');
    cleanText = cleanText.replace(/^\d+\.\s+/gm, '');
    
    console.log('\n📝 [stripFormattingForSpeech] After removing formatting:');
    console.log(cleanText);
    
    // CRITICAL FIX: The order of operations matters!
    // We need to handle line breaks BEFORE adding other punctuation
    
    // 1. First, handle line breaks and convert them to periods (for section breaks)
    cleanText = cleanText.replace(/\n\n+/g, '.\n'); // Double newlines become period + single newline
    cleanText = cleanText.replace(/\n/g, '. '); // Remaining newlines become periods with space
    
    // 2. Add periods after reference markers [1], [2] for pauses
    cleanText = cleanText.replace(/(\[\d+(?:,\s*\d+)*\])/g, '$1.');
    
    // 3. Replace colons with periods for clear pauses (headers/labels)
    cleanText = cleanText.replace(/:/g, '.');
    
    // 4. Replace semicolons with periods (they deserve full stops)
    cleanText = cleanText.replace(/;/g, '.');
    
    // 5. Clean up multiple periods BEFORE final spacing
    cleanText = cleanText.replace(/\.{3,}/g, '...'); // preserve ellipsis
    cleanText = cleanText.replace(/\.{2}(?!\.)/g, '.'); // remove double periods
    
    // 6. Ensure proper spacing after ALL punctuation
    cleanText = cleanText.replace(/([.,!?])(?!\s)/g, '$1 ');
    
    // 7. Clean up multiple spaces
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    // 8. Final cleanup: remove any remaining problematic patterns
    cleanText = cleanText.replace(/\.\s+\./g, '.'); // ". ." becomes "."
    cleanText = cleanText.replace(/,\s*\./g, '.'); // ", ." becomes "."
    
    console.log('\n✅ [stripFormattingForSpeech] FINAL CLEANED TEXT:');
    console.log(cleanText);
    console.log('\n📏 [stripFormattingForSpeech] Final length:', cleanText.length);
    console.log('\n' + '='.repeat(80) + '\n');
    
    return cleanText;
  };

  // Split text into sentences for faster TTS playback
  // CRITICAL: gTTS internally splits text at ~200 chars, breaking mid-sentence
  // Solution: Split at EVERY sentence boundary to give gTTS one sentence at a time
  const splitIntoSentences = (text) => {
    if (!text) return [];
    
    console.log('\n📐 [splitIntoSentences] Starting to split text...');
    
    // First, protect common abbreviations by temporarily replacing periods
    let protectedText = text
      // Common titles
      .replace(/\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr)\./gi, '$1<PERIOD>')
      // Common abbreviations  
      .replace(/\b(etc|vs|e\.g|i\.e|approx|min|max|no|dept|Fig|vol|pp|ed)\./gi, '$1<PERIOD>')
      // Decimals - protect periods between numbers
      .replace(/(\d+)\.(\d+)/g, '$1<PERIOD>$2')
      // Ellipsis - treat as one unit
      .replace(/\.\.\./g, '<ELLIPSIS>');
    
    // Split at EVERY period, exclamation, or question mark
    // This ensures each sentence goes to gTTS separately
    const sentences = protectedText.split(/([.!?]+)\s+/);
    
    let segments = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const part = sentences[i];
      if (!part || !part.trim()) continue;
      
      // Check if this is punctuation
      const isPunctuation = /^[.!?]+$/.test(part);
      
      if (!isPunctuation) {
        // It's a sentence - combine with following punctuation if exists
        const nextPart = sentences[i + 1];
        const hasPunctuation = nextPart && /^[.!?]+$/.test(nextPart);
        
        let sentence = part.trim();
        if (hasPunctuation) {
          sentence += nextPart;
          i++; // Skip the punctuation part in next iteration
        }
        
        if (sentence) {
          segments.push(sentence);
        }
      }
    }
    
    // If no segments were found, return the whole text
    if (segments.length === 0) {
      segments = [protectedText];
    }
    
    // Restore protected characters and clean up
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

  // Use ref to track if playback should continue (avoids stale closure issues)
  const playbackControlRef = useRef({ 
    shouldContinue: false, 
    currentMessageIndex: null,
    currentSound: null // Track the current sound object
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

  // Text-to-speech functions using backend gTTS with sentence-by-sentence streaming
  const handleSpeak = useCallback(async (messageIndex) => {
    const message = messages[messageIndex];
    if (!message || message.role !== 'assistant') return;

    try {
      // If already speaking this message, stop it
      if (speakingMessageIndex === messageIndex && isSpeaking) {
        console.log('⏸️ Stopping audio playback');
        playbackControlRef.current.shouldContinue = false;
        
        // Stop the current sound immediately
        if (playbackControlRef.current.currentSound) {
          try {
            await playbackControlRef.current.currentSound.stopAsync();
            await playbackControlRef.current.currentSound.unloadAsync();
          } catch (e) {
            console.log('Sound already stopped');
          }
          playbackControlRef.current.currentSound = null;
        }
        
        if (sound) {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch (e) {
            console.log('Sound already stopped');
          }
          setSound(null);
        }
        
        setSpeakingMessageIndex(null);
        setIsSpeaking(false);
        return;
      }

      // Stop any currently playing audio
      playbackControlRef.current.shouldContinue = false;
      
      if (playbackControlRef.current.currentSound) {
        try {
          await playbackControlRef.current.currentSound.stopAsync();
          await playbackControlRef.current.currentSound.unloadAsync();
        } catch (e) {
          console.log('Sound already stopped');
        }
        playbackControlRef.current.currentSound = null;
      }
      
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {
          console.log('Sound already stopped');
        }
        setSound(null);
      }

      // Clean the text for speech
      let textToSpeak = stripFormattingForSpeech(message.content);
      
      // Check if text is too long
      const MAX_SPEECH_LENGTH = 5000;
      if (textToSpeak.length > MAX_SPEECH_LENGTH) {
        textToSpeak = textToSpeak.substring(0, MAX_SPEECH_LENGTH) + '... Message truncated due to length.';
      }
      
      // Set playback control
      playbackControlRef.current.shouldContinue = true;
      playbackControlRef.current.currentMessageIndex = messageIndex;
      
      setSpeakingMessageIndex(messageIndex);
      setIsSpeaking(true);

      console.log('🔊 [TTS] Starting sentence-by-sentence playback');
      console.log('📝 [TTS] Text length:', textToSpeak.length);

      // Get detected language from message for accurate TTS voice
      const detectedLanguage = message.detectedLanguage;
      const languageCode = mapLanguageNameToCode(detectedLanguage);
      
      if (languageCode) {
        console.log('🌍 [TTS] Using detected language:', detectedLanguage, '→', languageCode);
      } else {
        console.log('🌍 [TTS] No language detected, will auto-detect');
      }

      // Split into sentences for faster initial playback
      const sentences = splitIntoSentences(textToSpeak);
      console.log('\n📄 [TTS] Split into', sentences.length, 'segments/sentences');
      console.log('\n🔍 [TTS] DETAILED SENTENCE BREAKDOWN:');
      sentences.forEach((sentence, idx) => {
        console.log(`\n  [${idx + 1}/${sentences.length}] Length: ${sentence.length} chars`);
        console.log(`  Text: "${sentence}"`);
      });
      console.log('\n' + '='.repeat(80));

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false
      });

      // Play sentences sequentially
      for (let i = 0; i < sentences.length; i++) {
        // Check if user stopped playback using ref
        if (!playbackControlRef.current.shouldContinue || 
            playbackControlRef.current.currentMessageIndex !== messageIndex) {
          console.log('⏹️ [TTS] Playback stopped by user');
          break;
        }

        console.log(`\n🔊 [TTS] ========== REQUESTING SENTENCE ${i + 1}/${sentences.length} ==========`);
        console.log(`📤 [TTS] Sending to backend:`);
        console.log(`   Length: ${sentences[i].length} characters`);
        console.log(`   Language: ${languageCode || 'auto-detect'}`);
        console.log(`   Text: "${sentences[i]}"`);
        
        // Request TTS from backend with detected language
        const response = await liveChatService.textToSpeech(sentences[i], languageCode);
        
        console.log(`✅ [TTS] Sentence ${i + 1} audio received (${response.audio.length} bytes)`);

        // Check again if user stopped during the request
        if (!playbackControlRef.current.shouldContinue || 
            playbackControlRef.current.currentMessageIndex !== messageIndex) {
          console.log('⏹️ [TTS] Playback stopped during request');
          break;
        }

        // Create and play sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: `data:audio/mp3;base64,${response.audio}` },
          { shouldPlay: true }
        );

        // Store in both state and ref for immediate access
        setSound(newSound);
        playbackControlRef.current.currentSound = newSound;
        console.log(`▶️ [TTS] Playing sentence ${i + 1}/${sentences.length}`);

        // Wait for this sentence to finish before playing the next one
        await new Promise((resolve) => {
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              resolve();
            }
            if (status.error) {
              console.error('❌ [TTS] Playback error:', status.error);
              resolve();
            }
          });
        });

        // Clean up this sound before loading the next one
        await newSound.unloadAsync();
        playbackControlRef.current.currentSound = null;
        setSound(null);
      }

      console.log('✅ [TTS] All sentences completed');
      playbackControlRef.current.shouldContinue = false;
      playbackControlRef.current.currentSound = null;
      setSpeakingMessageIndex(null);
      setIsSpeaking(false);

    } catch (error) {
      console.error('❌ [TTS] Error in handleSpeak:', error);
      playbackControlRef.current.shouldContinue = false;
      playbackControlRef.current.currentSound = null;
      setSpeakingMessageIndex(null);
      setIsSpeaking(false);
      
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (e) {
          console.log('Sound cleanup failed');
        }
        setSound(null);
      }
      
      Alert.alert('Error', 'Failed to play the audio. Please ensure the backend is running.');
    }
  }, [messages, speakingMessageIndex, isSpeaking, sound]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        console.log('🧹 [TTS] Cleaning up sound on unmount');
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat History Modal */}
      <ChatHistory
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        onLoadSession={handleLoadSession}
        currentChatType="text"
        navigation={navigation}
      />

      {/* Chat Container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome Section */}
        {messages.length === 0 && (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeHeader}>
                <Text style={styles.welcomeTitle}>AI Dermatology Expert</Text>
                <Text style={styles.welcomeDescription}>Your virtual skincare consultant powered by advanced AI technology</Text>
              </View>

              {/* Important Disclaimer */}
              <View style={styles.welcomeDisclaimer}>
                <Text style={styles.disclaimerTitle}>Important Notice</Text>
                <Text style={styles.disclaimerText}>
                  This AI assistant provides <Text style={styles.disclaimerBold}>educational information and general skincare guidance only</Text>. It does not:
                </Text>
                <View style={styles.disclaimerList}>
                  <Text style={styles.disclaimerListItem}>• Provide medical diagnosis or treatment</Text>
                  <Text style={styles.disclaimerListItem}>• Replace consultation with qualified dermatologists</Text>
                  <Text style={styles.disclaimerListItem}>• Offer emergency medical advice</Text>
                </View>
                <Text style={styles.disclaimerHighlight}>
                  <Text style={styles.disclaimerBold}>Seek immediate medical attention if you experience:</Text> severe pain, rapid changes, signs of infection, severe allergic reactions, or suspicious skin changes.
                </Text>
              </View>

              {/* Sample Questions Section */}
              <View style={styles.sampleQuestionsSection}>
                <Text style={styles.sampleQuestionsTitle}>Explore Sample Topics</Text>
                <Text style={styles.sectionDescription}>Select a category to explore sample questions</Text>

                {/* Category 1 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>1. Fundamentals of Cosmetic Dermatology</Text>
                  <Text style={styles.categoryDescription}>Core principles, skin structure, and classification systems.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What are the different types of chemical peels and how do they work?')}>
                      <Text style={styles.sampleQuestionText}>What are the different types of chemical peels and how do they work?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What is the Fitzpatrick skin type classification and why is it important?')}>
                      <Text style={styles.sampleQuestionText}>What is the Fitzpatrick skin type classification and why is it important?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What is the skin barrier function and why is it important?')}>
                      <Text style={styles.sampleQuestionText}>What is the skin barrier function and why is it important?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 2 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>2. Skincare Science & Active Ingredients</Text>
                  <Text style={styles.categoryDescription}>Focused on ingredients, mechanisms, and interactions.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What ingredients should I look for in an anti-aging serum?')}>
                      <Text style={styles.sampleQuestionText}>What ingredients should I look for in an anti-aging serum?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How does retinol work and what are the best practices for using it?')}>
                      <Text style={styles.sampleQuestionText}>How does retinol work and what are the best practices for using it?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('Can you explain what peptides do in skincare products?')}>
                      <Text style={styles.sampleQuestionText}>Can you explain what peptides do in skincare products?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 3 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>3. Chemical Peels & Exfoliative Procedures</Text>
                  <Text style={styles.categoryDescription}>Mechanisms, preparation, safety, and complications.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How should I prepare my skin before getting a chemical peel?')}>
                      <Text style={styles.sampleQuestionText}>How should I prepare my skin before getting a chemical peel?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What are the potential side effects and complications of chemical peels?')}>
                      <Text style={styles.sampleQuestionText}>What are the potential side effects and complications of chemical peels?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How should I care for my skin after a medium-depth chemical peel?')}>
                      <Text style={styles.sampleQuestionText}>How should I care for my skin after a medium-depth chemical peel?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 4 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>4. Energy-Based and Aesthetic Procedures</Text>
                  <Text style={styles.categoryDescription}>Lasers, radiofrequency, microneedling, fillers, and related techniques.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What types of lasers are used for hair removal and how do they work?')}>
                      <Text style={styles.sampleQuestionText}>What types of lasers are used for hair removal and how do they work?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How does microneedling stimulate collagen production?')}>
                      <Text style={styles.sampleQuestionText}>How does microneedling stimulate collagen production?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What is the difference between Botox and fillers?')}>
                      <Text style={styles.sampleQuestionText}>What is the difference between Botox and fillers?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 5 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>5. Cosmetics, Cosmeceuticals, and Skin Reactions</Text>
                  <Text style={styles.categoryDescription}>Product classification, sensitivities, and ingredient safety.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What is the difference between cosmetics and cosmeceuticals?')}>
                      <Text style={styles.sampleQuestionText}>What is the difference between cosmetics and cosmeceuticals?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How can I identify if I am allergic to a skincare ingredient?')}>
                      <Text style={styles.sampleQuestionText}>How can I identify if I am allergic to a skincare ingredient?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How can I rebuild my damaged skin barrier?')}>
                      <Text style={styles.sampleQuestionText}>How can I rebuild my damaged skin barrier?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 6 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>6. Pathophysiology & Treatment of Skin Conditions</Text>
                  <Text style={styles.categoryDescription}>Acne, rosacea, melasma, dermatitis, pigmentation, and related disorders.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What is a comprehensive treatment plan for rosacea?')}>
                      <Text style={styles.sampleQuestionText}>What is a comprehensive treatment plan for rosacea?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How should melasma be treated in different skin types?')}>
                      <Text style={styles.sampleQuestionText}>How should melasma be treated in different skin types?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What are the best approaches for treating adult acne?')}>
                      <Text style={styles.sampleQuestionText}>What are the best approaches for treating adult acne?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 7 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>7. Holistic & Preventive Dermatology</Text>
                  <Text style={styles.categoryDescription}>Lifestyle, nutrition, environment, and long-term care.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How does lifestyle affect skin aging and appearance?')}>
                      <Text style={styles.sampleQuestionText}>How does lifestyle affect skin aging and appearance?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What role does nutrition play in skin health?')}>
                      <Text style={styles.sampleQuestionText}>What role does nutrition play in skin health?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How can I prevent premature aging of my skin?')}>
                      <Text style={styles.sampleQuestionText}>How can I prevent premature aging of my skin?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 8 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>8. Advanced Science & Mechanisms of Aging</Text>
                  <Text style={styles.categoryDescription}>Cellular and molecular dermatology concepts.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What is the molecular mechanism of collagen degradation in aging skin?')}>
                      <Text style={styles.sampleQuestionText}>What is the molecular mechanism of collagen degradation in aging skin?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('Can you explain the difference between chronological and photoaging?')}>
                      <Text style={styles.sampleQuestionText}>Can you explain the difference between chronological and photoaging?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('What is the role of the skin microbiome in skin health?')}>
                      <Text style={styles.sampleQuestionText}>What is the role of the skin microbiome in skin health?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category 9 */}
                <View style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>9. Clinical Scenarios & Integrated Care</Text>
                  <Text style={styles.categoryDescription}>Case-based, multidisciplinary, and personalized treatment planning.</Text>
                  <View style={styles.questionsList}>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('I have acne scars, hyperpigmentation, and fine lines. What comprehensive treatment approach would you recommend?')}>
                      <Text style={styles.sampleQuestionText}>I have acne scars, hyperpigmentation, and fine lines. What comprehensive treatment approach would you recommend?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('How do I combine professional treatments (like lasers and peels) with at-home skincare?')}>
                      <Text style={styles.sampleQuestionText}>How do I combine professional treatments (like lasers and peels) with at-home skincare?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sampleQuestionBtn} onPress={() => askSampleQuestion('Can you create a complete skincare routine for sensitive, acne-prone skin?')}>
                      <Text style={styles.sampleQuestionText}>Can you create a complete skincare routine for sensitive, acne-prone skin?</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Chat Messages */}
        {messages.map((message, index) => {
          // Create a stable unique key using timestamp and index
          const messageKey = `msg-${message.timestamp || Date.now()}-${index}`;
          // Only pass true if THIS specific message is speaking
          const isThisMessageSpeaking = speakingMessageIndex === index && isSpeaking;
          
          return (
            <MessageComponent
              key={messageKey}
              message={message}
              index={index}
              contentWidth={contentWidth}
              userTagsStyles={userTagsStyles}
              assistantTagsStyles={assistantTagsStyles}
              convertMarkdownToHtml={convertMarkdownToHtml}
              formatTime={formatTime}
              handleSpeak={handleSpeak}
              isThisMessageSpeaking={isThisMessageSpeaking}
            />
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={[styles.message, styles.messageAssistant]}>
            <View style={styles.messageContent}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          {/* Live Chat Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('🎤 [AIDermatologyExpert] Go Live with AI button pressed');
              console.log('🧭 [AIDermatologyExpert] Navigation available:', !!navigation);
              // console.log('🧭 [AIDermatologyExpert] Navigation object:', navigation);
              if (navigation) {
                console.log('✅ [AIDermatologyExpert] Calling navigation.navigate("LiveChatAI")');
                navigation.navigate('LiveChatAI');
                console.log('✅ [AIDermatologyExpert] Navigation called');
              } else {
                console.error('❌ [AIDermatologyExpert] Navigation is undefined!');
              }
            }}
          >
            <Text style={styles.actionButtonText}>Live</Text>
          </TouchableOpacity>

          {/* Chat History Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>

          {/* New Chat Button */}
          {messages.length > 0 && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={startNewChat}
            >
              <Text style={styles.actionButtonText}>New</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me about skincare, cosmetics, or facial improvements..."
            placeholderTextColor="#9ca3af"
            value={userInput}
            onChangeText={setUserInput}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!userInput.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!userInput.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={{ fontSize: 20, color: 'white' }}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AIDermatologyExpert;

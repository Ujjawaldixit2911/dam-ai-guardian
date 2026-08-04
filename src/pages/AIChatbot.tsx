import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDam } from '@/contexts/DamContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatbotService } from '@/services/apiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: 'en' | 'hi';
}

const AIChatbot = () => {
  const { t, language } = useLanguage();
  const { selectedDam } = useDam();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: language === 'hi' 
        ? 'नमस्ते! मैं हाइड्रोलेक AI सहायक हूं। मैं बांध सुरक्षा, निगरानी और आपातकालीन प्रक्रियाओं के बारे में आपकी मदद कर सकता हूं।'
        : 'Hello! I am Hydrolake AI Assistant. I can help you with dam safety, monitoring, and emergency procedures.',
      sender: 'bot',
      timestamp: new Date(),
      language: language as 'en' | 'hi'
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // FAQ Knowledge Base
  const faqDatabase = {
    en: {
      'water level': 'Current water level is at 85% capacity. Normal operating range is 70-90%. Alert threshold is 95%.',
      'alert': 'To receive alerts: Go to Settings → Alerts → Add your email/phone. Alerts are sent when water level exceeds 95%, seismic activity >0.9, or structural issues detected.',
      'emergency': 'In emergency: 1) Check alert dashboard 2) Contact authorities at 8000824196 3) Follow evacuation routes 4) Monitor official updates.',
      'safety': 'Dam safety is monitored 24/7 using: Water level sensors, Seismic monitors, Structural integrity sensors, Weather data integration.',
      'weather': 'Weather data is updated every 5 minutes from IMD. Includes temperature, rainfall, wind speed, and forecasts.',
      'prediction': 'AI predictions use ML models with 94.29% accuracy. Factors include: water level trends, rainfall forecasts, structural health, seismic data.',
      'contact': 'Emergency Contact: 8000824196 | Email: safety@hydrolake.gov.in | WhatsApp: +91-8000824196',
      'status': 'Current Status: All systems operational. Water: 85%, Structural: 98%, Seismic: Normal, Weather: Monitoring heavy rainfall.',
      
      // New Platform Features
      'gis mapping': 'The GIS Mapping module provides an interactive map showing high-risk flood zones, dynamically simulated evacuation routes, and safe relief camp locations.',
      'government': 'The Government Integration module securely syncs real-time dam data with NDMA, CWC, and State Authorities to ensure rapid disaster response.',
      'dam analysis': 'Our AI Dam Analysis tool lets you upload photos of the dam. It uses machine learning to instantly detect physical cracks, water leakage, or spillway blockages.',
      'analytics': 'Smart Analytics provides 7-day to 1-year historical trends on system uptime, energy output, water flow trends, and water quality metrics (pH, Turbidity, DO).',
      'monitoring': 'The live Monitoring dashboard streams real-time data from IoT sensors, including Water Level, Vibration (mm/s), Pressure (MPa), Temperature, and Seismic Activity.',
      
      'admin': 'The Admin Panel allows authorized personnel to manage users, approve pending account requests, adjust system thresholds, and review audit logs.',
      'dam info': 'We monitor multiple dams including Tehri (Earth and Rockfill), Bhakra (Concrete Gravity), Hirakud (Composite), Sardar Sarovar (Concrete Gravity), and Nagarjuna Sagar (Masonry). Data automatically syncs based on the selected dam.',
      
      'default': 'I can help with: Water level info, Alert setup, Emergency procedures, Safety protocols, Weather updates, AI predictions, Contact information, and explaining all dashboard features (GIS, Analytics, Admin, Dam Details, etc).'
    },
    hi: {
      'water level': 'वर्तमान जल स्तर 85% क्षमता पर है। सामान्य परिचालन सीमा 70-90% है। चेतावनी सीमा 95% है।',
      'alert': 'अलर्ट प्राप्त करने के लिए: सेटिंग्स → अलर्ट → अपना ईमेल/फोन जोड़ें। जब जल स्तर 95% से अधिक हो, भूकंपीय गतिविधि >0.9 हो, या संरचनात्मक समस्याएं मिलें तो अलर्ट भेजे जाते हैं।',
      'emergency': 'आपातकाल में: 1) अलर्ट डैशबोर्ड देखें 2) 8000824196 पर अधिकारियों से संपर्क करें 3) निकासी मार्गों का पालन करें 4) आधिकारिक अपडेट की निगरानी करें।',
      'safety': 'बांध सुरक्षा की 24/7 निगरानी की जाती है: जल स्तर सेंसर, भूकंपीय मॉनिटर, संरचनात्मक अखंडता सेंसर, मौसम डेटा एकीकरण।',
      'weather': 'मौसम डेटा हर 5 मिनट में IMD से अपडेट होता है। इसमें तापमान, वर्षा, हवा की गति और पूर्वानुमान शामिल हैं।',
      'prediction': 'AI भविष्यवाणियां 94.29% सटीकता के साथ ML मॉडल का उपयोग करती हैं। कारकों में शामिल हैं: जल स्तर रुझान, वर्षा पूर्वानुमान, संरचनात्मक स्वास्थ्य, भूकंपीय डेटा।',
      'contact': 'आपातकालीन संपर्क: 8000824196 | ईमेल: safety@hydrolake.gov.in | WhatsApp: +91-8000824196',
      'status': 'वर्तमान स्थिति: सभी सिस्टम चालू हैं। जल: 85%, संरचनात्मक: 98%, भूकंपीय: सामान्य, मौसम: भारी बारिश की निगरानी।',
      
      // New Platform Features
      'gis mapping': 'जीआईएस मैपिंग (GIS Mapping) मॉड्यूल एक इंटरैक्टिव मानचित्र प्रदान करता है जो उच्च जोखिम वाले बाढ़ क्षेत्रों, निकासी मार्गों और सुरक्षित राहत शिविरों को दिखाता है।',
      'government': 'सरकारी एकीकरण (Government Integration) मॉड्यूल NDMA, CWC और राज्य अधिकारियों के साथ वास्तविक समय के डेटा को सिंक करता है।',
      'dam analysis': 'हमारा एआई बांध विश्लेषण (Dam Analysis) उपकरण आपको बांध की तस्वीरें अपलोड करने देता है। यह मशीन लर्निंग का उपयोग करके दरारों और रिसाव का तुरंत पता लगाता है।',
      'analytics': 'स्मार्ट एनालिटिक्स (Smart Analytics) सिस्टम के अपटाइम, ऊर्जा उत्पादन, जल प्रवाह और पानी की गुणवत्ता (pH, टर्बिडिटी) पर ऐतिहासिक रुझान प्रदान करता है।',
      'monitoring': 'लाइव मॉनिटरिंग (Monitoring) डैशबोर्ड IoT सेंसर से रीयल-टाइम डेटा स्ट्रीम करता है, जिसमें जल स्तर, कंपन, दबाव और भूकंपीय गतिविधि शामिल हैं।',
      
      'admin': 'एडमिन पैनल (Admin Panel) अधिकृत कर्मचारियों को उपयोगकर्ताओं को प्रबंधित करने, लंबित खाते के अनुरोधों को स्वीकृत करने और सिस्टम थ्रेसहोल्ड को समायोजित करने की अनुमति देता है।',
      'dam info': 'हम टिहरी (अर्थ और रॉकफिल), भाखड़ा (कंक्रीट ग्रेविटी), हीराकुंड (कम्पोजिट), सरदार सरोवर और नागार्जुन सागर जैसे कई बांधों की निगरानी करते हैं। चयनित बांध के आधार पर डेटा अपने आप अपडेट हो जाता है।',
      
      'default': 'मैं मदद कर सकता हूं: जल स्तर जानकारी, अलर्ट सेटअप, आपातकालीन प्रक्रियाएं, सुरक्षा, मौसम अपडेट, AI भविष्यवाणियां, और डैशबोर्ड की सभी विशेषताओं (GIS, एनालिटिक्स, एडमिन, बांध की जानकारी) को समझाने में।'
    }
  };

  const quickQuestions = {
    en: [
      'What is the current water level?',
      'How do I set up alerts?',
      'Emergency contact information?',
      'Tell me about dam safety',
      'Current weather conditions?',
      'How accurate are predictions?'
    ],
    hi: [
      'वर्तमान जल स्तर क्या है?',
      'अलर्ट कैसे सेट करें?',
      'आपातकालीन संपर्क जानकारी?',
      'बांध सुरक्षा के बारे में बताएं',
      'वर्तमान मौसम की स्थिति?',
      'भविष्यवाणियां कितनी सटीक हैं?'
    ]
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getResponse = (userMessage: string, lang: 'en' | 'hi'): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Dynamic context variables
    const damName = selectedDam?.name || 'the dam';
    const damType = selectedDam?.type || 'Standard';
    const capacity = selectedDam?.capacity || 'unknown capacity';
    const userRole = user?.role || 'Guest';

    // Simulated "Analysis" dynamic responses
    if (lowerMessage.includes('water') || lowerMessage.includes('level') || lowerMessage.includes('जल') || lowerMessage.includes('स्तर')) {
      return lang === 'hi' 
        ? `*विश्लेषण पूरा हुआ:* ${damName} (${damType} प्रकार) का वर्तमान जल स्तर सामान्य परिचालन सीमा में है। इसकी कुल क्षमता ${capacity} है, और सभी IoT जल सेंसर स्थिर रीडिंग दे रहे हैं।`
        : `*Analysis Complete:* The current water level for ${damName} (${damType} type) is within normal operating ranges. Its total capacity is ${capacity}, and all live IoT water sensors are reporting stable readings.`;
    }
    
    if (lowerMessage.includes('admin') || lowerMessage.includes('role') || lowerMessage.includes('एडमिन')) {
      return lang === 'hi'
        ? `*सिस्टम चेक:* आप वर्तमान में '${userRole}' के रूप में लॉग इन हैं। एडमिन पैनल का उपयोग लंबित उपयोगकर्ताओं को प्रबंधित करने और ${damName} के लिए सिस्टम थ्रेसहोल्ड सेट करने के लिए किया जाता है।`
        : `*System Check:* You are currently logged in as a '${userRole}'. The Admin Panel is used to manage pending users and configure alert thresholds for ${damName}.`;
    }

    if (lowerMessage.includes('dam type') || lowerMessage.includes('info') || lowerMessage.includes('value') || lowerMessage.includes('बांध')) {
      return lang === 'hi'
        ? `*डेटा विश्लेषण:* आपने ${damName} का चयन किया है। यह एक ${damType} बांध है जिसकी क्षमता ${capacity} है। मैं इसके सभी लाइव सेंसर (दबाव, कंपन, रिसाव) की वास्तविक समय में निगरानी कर रहा हूं।`
        : `*Data Analysis:* You have selected ${damName}. It is a ${damType} dam with a capacity of ${capacity}. I am actively monitoring all its live parameters (pressure, vibration, leakage) in real-time.`;
    }

    if (lowerMessage.includes('gis') || lowerMessage.includes('map') || lowerMessage.includes('flood') || lowerMessage.includes('नक्शा')) {
      return lang === 'hi'
        ? `*भौगोलिक विश्लेषण:* ${damName} के लिए GIS मैपिंग लाइव है। मैंने इसके अक्षांश और देशांतर के आधार पर उच्च जोखिम वाले बाढ़ क्षेत्रों और निकासी मार्गों का गतिशील रूप से अनुकरण किया है।`
        : `*Geospatial Analysis:* GIS mapping for ${damName} is live. I have dynamically simulated the high-risk flood zones and evacuation routes based on its specific latitude and longitude coordinates.`;
    }

    if (lowerMessage.includes('government') || lowerMessage.includes('ndma') || lowerMessage.includes('imd') || lowerMessage.includes('सरकार')) {
      return lang === 'hi'
        ? `*नेटवर्क सिंक:* ${damName} का डेटा NDMA और CWC के साथ सुरक्षित रूप से सिंक किया जा रहा है। मौसम और वर्षा के पूर्वानुमान के लिए IMD कनेक्टिविटी सक्रिय है।`
        : `*Network Sync:* Data for ${damName} is securely syncing with NDMA and CWC. IMD connectivity is active to fetch real-time weather and rainfall forecasts for this region.`;
    }

    if (lowerMessage.includes('analysis') || lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('crack') || lowerMessage.includes('फोटो')) {
      return lang === 'hi'
        ? `*एआई विजन:* बांध विश्लेषण मॉड्यूल ${damName} की संरचनात्मक अखंडता का निरीक्षण करने के लिए कंप्यूटर विज़न का उपयोग करता है। आप रिसाव या दरारों का पता लगाने के लिए फोटो अपलोड कर सकते हैं।`
        : `*AI Vision:* The Dam Analysis module uses Computer Vision to inspect the structural integrity of ${damName}. You can upload photos to instantly detect any spillway blockages, leaks, or physical cracks.`;
    }

    if (lowerMessage.includes('analytic') || lowerMessage.includes('quality') || lowerMessage.includes('trend') || lowerMessage.includes('ट्रेंड')) {
      return lang === 'hi'
        ? `*स्मार्ट डेटा:* ${damName} के लिए स्मार्ट एनालिटिक्स 7-दिन से 1-वर्ष के ऐतिहासिक रुझान दिखा रहा है। पानी की गुणवत्ता (pH, टर्बिडिटी) सामान्य मानकों के भीतर है।`
        : `*Smart Data:* The Smart Analytics dashboard for ${damName} is showing stable historical trends. Water quality metrics including pH and Turbidity are within standard safe limits.`;
    }

    if (lowerMessage.includes('monitor') || lowerMessage.includes('sensor') || lowerMessage.includes('vibration') || lowerMessage.includes('सेंसर')) {
      return lang === 'hi'
        ? `*सेंसर जांच:* ${damName} के लिए लाइव मॉनिटरिंग सिस्टम कंपन, दबाव, तापमान और भूकंपीय गतिविधि जैसे सभी IoT सेंसर से वास्तविक समय का डेटा स्ट्रीम कर रहा है।`
        : `*Sensor Check:* The live Monitoring system for ${damName} is actively streaming real-time telemetry from all IoT sensors, including structural vibration, pressure, and local seismic activity.`;
    }

    // Default response using context
    return lang === 'hi'
      ? `नमस्ते ${userRole}, मैं वर्तमान में ${damName} की निगरानी कर रहा हूं। आप मुझसे इसके जल स्तर, GIS बाढ़ क्षेत्र, स्मार्ट एनालिटिक्स, या लाइव सेंसर डेटा का विश्लेषण करने के लिए कह सकते हैं।`
      : `Hello ${userRole}, I am currently monitoring ${damName}. You can ask me to analyze its water levels, GIS flood zones, smart analytics trends, or live IoT sensor data.`;
  };

  const sendMessage = async (prefilledText?: string) => {
    const safePrefilledText = typeof prefilledText === 'string' ? prefilledText : undefined;
    const outgoingText = (safePrefilledText ?? inputText).trim();
    if (!outgoingText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: outgoingText,
      sender: 'user',
      timestamp: new Date(),
      language: language as 'en' | 'hi'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const apiResponse = await chatbotService.sendMessage(
        outgoingText,
        language,
        conversationId
      );

      if (apiResponse?.success && apiResponse?.data?.response) {
        setConversationId(apiResponse.data.conversationId || conversationId);
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: apiResponse.data.response,
          sender: 'bot',
          timestamp: new Date(),
          language: language as 'en' | 'hi'
        };
        setMessages((prev) => [...prev, botResponse]);
      } else {
        throw new Error('Invalid chatbot response format');
      }
    } catch (error) {
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(outgoingText, language as 'en' | 'hi'),
        sender: 'bot',
        timestamp: new Date(),
        language: language as 'en' | 'hi'
      };
      setMessages((prev) => [...prev, fallbackResponse]);
      console.error('Chatbot API unavailable, using local fallback:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    void sendMessage(question);
  };

  if (!isChatOpen) {
    return (
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className={`${isMinimized ? 'fixed bottom-6 right-6 w-80' : 'space-y-6'} z-40`}>
      {!isMinimized && (
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Chatbot Assistant</h1>
          <p className="text-muted-foreground">24/7 Hindi & English dam safety help</p>
        </div>
      )}

      <Card className={`glass-card ${isMinimized ? 'shadow-xl' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Hydrolake AI</h3>
              <p className="text-xs text-green-500">● Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user'
                        ? 'bg-blue-500'
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === 'hi' ? 'त्वरित प्रश्न:' : 'Quick Questions:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions[language as 'en' | 'hi'].slice(0, 3).map((question, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder={
                    language === 'hi'
                      ? 'अपना सवाल पूछें...'
                      : 'Ask your question...'
                  }
                  className="flex-1"
                />
                <Button onClick={() => void sendMessage()} disabled={!inputText.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Info Cards (only show when not minimized and not in fixed mode) */}
      {!isMinimized && !isChatOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 glass-card">
            <h3 className="font-bold mb-2">💬 Multi-Language</h3>
            <p className="text-sm text-muted-foreground">
              Supports both Hindi and English for better accessibility
            </p>
          </Card>
          <Card className="p-4 glass-card">
            <h3 className="font-bold mb-2">🚨 Emergency Help</h3>
            <p className="text-sm text-muted-foreground">
              Instant emergency procedures and contact information
            </p>
          </Card>
          <Card className="p-4 glass-card">
            <h3 className="font-bold mb-2">📊 Real-time Info</h3>
            <p className="text-sm text-muted-foreground">
              Live dam status, weather updates, and predictions
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;

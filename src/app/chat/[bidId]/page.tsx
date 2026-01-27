'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { useNotifications } from '@/components/ui/NotificationToast';
import { Mic, MicOff, Send, ArrowLeft, Phone, Video, MoreVertical, Paperclip, Image, Volume2, VolumeX } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  messageTranslated?: string;
  voiceMessage?: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'system' | 'offer';
  offerDetails?: {
    amount: number;
    quantity: number;
    unit: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [currentBid, setCurrentBid] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { t, currentLanguage } = useLanguage();
  const { bids, updateBidStatus } = useBidding();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Find the bid for this chat
    const bid = bids.find(b => b.id === params.bidId);
    if (bid) {
      setCurrentBid(bid);
      initializeChat(bid);
    }
  }, [params.bidId, bids]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = (bid: any) => {
    // Initialize chat with bid message
    const initialMessages: ChatMessage[] = [
      {
        id: 'system-1',
        senderId: 'system',
        senderName: 'System',
        message: `Chat started for ${bid.productName}`,
        timestamp: new Date(bid.timestamp),
        type: 'system'
      },
      {
        id: 'bid-message',
        senderId: bid.buyerId,
        senderName: bid.buyerName,
        message: bid.message,
        messageTranslated: bid.messageTranslated,
        voiceMessage: bid.voiceMessage,
        timestamp: new Date(bid.timestamp),
        type: 'offer',
        offerDetails: {
          amount: bid.amount,
          quantity: bid.quantity,
          unit: bid.unit
        }
      }
    ];

    // Add some mock conversation
    if (bid.status === 'accepted' || bid.status === 'rejected') {
      initialMessages.push({
        id: 'seller-response',
        senderId: bid.sellerId,
        senderName: bid.sellerName,
        message: bid.status === 'accepted' 
          ? 'Thank you for your offer! I accept your bid. When would you like to arrange pickup?'
          : 'Thank you for your interest. I cannot accept this price. Would you consider ₹' + (bid.amount + 5) + '/' + bid.unit + '?',
        messageTranslated: bid.status === 'accepted'
          ? 'आपके प्रस्ताव के लिए धन्यवाद! मैं आपकी बोली स्वीकार करता हूं। आप कब पिकअप की व्यवस्था करना चाहेंगे?'
          : 'आपकी रुचि के लिए धन्यवाद। मैं इस कीमत को स्वीकार नहीं कर सकता। क्या आप ₹' + (bid.amount + 5) + '/' + bid.unit + ' पर विचार करेंगे?',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        type: 'text'
      });
    }

    setMessages(initialMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        handleVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      addNotification({
        type: 'error',
        title: 'Recording Error',
        message: 'Could not access microphone. Please check permissions.'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    // Mock transcription and translation
    const mockTranscriptions = [
      'Can we arrange delivery to Delhi by next week?',
      'What is your best price for 100kg?',
      'Is this organic certified?',
      'Can you provide quality samples?'
    ];
    
    const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    const audioUrl = URL.createObjectURL(audioBlob);

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      message: transcription,
      messageTranslated: 'क्या हम अगले सप्ताह तक दिल्ली में डिलीवरी की व्यवस्था कर सकते हैं?', // Mock translation
      voiceMessage: audioUrl,
      timestamp: new Date(),
      type: 'voice'
    };

    setMessages(prev => [...prev, newMsg]);
    
    // Mock seller response after 2 seconds
    setTimeout(() => {
      simulateSellerResponse();
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      message: newMessage,
      messageTranslated: 'यह एक नमूना अनुवाद है', // Mock translation
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Mock seller response after 2 seconds
    setTimeout(() => {
      simulateSellerResponse();
    }, 2000);
  };

  const simulateSellerResponse = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        'Yes, I can arrange delivery to Delhi. Shipping cost will be ₹50 extra.',
        'For 100kg, I can offer ₹40/kg. This is my best price.',
        'Yes, this is certified organic. I can share the certificate.',
        'I can provide 1kg sample. You pay only shipping cost.',
        'Quality is guaranteed. Many customers from Delhi buy regularly.'
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const sellerMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: currentBid?.sellerId || 'seller-1',
        senderName: currentBid?.sellerName || 'Seller',
        message: response,
        messageTranslated: 'हां, मैं दिल्ली में डिलीवरी की व्यवस्था कर सकता हूं। शिपिंग लागत अतिरिक्त ₹50 होगी।',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, sellerMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleAcceptOffer = () => {
    if (currentBid) {
      updateBidStatus(currentBid.id, 'accepted');
      addNotification({
        type: 'success',
        title: 'Offer Accepted!',
        message: 'The seller has accepted your offer. Proceed to payment.'
      });
    }
  };

  const handleRejectOffer = () => {
    if (currentBid) {
      updateBidStatus(currentBid.id, 'rejected');
      addNotification({
        type: 'info',
        title: 'Offer Declined',
        message: 'You can continue negotiating or make a new offer.'
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentBid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Not Found</h2>
          <p className="text-gray-600 mb-6">The conversation you're looking for doesn't exist.</p>
          <Link
            href="/seller"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Chat Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentBid.buyerName.charAt(0)}
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{currentBid.buyerName}</h1>
              <p className="text-sm text-gray-600">{currentBid.productName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className={`p-2 rounded-lg transition ${showTranslations ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Toggle translations"
            >
              {showTranslations ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md ${
              message.type === 'system' 
                ? 'bg-gray-100 text-gray-600 text-center py-2 px-4 rounded-full text-sm'
                : message.senderId === 'current-user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border'
            } rounded-lg p-3 shadow-sm`}>
              
              {message.type === 'offer' && (
                <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600 font-semibold">💰 Offer</span>
                  </div>
                  <div className="text-sm">
                    <p><strong>Amount:</strong> ₹{message.offerDetails?.amount}/{message.offerDetails?.unit}</p>
                    <p><strong>Quantity:</strong> {message.offerDetails?.quantity} {message.offerDetails?.unit}</p>
                    <p><strong>Total:</strong> ₹{(message.offerDetails?.amount || 0) * (message.offerDetails?.quantity || 0)}</p>
                  </div>
                </div>
              )}

              {message.type !== 'system' && (
                <div className="mb-1">
                  <p className="text-sm font-medium">{message.senderName}</p>
                </div>
              )}

              <div className="mb-2">
                <p className="text-sm">{message.message}</p>
                
                {showTranslations && message.messageTranslated && message.messageTranslated !== message.message && (
                  <div className="mt-2 pt-2 border-t border-gray-200 border-opacity-50">
                    <p className="text-xs opacity-75 italic">{message.messageTranslated}</p>
                  </div>
                )}
              </div>

              {message.voiceMessage && (
                <div className="mt-2">
                  <audio controls className="w-full h-8">
                    <source src={message.voiceMessage} type="audio/wav" />
                  </audio>
                </div>
              )}

              <div className="text-xs opacity-75 mt-1">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {currentBid.status === 'pending' && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Offer</p>
              <p className="text-xs text-yellow-600">₹{currentBid.amount}/{currentBid.unit} for {currentBid.quantity} {currentBid.unit}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRejectOffer}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptOffer}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Image className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-full transition ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
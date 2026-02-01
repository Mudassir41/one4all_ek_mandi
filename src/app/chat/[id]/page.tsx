'use client';

import { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useDemoUser } from '@/contexts/DemoUserContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock conversation data
const mockMessages = [
    {
        id: '1',
        senderId: 'buyer-1',
        senderName: 'Amit Sharma',
        senderLang: 'hi',
        originalText: 'मुझे 50 किलो अच्छी गुणवत्ता वाले टमाटर चाहिए। क्या आप अगले हफ्ते भेज सकते हैं?',
        translatedText: 'I need 50 kg of good quality tomatoes. Can you send next week?',
        translatedTextTa: 'எனக்கு 50 கிலோ நல்ல தரமான தக்காளி வேண்டும். அடுத்த வாரம் அனுப்ப முடியுமா?',
        hasAudio: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        type: 'voice' as const,
    },
    {
        id: '2',
        senderId: 'seller-1',
        senderName: 'Ravi Kumar',
        senderLang: 'ta',
        originalText: 'ஆமா, 50 கிலோ தக்காளி தயாராக உள்ளது. விலை கிலோவுக்கு ₹45. ஒப்புக்கொள்கிறீர்களா?',
        translatedText: 'Yes, 50 kg tomatoes are ready. Price is ₹45 per kg. Do you agree?',
        translatedTextHi: 'हां, 50 किलो टमाटर तैयार है। कीमत ₹45 प्रति किलो है। क्या आप सहमत हैं?',
        hasAudio: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
        type: 'voice' as const,
    },
    {
        id: '3',
        senderId: 'buyer-1',
        senderName: 'Amit Sharma',
        senderLang: 'hi',
        originalText: 'हां, ठीक है। कृपया सोमवार को भेजें।',
        translatedText: 'Yes, okay. Please send on Monday.',
        translatedTextTa: 'ஆமா, சரி. தயவுசெய்து திங்கட்கிழமை அனுப்புங்கள்.',
        hasAudio: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
        type: 'voice' as const,
    },
];

export default function ChatPage({ params }: { params: { id: string } }) {
    const { currentUser } = useDemoUser();
    const { currentLanguage, t } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [playingTranslated, setPlayingTranslated] = useState(false);
    const [textMessage, setTextMessage] = useState('');
    const [showRecordingResult, setShowRecordingResult] = useState(false);

    const otherParty = currentUser?.userType === 'vendor'
        ? { name: 'Amit Sharma', location: 'Delhi', lang: 'Hindi' }
        : { name: 'Ravi Kumar', location: 'Chennai, TN', lang: 'Tamil' };

    const formatTime = (date: Date) => {
        const mins = Math.floor((Date.now() - date.getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    const handleStartRecording = () => {
        setIsRecording(true);
        setRecordingTime(0);
        const interval = setInterval(() => {
            setRecordingTime(prev => {
                if (prev >= 15) {
                    setIsRecording(false);
                    clearInterval(interval);
                    setShowRecordingResult(true);
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        setShowRecordingResult(true);
    };

    const handlePlayAudio = (messageId: string, isTranslated: boolean) => {
        setPlayingId(messageId);
        setPlayingTranslated(isTranslated);
        setTimeout(() => {
            setPlayingId(null);
            setPlayingTranslated(false);
        }, 3000);
    };

    const getTranslatedText = (msg: typeof mockMessages[0]) => {
        if (currentLanguage === 'hi' && msg.translatedTextHi) return msg.translatedTextHi;
        if (currentLanguage === 'ta' && msg.translatedTextTa) return msg.translatedTextTa;
        return msg.translatedText;
    };

    const isMyMessage = (msg: typeof mockMessages[0]) => {
        if (currentUser?.userType === 'vendor') {
            return msg.senderId.includes('seller');
        }
        return msg.senderId.includes('buyer');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <Navbar />

            {/* Chat Header */}
            <div className="sticky top-[73px] z-30 bg-white/90 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-2xl">
                            {currentUser?.userType === 'vendor' ? '🛒' : '👨‍🌾'}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-gray-900">{otherParty.name}</h2>
                            <p className="text-sm text-gray-500">📍 {otherParty.location} • Speaks {otherParty.lang}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-sm text-green-600">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Translation Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm">
                <span className="mr-2">🤖</span>
                <span>AI-powered voice translation active • Speak in your language, they hear in theirs</span>
            </div>

            {/* Messages Area */}
            <div className="max-w-3xl mx-auto px-4 py-6 pb-48">
                <div className="space-y-6">
                    {mockMessages.map((msg) => {
                        const isMine = isMyMessage(msg);
                        const isPlaying = playingId === msg.id;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] ${isMine ? 'order-2' : 'order-1'}`}>
                                    {/* Sender Info */}
                                    <div className={`flex items-center gap-2 mb-1 ${isMine ? 'justify-end' : ''}`}>
                                        <span className="text-xs text-gray-500">{msg.senderName}</span>
                                        <span className="text-xs text-gray-400">• {formatTime(msg.timestamp)}</span>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`rounded-2xl overflow-hidden shadow-md ${isMine
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                            : 'bg-white border border-gray-200'
                                        }`}>
                                        {/* Original Message */}
                                        <div className={`p-4 ${isMine ? 'text-white' : ''}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-medium ${isMine ? 'text-orange-100' : 'text-gray-500'}`}>
                                                    🗣️ Original ({msg.senderLang === 'hi' ? 'Hindi' : msg.senderLang === 'ta' ? 'Tamil' : 'English'})
                                                </span>
                                                {msg.hasAudio && (
                                                    <button
                                                        onClick={() => handlePlayAudio(msg.id, false)}
                                                        className={`px-2 py-1 rounded-lg text-xs font-medium transition ${isPlaying && !playingTranslated
                                                                ? 'bg-white/30 animate-pulse'
                                                                : isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {isPlaying && !playingTranslated ? '🔊 Playing...' : '▶️ Play'}
                                                    </button>
                                                )}
                                            </div>
                                            <p className={`font-medium ${isMine ? 'text-white' : 'text-gray-900'}`}>
                                                "{msg.originalText}"
                                            </p>
                                        </div>

                                        {/* Translated Message */}
                                        <div className={`p-4 border-t ${isMine
                                                ? 'bg-orange-600/50 border-orange-400/30'
                                                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-medium ${isMine ? 'text-orange-100' : 'text-green-700'}`}>
                                                    🌐 AI Translation ({currentLanguage === 'hi' ? 'Hindi' : currentLanguage === 'ta' ? 'Tamil' : 'English'})
                                                </span>
                                                <button
                                                    onClick={() => handlePlayAudio(msg.id, true)}
                                                    className={`px-2 py-1 rounded-lg text-xs font-medium transition ${isPlaying && playingTranslated
                                                            ? 'bg-green-200 text-green-800 animate-pulse'
                                                            : isMine ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                >
                                                    {isPlaying && playingTranslated ? '🔊 Playing...' : '🔊 Hear in My Language'}
                                                </button>
                                            </div>
                                            <p className={`font-medium ${isMine ? 'text-white' : 'text-green-800'}`}>
                                                "{getTranslatedText(msg)}"
                                            </p>
                                            <p className={`text-xs mt-2 ${isMine ? 'text-orange-200' : 'text-green-600'}`}>
                                                ⚡ AWS Transcribe → Translate → Polly
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recording Result Overlay */}
            {showRecordingResult && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <span className="text-5xl">✅</span>
                            <h3 className="text-xl font-bold text-gray-900 mt-3">Voice Message Recorded!</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-700 font-medium mb-1">🤖 AI Transcription:</p>
                                <p className="text-gray-900">
                                    {currentLanguage === 'hi'
                                        ? '"हां, सोमवार को भेज दीजिए।"'
                                        : currentLanguage === 'ta'
                                            ? '"ஆமா, திங்கட்கிழமை அனுப்புங்கள்."'
                                            : '"Yes, please send on Monday."'
                                    }
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm text-green-700 font-medium mb-1">🌐 Will be translated to recipient's language</p>
                                <p className="text-xs text-green-600">+ AI voice in their language</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowRecordingResult(false)}
                                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowRecordingResult(false)}
                                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg"
                            >
                                ✓ Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <div className="max-w-3xl mx-auto">
                    {/* Voice Recording Button */}
                    <div className="flex items-center gap-3">
                        {!isRecording ? (
                            <button
                                onClick={handleStartRecording}
                                className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:shadow-xl transition"
                            >
                                🎤
                            </button>
                        ) : (
                            <button
                                onClick={handleStopRecording}
                                className="flex-shrink-0 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse"
                            >
                                <span className="text-sm font-bold">{recordingTime}s</span>
                            </button>
                        )}

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={textMessage}
                                onChange={(e) => setTextMessage(e.target.value)}
                                placeholder={isRecording ? 'Recording voice...' : 'Type a message or hold mic to speak...'}
                                className="w-full px-4 py-3 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isRecording}
                            />
                        </div>

                        <button className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:shadow-xl transition">
                            ➤
                        </button>
                    </div>

                    {isRecording && (
                        <div className="mt-3 text-center text-red-600 font-medium animate-pulse">
                            🔴 Recording... Tap to stop
                        </div>
                    )}

                    <p className="text-xs text-gray-400 text-center mt-2">
                        🎤 Voice messages are transcribed and translated automatically
                    </p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';

interface VoiceMessageProps {
    onRecordComplete?: (message: string) => void;
    language: string;
    placeholder?: string;
}

export function VoiceMessageRecorder({ onRecordComplete, language, placeholder }: VoiceMessageProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [hasRecording, setHasRecording] = useState(false);
    const [transcription, setTranscription] = useState('');

    // Mock transcriptions based on language
    const mockTranscriptions: Record<string, string> = {
        'hi': 'मुझे 50 किलो अच्छी गुणवत्ता वाले टमाटर चाहिए',
        'ta': 'எனக்கு 50 கிலோ நல்ல தரமான தக்காளி வேண்டும்',
        'en': 'I need 50 kg of good quality tomatoes',
    };

    const handleStartRecording = () => {
        setIsRecording(true);
        setRecordingTime(0);

        // Simulate recording timer
        const interval = setInterval(() => {
            setRecordingTime(prev => {
                if (prev >= 10) {
                    handleStopRecording();
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        setHasRecording(true);

        // Simulate AI transcription with delay
        setTimeout(() => {
            const text = mockTranscriptions[language] || mockTranscriptions['en'];
            setTranscription(text);
            onRecordComplete?.(text);
        }, 1500);
    };

    return (
        <div className="space-y-3">
            {/* Recording Button */}
            <div className="flex items-center gap-3">
                {!isRecording && !hasRecording && (
                    <button
                        onClick={handleStartRecording}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:shadow-lg transition"
                    >
                        <span className="text-xl">🎤</span>
                        <span className="font-medium">
                            {language === 'hi' ? 'आवाज़ से बोलें' : language === 'ta' ? 'குரல் மூலம் பேசுங்கள்' : 'Speak with Voice'}
                        </span>
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={handleStopRecording}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl animate-pulse"
                    >
                        <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                        <span className="font-medium">Recording... {recordingTime}s</span>
                        <span>⏹️</span>
                    </button>
                )}

                {hasRecording && !isRecording && (
                    <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✅</span>
                        <span className="text-green-700 font-medium">Voice recorded!</span>
                        <button
                            onClick={() => { setHasRecording(false); setTranscription(''); }}
                            className="text-gray-500 hover:text-red-500"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>

            {/* AI Processing Indicator */}
            {hasRecording && !transcription && (
                <div className="flex items-center gap-2 text-blue-600">
                    <span className="animate-spin">🔄</span>
                    <span>AI transcribing your voice...</span>
                </div>
            )}

            {/* Transcription Result */}
            {transcription && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span>🤖</span>
                        <span className="text-sm font-medium text-blue-700">AI Transcription</span>
                    </div>
                    <p className="text-gray-900 font-medium">"{transcription}"</p>
                    <p className="text-xs text-gray-500 mt-2">
                        ✨ Will be translated for the recipient
                    </p>
                </div>
            )}

            {/* OR Divider */}
            {!hasRecording && (
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm">or type below</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
            )}
        </div>
    );
}

interface VoiceMessagePlayerProps {
    originalAudioLabel: string;
    originalText: string;
    translatedText: string;
    translatedAudioLabel: string;
    senderLanguage: string;
    receiverLanguage: string;
}

export function VoiceMessagePlayer({
    originalAudioLabel,
    originalText,
    translatedText,
    translatedAudioLabel,
    senderLanguage,
    receiverLanguage
}: VoiceMessagePlayerProps) {
    const [playingOriginal, setPlayingOriginal] = useState(false);
    const [playingTranslated, setPlayingTranslated] = useState(false);

    const handlePlayOriginal = () => {
        setPlayingOriginal(true);
        setTimeout(() => setPlayingOriginal(false), 3000);
    };

    const handlePlayTranslated = () => {
        setPlayingTranslated(true);
        setTimeout(() => setPlayingTranslated(false), 3000);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Original Message */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                        🗣️ Original ({senderLanguage})
                    </span>
                    <button
                        onClick={handlePlayOriginal}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${playingOriginal
                                ? 'bg-orange-100 text-orange-700 animate-pulse'
                                : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
                            }`}
                    >
                        {playingOriginal ? '🔊 Playing...' : '▶️ Play Audio'}
                    </button>
                </div>
                <p className="text-gray-900 font-medium">"{originalText}"</p>
            </div>

            {/* Translated Message */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">
                        🌐 AI Translation ({receiverLanguage})
                    </span>
                    <button
                        onClick={handlePlayTranslated}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${playingTranslated
                                ? 'bg-green-200 text-green-800 animate-pulse'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        {playingTranslated ? '🔊 Playing...' : '▶️ Hear in My Language'}
                    </button>
                </div>
                <p className="text-green-800 font-medium">"{translatedText}"</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <span>⚡</span> Powered by AWS Translate + Polly
                </p>
            </div>
        </div>
    );
}

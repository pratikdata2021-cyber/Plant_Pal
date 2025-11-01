import React, { useState, useEffect, useRef } from 'react';
import { AiIcon, CameraIcon, ChatBubbleIcon, ExclamationCircleIcon, WaterDropIcon, SunIcon, FertilizerIcon, SendIcon, UploadIcon, CloseIcon } from '../constants';
import { askAiChat, identifyPlant } from '../lib/api';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

interface IdentificationResult {
    name: string;
    match: number;
}

interface AiAssistantProps {
    token: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ token }) => {
    const [activeSubTab, setActiveSubTab] = useState<'chat' | 'identify'>('chat');
    // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello! How can I help you with your plants today? Ask me anything or choose from a common question below.' }
    ]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatLogRef = useRef<HTMLDivElement>(null);
    
    // Identification State
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [identificationResult, setIdentificationResult] = useState<IdentificationResult | null>(null);
    const [identificationError, setIdentificationError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [chatHistory, isChatLoading]);

    const handleSendMessage = async (messageText?: string) => {
        const question = messageText || currentQuestion;
        if (!question.trim() || isChatLoading) return;

        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: question }];
        setChatHistory(newHistory);
        if (!messageText) setCurrentQuestion('');
        setIsChatLoading(true);

        try {
            const { response } = await askAiChat(question, newHistory, token);
            setChatHistory(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            console.error("Error calling backend chat API:", error);
            setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };

    const renderMarkdown = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        return { __html: html };
    };
    
    const handleIdentifyPlant = async () => {
        if (!imageFile) return;

        setIsIdentifying(true);
        setIdentificationResult(null);
        setIdentificationError(null);
        
        try {
            const result = await identifyPlant(imageFile, token);
            setIdentificationResult(result);

        } catch (error) {
            console.error("Error identifying plant:", error);
            setIdentificationError("Sorry, I couldn't identify that plant. Please try another photo.");
        } finally {
            setIsIdentifying(false);
        }
    };

    useEffect(() => {
        if (imageFile) {
            handleIdentifyPlant();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageFile]);


    const handleFileSelect = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setImagePreview(URL.createObjectURL(file));
            setImageFile(file);
        }
    };
    
    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const resetIdentification = () => {
        setImagePreview(null);
        setImageFile(null);
        setIdentificationResult(null);
        setIdentificationError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const commonQuestions = [
        { q: "Why are my plant's leaves turning yellow?", icon: <ExclamationCircleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" /> },
        { q: "How often should I water my plants?", icon: <WaterDropIcon className="w-6 h-6 text-blue-500 flex-shrink-0" /> },
        { q: "What type of light does my plant need?", icon: <SunIcon className="w-6 h-6 text-orange-500 flex-shrink-0" /> },
        { q: "How do I know if my plant needs fertilizer?", icon: <FertilizerIcon className="w-6 h-6 text-green-500 flex-shrink-0" /> },
    ];
    
    const ChatView = () => (
        <div className="animate-fade-in">
            <p className="text-sm font-semibold text-plant-gray-dark mb-4">Common questions:</p>
            <div className="space-y-3 mb-8">
                {commonQuestions.map((item, i) => (
                    <button key={i} onClick={() => handleSendMessage(item.q)} disabled={isChatLoading} className="w-full bg-white p-4 rounded-xl shadow-sm text-left flex items-center space-x-4 hover:bg-gray-50 transition-colors disabled:opacity-50">
                        {item.icon}
                        <span className="font-medium text-plant-dark">{item.q}</span>
                    </button>
                ))}
            </div>

            <div ref={chatLogRef} className="space-y-6 mb-6">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (<div className="bg-plant-purple-light p-2 rounded-full flex-shrink-0 mt-1"><AiIcon className="w-5 h-5 text-plant-purple-dark" /></div>)}
                        <div className={`max-w-lg p-4 rounded-2xl prose prose-sm ${ msg.role === 'user' ? 'bg-plant-green text-white rounded-br-none' : 'bg-white text-plant-dark rounded-bl-none shadow-sm'}`} style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }} dangerouslySetInnerHTML={renderMarkdown(msg.text)}></div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="bg-plant-purple-light p-2 rounded-full flex-shrink-0"><AiIcon className="w-5 h-5 text-plant-purple-dark" /></div>
                        <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                           <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleFormSubmit} className="relative">
                <input type="text" value={currentQuestion} onChange={(e) => setCurrentQuestion(e.target.value)} placeholder="Ask a question about plant care..." className="w-full bg-white pl-5 pr-16 py-4 rounded-xl shadow-sm text-base text-plant-dark placeholder-plant-gray focus:ring-2 focus:ring-plant-green outline-none transition-shadow" disabled={isChatLoading} aria-label="Ask the AI assistant a question"/>
                <button type="submit" disabled={isChatLoading || !currentQuestion.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 bg-plant-green text-white h-10 w-10 rounded-lg flex items-center justify-center hover:bg-plant-green-dark transition-colors disabled:bg-plant-gray disabled:cursor-not-allowed" aria-label="Send message">
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
    
     const IdentifyPlantView = () => (
        <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                {!imagePreview ? (
                    <>
                        <div className="mx-auto h-20 w-20 flex items-center justify-center bg-green-100 rounded-full">
                           <CameraIcon className="h-10 w-10 text-plant-green" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-plant-dark">Identify Your Plant</h3>
                        <p className="mt-2 text-plant-gray max-w-sm mx-auto">Upload a photo of your plant to get instant identification and care recommendations</p>
                        <input type="file" ref={fileInputRef} onChange={onFileInputChange} accept="image/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="mt-6 w-full max-w-xs bg-plant-green text-white font-bold py-3 px-6 rounded-lg hover:bg-plant-green-dark transition-colors shadow-md flex items-center justify-center gap-2 mx-auto">
                            <CameraIcon className="h-5 w-5" />
                            Upload Photo
                        </button>
                    </>
                ) : (
                    <div className="relative">
                        <img src={imagePreview} alt="Plant preview" className="w-full h-auto max-h-96 object-cover rounded-lg" />
                        
                        {isIdentifying && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                                <div className="h-12 w-12 border-4 border-plant-green border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 font-semibold text-plant-dark">Identifying...</p>
                            </div>
                        )}

                        {identificationResult && (
                             <div className="mt-6 text-left">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-plant-gray">Identification Result:</p>
                                        <h3 className="text-4xl font-bold text-plant-dark leading-tight">{identificationResult.name}</h3>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-base font-bold px-4 py-1.5 rounded-full">{identificationResult.match}% match</span>
                                </div>
                                <div className="mt-6">
                                    <button onClick={resetIdentification} className="font-semibold text-plant-green hover:underline">Identify another plant</button>
                                </div>
                             </div>
                        )}

                        {identificationError && (
                            <div className="mt-6 text-left">
                                <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm">{identificationError}</p>
                                <button onClick={resetIdentification} className="mt-4 text-sm font-semibold text-plant-green hover:underline">Try again</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-purple-200/50 rounded-2xl p-6 flex items-center space-x-6 mb-6 shadow-sm" style={{background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'}}>
                <div className="bg-white p-4 rounded-xl shadow-md">
                   <AiIcon className="h-10 w-10 text-plant-purple" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-plant-dark">AI Plant Care Assistant</h3>
                    <p className="text-plant-gray-dark mt-1">Get instant answers to your plant care questions powered by AI</p>
                </div>
            </div>

            <div className="flex items-center justify-center mb-8">
                <div className="bg-plant-gray-light p-1.5 rounded-xl flex items-center">
                    <button
                        onClick={() => setActiveSubTab('chat')}
                        className={`w-40 py-2.5 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                            activeSubTab === 'chat' ? 'bg-white text-plant-dark shadow' : 'text-plant-gray hover:bg-white/50'
                        }`}
                    >
                        <ChatBubbleIcon className="w-5 h-5" />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveSubTab('identify')}
                         className={`w-40 py-2.5 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                            activeSubTab === 'identify' ? 'bg-plant-green text-white shadow' : 'text-plant-gray hover:bg-white/50'
                        }`}
                    >
                        <CameraIcon className="w-5 h-5" />
                        Identify Plant
                    </button>
                </div>
            </div>

            {activeSubTab === 'chat' ? <ChatView /> : <IdentifyPlantView />}
        </div>
    );
};

export default AiAssistant;

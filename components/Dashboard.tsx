import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AiIcon, CalendarIcon, CameraIcon, ChartIcon, CheckCircleIcon, CloseIcon, ExclamationCircleIcon, JournalIcon, LeafIcon, LocationIcon, LogoIcon, PlusIcon, SunIcon, TrashIcon, WaterDropIcon, FertilizerIcon, GroomIcon, UploadIcon } from '../constants';
import AddPlantModal from './AddPlantModal';
import AiAssistant from './AiAssistant';
import { getPlants, addPlant, deletePlant, updatePlant, updatePlantActivity, getJournalEntries, addJournalEntry, deleteJournalEntry, getArticles, getFertilizerSuggestion } from '../lib/api';

interface DashboardProps {
    onLogout: () => void;
    token: string;
}

const addDays = (date: string, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'N/A';
  }
  return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- TYPE DEFINITIONS ---
export interface Plant {
    id: number | string;
    name: string;
    scientificName: string;
    image: string;
    light: string;
    health: 'healthy' | 'attention';
    location: string;
    wateringFrequency: number;
    lastWatered: string;
    fertilizingFrequency: number;
    lastFertilized: string;
    groomingFrequency: number;
    lastGroomed: string;
    sunlight: string;
    humidity: string;
    notes: string;
    fertilizerDetails?: string;
}

export interface Article {
  id: number;
  title: string;
  category: string;
  type: 'Guide' | 'Article';
  description: string;
  image: string;
  link: string;
  content: string;
}

export interface JournalEntry {
    id: number | string;
    title: string;
    content: string;
    date: string;
    file?: {
        name: string;
        type: 'image' | 'pdf';
        url: string; 
    };
}


const ArticleModal: React.FC<{ article: Article | null; isOpen: boolean; onClose: () => void; }> = ({ article, isOpen, onClose }) => {
    if (!isOpen || !article) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const categoryColors: { [key: string]: string } = {
        'Watering': 'bg-blue-100 text-blue-800',
        'Sunlight': 'bg-yellow-100 text-yellow-800',
        'Pest Control': 'bg-red-100 text-red-800',
        'Repotting': 'bg-orange-100 text-orange-800',
        'Soil': 'bg-amber-100 text-amber-800',
        'Fertilizing': 'bg-green-100 text-green-800',
    };
    
    // Simple markdown-to-HTML converter
    const renderContent = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\n/g, '<br />') }}></p>
            ));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in" onClick={handleOverlayClick}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="sticky top-4 right-4 float-right text-gray-500 hover:text-gray-800 z-10 p-2 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur-sm">
                    <CloseIcon className="h-6 w-6" />
                </button>
                <img src={article.image} alt={article.title} className="w-full h-72 object-cover rounded-t-2xl" />
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${categoryColors[article.category] || 'bg-gray-100 text-gray-800'}`}>
                            {article.category}
                        </span>
                        <span className="text-sm font-semibold text-plant-gray">{article.type.toUpperCase()}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-plant-dark mb-6">{article.title}</h2>
                    <div className="text-plant-dark text-base leading-relaxed">
                        {renderContent(article.content)}
                    </div>
                </div>
            </div>
        </div>
    );
};


const ArticleCard: React.FC<{ article: Article; onView: (article: Article) => void }> = ({ article, onView }) => {
    const categoryColors: { [key: string]: string } = {
        'Watering': 'bg-blue-100 text-blue-800',
        'Sunlight': 'bg-yellow-100 text-yellow-800',
        'Pest Control': 'bg-red-100 text-red-800',
        'Repotting': 'bg-orange-100 text-orange-800',
        'Soil': 'bg-amber-100 text-amber-800',
        'Fertilizing': 'bg-green-100 text-green-800',
    };

    return (
        <button onClick={() => onView(article)} className="bg-white rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group flex flex-col text-left w-full">
            <div className="relative">
                <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
                <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${categoryColors[article.category] || 'bg-gray-100 text-gray-800'}`}>
                    {article.category}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-sm font-semibold text-plant-green mb-1">{article.type.toUpperCase()}</p>
                <h3 className="text-lg font-bold text-plant-dark flex-grow">{article.title}</h3>
                <p className="text-sm text-plant-gray mt-2 mb-4">{article.description}</p>
                <div className="mt-auto text-sm font-bold text-plant-green-dark group-hover:underline">
                    Read More &rarr;
                </div>
            </div>
        </button>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; colorClasses: string; isActive: boolean; onClick: () => void; }> = ({ icon, title, value, colorClasses, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-6 rounded-2xl text-left w-full transition-all duration-300 ${colorClasses} ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-green-50 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium opacity-80">{title}</p>
                <p className="text-4xl font-bold mt-1">{value}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/30">
                {icon}
            </div>
        </div>
    </button>
);

const ReminderBadge: React.FC<{icon: React.ReactNode; text: string; color: string}> = ({ icon, text, color}) => (
    <div className={`text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 ${color}`}>
        {icon}
        <span>{text}</span>
    </div>
);

const ActivityDetail: React.FC<{icon: React.ReactNode; label: string; last: string; next: string}> = ({ icon, label, last, next }) => (
    <div className="flex items-center text-sm">
        <div className="w-6 text-plant-gray-dark">{icon}</div>
        <div className="w-20 font-semibold text-plant-dark">{label}</div>
        <div className="flex-1 text-plant-gray">Last: {last}</div>
        <div className="flex-1 text-plant-gray">Next: <span className="font-semibold text-plant-dark">{next}</span></div>
    </div>
);

const ActionButton: React.FC<{icon: React.ReactNode; label: string; onClick: (e: React.MouseEvent) => void}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center justify-center space-x-2 w-full text-xs font-semibold bg-plant-gray-light text-plant-gray-dark py-2 rounded-lg hover:bg-gray-200 hover:text-plant-dark transition-colors">
        {icon}
        <span>{label}</span>
    </button>
);

const PlantCard: React.FC<{ plant: Plant; onViewDetails: (plant: Plant) => void; onDelete: (id: Plant['id']) => void; onUpdateActivity: (plantId: Plant['id'], activity: 'water' | 'fertilize' | 'groom') => void; }> = ({ plant, onViewDetails, onDelete, onUpdateActivity }) => {
    const healthColors = {
        healthy: 'bg-green-500 border-white',
        attention: 'bg-yellow-500 border-white',
    };

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    }, []);

    const nextWateringDate = useMemo(() => addDays(plant.lastWatered, plant.wateringFrequency), [plant.lastWatered, plant.wateringFrequency]);
    const nextFertilizingDate = useMemo(() => addDays(plant.lastFertilized, plant.fertilizingFrequency), [plant.lastFertilized, plant.fertilizingFrequency]);
    const nextGroomingDate = useMemo(() => addDays(plant.lastGroomed, plant.groomingFrequency), [plant.lastGroomed, plant.groomingFrequency]);
    
    const needsWater = nextWateringDate <= today;
    const needsFertilizer = nextFertilizingDate <= today;
    const needsGrooming = nextGroomingDate <= today;
    
    const handleActionClick = (e: React.MouseEvent, plantId: Plant['id'], activity: 'water' | 'fertilize' | 'groom') => {
        e.stopPropagation();
        onUpdateActivity(plantId, activity);
    }
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onDelete(plant.id);
    };

    return (
        <div
            className="bg-white rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer group flex flex-col"
            onClick={() => onViewDetails(plant)}
        >
            <div className="relative">
                <img src={plant.image} alt={plant.name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 left-3 flex flex-col space-y-1.5">
                    {needsWater && <ReminderBadge icon={<WaterDropIcon className="h-4 w-4" />} text="Water me!" color="bg-blue-500" />}
                    {needsFertilizer && <ReminderBadge icon={<FertilizerIcon className="h-4 w-4" />} text="Fertilise me!" color="bg-orange-500" />}
                    {needsGrooming && <ReminderBadge icon={<GroomIcon className="h-4 w-4" />} text="Groom me!" color="bg-purple-500" />}
                </div>
                <div className={`absolute top-3 right-3 h-4 w-4 rounded-full border-2 ${healthColors[plant.health]}`} />
                <button 
                    onClick={handleDelete} 
                    className="absolute top-2 right-2 bg-black/20 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-300"
                    aria-label={`Delete ${plant.name}`}
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-plant-dark">{plant.name}</h3>
                <p className="text-sm text-plant-gray mb-4 flex-grow">{plant.scientificName}</p>
                
                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-gray-100">
                    <ActionButton icon={<WaterDropIcon className="h-4 w-4" />} label="Watered" onClick={(e) => handleActionClick(e, plant.id, 'water')} />
                    <ActionButton icon={<FertilizerIcon className="h-4 w-4" />} label="Fertilised" onClick={(e) => handleActionClick(e, plant.id, 'fertilize')} />
                    <ActionButton icon={<GroomIcon className="h-4 w-4" />} label="Groomed" onClick={(e) => handleActionClick(e, plant.id, 'groom')} />
                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{icon: React.ReactNode, label: string, value: string}> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3">
        <div className="bg-plant-gray-light p-3 rounded-lg text-plant-green-dark flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm text-plant-gray">{label}</p>
            <p className="font-semibold text-plant-dark">{value}</p>
        </div>
    </div>
);

const PlantDetailsModal: React.FC<{ plant: Plant | null; isOpen: boolean; onClose: () => void; onUpdatePlant: (plant: Plant) => void; token: string; }> = ({ plant, isOpen, onClose, onUpdatePlant, token }) => {
    const [editablePlant, setEditablePlant] = useState<Plant | null>(plant);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiFertilizerNote, setAiFertilizerNote] = useState('');

    useEffect(() => {
        setEditablePlant(plant);
        setAiFertilizerNote(''); // Reset AI note when plant changes
    }, [plant]);

    if (!isOpen || !editablePlant) return null;
    
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleGetAiSuggestion = async () => {
        setIsAiLoading(true);
        setAiFertilizerNote('');
        try {
          const { suggestion } = await getFertilizerSuggestion({
              name: editablePlant.name,
              scientificName: editablePlant.scientificName,
          }, token);
          setAiFertilizerNote(suggestion);

        } catch (error) {
            console.error("Error fetching AI fertilizer suggestion:", error);
            setAiFertilizerNote("Sorry, couldn't fetch a suggestion at this time.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        onUpdatePlant(editablePlant);
        onClose();
    };

    const nextWateringDate = addDays(editablePlant.lastWatered, editablePlant.wateringFrequency);
    const nextFertilizingDate = addDays(editablePlant.lastFertilized, editablePlant.fertilizingFrequency);
    const nextGroomingDate = addDays(editablePlant.lastGroomed, editablePlant.groomingFrequency);
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in" onClick={handleOverlayClick}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-2 rounded-full bg-white/50 hover:bg-white/80">
                    <CloseIcon className="h-6 w-6" />
                </button>
                <img src={editablePlant.image} alt={editablePlant.name} className="w-full h-64 object-cover rounded-t-2xl" />
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-plant-dark">{editablePlant.name}</h2>
                    <p className="text-lg text-plant-gray italic mb-6">{editablePlant.scientificName}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <DetailItem icon={<LocationIcon className="h-6 w-6" />} label="Location" value={editablePlant.location} />
                        <DetailItem icon={<SunIcon className="h-6 w-6" />} label="Sunlight" value={editablePlant.sunlight} />
                        <DetailItem icon={<WaterDropIcon className="h-6 w-6" />} label="Watering Frequency" value={`Every ${editablePlant.wateringFrequency} days`} />
                        <DetailItem icon={<FertilizerIcon className="h-6 w-6" />} label="Fertilizing Frequency" value={`Every ${editablePlant.fertilizingFrequency} days`} />
                        <DetailItem icon={<GroomIcon className="h-6 w-6" />} label="Grooming Frequency" value={`Every ${editablePlant.groomingFrequency} days`} />
                        <DetailItem icon={<CalendarIcon className="h-6 w-6" />} label="Humidity" value={editablePlant.humidity} />
                    </div>

                    <h3 className="text-xl font-bold text-plant-dark mt-8 mb-4">Care Schedule</h3>
                    <div className="space-y-3 bg-plant-gray-light p-4 rounded-lg">
                        <ActivityDetail icon={<WaterDropIcon className="h-5 w-5" />} label="Water" last={formatDate(new Date(editablePlant.lastWatered))} next={formatDate(nextWateringDate)} />
                        <ActivityDetail icon={<FertilizerIcon className="h-5 w-5" />} label="Fertilize" last={formatDate(new Date(editablePlant.lastFertilized))} next={formatDate(nextFertilizingDate)} />
                        <ActivityDetail icon={<GroomIcon className="h-5 w-5" />} label="Groom" last={formatDate(new Date(editablePlant.lastGroomed))} next={formatDate(nextGroomingDate)} />
                    </div>

                    <h3 className="text-xl font-bold text-plant-dark mt-8 mb-4">Fertilizer Details</h3>
                    <div className="space-y-4 bg-plant-gray-light p-4 rounded-lg">
                        <label htmlFor="fertilizerDetails" className="block text-sm font-medium text-plant-gray-dark">
                            Fertilizer Notes & Schedule
                        </label>
                        <textarea
                            id="fertilizerDetails"
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-plant-green focus:border-plant-green"
                            placeholder="e.g., Use Miracle-Gro every 2nd watering during spring."
                            value={editablePlant.fertilizerDetails || ''}
                            onChange={(e) => setEditablePlant({ ...editablePlant, fertilizerDetails: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={handleGetAiSuggestion}
                            disabled={isAiLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-plant-gray-dark bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-500 transition-colors"
                        >
                            <AiIcon className={`h-5 w-5 ${isAiLoading ? 'animate-spin' : ''}`} />
                            {isAiLoading ? 'Getting Suggestion...' : 'Get AI Suggestion'}
                        </button>

                        {aiFertilizerNote && (
                            <div className="mt-4 p-4 bg-white rounded-md border border-plant-purple-light animate-fade-in">
                                <p className="text-sm font-semibold text-plant-purple-dark">AI Suggestion:</p>
                                <p className="text-sm text-plant-dark mt-1">{aiFertilizerNote}</p>
                                <button
                                    onClick={() => setEditablePlant({ ...editablePlant, fertilizerDetails: aiFertilizerNote })}
                                    className="mt-2 text-xs font-bold text-plant-purple-dark hover:underline"
                                >
                                    Use this suggestion
                                </button>
                            </div>
                        )}
                    </div>


                     <h3 className="text-xl font-bold text-plant-dark mt-8 mb-2">Care Notes</h3>
                    <p className="text-plant-gray bg-plant-gray-light p-4 rounded-lg">{editablePlant.notes || 'No notes available.'}</p>
                    
                    <div className="flex justify-end items-center pt-6 space-x-4 border-t mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg font-bold transition-colors bg-white border border-gray-300 hover:bg-gray-100 text-plant-dark">
                            Cancel
                        </button>
                         <button type="button" onClick={handleSaveChanges} className="px-6 py-2 rounded-lg font-bold transition-colors bg-plant-green text-white hover:bg-plant-green-dark">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Journal Components ---

const JournalEntryModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (entry: FormData) => void }> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setContent('');
            setFile(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) return;
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (file) {
            formData.append('file', file);
        }

        onSave(formData);
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-plant-dark mb-6">New Journal Entry</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Entry Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-plant-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-plant-green outline-none" />
                    <textarea placeholder="Write about your plant..." value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full px-4 py-2 bg-plant-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-plant-green outline-none" />
                    <div>
                        <label className="block text-sm font-medium text-plant-gray-dark mb-2">Attach Photo or PDF</label>
                        <div className="flex items-center space-x-4">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-plant-gray-dark bg-white hover:bg-gray-50">
                                <UploadIcon className="h-5 w-5"/> {file ? 'Change file' : 'Choose file'}
                            </button>
                             {file && <span className="text-sm text-plant-gray truncate">{file.name}</span>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" />
                    </div>
                </div>
                <div className="flex justify-end items-center pt-6 space-x-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-bold bg-gray-100 hover:bg-gray-200 text-plant-dark">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg font-bold bg-plant-green text-white hover:bg-plant-green-dark">Save Entry</button>
                </div>
            </div>
        </div>
    );
};

const ViewJournalEntryModal: React.FC<{ entry: JournalEntry | null, isOpen: boolean, onClose: () => void }> = ({ entry, isOpen, onClose }) => {
    if (!isOpen || !entry) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-plant-dark">{entry.title}</h2>
                            <p className="text-sm text-plant-gray mt-1">{formatDate(entry.date)}</p>
                        </div>
                         <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="h-6 w-6" /></button>
                    </div>
                    <p className="mt-6 text-plant-dark whitespace-pre-wrap">{entry.content}</p>
                </div>
                {entry.file && entry.file.type === 'image' && (
                    <img src={entry.file.url} alt="Journal attachment" className="w-full object-cover rounded-b-2xl" />
                )}
                 {entry.file && entry.file.type === 'pdf' && (
                    <div className="p-8 bg-gray-50 rounded-b-2xl">
                        <a href={entry.file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <JournalIcon className="h-8 w-8 text-red-500"/>
                            <div>
                                <p className="font-semibold text-plant-dark">{entry.file.name}</p>
                                <p className="text-sm text-red-500 hover:underline">View PDF</p>
                            </div>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
};


const JournalTab: React.FC<{ 
    entries: JournalEntry[];
    articles: Article[];
    onNewEntry: () => void;
    onViewEntry: (entry: JournalEntry) => void;
    onDeleteEntry: (id: JournalEntry['id']) => void;
    onViewArticle: (article: Article) => void;
}> = ({ entries, articles, onNewEntry, onViewEntry, onDeleteEntry, onViewArticle }) => {
    return (
        <div className="animate-fade-in">
             {/* My Journal Entries Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-plant-dark">My Journal Entries</h2>
                    <button onClick={onNewEntry} className="bg-plant-green text-white font-medium px-4 py-2 rounded-lg hover:bg-plant-green-dark transition-colors shadow-sm flex items-center space-x-2">
                        <PlusIcon className="h-5 w-5" />
                        <span>New Entry</span>
                    </button>
                </div>
                {entries.length === 0 ? (
                    <div className="text-center text-plant-gray py-10 border-2 border-dashed rounded-lg">
                        <JournalIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <h3 className="text-lg font-semibold">Your journal is empty</h3>
                        <p>Click "New Entry" to start recording your plant care journey.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {entries.map(entry => (
                             <div key={entry.id} className="bg-gray-50 rounded-xl p-5 group relative">
                                {entry.file && entry.file.type === 'image' && (
                                     <img src={entry.file.url} alt="thumbnail" className="w-full h-32 object-cover rounded-lg mb-4"/>
                                )}
                                {entry.file && entry.file.type === 'pdf' && (
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg mb-4 border">
                                        <JournalIcon className="h-6 w-6 text-red-500 flex-shrink-0"/>
                                        <p className="text-sm text-plant-gray truncate">{entry.file.name}</p>
                                    </div>
                                )}
                                <h3 className="font-bold text-plant-dark truncate">{entry.title}</h3>
                                <p className="text-xs text-plant-gray mb-3">{formatDate(entry.date)}</p>
                                <p className="text-sm text-plant-gray-dark line-clamp-2">{entry.content}</p>
                                <div className="mt-4 flex items-center gap-2">
                                     <button onClick={() => onViewEntry(entry)} className="text-sm font-semibold text-plant-green hover:underline">View Details</button>
                                </div>
                                <button onClick={() => onDeleteEntry(entry.id)} className="absolute top-3 right-3 p-2 bg-white/50 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Guides and Articles Section */}
            <div>
                 <h2 className="text-2xl font-bold text-plant-dark mb-6">Featured Guides & Articles</h2>
                 {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map(article => (
                            <ArticleCard key={article.id} article={article} onView={onViewArticle} />
                        ))}
                    </div>
                 ) : (
                    <div className="text-center text-plant-gray py-10">
                        <p>Loading articles...</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

// --- Statistics Components ---

const PieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-48 text-plant-gray">No data to display</div>;
    }

    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="relative w-48 h-48">
                <svg viewBox="-1 -1 2 2" className="transform -rotate-90">
                    {data.map((item) => {
                        const percent = item.value / total;
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        cumulativePercent += percent;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const pathData = [
                            `M ${startX} ${startY}`,
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `L 0 0`,
                        ].join(' ');

                        return (
                            <path key={item.label} d={pathData} fill={item.color} className="transition-opacity hover:opacity-80">
                                <title>{`${item.label}: ${item.value} (${((item.value / total) * 100).toFixed(1)}%)`}</title>
                            </path>
                        );
                    })}
                </svg>
            </div>
            <div className="flex flex-col space-y-2 text-sm">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-plant-dark">{item.label}</span>
                        <span className="ml-auto text-plant-gray">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const BarChart: React.FC<{ data: { label: string; value: number }[]; color?: string }> = ({ data, color = '#10B981' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-56 text-plant-gray">No data available.</div>;
    }

    return (
        <div className="w-full h-56 flex items-end justify-around gap-2 pt-4 border-b border-l border-gray-200">
            {data.map((item, index) => (
                <div key={index} className="flex-1 h-full flex flex-col items-center justify-end group">
                    <div 
                        className="w-4/5 rounded-t-md transition-all duration-300 hover:opacity-80" 
                        style={{ height: `${(item.value / maxValue) * 100}%`, backgroundColor: color }}
                    >
                         <title>{`${item.label}: ${item.value}`}</title>
                    </div>
                    <span className="text-xs text-plant-gray mt-2">{item.label}</span>
                </div>
            ))}
        </div>
    );
};


const StatisticsTab: React.FC<{ plants: Plant[] }> = ({ plants }) => {

    const healthData = useMemo(() => {
        const healthy = plants.filter(p => p.health === 'healthy').length;
        const attention = plants.filter(p => p.health === 'attention').length;
        return [
            { label: 'Healthy', value: healthy, color: '#34D399' },
            { label: 'Needs Attention', value: attention, color: '#FBBF24' },
        ];
    }, [plants]);

    const locationData = useMemo(() => {
        const counts = plants.reduce((acc, plant) => {
            acc[plant.location] = (acc[plant.location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [plants]);
    
    const lightData = useMemo(() => {
        const counts = plants.reduce((acc, plant) => {
            acc[plant.light] = (acc[plant.light] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return [
            { label: 'Low', value: counts['Low'] || 0, color: '#60A5FA' },
            { label: 'Medium', value: counts['Medium'] || 0, color: '#FBBF24' },
            { label: 'Bright', value: counts['Bright'] || 0, color: '#F87171' },
        ];
    }, [plants]);

    const upcomingTasksData = useMemo(() => {
        const today = new Date();
        const next7Days = Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(today.getDate() + i);
            d.setHours(0,0,0,0);
            return d;
        });

        return next7Days.map(day => {
            let tasks = 0;
            plants.forEach(p => {
                const nextWater = addDays(p.lastWatered, p.wateringFrequency);
                const nextFertilize = addDays(p.lastFertilized, p.fertilizingFrequency);
                if (nextWater.toDateString() === day.toDateString()) tasks++;
                if (nextFertilize.toDateString() === day.toDateString()) tasks++;
            });
            return {
                label: day.toLocaleDateString('en-US', { weekday: 'short' }),
                value: tasks,
            };
        });
    }, [plants]);

    if (plants.length === 0) {
        return (
            <div className="text-center text-plant-gray py-20 animate-fade-in">
                <ChartIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold">No Plant Data</h3>
                <p>Add some plants to your collection to see your statistics!</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-plant-dark mb-6">Your Plant Statistics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-plant-dark mb-4">Plant Health Overview</h3>
                    <PieChart data={healthData} />
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-plant-dark mb-4">Upcoming Care: Next 7 Days</h3>
                    <BarChart data={upcomingTasksData} color="#60A5FA" />
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-plant-dark mb-4">Plants by Location</h3>
                    <BarChart data={locationData} />
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-plant-dark mb-4">Light Requirements</h3>
                     <PieChart data={lightData} />
                 </div>
            </div>
        </div>
    );
};

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const DashboardSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>
            ))}
        </section>
        <div className="bg-gray-200 rounded-xl p-4 mb-8 h-16"></div>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl">
                    <div className="h-48 bg-gray-300 rounded-t-2xl"></div>
                    <div className="p-4">
                        <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-300 rounded mb-4"></div>
                        <div className="h-10 bg-gray-300 rounded-lg mt-4"></div>
                    </div>
                </div>
            ))}
        </section>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onLogout, token }) => {
    const [activeTab, setActiveTab] = useState('My Plants');
    const [isAddPlantModalOpen, setAddPlantModalOpen] = useState(false);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [activeFilter, setActiveFilter] = useState('Total Plants');
    const [isArticleModalOpen, setArticleModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    // Data fetching states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Advanced filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [lightFilter, setLightFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name-asc');

    // Journal and Articles State
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [isJournalModalOpen, setJournalModalOpen] = useState(false);
    const [viewingJournalEntry, setViewingJournalEntry] = useState<JournalEntry | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [plantsData, journalData, articlesData] = await Promise.all([
                    getPlants(token),
                    getJournalEntries(token),
                    getArticles(token),
                ]);
                
                setPlants(plantsData);
                setJournalEntries(journalData);
                setArticles(articlesData);

            } catch (err: any) {
                setError(err.message || 'Failed to fetch data from the server.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const openAddPlantModal = () => setAddPlantModalOpen(true);
    const closeAddPlantModal = () => setAddPlantModalOpen(false);
    
    const handleViewArticle = (article: Article) => {
        setSelectedArticle(article);
        setArticleModalOpen(true);
    };

    const handleViewDetails = (plant: Plant) => {
        setSelectedPlant(plant);
        setViewModalOpen(true);
    };

    const handleDeletePlant = async (idToDelete: Plant['id']) => {
        const originalPlants = plants;
        setPlants(currentPlants => currentPlants.filter(p => p.id !== idToDelete));
        try {
            await deletePlant(idToDelete, token);
        } catch (error) {
            console.error('Failed to delete plant:', error);
            setPlants(originalPlants);
        }
    };
    
    const handleUpdatePlantActivity = async (plantId: Plant['id'], activity: 'water' | 'fertilize' | 'groom') => {
        const originalPlants = plants;
        const today = new Date().toISOString();
        const activityKey = `last${activity.charAt(0).toUpperCase() + activity.slice(1)}ed` as keyof Plant;
        setPlants(currentPlants =>
            currentPlants.map(p => p.id === plantId ? { ...p, [activityKey]: today } : p)
        );
        try {
            const updatedPlant = await updatePlantActivity(plantId, activity, token);
            setPlants(currentPlants => currentPlants.map(p => p.id === plantId ? updatedPlant : p));
        } catch (error) {
            console.error('Failed to update activity:', error);
            setPlants(originalPlants);
        }
    };

    const handleAddPlant = async (plantFormData: FormData) => {
        try {
            const newPlant = await addPlant(plantFormData, token);
            setPlants(prevPlants => [newPlant, ...prevPlants]);
            closeAddPlantModal();
        } catch (error) {
            console.error('Failed to add plant:', error);
        }
    };

    const handleUpdatePlant = async (plantToUpdate: Plant) => {
        const originalPlants = plants;
        setPlants(currentPlants =>
            currentPlants.map(p => (p.id === plantToUpdate.id ? plantToUpdate : p))
        );
        try {
            await updatePlant(plantToUpdate.id, plantToUpdate, token);
        } catch (error) {
            console.error('Failed to update plant:', error);
            setPlants(originalPlants);
        }
    };

    // --- Journal Functions ---
    const handleSaveJournalEntry = async (formData: FormData) => {
        try {
            const newEntry = await addJournalEntry(formData, token);
            setJournalEntries(prev => [newEntry, ...prev]);
        } catch (error) {
             console.error('Failed to save journal entry:', error);
        }
    };
    
    const handleDeleteJournalEntry = async (id: JournalEntry['id']) => {
        const originalEntries = journalEntries;
        setJournalEntries(prev => prev.filter(entry => entry.id !== id));
        try {
            await deleteJournalEntry(id, token);
        } catch (error) {
            console.error('Failed to delete journal entry:', error);
            setJournalEntries(originalEntries);
        }
    };
    
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalPlants = plants.length;
        const needsWaterCount = plants.filter(p => addDays(p.lastWatered, p.wateringFrequency) <= today).length;
        const healthyCount = plants.filter(p => p.health === 'healthy').length;
        const needsAttentionCount = plants.filter(p => p.health === 'attention').length;

        return [
            { title: 'Total Plants', value: totalPlants, icon: <LeafIcon className="h-6 w-6 text-green-700" />, colorClasses: 'bg-green-100 text-green-800' },
            { title: 'Need Water', value: needsWaterCount, icon: <WaterDropIcon className="h-6 w-6 text-blue-700" />, colorClasses: 'bg-blue-100 text-blue-800' },
            { title: 'Healthy', value: healthyCount, icon: <CheckCircleIcon className="h-6 w-6 text-emerald-700" />, colorClasses: 'bg-emerald-100 text-emerald-800' },
            { title: 'Needs Attention', value: needsAttentionCount, icon: <ExclamationCircleIcon className="h-6 w-6 text-yellow-700" />, colorClasses: 'bg-yellow-100 text-yellow-800' },
        ];
    }, [plants]);

    const uniqueLocations = useMemo(() => ['all', ...Array.from(new Set(plants.map(p => p.location)))], [plants]);
    const uniqueLightLevels = useMemo(() => ['all', ...Array.from(new Set(plants.map(p => p.light)))], [plants]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setLocationFilter('all');
        setLightFilter('all');
        setSortBy('name-asc');
    };

    const filteredAndSortedPlants = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = plants;

        // 1. Main Stat Filter (from activeFilter)
        switch (activeFilter) {
            case 'Need Water':
                filtered = plants.filter(p => addDays(p.lastWatered, p.wateringFrequency) <= today);
                break;
            case 'Healthy':
                filtered = plants.filter(p => p.health === 'healthy');
                break;
            case 'Needs Attention':
                filtered = plants.filter(p => p.health === 'attention');
                break;
            case 'Total Plants':
            default:
                break;
        }

        if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));
        if (locationFilter !== 'all') filtered = filtered.filter(p => p.location === locationFilter);
        if (lightFilter !== 'all') filtered = filtered.filter(p => p.light === lightFilter);

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'next-watering':
                    const nextA = addDays(a.lastWatered, a.wateringFrequency).getTime();
                    const nextB = addDays(b.lastWatered, b.wateringFrequency).getTime();
                    return nextA - nextB;
                default: return 0;
            }
        });

    }, [plants, activeFilter, searchTerm, locationFilter, lightFilter, sortBy]);
    
    const tabs = [
        { name: 'My Plants', icon: <LeafIcon className="h-5 w-5 mr-2" /> },
        { name: 'Journal', icon: <JournalIcon className="h-5 w-5 mr-2" /> },
        { name: 'Statistics', icon: <ChartIcon className="h-5 w-5 mr-2" /> },
        { name: 'AI Assistant', icon: <AiIcon className="h-5 w-5 mr-2" /> },
    ];

    const renderActiveTabContent = () => {
        if (isLoading) return <DashboardSkeleton />;
        if (error) return <div className="text-center p-12 text-red-600">Error: {error}</div>;

        switch(activeTab) {
            case 'My Plants':
                return (
                    <div className="animate-fade-in">
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map(stat => 
                                <StatCard key={stat.title} {...stat} isActive={activeFilter === stat.title && !searchTerm && locationFilter === 'all' && lightFilter === 'all'} onClick={() => { setActiveFilter(stat.title); handleResetFilters(); }} />
                            )}
                        </section>
                        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-plant-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-plant-green outline-none" />
                            </div>
                            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2">
                                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-full text-sm px-3 py-2 bg-plant-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-plant-green outline-none">
                                    {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>)}
                                </select>
                                <select value={lightFilter} onChange={e => setLightFilter(e.target.value)} className="w-full text-sm px-3 py-2 bg-plant-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-plant-green outline-none">
                                    {uniqueLightLevels.map(light => <option key={light} value={light}>{light === 'all' ? 'All Light' : light}</option>)}
                                </select>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full text-sm px-3 py-2 bg-plant-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-plant-green outline-none">
                                    <option value="name-asc">Sort: Name A-Z</option>
                                    <option value="name-desc">Sort: Name Z-A</option>
                                    <option value="next-watering">Sort: Next Watering</option>
                                </select>
                                <button onClick={handleResetFilters} className="w-full sm:w-auto text-sm px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Reset</button>
                            </div>
                        </div>

                        {filteredAndSortedPlants.length === 0 ? (
                             <div className="text-center text-plant-gray py-12">
                                <h3 className="text-xl font-semibold mb-2">No Plants Found</h3>
                                <p className="mb-4">No plants match your current filter criteria.</p>
                                <button onClick={() => { handleResetFilters(); setActiveFilter('Total Plants');}} className="bg-plant-green text-white font-medium px-4 py-2 rounded-lg hover:bg-plant-green-dark transition-colors shadow-md"> View All Plants </button>
                            </div>
                        ) : (
                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredAndSortedPlants.map(plant => <PlantCard key={plant.id} plant={plant} onViewDetails={handleViewDetails} onDelete={handleDeletePlant} onUpdateActivity={handleUpdatePlantActivity} />)}
                            </section>
                        )}
                    </div>
                );
            case 'AI Assistant': return <AiAssistant token={token} />;
            case 'Journal': return <JournalTab entries={journalEntries} articles={articles} onNewEntry={() => setJournalModalOpen(true)} onViewEntry={(entry) => setViewingJournalEntry(entry)} onDeleteEntry={handleDeleteJournalEntry} onViewArticle={handleViewArticle} />;
            case 'Statistics': return <StatisticsTab plants={plants} />;
            default: return <div className="text-center text-plant-gray py-12 animate-fade-in">Content for {activeTab} is coming soon!</div>;
        }
    };

    return (
        <div className="bg-green-50 min-h-screen font-sans">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <LogoIcon className="h-8 w-8 text-plant-green" />
                        <div>
                            <h1 className="text-xl font-bold text-plant-dark">Plant Pal</h1>
                            <p className="text-sm text-plant-gray-dark">Welcome back, Pratik Patil!</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={openAddPlantModal} className="bg-plant-green text-white font-medium px-4 py-2 rounded-lg hover:bg-plant-green-dark transition-colors shadow-md flex items-center space-x-2">
                            <PlusIcon className="h-5 w-5" />
                            <span>Add Plant</span>
                        </button>
                        <button onClick={onLogout} className="font-semibold text-plant-gray-dark hover:text-plant-green">Logout</button>
                        <div className="relative">
                            <button className="h-10 w-10 bg-green-100 text-plant-green-dark font-bold rounded-full flex items-center justify-center">
                                PP
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-6">
                <section className="mb-8">
                    <div className="bg-white p-1.5 rounded-xl shadow-sm inline-flex items-center space-x-1 overflow-x-auto">
                        {tabs.map(tab => (
                             <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${activeTab === tab.name ? 'bg-plant-gray-light text-plant-dark' : 'text-plant-gray hover:bg-plant-gray-light/50'}`}>
                                 {tab.icon} {tab.name}
                             </button>
                        ))}
                    </div>
                </section>
                
                {renderActiveTabContent()}
                
            </main>
            <AddPlantModal isOpen={isAddPlantModalOpen} onClose={closeAddPlantModal} onAddPlant={handleAddPlant} token={token} />
            <PlantDetailsModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} plant={selectedPlant} onUpdatePlant={handleUpdatePlant} token={token} />
            <ArticleModal isOpen={isArticleModalOpen} onClose={() => setArticleModalOpen(false)} article={selectedArticle} />
            <JournalEntryModal isOpen={isJournalModalOpen} onClose={() => setJournalModalOpen(false)} onSave={handleSaveJournalEntry} />
            <ViewJournalEntryModal isOpen={!!viewingJournalEntry} onClose={() => setViewingJournalEntry(null)} entry={viewingJournalEntry} />
        </div>
    );
};

export default Dashboard;

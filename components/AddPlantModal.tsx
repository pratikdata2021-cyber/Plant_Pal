import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon, TrialSparkleIcon, LocationIcon, UploadIcon, AiIcon } from '../constants';
import { autoFillPlantDetails } from '../lib/api';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (plantData: FormData) => void;
  token: string;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({ isOpen, onClose, onAddPlant, token }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [plantPhoto, setPlantPhoto] = useState<string | null>(null);
  const [plantFile, setPlantFile] = useState<File | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);
  const [plantData, setPlantData] = useState({
      name: '',
      scientificName: '',
      location: '',
      wateringFrequency: 7,
      fertilizingFrequency: 30,
      sunlight: 'Medium Light',
      humidity: 'Medium Humidity',
      notes: ''
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
        // Reset form on open
        setPlantPhoto(null);
        setPlantFile(null);
        setIsAutoFilling(false);
        setAutoFillError(null);
        setPlantData({
            name: '',
            scientificName: '',
            location: '',
            wateringFrequency: 7,
            fertilizingFrequency: 30,
            sunlight: 'Medium Light',
            humidity: 'Medium Humidity',
            notes: ''
        });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlantData(prev => ({...prev, [name]: name.endsWith('Frequency') ? parseInt(value, 10) : value }));
  };

  const handleFileSelect = (file: File) => {
      if (file && file.type.startsWith('image/')) {
          setPlantFile(file);
          setPlantPhoto(URL.createObjectURL(file));
          setAutoFillError(null);
      }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
      setPlantPhoto(null);
      setPlantFile(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAutoFill = async () => {
    if (!plantFile) {
        setAutoFillError("Please upload a plant photo first.");
        return;
    }

    setIsAutoFilling(true);
    setAutoFillError(null);
    try {
        const aiData = await autoFillPlantDetails(plantFile, token);
        
        setPlantData(prev => ({
            ...prev,
            name: prev.name || (aiData.scientificName ? aiData.scientificName.split(' ')[0] : ''),
            scientificName: aiData.scientificName || prev.scientificName,
            wateringFrequency: aiData.wateringFrequency || prev.wateringFrequency,
            fertilizingFrequency: aiData.fertilizingFrequency || prev.fertilizingFrequency,
            sunlight: aiData.sunlight || prev.sunlight,
            humidity: aiData.humidity || prev.humidity,
            notes: aiData.notes || prev.notes,
        }));

    } catch (error) {
        console.error("Error with AI auto-fill:", error);
        setAutoFillError("Sorry, we couldn't get AI suggestions. Please check your connection and try again.");
    } finally {
        setIsAutoFilling(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(plantData).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    if (plantFile) {
        formData.append('photo', plantFile);
    }

    onAddPlant(formData);
  };

  const inputClasses = "w-full px-4 py-2 bg-plant-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-plant-green focus:border-transparent outline-none transition";
  const selectWrapperClasses = "relative";
  const selectClasses = `${inputClasses} appearance-none`;
  const labelClasses = "block text-sm font-medium text-plant-gray-dark mb-1";


  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        aria-modal="true"
        role="dialog"
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-plant-dark">Add New Plant</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="h-6 w-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Plant Photo</label>
                <input type="file" ref={fileInputRef} onChange={onFileInputChange} accept="image/*" className="hidden" />
                {!plantPhoto ? (
                     <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-plant-green"
                     >
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <span className="relative font-medium text-plant-green hover:text-plant-green-dark">
                                    Click to upload
                                </span>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative mt-1">
                        <img src={plantPhoto} alt="Plant preview" className="w-full h-48 object-cover rounded-md" />
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute top-2 right-2 bg-white/70 rounded-full p-1 text-gray-700 hover:bg-white"
                        >
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
            
            {plantPhoto && (
                <div className="my-4">
                    <button 
                        type="button" 
                        onClick={handleAutoFill}
                        disabled={isAutoFilling}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-plant-green hover:bg-plant-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-plant-green-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <AiIcon className={`h-5 w-5 ${isAutoFilling ? 'animate-spin' : ''}`} />
                        {isAutoFilling ? 'Getting details...' : 'Auto-fill details with AI'}
                    </button>
                     {autoFillError && (
                        <div className="mt-2 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
                            {autoFillError}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className={labelClasses}>Plant Name *</label>
                    <input type="text" id="name" name="name" value={plantData.name} onChange={handleChange} required className={inputClasses} placeholder="e.g., Monstera"/>
                </div>
                <div>
                    <label htmlFor="scientificName" className={labelClasses}>Scientific Name</label>
                    <input type="text" id="scientificName" name="scientificName" value={plantData.scientificName} onChange={handleChange} className={inputClasses} placeholder="e.g., Monstera deliciosa"/>
                </div>
            </div>

            <div>
              <label htmlFor="location" className={labelClasses}>Location *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LocationIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input type="text" id="location" name="location" value={plantData.location} onChange={handleChange} required className={`${inputClasses} pl-10`} placeholder="e.g., Living room, Bedroom window"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="wateringFrequency" className={labelClasses}>Watering Frequency (days) *</label>
                    <input type="number" id="wateringFrequency" name="wateringFrequency" value={plantData.wateringFrequency} onChange={handleChange} required className={inputClasses}/>
                </div>
                 <div>
                    <label htmlFor="fertilizingFrequency" className={labelClasses}>Fertilizing Frequency (days)</label>
                    <input type="number" id="fertilizingFrequency" name="fertilizingFrequency" value={plantData.fertilizingFrequency} onChange={handleChange} className={inputClasses}/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="sunlight" className={labelClasses}>Sunlight Requirements *</label>
                    <div className={selectWrapperClasses}>
                        <select id="sunlight" name="sunlight" value={plantData.sunlight} onChange={handleChange} required className={selectClasses}>
                            <option>Low Light</option>
                            <option>Medium Light</option>
                            <option>Bright Light</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                         </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="humidity" className={labelClasses}>Humidity Preference</label>
                     <div className={selectWrapperClasses}>
                        <select id="humidity" name="humidity" value={plantData.humidity} onChange={handleChange} className={selectClasses}>
                            <option>Low Humidity</option>
                            <option>Medium Humidity</option>
                            <option>High Humidity</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                         </div>
                    </div>
                </div>
            </div>
            
            <div>
                <label htmlFor="notes" className={labelClasses}>Notes</label>
                <textarea id="notes" name="notes" rows={3} value={plantData.notes} onChange={handleChange} className={inputClasses} placeholder="Add any additional notes about your plant..."></textarea>
            </div>

            <div className="mt-6 bg-plant-purple-light border border-plant-purple-light/50 rounded-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0 text-plant-purple-dark">
                    <TrialSparkleIcon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-plant-purple-dark">AI Tip</h3>
                    <p className="text-sm text-plant-gray-dark mt-1">Not sure about watering frequency? Most houseplants thrive with watering every 7-10 days. You can always adjust this based on your plant's needs!</p>
                </div>
            </div>
            
            <div className="flex justify-end items-center pt-6 space-x-4">
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg font-bold transition-colors bg-white border border-gray-300 hover:bg-gray-100 text-plant-dark">
                    Cancel
                </button>
                 <button type="submit" className="px-6 py-2 rounded-lg font-bold transition-colors bg-plant-green text-white hover:bg-plant-green-dark">
                    Add Plant
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlantModal;

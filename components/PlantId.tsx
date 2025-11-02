
import React from 'react';
import { CameraIcon, CloudIcon } from '../constants';

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center shadow-md border border-gray-200">
    <p className="text-3xl font-bold text-plant-green">{value}</p>
    <p className="text-plant-gray">{label}</p>
  </div>
);

const PlantId: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center bg-blue-100 text-blue-600 font-semibold px-4 py-1 rounded-full mb-4">
            <CameraIcon className="h-5 w-5 mr-2" />
            Smart Recognition
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Instant Plant Identification</h2>
          <p className="text-lg text-plant-gray mb-8">
            Simply snap a photo and let our AI identify the species, provide care instructions, and add it to your collection automatically.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard value="10K+" label="Species" />
            <StatCard value="95%" label="Accuracy" />
            <StatCard value="<3s" label="Results" />
          </div>
          <button className="flex items-center justify-center bg-white text-plant-dark font-bold px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors shadow-lg">
            Try Plant ID <CameraIcon className="h-5 w-5 ml-2" />
          </button>
        </div>
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1619595944835-9d3e5a5b5a93?w=600&h=500&fit=crop&q=80" alt="Phone identifying a plant" className="rounded-3xl shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105" />
          <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3">
            <div className="bg-blue-100 text-blue-500 p-3 rounded-full">
              <CloudIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-plant-gray">Water in</p>
              <p className="font-bold text-lg">2 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlantId;
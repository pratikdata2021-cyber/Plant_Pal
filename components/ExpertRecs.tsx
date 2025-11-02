
import React from 'react';
import { CheckIcon, SparkleIcon, SunIcon } from '../constants';

const ExpertRecs: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 md:order-1">
          <img src="https://images.unsplash.com/photo-1525498128493-380d1990a112?w=600&h=500&fit=crop&q=80" alt="Person tending to a plant" className="rounded-3xl shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105" />
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3">
            <div className="bg-yellow-100 text-yellow-500 p-3 rounded-full">
              <SunIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-plant-gray">Light Level</p>
              <p className="font-bold text-lg">Optimal</p>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="inline-flex items-center bg-purple-100 text-purple-600 font-semibold px-4 py-1 rounded-full mb-4">
            <SparkleIcon className="h-5 w-5 mr-2" />
            AI-Powered Insights
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Expert Care Recommendations</h2>
          <p className="text-lg text-plant-gray mb-6">
            Get personalized care instructions tailored to each plant's unique needs. Our AI considers factors like light, humidity, and season.
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center">
              <CheckIcon className="h-6 w-6 text-plant-green mr-3 flex-shrink-0" />
              <span>Real-time Health Monitoring</span>
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-6 w-6 text-plant-green mr-3 flex-shrink-0" />
              <span>Personalized Schedules</span>
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-6 w-6 text-plant-green mr-3 flex-shrink-0" />
              <span>Seasonal Adjustments</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ExpertRecs;
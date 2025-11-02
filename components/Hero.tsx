import React from 'react';
import { SparkleIcon, ArrowRightIcon, CheckIcon, StarIcon, HeartIcon, UsersIcon } from '../constants';

interface HeroProps {
  onSignUpClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSignUpClick }) => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center bg-plant-green/10 text-plant-green-dark font-semibold px-4 py-1 rounded-full mb-4">
            <SparkleIcon className="h-5 w-5 mr-2" />
            AI-Powered Plant Care
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-plant-dark leading-tight mb-6">
            Your Personal <span className="animate-gradient-sweep">Plant Care</span> Companion
          </h1>
          <p className="text-lg text-plant-gray mb-8 max-w-xl mx-auto md:mx-0">
            Keep your houseplants thriving with smart reminders, AI-powered care tips, and personalized schedules. Plant Pal makes plant parenting effortless.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-6">
            <button onClick={onSignUpClick} className="flex items-center justify-center bg-plant-green text-white font-bold px-8 py-4 rounded-lg hover:bg-plant-green-dark transition-transform hover:scale-105 shadow-lg">
              Start Free Trial <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
            <button className="bg-white text-plant-dark font-bold px-8 py-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg">
              Watch Demo
            </button>
          </div>
          <div className="flex justify-center md:justify-start space-x-6 text-plant-gray">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-plant-green mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-plant-green mr-2" />
              <span>Free forever plan</span>
            </div>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=500&h=600&fit=crop&q=80" alt="Lush green plant" className="rounded-3xl shadow-2xl object-cover w-full max-w-md transition-transform duration-300 ease-in-out hover:scale-105" />
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-pulse">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                ))}
              </div>
              <p className="text-center font-semibold mt-1">4.9/5 Rating</p>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3">
               <div className="bg-plant-green text-white p-3 rounded-full">
                <UsersIcon className="h-6 w-6"/>
               </div>
               <div>
                 <p className="font-bold text-lg">50,000+</p>
                 <p className="text-sm text-plant-gray">Happy Plant Parents</p>
               </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <HeartIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
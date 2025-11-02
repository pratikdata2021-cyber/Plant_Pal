
import React from 'react';
import { QuoteIcon, StarIcon } from '../constants';

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatar: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, title, avatar }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
    <QuoteIcon className="h-10 w-10 text-plant-green mb-4" />
    <div className="flex mb-4">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
      ))}
    </div>
    <p className="text-plant-gray mb-6 flex-grow">"{quote}"</p>
    <div className="flex items-center">
      <img src={avatar} alt={name} className="h-12 w-12 rounded-full mr-4" />
      <div>
        <p className="font-bold text-plant-dark">{name}</p>
        <p className="text-sm text-plant-gray">{title}</p>
      </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  const testimonialsData: TestimonialCardProps[] = [
    {
      quote: "Plant Pal transformed my black thumb into a green one! I have not lost a single plant since I started using it.",
      name: "Sarah Johnson",
      title: "Urban Gardener",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80"
    },
    {
      quote: "The AI assistant is incredibly helpful. It is like having a botanist in my pocket 24/7!",
      name: "Michael Chen",
      title: "Plant Enthusiast",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
    },
    {
      quote: "Perfect for managing client plants! The journal feature helps me track progress for every project.",
      name: "Emily Rodriguez",
      title: "Interior Designer",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80"
    }
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Loved by Plant Parents Everywhere</h2>
          <p className="text-lg text-plant-gray mt-4">See what our community has to say</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
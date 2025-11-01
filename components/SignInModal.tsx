import React, { useEffect, useRef, useState } from 'react';
import { LogoIcon, CloseIcon, UserIcon, EmailIcon, LockIcon, GoogleIcon, GithubIcon, TrialSparkleIcon } from '../constants';
import { signIn, signUp } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
  onLoginSuccess: (token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onLoginSuccess }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [initialMode, isOpen]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      let response;
      if (mode === 'signup') {
        response = await signUp({
          fullname: data.fullname as string,
          email: data.email as string,
          password: data.password as string,
        });
      } else {
        response = await signIn({
          email: data.email as string,
          password: data.password as string,
        });
      }
      
      onLoginSuccess(response.token);

    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const TogglerButton: React.FC<{ label: string; currentMode: string; targetMode: string; onClick: () => void }> = ({ label, currentMode, targetMode, onClick}) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-1/2 py-2.5 text-sm font-semibold rounded-md transition-colors ${
        currentMode === targetMode
          ? 'bg-white text-plant-dark shadow'
          : 'text-plant-gray hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        aria-modal="true"
        role="dialog"
      >
        <div className="flex flex-col items-center mb-6">
          <LogoIcon className="h-10 w-10 text-plant-green mb-2" />
          <h2 className="text-2xl font-bold text-plant-dark">Plant Pal</h2>
        </div>
        
        <div className="bg-plant-gray-light p-1 rounded-lg flex mb-6">
          <TogglerButton label="Sign Up" currentMode={mode} targetMode="signup" onClick={() => setMode('signup')} />
          <TogglerButton label="Sign In" currentMode={mode} targetMode="signin" onClick={() => setMode('signin')} />
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-plant-gray-dark mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input type="text" id="fullname" name="fullname" required className="w-full pl-10 pr-4 py-2 bg-plant-gray-light border border-transparent rounded-lg focus:ring-2 focus:ring-plant-green focus:border-transparent outline-none transition" placeholder="Enter your name"/>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-plant-gray-dark mb-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <EmailIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input type="email" id="email" name="email" required className="w-full pl-10 pr-4 py-2 bg-plant-gray-light border border-transparent rounded-lg focus:ring-2 focus:ring-plant-green focus:border-transparent outline-none transition" placeholder="Enter your email"/>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-plant-gray-dark mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input type="password" id="password" name="password" required className="w-full pl-10 pr-4 py-2 bg-plant-gray-light border border-transparent rounded-lg focus:ring-2 focus:ring-plant-green focus:border-transparent outline-none transition" placeholder="Create a password"/>
            </div>
          </div>
          
          {mode === 'signup' && (
            <div className="flex items-center">
              <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 rounded border-gray-300 text-plant-green focus:ring-plant-green" />
              <label htmlFor="terms" className="ml-2 block text-sm text-plant-gray">I agree to the <a href="#" className="font-medium text-plant-green hover:underline">Terms of Service and Privacy Policy</a></label>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full bg-plant-green text-white font-bold py-3 px-4 rounded-lg hover:bg-plant-green-dark transition-all duration-300 ease-in-out disabled:bg-plant-gray">
            {isLoading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-plant-gray">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-plant-gray-dark bg-white hover:bg-gray-50 transition-colors">
            <GoogleIcon className="h-5 w-5 mr-2" />
            Google
          </button>
          <button className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-plant-gray-dark bg-white hover:bg-gray-50 transition-colors">
            <GithubIcon className="h-5 w-5 mr-2" />
            GitHub
          </button>
        </div>
        
        <div className="mt-6 bg-plant-purple-light border border-plant-purple-light rounded-lg p-4 flex items-start space-x-3">
            <div className="flex-shrink-0 text-plant-purple-dark">
                <TrialSparkleIcon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-plant-purple-dark">Start Your Free Trial</h3>
                <p className="text-sm text-plant-gray-dark mt-1">No credit card required. Get full access to all features for 14 days.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-12 text-center border-t border-slate-700 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500 mt-2.5">
          &copy; {new Date().getFullYear()} DevDiscovery AI. Explore with curiosity & innovate with purpose.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
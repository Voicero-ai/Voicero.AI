import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          About Unknown Co.
        </h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 text-center">
          We are a leading company specializing in delivering high-quality solutions that 
          empower businesses of all sizes to reach their full potential. Our team of experts 
          thrives on innovation, collaboration, and dedication to our clients' success.
        </p>
        <div className="flex justify-center">
          <img
            src="https://via.placeholder.com/600x400"
            alt="About us"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default About; 
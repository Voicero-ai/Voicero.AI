import React from 'react';

const servicesData = [
  {
    title: 'Consulting',
    description: 'We offer expert advice to grow your business.'
  },
  {
    title: 'Development',
    description: 'Custom software solutions tailored to your needs.'
  },
  {
    title: 'Marketing',
    description: 'Strategies to increase brand awareness and boost sales.'
  },
];

const Services: React.FC = () => {
  return (
    <section id="services" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center text-center"
            >
              <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
              <p className="text-gray-700">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 
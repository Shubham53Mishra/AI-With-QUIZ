'use client';

import Button from './Button';

export default function CTA() {
  return (
    <section className="py-20 bg-linear-to-r from-blue-600 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Create Your First Quiz?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Join thousands of educators, trainers, and professionals who are making learning fun and interactive.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" size="lg">
            Create a quiz for free
          </Button>
          <Button variant="default" size="lg">
            Learn more
          </Button>
        </div>
      </div>
    </section>
  );
}

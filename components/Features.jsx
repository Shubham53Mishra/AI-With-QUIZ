'use client';

import { Card, CardContent, CardTitle } from './Card';

export default function Features() {
  const features = [
    {
      title: "Easy to Create",
      description: "Create beautiful quizzes in minutes with our intuitive quiz builder.",
      icon: "✨",
    },
    {
      title: "Live Quiz Hosting",
      description: "Host real-time quizzes and engage your audience with instant results.",
      icon: "🎯",
    },
    {
      title: "Analytics & Reports",
      description: "Track performance and get detailed insights about your quiz results.",
      icon: "📊",
    },
    {
      title: "Mobile Friendly",
      description: "Perfect on any device - desktop, tablet, or mobile phone.",
      icon: "📱",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Host a quiz to energize your audience
          </h2>
          <p className="text-xl text-gray-600">
            Looking to level up your presentations? Add excitement and interaction with a live quiz!
            <br />
            Whether serious or casual, our free quiz maker ensures it&apos;s fun and engaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <CardContent>
                <div className="text-5xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

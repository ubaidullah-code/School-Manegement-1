import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { GraduationCap, Users, Calendar, BookOpen, Pause, Play } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom'; // ✅ Correct import

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <GraduationCap className="w-12 h-12 text-indigo-400 mb-4" />,
    title: 'Smart Learning',
    description: 'AI-powered personalized learning paths for every student',
  },
  {
    icon: <Users className="w-12 h-12 text-indigo-400 mb-4" />,
    title: 'Collaboration',
    description: 'Real-time interaction between teachers, students, and parents',
  },
  {
    icon: <Calendar className="w-12 h-12 text-indigo-400 mb-4" />,
    title: 'Scheduling',
    description: 'Automated timetable management and event planning',
  },
  {
    icon: <BookOpen className="w-12 h-12 text-indigo-400 mb-4" />,
    title: 'Resources',
    description: 'Digital library and learning materials at your fingertips',
  },
];

export function Hero() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const navigate = useNavigate(); // ✅ Correct usage

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.from(featuresRef.current?.children || [], {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 min-h-screen items-center">
          <div ref={heroTextRef} className="z-10">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              Next-Gen School Management
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-300">
            Transform Your Educational Institution with Empowering Education
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 flex items-center gap-2"
              >
                {autoRotate ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {autoRotate ? 'Pause' : 'Play'} Animation
              </button>
            </div>
          </div>

          <div className="h-[600px] relative">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <Scene autoRotate={autoRotate} />
            </Canvas>
          </div>
        </div>

        <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 py-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 transform transition-all duration-300 hover:scale-105"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

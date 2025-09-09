'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Sparkles, 
  BookOpen, 
  User,
  ArrowRight,
  CheckCircle,
  Globe,
  Award,
  Heart,
  Star,
  Quote,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered Questions",
      description: "Get tailored questions based on target colleges and capture meaningful details about your students"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Multiple Drafts",
      description: "Generate 3-4 different recommendation letters and choose the one that best represents your student"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Student Management",
      description: "Organize student profiles and track recommendation requests all in one place"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "US College Focused",
      description: "Specifically designed for Bangladeshi students applying to US colleges and universities"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Professional Quality",
      description: "Generate professional-grade letters that meet US college admission standards"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Teacher-Friendly",
      description: "Simple interface designed for teachers to create meaningful recommendations easily"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Ahmed",
      role: "English Teacher, Dhaka International School",
      content: "This tool has transformed how I write recommendation letters. The AI questions help me capture details I might have missed, and my students are getting into their dream colleges!",
      rating: 5
    },
    {
      name: "Prof. Rashid Hassan",
      role: "Mathematics Department, Chittagong Grammar School",
      content: "I've written over 50 recommendation letters using this platform. The quality is exceptional, and it saves me hours of work while ensuring each letter is personalized.",
      rating: 5
    },
    {
      name: "Ms. Fatima Khan",
      role: "Science Teacher, International School Dhaka",
      content: "My students are successfully getting into top US universities. This platform helps me articulate their strengths in a way that resonates with American admissions officers.",
      rating: 5
    }
  ];

  const useCases = [
    {
      title: "High School Teacher",
      description: "A chemistry teacher from Dhaka writes compelling letters for students applying to MIT, Stanford, and other top engineering schools.",
      outcome: "85% acceptance rate to target colleges"
    },
    {
      title: "English Department Head",
      description: "Department head manages letters for 30+ students applying to liberal arts colleges across the US.",
      outcome: "Streamlined process, saved 20+ hours per week"
    },
    {
      title: "International School Counselor",
      description: "School counselor coordinates with multiple teachers to ensure consistent, high-quality recommendations.",
      outcome: "Improved student satisfaction and college outcomes"
    }
  ];

  const stats = [
    { number: "500+", label: "Recommendation Letters Generated" },
    { number: "150+", label: "Teachers Using Platform" },
    { number: "80+", label: "Students Accepted to Top Universities" },
    { number: "95%", label: "Teacher Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">RecommendAI</span>
            </button>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/about')}
                className="text-gray-600 hover:text-gray-900"
              >
                About
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Transform Your Students' 
                <span className="block text-yellow-300">College Dreams</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                AI-powered recommendation letter platform designed specifically for Bangladeshi teachers 
                helping students get into top US colleges and universities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center"
                >
                  Start Writing Letters
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push('/about')}
                  className="bg-white/10 text-white border-2 border-white/20 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Write Outstanding Letters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines AI technology with deep understanding of US college admissions 
              to help you create compelling recommendation letters.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Bangladeshi Educators
            </h2>
            <p className="text-xl text-gray-600">
              See how teachers across Bangladesh are helping their students succeed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {useCase.description}
                </p>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{useCase.outcome}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Teachers Are Saying
            </h2>
            <p className="text-xl text-gray-600">
              Hear from educators who are making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-50 p-8 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-700 mb-6">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Help Your Students Succeed?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of Bangladeshi teachers who are already using our platform 
            to write compelling recommendation letters.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">RecommendAI</span>
              </div>
              <p className="text-gray-400">
                Empowering Bangladeshi teachers to write compelling recommendation letters 
                for their students' US college applications.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <div className="space-y-2">
                <button onClick={() => router.push('/auth')} className="block text-gray-400 hover:text-white">
                  Get Started
                </button>
                <button onClick={() => router.push('/about')} className="block text-gray-400 hover:text-white">
                  About Us
                </button>
                <button onClick={() => router.push('/contact')} className="block text-gray-400 hover:text-white">
                  Contact
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <div className="text-gray-400">Help Center</div>
                <div className="text-gray-400">User Guide</div>
                <div className="text-gray-400">FAQ</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  nafisahmedmunim@gmail.com
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (920) 815-9996
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  24/A West Merul Mosque Road, Dhaka 1209
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RecommendAI.org. All rights reserved. Made with ❤️ for Bangladeshi educators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Users, 
  Target, 
  Globe,
  Heart,
  Lightbulb,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  const mission = [
    "Bridge the gap between Bangladeshi education and US college admissions",
    "Empower teachers with AI-powered tools to write compelling recommendation letters",
    "Help talented Bangladeshi students achieve their dreams of studying in the US",
    "Democratize access to high-quality recommendation letter writing"
  ];

  const teamMembers = [
    {
      name: "Nafis Ahmed Munim",
      role: "Founder & CEO",
      description: "Passionate about helping Bangladeshi students succeed in their journey to US higher education through innovative technology solutions.",
      icon: <GraduationCap className="h-8 w-8" />
    },
    {
      name: "AI Research Team",
      role: "Technology Partners",
      description: "Experts in natural language processing and educational technology.",
      icon: <Lightbulb className="h-8 w-8" />
    },
    {
      name: "Education Advisors",
      role: "Content Specialists",
      description: "US college admissions experts and Bangladeshi education professionals.",
      icon: <BookOpen className="h-8 w-8" />
    }
  ];

  const features = [
    {
      title: "Intelligent Questionnaire System",
      description: "Our AI generates targeted questions based on the specific college and program your student is applying to, ensuring every letter captures the most relevant details.",
      icon: <Target className="h-8 w-8" />
    },
    {
      title: "Multiple Draft Generation",
      description: "Generate 3-4 different versions of each recommendation letter, each with unique tone and focus areas, giving you options to choose the best fit.",
      icon: <Award className="h-8 w-8" />
    },
    {
      title: "Student Portfolio Management",
      description: "Comprehensive profiles for each student including academic history, extracurriculars, target colleges, and ongoing recommendation requests.",
      icon: <Users className="h-8 w-8" />
    },
    {
      title: "US College Database",
      description: "Integrated database of US colleges with their specific values, characteristics, and what they look for in applicants.",
      icon: <Globe className="h-8 w-8" />
    }
  ];

  const workflow = [
    {
      step: 1,
      title: "Student Submits Request",
      description: "Students create profiles and request recommendation letters for specific colleges"
    },
    {
      step: 2,
      title: "AI Generates Questions",
      description: "Our system creates tailored questions based on the target college and student profile"
    },
    {
      step: 3,
      title: "Teacher Answers Questions",
      description: "Teachers provide insights about the student through our guided questionnaire"
    },
    {
      step: 4,
      title: "AI Creates Drafts",
      description: "Multiple high-quality letter drafts are generated using advanced AI"
    },
    {
      step: 5,
      title: "Teacher Reviews & Finalizes",
      description: "Teachers can edit, customize, and select the best version for submission"
    }
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
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Home
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6">About RecommendAI</h1>
            <p className="text-xl text-blue-100">
              We're on a mission to help Bangladeshi students reach their full potential 
              by empowering their teachers with cutting-edge AI technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-8">
                Bangladesh has incredibly talented students who dream of studying at top US universities. 
                However, many struggle with the recommendation letter process due to unfamiliarity with 
                US college expectations and time constraints faced by teachers.
              </p>
              <div className="space-y-4">
                {mission.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-2xl">
                <Heart className="h-16 w-16 text-red-500 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Built with Purpose</h3>
                <p className="text-gray-700">
                  Every feature in our platform is designed with one goal in mind: helping Bangladeshi 
                  students succeed in their journey to US higher education. We understand the unique 
                  challenges faced by our educators and students.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes it easy for teachers to create outstanding 
              recommendation letters that truly capture their students' potential.
            </p>
          </div>

          <div className="space-y-8">
            {workflow.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < workflow.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 mt-3" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">
              Discover the technology and features that make our platform unique
            </p>
          </div>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="text-blue-600 mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-700">{feature.description}</p>
                </div>
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl flex items-center justify-center">
                      <span className="text-gray-600">Feature Visualization</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">
              Passionate educators and technologists working together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-lg text-center"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-blue-600 font-semibold mb-4">{member.role}</div>
                <p className="text-gray-600">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join us in empowering the next generation of Bangladeshi leaders. 
            Start creating impactful recommendation letters today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Start Using Platform
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="bg-white/10 border-2 border-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">RecommendAI</span>
          </div>
          <p className="text-gray-400">
            &copy; 2024 RecommendAI.org. All rights reserved. Made with ❤️ for Bangladeshi educators.
          </p>
        </div>
      </footer>
    </div>
  );
}
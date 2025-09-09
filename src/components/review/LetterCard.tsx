'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Star, Heart, Briefcase } from 'lucide-react';
import { GeneratedLetter } from '@/types';

interface LetterCardProps {
  letter: GeneratedLetter;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

const getToneIcon = (tone: string) => {
  switch (tone) {
    case 'formal':
      return <Briefcase className="h-4 w-4" />;
    case 'warm':
      return <Heart className="h-4 w-4" />;
    case 'enthusiastic':
      return <Star className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getToneColor = (tone: string) => {
  switch (tone) {
    case 'formal':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'warm':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'enthusiastic':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};

const getToneDescription = (tone: string) => {
  switch (tone) {
    case 'formal':
      return 'Professional and structured approach highlighting academic achievements';
    case 'warm':
      return 'Personal and heartfelt tone emphasizing character and relationships';
    case 'enthusiastic':
      return 'Energetic and positive tone showcasing leadership and potential';
    default:
      return 'Balanced approach covering multiple aspects';
  }
};

export default function LetterCard({ letter, index, isSelected, onSelect }: LetterCardProps) {
  const wordCount = letter.content.split(' ').length;
  const previewText = letter.content.substring(0, 150) + '...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getToneColor(letter.tone)}`}>
            {getToneIcon(letter.tone)}
            <span className="capitalize">{letter.tone}</span>
          </div>
        </div>
        {isSelected && (
          <div className="flex items-center text-blue-600">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {getToneDescription(letter.tone)}
      </p>

      <div className="text-xs text-gray-500 mb-3">
        <span>{wordCount} words</span>
        <span className="mx-2">•</span>
        <span>Focus: {letter.focus.slice(0, 2).join(', ')}</span>
        {letter.focus.length > 2 && <span> +{letter.focus.length - 2}</span>}
      </div>

      <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 leading-relaxed">
        {previewText}
      </div>
    </motion.div>
  );
}
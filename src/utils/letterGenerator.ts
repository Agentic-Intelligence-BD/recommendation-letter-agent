import { Student, College, Answer, GeneratedLetter } from '@/types';

interface LetterGenerationContext {
  student: Student;
  college: College;
  answers: Answer[];
}

const LETTER_TEMPLATES = {
  formal: {
    tone: 'formal' as const,
    opening: (student: string, college: string) => 
      `Dear Admissions Committee at ${college},\n\nI am writing to provide my strongest recommendation for ${student}, who has been a student in my class. It is my pleasure to recommend ${student} for admission to your esteemed institution.`,
    
    closing: (student: string) =>
      `In conclusion, I recommend ${student} without reservation. ${student} would be an excellent addition to your academic community and will undoubtedly contribute significantly to your institution.\n\nSincerely,`
  },
  
  warm: {
    tone: 'warm' as const,
    opening: (student: string, college: string) =>
      `Dear Admissions Officers at ${college},\n\nIt brings me great joy to write this letter of recommendation for ${student}. Having had the privilege of teaching ${student}, I can confidently say that they are among the most remarkable students I have encountered in my teaching career.`,
    
    closing: (student: string) =>
      `I wholeheartedly endorse ${student}'s application to your institution. They have the character, intellect, and drive to excel in your academic environment and beyond.\n\nWith warm regards,`
  },
  
  enthusiastic: {
    tone: 'enthusiastic' as const,
    opening: (student: string, college: string) =>
      `Dear ${college} Admissions Team,\n\nI am delighted to write this letter of recommendation for ${student}! In my years of teaching, few students have impressed me as much as ${student} has. I recommend ${student} with tremendous enthusiasm.`,
    
    closing: (student: string) =>
      `${student} is exactly the kind of student who will thrive at your institution and make meaningful contributions to your community. I give ${student} my highest recommendation!\n\nBest regards,`
  }
};

export class LetterGenerator {
  private context: LetterGenerationContext;

  constructor(context: LetterGenerationContext) {
    this.context = context;
  }

  generateMultipleLetters(): GeneratedLetter[] {
    const letters: GeneratedLetter[] = [];
    
    // Generate 3 different versions with different tones and focuses
    letters.push(this.generateLetter('formal', ['academic', 'character']));
    letters.push(this.generateLetter('warm', ['personal', 'social', 'character']));
    letters.push(this.generateLetter('enthusiastic', ['leadership', 'extracurricular', 'academic']));
    
    // If there are strong leadership answers, generate a leadership-focused letter
    const hasLeadershipAnswers = this.context.answers.some(answer => 
      answer.questionId.includes('leadership') && answer.response.length > 50
    );
    
    if (hasLeadershipAnswers) {
      letters.push(this.generateLetter('warm', ['leadership', 'social', 'character']));
    }

    return letters;
  }

  private generateLetter(tone: 'formal' | 'warm' | 'enthusiastic', focusAreas: string[]): GeneratedLetter {
    const template = LETTER_TEMPLATES[tone];
    const { student, college } = this.context;
    
    const content = this.buildLetterContent(template, focusAreas);
    
    return {
      id: `${tone}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      tone,
      focus: focusAreas,
      wordCount: content.split(/\s+/).length,
      createdAt: new Date()
    };
  }

  private buildLetterContent(
    template: typeof LETTER_TEMPLATES[keyof typeof LETTER_TEMPLATES], 
    focusAreas: string[]
  ): string {
    const { student, college } = this.context;
    
    let content = template.opening(student.name, college.name) + '\n\n';
    
    // Academic section
    if (focusAreas.includes('academic')) {
      content += this.generateAcademicSection() + '\n\n';
    }
    
    // Character section
    if (focusAreas.includes('character')) {
      content += this.generateCharacterSection() + '\n\n';
    }
    
    // Personal anecdotes section
    if (focusAreas.includes('personal')) {
      content += this.generatePersonalSection() + '\n\n';
    }
    
    // Social/Leadership section
    if (focusAreas.includes('social') || focusAreas.includes('leadership')) {
      content += this.generateSocialLeadershipSection() + '\n\n';
    }
    
    // Extracurricular section
    if (focusAreas.includes('extracurricular')) {
      content += this.generateExtracurricularSection() + '\n\n';
    }
    
    // College-specific alignment
    content += this.generateCollegeAlignmentSection() + '\n\n';
    
    content += template.closing(student.name);
    
    return content;
  }

  private generateAcademicSection(): string {
    const academicAnswers = this.context.answers.filter(a => 
      a.questionId.includes('academic')
    );
    
    if (academicAnswers.length === 0) {
      return `Academically, ${this.context.student.name} has demonstrated consistent excellence in my class. Their dedication to learning and intellectual curiosity set them apart from their peers.`;
    }
    
    const primaryAnswer = academicAnswers[0];
    const hasGPA = this.context.student.gpa !== undefined;
    
    let section = `Academically, ${this.context.student.name} has been exceptional. `;
    
    // Incorporate the teacher's specific response
    if (primaryAnswer.response.length > 50) {
      section += this.processTeacherResponse(primaryAnswer.response);
    } else {
      section += `Their performance in my class has been consistently outstanding, demonstrating both intellectual ability and genuine curiosity.`;
    }
    
    if (hasGPA) {
      section += ` With a GPA of ${this.context.student.gpa}, ${this.context.student.name} ranks among the top performers in their cohort.`;
    }
    
    // Add subject-specific details
    if (this.context.student.subjects.length > 0) {
      section += ` Their strength spans across ${this.context.student.subjects.slice(0, 2).join(' and ')}, showing remarkable versatility in their academic pursuits.`;
    }
    
    return section;
  }

  private generateCharacterSection(): string {
    const characterAnswers = this.context.answers.filter(a => 
      a.questionId.includes('character')
    );
    
    let section = `What truly distinguishes ${this.context.student.name} is their exceptional character. `;
    
    if (characterAnswers.length > 0) {
      section += this.processTeacherResponse(characterAnswers[0].response);
      
      // Add follow-up details if available
      if (characterAnswers[0].notes) {
        section += ` ${this.processTeacherResponse(characterAnswers[0].notes)}`;
      }
    } else {
      section += `They demonstrate integrity, respect for others, and a genuine desire to contribute positively to their community.`;
    }
    
    return section;
  }

  private generatePersonalSection(): string {
    const personalAnswers = this.context.answers.filter(a => 
      a.questionId.includes('personal')
    );
    
    let section = `To give you a more personal perspective on ${this.context.student.name}, `;
    
    if (personalAnswers.length > 0) {
      const mainStory = personalAnswers.find(a => a.response.length > 100);
      if (mainStory) {
        section += this.processTeacherResponse(mainStory.response);
      } else {
        section += this.processTeacherResponse(personalAnswers[0].response);
      }
    } else {
      section += `I can share that they consistently go above and beyond in small but meaningful ways, showing consideration for others and genuine care for their learning environment.`;
    }
    
    return section;
  }

  private generateSocialLeadershipSection(): string {
    const socialAnswers = this.context.answers.filter(a => 
      a.questionId.includes('social') || a.questionId.includes('leadership')
    );
    
    let section = `In terms of social and leadership qualities, `;
    
    if (socialAnswers.length > 0) {
      section += this.processTeacherResponse(socialAnswers[0].response);
      
      if (socialAnswers.length > 1) {
        section += ` Additionally, ${this.processTeacherResponse(socialAnswers[1].response)}`;
      }
    } else {
      section += `${this.context.student.name} demonstrates excellent interpersonal skills and shows natural leadership potential through their positive influence on classmates.`;
    }
    
    return section;
  }

  private generateExtracurricularSection(): string {
    const { student } = this.context;
    
    if (student.extracurriculars.length === 0) {
      return '';
    }
    
    let section = `Beyond academics, ${student.name} is actively involved in `;
    
    if (student.extracurriculars.length === 1) {
      section += `${student.extracurriculars[0]}`;
    } else if (student.extracurriculars.length === 2) {
      section += `${student.extracurriculars[0]} and ${student.extracurriculars[1]}`;
    } else {
      section += `${student.extracurriculars.slice(0, -1).join(', ')}, and ${student.extracurriculars[student.extracurriculars.length - 1]}`;
    }
    
    section += `. These activities showcase their well-rounded nature and commitment to personal growth beyond the classroom.`;
    
    return section;
  }

  private generateCollegeAlignmentSection(): string {
    const { student, college } = this.context;
    
    let section = `${student.name} would be an excellent fit for ${college.name}. `;
    
    // Align with college values
    if (college.values.length > 0) {
      section += `Your institution's emphasis on ${college.values.slice(0, 2).join(' and ')} aligns perfectly with ${student.name}'s demonstrated qualities. `;
    }
    
    // College type-specific alignment
    switch (college.type) {
      case 'technical':
        section += `Their analytical thinking and problem-solving abilities make them well-suited for your rigorous technical programs.`;
        break;
      case 'liberal-arts':
        section += `Their intellectual curiosity and well-rounded perspective align perfectly with your liberal arts tradition.`;
        break;
      case 'research':
        section += `Their inquisitive nature and academic excellence position them well for your research-focused environment.`;
        break;
      case 'business':
        section += `Their leadership potential and strategic thinking make them an ideal candidate for your business programs.`;
        break;
      default:
        section += `Their academic excellence and strong character make them well-suited for your institutional values.`;
    }
    
    return section;
  }

  private processTeacherResponse(response: string): string {
    // Clean up and format the teacher's response
    let processed = response.trim();
    
    // Ensure proper sentence ending
    if (!processed.endsWith('.') && !processed.endsWith('!') && !processed.endsWith('?')) {
      processed += '.';
    }
    
    // Capitalize first letter if needed
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
    
    return processed;
  }
}

// Utility function to generate letters
export const generateRecommendationLetters = (
  student: Student, 
  college: College, 
  answers: Answer[]
): GeneratedLetter[] => {
  const generator = new LetterGenerator({ student, college, answers });
  return generator.generateMultipleLetters();
};
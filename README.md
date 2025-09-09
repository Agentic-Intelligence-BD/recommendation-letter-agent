# 🎓 Recommendation Letter Assistant

A comprehensive web application designed specifically for Bangladeshi teachers to write compelling recommendation letters for their students' US college applications. The platform features AI-powered questionnaires, intelligent letter generation, and a complete student-teacher workflow management system.

## ✨ Features

### 👨‍🏫 For Teachers
- **Smart Questionnaires**: AI-generated questions tailored to specific colleges and student profiles
- **Multiple Letter Drafts**: Generate 3-4 different recommendation letters and choose the best one
- **Student Management**: Organize and track all student profiles in one dashboard
- **Progress Tracking**: Monitor recommendation letter progress from start to finish
- **Request Management**: Accept or decline student requests for recommendations

### 🎓 For Students
- **Profile Management**: Create detailed profiles with academic information and personal essays
- **Teacher Requests**: Send personalized requests to teachers for recommendation letters
- **Status Tracking**: Monitor the progress of recommendation letters in real-time
- **College Targeting**: Add target colleges with specific information for tailored letters
- **Bio & Supplementary Info**: Maintain personal essays and additional context for teachers

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recommendation-letter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📱 Application Flow

1. **Teacher Registration/Login**: Teachers create accounts with their institutional information
2. **Student Management**: Add student profiles with academic info, extracurriculars, and target colleges
3. **Recommendation Request**: Select a student and target college to start the letter writing process
4. **Time Commitment**: Confirm 30-40 minute time commitment for quality responses
5. **Intelligent Questionnaire**: Answer tailored questions about the student
6. **Letter Generation**: AI generates multiple letter drafts with different tones and focuses
7. **Review & Edit**: Preview, select, and customize the best letter
8. **Final Draft**: Save and download the completed recommendation letter

## 🎯 Key Benefits

- **Saves Time**: Structured approach reduces letter writing time from hours to 30-40 minutes
- **Improves Quality**: AI ensures comprehensive coverage of important aspects
- **College-Specific**: Content tailored to specific college values and expectations
- **Captures Nuances**: Questions designed to elicit meaningful stories and details
- **Multiple Options**: Generate several drafts to choose the best fit
- **Professional Output**: Well-structured, professional recommendation letters

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Main dashboard and student management
│   ├── recommendation/     # Letter writing workflow
│   └── globals.css         # Global styles
├── components/             # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard-specific components
│   ├── recommendation/    # Letter writing components
│   └── review/            # Letter review and editing
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions and helpers
```

## 🔮 Future Enhancements

- **Database Integration**: PostgreSQL with Prisma ORM
- **Real AI Integration**: OpenAI GPT or Anthropic Claude API
- **Email Integration**: Send letters directly via email
- **Multi-language Support**: Bengali and English interface
- **Advanced Analytics**: Track letter performance and success rates
- **Template Library**: Pre-built templates for different scenarios
- **Collaboration Features**: Multiple teachers collaborating on letters
- **Mobile App**: React Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Designed to address the real challenges faced by Bangladeshi teachers
- Inspired by the need for quality recommendation letters for US college applications
- Built with modern web technologies for optimal user experience

## 📞 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for Bangladeshi educators and students pursuing higher education opportunities.**
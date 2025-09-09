import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample questions
  const questions = [
    {
      text: "How would you describe {student}'s academic performance in your class?",
      category: 'academic',
      required: true,
      followUp: 'Can you provide a specific example of their academic excellence or improvement?'
    },
    {
      text: "What sets {student} apart academically from other students in their grade?",
      category: 'academic',
      required: true,
    },
    {
      text: "Describe {student}'s character and personal qualities. What makes them unique as a person?",
      category: 'character',
      required: true,
      followUp: 'Can you share a specific story or moment that exemplifies these qualities?'
    },
    {
      text: "Tell us about a time when {student} showed exceptional integrity or moral character.",
      category: 'character',
      required: true,
    },
    {
      text: "Has {student} demonstrated leadership qualities in your class or school? How?",
      category: 'leadership',
      required: false,
      followUp: 'What was the impact of their leadership on others?'
    },
    {
      text: "How does {student} interact with their peers and contribute to the classroom environment?",
      category: 'social',
      required: true,
    },
    {
      text: "Can you share a memorable moment or story about {student} that shows their personality or character?",
      category: 'personal',
      required: true,
    },
    {
      text: "What would you want admissions officers to know about {student} that might not be evident from their grades or test scores?",
      category: 'personal',
      required: true,
    },
  ]

  for (const question of questions) {
    await prisma.question.create({
      data: question,
    })
  }

  // Create sample colleges
  const colleges = [
    {
      name: 'MIT',
      type: 'technical',
      values: JSON.stringify(['Innovation', 'Problem-solving', 'Collaboration']),
      characteristics: JSON.stringify(['Technical excellence', 'Creative thinking', 'Leadership'])
    },
    {
      name: 'Harvard University',
      type: 'liberal-arts',
      values: JSON.stringify(['Academic excellence', 'Leadership', 'Service']),
      characteristics: JSON.stringify(['Critical thinking', 'Social responsibility', 'Innovation'])
    },
    {
      name: 'Stanford University',
      type: 'research',
      values: JSON.stringify(['Innovation', 'Research excellence', 'Entrepreneurship']),
      characteristics: JSON.stringify(['Research aptitude', 'Creative thinking', 'Leadership'])
    },
    {
      name: 'University of Pennsylvania (Wharton)',
      type: 'business',
      values: JSON.stringify(['Leadership', 'Entrepreneurship', 'Global impact']),
      characteristics: JSON.stringify(['Business acumen', 'Leadership potential', 'Strategic thinking'])
    },
    {
      name: 'Williams College',
      type: 'liberal-arts',
      values: JSON.stringify(['Intellectual curiosity', 'Community', 'Excellence']),
      characteristics: JSON.stringify(['Critical thinking', 'Well-rounded', 'Community engagement'])
    }
  ]

  for (const college of colleges) {
    await prisma.college.create({
      data: college,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
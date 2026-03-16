// Quick test script to verify mentor validation schema
// Run with: node test-mentor-validation.js

const { z } = require('zod');

// Copy the validation logic
const isValidLinkedInUrl = (url) => {
  if (!url) return true;
  return /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(url);
};

const isValidGitHubUrl = (url) => {
  if (!url) return true;
  return /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(url);
};

const isValidTwitterUrl = (url) => {
  if (!url) return true;
  return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/.test(url);
};

const createMentorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  expertise: z.array(z.string()).min(1).max(20),
  company: z.string().min(2).max(200),
  bio: z.string().min(10),
  imageUrl: z.union([z.string().url(), z.literal(''), z.undefined()]).optional().transform(val => val === '' || !val ? undefined : val),
  rating: z.number().min(0).max(5).default(0),
  totalSessions: z.number().int().min(0).default(0),
  available: z.boolean().default(true),
  linkedinUrl: z.union([z.string().url(), z.literal(''), z.null(), z.undefined()]).optional()
    .transform(val => !val || val === '' ? null : val)
    .refine((url) => !url || isValidLinkedInUrl(url), { message: "Invalid LinkedIn URL" }),
  githubUrl: z.union([z.string().url(), z.literal(''), z.null(), z.undefined()]).optional()
    .transform(val => !val || val === '' ? null : val)
    .refine((url) => !url || isValidGitHubUrl(url), { message: "Invalid GitHub URL" }),
  twitterUrl: z.union([z.string().url(), z.literal(''), z.null(), z.undefined()]).optional()
    .transform(val => !val || val === '' ? null : val)
    .refine((url) => !url || isValidTwitterUrl(url), { message: "Invalid Twitter URL" }),
});

// Test data - minimal required fields
const testData1 = {
  name: "John Doe",
  email: "john@example.com",
  company: "Tech Corp",
  expertise: ["React", "Node.js"],
  bio: "Experienced developer with 10 years in the industry",
  imageUrl: "",
  rating: 0,
  totalSessions: 0,
  available: true,
  linkedinUrl: null,
  githubUrl: null,
  twitterUrl: null,
};

// Test data - with optional fields
const testData2 = {
  name: "Jane Smith",
  email: "jane@example.com",
  company: "StartupXYZ",
  expertise: ["Python", "AI/ML"],
  bio: "AI researcher and mentor",
  imageUrl: "https://example.com/image.jpg",
  rating: 4.5,
  totalSessions: 25,
  available: true,
  linkedinUrl: "https://linkedin.com/in/janesmith",
  githubUrl: "https://github.com/janesmith",
  twitterUrl: "https://twitter.com/janesmith",
};

console.log('Testing mentor validation schema...\n');

console.log('Test 1: Minimal required fields');
try {
  const result1 = createMentorSchema.parse(testData1);
  console.log('✅ PASSED');
  console.log('Result:', JSON.stringify(result1, null, 2));
} catch (error) {
  console.log('❌ FAILED');
  console.log('Error:', error.errors || error.message);
}

console.log('\n---\n');

console.log('Test 2: With optional fields');
try {
  const result2 = createMentorSchema.parse(testData2);
  console.log('✅ PASSED');
  console.log('Result:', JSON.stringify(result2, null, 2));
} catch (error) {
  console.log('❌ FAILED');
  console.log('Error:', error.errors || error.message);
}

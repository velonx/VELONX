const COMMON_TECH = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind',
  'Node.js', 'Express', 'Go', 'Golang', 'Python', 'PyTorch', 'TensorFlow', 'LLMs',
  'Kotlin', 'Android', 'Java', 'Swift', 'iOS', 'Flutter', 'React Native',
  'PostgreSQL', 'MongoDB', 'SQL', 'Docker', 'Kubernetes', 'AWS', 'CI/CD',
  'Figma', 'UI/UX', 'Design Systems', 'Machine Learning', 'Deep Learning',
  'Git', 'GitHub', 'Web Performance', 'LCP', 'Vite'
];

function getTechStackOld(job: any): string[] {
  if (job.stack && job.stack.length > 0) return job.stack;

  const tags = new Set<string>();
  const searchStr = `${job.title} ${job.about || job.description || ""} ${(job.requirements || []).join(' ')}`.toLowerCase();

  for (const tech of COMMON_TECH) {
    const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(searchStr)) {
      tags.add(tech);
    }
  }

  if (searchStr.includes('next.js') || searchStr.includes('nextjs')) tags.add('Next.js');
  if (searchStr.includes('node.js') || searchStr.includes('nodejs')) tags.add('Node.js');

  const result = Array.from(tags);
  return result.length > 0 ? result.slice(0, 6) : ['Developer', 'Engineering'];
}

const precompiledRegexes = COMMON_TECH.map(tech => {
  const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return { tech, regex: new RegExp(`\\b${escaped}\\b`, 'i') };
});

function getTechStackNew(job: any): string[] {
  if (job.stack && job.stack.length > 0) return job.stack;

  const tags = new Set<string>();
  const searchStr = `${job.title} ${job.about || job.description || ""} ${(job.requirements || []).join(' ')}`.toLowerCase();

  for (const { tech, regex } of precompiledRegexes) {
    if (regex.test(searchStr)) {
      tags.add(tech);
    }
  }

  if (searchStr.includes('next.js') || searchStr.includes('nextjs')) tags.add('Next.js');
  if (searchStr.includes('node.js') || searchStr.includes('nodejs')) tags.add('Node.js');

  const result = Array.from(tags);
  return result.length > 0 ? result.slice(0, 6) : ['Developer', 'Engineering'];
}

const mockJob = {
    title: "Junior Software Engineer (Backend)",
    about: "Snowflake is seeking a Junior Software Engineer to join our core backend data pipelines team. You will work on optimizing large-scale distributed queries, designing high-throughput data processing endpoints, and ensuring database consistency. You will be building resilient microservices using Go and deploying them in high-availability environments.",
    requirements: [
      "Solid understanding of Go (Golang) programming and backend system design paradigms.",
      "Good familiarity with relational databases, transaction isolation levels, and indexing strategies.",
      "Familiarity with containerization technologies (Docker, Kubernetes) and Linux shells.",
      "Strong problem-solving skills, solid algorithm fundamentals, and good system debugging."
    ],
};

const ITERATIONS = 100000;

console.time("Old Method");
for (let i = 0; i < ITERATIONS; i++) {
  getTechStackOld(mockJob);
}
console.timeEnd("Old Method");

console.time("New Method");
for (let i = 0; i < ITERATIONS; i++) {
  getTechStackNew(mockJob);
}
console.timeEnd("New Method");

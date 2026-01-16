export interface BlogPost {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        role: string;
        avatar: string;
    };
    category: string;
    readTime: string;
    createdAt: string;
    image: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        id: "blog-1",
        title: "The Future of AI in Education",
        content: "Artificial Intelligence is revolutionizing how we learn and teach. From personalized learning paths to automated grading, the possibilities are endless. In this post, we explore the top 5 ways AI is transforming the classroom experience for students worldwide.",
        author: {
            name: "Admin Velonx",
            role: "Platform Founder",
            avatar: "/avatars/admin.png",
        },
        category: "Technology",
        readTime: "5 min read",
        createdAt: "2025-01-14T10:30:00Z",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80",
    },
    {
        id: "blog-2",
        title: "Getting Started with Next.js 15",
        content: "Next.js 15 brings exciting new features like improved Server Components and faster build times. Whether you're a seasoned developer or just starting out, this guide will walk you through the essential steps to kickstart your next project with the latest version of Next.js.",
        author: {
            name: "Admin Velonx",
            role: "Full Stack Engineer",
            avatar: "/avatars/admin.png",
        },
        category: "Development",
        readTime: "8 min read",
        createdAt: "2025-01-12T15:45:00Z",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80",
    },
    {
        id: "blog-3",
        title: "Building a Better Portfolio",
        content: "Your portfolio is your digital resume. It needs to stand out. Learn how to showcase your projects effectively, choose the right tech stack for your portfolio site, and write compelling project descriptions that capture the attention of recruiters.",
        author: {
            name: "Admin Velonx",
            role: "Design Lead",
            avatar: "/avatars/admin.png",
        },
        category: "Career",
        readTime: "6 min read",
        createdAt: "2025-01-10T09:00:00Z",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80",
    },
];

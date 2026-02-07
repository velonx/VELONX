import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata(
    'VELONX - Build Real Projects, Connect with Mentors',
    'Join 1000+ students building real projects, connecting with mentors, and launching their tech careers. Access hackathons, workshops, and learning resources.',
    '/',
    '/og/home.png'
);

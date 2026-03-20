import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata(
    'Velonx - Empowering the Next Gen',
    'Join a thriving Velonx community where students turn potential into impact. Build projects, learn from mentors, and launch your career.',
    '/',
    '/og/home.png'
);

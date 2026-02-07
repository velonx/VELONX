import { Metadata } from 'next';

// Signup page should not be indexed
export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create your VELONX account and start building',
    robots: {
        index: false,
        follow: false,
    },
};

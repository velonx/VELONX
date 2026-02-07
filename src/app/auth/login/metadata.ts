import { Metadata } from 'next';

// Login and signup pages should not be indexed
export const metadata: Metadata = {
    title: 'Login',
    description: 'Sign in to your VELONX account',
    robots: {
        index: false,
        follow: false,
    },
};

import type { Signatory } from '$lib/types';

export const prerender = false;

export async function GET({ fetch, setHeaders }) {
    const response = await fetch('api/signatories');
    const { signatories, totalCount }: { signatories: Signatory[]; totalCount: number } = await response.json();

    // Filter signatories with email_verified = true
    const verifiedSignatories = signatories.filter(signatory => signatory.email_verified);

    setHeaders({
        'cache-control': 'public, max-age=3600' // 1 hour in seconds
    });

    return {
        signatories: verifiedSignatories,
        totalCount: verifiedSignatories.length // Update totalCount to reflect filtered data
    };
};
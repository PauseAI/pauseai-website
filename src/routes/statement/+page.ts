import type { Signatory } from '$lib/types';

export const prerender = false;

export const load = async ({ fetch, setHeaders }) => {
    const response = await fetch('api/signatories');
    const { signatories, totalCount }: { signatories: Signatory[]; totalCount: number } = await response.json();

    console.log('Signatories from backend:', signatories);
    console.log('Total count:', totalCount);

    setHeaders({
        'cache-control': 'public, max-age=3600' // 1 hour in seconds
    });

    return {
        signatories: signatories,
        totalCount: totalCount
    };
};
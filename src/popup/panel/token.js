import { Clerk } from '@clerk/clerk-js';
import { fetchUserPresets } from '../../background/api/api';
import { CLERK_PUBLISHABLE_KEY } from '../../config';

const clerk = new Clerk(CLERK_PUBLISHABLE_KEY);

export async function syncPresets() {
    console.log('Syncing presets..');
    await clerk.load();
    if (!clerk.session) return alert('Please sign in first');

    const token = await clerk.session.getToken();
    const presets = await fetchUserPresets(token);
    console.log('Synced presets:', presets);

    return presets;
}
import { Clerk } from '@clerk/clerk-js';
import { createPreset, createUserPreset, fetchUserPresets } from '../../background/api/api';
import { CLERK_PUBLISHABLE_KEY } from '../../config';

const clerk = new Clerk(CLERK_PUBLISHABLE_KEY);

export async function syncPresets() {
    console.log('Syncing presets..');
    await clerk.load();
    if (!clerk.session) return alert('Please sign in first');
    const token = await clerk.session.getToken();

    const response  = await fetchUserPresets(token);
    if (!response || !response.success || !Array.isArray(response.data)) {
        console.log('No presets found or invalid format');
        return [];
    }

    const presets = response.data;

    console.log('Preset settings:');
    const settingsArray = presets.map((preset, index) => {
        console.log(`Preset #${index + 1} (${preset.name}):`, preset.settings);
        return preset.settings;
    });

    return settingsArray;
}

export async function publishPreset(preset) {
    const settingsBlob = new Blob([JSON.stringify(preset)], { type: 'application/json' });
    const settingsFile = new File([settingsBlob], `${preset.presetName}.json`, { type: 'application/json' });

    const imageResponse = await fetch('../../../assets/Template.png');
    const blob = await imageResponse.blob();
    const imageFile = new File([blob], 'Template.png', { type: 'image/png' });

    const image = new Image();
    image.src = '../../../assets/Template.png'

    const webPreset = {
        name: preset.presetName,
        settings: settingsFile,  
        image: imageFile
    }

    console.log('Publishing preset..');
    await clerk.load();
    if (!clerk.session) return alert('Please sign in first');
    const token = await clerk.session.getToken();

    const {success, message, data: createdPreset } = await createPreset(webPreset);
    if (!success) {
        console.log(message);
    }

    const response  = await createUserPreset({
        name: webPreset.name,
        settings: webPreset.settings,
        image: webPreset.image, 
        isPublished: true,
        sourcePresetId: createdPreset._id
    }, token);
    if (!response || !response.success) {
        console.log(message);
    }
}
const API_BASE_URL = "http://localhost:5000"; 

export async function createUserPreset (newUserPreset, token) {
    if(!newUserPreset.name || !newUserPreset.settings || !newUserPreset.image || newUserPreset.isPublished === undefined) {
        return {success: false, message: "Please fill in all fields."};
    }

    const formData = new FormData();
    formData.append("name", newUserPreset.name);
    formData.append("settings", newUserPreset.settings);
    formData.append("image", newUserPreset.image);
    formData.append("isPublished", newUserPreset.isPublished);
    if (newUserPreset.sourcePresetId !== undefined) {
        formData.append("sourcePresetId", newUserPreset.sourcePresetId);
    }

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File -> name: ${value.name}, type: ${value.type}, size: ${value.size}`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }
    console.log(token);

    try {
        const res = await fetch(`${API_BASE_URL}/api/userpresets`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Upload failed");

        return { success: true, data: data.data, message: "User preset created successfully" };
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

export async function fetchUserPresets (token) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/userpresets`, {
            headers: { Authorization: `Bearer ${token}`}
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Fetch failed");
        return { success: true, data: data.data };
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

export async function updateUserPreset(newUserPreset, token) {
    if(!newUserPreset._id || !newUserPreset.name || !newUserPreset.settings || !newUserPreset.image || newUserPreset.isPublished === undefined) {
        return {success: false, message: "Please fill in all fields."};
    }

    const formData = new FormData();
    formData.append("name", newUserPreset.name);
    formData.append("settings", newUserPreset.settings);
    formData.append("image", newUserPreset.image);
    formData.append("isPublished", newUserPreset.isPublished);
    if (newUserPreset.sourcePresetId !== undefined) {
        formData.append("sourcePresetId", newUserPreset.sourcePresetId);
    }

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File -> name: ${value.name}, type: ${value.type}, size: ${value.size}`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }
    console.log(token);

    try {
        const res = await fetch(`${API_BASE_URL}/api/userpresets/${newUserPreset._id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Upload failed");

        return { success: true, data: data.data, message: "User preset updated successfully" };
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

export async function deleteUserPreset (pid, token) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/userpresets/${pid}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        }
        });
        const data = await res.json();
        if (!data.success) {
            return {success: false, message: data.message };
        }
        return { success: true, message: data.message };
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}
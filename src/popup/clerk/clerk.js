import { Clerk } from "@clerk/clerk-js";
import { CLERK_PUBLISHABLE_KEY } from "../../config";

const clerkPubKey = CLERK_PUBLISHABLE_KEY;
const clerk = new Clerk(clerkPubKey);
const authContainer = document.getElementById("clerk-auth"); 

async function initClerk() {
	await clerk.load();

	if (!clerk.user) {
		clerk.mountSignIn(authContainer);
	} else {
		clerk.mountUserButton(authContainer);
	}

	clerk.on("signedIn", async () => {
		console.log("User signed in — can now sync presets");
		if (typeof window.syncPresets === "function") {
			const localPresets = await window.getLocalPresets?.();
			await window.syncPresets?.(localPresets);
		}
	});

	clerk.on("signedIn", async () => {
		console.log("User signed in")

		const token = await getToken()
		if (token) {
			chrome.storage.local.set({ clerkToken: token }, () => {
				console.log("Stored Clerk token in chrome.storage")
			})
		}

		window.close()
	})
}

export async function getToken() {
	if (!clerk.user || !clerk.session) return null;
	return await clerk.session.getToken({ template: "default" });
}

export function isSignedIn() {
	return !clerk.user;
}

initClerk();

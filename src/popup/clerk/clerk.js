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
		clerk.mountUserProfile(authContainer, {
			customPages: [
				{
					url: "/sign-out",
					label: "Sign Out",
					mountIcon: (el) => {
						el.innerHTML = "🚪"
					},
					unmountIcon: (el) => {
						el.innerHTML = ""
					},
					mount: async (el) => {
						const user = clerk.user

						el.innerHTML = `
						<div style="padding: 16px; text-align: center;">
							<h2>Hello, ${user.fullName || user.username || "User"} 👋</h2>
							<p>${user.primaryEmailAddress?.emailAddress || ""}</p>
							<button id="custom-signout" style="
							margin-top: 20px;
							padding: 10px 16px;
							font-size: 16px;
							background: #e53e3e;
							color: white;
							border: none;
							border-radius: 4px;
							cursor: pointer;
							">Sign Out</button>
						</div>
						`

						document
						.getElementById("custom-signout")
						.addEventListener("click", () => clerk.signOut())
					},
					unmount: (el) => {
						el.innerHTML = ""
					},
				},
			],
		})
	}

	clerk.on("signedIn", async () => {
		const token = await getToken();
		if (token) {
			chrome.storage.local.set({ clerkToken: token }, () => {
				console.log("Stored Clerk token in chrome.storage");
			});
		}
		window.location.reload();
	});

	clerk.on("signedOut", () => {
		window.location.reload();
	});
}

export async function getToken() {
	if (!clerk.user || !clerk.session) return null;
	return await clerk.session.getToken({ template: "default" });
}

export function isSignedIn() {
	return !clerk.user;
}

initClerk();

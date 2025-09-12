import { Clerk } from "@clerk/clerk-js";
import { CLERK_PUBLISHABLE_KEY } from "../../config";

const clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
const authContainer = document.getElementById("clerk-auth"); 

async function initClerk() {
	await clerk.load();

	if (!clerk.user) {
		clerk.mountSignIn(authContainer);
	} else {
		mountProfile();
	}

	clerk.addListener(({ user, session }) => {
		if (user && session) {
			console.log("User signed in");
			mountProfile();
		} else {
			console.log("User signed out");
			clerk.mountSignIn(authContainer);
		}
	});
}

function mountProfile() {
	clerk.mountUserProfile(authContainer, {
		customPages: [
			{
				url: "/sign-out",
				label: "Sign Out",
				mountIcon: (el) => {
					el.innerHTML = "🚪";
				},
				unmountIcon: (el) => {
					el.innerHTML = "";
				},
				mount: (el) => {
					const user = clerk.user;

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
					`;

					document
					.getElementById("custom-signout")
					.addEventListener("click", () => clerk.signOut());
				},
				unmount: (el) => {
					el.innerHTML = "";
				},
			},
		],
	});
}

initClerk();

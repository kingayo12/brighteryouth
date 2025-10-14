// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCte4FcJjNe2Eb2N0pX4VVjLNmgfvbaJyg",
  authDomain: "brighteryouth.firebaseapp.com",
  projectId: "brighteryouth",
  storageBucket: "brighteryouth.firebasestorage.app",
  messagingSenderId: "1043623979021",
  appId: "1:1043623979021:web:1489743749c847f8860d44",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =================================================================
// 2. AUTHENTICATION STATE (Show user name + handle logout)
// =================================================================
// =================================================================
// 2. AUTHENTICATION STATE (Show user name + handle logout)
// =================================================================

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  // Monitor Auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // ✅ User is logged in
      console.log("User logged in:", user);

      // Display name or email in the dashboard
      userNameDisplay.textContent = user.displayName || user.email || "Admin";

      // Optionally store in localStorage (for session continuity)
      localStorage.setItem(
        "loggedUser",
        JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        }),
      );
    } else {
      // 🚫 User not logged in, redirect to login page
      console.warn("No user found, redirecting to login...");
      window.location.href = "login.html";
    }
  });

  // ✅ Logout button functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        localStorage.removeItem("loggedUser");
        alert("Logged out successfully!");
        window.location.href = "login.html";
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Error logging out. Please try again.");
      }
    });
  }
});

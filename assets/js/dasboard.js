// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCte4FcJjNe2Eb2N0pX4VVjLNmgfvbaJyg",
  authDomain: "brighteryouth.firebaseapp.com",
  projectId: "brighteryouth",
  storageBucket: "brighteryouth.appspot.com",
  messagingSenderId: "1043623979021",
  appId: "1:1043623979021:web:1489743749c847f8860d44",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// =================================================================
// 2. AUTHENTICATION STATE (Show user name + handle logout)
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Display user name or email
      userNameDisplay.textContent = user.displayName || user.email;
      loadDashboardBlogs(); // Load default tab
    } else {
      // If no user, redirect to login page
      window.location.href = "login.html";
    }
  });

  // Handle logout
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("You have been logged out.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Try again.");
    }
  });

  // Tab switching
  const tabs = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tab;

      tabs.forEach((b) => b.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(tabId).classList.add("active");

      if (tabId === "blogs") loadDashboardBlogs();
    });
  });

  // Blog form submit
  document.getElementById("blogForm").addEventListener("submit", handleBlogFormSubmit);
});

// =================================================================
// 3. STATUS MESSAGE HELPER
// =================================================================
const statusMessage = document.getElementById("statusMessage");
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${isError ? "error" : "success"}`;
  setTimeout(() => {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
  }, 4000);
}

// =================================================================
// 4. BLOGS CRUD (Firestore + Firebase Storage)
// =================================================================
const blogsCollection = collection(db, "blogs");
let currentEditingBlogId = null;

// --- READ: Load Blogs ---
async function loadDashboardBlogs() {
  const listArea = document.querySelector("#blogs .content-list");
  listArea.innerHTML = "<p>Loading blogs...</p>";

  try {
    const snapshot = await getDocs(blogsCollection);
    if (snapshot.empty) {
      listArea.innerHTML = "<p>No blogs found.</p>";
      return;
    }

    let html = "<ul class='admin-list'>";
    snapshot.forEach((docSnap) => {
      const blog = docSnap.data();
      html += `
        <li>
          <img src="${blog.imageUrl || "assets/images/no-image.jpg"}" class="list-thumbnail" alt="">
          <div class="list-details">
            <h5>${blog.title}</h5>
            <p>${new Date(blog.date).toLocaleDateString()}</p>
          </div>
          <div class="list-actions">
            <button class="btn-secondary btn-edit" data-id="${docSnap.id}">Edit</button>
            <button class="btn-danger btn-delete" data-id="${docSnap.id}" data-image-url="${
        blog.imageUrl
      }">Delete</button>
          </div>
        </li>`;
    });
    html += "</ul>";
    listArea.innerHTML = html;

    document
      .querySelectorAll(".btn-edit")
      .forEach((btn) => btn.addEventListener("click", handleEditBlog));
    document
      .querySelectorAll(".btn-delete")
      .forEach((btn) => btn.addEventListener("click", handleDeleteBlog));
  } catch (err) {
    console.error(err);
    showStatus("Failed to load blogs.", true);
  }
}

// --- CREATE / UPDATE BLOG ---
async function handleBlogFormSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("blogTitle").value.trim();
  const content = document.getElementById("blogContent").value.trim();
  const imageFile = document.getElementById("blogImage").files[0];
  const submitBtn = e.target.querySelector("button");
  submitBtn.disabled = true;

  try {
    if (!title || !content) throw new Error("Please fill in all fields.");

    let imageUrl = "";
    if (imageFile) {
      const storageRef = ref(storage, `blogs/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const blogData = {
      title,
      content,
      imageUrl,
      date: new Date().toISOString(),
    };

    if (currentEditingBlogId) {
      await updateDoc(doc(db, "blogs", currentEditingBlogId), blogData);
      showStatus("Blog updated successfully ✅");
    } else {
      await addDoc(blogsCollection, blogData);
      showStatus("Blog published successfully 📝");
    }

    document.getElementById("blogForm").reset();
    currentEditingBlogId = null;
    loadDashboardBlogs();
  } catch (err) {
    console.error(err);
    showStatus(err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

// --- EDIT BLOG ---
async function handleEditBlog(e) {
  const id = e.target.dataset.id;
  currentEditingBlogId = id;

  const snapshot = await getDocs(blogsCollection);
  const blog = snapshot.docs.find((d) => d.id === id)?.data();
  if (!blog) return showStatus("Blog not found.", true);

  document.getElementById("blogTitle").value = blog.title;
  document.getElementById("blogContent").value = blog.content;
  const submitBtn = document.querySelector("#blogForm button");
  submitBtn.textContent = "Save Changes";
  showStatus(`Editing: ${blog.title}`);
}

// --- DELETE BLOG ---
async function handleDeleteBlog(e) {
  const blogId = e.target.dataset.id;
  const imageUrl = e.target.dataset.imageUrl;
  if (!confirm("Are you sure you want to delete this blog?")) return;

  try {
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef).catch(() => {});
    }
    await deleteDoc(doc(db, "blogs", blogId));
    showStatus("Blog deleted successfully 🗑️");
    loadDashboardBlogs();
  } catch (err) {
    console.error(err);
    showStatus("Failed to delete blog.", true);
  }
}

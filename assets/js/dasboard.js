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

const firebaseConfig = {
  apiKey: "AIzaSyCte4FcJjNe2Eb2N0pX4VVjLNmgfvbaJyg",
  authDomain: "brighteryouth.firebaseapp.com",
  projectId: "brighteryouth",
  storageBucket: "brighteryouth.appspot.com",
  messagingSenderId: "1043623979021",
  appId: "1:1043623979021:web:1489743749c847f8860d44",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =================================================================
// 2. AUTH STATE + LOGOUT HANDLER
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userNameDisplay.textContent = user.displayName || user.email;
      loadDashboardBlogs();
    } else {
      window.location.href = "login.html";
    }
  });

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

  // Tabs
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
// 3. STATUS MESSAGE
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
// 4. BLOGS CRUD (Firestore)
// =================================================================
const blogsCollection = collection(db, "blogs");
let currentEditingBlogId = null;

// --- LOAD BLOGS ---
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
          <img src="${
            blog.imagePath || "assets/images/no-image.jpg"
          }" class="list-thumbnail" alt="">
          <div class="list-details">
            <h5>${blog.title}</h5>
            <p>${new Date(blog.date).toLocaleDateString()}</p>
          </div>
          <div class="list-actions">
            <button class="btn-secondary btn-edit" data-id="${docSnap.id}">Edit</button>
            <button class="btn-danger btn-delete" data-id="${docSnap.id}">Delete</button>
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
  const submitBtn = e.target.querySelector("button");
  submitBtn.disabled = true;

  try {
    const blogData = {
      title: blogTitle.value.trim(),
      category: blogCategory.value.trim(),
      shortSummary: blogShortSummary.value.trim(),
      content: blogContent.value.trim(),
      imagePath: blogImagePath.value.trim(),
      date: new Date().toISOString(),

      // Secondary Section
      secondary: {
        title: secondaryTitle.value.trim(),
        image: secondaryImagePath.value.trim(),
        text1: secondaryText1.value.trim(),
        text2: secondaryText2.value.trim(),
        points: [point1.value, point2.value, point3.value, point4.value].filter(Boolean),
      },

      // Tags
      tags: blogTags.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),

      // Author Info
      author: {
        name: authorName.value.trim(),
        image: authorImage.value.trim(),
        bio: authorBio.value.trim(),
      },

      // Social Links
      social: {
        twitter: twitterLink.value.trim(),
        facebook: facebookLink.value.trim(),
        instagram: instagramLink.value.trim(),
        pinterest: pinterestLink.value.trim(),
      },
    };

    if (!blogData.title || !blogData.content)
      throw new Error("Please fill in all required fields.");

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

  blogTitle.value = blog.title;
  blogCategory.value = blog.category;
  blogShortSummary.value = blog.shortSummary;
  blogContent.value = blog.content;
  blogImagePath.value = blog.imagePath || "";

  // Fill in extended fields
  if (blog.secondary) {
    secondaryTitle.value = blog.secondary.title || "";
    secondaryImagePath.value = blog.secondary.image || "";
    secondaryText1.value = blog.secondary.text1 || "";
    secondaryText2.value = blog.secondary.text2 || "";
    [point1, point2, point3, point4].forEach((el, i) => {
      el.value = blog.secondary.points?.[i] || "";
    });
  }

  blogTags.value = blog.tags?.join(", ") || "";
  if (blog.author) {
    authorName.value = blog.author.name || "";
    authorImage.value = blog.author.image || "";
    authorBio.value = blog.author.bio || "";
  }
  if (blog.social) {
    twitterLink.value = blog.social.twitter || "";
    facebookLink.value = blog.social.facebook || "";
    instagramLink.value = blog.social.instagram || "";
    pinterestLink.value = blog.social.pinterest || "";
  }

  const submitBtn = document.querySelector("#blogForm button");
  submitBtn.textContent = "Save Changes";
  showStatus(`Editing: ${blog.title}`);
}

// --- DELETE BLOG ---
async function handleDeleteBlog(e) {
  const blogId = e.target.dataset.id;
  if (!confirm("Are you sure you want to delete this blog?")) return;
  try {
    await deleteDoc(doc(db, "blogs", blogId));
    showStatus("Blog deleted successfully 🗑️");
    loadDashboardBlogs();
  } catch (err) {
    console.error(err);
    showStatus("Failed to delete blog.", true);
  }
}

// --- DISPLAY BLOGS ON WEBSITE ---
async function loadBlogs() {
  const blogsRef = collection(db, "blogs");
  const querySnapshot = await getDocs(blogsRef);
  const blogContainer = document.querySelector(".blog-one .row");
  blogContainer.innerHTML = "";

  querySnapshot.forEach((doc, index) => {
    const blog = doc.data();
    let formattedDate = new Date(blog.date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const blogHTML = `
      <div class="col-xl-4 col-lg-4 wow fadeInUp" data-wow-delay="${(index + 1) * 100}ms">
        <div class="blog-one__single">
          <div class="blog-one__img">
            <img src="${blog.imagePath}" alt="">
            <a href="blog-details.html?id=${doc.id}">
              <span class="blog-one__plus"></span>
            </a>
          </div>
          <div class="blog-one__content">
            <div class="blog-one__meta">
              <div class="blog-one__cat"><p>${blog.category}</p></div>
              <div class="blog-one__date"><p><span class="icon-calendar"></span> ${formattedDate}</p></div>
            </div>
            <h3 class="blog-one__title"><a href="blog-details.html?id=${doc.id}">${
      blog.title
    }</a></h3>
            <p class="blog-one__text">${blog.shortSummary}</p>
          </div>
        </div>
      </div>`;
    blogContainer.innerHTML += blogHTML;
  });
}

loadBlogs();

// =================================================================
// 5. TEAMS CRUD (Firestore)
// =================================================================

const teamsCollection = collection(db, "teams");
let currentEditingTeamId = null;

// --- LOAD TEAMS (Admin Dashboard) ---
async function loadDashboardTeams() {
  const listArea = document.querySelector("#team .content-list");
  if (!listArea) return;
  listArea.innerHTML = "<p>Loading team members...</p>";

  try {
    const snapshot = await getDocs(teamsCollection);
    if (snapshot.empty) {
      listArea.innerHTML = "<p>No team members found.</p>";
      return;
    }

    let html = "<ul class='admin-list'>";
    snapshot.forEach((docSnap) => {
      const team = docSnap.data();
      html += `
        <li>
          <img src="${
            team.photoPath || "assets/images/no-image.jpg"
          }" class="list-thumbnail" alt="">
          <div class="list-details">
            <h5>${team.name}</h5>
            <p>${team.role}</p>
          </div>
          <div class="list-actions">
            <button class="btn-secondary btn-edit" data-id="${docSnap.id}">Edit</button>
            <button class="btn-danger btn-delete" data-id="${docSnap.id}">Delete</button>
          </div>
        </li>`;
    });
    html += "</ul>";
    listArea.innerHTML = html;

    document
      .querySelectorAll(".btn-edit")
      .forEach((btn) => btn.addEventListener("click", handleEditTeam));
    document
      .querySelectorAll(".btn-delete")
      .forEach((btn) => btn.addEventListener("click", handleDeleteTeam));
  } catch (err) {
    console.error(err);
    showStatus("Failed to load team members.", true);
  }
}

// --- ADD / UPDATE TEAM MEMBER ---
async function handleTeamFormSubmit(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button");
  submitBtn.disabled = true;

  try {
    const name = teamName.value.trim();
    const role = teamRole.value.trim();
    const photoPath = teamPhotoPath.value.trim();

    if (!name || !role || !photoPath)
      throw new Error("Please fill in all fields (name, role, and image path).");

    const teamData = { name, role, photoPath };

    if (currentEditingTeamId) {
      await updateDoc(doc(db, "teams", currentEditingTeamId), teamData);
      showStatus("Team member updated successfully ✅");
    } else {
      await addDoc(teamsCollection, teamData);
      showStatus("Team member added successfully 👥");
    }

    e.target.reset();
    currentEditingTeamId = null;
    loadDashboardTeams();
  } catch (err) {
    console.error(err);
    showStatus(err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

// --- EDIT TEAM MEMBER ---
async function handleEditTeam(e) {
  const id = e.target.dataset.id;
  currentEditingTeamId = id;

  const snapshot = await getDocs(teamsCollection);
  const team = snapshot.docs.find((d) => d.id === id)?.data();
  if (!team) return showStatus("Team member not found.", true);

  teamName.value = team.name;
  teamRole.value = team.role;
  teamPhotoPath.value = team.photoPath;

  const submitBtn = document.querySelector("#teamForm button");
  submitBtn.textContent = "Save Changes";
  showStatus(`Editing: ${team.name}`);
}

// --- DELETE TEAM MEMBER ---
async function handleDeleteTeam(e) {
  const teamId = e.target.dataset.id;
  if (!confirm("Are you sure you want to delete this team member?")) return;
  try {
    await deleteDoc(doc(db, "teams", teamId));
    showStatus("Team member deleted successfully 🗑️");
    loadDashboardTeams();
  } catch (err) {
    console.error(err);
    showStatus("Failed to delete team member.", true);
  }
}

// --- DISPLAY TEAMS ON WEBSITE ---
async function loadTeams() {
  const teamContainer = document.querySelector(".team-section .row");
  if (!teamContainer) return;

  teamContainer.innerHTML = "<p>Loading team members...</p>";

  try {
    const snapshot = await getDocs(teamsCollection);
    if (snapshot.empty) {
      teamContainer.innerHTML = "<p>No team members yet.</p>";
      return;
    }

    teamContainer.innerHTML = "";
    snapshot.forEach((docSnap, index) => {
      const team = docSnap.data();
      teamContainer.innerHTML += `
        <div class="col-xl-4 col-lg-4 wow fadeInUp" data-wow-delay="${(index + 1) * 100}ms">
          <div class="team-one__single">
            <div class="team-one__img">
              <img src="${team.photoPath}" alt="${team.name}">
            </div>
            <div class="team-one__content">
              <h4 class="team-one__name">${team.name}</h4>
              <p class="team-one__role">${team.role}</p>
            </div>
          </div>
        </div>`;
    });
  } catch (err) {
    console.error("Error loading team:", err);
    teamContainer.innerHTML = "<p>Failed to load team members.</p>";
  }
}

// --- EVENT BINDINGS ---
document.addEventListener("DOMContentLoaded", () => {
  const teamForm = document.getElementById("teamForm");
  if (teamForm) {
    teamForm.addEventListener("submit", handleTeamFormSubmit);
  }
  loadDashboardTeams();
  loadTeams();
});

const donationsCollection = collection(db, "donations");
let currentEditingDonationId = null;

// --- LOAD DONATIONS (Admin Dashboard) ---
async function loadDashboardDonations() {
  const listArea = document.querySelector("#donations .content-list");
  if (!listArea) return;
  listArea.innerHTML = "<p>Loading causes...</p>";

  try {
    const snapshot = await getDocs(donationsCollection);
    if (snapshot.empty) {
      listArea.innerHTML = "<p>No causes found.</p>";
      return;
    }

    let html = "<ul class='admin-list'>";
    snapshot.forEach((docSnap) => {
      const cause = docSnap.data();
      html += `
        <li>
          <img src="${
            cause.imagePath || "assets/images/no-image.jpg"
          }" class="list-thumbnail" alt="">
          <div class="list-details">
            <h5>${cause.title}</h5>
            <p>Raised: $${cause.raisedAmount} / Goal: $${cause.goalAmount}</p>
          </div>
          <div class="list-actions">
            <button class="btn-secondary btn-edit" data-id="${docSnap.id}">Edit</button>
            <button class="btn-danger btn-delete" data-id="${docSnap.id}">Delete</button>
          </div>
        </li>`;
    });
    html += "</ul>";
    listArea.innerHTML = html;

    document
      .querySelectorAll(".btn-edit")
      .forEach((btn) => btn.addEventListener("click", handleEditDonation));
    document
      .querySelectorAll(".btn-delete")
      .forEach((btn) => btn.addEventListener("click", handleDeleteDonation));
  } catch (err) {
    console.error(err);
    showStatus("Failed to load causes.", true);
  }
}

// --- CREATE / UPDATE DONATION ---
async function handleDonationFormSubmit(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button");
  submitBtn.disabled = true;

  try {
    const causeData = {
      title: causeTitle.value.trim(),
      description: causeDescription.value.trim(),
      imagePath: imagePath.value.trim(),
      raisedAmount: parseFloat(raisedAmount.value),
      goalAmount: parseFloat(goalAmount.value),
      eventDate: eventDate.value,
      eventTime: eventTime.value.trim(),
      dateCreated: new Date().toISOString(),
    };

    if (!causeData.title || !causeData.imagePath || !causeData.description)
      throw new Error("Please fill in all required fields.");

    if (currentEditingDonationId) {
      await updateDoc(doc(db, "donations", currentEditingDonationId), causeData);
      showStatus("Cause updated successfully ✅");
    } else {
      await addDoc(donationsCollection, causeData);
      showStatus("New cause added successfully 💚");
    }

    e.target.reset();
    currentEditingDonationId = null;
    loadDashboardDonations();
  } catch (err) {
    console.error(err);
    showStatus(err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

// --- EDIT DONATION ---
async function handleEditDonation(e) {
  const id = e.target.dataset.id;
  currentEditingDonationId = id;

  const snapshot = await getDocs(donationsCollection);
  const cause = snapshot.docs.find((d) => d.id === id)?.data();
  if (!cause) return showStatus("Cause not found.", true);

  causeTitle.value = cause.title;
  causeDescription.value = cause.description;
  imagePath.value = cause.imagePath;
  raisedAmount.value = cause.raisedAmount;
  goalAmount.value = cause.goalAmount;
  eventDate.value = cause.eventDate;
  eventTime.value = cause.eventTime;

  const submitBtn = document.querySelector("#donationForm button");
  submitBtn.textContent = "Save Changes";
  showStatus(`Editing: ${cause.title}`);
}

// --- DELETE DONATION ---
async function handleDeleteDonation(e) {
  const donationId = e.target.dataset.id;
  if (!confirm("Are you sure you want to delete this cause?")) return;
  try {
    await deleteDoc(doc(db, "donations", donationId));
    showStatus("Cause deleted successfully 🗑️");
    loadDashboardDonations();
  } catch (err) {
    console.error(err);
    showStatus("Failed to delete cause.", true);
  }
}

// --- DISPLAY DONATIONS ON WEBSITE ---
async function loadDonations() {
  const causeContainer = document.querySelector(".causes-one .row");
  if (!causeContainer) return;

  causeContainer.innerHTML = "<p>Loading causes...</p>";

  try {
    const snapshot = await getDocs(donationsCollection);
    if (snapshot.empty) {
      causeContainer.innerHTML = "<p>No donation campaigns available.</p>";
      return;
    }

    causeContainer.innerHTML = "";
    snapshot.forEach((docSnap, index) => {
      const cause = docSnap.data();
      const progressPercent = Math.min((cause.raisedAmount / cause.goalAmount) * 100, 100).toFixed(
        0,
      );

      causeContainer.innerHTML += `
        <div class="col-xl-4 col-lg-4 wow fadeInUp" data-wow-delay="${(index + 1) * 100}ms">
          <div class="causes-one__single">
            <div class="causes-one__img">
              <img src="${cause.imagePath}" alt="${cause.title}">
            </div>
            <div class="causes-one__content-box">
              <div class="causes-one__donate-btn-box">
                <a href="donate-now.html" class="thm-btn causes-one__donate-btn">Donate Now</a>
              </div>
              <div class="causes-one__content">
                <h3 class="causes-one__title"><a href="donation-details.html">${
                  cause.title
                }</a></h3>
                <p>${cause.description}</p>
                <div class="causes-one__progress">
                  <div class="bar">
                    <div class="bar-inner count-bar" data-percent="${progressPercent}%">
                      <div class="count-text">${progressPercent}%</div>
                    </div>
                  </div>
                  <div class="causes-one__goals">
                    <p><span>$${cause.raisedAmount}</span> Raised</p>
                    <p><span>$${cause.goalAmount}</span> Goal</p>
                  </div>
                </div>
                <div class="causes-one__btn-box">
                  <a href="donation-details.html" class="causes-one__read-more">Read More 
                    <span class="icon-plus-sign"></span>
                  </a>
                </div>
              </div>
              <div class="causes-one__bottom">
                <ul class="list-unstyled causes-one__list">
                  <li>
                    <div class="icon"><span class="icon-calendar"></span></div>
                    <div class="text"><p>${new Date(cause.eventDate).toDateString()}</p></div>
                  </li>
                  <li>
                    <div class="icon"><span class="icon-back-in-time"></span></div>
                    <div class="text"><p>${cause.eventTime}</p></div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>`;
    });
  } catch (err) {
    console.error("Error loading causes:", err);
    causeContainer.innerHTML = "<p>Failed to load donation campaigns.</p>";
  }
}

// --- EVENT BINDINGS ---
document.addEventListener("DOMContentLoaded", () => {
  const donationForm = document.getElementById("donationForm");
  if (donationForm) {
    donationForm.addEventListener("submit", handleDonationFormSubmit);
  }
  loadDashboardDonations();
  loadDonations();
});

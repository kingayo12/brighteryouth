// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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
const db = getFirestore(app);

// =================================================================
// 2. LOAD RECENT BLOGS (for homepage)
// =================================================================
async function loadBlogs() {
  const q = query(collection(db, "blogs"), orderBy("date", "desc"), limit(3));
  const querySnapshot = await getDocs(q);

  const blogContainer = document.querySelector(".blog-one .row");
  if (!blogContainer) return;
  blogContainer.innerHTML = "";

  querySnapshot.forEach((doc, index) => {
    const blog = doc.data();
    const blogId = doc.id;

    const formattedDate = blog.date
      ? new Date(blog.date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "";

    const blogHTML = `
      <div class="col-xl-4 col-lg-4 wow fadeInUp" data-wow-delay="${(index + 1) * 100}ms">
        <div class="blog-one__single">
          <div class="blog-one__img">
            <img src="${blog.imagePath}" alt="">
            <a href="blog-details.html?id=${blogId}">
              <span class="blog-one__plus"></span>
            </a>
          </div>
          <div class="blog-one__content">
            <div class="blog-one__meta">
              <div class="blog-one__cat">
                <p>${blog.category}</p>
              </div>
              <div class="blog-one__date">
                <p><span class="icon-calendar"></span> ${formattedDate}</p>
              </div>
            </div>
            <h3 class="blog-one__title">
              <a href="blog-details.html?id=${blogId}">${blog.title}</a>
            </h3>
            <p class="blog-one__text">${blog.shortSummary}</p>
          </div>
        </div>
      </div>
    `;
    blogContainer.innerHTML += blogHTML;
  });
}

loadBlogs();

// =================================================================
// 3. LOAD BLOG DETAILS (for single blog page)
// =================================================================
const params = new URLSearchParams(window.location.search);
const blogId = params.get("id");

async function loadBlogDetails() {
  if (!blogId) return;

  const docRef = doc(db, "blogs", blogId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Main blog section
    document.querySelector(".blog-details__img img").src =
      data.imagePath || "assets/images/no-image.jpg";
    document.querySelector(".blog-details__date p").textContent = new Date(
      data.date,
    ).toLocaleDateString();
    document.querySelector(".blog-details__title").textContent = data.title || "Untitled Blog";
    document.querySelector(".blog-details__text-1").textContent = data.shortSummary || "";
    document.querySelector(".blog-details__text-2").textContent = data.content || "";
    document.querySelector(".blog-details__content-two-img").src =
      data.secondary.image || "assets/images/no-image.jpg";
    document.querySelector(".blog-details__content-two-title").textContent =
      data.secondary.title || "Untitled Blog";
    document.querySelector(".blog-details__content-two-text-1").textContent =
      data.secondary.text1 || "Untitled Blog";
    document.querySelector(".blog-details__content-two-text-2").textContent =
      data.secondary.text2 || "Untitled Blog";

    document.querySelector(".author-one__content h3").textContent =
      data.author.name || "Author Name";
    document.querySelector(".author-one__content p").textContent = data.author.bio || "Author Bio";

    document.querySelector(".author-one__image img").src =
      data.author.image || "assets/images/no-image.jpg";

    const keyPointsContainer = document.querySelector(".blog-details__content-two-points");
    if (keyPointsContainer && data.secondary.points) {
      keyPointsContainer.innerHTML = data.secondary.points
        .map((point) => `<li>${point}</li>`)
        .join("");
    }

    // Tags
    const tagsContainer = document.querySelector(".blog-details__tags");
    if (tagsContainer && data.tags) {
      tagsContainer.innerHTML = `
        <span>Tags</span>
        ${data.tags.map((tag) => `<a href="#">${tag}</a>`).join("")}
      `;
    }
  } else {
    console.log("No such document!");
  }
}

loadBlogDetails();

async function loadRecentBlogs() {
  const q = query(collection(db, "blogs"), orderBy("date", "desc"), limit(2));
  const querySnapshot = await getDocs(q);

  const recentBlogsContainer = document.querySelector(".sidebar__post-list");
  if (!recentBlogsContainer) return;
  recentBlogsContainer.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const blog = doc.data();
    const blogId = doc.id;
    const formattedDate = blog.date
      ? new Date(blog.date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "";
    const blogHTML = `
     <ul class="sidebar__post-list list-unstyled">
 <li>
 <div class="sidebar__post-image">
  <img src=${blog.imagePath} alt="">
  </div>
   <div class="sidebar__post-content">
                                            <h3>
                                                <span class="sidebar__post-content-meta"><i
                                                        class="far fa-user-circle"></i> Admin</span>
                                                <a href=${blogId}>${blog.title}</a>
                                            </h3>
                                        </div>
                                    </li>
                                    </ul>`;
    recentBlogsContainer.innerHTML += blogHTML;
  });
}

loadRecentBlogs();

// =================================================================
// 2. LOAD ALL BLOGS (for blog listing page)
// =================================================================
async function loadAllBlogs() {
  const q = query(collection(db, "blogs"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);

  const blogContainer = document.querySelector(".blog-page-v-2 .blgs");
  if (!blogContainer) return;
  blogContainer.innerHTML = "";

  querySnapshot.forEach((doc, index) => {
    const blog = doc.data();
    const blogId = doc.id;

    const formattedDate = blog.date
      ? new Date(blog.date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "";

    const blogHTML = `
      <div class="col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="${(index + 1) * 100}ms">
        <div class="blog-one__single">
          <div class="blog-one__img">
            <img src="${blog.imagePath}" alt="${blog.title}">
            <a href="blog-details.html?id=${blogId}">
              <span class="blog-one__plus"></span>
            </a>
          </div>
          <div class="blog-one__content">
            <div class="blog-one__meta">
              <div class="blog-one__cat">
                <p>${blog.category}</p>
              </div>
              <div class="blog-one__date">
                <p><span class="icon-calendar"></span> ${formattedDate}</p>
              </div>
            </div>
            <h3 class="blog-one__title">
              <a href="blog-details.html?id=${blogId}">${blog.title}</a>
            </h3>
            <p class="blog-one__text">${blog.shortSummary}</p>
          </div>
        </div>
      </div>
    `;
    blogContainer.innerHTML += blogHTML;
  });
}

loadAllBlogs();

async function loadTeams() {
  // const q = query(collection(db, "teams"), orderBy("order", "desc"));
  const q = query(collection(db, "teams"), orderBy("role", "asc"));

  const querySnapshot = await getDocs(q);

  const teamCont = document.querySelector(".team-one .row");
  if (!teamCont) return;
  teamCont.innerHTML = "";

  querySnapshot.forEach((doc, index) => {
    const team = doc.data();

    const teamHTML = `
        <div class="col-xl-3 col-lg-4 wow fadeInUp" data-wow-delay="${(index + 1) * 100}ms">
          <div class="team-one__single">
            <div class="team-one__img">
              <img src="${team.photoPath}" alt="${team.name}">
            </div>
            <div class="team-one__content">
              <h4 class="team-one__name"><a href="#">${team.name}</a></h4>
              <p class="team-one__title">${team.role}</p>
              <div class="team-one__social">
                <a href="#" target="_blank"><i class="fab fa-twitter"></i></a>
                <a href="#" target="_blank"><i class="fab fa-facebook"></i></a>
                
               <a href="#" target="_blank"><i class="fab fa-instagram"></i></a>
                 
                <a href="#" target="_blank"><i class="fab fa-linkedin"></i></a>
                 
              </div>
            </div>
          </div>
        </div>
      `;

    teamCont.innerHTML += teamHTML;
  });
}

loadTeams();

// =================================================================
// 4. PAGINATION LOGIC (for blog listing page)
// =================================================================
document.addEventListener("DOMContentLoaded", function () {
  const pages = document.querySelectorAll(".pg-pagination .count a");
  const nextBtn = document.querySelector(".pg-pagination .next a");
  let currentPage = 0; // starts from first page

  // Function to set active page
  function setActivePage(index) {
    pages.forEach((p) => p.parentElement.classList.remove("active"));
    pages[index].parentElement.classList.add("active");
  }

  // Initialize first page as active
  setActivePage(currentPage);

  // Click event for page numbers
  pages.forEach((page, index) => {
    page.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = index;
      setActivePage(index);
      console.log("Showing page:", index + 1);
      // You can call a function here to load content dynamically
    });
  });

  // Click event for "Next" button
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < pages.length - 1) {
      currentPage++;
      setActivePage(currentPage);
      console.log("Showing page:", currentPage + 1);
    }
  });
});

// async function loadTeamMembers() {
//   try {
//     const q = query(collection(db, "teams"), orderBy("order", "asc"));
//     const querySnapshot = await getDocs(q);

//     const teamContainer = document.querySelector(".team-one .row");
//     if (!teamContainer) return;
//     teamContainer.innerHTML = "";

//     querySnapshot.forEach((doc, index) => {
//       const member = doc.data();
//       alert(member.name);

//       const teamHTML = `
//         <div class="col-xl-3 col-lg-4 wow fadeInUp" data-wow-delay="${(index + 1) * 100}ms">
//           <div class="team-one__single">
//             <div class="team-one__img">
//               <img src="${member.photoPath}" alt="${member.name}">
//             </div>
//             <div class="team-one__content">
//               <h4 class="team-one__name"><a href="#">${member.name}</a></h4>
//               <p class="team-one__title">${member.role}</p>
//               <div class="team-one__social">
//                 <a href="#" target="_blank"><i class="fab fa-twitter"></i></a>
//                 <a href="#" target="_blank"><i class="fab fa-facebook"></i></a>

//                <a href="#" target="_blank"><i class="fab fa-instagram"></i></a>

//                 <a href="#" target="_blank"><i class="fab fa-linkedin"></i></a>

//               </div>
//             </div>
//           </div>
//         </div>
//       `;

//       teamContainer.innerHTML += teamHTML;
//     });
//   } catch (error) {
//     console.error("Error loading team members:", error);
//   }
// }

// loadTeamMembers();

async function loadRecentDonations() {
  const q = query(collection(db, "donations"), orderBy("eventDate", "desc"), limit(3));
  const querySnapshot = await getDocs(q);

  const recentEventContainer = document.querySelector(".causes-one .row");
  if (!recentEventContainer) return;

  recentEventContainer.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const events = doc.data();
    const eventsID = doc.id;

    // Handle percentage calculation safely
    const raised = parseFloat(events.raisedAmount) || 0;
    const goal = parseFloat(events.goalAmount) || 1;
    const percent = Math.min((raised / goal) * 100, 100).toFixed(0);

    const formattedDate = events.eventDate
      ? new Date(events.eventDate).toLocaleDateString()
      : "Upcoming";
    const eventTime = events.eventTime || "TBA";

    const donationHTML = `
      <div class="col-xl-4 col-lg-4 wow fadeInUp" data-wow-delay="100ms">
        <!--Causes One Single-->
        <div class="causes-one__single">
          <div class="causes-one__img">
            <img src="${events.imagePath || "assets/images/no-image.jpg"}" alt="${
      events.title || "Donation"
    }">
          </div>
          <div class="causes-one__content-box">
            <div class="causes-one__donate-btn-box">
              <a href="donate-now.html?id=${eventsID}" class="thm-btn causes-one__donate-btn">Donate Now</a>
            </div>
            <div class="causes-one__content">
              <h3 class="causes-one__title">
                <a href="donation-details.html?id=${eventsID}">${
      events.title || "Untitled Campaign"
    }</a>
              </h3>
              <div class="causes-one__progress">
                <div class="bar">
                  <div class="bar-inner count-bar" data-percent="${percent}%">
                    <div class="count-text">${percent}%</div>
                  </div>
                </div>
                <div class="causes-one__goals">
                  <p><span>$${raised.toLocaleString()}</span> Raised</p>
                  <p><span>$${goal.toLocaleString()}</span> Goal</p>
                </div>
              </div>
              <div class="causes-one__btn-box">
                <a href="donation-details.html?id=${eventsID}" class="causes-one__read-more">
                  Read More <span class="icon-plus-sign"></span>
                </a>
              </div>
            </div>
            <div class="causes-one__bottom">
              <ul class="list-unstyled causes-one__list">
                <li>
                  <div class="icon">
                    <span class="icon-calendar"></span>
                  </div>
                  <div class="text">
                    <p>${formattedDate}</p>
                  </div>
                </li>
                <li>
                  <div class="icon">
                    <span class="icon-back-in-time"></span>
                  </div>
                  <div class="text">
                    <p>${eventTime}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;

    recentEventContainer.innerHTML += donationHTML;
  });
}

loadRecentDonations();

// =================================================================
// 3. LOAD BLOG DETAILS (for single blog page)
// =================================================================
// const params = new URLSearchParams(window.location.search);
// const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

async function loadDonateNow() {
  if (!eventId) return console.log("No donation ID found in URL");

  const docRef = doc(db, "donations", eventId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.log("No such donation document!");
    return;
  }

  const data = docSnap.data();

  // DOM references
  const imgEl = document.querySelector(".donate-now__causes-img img");
  const titleEl = document.querySelector(".donate-now__causes-title a");
  const descEl = document.querySelector(".donate-now__causes-text");
  const raisedEl = document.querySelector(".donate-now__goals p:first-child span");
  const goalEl = document.querySelector(".donate-now__goals p:last-child span");
  const barEl = document.querySelector(".donate-now__progress .bar-inner");
  const percentText = document.querySelector(".donate-now__progress .count-text");
  const organizerDateEl = document.querySelector(".donation-details__organizer-date");
  const organizerNameEl = document.querySelector(".donation-details__organizer-name");
  const categoryEl = document.querySelector(
    ".donation-details__organizer-list li:nth-child(1) .text p",
  );
  const locationEl = document.querySelector(
    ".donation-details__organizer-list li:nth-child(2) .text p",
  );

  // Image
  imgEl.src = data.imagePath || "assets/images/no-image.jpg";
  imgEl.alt = data.title || "Donation Cause";

  // Title and Description
  titleEl.textContent = data.title || "Untitled Campaign";
  descEl.textContent = data.description || "No description provided.";

  // Progress bar
  const raised = parseFloat(data.raisedAmount) || 0;
  const goal = parseFloat(data.goalAmount) || 1;
  const percent = Math.min((raised / goal) * 100, 100).toFixed(0);
  barEl.style.width = `${percent}%`;
  barEl.dataset.percent = `${percent}%`;
  percentText.textContent = `${percent}%`;

  // Raised & Goal
  raisedEl.textContent = `$${raised.toLocaleString()}`;
  goalEl.textContent = `$${goal.toLocaleString()}`;

  // Organizer info
  organizerDateEl.textContent = `Created ${new Date(
    data.dateCreated || Date.now(),
  ).toDateString()}`;
  organizerNameEl.textContent = data.organizerName || "Admin";
  categoryEl.textContent = data.category || "General";
  locationEl.textContent = data.location || "Not specified";

  console.log(`Donation loaded: ${data.title}`);
}

document.addEventListener("DOMContentLoaded", loadDonateNow);

const donationId = new URLSearchParams(window.location.search).get("id");

async function loadDonationDetails() {
  if (!donationId) return console.log("No donation ID found in URL");

  const docRef = doc(db, "donations", donationId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.log("No such donation document!");
    return;
  }

  const data = docSnap.data();

  // DOM references
  const imgEl = document.querySelector(".donation-details__top-img img");
  const categoryEl = document.querySelector(".donation-details__category span");
  const titleEl = document.querySelector(".donation-details__title");
  const descEl = document.querySelector(".donation-details__text-1");
  const raisedEl = document.querySelector(".donation-details__goals p .first");
  const goalEl = document.querySelector(".donation-details__goals p .second");
  const barEl = document.querySelector(".donation-details__progress .bar-inner");
  const percentText = document.querySelector(".donation-details__progress .count-text");
  const donateBtn = document.querySelector(".donation-details__top-donate-btn-box a");
  // alert(raisedEl.textContent);

  // Set image
  imgEl.src = data.imagePath || "assets/images/no-image.jpg";
  imgEl.alt = data.title || "Donation Cause";
  // alert(raisedEl.textContent);

  // Set category
  categoryEl.textContent = data.category || "General";

  // Title and descriptions
  titleEl.textContent = data.title || "Untitled Campaign";
  descEl.textContent = data.description || "No description provided.";

  // Raised, goal, and progress bar
  const raised = parseFloat(data.raisedAmount) || 0;
  const goal = parseFloat(data.goalAmount) || 1;
  const percent = Math.min((raised / goal) * 100, 100).toFixed(0);

  barEl.style.width = `${percent}%`;
  barEl.dataset.percent = `${percent}%`;
  percentText.textContent = `${percent}%`;

  raisedEl.textContent = `$${raised.toLocaleString()}` || "hi";
  // alert(raisedEl.textContent);
  goalEl.textContent = `$${goal.toLocaleString()}`;

  // Donate Now button
  donateBtn.href = `donate-now.html?id=${donationId}`;

  console.log(`Donation loaded: ${data.title}`);
}

document.addEventListener("DOMContentLoaded", loadDonationDetails);

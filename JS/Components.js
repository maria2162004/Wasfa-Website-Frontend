// Utility function to decode JWT and extract payload
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

// Utility function to check if the user is an admin
function isAdmin() {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1];

  if (!accessToken) return false;

  const payload = decodeToken(accessToken);
  return payload?.is_admin || false;
}

// Navbar Component
class NavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        /* Navigation */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background-color: #7d0a0a;
          font-family: "ADLaM Display", system-ui;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        /* Logo */
        nav img {
          width: 200px;
          height: auto;
          max-width: 100%;
          transition: transform 0.3s ease;
        }

        nav img:hover {
          transform: scale(1.03);
        }

        /* Navigation Search Container */
        .search-container {
          display: flex;
          flex-direction: row;
          gap: 20px;
          align-items: center;
          flex: 1;
          margin: 0 20px;
          max-width: 500px;
        }

        #searchForm {
          display: flex;
          width: 100%;
          gap: 10px;
          align-items: center;
        }

        #searchInput {
          width: 100%;
          padding: 8px 15px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          transition: box-shadow 0.3s ease;
        }

        #searchInput:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
        }

        #searchBtn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        #searchBtn:hover {
          transform: scale(1.1);
        }

        #searchBtn img {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .auth-buttons button {
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          white-space: nowrap;
          color: #7d0a0a;
          background-color: white;
          transition: all 0.2s ease;
        }

        .auth-buttons button:hover {
          background-color: #f0f0f0;
          transform: translateY(-1px);
        }

        /* Auth Icons */
        .auth-icon {
          width: 60px;
          height: 60px;
          margin-right: 10px;
          transition: transform 0.2s ease;
        }

        .auth-icon:hover {
          transform: scale(1.1);
        }

        #logoutBtn {
          background: none;
          border: none;
          cursor: pointer;
          color: #7d0a0a;
          font-size: 1rem;
          padding: 8px 12px;
          border-radius: 4px;
          background-color: white;
          transition: all 0.2s ease;
        }

        #logoutBtn:hover {
          background-color: #f0f0f0;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          nav {
            flex-direction: column;
            padding: 10px;
          }
          
          .search-container {
            margin: 10px 0;
            width: 100%;
          }
          
          .auth-buttons {
            width: 100%;
            justify-content: center;
          }
        }
      </style>
      
      <nav>
        <a href="../HTML/HomePage.html">
          <img src="../Images/WasfaLogo.svg" alt="Website Logo" />
        </a>

        <div class="search-container">
          <form id="searchForm">
            <input type="text" id="searchInput" placeholder="Search..." oninput="handleSearchInput(this.value)" />
            <button type="submit" id="searchBtn">
              <img src="../Images/search-icon.png" alt="Search Icon" />
            </button>
          </form>
        </div>

        <div class="auth-buttons" id="authButtons">
          <a href="../HTML/SignUp.html"><button type="button">Sign Up</button></a>
          <a href="../HTML/LogIn.html"><button type="button">Login</button></a>
        </div>
      </nav>
    `;

    // Add form submission handler with redirect
    this.querySelector("#searchForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const searchTerm = this.querySelector("#searchInput").value.trim();
      if (searchTerm) {
        const encodedQuery = encodeURIComponent(searchTerm);
        window.location.href = `SearchResults.html?query=${encodedQuery}`;
      }
    });

    // Initialize auth buttons
    this.updateAuthButtons();

    // Listen for auth changes
    window.addEventListener("storage", () => {
      this.updateAuthButtons();
    });
  }

  updateAuthButtons() {
    const accessToken = this.getCookie("access_token");
    const refreshToken = this.getCookie("refresh_token");
    const authButtons = this.querySelector("#authButtons");

    if (accessToken && refreshToken) {
      // Decode token to get user info
      const payload = decodeToken(accessToken);
      const user = { isAdmin: payload.is_admin };

      authButtons.innerHTML = `
            ${
              !user.isAdmin
                ? `
            <a href="../HTML/FavoriteRecipes.html">
                <button type="button" style="background: none; border: none; cursor: pointer;">
                    <img src="../Images/favouriteicon.png" alt="Favourites" style="width: 60px; margin-right:10px" />
                </button>
            </a>
            `
                : ""
            }
            ${
              user.isAdmin
                ? `
            <a href="../HTML/AddRecipe.html">
                <button type="button" style="background: none; border: none; cursor: pointer;">
                    <img src="../Images/addicon.png" alt="Add" style="width: 60px; margin-right:10px" />
                </button>
            </a>
            `
                : ""
            }
            <button type="button" id="logoutBtn">Logout</button>
        `;

      const logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.addEventListener("click", () => {
        this.deleteCookie("access_token");
        this.deleteCookie("refresh_token");
        location.reload();
      });
    } else {
      authButtons.innerHTML = `
            <a href="../HTML/SignUp.html"><button type="button">Sign Up</button></a>
            <a href="../HTML/LogIn.html"><button type="button">Login</button></a>
        `;
    }
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

// Footer Component
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        footer {
          background-color: #7D0A0A;
          color: white;
          padding: 30px;
          position: relative;
          overflow: hidden;
          text-align: center;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        footer::before {
          content: "Wasfa";
          position: absolute;
          top: 60%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 220px;
          font-weight: bold;
          opacity: 0.05;
          letter-spacing: 18px;
          white-space: nowrap;
        }

        .footer-content {
          position: relative;
          z-index: 1;
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-link {
          color: white;
          text-decoration: none;
          font-size: 25px;
          display: inline-block;
          padding: 6px 12px;
          position: relative;
          transition: all 0.25s ease;
        }

        .footer-link:hover {
          scale: 1.1;
        }

        .copyright {
          color: rgba(238, 238, 238, 0.5);
          font-size: 0.85rem;
          margin-top: 10px;
          letter-spacing: 0.5px;
        }

      </style>
      
      <footer>
        <div class="footer-content">
          <a href="../HTML/AboutUs.html" class="footer-link">About Us</a>
          <div class="copyright">
            Wasfa 2025 &copy;
          </div>
        </div>
      </footer>
    `;
  }
}

// Scroll Button Component
class ScrollButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <style>
      #scrollTopBtn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      display: none;
      width: 50px;
      height: 50px;
      font-size: 25px;
      background: linear-gradient(135deg, #7d0a0a, #bf3131);
      border: none;
      color: #eeeeee;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 999;
    }

    #scrollTopBtn:hover {
      transform: scale(1.1);
    }
    </style>

    <button id="scrollTopBtn" title="Go to top">
      <i class="fas fa-utensils"></i>
    </button>
    `;

    const scrollBtn = document.getElementById("scrollTopBtn");

    window.onscroll = () => {
      if (
        document.body.scrollTop > 750 ||
        document.documentElement.scrollTop > 750
      ) {
        scrollBtn.style.display = "block";
      } else {
        scrollBtn.style.display = "none";
      }
    };

    scrollBtn.onclick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }
}

// Register both components
customElements.define("nav-bar", NavBar);
customElements.define("site-footer", SiteFooter);
customElements.define("scroll-button", ScrollButton);

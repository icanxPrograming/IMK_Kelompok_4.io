// Mengatur toggle menu pada ikon hamburger
const header = document.querySelector("header");

let menu = document.querySelector("#menu-icon");
let navmenu = document.querySelector(".navmenu");

menu.onclick = () => {
  navmenu.classList.toggle("open"); // PENJELASAN: Membuka atau menutup menu navigasi saat ikon menu diklik
};

// Menangani klik di luar elemen menu atau search form
const hamMenu = document.querySelector("#menu-icon");
const searchBtn = document.querySelector("#btn-search");
const searchForm = document.querySelector(".search-form");

document.addEventListener("click", function (e) {
  if (!hamMenu.contains(e.target) && !navmenu.contains(e.target)) {
    navmenu.classList.remove("open"); // PENJELASAN: Menutup menu jika klik di luar elemen menu
  }
  if (!searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("open"); // PENJELASAN: Menutup search form jika klik di luar
  }
});

// Mengatur fungsi tombol pencarian
const searchBox = document.querySelector("#search-box");

document.querySelector("#btn-search").onclick = (e) => {
  searchForm.classList.toggle("open");
  searchBox.focus(); // PENJELASAN: Fokus langsung ke input pencarian setelah dibuka
  e.preventDefault(); // PENJELASAN: Mencegah reload halaman saat klik tombol search
};

function handleSearch() {
  const keyword = document
    .getElementById("search-box")
    .value.toLowerCase()
    .trim();

  // Gunakan path relatif (../)
  const keywordMap = {
    "../produkpage/pagekaos.html": ["kaos", "ka", "kaos pria", "t-shirt"],
    "../produkpage/pagekemeja.html": ["kemeja", "kem", "shirt", "kemeja pria"],
    "../produkpage/pagehoodie.html": ["hoodie", "jaket", "sweater"],
    "../produkpage/pagelimitededition.html": [
      "limited",
      "edisi terbatas",
      "limited edition",
    ],
    "../produkpage/pagesale.html": ["sale", "diskon", "promo"],
    "../produkpage/pagerayaseries.html": ["raya", "lebaran", "idul fitri"],

    "../support/pageFAQs.html": ["cara", "order", "cara order", "pemesanan"],
    "../support/pageReturn.html": ["return", "refund", "pengembalian", "retur"],
    "../support/pageAbout.html": [
      "tentang",
      "about",
      "tentang kami",
      "info toko",
    ],
  };

  let found = false;

  for (const [page, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => keyword.includes(kw) || kw.includes(keyword))) {
      window.location.href = page;
      found = true;
      break;
    }
  }

  if (!found) {
    showSearchAlert(
      "Kategori tidak ditemukan. Coba kata kunci seperti: kaos, hoodie, return, tentang, dll."
    );
  }
}

// ENTER key handler
document.getElementById("search-box").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});

// Klik ikon pencarian handler (pastikan id: search-icon-btn)
document
  .getElementById("search-icon-btn")
  .addEventListener("click", function () {
    handleSearch();
  });

// Alert box tampil di atas form
const showSearchAlert = (message) => {
  const alertBox = document.getElementById("search-alert");
  alertBox.textContent = message;
  alertBox.style.display = "block";

  setTimeout(() => {
    alertBox.style.display = "none";
  }, 3000);
};

// Navigasi ke halaman keranjang
// document.querySelectorAll(".cart-icon").forEach((btn) => {
//   btn.addEventListener("click", (e) => {
//     e.preventDefault();
//     window.location.href = "../cart/cartpage.html"; // PENJELASAN: Arahkan ke halaman keranjang
//   });
// });

// Pencegahan default saat klik profil user (mode desktop)
document.querySelectorAll(".user-trigger").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    if (window.innerWidth > 630) {
      e.preventDefault();
    }
  });
});

// Pencegahan default saat klik profil user (mode desktop)
document.querySelectorAll(".user-trigger").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    if (window.innerWidth > 630) {
      e.preventDefault();
    }
  });
});

// Objek untuk mengelola sesi pengguna
const Auth = {
  checkSession: () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && Date.now() > user.expiresAt) {
      localStorage.removeItem("currentUser");
      return false;
    }
    return !!user;
  },

  updateUI: async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const cartButton = document.getElementById("btn-cart");
    const cartCounter = document.querySelector(".cart-counter");

    // Desktop UI
    const desktopTrigger = document.querySelector(".user-trigger");
    const desktopDropdown = document.querySelector(".login-dropdown");
    if (desktopTrigger && desktopDropdown) {
      if (currentUser) {
        const nickName = currentUser.nickName || "User";
        desktopTrigger.textContent = nickName;
        desktopDropdown.innerHTML = `
          <span class="logged-as">Hai, ${nickName}</span>
          <a href="../history/historypage.html" class="history-btn">
          Riwayat Pesanan
          </a>
          <a href="#" class="logout-btn">Logout</a>
        `;
        if (cartCounter) {
          cartCounter.style.display = "block";
        }
        if (cartButton) cartButton.disabled = false;
      } else {
        desktopTrigger.innerHTML = '<i class="bx bxs-user"></i>';
        desktopDropdown.innerHTML = `
          <a href="../loginpage/loginpage.html" class="login-btn">Masuk</a>
          <a href="../registerpage/registerpage.html" class="register-btn">Daftar</a>
        `;
        if (cartCounter) {
          cartCounter.style.display = "none";
          cartCounter.textContent = "";
        }
        if (cartButton) cartButton.disabled = true;
      }
    }

    // Mobile UI
    const mobileUserIcon = document.querySelector(".mobile-user-icon");
    const bottomNavbar = document.querySelector(".bottom-navbar");

    if (mobileUserIcon) {
      if (currentUser) {
        const nickName = currentUser.nickName || "User";
        mobileUserIcon.textContent = nickName;
        mobileUserIcon.classList.add("logged-in");
        mobileUserIcon.href = "#";

        mobileUserIcon.addEventListener("click", (e) => {
          e.preventDefault();
          showLogoutConfirmation();
        });

        // Tambahkan tombol history di bottom navbar (jika belum ada)
        if (!document.querySelector(".mobile-history-icon")) {
          const historyLink = document.createElement("a");
          historyLink.href = "../history/historypage.html";
          historyLink.className = "mobile-history-icon";
          historyLink.innerHTML = '<i class="bx bxs-receipt"></i>';
          historyLink.title = "Riwayat Pesanan";
          bottomNavbar.appendChild(historyLink);
        }
      } else {
        mobileUserIcon.innerHTML = '<i class="bx bxs-user"></i>';
        mobileUserIcon.classList.remove("logged-in");
        mobileUserIcon.href = "../loginpage/loginpage.html";

        // Hapus tombol history jika user tidak login
        const existingHistoryIcon = document.querySelector(
          ".mobile-history-icon"
        );
        if (existingHistoryIcon) {
          existingHistoryIcon.remove();
        }
      }
    }

    // Perbarui jumlah item di keranjang
    updateCartCounter(currentUser?.email);
  },

  logout: () => {
    localStorage.removeItem("currentUser");
    Swal.fire({
      icon: "success",
      title: "Logout berhasil",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      window.location.reload();
    });
  },
};

// Melindungi akses ke halaman keranjang
const protectCartPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser && window.location.pathname.includes("/cart/")) {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
  }
};

// Penanganan klik pada tombol keranjang
const handleCartClick = (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();

  if (Auth.checkSession()) {
    window.location.href = e.currentTarget.getAttribute("href");
  } else {
    const returnUrl = encodeURIComponent(window.location.href);

    Swal.fire({
      title: "Login Diperlukan",
      text: "Silakan login untuk mengakses keranjang belanja.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
      }
    });
  }
};

// Inisialisasi ketika DOM selesai dimuat
document.addEventListener("DOMContentLoaded", async () => {
  await Auth.updateUI(); // PENJELASAN: Perbarui tampilan berdasarkan status login
  updateCartCounter();

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("logout-btn")) {
      e.preventDefault();
      showLogoutConfirmation();
    }

    if (e.target.classList.contains("mobile-user-icon.logged-in")) {
      e.preventDefault();
      showLogoutConfirmation();
    }
  });

  protectCartPage(); // PENJELASAN: Cek sesi saat load halaman

  document.querySelectorAll("#btn-cart, .mobile-cart").forEach((cart) => {
    cart.addEventListener("click", handleCartClick);
  });
});

// Pemeriksaan sesi pengguna setiap 60 detik
setInterval(() => {
  protectCartPage();
}, 60000);

// Fungsi konfirmasi logout
function showLogoutConfirmation() {
  Swal.fire({
    title: "Logout",
    text: "Anda yakin ingin keluar?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",
    reverseButtons: true,
    confirmButtonColor: "#dc3545",
  }).then((result) => {
    if (result.isConfirmed) {
      Auth.logout();
    }
  });
}

// Update counter keranjang
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-counter").forEach((counter) => {
    counter.textContent = totalItems;
  });
}

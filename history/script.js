// import "boxicons/css/boxicons.min.css";

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

  const keywordMap = {
    "../produkpage/pagekaos.html": ["kaos", "ka", "t-shirt", "kaos pria"],
    "../produkpage/pagekemeja.html": ["kemeja", "kem", "shirt", "kemeja pria"],
    "../produkpage/pagehoodie.html": ["hoodie", "jaket", "sweater"],
    "../produkpage/pagelimitededition.html": ["limited", "edisi terbatas"],
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

document.getElementById("search-box").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});

document
  .getElementById("search-icon-btn")
  .addEventListener("click", function () {
    handleSearch();
  });

const showSearchAlert = (message) => {
  const alertBox = document.getElementById("search-alert");
  alertBox.textContent = message;
  alertBox.style.display = "block";

  // Sembunyikan setelah 3 detik
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 3000);
};

// Navigasi ke halaman keranjang
document.querySelectorAll(".cart-icon").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "cart/cartpage.html"; // PENJELASAN: Arahkan ke halaman keranjang
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
          <a href="historypage.html" class="history-btn">
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
          historyLink.href = "historypage.html";
          historyLink.className = "mobile-history-icon";
          historyLink.innerHTML = '<i class="bx bx-note"></i>';
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

// Fungsi proteksi opsional
function protectHistoryPage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    Swal.fire({
      icon: "info",
      title: "Akses Dibatasi",
      text: "Silakan login untuk melihat riwayat pesanan Anda.",
      showConfirmButton: true,
      confirmButtonText: "Login Sekarang",
    }).then(() => {
      window.location.href = "../loginpage/loginpage.html";
    });
  }
}

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

function initializeOrderHistory() {
  let currentPage = 1;
  const itemsPerPage = 5;

  function renderOrders(filteredOrders) {
    const container = document.querySelector(".order-history-container");
    const emptyState = document.querySelector(".empty-history");

    if (!container) return;
    container.innerHTML = "";

    if (filteredOrders.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(
      startIdx,
      startIdx + itemsPerPage
    );

    paginatedOrders.forEach((order) => {
      const card = document.createElement("div");
      card.className = "order-card";
      card.innerHTML = `
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">${order.id}</span>
            <span class="order-date">${formatDate(order.date)}</span>
          </div>
          <span class="order-status ${order.status}">${getStatusLabel(
        order.status
      )}</span>
        </div>
        <div class="order-items">
          ${order.items
            .map(
              (item) => `
            <div class="order-item">
              <img src="${item.image}" alt="${item.name}" class="item-img" />
              <div class="item-details">
                <h4 class="item-name">${item.name}</h4>
                <p class="item-variant">${item.variant}</p>
                <p class="item-price">Rp ${(
                  item.price * item.qty
                ).toLocaleString("id-ID")}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        <!-- Tambahkan estimasi tiba -->
        <div class="order-delivery">
    <p><strong>Estimasi Tiba:</strong> <span>${formatDate(
      order.shipping.estimatedDelivery
    )}</span></p>
  </div>
        <div class="order-footer">
          <div class="order-total">
            <span>Total Pesanan:</span>
            <span class="total-amount">Rp ${order.items
              .reduce((sum, item) => sum + item.price * item.qty, 0)
              .toLocaleString("id-ID")}</span>
          </div>
          <div class="order-actions">
            ${renderDynamicButtons(order)}
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    updatePagination(totalPages);
  }

  function applyFilters() {
    const statusFilter = document.getElementById("status-filter").value;
    const dateFilter = document.getElementById("date-filter").value;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    const filteredOrders = filterOrders(orders, statusFilter, dateFilter);
    renderOrders(filteredOrders);
  }

  function filterOrders(orders, statusFilter, dateFilter) {
    const now = new Date();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (dateFilter !== "all") {
        const orderDate = new Date(order.date);
        switch (dateFilter) {
          case "week":
            return (
              orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            );
          case "month":
            return (
              orderDate >=
              new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            );
          case "3months":
            return (
              orderDate >=
              new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
            );
          case "year":
            return (
              orderDate >=
              new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            );
          default:
            return true;
        }
      }
      return true;
    });
  }

  function updatePagination(totalPages) {
    const pageNumbers = document.querySelector(".page-numbers");
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    pageNumbers.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const span = document.createElement("span");
      span.className = `page-number ${i === currentPage ? "active" : ""}`;
      span.textContent = i;
      span.addEventListener("click", () => {
        currentPage = i;
        applyFilters();
      });
      pageNumbers.appendChild(span);
    }

    prevBtn.disabled = currentPage === 1;
    prevBtn.classList.toggle("disabled", currentPage === 1);
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.classList.toggle(
      "disabled",
      currentPage === totalPages || totalPages === 0
    );
  }

  function formatDate(dateString) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  }

  function getStatusLabel(status) {
    const labels = {
      processing: "Diproses",
      shipped: "Dikirim",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  }

  function renderDynamicButtons(order) {
    const now = new Date();
    const estimatedDelivery = new Date(order.shipping.estimatedDelivery);
    const canComplete = order.status === "shipped" && now >= estimatedDelivery;
    const canRate = order.status === "completed";
    const canReturn = now >= estimatedDelivery;

    let buttons = "";

    // Tombol Lihat Detail selalu ada jika ada pesanan
    buttons += `<a href="../orderdetail/orderdetail.html?orderId=${encodeURIComponent(
      order.id
    )}" class="action-btn detail-btn">Lihat Detail</a>`;

    if (canComplete) {
      buttons += `<button class="action-btn complete-btn" data-order-id="${order.id}">Selesaikan Pesanan</button>`;
    }
    if (canRate) {
      buttons += `<a href="../review/reviewpage.html?orderId=${encodeURIComponent(
        order.id
      )}" class="rate-btn">Nilai Pesanan</a>`;
    }
    if (canReturn) {
      buttons += `<button class="action-btn return-btn">Ajukan Pengembalian</button>`;
    }

    return buttons;
  }

  function updateOrderStatuses(orders) {
    const now = new Date();
    return orders.map((order) => {
      if (order.status === "cancelled") return order;

      const processTime = new Date(order.date);
      processTime.setHours(
        processTime.getHours() +
          (new Date(order.date).getHours() >= 16 ? 24 : 12)
      );

      if (order.status === "processing" && now >= processTime) {
        order.status = "shipped";
      }

      const estimatedDelivery = new Date(order.shipping.estimatedDelivery);
      if (order.status === "shipped" && now >= estimatedDelivery) {
        order.status = "completed";
      }

      return order;
    });
  }

  // Event listener untuk tombol Selesaikan
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("complete-btn")) {
      const orderId = e.target.getAttribute("data-order-id");
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: "completed" } : order
      );
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      applyFilters();
    }
  });

  // Update status secara berkala
  setInterval(() => {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const updatedOrders = updateOrderStatuses(orders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    applyFilters();
  }, 60000); // Setiap 1 menit

  // Inisialisasi awal
  document
    .getElementById("apply-filter")
    .addEventListener("click", applyFilters);
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      applyFilters();
    }
  });
  document.getElementById("next-page").addEventListener("click", () => {
    currentPage++;
    applyFilters();
  });

  applyFilters();
}

// Inisialisasi ketika DOM selesai dimuat
document.addEventListener("DOMContentLoaded", async () => {
  await Auth.updateUI(); // PENJELASAN: Perbarui tampilan berdasarkan status login
  updateCartCounter();

  initializeOrderHistory();

  // Jika halaman history harus login dulu
  protectHistoryPage();

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

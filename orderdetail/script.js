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
    window.location.href = "../cart/cartpage.html"; // PENJELASAN: Arahkan ke halaman keranjang
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Ambil orderId dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("orderId");

  // Cek apakah orderId tersedia
  if (!orderId) {
    Swal.fire({
      icon: "error",
      title: "Order ID Tidak Ditemukan",
      text: "Silakan kembali ke halaman riwayat.",
      confirmButtonText: "Kembali ke Riwayat",
    }).then(() => {
      window.location.href = "../history/historypage.html";
    });
    return;
  }

  // Cek login (opsional tapi direkomendasikan)
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Anda harus login untuk melihat detail pesanan.");
    window.location.href =
      "../loginpage/loginpage.html?return=" +
      encodeURIComponent(window.location.href);
    return;
  }

  // Ambil data pesanan dari localStorage
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find((o) => o.id === orderId);

  // Jika pesanan tidak ditemukan
  if (!order) {
    Swal.fire({
      icon: "error",
      title: "Pesanan Tidak Ditemukan",
      text: "Pastikan Anda telah login dan memiliki pesanan.",
      confirmButtonText: "Kembali ke Riwayat",
    }).then(() => {
      window.location.href = "../history/historypage.html";
    });
    return;
  }

  // Fungsi format tanggal
  function formatDate(dateString) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  }

  // Fungsi bantuan agar aman dari error
  function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setElementHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
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

  // Isi data ke DOM
  setElementText("order-id", order.id);
  setElementText("order-date", formatDate(order.date));

  const statusEl = document.getElementById("order-status");
  if (statusEl) {
    statusEl.textContent = getStatusLabel(order.status);
    statusEl.className = `order-status ${order.status}`;
  }

  setElementText("buyer-name", order.buyer.name);
  setElementText(
    "buyer-address",
    `${order.buyer.address}, ${order.buyer.city}`
  );
  setElementText("buyer-province", order.buyer.province);
  setElementText("buyer-postalcode", order.buyer.postalcode);
  setElementText("buyer-phone", order.buyer.phone);
  setElementText(
    "shipping-cost",
    `Rp ${order.shipping.cost.toLocaleString("id-ID")}`
  );

  // Total Harga (subtotal + ongkir)
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const totalHarga = subtotal + order.shipping.cost;
  setElementText("order-total", `Rp ${totalHarga.toLocaleString("id-ID")}`);

  // Estimasi Pengiriman
  setElementText("delivery-duration", order.shipping.duration);
  setElementText("delivery-date", formatDate(order.shipping.estimatedDelivery));

  // Render daftar produk
  const itemList = document.getElementById("item-list");
  if (itemList) {
    itemList.innerHTML = ""; // Kosongkan sebelum render ulang
    order.items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>Variasi: ${item.variant}</p>
          <p>Harga: Rp ${(item.price * item.qty).toLocaleString("id-ID")}</p>
        </div>
      `;
      itemList.appendChild(itemDiv);
    });
  }

  // Update link WhatsApp
  // Update link WhatsApp
  const whatsappLink = document.getElementById("whatsapp-link");
  if (whatsappLink) {
    const message = `
Halo NEPTUNES Store,

Saya ${order.buyer.name} ingin bertanya tentang pesanan saya:

ID Pesanan: ${order.id}
Tanggal Pesanan: ${formatDate(order.date)}
Status: ${getStatusLabel(order.status)}

Detail Produk:
${order.items
  .map(
    (item) =>
      `• ${item.name} (${item.qty}x) - Rp ${(
        item.price * item.qty
      ).toLocaleString("id-ID")}`
  )
  .join("\n")}
Total: Rp ${(
      order.items.reduce((sum, i) => sum + i.price * i.qty, 0) +
      order.shipping.cost
    ).toLocaleString("id-ID")}

Terima kasih.
`.trim();

    const encodedMessage = encodeURIComponent(message);
    whatsappLink.href = `https://wa.me/6282121884390?text=${encodedMessage}`;
  }
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
          <a href="history/historypage.html" class="history-btn">
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
          <a href="loginpage/loginpage.html" class="login-btn">Masuk</a>
          <a href="registerpage/registerpage.html" class="register-btn">Daftar</a>
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
          historyLink.href = "history/historypage.html";
          historyLink.className = "mobile-history-icon";
          historyLink.innerHTML = '<i class="bx bxs-receipt"></i>';
          historyLink.title = "Riwayat Pesanan";
          bottomNavbar.appendChild(historyLink);
        }
      } else {
        mobileUserIcon.innerHTML = '<i class="bx bxs-user"></i>';
        mobileUserIcon.classList.remove("logged-in");
        mobileUserIcon.href = "loginpage/loginpage.html";

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
    window.location.href = `loginpage/loginpage.html?return=${returnUrl}`;
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

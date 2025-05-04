const header = document.querySelector("header");

let menu = document.querySelector("#menu-icon");
let navmenu = document.querySelector(".navmenu");

menu.onclick = () => {
  navmenu.classList.toggle("open");
};

const hamMenu = document.querySelector("#menu-icon");
const searchBtn = document.querySelector("#btn-search");

document.addEventListener("click", function (e) {
  if (!hamMenu.contains(e.target) && !navmenu.contains(e.target)) {
    navmenu.classList.remove("open");
  }
  if (!searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("open");
  }
});

const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");

document.querySelector("#btn-search").onclick = (e) => {
  searchForm.classList.toggle("open");
  searchBox.focus();
  e.preventDefault();
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

// Konten detail produk
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  // Validasi parameter wajib
  const requiredParams = ["title", "price", "images"];
  if (!requiredParams.every((p) => params.has(p))) {
    alert("Produk tidak valid! Redirect ke halaman utama...");
    window.location.href = "../index.html";
    return;
  }

  // Format data produk
  const product = {
    title: decodeURIComponent(params.get("title")),
    price: parseInt(params.get("price")),
    oldPrice: params.has("oldprice") ? parseInt(params.get("oldprice")) : null,
    images: params
      .get("images")
      .split(",")
      .map((img) => `../img/${img}`),
    sizes: JSON.parse(
      decodeURIComponent(
        params.get("sizes") || '["S","M","L","XL","2XL","3XL"]'
      )
    ),
    description: decodeURIComponent(
      params.get("desc") || "Deskripsi tidak tersedia"
    ),
    status: params.get("status") || "available",
  };

  // Update UI
  document.getElementById("productTitle").textContent = product.title;

  const priceContainer = document.getElementById("productPrice");
  priceContainer.innerHTML = product.oldPrice
    ? `<span class="current-price">${formatCurrency(
        product.price
      )}</span><span class="old-price">${formatCurrency(
        product.oldPrice
      )}</span>`
    : `<span class="current-price">${formatCurrency(product.price)}</span>`;

  const sizeOptions = document.getElementById("sizeOptions");
  product.sizes.forEach((size) => {
    const btn = document.createElement("button");
    btn.className = "size-btn";
    btn.textContent = size;
    btn.onclick = () => {
      document
        .querySelectorAll(".size-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
    sizeOptions.appendChild(btn);
  });

  const status = product.status;
  if (status === "soldout") {
    const soldoutBadge = document.getElementById("soldoutBadge");
    if (soldoutBadge) soldoutBadge.style.display = "block";

    const disableButtons = (selector) => {
      const elements =
        typeof selector === "string"
          ? document.querySelectorAll(selector)
          : [selector];
      elements.forEach((el) => {
        if (el) {
          el.disabled = true;
          el.style.opacity = "0.5";
          el.style.cursor = "not-allowed";
        }
      });
    };

    disableButtons("#cartBtn");
    disableButtons("#buyBtn");
    disableButtons(".size-btn, .qty-btn, .qty-input");

    const productNotes = document.getElementById("productNotes");
    if (productNotes) {
      productNotes.innerHTML = `
        <div class="alert">
          ⚠️ Produk ini sudah habis dan tidak dapat dipesan
        </div>
      `;
    }
  }

  // Setup gambar produk
  setupProductImages(product);

  // Update deskripsi
  document.getElementById("productDescription").textContent =
    product.description;

  // Quantity control
  const qtyInput = document.querySelector(".qty-input");
  document.querySelector(".minus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
  });
  document.querySelector(".plus").addEventListener("click", () => {
    qtyInput.value = parseInt(qtyInput.value) + 1 || 1;
  });
});

function setupProductImages(product) {
  const imageGrid = document.getElementById("imageGrid");
  const prevButton = document.getElementById("prevBtn");
  const nextButton = document.getElementById("nextBtn");

  // Bersihkan konten sebelumnya
  if (imageGrid) imageGrid.innerHTML = "";

  // Fallback jika tidak ada gambar
  if (!product.images || product.images.length === 0) {
    const fallbackImage = document.createElement("img");
    fallbackImage.src = "../img/default-product.png";
    fallbackImage.alt = "Gambar tidak tersedia";
    if (imageGrid) imageGrid.appendChild(fallbackImage);
    return;
  }

  // Tambahkan semua gambar ke DOM
  product.images.slice(0, 4).forEach((imgSrc, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = imgSrc;
    imgElement.alt = `Gambar ${index + 1}`;
    imgElement.onclick = () => {
      openImageZoom(imgSrc); // Fitur zoom ketika gambar diklik
    };
    if (imageGrid) imageGrid.appendChild(imgElement);
  });

  // Logika navigasi gambar untuk layar kecil
  if (window.matchMedia("(max-width: 890px)").matches) {
    const images = Array.from(imageGrid.children);
    let currentIndex = 0;

    function showImage(index) {
      images.forEach((img, i) => {
        img.style.display = i === index ? "block" : "none";
      });
    }

    // Tampilkan gambar pertama
    showImage(currentIndex);

    // Event listener untuk tombol sebelumnya
    if (prevButton)
      prevButton.addEventListener("click", () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1; // Kembali ke akhir jika di awal
        showImage(currentIndex);
      });

    // Event listener untuk tombol berikutnya
    if (nextButton)
      nextButton.addEventListener("click", () => {
        currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0; // Kembali ke awal jika di akhir
        showImage(currentIndex);
      });
  } else {
    // Pastikan semua gambar ditampilkan pada layar besar
    Array.from(imageGrid.children).forEach((img) => {
      img.style.display = "block";
    });
  }
}

// Fungsi untuk membuka modal zoom gambar
function openImageZoom(imageUrl) {
  const zoomModal = document.createElement("div");
  zoomModal.classList.add("zoom-modal");
  zoomModal.innerHTML = `
    <div class="modal-overlay" onclick="closeZoom()"></div>
    <div class="modal-content">
      <img src="${imageUrl}" alt="Zoom Image" />
      <button class="close-btn" onclick="closeZoom()">X</button>
    </div>
  `;
  document.body.appendChild(zoomModal);
}

// Fungsi untuk menutup modal zoom
function closeZoom() {
  const zoomModal = document.querySelector(".zoom-modal");
  if (zoomModal) {
    zoomModal.remove();
  }
}

// Fungsi format mata uang
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Fungsi tambah ke keranjang
function addToCart(button) {
  // Cek login
  if (!Auth.checkSession()) {
    Swal.fire({
      title: "Login Diperlukan",
      text: "Anda harus login untuk menambahkan produk ke keranjang. Lanjutkan ke halaman login?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Ya, Login",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
      }
    });
    return;
  }

  // Ambil ukuran yang dipilih
  const selectedSizeButton = document.querySelector(".size-btn.active");
  if (!selectedSizeButton) {
    Swal.fire({
      title: "Pilih Ukuran",
      text: "Silakan pilih ukuran sebelum menambahkan ke keranjang.",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  const selectedSize = selectedSizeButton.textContent;

  // Ambil data produk dari parameter URL
  const params = new URLSearchParams(window.location.search);
  const product = {
    id: `${decodeURIComponent(params.get("title"))}-${selectedSize}`,
    name: decodeURIComponent(params.get("title")),
    price: parseInt(params.get("price")),
    image: `../img/${
      params
        .get("images")
        .split(",")
        .map((img) => img.trim())[0]
    }`,
    size: selectedSize,
    quantity: parseInt(document.querySelector(".qty-input").value) || 1,
  };

  // Konfirmasi tambah ke keranjang
  Swal.fire({
    title: "Tambah ke Keranjang",
    text: `Yakin ingin menambahkan ${product.name} (${selectedSize}) ke keranjang?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += product.quantity;
      } else {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCounter();
      showCartNotification(product.name);
    }
  });
}

document.getElementById("buyBtn").addEventListener("click", () => {
  // Cek login
  if (!Auth.checkSession()) {
    Swal.fire({
      title: "Login Diperlukan",
      text: "Anda harus login untuk membeli produk. Lanjutkan ke halaman login?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Ya, Login",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
      }
    });
    return;
  }

  const selectedSizeButton = document.querySelector(".size-btn.active");
  if (!selectedSizeButton) {
    Swal.fire({
      title: "Pilih Ukuran",
      text: "Silakan pilih ukuran sebelum melanjutkan ke checkout.",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  const selectedSize = selectedSizeButton.textContent;
  const qty = parseInt(document.querySelector(".qty-input").value) || 1;

  const params = new URLSearchParams(window.location.search);

  const product = {
    id: `${decodeURIComponent(params.get("title"))}-${selectedSize}`,
    name: decodeURIComponent(params.get("title")),
    price: parseInt(params.get("price")),
    image: `../img/${
      params
        .get("images")
        .split(",")
        .map((img) => img.trim())[0]
    }`,
    size: selectedSize,
    quantity: qty,
  };

  // Simpan data ke sessionStorage (lebih aman dari bentrok cart)
  sessionStorage.setItem("checkoutProduct", JSON.stringify([product]));

  // Arahkan ke halaman checkout
  window.location.href = "../checkout/checkoutpage.html";
});

// Fungsi notifikasi keranjang
function showCartNotification(productName) {
  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.innerHTML = `
    <p>✓ ${productName} ditambahkan ke keranjang</p>
    <a href="../cart/cartpage.html">Lihat Keranjang</a>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// sinkronisasi ke detailproduk
// Menangani klik pada gambar produk
function handleProductClick(event) {
  const productCard = event.target.closest(".row");
  const isSoldout = productCard.dataset.status === "soldout";

  if (isSoldout) {
    event.preventDefault(); // Jika produk habis, tampilkan konfirmasi terlebih dahulu

    Swal.fire({
      title: "Produk Habis",
      text: "Produk sudah habis, apakah tetap ingin melihat detail produk?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        redirectToDetailPage(productCard);
      }
    });
  } else {
    redirectToDetailPage(productCard);
  }
}

// Fungsi untuk redirect ke halaman detail produk
function redirectToDetailPage(productCard) {
  // Ambil data dari dataset
  const params = new URLSearchParams({
    title: encodeURIComponent(productCard.dataset.title),
    price: productCard.dataset.price,
    oldprice: productCard.dataset.oldprice || "",
    images: productCard.dataset.images,
    sizes: encodeURIComponent(productCard.dataset.sizes),
    desc: encodeURIComponent(productCard.dataset.description),
    status: productCard.dataset.status,
  });

  // Redirect ke halaman detail produk
  window.location.href = `detailpage.html?${params}`;
}

// Event listener untuk semua gambar produk
document.querySelectorAll(".detail-img").forEach((image) => {
  image.addEventListener("click", handleProductClick);
});

// Login
// Mobile auth
// Hapus semua event listener untuk dropdown mobile
// Hanya pertahankan fungsionalitas desktop
document.querySelectorAll(".user-trigger").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    if (window.innerWidth > 630) {
      e.preventDefault(); // Biarkan hover natural untuk desktop
    }
    // Untuk mobile, biarkan default behavior (link langsung)
  });
});

// ---------------------------
// ** 5. SISTEM OTENTIKASI (LOGIN & LOGOUT) **
// ---------------------------

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
      } else {
        mobileUserIcon.innerHTML = '<i class="bx bxs-user"></i>';
        mobileUserIcon.classList.remove("logged-in");
        mobileUserIcon.href = "../loginpage/loginpage.html";
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

// ---------------------------
// ** 1. NAVIGASI & UI KOMPONEN **
// ---------------------------
const header = document.querySelector("header");
const menu = document.querySelector("#menu-icon");
const navmenu = document.querySelector(".navmenu");
const searchBtn = document.querySelector("#btn-search");
const searchForm = document.querySelector(".search-form");

// Toggle Menu
menu.onclick = (e) => {
  e.preventDefault();
  navmenu.classList.toggle("open");
};

// Toggle Pencarian
searchBtn.onclick = (e) => {
  e.preventDefault();
  searchForm.classList.toggle("open");
  document.querySelector("#search-box").focus();
};

// Penutupan Menu saat klik di luar
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !navmenu.contains(e.target)) {
    navmenu.classList.remove("open");
  }
});

// ===== TOGGLE DROPDOWN FILTER =====
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("filterToggleBtn");
  const sidebarFilter = document.querySelector(".sidebar-filter");
  const filterArrow = document.getElementById("filterArrow");

  toggleBtn.addEventListener("click", () => {
    sidebarFilter.classList.toggle("active");
    filterArrow.style.transform = sidebarFilter.classList.contains("active")
      ? "rotate(180deg)"
      : "rotate(0deg)";
  });
});

// ---------------------------
// 2. SISTEM FILTER & SORTING (VERSI FINAL)
// ---------------------------
let productData = [];
let isProcessing = false;

const initializeFilterSystem = () => {
  const container = document.querySelector(".products");
  const productCards = Array.from(container.children);

  // Inisialisasi data produk
  productData = productCards.map((card, index) => ({
    element: card,
    price: parseInt(card.dataset.price) || 0,
    status: card.dataset.status || "available",
    isSoldOut: !!card.querySelector(".sold-out"),
    hasDiscount: !!card.querySelector(".oldprice"), // <-- PROPERTI BARU
    initialOrder: index,
    isVisible: true,
  }));

  // Inisialisasi kontrol UI
  const controls = {
    minPrice: document.getElementById("minPrice"),
    maxPrice: document.getElementById("maxPrice"),
    slider: document.getElementById("hargaSlider"),
    availability: {
      tersedia: document.getElementById("tersedia"),
      habis: document.getElementById("habis"),
    },
    priceCategories: {
      low: document.getElementById("low"),
      mid: document.getElementById("mid"),
      high: document.getElementById("high"),
    },
    sortCheckboxes: document.querySelectorAll(".sort-checkbox"),
  };

  controls.availability.tersedia.checked = false;
  controls.availability.habis.checked = false;
  controls.sortCheckboxes.forEach((cb) => (cb.checked = false));

  // Setup event listeners
  const setupEvents = () => {
    // 1. Kontrol harga
    const handlePriceUpdate = debounce(() => {
      throttledFilterUpdate();
    }, 16);

    [controls.minPrice, controls.maxPrice].forEach((input) => {
      input.addEventListener("input", () => {
        if (
          parseInt(controls.minPrice.value) > parseInt(controls.maxPrice.value)
        ) {
          controls.maxPrice.value = controls.minPrice.value;
        }
        controls.slider.value = controls.maxPrice.value;
        resetPriceCategories();
        handlePriceUpdate();
      });
    });

    controls.slider.addEventListener("input", () => {
      controls.maxPrice.value = controls.slider.value;
      resetPriceCategories();
      handlePriceUpdate();
    });

    // 2. Kategori harga eksklusif
    Object.entries(controls.priceCategories).forEach(([key, checkbox]) => {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          Object.values(controls.priceCategories).forEach((cb) => {
            if (cb !== e.target) cb.checked = false;
          });
          setPriceRangeByCategory(key);
        } else {
          setPriceRange(0, 360000);
        }
        throttledFilterUpdate();
      });
    });

    // 3. Ketersediaan eksklusif
    Object.entries(controls.availability).forEach(([key, checkbox]) => {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          const otherKey = key === "tersedia" ? "habis" : "tersedia";
          controls.availability[otherKey].checked = false;
        }
        throttledFilterUpdate();
      });
    });

    // 4. Sorting eksklusif
    controls.sortCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          controls.sortCheckboxes.forEach((cb) => {
            if (cb !== e.target) cb.checked = false;
          });
        }
        throttledFilterUpdate();
      });
    });
  };

  // Fungsi filter utama
  const filterProducts = () => {
    const min = parseInt(controls.minPrice.value) || 0;
    const max = parseInt(controls.maxPrice.value) || 360000;
    const showAvailable = controls.availability.tersedia.checked;
    const showSoldOut = controls.availability.habis.checked;

    productData.forEach((item) => {
      const priceMatch = item.price >= min && item.price <= max;
      const isActuallyAvailable =
        item.status === "available" && !item.isSoldOut;
      const isActuallySoldOut = item.status === "soldout" && item.isSoldOut;

      // Logika yang diperbaiki
      let availabilityFilter;
      if (showAvailable) {
        availabilityFilter = isActuallyAvailable;
      } else if (showSoldOut) {
        availabilityFilter = isActuallySoldOut;
      } else {
        availabilityFilter = true; // Tampilkan semua jika tidak ada yang dipilih
      }

      item.isVisible = priceMatch && availabilityFilter;
      item.element.style.display = item.isVisible ? "block" : "none";
    });

    performSort();
  };

  // 2. Modifikasi fungsi performSort
  const performSort = () => {
    const sortType = document.querySelector(".sort-checkbox:checked")?.id;
    const visibleProducts = productData.filter((item) => item.isVisible);

    visibleProducts.sort((a, b) => {
      switch (sortType) {
        case "terlaris":
          // Prioritas 1: Produk dengan diskon
          // Prioritas 2: Harga termurah (baik diskon maupun tidak)
          if (a.hasDiscount !== b.hasDiscount) {
            return b.hasDiscount - a.hasDiscount; // Diskontil di atas
          }
          return a.price - b.price;
        case "harga-rendah":
          return a.price - b.price;
        case "harga-tinggi":
          return b.price - a.price;
        default:
          return a.initialOrder - b.initialOrder;
      }
    });

    updateProductGrid(visibleProducts);
  };

  // Fungsi update grid yang diperbaiki
  const updateProductGrid = (products) => {
    const fragment = document.createDocumentFragment();

    // 1. Urutkan produk sesuai hasil sorting
    products.forEach((item) => {
      fragment.appendChild(item.element);
    });

    // 2. Update DOM dengan animasi
    container.style.opacity = "0";
    requestAnimationFrame(() => {
      // 3. Smart DOM update
      const existingChildren = Array.from(container.children);

      // Hapus elemen yang tidak diperlukan
      existingChildren.forEach((child) => {
        if (!fragment.contains(child)) {
          child.remove();
        }
      });

      // Tambahkan/mindahkan elemen
      Array.from(fragment.children).forEach((child, index) => {
        if (!container.contains(child)) {
          container.appendChild(child);
        }
        child.style.order = index; // Untuk animasi CSS
      });

      container.style.opacity = "1";
    });
  };

  // Helper functions
  const setPriceRangeByCategory = (category) => {
    switch (category) {
      case "low":
        setPriceRange(0, 100000);
        break;
      case "mid":
        setPriceRange(100000, 200000);
        break;
      case "high":
        setPriceRange(200000, 1000000);
        break;
    }
  };

  const setPriceRange = (min, max) => {
    controls.minPrice.value = min;
    controls.maxPrice.value = max;
    controls.slider.value = max;
  };

  const resetPriceCategories = () => {
    Object.values(controls.priceCategories).forEach(
      (cb) => (cb.checked = false)
    );
  };

  const throttledFilterUpdate = () => {
    if (!isProcessing) {
      isProcessing = true;
      requestAnimationFrame(() => {
        filterProducts();
        isProcessing = false;
      });
    }
  };

  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  // Inisialisasi
  controls.minPrice.value = 0;
  controls.maxPrice.value = 1000000;
  controls.slider.value = 1000000;
  setupEvents();
  throttledFilterUpdate();
};

document.addEventListener("DOMContentLoaded", initializeFilterSystem);

// ---------------------------
// ** 3. PENANGANAN KERANJANG BELANJA **
// ---------------------------

// Fungsi untuk menambahkan produk ke keranjang
function addToCart(button) {
  const productCard = button.closest(".product-card");
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
    return; // Hentikan proses jika belum login
  }

  showSizeModal(productCard, (selectedSize) => {
    Swal.fire({
      title: "Tambah ke Keranjang",
      text: `Yakin ingin menambahkan ${productCard.dataset.title} (${selectedSize}) ke keranjang?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const product = {
          id: `${productCard.dataset.title}-${selectedSize}`,
          name: productCard.dataset.title,
          price: parseInt(productCard.dataset.price),
          image: productCard.querySelector("img").src,
          size: selectedSize,
          quantity: 1,
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find((item) => item.id === product.id);
        if (existingItem) {
          existingItem.quantity++;
        } else {
          cart.push(product);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCounter();
        showCartNotification(product.name);
      }
    });
  });
}

// Fungsi untuk menampilkan modal pilihan ukuran
function showSizeModal(productCard, callback) {
  const sizes = JSON.parse(productCard.dataset.sizes);

  const modal = document.createElement("div");
  modal.className = "size-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Pilih Ukuran</h3>
      <select class="modal-size-select">
        ${sizes
          .map((size) => `<option value="${size}">${size}</option>`)
          .join("")}
      </select>
      <div class="modal-actions">
        <button class="cancel-btn">Batal</button>
        <button class="confirm-btn">Konfirmasi</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  modal.querySelector(".cancel-btn").addEventListener("click", () => {
    modal.remove();
    document.body.style.overflow = "";
  });

  modal.querySelector(".confirm-btn").addEventListener("click", () => {
    const selectedSize = modal.querySelector(".modal-size-select").value;
    modal.remove();
    document.body.style.overflow = "";
    callback(selectedSize);
  });
}

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

// ---------------------------
// ** 4. PENANGANAN DETAIL PRODUK (SOLDOUT CHECK) **
// ---------------------------

function handleProductClick(event) {
  const productCard = event.target.closest(".product-card");
  const isSoldout = productCard.dataset.status === "soldout";

  if (isSoldout) {
    event.preventDefault();

    Swal.fire({
      title: "Produk Habis",
      text: "Produk sudah habis, apakah tetap ingin melihat detail produk?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (!result.isConfirmed) {
        event.stopImmediatePropagation();
        return false;
      }
      redirectToDetailPage(productCard);
    });
  } else {
    redirectToDetailPage(productCard);
  }
}

function redirectToDetailPage(productCard) {
  const params = new URLSearchParams({
    title: encodeURIComponent(productCard.dataset.title),
    price: productCard.dataset.price,
    oldprice: productCard.dataset.oldprice || "",
    images: productCard.dataset.images, // Kirim daftar gambar
    sizes: encodeURIComponent(productCard.dataset.sizes),
    desc: encodeURIComponent(productCard.dataset.description),
    status: productCard.dataset.status,
  });
  window.location.href = `../detailproduk/detailpage.html?${params}`;
}

document.querySelectorAll(".product-image").forEach((image) => {
  image.addEventListener("click", handleProductClick);
});

// ---------------------------
// ** 5. SISTEM OTENTIKASI (LOGIN & LOGOUT) **
// ---------------------------

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

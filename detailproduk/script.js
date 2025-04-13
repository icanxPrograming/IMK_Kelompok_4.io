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

// Konten detail produk
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requiredParams = ["title", "price", "image"];

  // Validasi parameter wajib
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
    image: `../img/${params.get("image")}`,
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

  // Update gambar
  const mainImage = document.getElementById("mainProductImage");
  mainImage.src = product.image;
  mainImage.onerror = () => {
    mainImage.src = "../img/default-product.png";
    mainImage.alt = "Gambar tidak tersedia";
  };

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
    image: `../img/${params.get("image")}`,
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
    image: `../img/${params.get("image")}`,
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

// Update counter keranjang
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-counter").forEach((counter) => {
    counter.textContent = totalItems;
  });
}
document.addEventListener("DOMContentLoaded", updateCartCounter);

// sinkronisasi ke detailproduk
// Fungsi penanganan klik gambar produk
function handleProductClick(event) {
  const productCard = event.target.closest(".row");
  const isSoldout = productCard.dataset.status === "soldout";

  // Jika produk soldout, tampilkan konfirmasi
  if (isSoldout) {
    event.preventDefault();
    const userConfirmation = confirm(
      "Produk sudah habis, apakah tetap ingin melihat detail produk?"
    );

    if (!userConfirmation) {
      event.stopImmediatePropagation();
      return false;
    }
  }

  // Lanjutkan proses untuk semua produk (termasuk soldout jika dikonfirmasi)
  const params = new URLSearchParams({
    title: encodeURIComponent(productCard.dataset.title),
    price: productCard.dataset.price,
    oldprice: productCard.dataset.oldprice || "",
    image: productCard.dataset.image,
    sizes: encodeURIComponent(productCard.dataset.sizes),
    desc: encodeURIComponent(productCard.dataset.description),
    status: productCard.dataset.status,
  });

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

const Auth = {
  checkSession: () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && Date.now() > user.expires) {
      localStorage.removeItem("currentUser");
      return false;
    }
    return !!user;
  },

  updateUI: () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const cartButton = document.querySelector("#btn-cart");
    const cartCounter = document.querySelector(".cart-counter");

    // Desktop
    const desktopTrigger = document.querySelector(".user-trigger");
    const desktopDropdown = document.querySelector(".login-dropdown");
    if (desktopTrigger && desktopDropdown) {
      if (user) {
        desktopTrigger.innerHTML = user.nickName;
        desktopDropdown.innerHTML = `
          <span class="logged-as">Hai, ${user.nickName}</span>
          <a href="#" class="logout-btn">Logout</a>
        `;
        cartCounter.style.display = "block";
        cartButton.disabled = false;
      } else {
        desktopTrigger.innerHTML = '<i class="bx bxs-user"></i>';
        desktopDropdown.innerHTML = `
          <a href="../loginpage/loginpage.html?return=${encodeURIComponent(
            window.location.href
          )}" class="login-btn">Masuk</a>
          <a href="#" class="register-btn">Daftar</a>
        `;
        cartCounter.style.display = "none";
        cartButton.disabled = true;
      }
    }

    // Mobile
    const mobileUser = document.querySelector(".mobile-user-icon");
    if (mobileUser) {
      if (user) {
        mobileUser.innerHTML = user.nickName;
        mobileUser.classList.add("logged-in");
        mobileUser.href = "javascript:void(0)";

        mobileUser.addEventListener("click", (e) => {
          e.preventDefault();
          showLogoutConfirmation();
        });
      } else {
        mobileUser.innerHTML = '<i class="bx bxs-user"></i>';
        mobileUser.classList.remove("logged-in");
        mobileUser.href = `../loginpage/loginpage.html?return=${encodeURIComponent(
          window.location.href
        )}`;
      }
    }
  },

  logout: () => {
    localStorage.removeItem("currentUser");
    Auth.updateUI();
    Swal.fire({
      icon: "success",
      title: "Logout Berhasil",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      window.location.reload();
    });
  },
};

// Proteksi halaman keranjang
const protectCartPage = () => {
  if (window.location.pathname.includes("/cart/") && !Auth.checkSession()) {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
  }
};

// Handle klik ikon keranjang
const handleCartClick = (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();

  if (Auth.checkSession()) {
    window.location.href = e.currentTarget.getAttribute("href");
  } else {
    Swal.fire({
      title: "Login Diperlukan",
      text: "Silakan login untuk mengakses keranjang belanja",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
      }
    });
  }
};

// Event Listeners Utama
document.addEventListener("DOMContentLoaded", () => {
  Auth.updateUI();

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

  protectCartPage();

  document.querySelectorAll("#btn-cart, .mobile-cart").forEach((cart) => {
    cart.addEventListener("click", handleCartClick);
  });
});

setInterval(() => {
  protectCartPage();
}, 60000);

// Helper untuk konfirmasi logout
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

// ======= Inisialisasi Elemen Navigasi =======
const header = document.querySelector("header");
let menu = document.querySelector("#menu-icon");
let navmenu = document.querySelector(".navmenu");

menu.onclick = () => {
  navmenu.classList.toggle("open");
};

const hamMenu = document.querySelector("#menu-icon");
const searchBtn = document.querySelector("#btn-search");

// ======= Event Listener untuk Klik di Luar Menu & Form Pencarian =======
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

// ======= Manajemen Keranjang (Cart) - LocalStorage =======
const CART_KEY = "cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function updateCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCounter();
}

function updateCartCounter() {
  const cart = getCart();
  const counters = document.querySelectorAll(".cart-counter");
  counters.forEach((counter) => {
    counter.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  });
}

function updateSummary() {
  const cart = getCart();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  document.querySelector(
    ".subtotal-price"
  ).textContent = `Rp ${subtotal.toLocaleString()}`;
  document.querySelector(
    ".summary .total-price"
  ).textContent = `Rp ${subtotal.toLocaleString()}`;
  document.querySelector(".checkout-btn").disabled = cart.length === 0;
}

// ======= Menyimpan Catatan Checkout =======
document
  .querySelector(".note-section textarea")
  .addEventListener("change", (e) => {
    localStorage.setItem("cart_note", e.target.value);
  });

document.addEventListener("DOMContentLoaded", () => {
  const savedNote = localStorage.getItem("cart_note");
  if (savedNote) {
    document.querySelector(".note-section textarea").value = savedNote;
  }
});

// ======= Delegasi Event untuk Tombol Kuantitas & Hapus =======
document
  .querySelector(".cart-items-container")
  .addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    const cart = getCart();

    if (e.target.classList.contains("qty-minus")) {
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      }
    }

    if (e.target.classList.contains("qty-plus")) {
      cart[index].quantity++;
    }

    if (e.target.classList.contains("delete-btn")) {
      cart.splice(index, 1);
    }

    updateCart(cart);
    renderCart();
  });

// ======= Render Isi Keranjang Belanja =======
function renderCart() {
  const cart = getCart();
  const container = document.querySelector(".cart-items-container");
  const emptyState = document.querySelector(".empty-cart");

  if (cart.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "block";
    document.querySelector(".summary").style.display = "none";
    return;
  }

  let html = "";
  cart.forEach((item, index) => {
    html += `
      <div class="cart-item-detail" data-price="${item.price}">
        <div class="product-info">
          <img src="${item.image}" alt="${item.name}" class="product-image">
          <div class="product-text">
            <h3>${item.name}</h3>
            ${item.size ? `<p>Ukuran: ${item.size}</p>` : ""}
            <p class="price">Rp ${item.price.toLocaleString()}</p>
          </div>
        </div>

        <div class="quantity-control">
          <span>Kuantitas</span>
          <div class="qty-buttons">
            <button class="qty-minus" data-index="${index}">-</button>
            <span class="qty">${item.quantity}</span>
            <button class="qty-plus" data-index="${index}">+</button>
          </div>
          <button class="delete-btn" data-index="${index}">Menghapus</button>
        </div>

        <div class="item-total">
          <p class="total-price">Rp ${(
            item.price * item.quantity
          ).toLocaleString()}</p>
        </div>
      </div>
      <hr class="divider">
    `;
  });

  container.innerHTML = html;
  emptyState.style.display = "none";
  document.querySelector(".summary").style.display = "block";
  updateSummary();
}

renderCart();
updateCartCounter();

// Ganti kode sebelumnya dengan ini:
document.getElementById("buyBtn").addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Keranjang Kosong",
      text: "Silakan tambahkan produk ke keranjang terlebih dahulu",
    });
    return;
  }

  // Simpan seluruh data keranjang ke sessionStorage
  sessionStorage.setItem("checkoutProduct", JSON.stringify(cart));

  // Arahkan ke halaman checkout
  window.location.href = "../checkout/checkoutpage.html";
});

// ======= Sistem Autentikasi Pengguna (Login / Logout) =======
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

    const mobileUser = document.querySelector(".mobile-user-icon");
    if (mobileUser) {
      if (user) {
        mobileUser.innerHTML = user.nickName;
        mobileUser.classList.add("logged-in");
        mobileUser.href = "javascript:void(0)";

        mobileUser.addEventListener("click", (e) => {
          e.preventDefault();
          Swal.fire({
            title: "Konfirmasi Logout",
            text: "Apakah Anda yakin ingin keluar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Logout",
            cancelButtonText: "Batal",
          }).then((result) => {
            if (result.isConfirmed) {
              Auth.logout();
            }
          });
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
      text: "Anda telah berhasil logout.",
    }).then(() => {
      window.location.reload();
    });
  },
};

const protectCartPage = () => {
  if (window.location.pathname.includes("/cart/")) {
    if (!Auth.checkSession()) {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
    }
  }
};

const handleCartClick = (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();

  if (Auth.checkSession()) {
    window.location.href = e.currentTarget.getAttribute("href");
  } else {
    const returnUrl = encodeURIComponent(window.location.href);
    Swal.fire({
      title: "Akses Terbatas",
      text: "Silakan login terlebih dahulu untuk mengakses keranjang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Login Sekarang",
      cancelButtonText: "Nanti Saja",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `../loginpage/loginpage.html?return=${returnUrl}`;
      }
    });
  }
};

// ======= Event Listener & Proteksi Halaman =======
document.addEventListener("DOMContentLoaded", () => {
  Auth.updateUI();

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("logout-btn")) {
      e.preventDefault();
      Auth.logout();
    }

    if (e.target.classList.contains("mobile-user-icon.logged-in")) {
      e.preventDefault();
      Swal.fire({
        title: "Konfirmasi Logout",
        text: "Apakah Anda yakin ingin keluar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Logout",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          Auth.logout();
        }
      });
    }
  });

  protectCartPage();

  document.querySelectorAll("#btn-cart, .mobile-cart").forEach((cart) => {
    cart.addEventListener("click", handleCartClick);
  });
});

// ======= Cek Session Secara Berkala =======
setInterval(() => {
  protectCartPage();
}, 60000);

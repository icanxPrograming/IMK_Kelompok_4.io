// import "boxicons/css/boxicons.min.css";

// Mengatur toggle menu pada ikon hamburger
const header = document.querySelector("header");

let menu = document.querySelector("#menu-icon");
let navmenu = document.querySelector(".navmenu");

menu.onclick = () => {
  navmenu.classList.toggle("open"); // PENJELASAN: Membuka atau menutup menu navigasi saat ikon menu diklik
};

// Daftar banner dengan teks, deskripsi, dan link
const banners = [
  {
    title: "Ramadan <br />Collection",
    description:
      "Sambut Ramadan dengan baju muslim <br />baru untuk menunjang ibadah kamu <br />dibulan suci penuh ampunan",
    button: "Shop Now",
    backgroundImage: "img/middle.webp",
    showText: true,
    link: "produkpage/pagesale.html",
  },
  {
    title: "",
    description: "",
    button: "",
    backgroundImage: "img/blockcore.webp",
    showText: false,
    link: "produkpage/pagelimitededition.html",
  },
];

let currentIndex = 0;
let displayedIndex = 0; // Tambahkan variabel untuk melacak banner yang sedang ditampilkan

function updateBanner() {
  const banner = banners[currentIndex];
  const mainHome2 = document.querySelector(".main-home2");
  const bannerTitle = document.getElementById("bannerTitle");
  const bannerDescription = document.getElementById("bannerDescription");
  const bannerButton = document.getElementById("bannerButton");

  // Fade out content
  document.querySelector(".main-text2").style.opacity = 0;

  // Update background and content after fade out
  setTimeout(() => {
    // Update background image
    mainHome2.style.backgroundImage = `url(${banner.backgroundImage})`;

    // Update teks dan tombol berdasarkan showText
    if (banner.showText) {
      bannerTitle.innerHTML = banner.title;
      bannerDescription.innerHTML = banner.description;
      bannerButton.textContent = banner.button;

      bannerTitle.style.display = "block";
      bannerDescription.style.display = "block";
      bannerButton.style.display = "inline-block";
    } else {
      bannerTitle.style.display = "none";
      bannerDescription.style.display = "none";
      bannerButton.style.display = "none";
    }

    // Fade in content
    document.querySelector(".main-text2").style.opacity = 1;

    // Update displayedIndex sebelum currentIndex diubah
    displayedIndex = currentIndex;

    // Pindah ke banner berikutnya
    currentIndex = (currentIndex + 1) % banners.length;
  }, 500);
}

setInterval(updateBanner, 5000);
updateBanner();

// Menambahkan event listener untuk membuat banner clickable
document.querySelector(".main-home2").addEventListener("click", () => {
  const clickedBanner = banners[displayedIndex]; // Gunakan displayedIndex bukan currentIndex
  if (clickedBanner.link) {
    window.location.href = clickedBanner.link;
  }
});

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

// Navigasi berdasarkan kategori produk
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("home").addEventListener("click", function () {
    window.location.href = "produkpage/pagerayaseries.html";
  });
});

// Navigasi ke halaman keranjang
document.querySelectorAll(".cart-icon").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "cart/cartpage.html"; // PENJELASAN: Arahkan ke halaman keranjang
  });
});

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
  window.location.href = `detailproduk/detailpage.html?${params}`;
}

// Tambahkan event listener untuk setiap gambar produk
document.querySelectorAll(".detail-img").forEach((image) => {
  image.addEventListener("click", handleProductClick);
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
    if (user && Date.now() > user.expires) {
      localStorage.removeItem("currentUser"); // PENJELASAN: Hapus data user jika sesi sudah kedaluwarsa
      return false;
    }
    return !!user; // PENJELASAN: Mengembalikan true jika user valid
  },

  updateUI: () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const cartButton = document.querySelector("#btn-cart");
    const cartCounter = document.querySelector(".cart-counter");
    const desktopTrigger = document.querySelector(".user-trigger");
    const desktopDropdown = document.querySelector(".login-dropdown");

    if (desktopTrigger && desktopDropdown) {
      if (user) {
        // PENJELASAN: Jika user login, tampilkan nama dan opsi logout
        desktopTrigger.innerHTML = user.nickName;
        desktopDropdown.innerHTML = `
          <span class="logged-as">Hai, ${user.nickName}</span>
          <a href="#" class="logout-btn">Logout</a>
        `;
        cartCounter.style.display = "block";
        cartButton.disabled = false;
      } else {
        // PENJELASAN: Jika belum login, tampilkan opsi masuk/daftar
        desktopTrigger.innerHTML = '<i class="bx bxs-user"></i>';
        desktopDropdown.innerHTML = `
          <a href="loginpage/loginpage.html" class="login-btn">Masuk</a>
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
          showLogoutConfirmation(); // PENJELASAN: Tampilkan konfirmasi logout di mobile
        });
      } else {
        mobileUser.innerHTML = '<i class="bx bxs-user"></i>';
        mobileUser.classList.remove("logged-in");
        mobileUser.href = "loginpage/loginpage.html";
      }
    }
  },

  logout: () => {
    localStorage.removeItem("currentUser");
    Auth.updateUI();
    Swal.fire({
      icon: "success",
      title: "Logout berhasil",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      window.location.reload(); // PENJELASAN: Refresh halaman setelah logout
    });
  },
};

// Melindungi akses ke halaman keranjang
const protectCartPage = () => {
  if (window.location.pathname.includes("/cart/")) {
    if (!Auth.checkSession()) {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `loginpage/loginpage.html?return=${returnUrl}`; // PENJELASAN: Redirect jika belum login
    }
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
      text: "Silakan login untuk mengakses keranjang belanja",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `loginpage/loginpage.html?return=${returnUrl}`;
      }
    });
  }
};

// Inisialisasi ketika DOM selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  Auth.updateUI(); // PENJELASAN: Perbarui tampilan berdasarkan status login

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

document.addEventListener("DOMContentLoaded", updateCartCounter);

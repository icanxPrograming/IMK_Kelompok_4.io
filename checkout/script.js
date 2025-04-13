document.addEventListener("DOMContentLoaded", () => {
  // Deklarasi Elemen
  const elements = {
    inputs: {
      firstName: document.querySelector('input[placeholder="Nama depan"]'),
      lastName: document.querySelector('input[placeholder="Nama belakang"]'),
      address: document.querySelector('input[placeholder="Alamat"]'),
      city: document.querySelector('input[placeholder="Kota"]'),
      province: document.querySelectorAll("select")[1],
      phone: document.querySelector('input[placeholder="Telepon"]'),
    },
    payment: {
      main: document.querySelectorAll('input[name="payment"]'),
      detailsSection: document.querySelector(".payment-details"),
      methods: {
        bank: ["Mandiri", "BRI", "BCA", "BNI"],
        qris: ["Dana", "Gopay", "OVO", "ShopeePay"],
      },
    },
    summary: {
      container: document.querySelector(".checkout-right"),
      shippingText: null,
      shippingCost: null,
      total: null,
      shippingRow: null,
    },
  };

  let productSubtotal = 0;

  // Fungsi Inisialisasi
  const initialize = () => {
    loadCartData(); // Ganti loadProduct() dengan loadCartData()
    setupEventListeners();
    initializeUIState();
  };

  // ======= FUNGSI BARU =======
  const loadCartData = () => {
    const cartData = sessionStorage.getItem("checkoutProduct");

    if (!cartData) {
      Swal.fire("Data Kosong").then(() => {
        window.location.href = "../produkpage/pagekaos.html";
      });
      return;
    }

    const cart = JSON.parse(cartData);

    // Hitung total dari semua produk
    productSubtotal = cart.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );

    buildProductSummary(cart);
  };

  // ======= MODIFIKASI FUNGSI buildProductSummary =======
  const buildProductSummary = (cart) => {
    elements.summary.container.innerHTML = `
      <div class="product-summary">
        ${cart
          .map(
            (product) => `
          <div class="cart-item">
            <img src="${product.image}" alt="${
              product.name
            }" class="checkout-product-image">
            <div class="product-details">
              <h3>${product.name}</h3>
              ${product.size ? `<p>Ukuran: ${product.size}</p>` : ""}
              <p>Jumlah: ${product.quantity}</p>
              <p>${formatCurrency(product.price * product.quantity)}</p>
            </div>
          </div>
          <hr class="item-divider">
        `
          )
          .join("")}
      </div>
      <div class="price-breakdown">
        <div class="price-row">
          <span>Subtotal</span>
          <span>${formatCurrency(productSubtotal)}</span>
        </div>
        <div class="shipping-cost-row">
          <span>Ongkir</span>
          <span class="shipping-price">-</span>
        </div>
        <div class="price-row total">
          <span>Total</span>
          <span>${formatCurrency(productSubtotal)}</span>
        </div>
      </div>
    `;

    // Inisialisasi elemen summary
    elements.summary.shippingText = document.querySelector(
      ".shipping-cost-row span:first-child"
    );
    elements.summary.shippingCost = document.querySelector(".shipping-price");
    elements.summary.total = document.querySelector(".total span:last-child");
    elements.summary.shippingRow = document.querySelector(".shipping-cost-row");
  };

  const setupEventListeners = () => {
    Object.values(elements.inputs).forEach((input) => {
      input.addEventListener("input", handleInputChange);
    });

    elements.payment.main.forEach((radio) => {
      radio.addEventListener("change", handlePaymentChange);
    });

    document
      .querySelector(".checkout-btn")
      .addEventListener("click", handleCheckout);
  };

  const initializeUIState = () => {
    elements.payment.detailsSection.style.display = "none";
    elements.summary.shippingRow.classList.remove("visible");
    updateUI(); // Panggil updateUI saat inisialisasi
  };

  // Event Handlers
  const handleInputChange = () => {
    updateUI();
    if (isFormComplete()) calculateShipping();
  };

  const handlePaymentChange = (e) => {
    if (!isFormComplete()) {
      e.target.checked = false;
      return Swal.fire("Lengkapi alamat terlebih dahulu!");
    }
    showPaymentDetails(e.target.id);
  };

  const handleCheckout = () => {
    if (!validateForm()) return;
    showSuccessAlert();
  };

  // Fungsi Baru: Update Tampilan
  const updateUI = () => {
    const isComplete = isFormComplete();

    // Update section pembayaran
    elements.payment.detailsSection.style.display = isComplete
      ? "block"
      : "none";

    // Update teks pengiriman
    elements.summary.shippingText.textContent = isComplete
      ? "Pengiriman: Regular - (3-5 hari)"
      : "Masukkan alamat pengiriman";

    // Sembunyikan ongkir jika form tidak lengkap
    if (!isComplete) {
      elements.summary.shippingRow.classList.remove("visible");
      elements.summary.shippingCost.textContent = "-";
    }
  };

  // Fungsi Utilitas
  const formatCurrency = (number) => `Rp${number.toLocaleString("id-ID")}`;

  const isFormComplete = () =>
    Object.values(elements.inputs).every(
      (input) =>
        input.value.trim() !== "" && (input.tagName !== "SELECT" || input.value)
    );

  const calculateShipping = () => {
    const province = elements.inputs.province.value.toLowerCase();
    let cost = 0;
    let duration = "3-5 hari";

    if (province.includes("barat")) {
      cost = 10000;
      duration = "2-3 hari";
    } else if (province.includes("tengah") || province.includes("timur")) {
      cost = 15000;
      duration = "3-4 hari";
    } else {
      cost = 20000;
      duration = "4-5 hari";
    }

    // Update tampilan ongkir
    elements.summary.shippingText.textContent = `Pengiriman: Regular - ${duration}`;
    elements.summary.shippingCost.textContent = formatCurrency(cost);
    // Update total dengan semua produk
    elements.summary.total.textContent = formatCurrency(productSubtotal + cost);
    elements.summary.shippingRow.classList.add("visible");
  };

  const showPaymentDetails = (type) => {
    const methods =
      type === "bankTransfer"
        ? elements.payment.methods.bank
        : elements.payment.methods.qris;

    elements.payment.detailsSection.innerHTML = `
      <h2>Pilih ${type === "bankTransfer" ? "Bank" : "E-Wallet"}</h2>
      <div class="payment-methods">
          ${methods
            .map(
              (method) => `
              <div class="payment-option">
                  <input type="radio" name="paymentDetail" id="${method.toLowerCase()}">
                  <label for="${method.toLowerCase()}">
                      <span class="payment-title">${method}</span>
                      <span class="payment-desc">Transfer sampai 3 bank berbeda</span>
                  </label>
              </div>
          `
            )
            .join("")}
      </div>
    `;
  };

  const validateForm = () => {
    if (!isFormComplete()) {
      Swal.fire("Lengkapi semua field alamat!");
      return false;
    }
    if (!document.querySelector('input[name="payment"]:checked')) {
      Swal.fire("Pilih metode pembayaran utama!");
      return false;
    }
    if (!document.querySelector('input[name="paymentDetail"]:checked')) {
      Swal.fire("Pilih detail pembayaran!");
      return false;
    }
    return true;
  };

  const showSuccessAlert = () => {
    // Ambil semua data dari form
    const formData = {
      firstName: document.querySelector('input[placeholder="Nama depan"]')
        .value,
      lastName: document.querySelector('input[placeholder="Nama belakang"]')
        .value,
      address: document.querySelector('input[placeholder="Alamat"]').value,
      city: document.querySelector('input[placeholder="Kota"]').value,
      province: document.querySelectorAll("select")[1].value,
      postalCode: document.querySelector('input[placeholder="Kode Pos"]').value,
      phone: document.querySelector('input[placeholder="Telepon"]').value,
    };

    const paymentMethod = document
      .querySelector('input[name="payment"]:checked')
      .nextElementSibling.querySelector(".payment-title").textContent;

    const detailMethod = document
      .querySelector('input[name="paymentDetail"]:checked')
      .parentElement.querySelector(".payment-title").textContent;

    Swal.fire({
      icon: "question",
      title: "Konfirmasi Pesanan",
      html: `Periksa kembali data berikut:<br><br>
              <b>Atas Nama:</b> ${formData.firstName} ${formData.lastName}<br>
              <b>Alamat:</b> ${formData.address}, ${formData.city}, ${formData.province} ${formData.postalCode}<br>
              <b>Telp:</b> ${formData.phone}<br>
              <b>Metode Pembayaran:</b> ${paymentMethod}<br>
              <b>Detail:</b> ${detailMethod}<br>
              <b>Total:</b> ${elements.summary.total.textContent}`,
      showCancelButton: true,
      confirmButtonText: "Ya, Lanjutkan Pembayaran",
      cancelButtonText: "Periksa Kembali",
    }).then((result) => {
      if (result.isConfirmed) {
        const paymentData = {
          buyer: formData,
          payment: {
            method: paymentMethod,
            detail: detailMethod,
          },
          total: elements.summary.total.textContent,
          items: JSON.parse(sessionStorage.getItem("checkoutProduct")),
        };
        sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
        window.location.href = "../payment/paymentpage.html";
      }
    });
  };

  const redirectToProducts = () => {
    Swal.fire(
      "Keranjang Kosong",
      "Silahkan pilih produk terlebih dahulu",
      "info"
    ).then(() => (window.location.href = "../produkpage/pagekaos.html"));
  };

  // Jalankan Inisialisasi
  initialize();
});

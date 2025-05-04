document.addEventListener("DOMContentLoaded", () => {
  const paymentData = JSON.parse(sessionStorage.getItem("paymentData"));
  const countdownElement = document.getElementById("countdown");
  const orderItemsElement = document.getElementById("order-items");

  // Deklarasi elemen yang diperbaiki
  const buyerElements = {
    name: document.getElementById("buyer-name"),
    address: document.getElementById("buyer-address"),
    city: document.getElementById("buyer-city"),
    province: document.getElementById("buyer-province"),
    postalcode: document.getElementById("buyer-postalcode"),
    phone: document.getElementById("buyer-phone"),
    subtotal: document.getElementById("subtotal-amount"),
    shipping: document.getElementById("shipping-fee"),
    total: document.getElementById("total-amount"),
    note: document.getElementById("buyer-note"),
  };

  const paymentInstructionElement = document.getElementById(
    "payment-instruction"
  );
  const qrSection = document.getElementById("qr-section");

  // Validasi data
  // Di dalam validasi data awal
  if (!paymentData || !paymentData.items || !paymentData.buyer) {
    window.location.href = "../checkout/checkoutpage.html";
    return;
  }

  // Fungsi untuk menampilkan data pembeli
  const displayBuyerInfo = () => {
    const provinceNames = {
      barat: "Jawa Barat",
      tengah: "Jawa Tengah",
      timur: "Jawa Timur",
    };

    buyerElements.name.textContent = `${paymentData.buyer.firstName} ${paymentData.buyer.lastName}`;
    buyerElements.address.textContent = paymentData.buyer.address;
    buyerElements.city.textContent = paymentData.buyer.city;
    buyerElements.province.textContent =
      provinceNames[paymentData.buyer.province] || paymentData.buyer.province;
    buyerElements.postalcode.textContent = paymentData.buyer.postalCode;
    buyerElements.phone.textContent = paymentData.buyer.phone;
    buyerElements.note.textContent = paymentData.note || "Tidak ada catatan.";
  };

  // Fungsi untuk menampilkan item pesanan
  const displayOrderItems = () => {
    orderItemsElement.innerHTML = paymentData.items
      .map(
        (item) => `
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <p>${item.name} (${item.quantity}x)</p>
            <p>Rp ${item.price.toLocaleString()} x ${item.quantity} = Rp ${(
          item.price * item.quantity
        ).toLocaleString()}</p>
          </div>
        </div>
      `
      )
      .join("");
  };

  // Fungsi untuk menghitung total
  const calculateTotals = () => {
    const subtotal = paymentData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Pastikan format data total konsisten
    const totalNumeric =
      typeof paymentData.total === "string"
        ? parseInt(paymentData.total.replace(/[^\d]/g, ""))
        : paymentData.total;

    const shippingFee = totalNumeric - subtotal;

    // Format semua nilai ke Rupiah
    const formatRupiah = (num) => `Rp ${num.toLocaleString("id-ID")}`;

    buyerElements.subtotal.textContent = formatRupiah(subtotal);
    buyerElements.shipping.textContent = formatRupiah(shippingFee);
    buyerElements.total.textContent = formatRupiah(totalNumeric);
  };

  // Tampilkan instruksi pembayaran
  const displayPaymentInstructions = () => {
    const paymentInstructions = {
      "Bank Transfer": `
        <div class="bank-instruction">
          <p>Transfer ke rekening berikut:</p>
          <p><strong>Bank Mandiri</strong></p>
          <p>No. Rekening: 123-456-7890</p>
          <p>Atas Nama: PT. NEPTUNES Store</p>
          <br>
          <p>Jika bank error transfer ke nomor di bawah ini!</p>
          <p><strong>0818-0831-3324 -> DANA, GOPAY, SHOPEEPAY</strong></p>
        </div>
      `,
      QRIS: `
        <div class="qris-instruction">
          <p>Scan QR Code di bawah ini menggunakan aplikasi mobile banking atau e-wallet Anda</p>
        </div>
      `,
    };

    paymentInstructionElement.innerHTML =
      paymentInstructions[paymentData.payment.method];
    qrSection.style.display =
      paymentData.payment.method === "QRIS" ? "block" : "none";
  };

  // Timer countdown
  const startCountdown = () => {
    let timeLeft = 600; // 10 menit dalam detik
    const countdownInterval = setInterval(() => {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownElement.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        Swal.fire({
          icon: "error",
          title: "Waktu Habis",
          text: "Waktu pembayaran telah habis, silakan ulangi proses checkout",
        }).then(() => {
          window.location.href = "../checkout/checkoutpage.html";
        });
      }
    }, 1000);
  };

  // WhatsApp konfirmasi (Versi tanpa backend)
  const setupWhatsAppButton = () => {
    document.getElementById("confirmBtn").addEventListener("click", () => {
      Swal.fire({
        icon: "info",
        title: "Konfirmasi Pembayaran",
        text: "Saat konfirmasi, dimohon untuk menyertakan bukti pembayaran langsung di WhatsApp.",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("cart"); // Benar
          localStorage.removeItem("cart_note"); // Jika kamu juga ingin bersihkan catatan checkout

          const now = new Date().toLocaleString("id-ID");
          const whatsappMessage = `Halo NEPTUNES Store, berikut detail pembayaran saya:
  %0A%0A👤 *Data Pembeli*
  %0ANama: ${paymentData.buyer.firstName} ${paymentData.buyer.lastName}
  %0AAlamat: ${paymentData.buyer.address}, ${paymentData.buyer.city}
  %0AProvinsi: ${paymentData.buyer.province}
  %0AKode Pos: ${paymentData.buyer.postalCode}
  %0ATelp: ${paymentData.buyer.phone}
  
  %0A🛒 *Detail Pesanan*%0A${paymentData.items
    .map(
      (item) =>
        `- ${item.name} (${item.quantity}x) : Rp ${(
          item.price * item.quantity
        ).toLocaleString("id-ID")}`
    )
    .join("%0A")}
  
  %0A💳 *Pembayaran*
  %0AMetode: ${paymentData.payment.method} - ${paymentData.payment.detail}
  %0ATotal: ${paymentData.total}
  
  %0A🕒 Pesanan dibuat pada: ${now}
  %0A📎 *Bukti Pembayaran* (harap dilampirkan di WA)`;

          window.open(
            `https://wa.me/6282121884390?text=${whatsappMessage}`,
            "_blank"
          );
        }
      });
    });
  };

  // Inisialisasi
  displayBuyerInfo();
  displayOrderItems();
  calculateTotals();
  displayPaymentInstructions();
  startCountdown();
  setupWhatsAppButton();
});

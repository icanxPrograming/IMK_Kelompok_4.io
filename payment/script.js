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

  function calculateShippingCost(province) {
    const lowerProvince = province.toLowerCase();
    if (lowerProvince.includes("barat")) return 10000;
    if (lowerProvince.includes("tengah") || lowerProvince.includes("timur"))
      return 15000;
    return 20000;
  }

  function calculateShippingDuration(province) {
    const lowerProvince = province.toLowerCase();
    if (lowerProvince.includes("barat")) return "2-3 hari";
    if (lowerProvince.includes("tengah") || lowerProvince.includes("timur"))
      return "3-4 hari";
    return "4-5 hari";
  }

  function calculateEstimatedDelivery(province, orderTime) {
    const baseDate = new Date(orderTime);
    let daysToAdd = 0;

    if (province.toLowerCase().includes("barat")) daysToAdd = 2;
    else if (
      province.toLowerCase().includes("tengah") ||
      province.toLowerCase().includes("timur")
    )
      daysToAdd = 3;
    else daysToAdd = 4;

    // Tambahkan 1 hari ekstra untuk safety margin
    daysToAdd += 1;

    // Jika pesanan dibuat sebelum 16:00, tambahkan 0.5 hari
    if (baseDate.getHours() < 16) daysToAdd -= 0.5;

    baseDate.setDate(baseDate.getDate() + daysToAdd);
    return baseDate;
  }

  // WhatsApp konfirmasi (Versi tanpa backend)
  const setupWhatsAppButton = () => {
    document.getElementById("confirmBtn").addEventListener("click", () => {
      Swal.fire({
        icon: "question",
        title: "Apakah Anda yakin sudah melakukan pembayaran?",
        text: "Konfirmasi ini akan menghapus keranjang dan mengarahkan Anda ke WhatsApp.",
        showCancelButton: true,
        confirmButtonText: "Ya, saya sudah bayar",
        cancelButtonText: "Belum",
      }).then((result) => {
        // Di dalam fungsi setupWhatsAppButton
        if (result.isConfirmed) {
          // 1. Buat data pesanan dengan status awal "processing"
          const newOrder = {
            id: `#NP${Date.now().toString().slice(-8)}`, // ID unik
            date: new Date().toISOString(), // Format ISO 8601
            status: "processing", // Status awal
            items: paymentData.items.map((item) => ({
              name: item.name,
              variant: `Ukuran: ${item.size}`,
              price: item.price,
              qty: item.quantity,
              image: item.image,
            })),
            buyer: {
              name: `${paymentData.buyer.firstName} ${paymentData.buyer.lastName}`,
              address: paymentData.buyer.address,
              city: paymentData.buyer.city,
              province: paymentData.buyer.province,
              postalcode: paymentData.buyer.postalCode,
              phone: paymentData.buyer.phone,
            },
            shipping: {
              cost: calculateShippingCost(paymentData.buyer.province),
              duration: calculateShippingDuration(paymentData.buyer.province),
              estimatedDelivery: calculateEstimatedDelivery(
                paymentData.buyer.province,
                new Date()
              ).toISOString(),
            },
            total:
              typeof paymentData.total === "string"
                ? parseInt(paymentData.total.replace(/[^\d]/g, ""))
                : paymentData.total,
          };

          // 2. Simpan ke localStorage
          const orders = JSON.parse(localStorage.getItem("orders")) || [];
          orders.unshift(newOrder); // Tambahkan di awal array
          localStorage.setItem("orders", JSON.stringify(orders));

          // 3. Hapus keranjang
          localStorage.removeItem("cart");
          localStorage.removeItem("cart_note");

          // 4. Redirect ke WhatsApp
          const now = new Date().toLocaleString("id-ID");
          const whatsappMessage = `Halo NEPTUNES Store, berikut detail pembayaran saya:
  
  👤 *Data Pembeli*
  Nama: ${paymentData.buyer.firstName} ${paymentData.buyer.lastName}
  Alamat: ${paymentData.buyer.address}, ${paymentData.buyer.city}
  Provinsi: ${paymentData.buyer.province}
  Kode Pos: ${paymentData.buyer.postalCode}
  Telp: ${paymentData.buyer.phone}
  
  🛒 *Detail Pesanan*
  ${paymentData.items
    .map(
      (item) =>
        `• ${item.name} (${item.quantity}x): Rp ${(
          item.price * item.quantity
        ).toLocaleString("id-ID")}`
    )
    .join("\n")}
  
  💳 *Pembayaran*
  Metode: ${paymentData.payment.method} - ${paymentData.payment.detail}
  Total: ${paymentData.total}
  
  🕒 Pesanan dibuat pada: ${now}
  📎 *Bukti Pembayaran* (harap dilampirkan di WA)`;

          window.open(
            `https://wa.me/6282121884390?text=${encodeURIComponent(
              whatsappMessage
            )}`,
            "_blank"
          );

          setTimeout(() => {
            window.location.href = "../index.html";
          }, 300);
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

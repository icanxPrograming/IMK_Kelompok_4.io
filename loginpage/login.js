let loginAttempts = 0;
let lockUntil = null;

function sanitizeInput(input) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}

function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

document.getElementById("login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = sanitizeInput(
    document.getElementById("login-email").value.trim().toLowerCase()
  );
  const password = document.getElementById("login-password").value;

  if (lockUntil && new Date().getTime() < lockUntil) {
    Swal.fire({
      title: "Terkunci!",
      text: "Terlalu banyak percobaan. Coba lagi nanti.",
      icon: "error",
    });
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const hashedInputPassword = hashPassword(password);

  const user = users.find(
    (u) => u.email === email && u.passwordHash === hashedInputPassword
  );

  if (user) {
    const sessionToken = CryptoJS.SHA256(Date.now() + email).toString();
    const sessionExpiry = new Date().getTime() + 30 * 60 * 1000; // 30 menit dari sekarang

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        email: user.email,
        nickName: user.nickName,
        token: sessionToken,
        expiresAt: sessionExpiry,
      })
    );

    Swal.fire({
      title: "Berhasil!",
      text: `Selamat datang, ${user.nickName}!`,
      icon: "success",
      timer: 2000,
      timerProgressBar: true,
    }).then(() => {
      window.location.href = "../index.html";
    });

    loginAttempts = 0; // reset
  } else {
    loginAttempts++;
    Swal.fire({
      title: "Gagal!",
      text: "Email atau password salah.",
      icon: "error",
    });

    if (loginAttempts >= 5) {
      lockUntil = new Date().getTime() + 60 * 1000; // 1 menit terkunci
    }
  }
});

// Cek session saat halaman di-load
function checkSession() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    if (new Date().getTime() > currentUser.expiresAt) {
      localStorage.removeItem("currentUser");
      Swal.fire({
        title: "Sesi Habis!",
        text: "Silakan login kembali.",
        icon: "info",
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "../loginpage/loginpage.html";
      });
    }
  }
}

// Jalankan cek sesi otomatis
checkSession();

// Fungsi untuk mengirim email reset password
function sendPasswordReset(email) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email);

  if (!user) {
    Swal.fire({
      title: "Gagal!",
      text: "Email tidak terdaftar.",
      icon: "error",
    });
    return false;
  }

  // Simpan token reset password (dalam aplikasi nyata, ini akan dikirim via email)
  const resetToken = CryptoJS.SHA256(Date.now() + email).toString();
  const resetExpiry = new Date().getTime() + 30 * 60 * 1000; // 30 menit

  localStorage.setItem(
    "passwordReset",
    JSON.stringify({
      email: user.email,
      token: resetToken,
      expiresAt: resetExpiry,
    })
  );

  // Dalam aplikasi nyata, di sini akan mengirim email dengan link reset
  // Untuk demo, kita akan langsung tampilkan form reset
  showResetPasswordForm(user.email);
  return true;
}

// Fungsi untuk menampilkan form reset password
function showResetPasswordForm(email) {
  Swal.fire({
    title: "Reset Password",
    html: `
      <div class="reset-form">
        <p>Reset password untuk: <strong>${sanitizeInput(email)}</strong></p>
        <input type="password" id="new-password" class="swal2-input" placeholder="Password Baru">
        <input type="password" id="confirm-new-password" class="swal2-input" placeholder="Konfirmasi Password Baru">
      </div>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById(
        "confirm-new-password"
      ).value;

      if (!newPassword || !confirmPassword) {
        Swal.showValidationMessage("Harap isi kedua field password");
        return false;
      }

      if (newPassword !== confirmPassword) {
        Swal.showValidationMessage("Password tidak cocok");
        return false;
      }

      if (
        newPassword.length < 6 ||
        !/[a-zA-Z]/.test(newPassword) ||
        !/\d/.test(newPassword)
      ) {
        Swal.showValidationMessage(
          "Password minimal 6 karakter, kombinasi huruf dan angka"
        );
        return false;
      }

      return { newPassword };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      resetPassword(email, result.value.newPassword);
    }
  });
}

// Fungsi untuk mereset password
function resetPassword(email, newPassword) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex === -1) {
    Swal.fire({
      title: "Gagal!",
      text: "Email tidak ditemukan.",
      icon: "error",
    });
    return;
  }

  // Update password
  users[userIndex].passwordHash = hashPassword(newPassword);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.removeItem("passwordReset");

  Swal.fire({
    title: "Sukses!",
    text: "Password berhasil direset. Silakan login dengan password baru Anda.",
    icon: "success",
  });
}

// Event listener untuk lupa password
document
  .getElementById("forgot-password-link")
  ?.addEventListener("click", (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Lupa Password",
      input: "email",
      inputLabel: "Masukkan email Anda",
      inputPlaceholder: "Email terdaftar",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Kirim Link Reset",
      cancelButtonText: "Batal",
      showLoaderOnConfirm: true,
      preConfirm: (email) => {
        if (!email) {
          Swal.showValidationMessage("Email harus diisi");
          return false;
        }

        return sendPasswordReset(email);
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  });

// Helper sanitasi input
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}

// Hashing password
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

document.getElementById("register-form")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const fullName = sanitizeInput(
    document.getElementById("fullName").value.trim()
  );
  const nickName = sanitizeInput(
    document.getElementById("nickName").value.trim()
  );
  const email = sanitizeInput(
    document.getElementById("register-email").value.trim().toLowerCase()
  );
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    Swal.fire({
      title: "Gagal!",
      text: "Password dan konfirmasi tidak cocok.",
      icon: "error",
    });
    return;
  }

  if (
    password.length < 6 ||
    !/[a-zA-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    Swal.fire({
      title: "Gagal!",
      text: "Password minimal 6 karakter, kombinasi huruf dan angka.",
      icon: "error",
    });
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const emailExists = users.some((u) => u.email === email);

  if (emailExists) {
    Swal.fire({
      title: "Gagal!",
      text: "Email sudah terdaftar.",
      icon: "error",
    });
    return;
  }

  const newUser = {
    fullName,
    nickName,
    email,
    passwordHash: hashPassword(password),
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  Swal.fire({
    title: "Sukses!",
    text: "Pendaftaran berhasil!",
    icon: "success",
    timer: 2000,
    timerProgressBar: true,
  }).then(() => {
    window.location.href = "../loginpage/loginpage.html";
  });
});

var notyf = new Notyf();
const forgotBtn = document.getElementById("forgotBtn");

forgotBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const data = {
    email,
  };
  fetch("/auth/forgot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      switch (data.status) {
        case "error":
          notyf.error(data.message);
          // clear form data after 4 seconds
          setTimeout(() => {
            document.getElementById("forgotForm").reset();
          }, 3000);
          break;
        case "success":
          notyf.success(data.message);
          notyf.success("Redirecting to Register Page");
          setTimeout(() => {
            window.location.href = "/register";
          }, 3000);
          break;
        default:
          break;
      }
    });
});

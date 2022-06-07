const notyf = new Notyf();
const subBtn = document.getElementById("subBtn");

subBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const data = {
    answer: document.getElementById("answer").value,
    level: document.getElementById("level").value,
  };
  console.log(document.getElementById("answer").value);
  fetch("/submit", {
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
            document.getElementById("ansForm").reset();
          }, 1000);
          break;
        case "wrong":
          notyf.error("Answer is incorrect");
          // clear form data after 4 seconds
          setTimeout(() => {
            document.getElementById("ansForm").reset();
          }, 1000);
          break;
        case "success":
          notyf.success("Answer is correct");
          notyf.success("Redirecting to Next Level");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 3000);
          break;
        case "over":
          notyf.success("Congrats! You have completed the hunt");
          setTimeout(() => {
            window.location.href = "/finish";
          }, 3000);
        default:
          break;
      }
    });
});

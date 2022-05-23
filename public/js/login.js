var notyf = new Notyf();
const logBtn = document.getElementById('logBtn');

logBtn.addEventListener('click', (e) => {
    e.preventDefault()

    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        })
    }).then(res => res.json())
        .then(data => {
            switch (data.status) {
                case "error":
                    notyf.error(data.message);
                    // clear form data after 4 seconds
                    setTimeout(() => {
                        document.getElementById('logForm').reset();
                    }, 1000);
                    break;
                case "success":
                    notyf.success(data.message);
                    notyf.success("Redirecting to Dashboard");
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 2000);
                    break;
                default:
                    break;
            }
        }
        )
    })

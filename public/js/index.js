function openRegisterModal() {
    var myModal = new bootstrap.Modal(document.getElementById('myModal2'));
    myModal.show();

}

document.getElementById("btnRegister").addEventListener("click", openRegisterModal);

function register() {
    var userId = document.getElementById("user").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    // Add your validation logic here
    if (!userId || !email || !password || !confirmPassword) {
        alert("Please fill in all fields");
        return;
    }

    // Example: Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    // Store user data in localStorage or sessionStorage
    var userData = {
        userId: userId,
        email: email,
        password: password
    };

    localStorage.setItem('userData', JSON.stringify(userData));

    // Close the modal
    var myModal = new bootstrap.Modal(document.getElementById('myModal2'));
    myModal.hide();

    // Show success message
    Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'You have successfully registered!',
    }).then((result) => {
        if (result.isConfirmed) {
            myModal.show()
            // Optional: Redirect to another page after registration
            // window.location.href = '#modalId';

        }
    });
}

// Event listener for the register button inside the registration modal
document.getElementById("btnRegister2").addEventListener("click", function () {

});



// _________________________Student History______________________
document.addEventListener('DOMContentLoaded', function () {
    const pageIconsContainer = document.querySelector('.page-icons');

    pageIconsContainer.addEventListener('click', function (event) {
      const clickedIcon = event.target;

      if (clickedIcon.classList.contains('footer-page')) {
        const activeIcon = document.querySelector('.footer-page.active');
        activeIcon.classList.remove('active');

        clickedIcon.classList.add('active');
      }
    });
  });

//   ____________________________________________________________


    // function logout() {
    //     Swal.fire({
    //         title: "Are you sure you want to log out?",
    //         showCancelButton: true,
    //         confirmButtonText: "Yes",
    //         cancelButtonText: "Cancel",
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             // Add your logout logic here
    //             Swal.fire("Logged out successfully!", "", "success");
    //             window.location.href = '/';
    //             req.session.destroy(function (err) {
    //                 if (err) {
    //                     console.error(err);
    //                     return res.status(500).send("Cannot clear session");
    //                 }
    //                 // Redirect to the login page after successfully destroying the session
    //                 res.redirect("/");
    //             });
    //         }
    //     });
    // }


    function logout() {
        Swal.fire({
            title: "Are you sure you want to log out?",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                // Send a logout request to the server
                fetch('/logout', {
                    method: 'GET', // Assuming your server supports GET requests for logout
                    credentials: 'same-origin' // Include cookies in the request
                })
                .then(response => {
                    if (response.ok) {
                        // Session cleared successfully, redirect to login page
                        window.location.href = '/';
                    } else {
                        // Handle error response from server
                        return response.text().then(errorMessage => {
                            throw new Error(errorMessage);
                        });
                    }
                })
                .catch(error => {
                    console.error(error);
                    Swal.fire("Error", "Failed to log out. Please try again.", "error");
                });
            }
        });
    }
    


//   _____________________________________________
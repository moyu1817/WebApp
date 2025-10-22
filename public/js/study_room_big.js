document.addEventListener("DOMContentLoaded", function() {
    // Function to add click event listeners to clickable cells
    

    // Call the function to add click event listeners once the DOM content is loaded
    addClickListeners();
});

function addClickListeners() {
    var clickableCells = document.querySelectorAll(".clickable");

    clickableCells.forEach(function(cell) {
        cell.addEventListener("click", function() {
            // Disable the cell to prevent multiple clicks
            this.classList.remove("clickable");
            // Rest of your code...
            // Extract room ID and time slot from the clicked cell
            var roomId = this.dataset.room_id;
            var timeSlot = this.dataset.time_slot;

            // Update the selected room ID and time slot
            selectedRoomId = roomId;
            selectedTimeSlot = timeSlot;

            alert(selectedRoomId);
            alert(selectedTimeSlot);

            // Redirect to the booking page with selected room ID and time slot as query parameters
           
            fetch('/check-booking')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.hasBooking) {
                    // User has a pending booking for today
                    console.log("User has a pending booking for today.");
                    // You can display a message or take appropriate action here
                    Notiflix.Report.failure('Error', "User has a pending booking for today. Please wait until tomorrow!!!", 'Close');
                   
                  } else {
    
                    // User does not have a pending booking for today
                    Notiflix.Report.success("User does not have a pending booking for today.", data, "Close");
                    console.log("User does not have a pending booking for today.");
                    // You can display a message or take appropriate action here
                    window.location.href = `/student/roombooking/studyBig?room_id=${selectedRoomId}&time_slot=${selectedTimeSlot}`;
                  }
            })
            .catch(error => {
                alert(error);
                console.error('There was a problem with the fetch operation:', error);
            });
        });
    });
}
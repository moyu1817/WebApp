document.addEventListener("DOMContentLoaded", function () {
  // Create header element
  const header = document.createElement("header");
  header.classList.add("header-area", "header-area-main-page", "header-sticky", "wow", "slideInDown");
  header.setAttribute("data-wow-duration", "0.75s");
  header.setAttribute("data-wow-delay", "0s");

  // Create container element
  const container = document.createElement("div");
  container.classList.add("container");

  // Create row element
  const row = document.createElement("div");
  row.classList.add("row");

  // Create column element
  const col = document.createElement("div");
  col.classList.add("col-12");

  // Create nav element
  const nav = document.createElement("nav");
  nav.classList.add("main-nav");

  // Create logo element
  const logo = document.createElement("a");
  logo.href = "index.html";
  logo.classList.add("logo");
  const logoImg = document.createElement("img");
  logoImg.src = "/public/img/logo.png";
  logoImg.width = "300";
  logoImg.alt = "ReservU";
  logo.appendChild(logoImg);

  // Create ul element for menu
  const ul = document.createElement("ul");
  ul.classList.add("nav");
  // Create li elements for menu items
  ["Room Booking", "Status", "History"].forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#"; // Placeholder href
      a.textContent = item;
      li.appendChild(a);
      ul.appendChild(li);
  });

  // Create form element for logout button
  const form = document.createElement("form");
  form.id = "logout-form";
  const button = document.createElement("button");
  button.classList.add("gradient-button-logout");
  button.type = "button";
  button.setAttribute("onclick", "logout()");
  const div = document.createElement("div");
  div.style.padding = "0px";
  const img = document.createElement("img");
  img.id = "btnlogout";
  img.src = "/public/img/sign in.png";
  img.alt = "Log out";
  img.style.width = "30px";
  img.style.height = "40px";
  div.appendChild(img);
  div.textContent = "Log Out";
  button.appendChild(div);
  form.appendChild(button);

  // Append elements to build the header
  nav.appendChild(logo);
  nav.appendChild(ul);
  nav.appendChild(form);
  col.appendChild(nav);
  row.appendChild(col);
  container.appendChild(row);
  header.appendChild(container);

  // Append header to the body
  document.body.appendChild(header);

  // Create main content container div
  const mainContainer = document.createElement("div");
  mainContainer.classList.add("container-stu");

  // Create status title h3 element
  const statusTitle = document.createElement("h3");
  statusTitle.classList.add("status-title", "text-center");
  statusTitle.textContent = "Status";

  // Create row div for cards
  const cardRowDiv = document.createElement("div");
  cardRowDiv.classList.add("row", "p-5");

  // Create card elements
  const cardData = [
      { imgSrc: "/public/img/rs-1.jpg", title: "Study(small) 3", date: "19 March 2023", time: "12:00 PM - 13:00 PM", status: "Pending" },
      { imgSrc: "/public/img/mul-1.jpg", title: "Multimedia 4", date: "4 March 2023", time: "12:00 PM - 13:00 PM", status: "Approved" },
      { imgSrc: "/public/img/rb-1.jpg", title: "Study(big) 2", date: "4 March 2023", time: "12:00 PM - 13:00 PM", status: "Rejected" }
      // Add more card data as needed
  ];

  cardData.forEach(data => {
      const colDiv = document.createElement("div");
      colDiv.classList.add("col-md-4");
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      const img = document.createElement("img");
      img.src = data.imgSrc;
      img.classList.add("card-img-top");
      img.height = "300";
      img.alt = "Placeholder Image";
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
      const cardTitle = document.createElement("h5");
      cardTitle.classList.add("card-title");
      cardTitle.textContent = data.title;
      const bookingDate = document.createElement("p");
      bookingDate.classList.add("card-text");
      bookingDate.textContent = "Booking Date: " + data.date;
      const bookingTime = document.createElement("p");
      bookingTime.classList.add("card-text");
      bookingTime.textContent = "Booking Time: " + data.time;
      const statusBadge = document.createElement("span");
      statusBadge.classList.add("status-badge");
      statusBadge.textContent = data.status;
      statusBadge.style.backgroundColor = getStatusColor(data.status); // Custom function to get color based on status
      cardBody.appendChild(cardTitle);
      cardBody.appendChild(bookingDate);
      cardBody.appendChild(bookingTime);
      cardBody.appendChild(statusBadge);
      cardDiv.appendChild(img);
      cardDiv.appendChild(cardBody);
      colDiv.appendChild(cardDiv);
      cardRowDiv.appendChild(colDiv);
  });

  // Append elements to build the main container
  mainContainer.appendChild(statusTitle);
  mainContainer.appendChild(cardRowDiv);
  document.body.appendChild(mainContainer);
});

// Custom function to get color based on status
function getStatusColor(status) {
  switch (status) {
      case "Pending":
          return "#f4eaa9";
      case "Approved":
          return "#a8f4c4";
      case "Rejected":
          return "#f4a8b3";
      default:
          return "transparent";
  }
}

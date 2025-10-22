// JavaScript code for table navigation
function showTable(tableNumber) {
  // Hide all tables first
  document.querySelectorAll('.reservU-table').forEach(table => {
      table.classList.add('hidden');
  });

  // Show the selected table
  const selectedTable = document.getElementById(`table${tableNumber}`);
  if (selectedTable) {
      selectedTable.classList.remove('hidden');
  }

  // Update active page link in footer
  document.querySelectorAll('.footer-page').forEach(pageLink => {
      pageLink.classList.remove('active');
  });
  const activePageLink = document.querySelector(`.footer-page[href="#"][onclick="showTable(${tableNumber})"]`);
  if (activePageLink) {
      activePageLink.classList.add('active');
  }
}

// JavaScript code for logout functionality
// function logout() {
//   // Perform logout actions here, such as clearing session data or redirecting to a logout page
//   alert('Logging out...');
//   // Example: redirect to logout page
//   window.location.href = '/logout';
// }


// function showTable(tableNumber) {
//     const tables = document.querySelectorAll('table');
//     const pageIcons = document.querySelectorAll('.footer-page');
//     const pageCount = tables.length;
  
//     tables.forEach(table => {
//       table.classList.add('hidden');
//     });
  
//     pageIcons.forEach(icon => {
//       icon.classList.remove('active');
//     });
  
//     document.getElementById('table' + tableNumber).classList.remove('hidden');
//     pageIcons[tableNumber - 1].classList.add('active');
  
//     updatePageCount(tableNumber, pageCount);
//   }
  
//   function updatePageCount(currentPage, totalPage) {
//     const pageCounter = document.querySelector('.page-count p strong');
//     pageCounter.textContent = `Page ${currentPage} of ${totalPage}`;
//   }
  
//   //Approve/DisApprove
//   document.addEventListener("DOMContentLoaded", function () {
//     const rows = document.querySelectorAll("tbody tr");
  
//     rows.forEach(row => {
//       const statusCell = row.querySelector("td:nth-child(5)");
//       const status = statusCell.textContent.trim();
  
//       const nameCell = row.querySelector("td:nth-child(6)");
//       const name = nameCell.textContent.trim();
  
//       if (status === "Approved") {
//         statusCell.classList.add("approved-text");
//         if (name === "Arjan XYZ") {
//           nameCell.classList.add("arjan-approved");
//         }
//       } else if (status === "Rejected") {
//         statusCell.classList.add("rejected-text");
//         if (name === "Arjan XYZ") {
//           nameCell.classList.add("arjan-rejected");
//         }
//       } else if (status === "Pending") {
//         statusCell.classList.add("pending-text");
//         if (name === "Arjan XYZ") {
//           nameCell.classList.add("arjan-pending");
//         }
//       }
//     });
//   });
  
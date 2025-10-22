
// -------------------- New Version -----------------------
const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const con = require('./config/db');


const app = express();

// set the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for session
app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //1 day in millisec
    secret: 'mysecretcode',
    resave: false,
    saveUninitialized: true,
    // config MemoryStore here
    store: new MemoryStore({
        checkPeriod: 24 * 60 * 60 * 1000 // prune expired entries every 24h
    })
}));

// ------------- Create hashed password --------------
app.get("/password/:pass", function (req, res) {
    const password = req.params.pass;
    const saltRounds = 10;    //the cost of encrypting see https://github.com/kelektiv/node.bcrypt.js#a-note-on-rounds
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            return res.status(500).send("Hashing error");
        }
        res.send(hash);
    });
});


// =================== Other routes =======================

// ------------- get user info --------------
app.get('/userInfo', function (req, res) {
    res.json({ "user_id": req.session.userID, "username": req.session.username, "role_id": req.session.role });

    // console.log({ "user_id": req.session.userID, "username": req.session.username, "role_id": req.session.role });
});
// =================== Other routes =======================


// login
// password1 = P@ssw0rd123
// password2 = Secur3P@ss
// password3 = H@rdP@ssw0rd
// ---------- login -----------
app.post('/login', function (req, res) {
    const { username, password } = req.body;
    const sql = "SELECT user_id, password, role_id FROM users WHERE username = ?";
    con.query(sql, [username], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error. Please try again later.");
        }
        if (results.length != 1) {
            return res.status(401).send("Wrong username. Please try again!");
        }
        // check password
        bcrypt.compare(password, results[0].password, function (err, same) {
            if (err) {
                res.status(500).send("Internal Server Error. Please try again later.");
            } else if (same) {
                // remember user
                req.session.userID = results[0].user_id;
                req.session.username = username;
                req.session.role = results[0].role_id;

                console.log("Role ID:", results[0].role_id); // Add this line for logging
  // Define the redirect URL based on the user's role
  let redirectUrl;
  if (results[0].role_id == 1) {
      // Student
      console.log(results[0].role_id);
      redirectUrl = '/student/mainpage';
  } else if (results[0].role_id == 2) {
      // Staff
      console.log(results[0].role_id);
      redirectUrl = '/staff/mainpage';
  } else {
      // Lecturer
      console.log(results[0].role_id);
      redirectUrl = '/lecturer/mainpage';
  }

  // Send the response with both user_id and redirectUrl
  res.json({ user_id: results[0].user_id, redirectUrl: redirectUrl });
} else {
  res.status(401).send("Wrong password");
}
});
    });
});

// ------------- get user info --------------
app.get('/userInfo', function (req, res) {
    res.json({ "user_id": req.session.userID, "username": req.session.username, "role_id": req.session.role });

    // console.log({ "user_id": req.session.userID, "username": req.session.username, "role_id": req.session.role });
});

// Check username from database
// Assuming you have your database configured and user model defined
// Assuming you're using Express
app.post('/checkUsername', (req, res) => {
    const { username } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    con.query(sql, [username], function (err, results){
        if (err) {
            // Handle database error
            console.error(err);
            res.status(500).send('Internal server error');
            return;
        }
    
        if (results.length > 0) {
            // Username already exists
            res.status(401).send('Username already taken');
        } else {
            // Username is available
            res.status(200).send('Username available');
        }
    });
});








// ------------------- Register --------------------------


app.post("/register", function (req, res) {
    const newUser = req.body;
    const saltRounds = 10;
    const sql = "INSERT INTO users SET ?";
    bcrypt.hash(newUser.password, saltRounds, function (err, hash) {
        if (err) {
            return res.status(500).send("Hashing error");
        }
        newUser.password = hash;
        con.query(sql, newUser, function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).send("Error: Internal Server Error. Please try again later.");
            }
            if (results.affectedRows != 1) {
                console.error('Row added is not 1');
                return res.status(401).send("Error: Oops! Something went wrong. Please try again.");
            }
            res.send("Success: Your account has been created! ");
        });
    });
});



// ------------- get all rooms for student --------------
app.get('/student/rooms', function (req, res) {
    const sql = `  SELECT r.*, rb.booking_id, rb.date, rb.user_id, rb.status, rb.time_slot
    FROM rooms r
    LEFT JOIN room_booking_detail rbd ON r.room_id = rbd.room_id
    LEFT JOIN room_booking rb ON rbd.booking_id = rb.booking_id`;
    con.query(sql, function (err, results) {
        if (err) {
            // console.log(sql);
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

// Function to convert date to '%W, %M %e, %Y' format
function formatDateToCustomFormat(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}


app.get('/check-booking', function (req, res) {
    const userId = req.session.userID; // Get the user ID from the session
    const currentDate = formatDateToCustomFormat(new Date().toISOString()); // Get the current date

    // Query the database to check for bookings
    const sql = "SELECT * FROM room_booking WHERE user_id = ? AND date = ? AND status = ?";
    con.query(sql, [userId, currentDate, 'pending'], function (err, results) {
        if (err) {
            console.error("Error executing SQL query:", err);
            res.status(500).json({ error: 'Internal server error' }); // Send an error response
            return; // Exit early if there's an error
        }

        // Log the number of rows returned by the query
        // console.log("Number of pending bookings:", results.length);

        // Check if there are pending bookings
        if (results.length > 0) {
            // If there are pending bookings, send a success response with the bookings data
            res.status(200).json({ hasBooking: true, bookings: results });
            return;
        } else {
            // If there are no pending bookings, send a success response indicating no bookings
            res.status(200).json({ hasBooking: false });
            return;
        }
    });
});

// Handle POST request to submit a new booking
app.post("/student/bookings", function (req, res) {
    const newBooking = req.body;

    // Add server-side validation to prevent duplicate bookings
    const userId = newBooking.user_id;
    const currentDate = formatDateToCustomFormat(new Date().toISOString());
    const currentTimeSlot = newBooking.time_slot;

    // Query the database to check if a booking already exists for the user on the same date and time
    const existingBookingSql = "SELECT * FROM room_booking WHERE user_id = ? AND date = ? AND time_slot = ?";
    con.query(existingBookingSql, [userId, currentDate, currentTimeSlot], function (err, results) {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Database server error");
        }

        // If a booking already exists, return a message indicating that the booking cannot be duplicated
        if (results.length > 0) {
            return res.status(400).send("Booking already exists for this user on the same date and time");
        }

        // If no booking exists, proceed with inserting the new booking
        const roomBookingSql = "INSERT INTO room_booking (user_id,room_id, date, time_slot, status) VALUES (?, ?, ?, ?, ?)";
        const roomBookingValues = [
            newBooking.user_id, // Make sure to get user_id from the request
            newBooking.room_id,
            currentDate, // Insert current date
            newBooking.time_slot,
            "pending" // Default status for new bookings
            
        ];

        con.query(roomBookingSql, roomBookingValues, function (err, roomBookingResult) {
            if (err) {
                console.error(err);
                return res.status(500).send("Database server error");
            }

            // Retrieve the booking ID generated for the new booking
            const bookingId = roomBookingResult.insertId;

            // Insert booking details into the room_booking_detail table
            const bookingDetailsSql = "INSERT INTO room_booking_detail (booking_id, room_id, time_slot, booking_objective) VALUES (?, ?, ?, ?)";
            const bookingDetailsValues = [
                bookingId,
                newBooking.room_id,
                newBooking.time_slot,
                newBooking.booking_objective
            ];

            con.query(bookingDetailsSql, bookingDetailsValues, function (err, bookingDetailsResult) {
                if (err) {
                    console.error(err);
                    // Rollback the room_booking entry if there's an error
                    con.query("DELETE FROM room_booking WHERE booking_id = ?", [bookingId], function (rollbackErr, rollbackResult) {
                        if (rollbackErr) {
                            console.error("Rollback failed:", rollbackErr);
                        }
                    });
                    return res.status(500).send("Database server error");
                }

                res.send("Booking successfully added");
            });
        });
    });
});

// =============================  Dashboard for lec ===================================================
app.get('/roomCounts', (_req, res) => {
    // Query the database to fetch book counts for each status
    const sql = `
    SELECT 
    (SELECT COUNT(*) FROM room_booking  ) AS totalRequests,
    (SELECT COUNT(*) FROM rooms) AS totalRooms,
    (SELECT COUNT(*) FROM room_booking WHERE status = 'pending') AS pendingSlots,
    (SELECT COUNT(*) FROM room_booking WHERE status = 'disabled') AS disableSlots,
    (SELECT COUNT(*) FROM room_booking WHERE status = 'rejected') AS rejectedSlots,
    (SELECT COUNT(*) FROM room_booking WHERE status = 'approved') AS reservedSlots,
    ((SELECT COUNT(*) FROM rooms) * 4) - (SELECT COUNT(*) FROM room_booking WHERE status = 'pending')  - (SELECT COUNT(*) FROM room_booking WHERE status = 'approved') - (SELECT COUNT(*) FROM room_booking WHERE status = 'disable') AS freeSlots
FROM rooms;
    `;
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching book counts:', err);
            res.status(500).json({ error: 'Error fetching book counts' });
        } else {
            // Extract the counts from the query result
            const roomCounts = result[0];
            // Send the book counts as JSON response
            res.json(roomCounts);
            console.log(roomCounts);
        }
    });
});
// ======================================================================================================
app.put('/bookings/:bookingId/approve', (req, res) => {
    const { bookingId } = req.params;
    const userId = req.session.userID;

    // Check if the user has the correct role to approve bookings
    const checkRoleSql = 'SELECT role_id FROM users WHERE user_id = ?';
    con.query(checkRoleSql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error: An error occurred on the server");
        }
        if (results.length > 0 && results[0].role_id !== '3') {  // Assuming '3' is the role_id for lecturers
            return res.status(401).send("Error: User is not authorized to approve bookings");
        }

        // Begin transaction
        con.beginTransaction(err => {
            if (err) {
                return res.status(500).send("Error starting transaction: " + err.message);
            }

            // Update the booking status in the room_booking table
            const updateBookingSql = 'UPDATE room_booking SET status = "approved" WHERE booking_id = ?';
            con.query(updateBookingSql, [bookingId], (err, result) => {
                if (err) {
                    console.error(err);
                    con.rollback(() => {
                        res.status(500).send("Internal Server Error: An error occurred while updating booking");
                    });
                    return;
                }

                // Update the confirmed_by_lecturer_id in the room_booking_detail table
                const updateDetailSql = 'UPDATE room_booking_detail SET confirmed_by_lecturer_id = ? WHERE booking_id = ?';
                con.query(updateDetailSql, [userId, bookingId], (err, result) => {
                    if (err) {
                        console.error(err);
                        con.rollback(() => {
                            res.status(500).send("Internal Server Error: An error occurred while updating booking detail");
                        });
                        return;
                    }

                    // Commit transaction
                    con.commit(err => {
                        if (err) {
                            con.rollback(() => {
                                res.status(500).send("Error committing transaction: " + err.message);
                            });
                            return;
                        }
                        res.send({ success: true, message: "Booking approved", bookingId: bookingId });
                    });
                });
            });
        });
    });
});



app.put('/bookings/:bookingId/disapprove', (req, res) => {
    const { bookingId } = req.params;
    const userId = req.session.userID;

    // Check if the user has the correct role to disapprove bookings
    const checkRoleSql = 'SELECT role_id FROM users WHERE user_id = ?';
    con.query(checkRoleSql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error: An error occurred on the server");
        }
        if (results.length > 0 && results[0].role_id !== '3') {  // Assuming '3' is the role_id for lecturers
            return res.status(401).send("Error: User is not authorized to disapprove bookings");
        }

        // Begin transaction
        con.beginTransaction(err => {
            if (err) {
                return res.status(500).send("Error starting transaction: " + err.message);
            }

            // Update the booking status in the room_booking table
            const updateBookingSql = 'UPDATE room_booking SET status = "rejected" WHERE booking_id = ?';
            con.query(updateBookingSql, [bookingId], (err, result) => {
                if (err) {
                    console.error(err);
                    con.rollback(() => {
                        res.status(500).send("Internal Server Error: An error occurred while updating booking");
                    });
                    return;
                }

                // Update the confirmed_by_lecturer_id in the room_booking_detail table
                const updateDetailSql = 'UPDATE room_booking_detail SET confirmed_by_lecturer_id = ? WHERE booking_id = ?';
                con.query(updateDetailSql, [userId, bookingId], (err, result) => {
                    if (err) {
                        console.error(err);
                        con.rollback(() => {
                            res.status(500).send("Internal Server Error: An error occurred while updating booking detail");
                        });
                        return;
                    }

                    // Commit transaction
                    con.commit(err => {
                        if (err) {
                            con.rollback(() => {
                                res.status(500).send("Error committing transaction: " + err.message);
                            });
                            return;
                        }
                        res.send({ success: true, message: "Booking disapproved", bookingId: bookingId });
                    });
                });
            });
        });
    });
});

// Endpoint to get bookings for a student
app.get('/student/bookings', function (req, res) {
    const user_id = req.session.userID;
    const sql = `
        SELECT rb.booking_id, r.room_name, rb.date AS booking_date, rb.time_slot, rb.status AS booking_status, rbd.booking_objective
        FROM room_booking rb
        JOIN rooms r ON rb.room_id = r.room_id
        LEFT JOIN room_booking_detail rbd ON rb.booking_id = rbd.booking_id
        WHERE rb.user_id = ?;
    `;

    con.query(sql, [user_id], function (err, results) {
        if (err) {
            console.error('Error retrieving bookings:', err.message);
            return res.status(500).send("Internal Server Error: Unable to retrieve bookings.");
        }
        if (results.length === 0) {
            return res.status(404).send("No bookings found.");
        }
        res.set('Cache-Control', 'no-store');
        res.json(results);
    });
});

// General endpoint to fetch all bookings for displaying in the admin/lecturer panel
app.get('/api/bookings', (req, res) => {
    // Ensure the user is a lecturer or admin
 

    const sql = `
        SELECT rb.booking_id, rb.date AS booking_date, rb.time_slot, u.name AS requester, r.room_name, rb.status AS booking_status, rbd.booking_objective
        FROM room_booking rb
        JOIN users u ON rb.user_id = u.user_id
        JOIN rooms r ON rb.room_id = r.room_id
        LEFT JOIN room_booking_detail rbd ON rb.booking_id = rbd.booking_id
        WHERE rb.status != 'approved' AND rb.status != 'rejected' AND rb.status != 'disabled'
        ORDER BY rb.date DESC, rb.time_slot;
    `;

    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving all bookings:', err.message);
            return res.status(500).send("Internal Server Error: Unable to retrieve bookings.");
        }
        console.log(results);
        res.json(results);
    });
});

app.post('/rooms', (req, res) => {
    const { roomName, roomType, capacity } = req.body;
    console.log('Received capacity:', capacity); // Log the received capacity value
    const sql = 'INSERT INTO rooms (room_name, room_type, capacity) VALUES (?, ?, ?)';
    
    // Handle the case where capacity is not provided by the client
    const capacityValue = capacity !== undefined ? capacity : null;

    con.query(sql, [roomName, roomType, capacityValue], (err, result) => {
        if (err) {
            console.error('Failed to add room:', err);
            return res.status(500).send('Failed to add room');
        }
        res.status(201).send('Room added successfully');
    });
});


app.put('/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { roomName, capacity } = req.body;
    const sql = 'UPDATE rooms SET room_name = ?, capacity = ? WHERE room_id = ?';
    
    con.query(sql, [roomName, capacity, roomId], (err, result) => {
        if (err) {
            console.error('Failed to update room:', err);
            return res.status(500).send('Failed to update room');
        }
        res.send('Room updated successfully');
    });
});

app.delete('/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;

    // Optional: Check if the room is associated with any bookings before deletion
    const checkSql = 'SELECT * FROM room_booking WHERE room_id = ?';
    con.query(checkSql, [roomId], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking room dependencies:', checkErr);
            return res.status(500).send('Database error while checking room dependencies');
        }
        if (checkResults.length > 0) {
            // If the room has active bookings or dependencies, prevent deletion
            return res.status(400).send('Room cannot be deleted because it has active bookings or dependencies');
        }

        // Proceed with deletion if no active bookings or dependencies are found
        const deleteSql = 'DELETE FROM rooms WHERE room_id = ?';
        con.query(deleteSql, [roomId], (err, result) => {
            if (err) {
                console.error('Failed to delete room:', err);
                return res.status(500).send('Failed to delete room');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('No room found with the given ID');
            }
            res.send('Room deleted successfully');
        });
    });
});


app.post("/disable-room", function (req, res) {
    const { room_id, time_slot } = req.body;
    const currentDate = formatDateToCustomFormat(new Date().toISOString());
    const userId = req.session.userID;

    if (!userId) {
        return res.status(403).json({ error: "User not logged in or session expired" });
    }

    con.beginTransaction(function (tranErr) {
        if (tranErr) {
            console.error("Transaction Start Error:", tranErr);
            return res.status(500).send("Failed to start transaction");
        }

        const checkRoomSql = "SELECT * FROM room_booking WHERE room_id = ? AND date = ? AND time_slot = ? AND status NOT IN ('rejected', 'disabled')";
        con.query(checkRoomSql, [room_id, currentDate, time_slot], function (err, results) {
            if (err) {
                console.error("Database error:", err);
                return con.rollback(function () {
                    res.status(500).send("Database server error");
                });
            }

            if (results.length === 0) {
                const disableRoomSql = "INSERT INTO room_booking (user_id, room_id, date, status, time_slot) VALUES (?, ?, ?, 'disabled', ?)";
                con.query(disableRoomSql, [userId, room_id, currentDate, time_slot], function (disableErr, disableResult) {
                    if (disableErr) {
                        console.error("Database error on disabling:", disableErr);
                        return con.rollback(function () {
                            res.status(500).send("Failed to disable room");
                        });
                    }

                    // Assuming the booking objective for a disabled slot could be 'Maintenance' or similar
                    const bookingDetailsSql = "INSERT INTO room_booking_detail (booking_id, room_id, time_slot, booking_objective) VALUES (?, ?, ?, 'Maintenance')";
                    const bookingDetailsValues = [disableResult.insertId, room_id, time_slot];

                    con.query(bookingDetailsSql, bookingDetailsValues, function (detailsErr, detailsResult) {
                        if (detailsErr) {
                            console.error("Error inserting booking detail:", detailsErr);
                            return con.rollback(function () {
                                res.status(500).send("Failed to insert booking detail");
                            });
                        }

                        con.commit(function (commitErr) {
                            if (commitErr) {
                                console.error("Transaction Commit Error:", commitErr);
                                return con.rollback(function () {
                                    res.status(500).send("Failed to commit transaction");
                                });
                            }
                            res.json({ message: "Room disabled successfully for the time slot: " + time_slot });
                        });
                    });
                });
            } else {
                con.rollback(function () {
                    res.status(400).json({ error: "Room is not free for the specified time slot and cannot be disabled" });
                });
            }
        });
    });
});
app.post("/enable-room", function (req, res) {
    const { room_id, time_slot } = req.body;
    const currentDate = formatDateToCustomFormat(new Date().toISOString());
    const userId = req.session.userID;

    if (!userId) {
        return res.status(403).json({ error: "User not logged in or session expired" });
    }

    con.beginTransaction(function (tranErr) {
        if (tranErr) {
            console.error("Transaction Start Error:", tranErr);
            return res.status(500).send("Failed to start transaction");
        }

        // Check if the room is currently disabled
        const checkRoomSql = "SELECT * FROM room_booking WHERE room_id = ? AND date = ? AND time_slot = ? AND status = 'disabled'";
        con.query(checkRoomSql, [room_id, currentDate, time_slot], function (err, results) {
            if (err) {
                console.error("Database error:", err);
                return con.rollback(function () {
                    res.status(500).send("Database server error");
                });
            }

            if (results.length > 0) {
                // Delete dependent records in room_booking_detail first
                const deleteDetailsSql = "DELETE FROM room_booking_detail WHERE booking_id = ?";
                con.query(deleteDetailsSql, [results[0].booking_id], function (deleteErr, deleteResult) {
                    if (deleteErr) {
                        console.error("Error deleting booking detail:", deleteErr);
                        return con.rollback(function () {
                            res.status(500).send("Failed to delete booking detail");
                        });
                    }

                    // Now delete the room_booking record
                    const deleteRoomSql = "DELETE FROM room_booking WHERE room_id = ? AND date = ? AND time_slot = ?";
                    con.query(deleteRoomSql, [room_id, currentDate, time_slot], function (deleteErr, deleteResult) {
                        if (deleteErr) {
                            console.error("Database error on deleting booking:", deleteErr);
                            return con.rollback(function () {
                                res.status(500).send("Failed to delete booking");
                            });
                        }

                        con.commit(function (commitErr) {
                            if (commitErr) {
                                console.error("Transaction Commit Error:", commitErr);
                                return con.rollback(function () {
                                    res.status(500).send("Failed to commit transaction");
                                });
                            }
                            res.json({ message: "Room booking deleted successfully for the time slot: " + time_slot });
                        });
                    });
                });
            } else {
                // The room is not disabled for the given time slot
                con.rollback(function () {
                    res.status(400).json({ error: "Room is not disabled for the specified time slot and cannot be enabled" });
                });
            }
        });
    });
});




//=====================History=========================================//
// Route to handle fetching student booking history
app.get('/studentbookingHistory', (req, res) => {
    const userId = req.session.userID; // Get the logged-in student's ID
    // Query the database to fetch the booking history for the logged-in student
    const sql = `
    SELECT 
        room_booking_detail.detail_id,
        room_booking.booking_id,
        rooms.room_name AS room_name,
        room_booking.user_id,
        room_booking.date,
        room_booking.status,
        users_lecturer.username AS approve_by,  -- Use users_lecturer.username as approve_by
        room_booking_detail.time_slot,
        room_booking_detail.booking_objective  -- Include the booking_objective column
    FROM room_booking
    JOIN room_booking_detail ON room_booking.booking_id = room_booking_detail.booking_id
    JOIN rooms ON room_booking_detail.room_id = rooms.room_id
    JOIN users ON room_booking.user_id = users.user_id
    LEFT JOIN users AS users_lecturer ON room_booking_detail.confirmed_by_lecturer_id = users_lecturer.user_id  -- Join with users table for lecturer's username
    WHERE room_booking.user_id = ?;  -- Fetch bookings for the logged-in student only
    `;

    con.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching student booking history:', err);
            res.status(500).json({ error: 'Error fetching student booking history' });
        } else {
            res.json(result); // Send the student's booking history as JSON response
            console.log(result);
        }
    });
});


// =========history lecturer===============//
app.get('/lectHistory', (req, res) => {
    const sql = `
    SELECT 
        room_booking_detail.detail_id,
        room_booking.booking_id,
        rooms.room_name AS room_name,
        users.username AS username,  -- Change from user_id to username
        room_booking.date,
        room_booking.status,
        users_lecturer.username AS approve_by, -- Use users_lecturer.username as approve_by
        room_booking_detail.time_slot,
        room_booking_detail.booking_objective
    FROM room_booking
    JOIN room_booking_detail ON room_booking.booking_id = room_booking_detail.booking_id
    JOIN rooms ON room_booking_detail.room_id = rooms.room_id
    JOIN users ON room_booking.user_id = users.user_id  -- Join with users table to get the username
    LEFT JOIN users AS users_lecturer ON room_booking_detail.confirmed_by_lecturer_id = users_lecturer.user_id
    `;
    
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching lect booking history:', err);
            res.status(500).json({ error: 'Error fetching lect booking history' });
        } else {
            res.json(result); 
            console.log(result);
        }
    });
});





/////////////////////////////////////////////////////
//==============staff=======================//
app.get('/staffHistory', (req, res) => {
    const sql = `
    SELECT 
        room_booking_detail.detail_id,
        room_booking.booking_id,
        rooms.room_name AS room_name,
        users.username AS username,  -- Change from user_id to username
        room_booking.date,
        room_booking.status,
        users_lecturer.username AS approve_by, -- Use users_lecturer.username as approve_by
        room_booking_detail.time_slot,
        room_booking_detail.booking_objective
    FROM room_booking
    JOIN room_booking_detail ON room_booking.booking_id = room_booking_detail.booking_id
    JOIN rooms ON room_booking_detail.room_id = rooms.room_id
    JOIN users ON room_booking.user_id = users.user_id  -- Join with users table to get the username
    LEFT JOIN users AS users_lecturer ON room_booking_detail.confirmed_by_lecturer_id = users_lecturer.user_id
    `;
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching lect booking history:', err);
            res.status(500).json({ error: 'Error fetching lect booking history' });
        } else {
            res.json(result); 
            console.log(result);
        }
    });
});
/////////////////////////////////////////////////////

// ------------- Logout --------------
app.get("/logout", function (req, res) {
    //clear session variable
    req.session.destroy(function (err) {
        if (err) {
            console.error(err);
            res.status(500).send("Cannot clear session");
        }
        else {
            res.redirect("/");
        }
    });
});



// ------------ student main page ----------
app.get('/student/mainpage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/main-page-stu.html'));
});

// ------------ student status page ----------
app.get('/student/student-status', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/status-stu.html'));
});

// ------------ student history page ----------
app.get('/student/history-stu', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/history-stu.html'));
});




// ======================= staff ================================
// ------------ staff main page ----------
app.get('/staff/mainpage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/main-page-staff.html'));
});

// ------------ staff history page ----------
app.get('/staff/history1', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/history-staff-1.html'));
});
app.get('/staff/history2', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/history-staff-2.html'));
});

// ------------ staff edit page ----------
app.get('/staff/edit', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/edit-page.html'));
});
// ------------ staff dashboard page-------------
app.get('/staff/dashboard', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/dashboard-staff.html'));
});
// ==================== staff for edit========================================
app.get('/staff/edit/multi', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/multimediaEdit.html'));
});
app.get('/staff/edit/StudySmall', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/studyroomSmallEdit.html'));
});
app.get('/staff/edit/StudyBig', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/studyroomBigEdit.html'));
});

// =========================  info  =========================
// ---------------------- student ------------------------
app.get('/info1-stu', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/info1-stu.html'));
});
app.get('/info2-stu', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/info2-stu.html'));
});
// -------------------- staff --------------------------------
app.get('/info1-staff', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/info1-staff.html'));
});
app.get('/info2-staff', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/info2-staff.html'));
});
// -------------------- Lecturer --------------------------------
app.get('/info1-lect', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/info1-lect.html'));
});
app.get('/info2-lect', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/info2-lect.html'));

});



// =========================  room booking  =========================
app.get('/student/roombooking/multi', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/mul-room-booking.html'));
});
app.get('/student/roombooking/studysmall', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/sm-room-booking.html'));
});
app.get('/student/roombooking/studyBig', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/big-room-booking.html'));
});
// ===================== show student slot =======================
app.get('/student/multi', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/multimedia.html'));
});
app.get('/student/studysmall', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/studyroomsmall.html'));
});
app.get('/student/studyBig', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/student/studyroombig.html'));
});

// ===================== show staff slot =======================
app.get('/staff/slot/multi', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/view-staff-multimedia.html'));
});
app.get('/staff/slot/studysmall', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/view-staff-small.html'));
});
app.get('/staff/slot/studyBig', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/staff/view-staff-big.html'));
});

// ===================== show lecturer slot =======================
app.get('/lecturer/slot/multi', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/view-lec-multimedia.html'));
});
app.get('/lecturer/slot/studysmall', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/view-lec-small.html'));
});
app.get('/lecturer/slot/studyBig', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/view-lec-big.html'));
});



// =================== lecturer routes =======================
// ------------ lecturer main page ----------
app.get('/lecturer/mainpage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/main-page-lect.html'));
});

// ------------ lecturer status page ----------
app.get('/lecturer/status', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/status-lect.html'));
});
// ------------ history page -------------------------
app.get('/lecturer/history', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/history-lect.html'));
});
// ------------ lecturer dash page ------------
app.get('/lecturer/dashboard', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/lecturer/dashboard-lect.html'));
});







// ------------ root service ----------
app.get('/', function (req, res) {
    
    var userType;
    if(req.session.role == 1){
        userType = 'student';
    }
    else if(req.session.role == 2){
        userType = 'staff';
    }
    else if(req.session.role == 3){
        userType = 'lecturer';
    }

    if (req.session.userID) {
        res.redirect(`/${userType}/mainpage`);
    }
    else{
        res.sendFile(path.join(__dirname, 'views/index.html'));
    }

});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is runnint at port ' + PORT);
});

// ---------------------------------------------------------


// Assuming you already have 'express' and 'bcrypt' installed









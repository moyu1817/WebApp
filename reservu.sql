-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2024 at 06:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `reservu`
--

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `room_name` varchar(50) DEFAULT NULL,
  `room_type` enum('multimedia','study_room_small','study_room_big') DEFAULT NULL,
  `capacity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_name`, `room_type`, `capacity`) VALUES
(1, 'Multimedia 1', 'multimedia', 3),
(2, 'Multimedia 2', 'multimedia', 5),
(3, 'Multimedia 3', 'multimedia', 4),
(4, 'Multimedia 4', 'multimedia', 5),
(5, 'Multimedia 5', 'multimedia', 4),
(6, 'Small Study 1', 'study_room_small', 4),
(7, 'Small Study 2', 'study_room_small', 4),
(8, 'Small Study 3', 'study_room_small', 3),
(9, 'Small Study 4', 'study_room_small', 3),
(10, 'Small Study 5', 'study_room_small', 3),
(11, 'Big Study 1', 'study_room_big', 4),
(12, 'Big Study 2', 'study_room_big', 4),
(13, 'Big Study 3', 'study_room_big', 4),
(14, 'Big Study 4', 'study_room_big', 5),
(15, 'Big Study 5', 'study_room_big', 6);

-- --------------------------------------------------------

--
-- Table structure for table `room_booking`
--

CREATE TABLE `room_booking` (
  `booking_id` int(11) NOT NULL,
  `date` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected', 'disabled') DEFAULT 'pending',
  `time_slot` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `room_booking`
--

INSERT INTO `room_booking` (`booking_id`, `date`, `user_id`, `room_id`, `status`, `time_slot`)
VALUES
(109, 'Tuesday, April 23, 2024', 14, 8, 'pending', '15-17'),
(110, 'Tuesday, April 23, 2024', 14, 8, 'pending', '15-17'),
(111, 'Tuesday, April 23, 2024', 14, 8, 'pending', '13-15'),
(112, 'Tuesday, April 23, 2024', 14, 8, 'pending', '13-15'),
(113, 'Tuesday, April 23, 2024', 14, 7, 'pending', '10-12'),
(114, 'Tuesday, April 23, 2024', 14, 7, 'pending', '10-12'),
(115, 'Tuesday, April 23, 2024', 14, 8, 'pending', '8-10'),
(116, 'Tuesday, April 23, 2024', 17, 8, 'pending', '10-12'),
(117, 'Tuesday, April 23, 2024', 17, 10, 'pending', '15-17'),
(118, 'Tuesday, April 23, 2024', 18, 6, 'pending', '15-17');


-- --------------------------------------------------------

--
-- Table structure for table `room_booking_detail`
--

CREATE TABLE `room_booking_detail` (
  `detail_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `confirmed_by_lecturer_id` int(11) DEFAULT NULL,
  `booking_objective` varchar(255) DEFAULT NULL,
  `time_slot` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `room_booking_detail`
--

INSERT INTO `room_booking_detail` (`detail_id`, `booking_id`, `room_id`, `confirmed_by_lecturer_id`, `booking_objective`, `time_slot`) VALUES
(63, 109, 8, NULL, 'Studying', '15-17'),
(64, 110, 8, NULL, 'Studying', '15-17'),
(65, 111, 8, NULL, 'Meeting', '13-15'),
(66, 112, 8, NULL, 'Meeting', '13-15'),
(67, 113, 7, NULL, 'Researching', '10-12'),
(68, 114, 7, NULL, 'Researching', '10-12'),
(69, 115, 8, NULL, 'Researching', '8-10'),
(70, 116, 8, NULL, 'Studying', '10-12'),
(71, 117, 10, NULL, 'Studying', '15-17'),
(72, 118, 6, NULL, 'Researching', '15-17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(60) DEFAULT NULL,
  `role_id` enum('1','2','3') NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `role_id`, `name`) VALUES
(1, 'student1', 'student1@example.com', '$2b$10$ZebCWqdhnz1eTeJISg2OmuIlJaZuqNeyZJBN/vPJECmoLOAroVVla', '1', 'Student One'),
(2, 'student2', 'student2@example.com', '$2b$10$vcPBdjdoSIvG/jQmu1ZbHuXGhjLVYzOLSVTF1TxKv2.ojUsLwT79W', '1', 'Student Two'),
(3, 'student3', 'student3@example.com', '$2b$10$6nu9YCugbyD/CXgl72jVcOk3u6nOP65SrQMGaDottaKJ/93LwzrzK', '1', 'Student Three'),
(4, 'staff1', 'staff1@example.com', '$2b$10$jVsR4ebJSPi7BYZ0pveFauibm2W/j/p2/Gvll.TqBQgVQlbXXj0mu', '2', 'Staff One'),
(5, 'staff2', 'staff2@example.com', '$2b$10$pAFZNYd4XgGoosBZPQR7FekfbcPl70nHRKM4Mr.8iDdKZ.BYSxDKq', '2', 'Staff Two'),
(6, 'staff3', 'staff3@example.com', '$2b$10$Q2oCviLD7G/hWb9IttcX.uR7d2GkXAEWFMHO/5dJAcg5tqNlppfE.', '2', 'Staff Three'),
(7, 'lecturer1', 'lecturer1@example.com', '$2b$10$vE//TJoXP8MZ09XhaeUcbu12lJJZUTX3E1uqeuBnihvhF3dO67rsa', '3', 'Lecturer One'),
(8, 'lecturer2', 'lecturer2@example.com', '$2b$10$b2hVug0jl9h0eplM2lTPWOg11du.Z7fv06LtBu.8cDOqz6X3OphAq', '3', 'Lecturer Two'),
(9, 'lecturer3', 'lecturer3@example.com', '$2b$10$rDEZE.WokRL4IUre/h8.fO1r6aPngFE.szv.5lgPttp1YkDlGwn5m', '3', 'Lecturer Three'),
(14, 'sai3', 'sai@gmail.com', '$2b$10$JAXeBrsUSEdvtyBGdzvgw.FOOV8symu271ms4UcSUcmnTgCRF5URy', '1', 'sai'),
(15, 'sai22', 'sai@gmail.com', '$2b$10$GRgjR0qt.FOEvNgzQHOEteGUtioh.HSzkDDJ0VZGh49Xqi6lo0X4C', '1', 'sai laung kham'),
(16, 'sai3', 'sai@gmail.com', '$2b$10$lhrnxhckhpTwJ0HdAsu0DORxTJJGQDqwoiHznyktlagDjojYbh2QO', '1', '123'),
(17, 'sai5', 'sai@gmail.com', '$2b$10$GG7U.c0Kixt7FYFo7nlcGOpyos6fEKsMDUTgmwy9oeHTCz/YKPs.C', '1', 'sai'),
(18, 'sai6', 'sai@gmail.com', '$2b$10$GTty8V67WvxpIEET8Iy6rubf7XpZtfQlhFzitgbBpcc.iZ8ov0y6C', '1', 'sai');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `room_booking`
--
ALTER TABLE `room_booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `room_booking_detail`
--
ALTER TABLE `room_booking_detail`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `confirmed_by_lecturer_id` (`confirmed_by_lecturer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `room_booking`
--
ALTER TABLE `room_booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `room_booking_detail`
--
ALTER TABLE `room_booking_detail`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `room_booking`
--
ALTER TABLE `room_booking`
  ADD CONSTRAINT `room_booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_room_booking_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`);
--
-- Constraints for table `room_booking_detail`
--
ALTER TABLE `room_booking_detail`
  ADD CONSTRAINT `room_booking_detail_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `room_booking` (`booking_id`),
  ADD CONSTRAINT `room_booking_detail_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  ADD CONSTRAINT `room_booking_detail_ibfk_3` FOREIGN KEY (`confirmed_by_lecturer_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- stu-1  asdf123lmn$$
-- stu-2  bciue6672uwe
-- stu-3  pjvuei00954z

-- stf-1  ybciwwow3tkn  
-- stf-2  bfuws84twj94
-- stf-3  uhgo4wpojwp3

-- lec-1  uepej344bjee
-- lec-2  eune56ljnklk
-- lec-3  bvuew4nwhe3i

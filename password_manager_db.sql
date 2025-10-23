-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2025 at 01:15 PM
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
-- Database: `password_manager_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `password_vault`
--

CREATE TABLE `password_vault` (
  `VaultID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `WebsiteName` varchar(255) NOT NULL,
  `WebsiteURL` varchar(255) DEFAULT NULL,
  `Username` varchar(255) NOT NULL,
  `EncryptedPassword` text NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_vault`
--

INSERT INTO `password_vault` (`VaultID`, `UserID`, `WebsiteName`, `WebsiteURL`, `Username`, `EncryptedPassword`, `CreatedAt`) VALUES
(1, 13, 'string', 'string', 'string', 'c3RyaW5n', '2025-10-23 09:15:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Email`, `PasswordHash`, `CreatedAt`) VALUES
(2, 'string1', '$2a$11$4acglVylSpqgOwSll/Mk0OAJJ1TA40rqz9oNhXysEsDLm.faGTrMG', '2025-10-07 09:49:51'),
(3, 'string2', '$2a$11$mm3ngYpJGDqY1spiK5c.eOGkIm2HgwRe4aMDvbKaGE0gGVGroh.ZW', '2025-10-10 05:58:49'),
(4, 'string4', '$2a$11$8tMvLvb4IWaQdqep3EEetuaPT1oIpVRfW6mJQdfkB4jlO5kjTXuHi', '2025-10-10 07:34:22'),
(5, 'string8', '$2a$11$3t3.z8yj4q7Ki8IBLfwDoOBOGVZMoe0slxj2dweVB7Wb5ZL3UNXV6', '2025-10-13 13:21:42'),
(6, 'string9', '$2a$11$oH.LZ/YQhzcrnJNynkQWxuIF.sYIgyQ2OGwJ.zIOJP0uiNdtOZq0m', '2025-10-13 13:26:09'),
(7, 'string99', '$2a$11$/rltbeMUzJT4uJbA9ub2sOwETCjjH.X/JiO/n.P5alARpd.ivOwXK', '2025-10-15 15:08:54'),
(8, 'string10', '$2a$11$DhryHywIm4IVAQ2LEFzvWuKj.2AR6xk.PDGyP8pixqahtpwf065qC', '2025-10-20 05:58:27'),
(9, 'string@string.com', '$2a$11$2yia0h62Mfe8gqLLkkm6QuNLVF9Wcyd7q0dL6edDfKAy.UTn/ge1K', '2025-10-20 07:05:50'),
(10, 'string123@string.com', '$2a$11$Ori1.6nV5eeCcRE6esIkXe6ziqPjPLVLTaBu9zplJTrZR0Fu/0sMq', '2025-10-20 07:09:35'),
(11, 'string10@gmail.com', '$2a$11$caqKdoXslXjtf5UxmnHtiubBZ7lIE/XAbbfJc7PUm2I5KZkJUeFOu', '2025-10-21 08:52:26'),
(12, 'string1234@gmail.com', '$2a$11$/fefzlte2u3i2XoKe6zNUeYdO5AmrjP1W14sCHlnzyTMXhATn.m8m', '2025-10-21 09:52:11'),
(13, 'string', '$2a$11$QWlFQIpsXVDqBe2tZM2Gsemh9DsYtIZ75lqI1YQrwJQlg2OZ45bu6', '2025-10-21 11:04:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `password_vault`
--
ALTER TABLE `password_vault`
  ADD PRIMARY KEY (`VaultID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `password_vault`
--
ALTER TABLE `password_vault`
  MODIFY `VaultID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `password_vault`
--
ALTER TABLE `password_vault`
  ADD CONSTRAINT `password_vault_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

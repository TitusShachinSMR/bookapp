-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: localhost    Database: my_book_app_dev
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addedtocart`
--

DROP TABLE IF EXISTS `addedtocart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addedtocart` (
  `userid` int DEFAULT NULL,
  `bookid` int DEFAULT NULL,
  UNIQUE KEY `userid` (`userid`,`bookid`),
  KEY `bookid` (`bookid`),
  CONSTRAINT `addedtocart_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`),
  CONSTRAINT `addedtocart_ibfk_2` FOREIGN KEY (`bookid`) REFERENCES `books` (`bookid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addedtocart`
--

LOCK TABLES `addedtocart` WRITE;
/*!40000 ALTER TABLE `addedtocart` DISABLE KEYS */;
INSERT INTO `addedtocart` VALUES (1,5),(1,13),(2,5),(2,8);
/*!40000 ALTER TABLE `addedtocart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badgesforusers`
--

DROP TABLE IF EXISTS `badgesforusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `badgesforusers` (
  `userid` int DEFAULT NULL,
  `batchid` int DEFAULT NULL,
  UNIQUE KEY `userid` (`userid`,`batchid`),
  KEY `batchid` (`batchid`),
  CONSTRAINT `badgesforusers_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`),
  CONSTRAINT `badgesforusers_ibfk_2` FOREIGN KEY (`batchid`) REFERENCES `badgesinfo` (`batchid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badgesforusers`
--

LOCK TABLES `badgesforusers` WRITE;
/*!40000 ALTER TABLE `badgesforusers` DISABLE KEYS */;
INSERT INTO `badgesforusers` VALUES (1,1),(1,11),(2,1),(2,6),(2,7),(2,11),(4,11),(12,11);
/*!40000 ALTER TABLE `badgesforusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badgesinfo`
--

DROP TABLE IF EXISTS `badgesinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `badgesinfo` (
  `batchid` int NOT NULL AUTO_INCREMENT,
  `batchname` varchar(255) DEFAULT NULL,
  `batchcriteria` text,
  `category` varchar(255) DEFAULT NULL,
  `requirement` int DEFAULT NULL,
  PRIMARY KEY (`batchid`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badgesinfo`
--

LOCK TABLES `badgesinfo` WRITE;
/*!40000 ALTER TABLE `badgesinfo` DISABLE KEYS */;
INSERT INTO `badgesinfo` VALUES (1,'Like Rookie','Congratulations, you received 10 likes','likes',10),(2,'Like Enthusiast','Congratulations, you received 50 likes','likes',50),(3,'Like Pro','Congratulations, you received 100 likes','likes',100),(4,'Like Master','Congratulations, you received 500 likes','likes',500),(5,'Like Legend','Congratulations, you received 1000 likes','likes',1000),(6,'First Uploader','Congratulations, you uploaded your first book','uploads',1),(7,'Frequent Uploader','Congratulations, you uploaded 5 books','uploads',5),(8,'Pro Uploader','Congratulations, you uploaded 10 books','uploads',10),(9,'Master Uploader','Congratulations, you uploaded 25 books','uploads',25),(10,'Upload Champion','Congratulations, you uploaded 50 books','uploads',50),(11,'First Reviewer','Congratulations, you wrote your first review','review',1),(12,'Review Enthusiast','Congratulations, you wrote 10 reviews','review',10),(13,'Review Expert','Congratulations, you wrote 25 reviews','review',25),(14,'Review Master','Congratulations, you wrote 50 reviews','review',50),(15,'Review Legend','Congratulations, you wrote 100 reviews','review',100);
/*!40000 ALTER TABLE `badgesinfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookmarkedbooks`
--

DROP TABLE IF EXISTS `bookmarkedbooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookmarkedbooks` (
  `bookmarkid` int NOT NULL AUTO_INCREMENT,
  `userid` int DEFAULT NULL,
  `bookid` int DEFAULT NULL,
  PRIMARY KEY (`bookmarkid`),
  UNIQUE KEY `bookid` (`bookid`,`userid`),
  KEY `userid` (`userid`),
  CONSTRAINT `bookmarkedbooks_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`),
  CONSTRAINT `bookmarkedbooks_ibfk_2` FOREIGN KEY (`bookid`) REFERENCES `books` (`bookid`)
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarkedbooks`
--

LOCK TABLES `bookmarkedbooks` WRITE;
/*!40000 ALTER TABLE `bookmarkedbooks` DISABLE KEYS */;
INSERT INTO `bookmarkedbooks` VALUES (17,1,5),(19,4,5),(164,1,11),(160,12,11),(153,12,20);
/*!40000 ALTER TABLE `bookmarkedbooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `bookid` int NOT NULL AUTO_INCREMENT,
  `userid` int DEFAULT NULL,
  `genre` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `bookname` varchar(255) DEFAULT NULL,
  `description` text,
  `coverpath` varchar(255) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`bookid`),
  UNIQUE KEY `isbn_unique` (`isbn`),
  KEY `userid` (`userid`),
  CONSTRAINT `books_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (11,4,'Adventure Fiction','Herman Melville','Moby-Dick',' A tale of obsession and revenge, \"Moby-Dick\" follows Captain Ahab\'s relentless pursuit of the elusive white whale, exploring themes of fate, free will, and the nature of evil.\r\n','../coverimages/Moby-Dick.4.jpg','9781721911042',213.50),(12,4,'Dystopian Fiction','Lois Lowry','The Giver',' \"The Giver\" is a dystopian novel published in 1993. It tells the story of Jonas, a young boy who lives in a highly controlled society where emotions and memories are suppressed. Jonas is chosen to be the Receiver of Memories, a role where he begins to understand the true depth of human experience beyond the controlled existence he has known. The novel explores themes of freedom, individuality, and the consequences of a utopian society.','../coverimages/The Giver.4.jpg','9780821924068',406.56),(13,2,'Fantasy','J.K. Rowling','Harry Potter and the Philosopher\'s Stone','It introduces young Harry Potter, a boy who discovers on his eleventh birthday that he is the orphaned son of two powerful wizards and has unique magical powers of his own. He is summoned from his life as an unwanted child to become a student at Hogwarts, an English boarding school for wizards. There, he meets several friends who become his closest allies and help him discover the truth about his parents\' mysterious deaths','../coverimages/Harry Potter and the Philosopher\'s Stone.2.jpg','9788831004169',700.00),(17,2,'Fantasy','J.K. Rowling','Harry Potter and the Chamber of Secrets','Harry Potter and the Chamber of Secrets\" is the second book in the Harry Potter series by J.K. Rowling. In this installment, Harry returns to Hogwarts School of Witchcraft and Wizardry for his second year. However, he soon finds himself facing a new set of challenges. The Chamber of Secrets has been opened, and a monster is attacking students at the school. With the help of his friends Ron Weasley and Hermione Granger, Harry must uncover the truth behind the legend of the Chamber of Secrets, confront the heir of Slytherin, and save the school from the dark forces that threaten it','../coverimages/Harry Potter and the Chamber of Secrets.2.jpg','9788000011622',800.00),(18,2,'Fantasy','Patrick Rothfuss','The Name of the Wind','\"The Name of the Wind\" is the first book in the Kingkiller Chronicle series by Patrick Rothfuss. This fantasy novel introduces readers to Kvothe, a magically gifted young man who grows up to become a legendary figure. The story is framed as Kvothe recounts his life story to a chronicler, detailing his experiences as a child prodigy, an orphaned survivor, and a student at a prestigious university. The narrative weaves together themes of magic, music, and survival as Kvothe navigates a world filled with danger, intrigue, and wonder. Rothfuss\'s rich prose and intricate world-building have earned \"The Name of the Wind\" acclaim as a modern fantasy classic.','../coverimages/The Name of the Wind.2.jpg','9782352942832',450.76);
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boughtbooks`
--

DROP TABLE IF EXISTS `boughtbooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boughtbooks` (
  `userid` int DEFAULT NULL,
  `bookid` int DEFAULT NULL,
  UNIQUE KEY `userid` (`userid`,`bookid`),
  KEY `bookid` (`bookid`),
  CONSTRAINT `boughtbooks_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`),
  CONSTRAINT `boughtbooks_ibfk_2` FOREIGN KEY (`bookid`) REFERENCES `books` (`bookid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boughtbooks`
--

LOCK TABLES `boughtbooks` WRITE;
/*!40000 ALTER TABLE `boughtbooks` DISABLE KEYS */;
INSERT INTO `boughtbooks` VALUES (1,11),(1,17),(2,11),(2,12),(2,17),(12,11),(12,12),(12,13),(12,17),(12,18);
/*!40000 ALTER TABLE `boughtbooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commentsandratings`
--

DROP TABLE IF EXISTS `commentsandratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commentsandratings` (
  `CommentID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `BookID` int DEFAULT NULL,
  `Comments` text,
  `Ratings` int DEFAULT NULL,
  `Likes` int DEFAULT '0',
  `Dislikes` int DEFAULT '0',
  `username` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CommentID`),
  UNIQUE KEY `UserID` (`UserID`,`BookID`),
  KEY `BookID` (`BookID`),
  CONSTRAINT `commentsandratings_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`id`),
  CONSTRAINT `commentsandratings_ibfk_2` FOREIGN KEY (`BookID`) REFERENCES `books` (`bookid`),
  CONSTRAINT `commentsandratings_chk_1` CHECK ((`Ratings` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commentsandratings`
--

LOCK TABLES `commentsandratings` WRITE;
/*!40000 ALTER TABLE `commentsandratings` DISABLE KEYS */;
INSERT INTO `commentsandratings` VALUES (4,NULL,NULL,NULL,NULL,0,0,NULL,'2024-07-11 13:59:38'),(5,NULL,NULL,NULL,NULL,0,0,NULL,'2024-07-11 13:59:38'),(6,NULL,NULL,NULL,NULL,0,0,NULL,'2024-07-11 13:59:38'),(7,NULL,NULL,NULL,NULL,0,0,NULL,'2024-07-11 13:59:38'),(8,NULL,NULL,NULL,NULL,0,0,NULL,'2024-07-11 13:59:38'),(111,2,18,' really awesome',3,1,1,'Trex','2024-07-17 11:39:47'),(117,2,13,'never underestimate',3,0,0,'Trex','2024-07-21 17:57:16'),(118,2,17,'never underestimate',3,0,1,'Trex','2024-07-21 17:57:30'),(120,2,12,' mind blowing',3,1,0,'Trex','2024-07-21 17:59:32'),(127,2,11,'good better best , awesome',4,0,1,'Trex','2024-07-27 07:17:56'),(132,12,11,'such a fantastic book',3,0,1,'tsr','2024-07-26 11:10:06'),(143,4,18,' it is really good book',3,0,0,'brad','2024-07-27 07:46:23'),(146,1,11,' it is really a awesome book',4,0,0,'jaya','2024-07-27 18:54:25');
/*!40000 ALTER TABLE `commentsandratings` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_update_commentsandratings` BEFORE UPDATE ON `commentsandratings` FOR EACH ROW BEGIN
    IF NEW.Comments <> OLD.Comments OR NEW.Ratings <> OLD.Ratings OR NEW.CommentID <> OLD.CommentID THEN
        SET NEW.updated_at = NOW();
    ELSE
        SET NEW.updated_at = OLD.updated_at;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `followers`
--

DROP TABLE IF EXISTS `followers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `followers` (
  `followerid` int DEFAULT NULL,
  `followingid` int DEFAULT NULL,
  UNIQUE KEY `followerid` (`followerid`,`followingid`),
  KEY `followingid` (`followingid`),
  CONSTRAINT `followers_ibfk_1` FOREIGN KEY (`followerid`) REFERENCES `users` (`id`),
  CONSTRAINT `followers_ibfk_2` FOREIGN KEY (`followingid`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `followers`
--

LOCK TABLES `followers` WRITE;
/*!40000 ALTER TABLE `followers` DISABLE KEYS */;
INSERT INTO `followers` VALUES (1,NULL),(1,NULL),(1,NULL),(1,NULL),(1,2),(1,4),(2,1),(2,4),(2,12),(4,2),(4,3),(12,2);
/*!40000 ALTER TABLE `followers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likesverify`
--

DROP TABLE IF EXISTS `likesverify`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likesverify` (
  `commentid` int DEFAULT NULL,
  `userid` int DEFAULT NULL,
  `likes` tinyint(1) DEFAULT NULL,
  UNIQUE KEY `commentid` (`commentid`,`userid`),
  KEY `userid` (`userid`),
  CONSTRAINT `likesverify_ibfk_1` FOREIGN KEY (`commentid`) REFERENCES `commentsandratings` (`CommentID`),
  CONSTRAINT `likesverify_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likesverify`
--

LOCK TABLES `likesverify` WRITE;
/*!40000 ALTER TABLE `likesverify` DISABLE KEYS */;
INSERT INTO `likesverify` VALUES (79,2,0),(95,2,0),(90,4,1),(91,2,1),(96,2,1),(90,2,1),(109,2,1),(111,1,0),(127,12,0),(111,12,1),(132,12,0),(120,12,1),(118,1,0);
/*!40000 ALTER TABLE `likesverify` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20240702042805-create-user.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `bio` text,
  `profilepath` varchar(255) DEFAULT '../stylingimages/user_6994618.png',
  `followerscount` int DEFAULT '0',
  `followingcount` int DEFAULT '0',
  `upload` int DEFAULT (0),
  `reviewcount` int DEFAULT (0),
  `score` int DEFAULT (0),
  `totallikes` int DEFAULT '0',
  `googleId` varchar(255) DEFAULT NULL,
  `googleDisplayName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'jaya','cjaya071@gmail.com','$2a$10$fql6UEdvcP99pjPFDYoI0./SmbDIKfYZquuqagrHKLnZVXQn252Sy','user','2024-07-02 05:17:26','2024-07-13 16:33:41','i am c jaya','../profilepicture/cjaya071@gmail.com.profile.jpg',1,2,0,1,6,10,'110504214665934827086',NULL),(2,'Trex','titusshachin@gmail.com','$2a$10$so2hTKVfbz/K8zeLWqwHfue6Pf/349QMS.P7stsTh3bKs0Pzyj3UO','user','2024-07-02 07:04:20','2024-07-02 07:04:20','Rex.Jr❤️\n18\nNIT-T (23-27)\nNever change\nto be accepted\nby other\nSTAY WEIRD','../profilepicture/titusshachin@gmail.com.profile.jpg',3,3,3,5,367,17,'102005907794693968958',NULL),(3,'willsmith','willsmith@gmail.com','$2a$10$le9sakya47YPVEu7ZxjJxeeA1eXJWp92csn92aj5t3skXlKG16ey2','user','2024-07-02 10:05:01','2024-07-02 10:05:01',NULL,'../stylingimages/user_6994618.png',1,0,0,0,0,0,NULL,NULL),(4,'brad','brad@gmail.com','$2a$10$hQH9LfDtZYShMxIq55dfLupByjGDxsC/vs9Ja5DqO3AyVSny.gz5y','user','2024-07-02 10:06:41','2024-07-02 10:06:41','hi i am brad\ni have great interest in \nbook reading\ni am genius','../profilepicture/brad@gmail.com.profile.jpg',2,2,2,1,37,1,NULL,NULL),(5,'durden','durden@gmail.com','$2a$10$Ilt.3Gxf/Pw3l/dV83ai7Orea7oLkiMJghtpEb5dPhrRgN7IMXk8G','user','2024-07-02 10:08:17','2024-07-02 10:08:17',NULL,'../stylingimages/user_6994618.png',0,0,0,0,0,0,NULL,NULL),(12,'tsr','titusshachinunofficial@gmail.com',NULL,NULL,'2024-07-24 13:45:31','2024-07-24 13:45:31','passion in reading books\n','../profilepicture/titusshachinunofficial@gmail.com.profile.jpg',1,1,0,2,28,1,'113985708751120784080',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-28 21:38:06

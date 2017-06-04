-- MySQL Script generated by MySQL Workbench
-- 06/04/17 16:20:36
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema analyzer
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema analyzer
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `analyzer` DEFAULT CHARACTER SET utf8 ;
USE `analyzer` ;

-- -----------------------------------------------------
-- Table `analyzer`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `analyzer`.`user` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `password` VARCHAR(100) NOT NULL,
  `username` VARCHAR(24) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `analyzer`.`scrap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `analyzer`.`scrap` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(256) NOT NULL,
  `id_user` INT UNSIGNED NULL DEFAULT NULL,
  `con_length` INT(6) NULL DEFAULT NULL,
  `con_type` VARCHAR(48) NULL DEFAULT NULL,
  `server` VARCHAR(48) NULL DEFAULT NULL,
  `title` VARCHAR(256) NULL DEFAULT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `charset` VARCHAR(24) NULL DEFAULT NULL,
  `private` TINYINT(1) NULL DEFAULT 0,
  `http_status` INT(4) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `scrap_user_idx` (`id_user` ASC),
  CONSTRAINT `scrap_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `analyzer`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `analyzer`.`headers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `analyzer`.`headers` (
  `id_scrap` INT UNSIGNED NOT NULL,
  `head_text` VARCHAR(128) NOT NULL,
  `head_value` INT(2) NOT NULL,
  `head_order` INT(4) NOT NULL,
  INDEX `headers_scrap_idx` (`id_scrap` ASC),
  CONSTRAINT `headers_scrap`
    FOREIGN KEY (`id_scrap`)
    REFERENCES `analyzer`.`scrap` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `analyzer`.`logins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `analyzer`.`logins` (
  `id_user` INT UNSIGNED NOT NULL,
  `ip` VARCHAR(48) NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  CONSTRAINT `id_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `analyzer`.`user` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

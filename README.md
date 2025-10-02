# Edusense Project

This project is a smart attendance management system designed to streamline student attendance tracking. It integrates
an RFID-based identification system with a modern web platform to ensure accuracy and ease of use.

`Backend`: Built with `Laravel`, providing secure APIs, data management, and business logic.

`Frontend`: Developed in `React`, offering an intuitive and responsive admin panel for managing students, classes, and
attendance records.

`IoT Layer`: Powered by `Python`, running on RFID-enabled devices to capture student card data and send it directly to
the system in real-time.

The system allows administrators and teachers to efficiently manage attendance records while reducing manual errors and
improving reliability through automation.

<h2 align="center">Technologies Used</h2>
<p align="center">
  <a href="https://laravel.com/"><img src="https://img.shields.io/badge/Laravel-FF2D20.svg?&style=flat-square&logo=Laravel&logoColor=white"/></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React_JS-61DAFB.svg?&style=flat-square&logo=React&logoColor=black"/></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3776AB.svg?&style=flat-square&logo=Python&logoColor=white"/></a>
</p>

## How to run this project

### Backend (Laravel)
 - After cloning this repository, run `composer install` to install the dependencies.
 - Create a `.env` file and set the environment variables as per `.env.example`.
 - Run `php artisan migrate` to create the database tables.
 - Run `php artisan db:seed` to seed the database with sample data.
 - Run `php artisan serve` to start the server.

### Frontend (React)
 - After cloning this repository, run `yarn install` to install the dependencies.
 - Run `yarn start` to start the development server.

 - Open `http://localhost:3000/` in your browser.
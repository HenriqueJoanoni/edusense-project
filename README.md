# Edusense Project 

## Table of Contents
1. [Introduction](#introduction) 
2. [Hardware](#iot-layer)
3. [Data, Data Storage, and Data Processing](#data-storage-processing)
4. [Security and Privacy](#security-and-privacy)
5. [The UI, User, and Testing](#the-user-ui-and-testing)


## Introduction
This project is a smart attendance management system designed to streamline student attendance tracking. It integrates
a barcode-based identification system with a modern web platform to ensure accuracy and ease of use.

`Backend`: Built with `Laravel`, providing secure APIs, data management, and business logic.

`Frontend`: Developed in `React`, offering an intuitive and responsive admin panel for managing students, classes, and
attendance records.

`IoT Layer`: Powered by `Python`, running on barcode-enabled scanning device to capture student card data and send it directly to
the system in real-time.

The system allows administrators and teachers to efficiently manage attendance records while reducing manual errors and
improving reliability through automation.

<h2 align="center">Technologies Used</h2>
<p align="center">
  <a href="https://laravel.com/"><img src="https://img.shields.io/badge/Laravel-FF2D20.svg?&style=flat-square&logo=Laravel&logoColor=white"/></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React_JS-61DAFB.svg?&style=flat-square&logo=React&logoColor=black"/></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3776AB.svg?&style=flat-square&logo=Python&logoColor=white"/></a>
  <a href="https://www.raspberrypi.com/"><img src="https://img.shields.io/badge/-Raspberry_Pi-C51A4A?style=flat-square&logo=Raspberry-Pi"/></a>
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


## IoT Layer 
### Hardware List:
- 1x Raspberry Pi 5
- 1x Buzzer
- 1x Red LED
- 1x Green LED
- 2x 330Ω Resistors
- 1x BreadBoard
- 1x 10K Potentiometer
- 1x 16x2 LCD Display (HD44780 compatible)
- 1x Barcode Scanner Module (e.g., ATOMIC 2D Barcode Scanner Module)
- Jumper Wires
- Power Supply for Raspberry Pi
- MicroSD Card with Raspberry Pi OS installed
- Ethernet Cable (for internet connection)

### Hardware Connections:
| Component           | Pin / Interface           | Raspberry Pi 5 (BCM / physical) | Notes                                                                                                   |
|---------------------|---------------------------|---------------------------------|---------------------------------------------------------------------------------------------------------|
| LCD pin 1 (GND)     | GND                       | Any Pi ground rail              | -                                                                                                       |
| LCD pin 2 (VCC / 5V)| +5V rail                  | Physical Pin 2 or 4             | The LCD backlight needs 5V                                                                              |
| LCD pin 3 (V0)      | Potentiometer middle      | -                               | contrast adjust                                                                                         |
| LCD RS              | GPIO4                     | BCM 4 / Physical 7              | -                                                                                                       |
| LCD EN              | GPIO24                    | BCM 24 / Physical 18            | -                                                                                                       |
| LCD D4              | GPIO23                    | BCM 23 / Physical 16            | -                                                                                                       |
| LCD D5              | GPIO17                    | BCM 17 / Physical 11            | -                                                                                                       |
| LCD D6              | GPIO18                    | BCM 18 / Physical 12            | -                                                                                                       |
| LCD D7              | GPIO22                    | BCM 22 / Physical 15            | -                                                                                                       |
| LCD LED+            | +5V rail                  | -                               | backlight                                                                                               |
| LCD LED–            | GND                       | -                               | backlight ground                                                                                        |
| Red LED (external)  | GPIO5                     | BCM 5 / Physical 29             | through resistor (e.g. 220 Ω) to LED                                                                    |
| Green LED (external)| GPIO6                     | BCM 6 / Physical 31             | through resistor                                                                                        |
| External Buzzer     | GPIO13                    | BCM 13 / Physical 33            | if used, or skip if scanner's internal buzzer suffices                                                  |
| Scanner VCC         | 5V or 3.3V (check spec)   | e.g. 5V rail                    | Many modules use 3.3V TTL, but the ATOMIC base spec suggests 5V supply possible. Botland Electronics +1 |
| Scanner GND         | GND                       | ground rail                     | common ground                                                                                           |
| Scanner TX → Pi RX  | Pi GPIO15 (UART RX, BCM 15) | Physical Pin 10                 | connect scanner TX to Pi RX                                                                             |
| Scanner RX → Pi TX  | Pi GPIO14 (UART TX, BCM 14) | Physical Pin 8                  | connect scanner RX to Pi TX                                                                             |

- Raspberry Pi 5 will be connected to the internet via Ethernet
- Raspberry Pi will be powered using the official 27w power adapter


### Fritzing Diagram
![Wiring diagram](./media/barcode_attendance_diagram.png)


## Security and Privacy
The security of the device will start with its protective case. This will prevent physical interference with the device.

Data will be sent between the Raspberry Pi and PubNub, and the AWS server that has been encrypted with appropriate standards to ensure network privacy. 
Data transfers to PubNub will be encrypted using PubNub's generated sets of keys.

Secure practices will also be enforced at the server level. All user input will be validated at the server before being acted on.
This is to protect against:
- Incomplete information entering the system.
- SQL Injection attacks.
- Crashes occuring from unexpected inputs.

### Passwords:
All user passwords will be hashed prior to storage and comparison.

### Access:
Users will be logged in through tokens, then these tokens will be used to control users' access level and permissions, with deny by default being the standard.



## The User, UI, and testing
### Who is the device for?
This device is designed to be used by:
- Teachers
- Students
- School Administrators

Students will connect to the system through the scanner, by scanning their ID card, and their face to sign in. 
They will be able to access their own personal and attendance data through the online portal.
![Students can view their personal data, attendance info, and class info.](./media/profile_page.png)



Teachers will be able to access the attendance data their classes and students within their classes, and student profiles.
Clicking on any student row will redirect a teacher to that student's page.
![Teacher View](./media/teacher_view.png)


Administrators will have access to all student profiles, class information, and attendance data. They will be the users able to edit and create class information and enrollment.
![Teacher View](./media/admin_view.png)


# Testing and success
The success of the project can be determined by how effectively it scans and records attendance, and how quickly it achieves this.
The scanner will need to be robust enough to work in a variety of brightness levels, positions, and with a wide sample of students of different features / complexions / accessories (such as glasses).

The project will be considered successful if
- The scanner is able to effectively scan and record students quickly and accurately.
- This data is easily accessible to teachers, students, and administrators and presented in an intuitive way.
- The system takes less time than traditional attendance methods.
- Users are able to use the system with minimal confusion.







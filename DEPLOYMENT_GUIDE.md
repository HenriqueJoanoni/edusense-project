# Deployment Guide for Edusense Project

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [AWS EC2 Setup](#aws-ec2-setup)
   - Launching an EC2 Instance
   - Configuring Security Group
   - Connecting to the EC2 Instance
4. [Installing LAMP Stack](#installing-lamp-stack)
   - Installing Apache
   - Installing MySQL
   - Installing PHP
5. [Deploying Edusense](#deploying-edusense)
   - Cloning the Repository
   - Configuring Apache
   - Setting up MySQL Database
6. [SSL Configuration](#ssl-configuration)
   - Installing Certbot
   - Obtaining SSL Certificate
   - Troubleshooting SSL Issues
7. [Testing the Deployment](#testing-the-deployment)
8. [Conclusion](#conclusion)

## 1. Introduction
This guide provides comprehensive steps to deploy the Edusense project on an AWS EC2 instance using the LAMP stack.

## 2. Prerequisites
- An AWS account
- Basic knowledge of command line operations
- Access to the domain to obtain SSL certificates

## 3. AWS EC2 Setup
### Launching an EC2 Instance
- Choose an Amazon Machine Image (AMI) that supports the LAMP stack (e.g., Ubuntu or Amazon Linux).
- Select an instance type (t2.micro is recommended for testing).
- Configure instance settings and launch.

### Configuring Security Group
- Open ports 80 (HTTP) and 443 (HTTPS) for web traffic.
- Open port 22 for SSH access.

### Connecting to the EC2 Instance
- Use SSH to connect to the instance.

## 4. Installing LAMP Stack
### Installing Apache
```bash
sudo apt update
sudo apt install apache2 -y
```

### Installing MySQL
```bash
sudo apt install mysql-server -y
```
### Installing PHP
```bash
sudo apt install php libapache2-mod-php php-mysql -y
```

## 5. Deploying Edusense
### Cloning the Repository
```bash
git clone https://github.com/HenriqueJoanoni/edusense-project.git
```

### Configuring Apache
- Update the `/etc/apache2/sites-available/000-default.conf` to point to your project directory.

### Setting up MySQL Database
- Create a database and user for Edusense.

## 6. SSL Configuration
### Installing Certbot
```bash
sudo apt install certbot python3-certbot-apache -y
```

### Obtaining SSL Certificate
```bash
sudo certbot --apache
```

### Troubleshooting SSL Issues
- Common issues and their fixes.

## 7. Testing the Deployment
- Instructions to verify that the deployment is successful.

## 8. Conclusion
- Final thoughts and acknowledgments.
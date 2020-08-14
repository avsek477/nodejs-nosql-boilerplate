# Nodejs NoSql Boilerplate App

## **Installation**
* Install Node.js  if not already installed
    * Recommended Node version: >= v12.16.1, but latest version is always better 
* Download the binary file and follow the steps given in this link 
    * https://github.com/nodejs/help/wiki/Installation
* Setup the redis server 
    * https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04
* Clone the project repository
    * **git clone https://github.com/avsek477/nodejs-nosql-boilerplate.git**
* Go to the cloned project's root directory and install all the dependencies required for Node.js
    * **cd nodejs-nosql-boilerplate - to direct into the cloned project's root directory**
    * **npm install or yarn if installed - for installing the dependencies**
* Copy the env constants into a new file
    * cp .env_sample .env
* Copy the bucket json file in lib/configs/ folder

## **Running Application in Development Environment**

* **After the successful installation of all the required dependencies, run 'npm start' in the root directory.**
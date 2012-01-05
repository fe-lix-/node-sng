# sng

A lightweight launcher for a PHP/Nginx development server

## Why?

To give the possibility to a user without admin privileges to easily launch a PHP development server.

## Requirements?

 * PHP in CGI mode: php-cgi -v must returns php-fcgi in output
 * Nginx server
 
On Ubuntu systems:
    sudo apt-get install nginx-full php5-cgi 

## Install
    npm install sng
    
To install globally in system use:
    npm install sng -g

## Usage
    sng [basedir]

    Options:
      -n, --nginx-base  Default binding NGinx wil be listening on            [default: "127.0.0.1:8000"]
      -p, --php-bind    Default binding address for php-cgi                  [default: "127.0.0.1:9000"]
      -b, --behavior    Changes behavior. Avialable are: "standard", "zend"  [default: "standard"]


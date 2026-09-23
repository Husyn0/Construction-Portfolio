# Construction-Portfolio
This project is portfolio web app for construction like company, where we have admin side front end , backend in addition to the  portfolio frontend

## PHP Server
### setup php backend
```bash
cd  backend
composer install
```
### Start PHP Backend
```bash
cd backend
php -S localhost:8000 index.php
```
## Start frontend
```bash
cd frontend
npm install
npm start
```
## Start Admin frontend
```bash
cd admin-frontend
npm install
npm start
```
## Mysql on CLI 
```bash
sudo  mysql -u mysqluser -p
```
## Update remote origin
```bash
git remote set-url origin https://github.com/Husyn0/Construction-Portfolio.git
```

## python server
### Create and setup virtual environment:
```bash
cd /var/www/analytics-service
python3 -m venv web-fingerprint-analytic
source web-fingerprint-analytic/bin/activate
pip install -r requirements.txt
```
### Start Python Analytics Service
```bash
cd ./analytics-service
source web-fingerprint-analytic/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

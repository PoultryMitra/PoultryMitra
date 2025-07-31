@echo off
echo 🔥 Firebase User Deletion Tool
echo.
echo This will delete ALL 31 users from your Firebase project.
echo Make sure you have placed service-account-key.json in this folder.
echo.
pause
echo.
echo Running deletion script...
node delete-all-users.js
pause

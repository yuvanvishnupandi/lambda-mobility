@echo off
title Lambda Mobility OS - Big Data + Frontend
echo =========================================================================
echo  LAMBDA URBAN MOBILITY OS - BIG DATA & REAL-TIME PLATFORM
echo =========================================================================
echo Starting Big Data Engine and Lambda Command Center...
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py -3.11 start_system.py
) else (
    python start_system.py
)
pause

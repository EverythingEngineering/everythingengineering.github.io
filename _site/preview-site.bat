@echo off
echo Starting EverythingEngineering website preview...
cd /d "%~dp0"

REM Check if Ruby is installed
ruby -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Ruby is not detected. Please install Ruby and try again.
    echo Visit https://jekyllrb.com/docs/installation/windows/
    pause
    exit /b 1
)

echo Installing/Updating dependencies...
call bundle install
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo Starting Jekyll server with LiveReload...
echo The website will be available at http://127.0.0.1:4000
echo.
echo Attempting to open browser...
start "" "http://127.0.0.1:4000"

call bundle exec jekyll serve --livereload
pause

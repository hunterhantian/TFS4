@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "LLAMA_NODE=C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%LLAMA_NODE%" goto run
set "LLAMA_NODE=node"
:run
"%LLAMA_NODE%" "%~dp0batch.mjs" %*
set "LLAMA_EXIT=%ERRORLEVEL%"
echo.
echo Finished with exit code %LLAMA_EXIT%. Check output and summary.json.
pause
exit /b %LLAMA_EXIT%

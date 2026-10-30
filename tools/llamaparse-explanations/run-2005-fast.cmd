@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 2005 only - fast - fr,ch_sim - watermark_handling=remove
echo NOTE: LlamaParse fast ignores watermark removal according to official docs.
call "%~dp0run.cmd" --manifest "%~dp0sources-2005-fast.json" --output "%~dp0output-2005-fast" --only 2005-explanations %*
exit /b %ERRORLEVEL%

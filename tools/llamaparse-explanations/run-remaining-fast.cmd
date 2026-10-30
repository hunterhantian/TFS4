@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Remaining 21 PDFs only - 2005 excluded - 1758 pages
echo fast - fr,ch_sim - watermark_handling=remove
echo NOTE: LlamaParse fast ignores watermark removal according to official docs.
call "%~dp0run.cmd" --manifest "%~dp0sources-remaining-fast.json" --output "%~dp0output-remaining-fast" %*
exit /b %ERRORLEVEL%

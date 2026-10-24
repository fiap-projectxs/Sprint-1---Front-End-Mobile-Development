@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

rem 1) Fecha o servidor antigo (porta 8765), se estiver rodando, para poder recriar o ambiente.
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8765" ^| findstr LISTENING') do taskkill /f /pid %%p >nul 2>&1

rem 2) O ambiente (.venv) precisa de Python 3.9+. O antigo foi criado com 3.8: apaga e recria.
if exist .venv\Scripts\python.exe (
  .venv\Scripts\python.exe -c "import sys;sys.exit(0 if sys.version_info>=(3,9) else 1)" >nul 2>&1
  if errorlevel 1 (
    echo Ambiente antigo com Python velho. Recriando...
    rmdir /s /q .venv
  )
)

rem 3) Cria o ambiente com o melhor Python disponivel (3.12 e 3.11 tem mais pacotes prontos).
if not exist .venv\Scripts\python.exe (
  set PY=
  for %%V in (3.12 3.11 3.13 3.10 3.9 3.14) do (
    if not defined PY (
      py -%%V -c "import sys" >nul 2>&1
      if not errorlevel 1 set PY=%%V
    )
  )
  if not defined PY (
    echo.
    echo ERRO: nao achei Python 3.9 ou mais novo. Instale o 3.12 e rode de novo:
    echo   winget install -e --id Python.Python.3.12
    pause
    exit /b 1
  )
  echo Criando ambiente com Python !PY!...
  py -!PY! -m venv .venv
  if errorlevel 1 ( echo ERRO ao criar o ambiente. & pause & exit /b 1 )
)

rem 4) Instala dependencias e baixa vozes e modelo de reconhecimento (so o que falta).
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python baixar_modelos.py

.venv\Scripts\python -c "import faster_whisper" >nul 2>&1
if errorlevel 1 (
  echo.
  echo AVISO: o reconhecimento offline (Whisper) nao instalou neste Python. As vozes funcionam.
  echo Para ter o microfone offline, instale o Python 3.12 ^(winget install -e --id Python.Python.3.12^), apague a pasta .venv e rode de novo.
  echo.
)

.venv\Scripts\python server.py
pause

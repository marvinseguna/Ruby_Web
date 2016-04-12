@ECHO OFF

ECHO Add 'Moods' service...

PUSHD ..

%CD%\win32\nssm install Moods %JRUBY_HOME%\bin\jruby.exe

%CD%\win32\nssm set Moods AppDirectory %CD%             > NUL

%CD%\win32\nssm set Moods AppParameters app.rb          > NUL

%CD%\win32\nssm set Moods Description Moods Service     > NUL

%CD%\win32\nssm set Moods Start SERVICE_DELAYED_AUTO_START   > NUL

REM Generate Control-C  with Timeout 2500ms
%CD%\win32\nssm set Moods AppStopMethodConsole 2500     > NUL  
   
%CD%\win32\nssm set Moods AppStdout %CD%\tmp\moods.log      > NUL

%CD%\win32\nssm set Moods AppStderr %CD%\tmp\moods.log      > NUL   

%CD%\win32\nssm set Moods AppStdoutCreationDisposition 4   > NUL 

%CD%\win32\nssm set Moods AppStderrCreationDisposition 4   > NUL 

%CD%\win32\nssm set Moods AppRotateFiles 1         > NUL 

%CD%\win32\nssm set Moods AppRotateOnline 1        > NUL 

REM in seconds
%CD%\win32\nssm set Moods AppRotateSeconds 86400   > NUL 

REM in KB
%CD%\win32\nssm set Moods AppRotateBytes 1048576   > NUL 

POPD

PAUSE
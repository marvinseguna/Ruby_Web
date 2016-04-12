Integrating Moods with NSSM
===========================
NSSM ("Non-sucking Service Manager" [http://nssm.cc/] ) is a public domain service manager for Windows. It tries to ensure that processes launched by it are respawned should they die. In addition it can write processes' output into logfiles and manage log rotation, among other things. For details have a look at the NSSM website and the README.txt file bundled in the nssm zip-file.

Installing NSSM
===============

NSSM is distributed as a zipfile which contains binaries for 32- and 64-bit Windows. To install nssm.exe just extract the zip-file and copy the appropriate executable in C:\Moods\win32 folder.
 
Run the batch script to install the service:
	 
	 C:\Moods\win32\install_services.cmd

Basic NSSM usage
================

NSSM commands are pretty self-explanatory: 

	nssm.exe status Moods
	nssm.exe start Moods
	nssm.exe stop Moods
	nssm.exe restart Moods

If you type

	nssm.exe

you will get a list of all options NSSM supports. 
# Runtime Drivers
The Runtime Driver defines the physical environment where the Pink2Web processes are executing.
When starting Pink2Web, one can choose which driver to be loaded, together with a bindings json file
which will map ports of the processes to ports of the driver.

Only one driver can be loaded at a time.

There are 3 runtime drivers planned;
* emulator - webui and commandline controlled environment
* raspi - Raspberry Pi driver, for Model 3 B+ and later.
* colibri-7pi - A Raspberry Pi with a refined I/O system.
* modbus-rtu - communications with modbus devices (PLC4X on Pony?) over RS-485
* modbus-tcp - communications with modbus devices (PLC4X on Pony?) over TCP/IP

Other runtime drivers may be added in the future, and all of the above may not be timely implemented.

## Runtime Driver - "Emulator"
The "emulator" driver is meant for running tests in a PC environment with either a WebUI or 
command line tools driving the changes of the I/O. The following I/O types should be supported,

* digital-in
* digital-out
* analog-in
* analog-out
* counter-in

## Runtime Driver - "raspi"

* gpio-in
* gpio-out
* adc

## Runtime Driver - "colibri-7"
The Colibri system is a light-weight system for interfacing with the real world over standard physical
interfaces, such as 0-20mA, 0-10V and Pt1000 sensors. The Pink2Web runtime driver for Colibri supports
the "Colibri-7" controller, which is based on Raspberry Pi Compute Module 4 (CM4). There are other Colibri
controllers, but they are using much more constrained microcontrollers and not (yet) capable of running Pink2Web.

* colibri-aic
* colibri-aiv
* colibri-aqv
* colibri-diu
* colibri-dii
* colibri-fet
* colibri-pid1
* colibri-pt1000
* colibri-ssr
* colibri-triac1

## Runtime Driver - "modbus-rtu"
Modbus/RTU is a ubiquitous protocol/eco-system with its roots in the 1970s. It uses RS-485 differential, half-duplex
communications at speeds up to 1Mbps, although 9600 to 115200bps are almost always used. On each cable segment
there is a single master. The addressing allows for up to 247, but physical/electrical limits on the transceiver
may bring that number down to 30 (minimum that must be supported). 

## Runtime Driver - "modbus-rtu"
There is also a Modbus/TCP standard, which doesn't have the limitations of modbus-rtu. Instead it wraps the serial
communication in an insecure TCP connection. See "modbus-tcp".

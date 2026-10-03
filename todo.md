# Things to do before 1.0

* New name
  * Dokkas (outside Gällivare)
  * Flowty
  * Angdala/Pilvalla/Torsnas

* Export/Import Process to allow programs to be copied from one to another place. (GitHub integration?)

* Show Link values in real-time in Web UI.

* Undo/Redo

* Save programs that are altered over the websocket.

* Timeseries capture and storage, preferably on every Linkable. RRDtool?

* Alarm system. State machine and Alarm Log.

* Sending alarms.

* Authentication/Authorization

* Make a Group (addgroup, addinport, addoutport), make group into a new component, save/share.

## How the IO/Environment system should work

1. Each Environment runs as a separate Pink2Web Process, i.e. Graph
1. Each Environment can have both hardcoded (can't be added/removed seprately) and user-added logic is possible.
1. User defines In-ports and Out-ports to bind Environment process to other processes.
1. Ports can be grouped and groups can be started/stopped. This allows the user to easily swap out part of the physical
   environment and enable the emulator when testing something.


## BlockTypes Library
The following block types are needed

* Math
  * Add4
  * Subtract4
  * Multiply4
  * Divide
  * Nand4
  * And4
  * Or4
  * Nor4
  * Xor4
  * Not
  * Max4 (1)
  * Min4 (1)
  * Absolute (1)
  * Sine
  * Cosine
  * Tangent
  * ArcSine
  * ArcCosine
  * ArcTangent
  * Ln
  * Log10
  * Log2
  * Exp
  * ^
  * Pi
  * Tau
  * e
  * Random (1)

* Timing/
  * Clock
  * Timer
  * Delay (1)
  * DailySchedule
  * WeekSchedule
  * YearSchedule
  * Calendar (1)
  * OneCycle (1)
  * PeriodicCycle (1)

* Process/
  * PID
  * Curve (1)
  * WeatherInput (1)
  * Gate (1)
  * Oneshot
  * Threshold
  * Hysteresis
  * Limit
  * Scale
  * AutoManual (1)
  * ManualOverride (1)
  * Choice (1)
  * SampleHold (1)
  * Filter (1)
  * RsLatch (1)
  * RangeCheck (1)
  * DataSequencer (1)
  * Counter
  * Demux12 (1)
  * Mux12 (1)
  * Starter (1)

* Devices/
  * EnergyMeter (1)
  * WaterMeter (1)
  * IndoorRegulator (1)
  * HvacController

* Monitoring/
  * AlarmPoint (1)
  * Statistics (1)
  * Reporting (1)

* IO/
  * Analog Input  
  * Analog Output  
  * Digital Input  
  * Digital Output

* Environment/
  * Emulator
    * Slider Input
    * Knob Input
    * Spinbox Input
    * Numeric Text Input
    * Random Input
    * Text Output
    * Meter Output
  * Link2Web
    * Triac
    * Pt1000
    * AQ
    * Fallback
  * Colibri
    * AIV 
    * AIC 
    * AQV 
    * Pt1000 
    * PID1 
    * SSR 
    * Triac1
    * FET 
    * DIU 
    * DII 
    * DIO1 
    * RS485U/Modbus 
    
* ModBus Master





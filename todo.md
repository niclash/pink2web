# Things to do before 1.0

* Export/Import Process to allow programs to be copied from one to another place. (GitHub integration?)

* Show Link values in real-time in Web UI.

* Undo/Redo

* Metrics library? This needs to be changed a lot from the approach in Java, since types are not available in
  the same way in Pony. Perhaps `Linkable` should become a class, which may carry a number and a unit.
  
* Save programs that are altered over the websocket.

* Timeseries capture and storage, preferably on every Linkable. RRDtool?

* Alarm system. State machine and Alarm Log.

* Sending alarms.

* Authentication/Authorization

* Make a Group (addgroup, addinport, addoutport), make group into a new component, save/share.

## BlockTypes Library
The following block types are needed

* Add
* Subtract
* Multiply
* Divide
* And
* Or
* Xor
* Not
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

* PID
* Weather
* Clock
* Timer
* Counter

* DelayFilter
* Oneshot
* Threshold
* Hysteresis
* Limit
* Scale

* WeekSchedule
* YearSchedule

* Hardware
    1. Link2Web Triac
    1. Link2Web Pt1000
    1. Link2Web AQ
    1. Link2Web Fallback
    1. Link2Web LoRa
    
* ModBus Master




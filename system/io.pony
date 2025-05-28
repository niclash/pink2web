
use "../drivers"
use "../graphs"

actor Io
  var _drivers: (Drivers | None) = None

  be set_drivers(drivers':Drivers) =>
    _drivers = drivers'

  be set_output( logical_name:String, value:Linkable) =>
    match _drivers
    | let d: Drivers => d.set_output( logical_name, value )
    end


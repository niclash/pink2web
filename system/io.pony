


actor Io
  let _drivers: Drivers

  be set_drivers(drivers':Drivers) =>
    _drivers = drivers'

  be set_output( logical_name:String,
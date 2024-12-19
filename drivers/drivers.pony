use "collections"
use "promises"
use "../blocktypes"
use "../system"
use "./colibri"
use "./emulator"
use "./link2web"
use "./modbus"
use "./raspi"

class Drivers
  var _drivers:Map[String,Driver] = Map[String,Driver]()
  let _context:SystemContext
  let _blocktypes:BlockTypes

  new create(context':SystemContext, blocktypes':BlockTypes) =>
    _context = context'
    _blocktypes = blocktypes'

  fun ref load( name:String ) =>
    if name == "link2web" then _drivers(name) = Link2Web(_context, _blocktypes) end
    if name == "colibri-7" then _drivers(name) = Colibri7(_context, _blocktypes) end
    if name == "emulator" then _drivers(name) = Emulator(_context, _blocktypes) end
    if name == "raspi" then _drivers(name) = RaspberryPi(_context, _blocktypes) end
    if name == "modbus-tcp" then _drivers(name) = ModbusTcp(_context, _blocktypes) end
    if name == "modbus-rtu" then _drivers(name) = ModbusRtu(_context, _blocktypes) end

  fun start() =>
    for driver in _drivers.values() do
      driver.start()
    end

  fun stop() =>
    for driver in _drivers.values() do
      driver.stop()
    end

  fun available(): Array[String val] val =>
    ["raspi"; "link2web"; "emulator"]

  fun list(): Array[String val] val =>
    _context(Info) and _context.log(Info, "List drivers" )
    var result:Array[String] iso = recover iso Array[String]() end
    for drivername in _drivers.keys() do
      result.push( drivername )
    end
    result

interface tag Driver
  new tag create(context':SystemContext, blocktypes':BlockTypes)
  be start()
  be stop()

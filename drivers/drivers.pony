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

  new create(context':SystemContext) =>
    _context = context'

  fun ref load( name:String ) =>
    if name == "link2web" then _drivers(name) = Link2Web(_context) end
    if name == "colibri-7" then _drivers(name) = Colibri7(_context) end
    if name == "emulator" then _drivers(name) = Emulator(_context) end
    if name == "raspi" then _drivers(name) = RaspberryPi(_context) end
    if name == "modbus-tcp" then _drivers(name) = ModbusTcp(_context) end
    if name == "modbus-rtu" then _drivers(name) = ModbusRtu(_context) end

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
  new tag create(context':SystemContext)
  be start()
  be stop()
  be get_physical_ports(promise: Promise[Array[PhysicalPortInfo val] val])
  be add_physical_port_config_listener(listener: PhysicalPortConfigListener)
  be remove_physical_port_config_listener(listener: PhysicalPortConfigListener)
  be add_physical_port_value_listener(listener: PhysicalPortValueListener)
  be remove_physical_port_value_listener(listener: PhysicalPortValueListener)

interface tag PhysicalPortConfigListener
  be ports_config_updated(ports: Array[PhysicalPortInfo val] val)

interface tag PhysicalPortValueListener
  be port_value_updated(port_id: String, value: Any val)


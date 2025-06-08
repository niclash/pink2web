use "collections"
use "files"
use "ini"
use "promises"
use "../blocktypes"
use "../graphs"
use "../system"
use "./colibri"
use "./emulator"
use "./link2web"
use "./modbus"
use "./null"
use "./raspi"

actor Drivers
  var _drivers:Map[String,Driver] = Map[String,Driver]()
  let _context:SystemContext
  let _input_map: Map[PhysicalIoPortInfo, String] = Map[PhysicalIoPortInfo, String]
  let _output_map: Map[String, PhysicalIoPortInfo] = Map[String, PhysicalIoPortInfo]
  let _graphs:Graphs

  new create(context':SystemContext, graphs':Graphs) =>
    _graphs = graphs'
    _context = context'

  be load( name:String ) =>
    """
    Load the driver from $CONFDIR/drivers/$name.conf
    """
    let confdir = _context.filelocations().config_directory
    try
      let conffile = confdir.join("drivers/"+name+".conf")?
      let sections:IniMap val = recover val IniParse(File(conffile).lines())? end
      let config:Map[String,String] val =  sections(name)?
      let driver = config("driver")?
      _drivers(name) = match driver
      | "colibri7" => Colibri7(_context, config, this)
      | "emulator" => Emulator(_context, config, this)
      | "link2web" => Link2Web(_context, config, this)
      | "raspi" => RaspberryPi(_context, config, this)
      | "modbus-tcp" => ModbusTcp(_context, config, this)
      | "modbus-rtu" => ModbusRtu(_context, config, this)
      else
        NullDriver(_context,config,this)
      end
    end

  be start() =>
    for driver in _drivers.values() do
      driver.start()
    end

  be stop() =>
    for driver in _drivers.values() do
      driver.stop()
    end

  be port_detected( port:PhysicalIoPortInfo ) =>
    None

  be port_gone( port:PhysicalIoPortInfo ) =>
    None

  be available( p:Promise[String]) =>
    p("raspi")
    p("link2web")
    p("emulator")

  be list(promise: Promise[String]) =>
    _context(Info) and _context.log(Info, "List drivers" )
    for drivername in _drivers.keys() do
      promise( drivername )
    end

  be input_value( port:PhysicalIoPortInfo, value: Any ) =>
    None

  be set_output( logical_name:String, value:Linkable) =>
    None

primitive Present
  fun is_present() => true
  fun is_absent() => false

primitive Absent
  fun is_present() => false
  fun is_absent() => true

type Presence is (Present|Absent)

trait tag Driver
  new tag create(context':SystemContext, config':Map[String,String] val, drivers':Drivers)
  be start()
  be stop()
  be get_physical_ports(promise: Promise[PhysicalIoPortInfo])
  be add_physical_port_config_listener(listener: PhysicalPortConfigNotify)
  be remove_physical_port_config_listener(listener: PhysicalPortConfigNotify)
  be add_physical_port_value_listener(listener: PhysicalPortValueNotify)
  be remove_physical_port_value_listener(listener: PhysicalPortValueNotify)


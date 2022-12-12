use "collections"
use "promises"
use "../blocktypes"
use "../system"
use "./emulator"
use "./link2web"
use "./raspi"

actor Drivers
  let _drivers:Map[String,Driver] = Map[String,Driver]()
  let _context:SystemContext
  let _blocktypes:BlockTypes

  new create(context':SystemContext, blocktypes':BlockTypes) =>
    _context = context'
    _blocktypes = blocktypes'

  be load( name:String ) =>
    if name == "link2web" then _drivers(name) = Link2Web(_context, _blocktypes) end
    if name == "emulator" then _drivers(name) = Emulator(_context, _blocktypes) end
    if name == "raspi" then _drivers(name) = RaspberryPi(_context, _blocktypes) end

  be start() =>
    for driver in _drivers.values() do
      driver.start()
    end

  be stop() =>
    for driver in _drivers.values() do
      driver.stop()
    end

  be available(promise:Promise[Array[String val] val]) =>
    promise(["raspi"; "link2web"; "emulator"])

  be list(promise:Promise[Array[String val] val]) =>
    _context(Info) and _context.log(Info, "List drivers" )
    var result:Array[String] iso = Array[String]()
    for drivername in _drivers.keys() do
      result.push( drivername )
    end
    promise(consume result)

interface tag Driver
  new tag create(context':SystemContext, blocktypes':BlockTypes)
  be start()
  be stop()

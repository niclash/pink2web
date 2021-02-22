
use "../blocktypes"
use "../system"
use "./link2web"

actor Drivers
  let _drivers:Array[Driver tag] = []
  let _context:SystemContext
  let _blocktypes:BlockTypes

  new create(context':SystemContext, blocktypes':BlockTypes) =>
    _context = context'
    _blocktypes = blocktypes'

  be load( name:String ) =>
    if name == "link2web" then _drivers.push(Link2Web(_context, _blocktypes)) end

  be start() =>
    for driver in _drivers.values() do
      driver.start()
    end

  be stop() =>
    for driver in _drivers.values() do
      driver.stop()
    end

  be list() =>
    _context(Info) and _context.log(Info, "link2web" )


interface tag Driver
  new tag create(context':SystemContext, blocktypes':BlockTypes)
  be start()
  be stop()
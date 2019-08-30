use "./app"
use "./blocktypes"
use "./blocks"
use "logger"

actor Main
  let _log: Logger[String] val
  let _manager: BlockManager 
  
  new create( env: Env ) =>
    _log = StringLogger( Fine, env.out )
    _manager = BlockManager(_log)
    try
      let loader = Loader(_manager, _log, env.root as AmbientAuth)
      if env.args.size() == 0 then
        _log(Error) and _log.log( "Must provide application json to load." )
      end
      loader.load( env.args(1)? )
    else
      _log(Error) and _log.log( "Unable to get Environment Root. Internal error?" )
    end


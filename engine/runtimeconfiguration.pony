
class val RuntimeConfiguration
  let engine_id: String
  let host: String
  let port: U32
  let drivers: ReadSeq[String]
  let webdir: String
  let startpage: String

  new val create(engine_id':String, host': String, port': U32, webdir': String, startpage': String, drivers': ReadSeq[String val] val ) =>
    engine_id = engine_id'
    host = host'
    port = port'
    drivers = drivers'
    webdir = webdir'
    startpage = startpage'

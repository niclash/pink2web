
class val RuntimeConfiguration
  let host: String
  let port: U32
  let drivers: ReadSeq[String]
  let webdir: String
  let startpage: String

  new val create(host': String, port': U32, webdir': String, startpage': String, drivers': ReadSeq[String val] val ) =>
    host = host'
    port = port'
    drivers = drivers'
    webdir = webdir'
    startpage = startpage'

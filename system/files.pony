
use "collections"
use "files"

primitive Files

  fun read_text_from_path( path: FilePath ): String ? =>
    var result:String iso = recover iso String end
    with file = OpenFile(path) as File  do
      for line in file.lines() do
        result.append( consume line )
      end
    end
    consume result

  fun read_text_from_pathname( pathname: String,  auth:FileAuth ): String ? =>
    let caps = recover val FileCaps.>set(FileRead).>set(FileStat) end
    let path = FilePath(auth, pathname, caps)
    read_text_from_path( path )?

  fun write_text_to_path( path: FilePath, text: String ) =>
    let out = FileStream(recover File(path) end)
    out.print(text)
    out.flush()

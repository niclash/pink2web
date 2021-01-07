
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

  fun read_text_from_pathname( pathname: String,  ambient:(None|AmbientAuth val) ): String ? =>
    match ambient
    |
      let am:AmbientAuth =>
        let caps = recover val FileCaps.>set(FileRead).>set(FileStat) end
        let path = FilePath(am, pathname, caps)?
        read_text_from_path( path )?
    | None => ""
    end

  fun write_text_to_path( path: FilePath, text: String ) =>
    let out = FileStream(recover File(path) end)
    out.print(text)
    out.flush()

  fun write_text_to_pathname( pathname: String, text:String, ambient:(None|AmbientAuth val) )? =>
    match ambient
    |let am:AmbientAuth =>
        let caps = recover val FileCaps.>set(FileWrite).>set(FileStat) end
        let path = FilePath(am, pathname, caps)?
        write_text_to_path( path, text )
    | None => ""
    end

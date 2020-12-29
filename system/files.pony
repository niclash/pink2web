
use "collections"
use "files"

primitive Files

  fun read_lines_from_path( path: FilePath ): String ? =>
    var result:String iso = recover iso String end
    with file = OpenFile(path) as File  do
      for line in file.lines() do
        result.append( consume line )
      end
    end
    consume result

  fun read_lines_from_pathname( pathname: String,  ambient:(None|AmbientAuth val) ): String ? =>
    match ambient
    |
      let am:AmbientAuth =>
        let caps = recover val FileCaps.>set(FileRead).>set(FileStat) end
        let path = FilePath(am, pathname, caps)?
        read_lines_from_path( path )?
    | None => ""
    end

  

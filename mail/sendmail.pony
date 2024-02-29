use "debug"
use "files"
use "process"
use "backpressure"

use "../system"

class tag SendMail
  fun apply(ctx:SystemContext, name:String, email:String, subject:String, body:String) =>
    let client = ProcessClient
    let notifier: ProcessNotify iso = consume client
    let auth = ctx.auth()
    let path = FilePath(FileAuth(auth), "/usr/bin/mail")
    let args: Array[String] val = [
      "/home"
      "--subject=" + subject; name + "<" + email + ">"
      "--content-type=application/yaml"
    ]
    let vars: Array[String] val = ["HOME=/"; "PATH=/bin"]
    let pm: ProcessMonitor = ProcessMonitor(
          StartProcessAuth(auth),
          ApplyReleaseBackpressureAuth(auth),
          consume notifier,
          path,
          args,
          vars
    )
    pm.print(body)
    pm.done_writing() // closing stdin allows cat to terminate

class ProcessClient is ProcessNotify
  fun ref stdout(process: ProcessMonitor ref, data: Array[U8] iso) =>
    let out = String.from_array(consume data)
    Debug.out("STDOUT: " + out)

  fun ref stderr(process: ProcessMonitor ref, data: Array[U8] iso) =>
    let err = String.from_array(consume data)
    Debug.err("STDERR: " + err)

  fun ref failed(process: ProcessMonitor ref, err: ProcessError) =>
    Debug.err(err.string())

  fun ref dispose(process: ProcessMonitor ref, child_exit_status: ProcessExitStatus) =>
    match child_exit_status
    | let exited: Exited =>
      Debug.err("Child exit code: " + exited.exit_code().string())
    | let signaled: Signaled =>
      Debug.err("Child terminated by signal: " + signaled.signal().string())
    end

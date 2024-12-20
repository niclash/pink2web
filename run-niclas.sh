#!/bin/bash

lldb --batch --one-line "breakpoint set --name main" --one-line run --one-line "process handle SIGINT --pass true --stop false" --one-line "process handle SIGUSR2 --pass true --stop false"  --one-line "thread continue" --one-line-on-crash "frame variable" --one-line-on-crash "register read" --one-line-on-crash "bt all" --one-line-on-crash "quit 1" -- ./pink2web --info run process docs/example.json
#./pink2web --info run process docs/example.json

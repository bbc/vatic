#!/bin/bash
set -e
cat public/jquery-ui/js/jquery-ui-1.10.4.custom.min.js public/videoplayer.js public/preload.js public/objectui.js public/ui.js public/job.js public/tracks.js > pybossa/bundle.js

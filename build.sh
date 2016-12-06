#!/bin/bash
set -e
scp ./public/vatic.css pybossa:/opt/pybossa/pybossa/themes/default/static/css/vatic.css
cat public/jquery-ui/js/jquery-ui-1.10.4.custom.min.js public/videoplayer.js public/preload.js public/objectui.js public/ui.js public/job.js public/tracks.js > public/vatic.js
scp ./public/vatic.js pybossa:/opt/pybossa/pybossa/themes/default/static/js/vatic.js
echo "Vatic Deployed!"

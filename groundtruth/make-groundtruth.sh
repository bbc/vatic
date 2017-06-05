#!/bin/bash
set -e

INPUT=$1
OUTPUT=$2
bname=$(basename $INPUT)
FILE=${bname%.*}
DURATION=$(ffprobe -i ${INPUT} -show_entries format=duration -v quiet -of csv="p=0")
# Convert to non-strechy
ffmpeg -i $INPUT  -strict -2 -vf scale=1024x576,setsar=1:1 -q:v 1  ${OUTPUT}/${FILE}.mp4
mkdir ${OUTPUT}/${FILE}
# Make frames
cd ${OUTPUT}/${FILE}/ && ffmpeg -i ${OUTPUT}/${FILE}.mp4 -vf fps=5 -q:v 5 %d.jpg && tar -zcf ${OUTPUT}/${FILE}.tar.gz ./*.jpg

# Detect faces
/scripts/irfs-face.py --classifier=/models/election2017_v01.pkl ${OUTPUT}/${FILE}.mp4 ${OUTPUT}/${FILE}.faces.json

#Convert them into vatic
/scripts/face-tracks-to-vatic.py -i ${OUTPUT}/${FILE}.faces.json > ${OUTPUT}/${FILE}.all.json

# Split into minutes
/scripts/split_into_minutes.py ${OUTPUT}/${FILE}.all.json ${DURATION} ${FILE} ${OUTPUT} 

# Clean up
rm ${OUTPUT}/${FILE}.mp4
rm -rf ${OUTPUT}/${FILE}


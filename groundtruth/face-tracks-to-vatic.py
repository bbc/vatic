#!/usr/bin/python
import json
import re
import sys, getopt
from decimal import Decimal
from operator import itemgetter

def timeToFrames(time):
    spf = Decimal(25.0)
    frames = Decimal(time) * spf
    return int(frames) 

inputfile = ''
try:
    opts, args = getopt.getopt(sys.argv[1:],"hi:",["input"])
except getopt.GetoptError:
    print 'face-tracks-to-vatic.py -i <input>'
    sys.exit(2)
for opt, arg in opts:
    if opt == '-h':
        print 'face-tracks-to-vatic.py -i <input>'
        sys.exit()
    elif opt in ("-i", "--input"):
        inputfile = arg

boxes = []
data = []
obj = {}
faceIndex = 0
skip = 5
skipAnnotations = 25

with open(inputfile,'r') as f:
    lines = []
    for line in f:
        line = line.strip().split()
        line = [float(line[0]), int(line[1]),Decimal(line[2]),Decimal(line[3]),Decimal(line[4]),Decimal(line[5])]
        lines.append(line)
    lines.sort(key=itemgetter(1,0)) 
    for line in lines:
        currentFace = line[1];
        if currentFace > faceIndex:
            if len(boxes) > 0:
                lastbox = boxes[len(boxes) - 1]
                box = [lastbox[0], lastbox[1], lastbox[2], lastbox[3], lastbox[4] + skip, True, False]
                boxes.append(box)
                obj["label"] = 0 
                obj["attributes"] = []
                obj["boxes"] = boxes
                data.append(obj)
            faceIndex = currentFace
            boxes = []
            obj = {}
        frames = timeToFrames(line[0])
        if (frames % skipAnnotations) == 0:
            image = int(frames / skip) + 1

            if len(boxes) == 0:
                box = [int(line[2]),int(line[3]),int(line[4] + line[2]),int(line[5] + line[3]), max(0, image - skip),True, False]
                boxes.append(box)
            box = [int(line[2]),int(line[3]),int(line[4] + line[2]),int(line[5] + line[3]), image,False, False]
            boxes.append(box)

out = json.dumps(data)
print out

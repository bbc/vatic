#!/usr/bin/python
import json
import re
import sys, getopt
from decimal import Decimal

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
width = Decimal(704.0)
height = Decimal(576.0)
skip = 5
skipAnnotations = 25 
jobid = 6130674973297078010 
project = 'facerec'
start = 0
stop = 3000 
blowradius = 5
lines = 0

with open(inputfile,'r') as f:
    for l in f:
        lines = lines + 1
        parts = l.strip().split()
        currentFace = int(parts[1]);
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
        frames = timeToFrames(parts[0])
        if (frames % skipAnnotations) == 0:
            image = int(frames / skip) + 1

            if len(boxes) == 0:
                box = [int(Decimal(parts[2]) * width),int(Decimal(parts[3]) * height),int(Decimal(parts[4]) * width),int(Decimal(parts[5]) * height), max(0, image - skip),True, False]
                boxes.append(box)
            box = [int(Decimal(parts[2]) * width),int(Decimal(parts[3]) * height),int(Decimal(parts[4]) * width),int(Decimal(parts[5]) * height), image,False, False]
            boxes.append(box)

out = json.dumps(data)
labels = json.dumps(["face"]).replace('"','""')
attributes = json.dumps([["David Cameron","Unknown"]]).replace('"','""')
#print "\"jobid\",\"slug\",\"start\",\"stop\",\"width\",\"height\",\"skip\",\"blowradius\",\"labels\",\"attributes\""
#print "%d,\"%s\",%d,%d,%d,%d,%d,%d,\"%s\",\"%s\"" % (jobid, project, start, stop, width, height, skip, blowradius, labels, attributes)
print out

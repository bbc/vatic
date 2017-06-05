#!/usr/bin/python
import json
import os
import sys
import math

infile = sys.argv[1]
duration_in_secs = float(sys.argv[2])
duration_in_mins = int(math.ceil(duration_in_secs / 60.0))
diskref = sys.argv[3]
output_dir = sys.argv[4]
with open(infile) as input_file:
    tracks = json.load(input_file)
    for i in range(0,duration_in_mins):
        hours = i / 60
        minutes = i % 60
        new_tracks = []
        for track in tracks:
            frame_from = i * 300
            frame_to = ((i + 1) * 300) + 1
            new_boxes = [] 
            for box in track['boxes']:
                new_box = list(box)
                #new_box[0] = int((float(box[0]) / 720.) * 1024.)
                #new_box[2] = int((float(box[2]) / 720.) * 1024.)
                frame = box[4]
                if frame >= frame_from and frame <= frame_to:
                    new_boxes.append(new_box)
            if len(new_boxes) > 0:
                new_track = {'attributes': [], 'boxes':new_boxes, 'label':0}
                new_tracks.append(new_track)
        outfile = os.path.join(output_dir,"%s_%02d:%02d:00.json" % (diskref,hours,minutes))
        with open(outfile,'w') as output_file:
            json.dump(new_tracks, output_file)

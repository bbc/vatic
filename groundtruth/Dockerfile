FROM artifactory-noforge.virt.ch.bbc.co.uk:8443/irfs-data-face-recognition
MAINTAINER ben.clark02@bbc.co.uk

COPY face-tracks-to-vatic.py  /scripts/face-tracks-to-vatic.py
COPY make-groundtruth.sh  /scripts/make-groundtruth.sh
COPY split_into_minutes.py /scripts/split_into_minutes.py

RUN chmod +x /scripts/*


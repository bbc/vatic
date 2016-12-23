# VATIC - Video Annotation Tool from Irvine, California

VATIC is an online video annotation tool for computer vision research that
crowdsources work to Amazon's Mechanical Turk. Our tool makes it easy to build
massive, affordable video data sets. 

<img src='http://i.imgur.com/z6jl5Bs.jpg'>

# INSTALLATION 

We've configured this as a [pybossa](http://pybossa.com) plugin so you can use
pybossa-client to configure a new project. Documentation is
[here](http://docs.pybossa.com/en/latest/user/pbs.html)

You need to install the pybossa-client first (use a virtualenv):

```bash
    $ pip install pybossa-client
```
Then, you can follow the next steps:

*  Create an account in
   [PyBossa](https://vm-1568-user.virt.ch.bbc.co.uk/) 
*  Copy under your account profile your API-KEY
*  Create a ~/.pybossa.cfg file on your computer
*  Create a project.json file
*  Doctor the template.html to replace 'facerec' with the short_name of your 
   project 
*  Run 
```bash
    $ pbs create_project
```

## Creating Tasks

There is an example tasks.csv in ./pybossa. For each video clip

*  Extract the frames you need
```bash
    $ ffmpeg -i file.mp4 -vf fps=5 -q:v 5 %d.jpg
```
*  Run shot detection on the video
```bash
    $ docker run -v $(pwd)/pyannote-video/scripts:/scripts -v $(pwd):/data pyannote-video /usr/bin/python /scripts/pyannote-strucuture.py shot /data/file.mp4 /data/file_shots.json
```
*  Run face detection and tracking on the video
```bash
    $ docker run -v $(pwd)/pyannote-video/scripts:/scripts -v $(pwd):/data pyannote-video /usr/bin/python /scripts/pyannote-face.py track /data/file.mp4 /data/file_shots.json /data/file_tracks.json
```
*  Convert the pyannote face tracks into something which vatic understands
```bash
    $ ./face-tracks-to-vatic.py -i file_tracks.json > file.json
``` 
*  Once your tasks.csv is filled in, you can upload it using
```bash
    $ pbs add_tasks --tasks-file tasks.csv
```

## Static Files

Static files are (currently) served from the same web server that pybossa runs
on, from the web server root in this structure

* /static/vatic/${project.short_name}/${job.info.jobid}.json : The face tracks file
  created by face-tracks-to-vatic.py
* /static/vatic/${project.short_name}/${job.info.jobid}/${frame}.jpg : The
  images
* /static/vatic/${project.short_name}/labels/${label_spaces_replaced_with_underscores.jpg}

# REFERENCES 

When using our system, please cite:

    Carl Vondrick, Donald Patterson, Deva Ramanan. "Efficiently Scaling Up
    Crowdsourced Video Annotation" International Journal of Computer Vision
    (IJCV). June 2012.

# FEEDBACK AND BUGS 

Please direct all comments and report all bugs to:

    Carl Vondrick
    vondrick@mit.edu

Thanks for using our system!

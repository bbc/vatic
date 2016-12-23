function Job(data)
{
    var me = this;

    this.slug = null;
    this.start = null;
    this.stop = null; 
    this.width = null; 
    this.height = null; 
    this.skip = null; 
    this.blowradius = null;
    this.thisid = null;
    this.labels = null;
    this.data = null;

    this.frameurl = function(i)
    {
        folder1 = parseInt(Math.floor(i / 100));
        folder2 = parseInt(Math.floor(i / 10000));
        return "/static/frames/" + me.slug + "/" + me.jobid + "/" + parseInt(i) + ".jpg";
    }
}

function job_import(info, data)
{
    var job = new Job();
    job.slug = info["slug"];
    job.start = parseInt(info["start"]);
    job.stop = parseInt(info["stop"]);
    job.width = parseInt(info["width"]);
    job.height = parseInt(info["height"]);
    job.skip = parseInt(info["skip"]);
    job.blowradius = parseInt(info["blowradius"]);
    job.jobid = info["jobid"];
    job.labels = JSON.parse(info["labels"]);
    job.attributes = JSON.parse(info["attributes"]);
    job.data = data;


    console.log("Job configured!");
    console.log("  Slug: " + job.slug);
    console.log("  Start: " + job.start);
    console.log("  Stop: " + job.stop);
    console.log("  Width: " + job.width);
    console.log("  Height: " + job.height);
    console.log("  Skip: " + job.skip);
    console.log("  Blow Radius: " + job.blowradius);
    console.log("  Job ID: " + job.jobid);
    console.log("  Labels: ");
    for (var i in job.labels)
    {
        console.log("    " + i + " = " + job.labels[i]);
    }
    console.log("  Attributes:");
    for (var i in job.attributes)
    {
        for (var j in job.attributes[i])
        {
            console.log("    " + job.labels[i] + " = " + job.attributes[i][j])
        }
    }

    return job;
}

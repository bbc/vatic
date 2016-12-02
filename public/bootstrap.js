var development = false;

var container;

$(document).ready(function() {
    data = {
      "jobid":"100",
      "slug":"slug",
      "start":"0",
      "stop":"100",
      "width":"704",
      "height":"576",
      "skip":"25",
      "perobject":"5", // TODO remove later
      "completion":"100", // TODO remove later
      "blowradius":"5", // TODO remove later?
      "labels":"[\"cat\",\"dog\",\"fish\"]",
      "attributes":"[\"happy\",\"sad\"]",
      "training":"0", // TODO remove later
      "verified":"1", // TODO remove later
      "data":"[{\"label\",\"cat 1\",\"attributes\":[],\"boxes\":[]}]"
    }

    console.log("Booting...");

    container = $("#container");

    loadingscreen(job_import(data));
});

function loadingscreen(job)
{
    var ls = $("<div id='loadingscreen'></div>");
    ls.append("<div id='loadingscreeninstructions' class='button'>Show " +
        "Instructions</div>");
    ls.append("<div id='loadingscreentext'>Downloading the video...</div>");
    ls.append("<div id='loadingscreenslider'></div>");

    if (!mturk_isassigned())
    {
        ls.append("<div class='loadingscreentip'><strong>Tip:</strong> You " +
            "are strongly recommended to accept the task before the " +
            "download completes. When you accept, you will have to restart " +
            "the download.</div>");
    }

    ls.append("<div class='loadingscreentip'>You are welcome to work on " +
        "other HITs while you wait for the download to complete. When the " +
        "download finishes, we'll play a gentle musical tune to notify " + 
        "you.</div>");

    container.html(ls);

    if (!development && !mturk_isoffline())
    {
        ui_showinstructions(job);
    }

    $("#loadingscreeninstructions").button({
        icons: {
            primary: "ui-icon-newwin"
        }
    }).click(function() {
        ui_showinstructions(job);
    });

    eventlog("preload", "Start preloading");

    preloadvideo(job.start, job.stop, job.frameurl,
        preloadslider($("#loadingscreenslider"), function(progress) {
            if (progress == 1)
            {
                if (!development && !mturk_isoffline())
                {
                    /*$("body").append('<div id="music"><embed src="magic.mp3">' +
                        '<noembed><bgsound src="magic.mp3"></noembed></div>');*/

                    window.setTimeout(function() {
                        $("#music").remove();
                    }, 2000);
                }

                ls.remove()
                ui_build(job);

                mturk_enabletimer();

                eventlog("preload", "Done preloading");
            }
        })
    );
}

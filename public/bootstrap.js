var development = false;

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
      "attributes":"[[\"fat\", \"thin\"],[\"happy\",\"sad\"],[\"big\",\"little\"]]",
      "training":"0", // TODO remove later
      "verified":"1", // TODO remove later
      "data":"[{\"label\",\"cat 1\",\"attributes\":[],\"boxes\":[]}]"
    }

    console.log("Booting...");

    job = job_import(data);

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

                $("#loadingscreen").hide();
                ui_build(job);

                eventlog("preload", "Done preloading");
            }
        })
    );
});

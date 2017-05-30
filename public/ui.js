var ui_disabled = 0;

function ui_build(task, deferred, job)
{
    ui_setup(job);
    var videoframe = $("#videoframe");
    var player = new VideoPlayer(videoframe, job);
    var tracks = new TrackCollection(player, job);
    var objectui = new TrackObjectUI($("#newobjectbutton"), $("#objectcontainer"), videoframe, job, player, tracks);

    ui_setupbuttons(job, player, tracks, objectui);
    ui_setupslider(player);
    ui_setupsubmit(task, deferred, job, tracks);
    ui_setupclickskip(job, player, tracks, objectui);
    ui_loadprevious(job, objectui);
    ui_setup_face_labels(job, tracks, objectui)
    ui_setupkeyboardshortcuts(job, player);
}
function ui_setup_face_labels(job, tracks, objectui) {
    container = $("#attributes");
    for (var i in job.attributes[0]) {
      var escapedAttribute = job.attributes[0][i].replace(/ /g, '_') + ".jpg";
      var html = "<div id=\"face-label-" + i + "\" class=\"face-label\" data-attribute=\"" + i + "\">" + job.attributes[0][i] + "<br/><img src=\"/static/vatic/" + job.slug + "/labels/" + job.jobid + "/" + escapedAttribute + "\"></div>";
      
      $(html).appendTo(container).click(function() {
        console.log("Onclick " + $(this).attr('data-attribute') + " " + job.selected);
        if(job.selected != null) {
          attribute = parseInt($(this).attr('data-attribute'));
          object = parseInt(job.selected);
          $(".face-label").removeClass("attribute-selected");
          $(this).addClass("attribute-selected");
          track = tracks.tracks[object];
          for(j in job.attributes[0]) {
            $("#trackobject" + track.id + "attribute" + j).prop('checked',false);
            track.setattribute(j, false);
          }
          track.setattribute(attribute, true);
          $("#trackobject" + track.id + "attribute" + attribute).prop('checked', true);
          track.notifyupdate();
          objectui.getobject(object).updateboxtext();
        }
      });
    }
}

function ui_setup(job)
{
    var playerwidth = Math.max(720, job.width);

    $("#videoframe").css({"width": job.width + "px",
                          "height": job.height + "px",
                          "margin": "0 auto"})
                    .parent().css("width", playerwidth + "px");

    /*$("#sidebar").css({"height": job.height + "px",
                       "width": "205px"});*/

    $("#annotatescreen").css("width", (playerwidth + 205) + "px");

    $("#openadvancedoptions").click(function() {
      $(this).hide();
      $("#advancedoptions").show();
    });

    $("#closeadvancedoptions").click(function() {
      $("#advancedoptions").hide();
      $("#openadvancedoptions").show();
    });

    $("#advancedoptions").hide();


}

function ui_setupbuttons(job, player, tracks, objectui)
{
    $("#playbutton").click(function() {
        if (!$(this).attr("disabled")) {
            player.toggle();
        }
    });

    $("#rewindstartbutton").click(function() {
        if (ui_disabled) return;
        player.pause();
        player.seek(player.job.start);
    });

    $("#rewindbutton").click(function() {
        if (ui_disabled) return;
        player.pause();
        player.seek(player.frame - job.skip);
    });

    $("#hideobjectbutton").click(function() {
      if(job.selected != null) {
          object = parseInt(job.selected);
          track = tracks.tracks[object];
          if(track.getoutside()) {
            track.setoutside(false);
            $("#trackobject" + track.id + "lost").prop('checked',false);
            //$("#hideobjectbutton").children().addClass("glyphicon-remove");
            //$("#hideobjectbutton").children().removeClass("glyphicon-plus");
          } else {
            track.setoutside(true);
            //$("#hideobjectbutton").children().addClass("glyphicon-plus");
            //$("#hideobjectbutton").children().removeClass("glyphicon-remove");
            $("#trackobject" + track.id + "lost").prop('checked',true);
          } 
          track.notifyupdate();
        }
    });
    $("#occludeobjectbutton").click(function() {
      if(job.selected != null) {
          object = parseInt(job.selected);
          track = tracks.tracks[object];
          if(track.getocclusion()) {
            track.setocclusion(false);
            $("#trackobject" + track.id + "occluded").prop('checked',false);
            $("#occludeobjectbutton").children().addClass("glyphicon-eye-open");
            $("#occludeobjectbutton").children().removeClass("glyphicon-eye-close");
          } else {
            track.setocclusion(true);
            $("#trackobject" + track.id + "occluded").prop('checked',true);
            $("#occludeobjectbutton").children().removeClass("glyphicon-eye-open");
            $("#occludeobjectbutton").children().addClass("glyphicon-eye-close");
          } 
          track.notifyupdate();
        }
    });

    $("#deleteobjectbutton").click(function() {
      if(job.selected != null) {
          object = parseInt(job.selected);
          objectui.getobject(object).remove();
          job.selected = null;
          $(".face-label").removeClass("attribute-selected");
          $("#hideobjectbutton").prop('disabled',true);
          $("#occludeobjectbutton").prop('disabled',true);
          $("#deleteobjectbutton").prop('disabled',true);
      }
    });
    player.onplay.push(function() {
        $("#playbutton").children().removeClass("glyphicon-play");
        $("#playbutton").children().addClass("glyphicon-pause");
    });

    player.onpause.push(function() {
        $("#playbutton").children().removeClass("glyphicon-pause");
        $("#playbutton").children().addClass("glyphicon-play");
    });

    player.onupdate.push(function() {
        if (player.frame == player.job.stop) {
            $("#playbutton").attr("disabled", true);
        } else if ($("#playbutton").attr("disabled")) {
            $("#playbutton").removeAttr("disabled");
        }

        if (player.frame == player.job.start) {
            $("#rewindstartbutton").attr("disabled", true);
            $("#rewindbutton").attr("disabled", true);
        } else if ($("#rewindbutton").attr("disabled")) {
            $("#rewindstartbutton").removeAttr("disabled");
            $("#rewindbutton").removeAttr("disabled");
        }
    });

    $("input[name='speedcontrol']").click(function() {
        player.fps = parseInt($(this).val().split(",")[0]);
        player.playdelta = parseInt($(this).val().split(",")[1]);
        console.log("Change FPS to " + player.fps);
        console.log("Change play delta to " + player.playdelta);
        if (!player.paused)
        {
            player.pause();
            player.play();
        }
    });

    $("#annotateoptionsresize").click(function() {
        var resizable = $(this).attr("checked") ? false : true;
        tracks.resizable(resizable);
    });

    $("#annotateoptionshideboxes").click(function() {
        var visible = !$(this).attr("checked");
        tracks.visible(visible);
    });

    $("#annotateoptionshideboxtext").click(function() {
        var visible = !$(this).attr("checked");

        if (visible) {
            $(".boundingboxtext").show();
        } else {
            $(".boundingboxtext").hide();
        }
    });
}

function ui_setupkeyboardshortcuts(job, player)
{
    var unknown = $("div:contains('Unknown')");

    $(window).keypress(function(e) {
        console.log("Key press: " + e.keyCode);

        if (ui_disabled)
        {
            console.log("Key press ignored because UI is disabled.");
            return;
        }

        var keycode = e.keyCode ? e.keyCode : e.which;
        
        if (keycode == 39)
        {
            $("#playbutton").click();
        }
        if (keycode == 37)
        {
            $("#rewindbutton").click();
        }
        if (keycode == 46) 
        {
            $("#deleteobjectbutton").click();
        }
        else if (keycode == 110)
        {
            $("#newobjectbutton").click();
        }
        else if (keycode == 104)
        {
            $("#annotateoptionshideboxes").click();
        }
        if (keycode == 79 || keycode == 111) 
        {
            $("#hideobjectbutton").click();
        }
	else if (keycode == 86 || keycode == 117)
	{ 
	    unknown.click();
	}
        else 
        {
            var skip = 0;
            if (keycode == 44 || keycode == 100)
            {
                skip = job.skip > 0 ? -job.skip : -10;
            }
            else if (keycode == 46 || keycode == 102)
            {
                skip = job.skip > 0 ? job.skip : 10;
            }
            else if (keycode == 62 || keycode == 118)
            {
                skip = job.skip > 0 ? job.skip : 1;
            }
            else if (keycode == 60 || keycode == 99)
            {
                skip = job.skip > 0 ? -job.skip : -1;
            }

            if (skip != 0)
            {
                player.pause();
                player.displace(skip);

                ui_snaptokeyframe(job, player);
            }
        }
    });

}

function ui_canresize()
{
    return !$("#annotateoptionsresize").attr("checked"); 
}

function ui_areboxeshidden()
{
    return $("#annotateoptionshideboxes").attr("checked");
}

function ui_setupslider(player)
{
    var slider = $("#playerslider");
    slider.children(".progress-bar").width("0%");
    var min = player.job.start;
    var max = player.job.stop;
    player.onupdate.push(function() {
	var percent = ((player.frame - min) / max) * 100;
        slider.children(".progress-bar").width(percent + "%");
    });
}

function ui_iskeyframe(frame, job)
{
    return frame == job.stop || (frame - job.start) % job.skip == 0;
}

function ui_snaptokeyframe(job, player)
{
    if (job.skip > 0 && !ui_iskeyframe(player.frame, job))
    {
        console.log("Fixing slider to key frame");
        var remainder = (player.frame - job.start) % job.skip;
        if (remainder > job.skip / 2)
        {
            player.seek(player.frame + (job.skip - remainder));
        }
        else
        {
            player.seek(player.frame - remainder);
        }
    }
}

function ui_setupclickskip(job, player, tracks, objectui)
{
    if (job.skip <= 0)
    {
        return;
    }

    player.onupdate.push(function() {
        if (ui_iskeyframe(player.frame, job))
        {
            console.log("Key frame hit");
            player.pause();
            $("#newobjectbutton").removeAttr("disabled");
            $("#playbutton").removeAttr("disabled");
            tracks.draggable(true);
            tracks.resizable(ui_canresize());
            tracks.recordposition();
            objectui.enable();
        }
        else
        {
            $("#newobjectbutton").attr("disabled", true);
            $("#playbutton").attr("disabled", true);
            tracks.draggable(false);
            tracks.resizable(false);
            objectui.disable();
        }
    });

    $("#playerslider").bind("slidestop", function() {
        ui_snaptokeyframe(job, player);
    });
}

function ui_loadprevious(job, objectui)
{
    for (var i in job.data) {
            objectui.injectnewobject(job.data[i]["label"],
                                     job.data[i]["boxes"],
                                     job.data[i]["attributes"]);
   }
}

function ui_setupsubmit(task, deferred, job, tracks)
{
    $("#submitbutton").click(function() {
        if (ui_disabled) return;
        console.log(job);
        console.log(tracks.serialize());
        pybossa.saveTask(task.id, tracks.serialize()).done(
            function (data) {
              $("#success").show();
              $("#videoframe").empty();
              $("#objectcontainer").empty(); 
              $("#attributes").empty(); 
              deferred.resolve();
            });
    });
}

function ui_disable()
{
    if (ui_disabled++ == 0)
    {
        $("#newobjectbutton").attr("disabled", true);
        $("#playbutton").attr("disabled", true);
        $("#rewindbutton").attr("disabled", true);
        $("#submitbutton").attr("disabled", true);
        $("#playerslider").attr("disabled", true);

        console.log("Disengaged UI");
    }

    console.log("UI disabled with count = " + ui_disabled);
}

function ui_enable()
{
    if (--ui_disabled == 0)
    {
        $("#newobjectbutton").removeAttr("disabled");
        $("#playbutton").removeAttr("disabled");
        $("#rewindbutton").removeAttr("disabled");
        $("#submitbutton").removeAttr("disabled");
        $("#playerslider").removeAttr("disabled");

        console.log("Engaged UI");
    }

    ui_disabled = Math.max(0, ui_disabled);

    console.log("UI disabled with count = " + ui_disabled);
}

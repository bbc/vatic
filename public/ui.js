var ui_disabled = 0;

function ui_build(job)
{
    ui_setup(job);
    var videoframe = $("#videoframe");
    var player = new VideoPlayer(videoframe, job);
    var tracks = new TrackCollection(player, job);
    var objectui = new TrackObjectUI($("#newobjectbutton"), $("#objectcontainer"), videoframe, job, player, tracks);

    ui_setupbuttons(job, player, tracks);
    ui_setupslider(player);
    ui_setupsubmit(job, tracks);
    ui_setupclickskip(job, player, tracks, objectui);
    ui_setupkeyboardshortcuts(job, player);
    ui_loadprevious(job, objectui);
}

function ui_setup(job)
{
    var playerwidth = Math.max(720, job.width);

    $("#videoframe").css({"width": job.width + "px",
                          "height": job.height + "px",
                          "margin": "0 auto"})
                    .parent().css("width", playerwidth + "px");

    $("#sidebar").css({"height": job.height + "px",
                       "width": "205px"});

    $("#annotatescreen").css("width", (playerwidth + 205) + "px");

    $("#openadvancedoptions").click(function() {
      $(this).remove();
      $("#advancedoptions").show();
    });

    $("#advancedoptions").hide();


}

function ui_setupbuttons(job, player, tracks)
{
    $("#playbutton").click(function() {
        if (!$(this).attr("disabled")) {
            player.toggle();
        }
    });

    $("#rewindbutton").click(function() {
        if (ui_disabled) return;
        player.pause();
        player.seek(player.job.start);
    });

    player.onplay.push(function() {
        $("#playbutton").text("Pause");
    });

    player.onpause.push(function() {
        $("#playbutton").text("Play");
    });

    player.onupdate.push(function() {
        if (player.frame == player.job.stop) {
            $("#playbutton").attr("disabled", true);
        } else if ($("#playbutton").attr("disabled")) {
            $("#playbutton").removeAttr("disabled");
        }

        if (player.frame == player.job.start) {
            $("#rewindbutton").attr("disabled", true);
        } else if ($("#rewindbutton").attr("disabled")) {
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
    $(window).keypress(function(e) {
        console.log("Key press: " + e.keyCode);

        if (ui_disabled)
        {
            console.log("Key press ignored because UI is disabled.");
            return;
        }

        var keycode = e.keyCode ? e.keyCode : e.which;
        
        if (keycode == 32 || keycode == 112 || keycode == 116 || keycode == 98)
        {
            $("#playbutton").click();
        }
        if (keycode == 114)
        {
            $("#rewindbutton").click();
        }
        else if (keycode == 110)
        {
            $("#newobjectbutton").click();
        }
        else if (keycode == 104)
        {
            $("#annotateoptionshideboxes").click();
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
    slider.slider({
        range: "min",
        value: player.job.start,
        min: player.job.start,
        max: player.job.stop,
        slide: function(event, ui) {
            player.pause();
            player.seek(ui.value);
        }
    });

    /*slider.children(".ui-slider-handle").hide();*/
    slider.children(".ui-slider-range").css({
        "background-color": "#868686",
        "background-image": "none"});

    slider.css({
        marginTop: "6px",
        width: parseInt(slider.parent().css("width")) - 200 + "px", 
        float: "right"
    });

    player.onupdate.push(function() {
        slider.slider({value: player.frame});
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
            objectui.injectnewobject(data[i]["label"],
                                     data[i]["boxes"],
                                     data[i]["attributes"]);
   }
}

function ui_setupsubmit(job, tracks)
{
    $("#submitbutton").button({
        icons: {
            primary: 'ui-icon-check'
        }
    }).click(function() {
        if (ui_disabled) return;
        ui_submit(job, tracks);
    });
}

function ui_submit(job, tracks)
{
  // TODO implement for PyBossa
  console.log(job);
  console.log(tracks.serialize());
}

function ui_disable()
{
    if (ui_disabled++ == 0)
    {
        $("#newobjectbutton").attr("disabled", true);
        $("#playbutton").attr("disabled", true);
        $("#rewindbutton").attr("disabled", true);
        $("#submitbutton").button("option", "disabled", true);
        $("#playerslider").slider("option", "disabled", true);

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
        $("#submitbutton").button("option", "disabled", false);
        $("#playerslider").slider("option", "disabled", false);

        console.log("Engaged UI");
    }

    ui_disabled = Math.max(0, ui_disabled);

    console.log("UI disabled with count = " + ui_disabled);
}

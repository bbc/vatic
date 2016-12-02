var turkic_timeaccepted = (new Date()).getTime();

function mturk_parameters()
{
    var retval = new Object();
    retval.action = "http://www.mturk.com/mturk/externalSubmit";
    retval

    if (window.location.href.indexOf("?") == -1)
    {
        retval.assignmentid = null;
        retval.hitid = null;
        retval.workerid = null;
        return retval;
    }

    var params = window.location.href.split("?")[1].split("&");

    for (var i in params)
    {
        var sp = params[i].split("=");
        if (sp.length <= 1)
        {
            continue;
        }
        var result = sp[1].split("#")[0];

        if (sp[0] == "assignmentId")
        {
            retval.assignmentid = result;
        }
        else if (sp[0] == "hitId")
        {
            retval.hitid = result;
        }
        else if (sp[0] == "workerId")
        {
            retval.workerid = result;
        }
        else if (sp[0] == "turkSubmitTo")
        {
            retval.action = decodeURIComponent(result) +
                "/mturk/externalSubmit";
        }
        else
        {
            retval[sp[0]] = result;
        }
    }

    return retval;
}

function mturk_isassigned()
{
    var params = mturk_parameters();
    return params.assignmentid && params.assignmentid != "ASSIGNMENT_ID_NOT_AVAILABLE" && params.hitid && params.workerid;
}

function mturk_isoffline()
{
    var params = mturk_parameters();
    return params.hitid == "offline";
}

function mturk_submitallowed()
{
    return mturk_isassigned() || mturk_isoffline();
}

function mturk_submit(callback)
{
    if (!mturk_submitallowed())
    {
        alert("Please accept task before submitting.");
        return;
    }

    console.log("Preparing work for submission");

    var params = mturk_parameters();
    var now = (new Date()).getTime();

    $("body").append('<form method="get" id="turkic_mturk">' +
        '<input type="hidden" name="assignmentId" value="">' +
        '<input type="hidden" name="data" value="" />' +
        '</form>');

    $("#turkic_mturk input").val(params.assignmentid);
    $("#turkic_mturk").attr("action", params.action);
        
    // function that must be called to formally complete transaction
    function redirect()
    {
        server_request("turkic_savejobstats", 
            [params.hitid, turkic_timeaccepted, now], 
            function() {
                mturk_showdonate(function() {
                    eventlog_save(function() {
                        $("#turkic_mturk").submit();
                    });
                });
            });
    }

    if (mturk_isoffline())
    {
        callback(function() { });
    }
    else
    {
        server_request("turkic_markcomplete",
            [params.hitid, params.assignmentid, params.workerid],
            function() {
                callback(redirect);
            });
    }
}

var turkic_event_log = [];
function eventlog(domain, message)
{
    var timestamp = (new Date()).getTime();
    turkic_event_log.push([timestamp, domain, message]);
    //console.log(timestamp + " " + domain + ": " + message);
}

function eventlog_save(callback)
{
    if (mturk_submitallowed())
    {
        var params = mturk_parameters();
        var data = "[";
        var counter = 0;
        for (var i in turkic_event_log)
        {
            data += "[" + turkic_event_log[i][0] + ",";
            data += "\"" + turkic_event_log[i][1] + "\",";
            data += "\"" + turkic_event_log[i][2] + "\"],";
            counter++;
        }
        if (counter == 0)
        {
            callback();
            return;
        }

        data = data.substr(0, data.length - 1) + "]";
        console.log(data);
        server_post("turkic_saveeventlog", [params.hitid], data, function() {
            callback();
        });
    }
    else
    {
        callback();
    }
}

function server_geturl(action, parameters)
{
    var url = "server/" + action;
    for (var x in parameters)
    {
        url += "/" + parameters[x];
    }
    return url;
}

function server_request(action, parameters, callback)
{
    var url = server_geturl(action, parameters);
    console.log("Server request: " + url);
    $.ajax({
        url: url,
        dataType: "json",
        success: function(data) {
            callback(data);
        },
        error: function(xhr, textstatus) {
            console.log(xhr.responseText);
            death("Server Error");
        }
    });
}

function server_post(action, parameters, data, callback)
{
    var url = server_geturl(action, parameters);
    console.log("Server post: " + url);
    $.ajax({
        url: url,
        dataType: "json",
        type: "POST",
        data: data,
        success: function(data) {
            callback(data);
        },
        error: function(xhr, textstatus) {
            console.log(xhr.responseText);
            death("Server Error");
        }
    });
}

var server_jobstats_data = null;
function server_jobstats(callback)
{
    if (server_jobstats_data == null)
    {
        console.log("Querying for job stats");
        var params = mturk_parameters();
        if (params.workerid)
        {
            server_request("turkic_getjobstats",
                [params.hitid, params.workerid],
                function (data) {
                    server_jobstats_data = data;
                    callback(data);
                });
        }
        else
        {
            death("Job stats unavailable");
        }
    }
    else
    {
        callback(server_jobstats_data);
    }
}

function death(message)
{
    console.log(message);
    document.write("<style>body{background-color:#333;color:#fff;text-align:center;padding-top:100px;font-weight:bold;font-size:30px;font-family:Arial;</style>" + message);
}

if (!console)
{
    var console = new Object();
    console.log = function() {};
    console.dir = function() {};
}

/*
 * Preloads an array of images and calls onprogress.
 *
 * var list = ["foo.jpg", "bar.jpg"];
 * preload(list, function(progress) { alert(progress); }
 */
function preload(queue, onprogress)
{
    onprogress(0.0);

    function process(remaining, count)
    {
        if (remaining.length >= 1)
        {
            var image = new Image();
            image.onload = function() {
                
                // force the browser to cache it
                $("<img src='" + remaining[0] + "'>").appendTo("#preloadpit");

                if (onprogress)
                {
                    onprogress((count + 1) / (remaining.length + count))
                }
                remaining.shift();


                // javascript's version of tail recursion
                window.setTimeout(function() {
                    process(remaining, count + 1);
                }, 1);
            }
            image.src = remaining[0];
        }
        else
        {
            console.log("Preload of " + count + " images finished.");
        }
    }

    process(queue, 0.0);
}

function preloadvideo(start, stop, generator, onprogress)
{
    var queue = new Array();
    for (var i = start; i <= stop; i++)
    {
        queue[i-start] = generator(i);
    }
    preload(queue, onprogress);
}

/*
 * Updates a slider as the progress continues.
 *
 * var list = ["foo.jpg", "bar.jpg"];
 * preload(list, preloadslider($("#slider")));
 */
function preloadslider(slider, onprogress)
{
    function progress(percent)
    {
        if (onprogress) {
            onprogress(percent);
        }
        slider.children(".bar").width(percent * 100 + "%");
    }

    return progress;
}

// helper function
function addPieChart(/*string*/ id, /*string*/ parentId, 
                     /*int*/ width, /*int*/ height) {

    // NOT CALLED ANY MORE

    console.log("in addPieChart()");
    var parent = jQuery('#' + parentId);
    
    if (parent.length === 0) {
        throw 'Unable to find element with id ' + parentId + ' in addPieChart function.';
    }

    var canvas = jQuery('#' + id);
    
    if (canvas.length === 0) {
        console.log("creating a canvas tag whose id is "+id);
        jQuery('#' + parentId).append('<canvas id="' + id + '" class="canvas" width="' + width + '" ' + 
                                      'height="' + height + '" resize="false"></canvas>');
    }

    console.log("----------> element is: " + JSON.stringify( document.getElementById(id)));
    paper.setup(document.getElementById(id));


    return true;
    }; // end addPieChart



// Obj is, uh, what? It's the div tag which contains the canvas for paper to draw the pie chart on
function doDraw(/*object*/ obj)
{
    console.log("Entering draw method: obj is: "+obj.get(0)+ ", obj.data() is: "+(JSON.stringify(obj.data())));

    if (obj.data("paths") != null) {
        console.log("returning quickly from draw() because we already have paths for this data");
        return true;
    }

    var nums = obj.data('numbers');
    if (nums == null) {
        console.log("no data for pie chart");
        var text = new paper.PointText(paper.view.center);
        text.fillColor = "black";
        text.content = "No data for pie chart."
    }
    if (nums != null) {
        console.log("we have numbers! "+nums);
        // if we have numbers, we made sure it was an array when it was set in
        var sum = 0;
        for (var i = 0; i < nums.length; i++) {
            sum += nums[i];
        }
        var angles = new Array();
        for (i = 0; i< nums.length; i++) {
            angles[i] = (2 * Math.PI * nums[i] / sum);
        }

        // calculate center and radius for the pie chart
        var center = paper.view.center;
        console.log("doDraw(): paper.view.center is: "+paper.view.center.x+", "+paper.view.center.y);
        var radius;
        if (paper.view.size.width < paper.view.size.height) {
            radius = paper.view.size.width / 2;
        } else {
            radius = paper.view.size.height / 2;
        }

        radius -= 5; // bring it in a little so the edge doesn't get cut off
        console.log("doDraw(): radius is: "+radius);

        // we are going to keep the Path objects around so that we can remove them
        // from the Paper project if the data changes
        var paths = new Array;

        var start = new paper.Point(center.x + radius, center.y );      // first wedge starts at 3:00
        var through;
        var to;
        var throughangle= 0;
        var totalangle = 0;

        for (i = 0; i < nums.length; i++, start = to) {
            // each path starts at the center,
            paths[i] = new paper.Path(center);
            // goes straight out to the current startpoint,
            paths[i].add(start);

            // makes an arc along the perimeter of the circle
            //    "through" is halfway along the circle (explain this better)
            throughangle = totalangle + angles[i]/2;
            totalangle = totalangle + angles[i];
            var c1 = Math.cos(throughangle);
            console.log("doDraw(): c1 = "+c1);

            through = new paper.Point(radius * Math.cos(throughangle) + center.x, 
                                      radius * Math.sin(throughangle) + center.y);


            to = new paper.Point(radius * Math.cos(totalangle) + center.x,
                                 radius * Math.sin(totalangle) + center.y);

            console.log("doDraw(): paths["+i+"].arcTo(("+through.x+","+through.y+"), ("+to.x+","+ to.y+"))");
            paths[i].arcTo(through, to);

            // back to the center
            paths[i].closePath();

            // color it in
            console.log("about to stroke the path with "+obj.data("strokecolor"));
            if (obj.data("strokecolor") == null) {
                obj.data("strokewidth", 4);
                obj.data("strokecolor", "orange");
            }
            paths[i].strokeColor = obj.data("strokecolor");
            paths[i].strokeWidth = obj.data("strokewidth");

            // random colors for debugging
            paths[i].fillColor = '#' + Math.floor(Math.random()*16777215).toString(16);    

            $(this).data("paths", paths);

        } // end for
        paper.view.draw();
    }     // end if nums != null


}


// 
// Add our thing into jQuery
//


(function ($){

    var methods = {

        init: function(options) {
            console.log("entering init method with options:" + JSON.stringify(options));

            var defaults = {
                    label: "Hi There", 
                    labelPos: "top", 
                    strokecolor: "black", 
                    strokewidth: 2,
                    id: "piechart",
                    width: 400,
                    height: 400
                        };

            options = $.extend(defaults, options);

            console.log("after default processing the options are: "+JSON.stringify(options));

            return this.each(function() {
                obj = $(this);
                //console.log("setting data on obj: "+obj.get(0));
                obj.data(options); // this may be overriding previously set options to the defaults, check that
                console.log("obj.data is now: "+JSON.stringify(obj.data()));
                   
                // want to create a canvas as a child of the current obj
                if (obj.children("canvas.piechart").length != 0) {
                    // already have one, we're good
                    console.log("returning without creating canvas");
                    console.log("because we have this many: "+ obj.children("canvas").length);
                    return true;
                }

                var canvas;
                var canvasid = obj.data("id");
                var canvaswidth = obj.data("width");
                var canvasheight = obj.data("height");

              
                canvas = $('<canvas id="' + canvasid + '" class="canvas" width="' + canvaswidth + '" ' + 
                       'height="' + canvasheight + '" resize="false"></canvas>');
                canvas.class = "piechart";

                obj.append(canvas);

                paper = new paper.PaperScope();
                paper.setup(document.getElementById(canvasid));


                var path = paper.Path.Star(paper.view.center, 9, 50, 75);
                path.fillColor = "purple";
                path.strokeColor = "red";

                paper.view.draw();

                doDraw(obj);

            }); // end function(), end this.each, end return

        }, // end init

        draw: function (){  
             var obj = $(this);
             doDraw(obj);
        }, // end draw


        options: function(options){

             console.log("in options method, argument is: "+options);

             var nums = options.data;
             console.log("options.data: "+nums);

             // error checking?
             if (nums != null) {
                if ($.isArray(nums)) {
                    // set in the new data
                    $(this).data("numbers", nums); 
                    var paths = $(this).data("paths");
                    if (paths != null && $.isArray(paths)) {
                        for (var i = 0; i < paths.length; i++) {
                            paths[i].remove(); // removes old paths from project
                        }
                    }
                } else {
                    throw "Passed-in data must be an array.";
                }
            }
        }

    }; // end var methods


    $.fn.pieChart = function(methodOrOptions) {
        console.log("in function(methodOrOptions), argument is "+methodOrOptions);
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.pieChart' );
        }  // end else
    };     // end function(methodOrOptions)

})(jQuery);







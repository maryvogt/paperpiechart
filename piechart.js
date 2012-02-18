// TODO: 
// move "numbers" out from all the other options ?  probably not
// review methods.options - how does it get called? Not from the current paperchart.html!


// do "width" and "height" actually make sense? should it be "radius" instead?

// label placement


// generate uniqueish id's automatically for different canvases?                               

        

//-------------------------------//
// Helper functions              //
//-------------------------------//


// obj is the div tag which contains the canvas for paper to draw the pie chart on
function doDraw(/*object*/ obj, /* boolean */ dataChanged, /*PaperScope*/ scope)
{
    
    if (scope == null) {
        // may be stored in obj.data
        scope = obj.data("paperscope");
        if (scope == null) {
            return false;
        }
    }
    // if we already have paths, can we just reuse them?
    var paths = obj.data("paths");
    if (paths != null) {
        if (!dataChanged) {
            scope.view.draw();
            return true;
        }
        else // data has changed, have to remove the old paths
        {
            for (var i = 0; i < paths.length; i++) {
                paths[i].remove();
            }

        }
    }

    var nums = obj.data('numbers');
    if (nums == null) {
        var text = new scope.PointText(scope.view.center);
        text.fillColor = "black";
        text.content = "No data for pie chart."
    }
    if (nums != null) {
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
        var center = scope.view.center.clone();
        console.log('center: ' + center);
        var radius;
        if (scope.view.size.width < scope.view.size.height) {
            radius = scope.view.size.width / 2;
        } else {
            radius = scope.view.size.height / 2;
        }

        radius -= 5; // bring it in a little so the edge doesn't get cut off  (adjusting this for strokewidth would be nice)

        // we are going to keep the Path objects around so that we can remove them
        // from the Paper project if the data changes
        paths = new Array;

        var start = new scope.Point(center.x + radius, center.y );      // first wedge starts at 3:00
        var through;
        var to;
        var throughangle= 0;
        var totalangle = 0;

        for (i = 0; i < nums.length; i++, start = to) {
            // each path starts at the center,
            paths[i] = new scope.Path(center);
            // goes straight out to the current startpoint,
            paths[i].add(start);

            // makes an arc along the perimeter of the circle
            //    "through" is halfway along the circle (explain this better)
            throughangle = totalangle + angles[i]/2;
            totalangle = totalangle + angles[i];

            through = new scope.Point(radius * Math.cos(throughangle) + center.x, 
                                      radius * Math.sin(throughangle) + center.y);


            to = new scope.Point(radius * Math.cos(totalangle) + center.x,
                                 radius * Math.sin(totalangle) + center.y);


            paths[i].arcTo(through, to);

            // back to the center
            paths[i].closePath();

            // color it in

            paths[i].strokeColor = obj.data("strokecolor");
            paths[i].strokeWidth = obj.data("strokewidth");

            // random colors for debugging
            paths[i].fillColor = '#' + Math.floor(Math.random()*16777215).toString(16);    
            
            if (paths[i].strokeWidth == 0) {
                paths[i].strokeColor = paths[i].fillColor;
            }

            obj.data("paths", paths);

        } // end for

        scope.view.draw();
    }     // end if nums != null


}


// 
// Add our thing into jQuery
//


(function ($){

    var methods = {

        init: function(options) {    
            console.log("==> init(): options are: "+JSON.stringify(options));
            // 
            if ($.isArray(options)) {
                options = { numbers: options };
            }

            // "numbers" is a special option, being the actual data we are charting
            // so make a note if we have some numbers coming in
            var dataChanged = (options["numbers"] != null);

            // TODO: doublecheck the "initialized" mechanism.
            return this.each(function() {

                console.log("init(): iterating over selector, current iteration is "+this.id);
                var newOptions = options;
                obj = $(this);

                var oldOptions = obj.data();
                if (oldOptions.initialized == null) {         
                    oldOptions = {
                        // Default values for properties that we can't work without
                        initialized: true, // not foolproof, if some fool sets in "initialized = null" ?
                        strokecolor: "black", 
                        strokewidth: 2,
                        id: "piechart",
                        radius: 400,
                        }; // end oldOptions = {}
                }

                newOptions = $.extend(oldOptions, newOptions);

                // store the new properties
                obj.data(newOptions); 

                   
                // want to create a canvas as a child of the current obj
                if (obj.children("canvas.piechart").length === 0) {
                    var canvas;
                    var canvasid = obj.data("id");
                    var radius = obj.data("radius");  
                    radius += 4; // padding so that strokes don't get cut off at the edges
    
                    // as we add label options, the layout will get more complex, but right now let's just splat the thing in the middle of a canvas
                    console.log("init(): creating canvas, id = "+canvasid+", radius = "+radius);
                  
                    canvas = $('<canvas id="' + canvasid + '" width="' + radius + '" ' + 
                           'height="' + radius + '"></canvas>');
                    canvas.addClass("piechart");
                    canvas.css('background', '#' + Math.floor(Math.random()*16777215).toString(16));
    
                    
                    
                    obj.append(canvas);
                    // already have one, we're good
                    //console.log("returning without creating canvas");
                    //console.log("because we have this many: "+ obj.children("canvas").length);
                    //return true;

                    // just to be clear that we are not using a global variable named "paper"
                    var paperscope = new paper.PaperScope();                                 
                    paperscope.setup(document.getElementById(canvasid));                     
                    obj.data("paperscope", paperscope);                                      

                }

                paper = obj.data("paperscope");
                doDraw(obj, dataChanged, obj.data("paperscope"));

            }); // end function(), end this.each, end return
        }, // end init

        // in case we need to call draw from outside this code? 
        draw: function (){  
             var obj = $(this);
             doDraw(obj);
        }, // end draw


        //
        options: function(options){
             // 
             // How does this ever get called? is there any point in having this be separate from init? 
             console.log("==> in options(): args are: "+JSON.stringify(options));
             var nums = options.data; // is this the right syntax? 

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
        console.log("-----------> in function(methodOrOptions), argument is "+methodOrOptions);
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







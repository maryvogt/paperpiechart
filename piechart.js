// helper function
function addPieChart(/*string*/ id, /*string*/ parentId, 
                     /*int*/ width, /*int*/ height) {


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

    paper.setup(document.getElementById(id));


    return true;
    }; // end addPieChart



// 
// Add our thing into jQuery
//


(function ($){

    var methods = {

        init: function(options) {
            var defaults = {
                    label: "Hi There", 
                    labelPos: "top", 
                    strokecolor: "black", 
                    strokewidth: 2};

            options = $.extend(defaults, options);
            

            return this.each(function() {
                obj = $(this);
                obj.data(options);
                   
                // want to create a canvas as a child of the current obj
                if (obj.children() {
                }




                addPieChart("pieChart1", /* how to get the name of this */,  400, 400);
                obj.addClass('pieChart');

            }); // end function(), end this.each, end return
        }, // end init

        draw: function (){  
             console.log("Entering draw method");
             
             if ($(this).data("paths") != null) {
                 console.log("returning quickly from draw() because we already have paths for this data");
                 return true;
             }

             var nums = $(this).data('numbers');
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
                 var radius;
                 if (paper.view.size.width < paper.view.size.height) {
                     radius = paper.view.size.width / 2;
                 } else {
                     radius = paper.view.size.height / 2;
                 }
                 
                 radius -= 5; // bring it in a little so the edge doesn't get cut off

                 // we are going to keep the Path objects around so that we can remove them
                 // from the Paper project if the data changes
                 var paths = new Array;

                 var start = new paper.Point(center.x + radius, center.y );      // first wedge starts at 3:00
                 var through;
                 var to;
                 var throughangle;
                 var totalangle;

                 for (i = 0; i < nums.length; i++, start = to) {
                     // each path starts at the center,
                     paths[i] = new paper.Path(center);
                     // goes straight out to the current startpoint,
                     paths[i].add(start);

                     // makes an arc along the perimeter of the circle
                     //    "through" is halfway along the circle (explain this better)
                     throughangle = totalangle + angles[i]/2;
                     totalangle = totalangle + angles[i];

                     through = new paper.Point(radius * Math.cos(throughangle) + center.x, 
                                               radius * Math.sin(throughangle) + center.y);


                     to = new paper.Point(radius * Math.cos(totalangle) + center.x,
                                          radius * Math.sin(totalangle) + center.y);

                     paths[i].arcTo(through, to);

                     // back to the center
                     paths[i].closePath();

                     // color it in
                     console.log("about to stroke the path with "+$(this).data("strokecolor"));
                     if ($(this).data("strokecolor") == null) {
                         $(this).data("strokewidth", 4);
                         $(this).data("strokecolor", "orange");
                     }
                     paths[i].strokeColor = $(this).data("strokecolor");
                     paths[i].strokeWidth = $(this).data("strokewidth");

                     // random colors for debugging
                     paths[i].fillColor = '#' + Math.floor(Math.random()*16777215).toString(16);    

                     $(this).data("paths", paths);

                 } // end for
             }     // end if nums != null
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







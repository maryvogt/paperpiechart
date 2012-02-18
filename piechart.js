// TODO: 
// move "numbers" out from all the other options ?  probably not
// review methods.options - how does it get called? Not from the current paperchart.html!


// label placement

// choose your starting angle


// generate uniqueish id's automatically for different canvases?                               

        
// 
var piechartDefaults = {
    // Default values for properties that we can't work without
    strokecolor: "black", 
    strokewidth: 0,
    radius: 400
}; 
                
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
            for (var i = 0; i < wedgePaths.length; i++) {
                wedgePaths[i].remove();
                labelPaths[i].remove();
                textItems[i].remove();
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

        var radius = obj.data("radius");



        // we are going to keep the Path objects around so that we can remove them
        // from the Paper project if the data changes

        // TODO: tidier if it is an array of objects instead of a group of arrays
        
        var wedgePaths = new Array;
        var labelPaths = new Array;
        var textItems = new Array;

        var start = new scope.Point(center.x + radius, center.y );      // first wedge starts at 3:00
        var through;
        var to;
        var throughangle= 0;
        var totalangle = 0;

        var fillcolors = obj.data("colors");

        for (i = 0; i < nums.length; i++, start = to) {
            // each path starts at the center,
            wedgePaths[i] = new scope.Path(center);
            // goes straight out to the current startpoint,
            wedgePaths[i].add(start);

            // makes an arc along the perimeter of the circle
            //    "through" is halfway along the circle (explain this better)
            throughangle = totalangle + angles[i]/2;
            totalangle = totalangle + angles[i];

            through = new scope.Point(radius * Math.cos(throughangle) + center.x, 
                                      radius * Math.sin(throughangle) + center.y);


            to = new scope.Point(radius * Math.cos(totalangle) + center.x,
                                 radius * Math.sin(totalangle) + center.y);


            wedgePaths[i].arcTo(through, to);

            // back to the center
            wedgePaths[i].closePath();

            // color it in

            wedgePaths[i].strokeColor = obj.data("strokecolor");
            wedgePaths[i].strokeWidth = obj.data("strokewidth");

            // random colors for debugging
            if (fillcolors != null) {
                wedgePaths[i].fillColor = fillcolors[i];
//                console.log("doDraw: setting wedge color to "+fillcolors[i]);
            } else {
                console.log("doDraw(): picking a random color for wedge");
                wedgePaths[i].fillColor = '#' + Math.floor(Math.random()*16777215).toString(16);    
            }

            
            
            if (wedgePaths[i].strokeWidth == 0) {
                wedgePaths[i].strokeColor = wedgePaths[i].fillColor;
            }


            // okay great, now let's put some label markers in here
            // TODO: tweak and maybe optionize the hardcoded numbers here
            // TODO: how to deal when the line goes straight up or down?
            var labelStart = new scope.Point( 0.5 * radius * Math.cos(throughangle) + center.x,
                                              0.5 * radius * Math.sin(throughangle) + center.y);
            var labelTurn = new scope.Point( 1.25 * radius * Math.cos(throughangle) + center.x,
                                             1.25 * radius * Math.sin(throughangle) + center.y);
            var labelEnd;
            if (labelTurn.x >= center.x) { // turn right
                labelEnd = new scope.Point(labelTurn.x + 15, labelTurn.y);
            } else {
                labelEnd = new scope.Point(labelTurn.x - 15, labelTurn.y);
            }

            labelPaths[i] = new scope.Path(labelStart);
            labelPaths[i].add(labelTurn);
            labelPaths[i].add(labelEnd);

            labelPaths[i].strokeWidth = 1;
            labelPaths[i].strokeColor = "black";

            // aaaand, the labels themselves 

            labelEnd.y += 5;    // TODO, make this little tweak more real
            
            textItems[i] = new scope.PointText(labelEnd);
            textItems[i].fillColor = "black";
            if (obj.data("names") != null) {
                textItems[i].content = obj.data("names")[i] + ": "+nums[i].toString();
            } else {
                textItems[i].content = nums[i].toString();
            }

            textItems[i].justification = (labelEnd.x >= center.x) ? "left" : "right";
            


        } // end for


        obj.data("wedgePaths", wedgePaths);
        obj.data("labelPaths", labelPaths);
        obj.data("textItems", textItems);

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

                var oldOptions = obj.data("options");
//                console.log("init(): oldOptions are: "+JSON.stringify(oldOptions));
                if (oldOptions == null || oldOptions.initialized == null) {         
                    oldOptions = piechartDefaults;
                    console.log("init(): initializing to defaults");
                }


                for (var i in oldOptions ) {
                    if (newOptions[i] == null) {
                        newOptions[i] = oldOptions[i];
                    }
                }

                newOptions.initialized = "true";
                console.log("init(): newOptions are: " + JSON.stringify(newOptions));
                console.log("...and piechartDefaults are..." +JSON.stringify(piechartDefaults));


                // store the new properties
                obj.data(newOptions); 
                
                   
                // want to create a canvas as a child of the current obj
                if (obj.children("canvas.piechart").length === 0) {
                    var canvas;
                    var canvasid = obj.data("id");
                    
                    var radius = obj.data("radius");  
                    // TODO: padding must be adjustable
                    var canvassize = 2.5 * radius + 50;

    
                    // as we add label options, the layout will get more complex, but right now let's just splat the thing in the middle of a canvas
                    console.log("init(): creating canvas, id = "+canvasid+", radius = "+radius);
                  
                    canvas = $('<canvas id="' + canvasid + '" width="' + canvassize + '" ' + 
                           'height="' + canvassize + '"></canvas>');
                    canvas.addClass("piechart");
                    //canvas.css('background', '#' + Math.floor(Math.random()*16777215).toString(16));
                    var bkgcolor = Math.floor(Math.random()*16777215) | 0xc0c0c0;

                    canvas.css('background', '#' + bkgcolor.toString(16));
    
                    
                    
                    obj.append(canvas);
                    // already have one, we're good
                    //console.log("returning without creating canvas");
                    //console.log("because we have this many: "+ obj.children("canvas").length);
                    //return true;

                    // set up a PaperScope for drawing
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
                    doDraw($(this), true, $(this).data("paperscope"));
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







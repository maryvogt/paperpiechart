
// TODO: 

// make text items DOM elements; give them a class. This means that the browser will render them, 
// JQuery can get their size for layout
// ... and then we'll have to revisit the cleanup code again
// parent div will have to be position: relative , but the one the HTML dude made might have to be
// position absolute, so we have to make a new div tag within the HTML dude's parent. 

// move "numbers" out from all the other options ?  probably not
// review methods.options - how does it get called? Not from the current paperchart.html!



// label placement
// deal with overlapping labels



// choose your starting angle


// generate uniqueish id's automatically for different canvases?         

// what exactly do I need to cleanup?                        

// can the user get values back from the pie chart? 

        
// 
var piechartDefaults = {
    // Default values for properties that we can't work without
    strokecolor: "black", 
    strokewidth: 0,
    width: 200, 
    height: 200,
    id: "pccanv"}; 


var idcounter = 0;

//-------------------------------//
// Helper functions              //
//-------------------------------//

function doDraw()
{
    doDraw($(this), false, $(this).data("paperscope"));
}

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
    // if we already have paths, check to see if we need to redraw them

    var paperItems = obj.data("paperItems");
    if (paperItems != null && !dataChanged) {
        scope.view.draw();
        return true;
    }
    else if (paperItems != null) // data has changed, have to remove the old paper items
    {
        for (var i = 0; i < paperItems.length; i++) {
            paperItems[i].remove();
        }
    }
    

    var nums = obj.data('numbers');

    if (nums == null) {
        var text = new scope.PointText(scope.view.center);
        text.content = "No data for pie chart.";
        text.fillColor = "black";
        text.justification = "center";
        
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
        var width = obj.data("width");
        var height = obj.data("height");

        // figure out how much space to leave for labels
        var labels = obj.data("labels");
        var maxWidth = 0;
        var maxHeight = 0;

        if (labels != null){
            for (var i = 0; i < labels.length; i++) {
                console.log("doDraw(): labels["+i+"].width is "+labels[i].width());
                maxWidth = (labels[i].width() > maxWidth) ? labels[i].width() : maxWidth;
                maxHeight = (labels[i].height() > maxHeight) ? labels[i].height() : maxHeight;
            }
            console.log("doDraw(): maxWidth is "+maxWidth);
        }

        // make room for labels

        // 0.8 accounts for label pointer angle part
        // 15 accounts for label pointer end part
        // maxWidth accounts for label text
        // 2 is padding
        var xradius = 0.5 * width * 0.8 - 15 - maxWidth - 2; 
        var yradius = 0.5 * height * 0.8 - 15 - maxHeight;
        radius = (xradius < yradius) ? xradius : yradius;

        

        // these are all Items from PaperScript that need to be removed when we are done with them later
        var wedgePath;
        var labelPath;
        
        var start = new scope.Point(center.x + radius, center.y );      // first wedge starts at 3:00
        var through;
        var to;
        var throughangle= 0;
        var totalangle = 0;

        // fillcolors for wedges
        var fillcolors = obj.data("colors");

        // get the parent div (the one we created) for adding text label children
        var parentid = obj.data("divid");
        var parentdiv = $('#'+parentid);    
        var doNames = (obj.data("names") != null);

//        var testLabel = $('<span> 4 </span>');
//        testLabel.addClass("pclabel");
//        obj.children("div.piechartdiv").first().append(testLabel);
//        var testHeight = testLabel.height();
//        testLabel.remove();

        var labelHeight = obj.data("labelHeight");
        
        for (i = 0; i < nums.length; i++, start = to) {
            // each path starts at the center,
            wedgePath = new scope.Path(center);
            paperItems.push(wedgePath);   // add to the list of paper Items that will be cleaned up

            // goes straight out to the current startpoint,
            wedgePath.add(start);

            // makes an arc along the perimeter of the circle
            //    "through" is halfway along the circle (explain this better)
            throughangle = totalangle + angles[i]/2;
            totalangle = totalangle + angles[i];

            through = new scope.Point(radius * Math.cos(throughangle) + center.x, 
                                      radius * Math.sin(throughangle) + center.y);


            to = new scope.Point(radius * Math.cos(totalangle) + center.x,
                                 radius * Math.sin(totalangle) + center.y);


            wedgePath.arcTo(through, to);

            // back to the center
            wedgePath.closePath();

            // color it in

            wedgePath.strokeColor = obj.data("strokecolor");
            wedgePath.strokeWidth = obj.data("strokewidth");

            // random colors for debugging
            if (fillcolors != null) {
                wedgePath.fillColor = fillcolors[i];
//                console.log("doDraw: setting wedge color to "+fillcolors[i]);
            } else {
                wedgePath.fillColor = '#' + Math.floor(Math.random()*16777215).toString(16);    
            }

            
            
            if (wedgePath.strokeWidth == 0) {
                wedgePath.strokeColor = wedgePath.fillColor;
            }


            // okay great, now let's put some label markers in here
            // TODO: tweak and maybe optionize the hardcoded numbers here
            // TODO: how to deal when the line goes straight up or down?
            var labelStart = new scope.Point( 0.75 * radius * Math.cos(throughangle) + center.x,
                                              0.75 * radius * Math.sin(throughangle) + center.y);
            var labelTurn = new scope.Point( 1.25 * radius * Math.cos(throughangle) + center.x,
                                             1.25 * radius * Math.sin(throughangle) + center.y);
            var labelEnd;
            if (labelTurn.x >= center.x) { // turn right
                labelEnd = new scope.Point(labelTurn.x + 15, labelTurn.y);
            } else {
                labelEnd = new scope.Point(labelTurn.x - 15, labelTurn.y);
            }

            
            labelPath = new scope.Path(labelStart);
            labelPath.add(labelTurn);
            labelPath.add(labelEnd);
            paperItems.push(labelPath);

            labelPath.strokeWidth = 1;
            labelPath.strokeColor = "black";

//            var label = obj.data("labels")[i];

            
            
//            labelEnd.y -= labelHeight / 2;
            


            var doNames = obj.data("names") != null;
            var d = $('<span class="pclabel">'+ (doNames ? obj.data("names")[i] + ": " : '')+nums[i]+ '</span>');
            obj.children("div").eq(0).append(d);
            var w = d.width();
//                d.remove();
//            console.log("label text is "+label.text()+", label width is "+w);
            if (labelEnd.x < center.x) {
                labelEnd.x -= w;
            }

            d.css( {
                'position': 'absolute',
                'left': labelEnd.x+'px',
                'top':  labelEnd.y - (labelHeight / 2) +'px',
            });          

            
            // aaaand, the labels themselves 
//            var labelString = '<span>'+(doNames ? obj.data("names")[i] + ": " : '')+nums[i]+'</span>';
//           console.log("labelString is: "+labelString);
//            var labelText;      
//            labelText = $(labelString);
//            labelText.addClass("pclabel");
//            labelText.css( {
//                'position': 'absolute',
//                'left': labelEnd.x+'px',
//                'top': (labelEnd.y )+'px'
//            });          

//            parentdiv.append(labelText);

//            console.log("labelText.width is "+labelText.innerWidth());

        } // end for
    }     // end if nums != null

    
    scope.view.draw();
}


// 
// Add our thing into jQuery
//


(function ($){

    var methods = {

        init: function(options) {    
//            console.log("init(): options are "+JSON.stringify(options));
            // 
            if ($.isArray(options)) {
                options = { numbers: options };
            }

            // "numbers" is a special option, being the actual data we are charting
            // so make a note if we have some numbers coming in
            var dataChanged = (options != null) && (options["numbers"] != null);
//            console.log("init(): dataChanged is "+dataChanged);

            // TODO: doublecheck the "initialized" mechanism.
            return this.each(function() {

                var newOptions = options;
                var obj = $(this);

                var oldOptions = obj.data();
//                console.log("init(): oldOptions are: "+JSON.stringify(oldOptions));
                if (oldOptions == null || oldOptions.initialized == null) {         
                    oldOptions = piechartDefaults;
                }


                for (var i in oldOptions ) {
                    if (newOptions[i] == null) {
                        newOptions[i] = oldOptions[i];
                    }
                }

                newOptions.initialized = "true";

                // store the new properties
                obj.data(newOptions); 
                
                // we will create a div as a child of the current obj (which is also a div)
                // so that we can make sure our div is position: relative - then we create a canvas 
                // as a child of that, for paper.js to draw in

                var div;
                if (obj.children("div.piechartdiv").length === 0) {

                    // here's the div
                    var divid = obj.data("divid");
                    if (divid == null) {
                        divid = "pcdiv" + idcounter++;
                        obj.data("divid", divid);
                    }

                    div = $('<div id="' + divid + '"></div>');
                    div.addClass("piechartdiv");
                    div.css('position', 'relative');
                    obj.append(div);

                    // and here's the canvas
                    var canvas;
                    var canvasid = obj.data("id");
                    var canvaswidth = obj.data("width");
                    var canvasheight = obj.data("height");

    
                    // as we add label options, the layout will get more complex
                  
                    canvas = $('<canvas id="' + canvasid + '" width="' + canvaswidth + '" ' + 
                           'height="' + canvasheight + '"></canvas>');

                    obj.css({
                        'width': canvaswidth + 'px',
                        'height': canvasheight + 'px'
                    });
                    canvas.addClass("piechart");
                    //canvas.css('background', '#' + Math.floor(Math.random()*16777215).toString(16));

                    div.append(canvas);                    
                    
                    //set up a PaperScope for drawing
                    var paperscope = new paper.PaperScope();                                 
                    paperscope.setup(document.getElementById(canvasid));
                    paperscope.view.onResize = function(event) {
                        console.log('paper resize...');
                    };
                    obj.data("paperscope", paperscope);

                    // set up an array to hold items that need cleanup
                    var paperArray = new Array();
                    obj.data("paperItems", paperArray);

                } else {
                    div = obj.children("div.piechartdiv").first();
                }

                // add the labels for the wedges as children of the div
                var nums = obj.data("numbers");
                if (dataChanged) {
//                    var doNames = (obj.data("names") != null);
//                    var labels = new Array();
//                    for (var i = 0; i < nums.length; i++) {
//                        var labelString = '<span style="display:inline;">'+(doNames ? obj.data("names")[i] + ": " : '')+nums[i]+'</span>';
//                        var labelText;      
//                        labelText = $(labelString);
//                        labelText.addClass("pclabel");
//                        labelText.css({'position':'absolute'});
//                            
//                        div.append(labelText);
//                        
//                        labels.push(labelText);
                        //obj.data("paperItems").push(labelText);
                        // TODO need to figure out cleanup

//                    } // end for 
//                    obj.data("labels", labels);

                    var sampleLabel = $('<span> 5 </span>');
                    sampleLabel.addClass("pcLabel");
                    div.append(sampleLabel);
                    obj.data("labelHeight", sampleLabel.height());
                    sampleLabel.remove();
                } // end if dataChanged



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
             var nums = options.data; // is this the right syntax   ? 

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
//        console.log("in function methodOrOptions, argument is: "+methodOrOptions);
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







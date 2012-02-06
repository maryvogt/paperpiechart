
addPieChart: function(/*string*/ id, /*string*/ parentId, /*string*/ paperSource, 
                         /*int*/ width, /*int*/ height) {

        function($) {
            var parent = jQuery('#' + parentId);
            if (parent.length === 0) {
                throw 'Unable to find element with id ' + parentId + ' in addPieChart function.';
            }
    
            jQuery('#' + parentId).append('<canvas id="' + id + '" class="canvas" width="' + width + '" ' + 
                                     'height="' + height + '" resize="false"></canvas>');
    
            jQuery.ajax({
                url: paperSource,
                dataType: 'html',
                cache: false,
                success: function(data) {

                    paper = new paper.PaperScope();
                    paper.setup(document.getElementById(id));
                    paper.evaluate(data);

                }
            });
        });

        return true;
    }
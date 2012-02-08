(function($){


        /* These are the public methods */
    var methods = {
        init: function(options) {
            var defaults = {
                value: "left"
            };
            
            options = $.extend(defaults, options);
                        
            return this.each(function() {
                obj = $(this);
                
                if (obj.hasClass('pieChart')) {
                    /*
                     * Then it is already a pieChart and we don't have to do anything
                     */
                    return;
                }
                
                //console.log('obj: ' + obj);
                var body = obj.html();
                
                obj.addClass('pieChart');
                obj.css('position', 'relative');
                
            
                resize(obj);    
                position(obj);
                                
            }); // end return this.each()
        },      // end init

        /**   
         * This will return either 'left' or 'right'
         * depending on which span is visible.
         */
        value: function() {
            var obj = this;
            var left = obj.children().eq(0);
            if (left.is(':visible')) {
                return 'left';
            } else {
                return 'right';
            }
        },
        /**
         * The possible options are:
         * left: text to display on the left side,
         * right: text to display on the right side,
         * value: either 'left' or 'right' to be shown (with animation)
         */
        options: function(options) {
            var leftTxt = options.left;
            var rightTxt = options.right;
            var value = options.value;
            var obj = this;
            var left = obj.children().eq(0);
            var mid = obj.children().eq(1);
            var right = obj.children().eq(2);
            if (leftTxt) {
                left.html(leftTxt);
            }
            if (rightTxt) {
                right.html(rightTxt);
            }
            if (leftTxt || rightTxt) {
                resize(obj);
            }
            if ('left' === value) {
                slideRight($(this));
            } else if ('right' === value) {
                slideLeft($(this));
            }
        }
    }


 
    $.fn.pieChart = function(methodOrOptions){
        if (methods[methodOrOptions]){
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ){
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.pieChart' );
        }  
    };




})(jQuery);

(function($){
 
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

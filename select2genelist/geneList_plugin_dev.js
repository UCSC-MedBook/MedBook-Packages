/**
 * chrisw@soe.ucsc.edu
 * NOV 2015
 * geneList.js
 *
 * geneList select2 widget
 *
 * Requires:
 * 1) jquery
 * 2) select2 (js and css)
 *
 */

// expose namespace
geneListWidget = ( typeof geneListWidget === "undefined") ? {} : geneListWidget;
(function(glw) {"use strict";

    /**
     * Construct markup for displaying suggestion results.
     * @param {Object} suggestion
     */
    var formatSuggestions = function(suggestion) {
        var markup = [];

        markup.push("<div>");
        // markup.push("id:" + suggestion.id);
        // markup.push("<br>");
        // markup.push("text:" + suggestion.text);
        markup.push(suggestion.id);
        markup.push("</div>");

        return markup.join("");
    };

    /**
     * ID the selected suggestion.
     * @param {Object} suggestion
     */
    var formatSuggestionSelection = function(suggestion) {
        return suggestion.id || suggestion.text;
    };

    /**
     * Setup the the select tag as a select2 widget.
     * @param {Object} cssSelector
     * @param {Object} options
     */
    glw.setupWidget = function(cssSelector, options) {
        var jqSelection = $(cssSelector);
        if ("multiple" in options) {
            jqSelection.attr({
                multiple : options["multiple"]
            });
        }
        jqSelection.select2({
            placeholder : options["placeholder"],
            minimumInputLength : options["minimumInputLength"],
            ajax : {
                url : options["url"],
                dataType : 'json',
                delay : 250,
                data : function(params) {
                    var term = params.term;
                    return {
                        q : term.toUpperCase(), // search term
                        page : params.page
                    };
                },
                processResults : function(data, params) {
                    // parse the results into the format expected by Select2
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data, except to indicate that infinite
                    // scrolling can be used
                    params.page = params.page || 1;

                    return {
                        results : data.items,
                        pagination : {
                            more : (params.page * 20) < data.total_count
                        }
                    };
                },
                cache : true
            },
            escapeMarkup : function(markup) {
                return markup;
            },

            // let our custom formatter work
            // suggestion object has fields: "id" and "text"
            templateResult : formatSuggestions,
            templateSelection : formatSuggestionSelection
        });

        jqSelection.on("change", function(e) {
            if ( typeof options["changeEventCallback"] !== "undefined") {
                var value = jqSelection.val();
                options["changeEventCallback"](value);
            }
        });
    };

})(geneListWidget);

(function ($) {
    "use strict";

    var loadedImages = {},
        imageLoadIntervals = {},
        imageLoadTimeouts = {},
        imageLoadHandlers = {},
        imageLoadTimeoutHandlers = {},
        imagePreloadContainer = null;

    function checkIfLoaded(img, key) {
        if (img.height() && img.width()) {
            clearInterval(imageLoadIntervals[key]);
            clearTimeout(imageLoadTimeouts[key]);
            delete imageLoadIntervals[key];
            delete imageLoadTimeouts[key];
            delete imageLoadHandlers[key];
            loadedImages[key].resolveWith(img, img);
        }
    }

    function imageLoadTimeout(key) {
        if (imageLoadIntervals[key]) {
            clearInterval(imageLoadIntervals[key]);
            delete imageLoadIntervals[key];
            delete imageLoadTimeouts[key];
            delete imageLoadTimeoutHandlers[key];
            loadedImages[key].rejectWith();
        }
    }

    function loadImage(img, key) {
        var dfrd = new $.Deferred();
        // create a function to be called on intervals or load event
        imageLoadHandlers[key] = function () {
            checkIfLoaded(img, key);
        };
        // create a function to handle image load timeout
        imageLoadTimeoutHandlers[key] = function () {
            imageLoadTimeout(key);
        };
        // set image load check interval
        imageLoadIntervals[key] = setInterval(imageLoadHandlers[key], 100);
        // do not load forever
        imageLoadTimeouts[key] = setTimeout(imageLoadTimeoutHandlers[key], 1000);
        // set load event
        img.load(imageLoadHandlers[key]);
        // save deferred and return
        loadedImages[key] = dfrd;
        return loadedImages[key];
    }

    function createImagePreloadContainer () {
        return $("<div/>", {
                id: "a" + Math.floor(Math.random() * 1000),
                css: {
                    width: "1px", height: "1px",
                    position: "absolute", top: "-5000px", left: "-5000px",
                    overflow: "hidden"
                }
            }).appendTo("body");
    }

    function init(src) {
        var img,
            key = src && src.replace && src.replace(/[\W]+/g, "_");

        if (!key) {
            // invalid param
            return null;
        }

        if (loadedImages[key]) {
            // already requested
            return loadedImages[key].promise();
        }

        // create container on first call
        if (!imagePreloadContainer) {
            imagePreloadContainer = createImagePreloadContainer();
        }

        // create image element and append it to the container
        img = $("<img/>", { src: src }).appendTo(imagePreloadContainer);

        // load image and return load promise
        return loadImage(img, key).promise();
    }

    $.loadImage = init;

    $.fn.loadImage = function (src) {
        // this works only for img elements
        if (!this.is("img")) {
            return null;
        }
        return init(this.attr("src") || src);
    };

}(jQuery));
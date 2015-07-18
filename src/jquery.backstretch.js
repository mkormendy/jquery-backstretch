/*
 * Backstretch
 * http://srobbin.com/jquery-plugins/backstretch/
 *
 * Copyright (c) 2013 Scott Robbin
 * Licensed under the MIT license.
 *
 * Fork Version: 2.4
 * Fork Maintained By:
 * Mike Kormendy
 * https://github.com/mkormendy/jquery-backstretch
 * http://mikekormendy.com
 * http://somethinginteractive.com
 *
 * Caption Support:
 * Sebastian Sulinski
 * https://github.com/sebastiansulinski/jquery-backstretch
 * http://ssdtutorials.com
 *
 */
;(function ($, window, undefined) {
    'use strict';

    /* PLUGIN DEFINITION
     * ========================= */

    $.fn.backstretch = function (images, options) {
        // We need at least one image or method name
        if (images === undefined || images.length === 0) {
          $.error("No images were supplied for Backstretch");
        }

        /*
         * Scroll the page one pixel to get the right window height on iOS
         * Pretty harmless for everyone else
        */
        if ($(window).scrollTop() === 0 ) {
          window.scrollTo(0, 0);
        }

        return this.each(function () {
          var $this = $(this)
            , obj = $this.data('backstretch');

          // Do we already have an instance attached to this element?
          if (obj) {

            // Is this a method they're trying to execute?
            if (typeof images === 'string' && typeof obj[images] === 'function') {
              // Call the method
              obj[images](options);

              // No need to do anything further
              return;
            }

            // Merge the old options with the new
            options = $.extend(obj.options, options);

            // Remove the old instance
            obj.destroy(true);
          }

          obj = new Backstretch(this, images, options || {});
          $this.data('backstretch', obj);
        });
    };

    // If no element is supplied, we'll attach to body
    $.backstretch = function (images, options) {
      // Return the instance
      return $('body')
              .backstretch(images, options)
              .data('backstretch');
    };

    // Custom selector
    $.expr[':'].backstretch = function(elem) {
      return $(elem).data('backstretch') !== undefined;
    };

    /* DEFAULTS
     * ========================= */

    $.fn.backstretch.defaults = {
      //  offsetX // leave as undefined
      //  offsetY // leave as undefined
          centeredX: true   // Should we center the image on the X axis?
        , centeredY: true   // Should we center the image on the Y axis?
        , duration: 5000    // Amount of time in between slides (if slideshow)
        , fade: 0           // Speed of fade transition between slides
        , paused: false   // Whether the images should slide after given duration
        , lazyload: false // Should the images be lazy loaded?
        , start: 0      // Index of the first image to show
        , captionAppendTo: 'body'
        , dataCaption: 'bootstrap-image'
        , dataCaptionIndexSeparator: '_'
        , captionHideClass: 'hide'
    };

    /* STYLES
     * 
     * Baked-in styles that we'll apply to our elements.
     * In an effort to keep the plugin simple, these are not exposed as options.
     * That said, anyone can override these in their own stylesheet.
     * ========================= */
    var styles = {
        wrap: {
            left: 0
          , top: 0
          , overflow: 'hidden'
          , margin: 0
          , padding: 0
          , height: '100%'
          , width: '100%'
          , zIndex: -999999
        }
      , img: {
            position: 'absolute'
          , display: 'none'
          , margin: 0
          , padding: 0
          , border: 'none'
          , width: 'auto'
          , height: 'auto'
          , maxHeight: 'none'
          , maxWidth: 'none'
          , zIndex: -999999
        }
    };

    /* CLASS DEFINITION
     * ========================= */
    var Backstretch = function (container, images, options) {
        this.options = $.extend({}, $.fn.backstretch.defaults, options || {});

        /**
         *  share access to the object instance from within other functions/methods
         */ 
        var self = this;

        /* In its simplest form, we allow Backstretch to be called on an image path.
         * e.g. $.backstretch('/path/to/image.jpg')
         * So, we need to turn this back into an array.
         */
        self.images = $.isArray(images) ? images : [images];

        /**
         * Paused-Option
         */
        if (self.options.paused) {
            self.paused = true;
        }

        /**
         * Start-Option (Index)
         */
        if (self.options.start >= self.images.length) {
            self.options.start = self.images.length - 1;
        }
        if (self.options.start < 0) {
            self.options.start = 0;
        }
        
        /**
         * Lazy-Loading or Pre-loading
         */
        if (options.lazyload && self.images[self.options.start]) {
            $.each(self.images, function (key, value) {
                // check if the slides are objects with individual options
                if (typeof self.images[key] === 'object') {
                    $('<img />')[0].src = self.images[self.options.start].src;
                    if (typeof self.images[key].caption !== 'undefined') {
                        self.appendCaption(key, value.src, value.caption);
                    }
                    else {
                        self.appendCaption(key, value.src, '');
                    }
                }
                else {
                    $('<img />')[0].src = self.images[self.options.start];
                }
            });
        }
        else {
            $.each(self.images, function (key, value) {
                // check if the slides are objects with individual options
                if (typeof self.images[key] === 'object') {
                    $('<img />')[0].src = value.src;
                    if (typeof self.images[key].caption !== 'undefined') {
                        self.appendCaption(key, value.src, value.caption);
                    }
                }
                else {
                    $('<img />')[0].src = this;
                }
            });
        }

        // Convenience reference to know if the container is body.
        self.isBody = container === document.body;

        /* We're keeping track of a few different elements
         *
         * Container: the element that Backstretch was called on.
         * Wrap: a DIV that we place the image into, so we can hide the overflow.
         * Root: Convenience reference to help calculate the correct height.
         */
        self.$container = $(container);
        self.$root = self.isBody ? supportsFixedPosition ? $(window) : $(document) : self.$container;

        // Don't create a new wrap if one already exists (from a previous instance of Backstretch)
        var $existing = self.$container.children(".backstretch").first();
        self.$wrap = $existing.length ? $existing : $('<div class="backstretch"></div>').css(styles.wrap).appendTo(self.$container);

        // Non-body elements need some style adjustments
        if (!self.isBody) {
            // If the container is statically positioned, we need to make it relative,
            // and if no zIndex is defined, we should set it to zero.
            var position = self.$container.css('position')
              , zIndex = self.$container.css('zIndex');
  
            self.$container.css({
                position: position === 'static' ? 'relative' : position
              , zIndex: zIndex === 'auto' ? 0 : zIndex
              , background: 'none'
            });
            
            // Needs a higher z-index
            self.$wrap.css({zIndex: -999998});
        }

        // Fixed or absolute positioning?
        self.$wrap.css({
            position: self.isBody && supportsFixedPosition ? 'fixed' : 'absolute'
        });

        // Set the first image
        self.index = self.options.start;
        self.show(self.index);

        // Listen for resize
        $(window).on('resize.backstretch', $.proxy(self.resize, self))
                 .on('orientationchange.backstretch', $.proxy(function () {

                    // Need to do this in order to get the right window height
                    if (self.isBody && window.pageYOffset === 0) {
                      window.scrollTo(0, 1);
                      self.resize;
                    }
                 }, self));

    };

    /* PUBLIC METHODS
     * ========================= */
    Backstretch.prototype = {

        resize: function () {

            try {
                var self = this
                  , newIndex = self.index
                  , bgCSS = {left: 0, top: 0}
                  , landscape = (Math.ceil(window.innerWidth / window.innerHeight) > Math.ceil(screen.width / screen.height))
                  , rootWidth = this.isBody ? (isMobile ? (landscape ? screen.height : screen.width) : this.$root.width()) : this.$root.innerWidth()
                  , bgWidth = rootWidth
                  , rootHeight = this.isBody ? (isMobile ? (landscape ? screen.width : screen.height) : (window.innerHeight ? window.innerHeight : this.$root.height() )) : this.$root.innerHeight()
                  , bgHeight = bgWidth / this.$img.data('ratio')
                  , bgOffset
                  , wiggleRoom
                  , optionsType = (typeof self.images[newIndex] === 'object') ? self.images[newIndex] : this.options;
                    
                    // Fixes triggering of resize before image ratio is known (iOS 6 at least)
                    if (isNaN(bgHeight)) {
                        return this;
                    }

                    // Make adjustments based on image ratio
                    if (bgHeight >= rootHeight) {
                        if (this.options.centeredY && typeof optionsType.offsetY === 'undefined') {
                            bgOffset = (bgHeight - rootHeight) / 2;
                        }
                        else if (optionsType.offsetY) {
                            wiggleRoom = rootHeight - bgHeight;
                            bgOffset = 0 - wiggleRoom * optionsType.offsetY;
                        }
                        if (bgOffset) {
                            bgCSS.top = 0 - bgOffset + 'px';
                        }
                    } else {
                        bgHeight = rootHeight;
                        bgWidth = bgHeight * this.$img.data('ratio');
                        if (this.options.centeredX && typeof optionsType.offsetX === 'undefined') {
                            bgOffset = (bgWidth - rootWidth) / 2;
                        }
                        else if (optionsType.offsetX) {
                            wiggleRoom = rootWidth - bgWidth;
                            bgOffset = 0 - wiggleRoom * optionsType.offsetX;
                        }
                        if (bgOffset) {
                            bgCSS.left = 0 - bgOffset + 'px';
                        }
                    }

                    // Resize the wrapper and the image based on the above calculations
                    this.$wrap.css({width: rootWidth, height: rootHeight})
                              .find('img:not(.deleteable)').css({width: bgWidth, height: bgHeight}).css(bgCSS);
            } catch(err) {
                // IE7 seems to trigger resize before the image is loaded.
                // This try/catch block is a hack to let it fail gracefully.
            }
            
        }

        // Show the slide at a certain position
      , show: function (newIndex) {

            // Validate index
            if (Math.abs(newIndex) > this.images.length - 1) {
                return;
            }

            // Vars
            var self         = this
              , currentIndex = this.index
              , oldImage     = self.$wrap.find('img').addClass('deleteable')
              , evtOptions   = { relatedTarget: self.$container[0] };

            // Trigger the "before" event
            self.$container.trigger($.Event('backstretch.before', evtOptions), [self, newIndex]); 

            // Set the new index
            self.index = newIndex;

            // Pause the slideshow
            clearInterval(self.interval);

            // Update caption if it exists
            if (typeof self.images[newIndex] === 'object') {
                self.updateCaption(
                    currentIndex,
                    self.index,
                    self.images[newIndex].caption
                );
            }

            // New image
            self.$img = $('<img />')
                        .css(styles.img)
                        .bind('load', function (e) {
                            var imgWidth = this.width || $(e.target).width()
                              , imgHeight = this.height || $(e.target).height();
                            
                            // Save the ratio
                            $(this).data('ratio', imgWidth / imgHeight);

                            // Show the image, then delete the old one
                            // "speed" option has been deprecated, but we want backwards compatibilty
                            $(this).fadeIn(self.options.speed || self.options.fade, function () {
                                oldImage.remove();

                                // Resume the slideshow
                                if (!self.paused) {
                                    self.cycle();
                                }

                                // Trigger the "after" and "show" events
                                // "show" is being deprecated
                                $(['after', 'show']).each(function () {
                                    self.$container.trigger($.Event('backstretch.' + this, evtOptions), [self, newIndex]);
                                });
                            });

                            // Resize
                            self.resize(newIndex);
                        })
                        .appendTo(self.$wrap);

            // Hack for IE img onload event
            if (typeof self.images[newIndex] !== 'object') {
                self.$img.attr('src', self.images[newIndex]);
            }
            else if (typeof self.images[newIndex].src === 'string') {
                self.$img.attr('src', self.images[newIndex].src);
            }
            return self;
        }

      , next: function () {
            // Next slide
            return this.show(this.index < this.images.length - 1 ? this.index + 1 : 0);
        }

      , prev: function () {
            // Previous slide
            return this.show(this.index === 0 ? this.images.length - 1 : this.index - 1);
        }

      , pause: function () {
            // Pause the slideshow
            this.paused = true;
            return this;
        }

      , resume: function () {
            // Resume the slideshow
            this.paused = false;
            this.next();
            return this;
        }

      , cycle: function () {
            // Start/resume the slideshow
            if(this.images.length > 1) {
                // Clear the interval, just in case
                clearInterval(this.interval);

                this.interval = setInterval($.proxy(function () {
                    // Check for paused slideshow
                    if (!this.paused) {
                        this.next();
                    }
                }, this), this.options.duration);
            }
            return this;
        }

      , destroy: function (preserveBackground) {
            // Stop the resize events
            $(window).off('resize.backstretch orientationchange.backstretch');

            // Clear the interval
            clearInterval(this.interval);

            // Remove Backstretch
            if(!preserveBackground) {
              this.$wrap.remove();          
            }
            this.$container.removeData('backstretch');
        }

      /*
       * Caption Methods
       */

      , appendCaption: function (index, src, content) {
            var caption = '<div style="display: none;" data-';
                caption += this.options.dataCaption;
                caption += '="';
                caption += src + this.options.dataCaptionIndexSeparator + index;
                caption += '"';
                caption += index != 0 ? ' class="' + this.options.captionHideClass + '"' : '';
                caption += '>';
                caption += content;
                caption += '</div>';

            $(this.options.captionAppendTo).append(caption);
        }

      , updateCaption: function (existingIndex, newIndex, content) {
            var self        = this
              , existingSrc = self.images[existingIndex].src
                            + self.options.dataCaptionIndexSeparator
                            + existingIndex
              , newSrc      = self.images[newIndex].src
                            + self.options.dataCaptionIndexSeparator
                            + newIndex
              , fade        = this.options.fade; // used for halving the total image cross-fade time, 1/2 fade out 1/2 fade in

            $('[data-' + self.options.dataCaption + '="' + existingSrc + '"]')
                .fadeOut(fade/2, function() {
                    $(this).addClass(self.options.captionHideClass);
                    if (typeof content === 'undefined') {
                        $('[data-' + self.options.dataCaption + '="' + newSrc + '"]')
                            .removeClass(self.options.captionHideClass);
                    }
                    else {
                        $('[data-' + self.options.dataCaption + '="' + newSrc + '"]')
                            .fadeIn(fade/2)
                            .removeClass(self.options.captionHideClass);
                    }
            });
        }
    };

    /* SUPPORTS FIXED POSITION?
     *
     * Based on code from jQuery Mobile 1.1.0
     * http://jquerymobile.com/
     *
     * In a nutshell, we need to figure out if fixed positioning is supported.
     * Unfortunately, this is very difficult to do on iOS, and usually involves
     * injecting content, scrolling the page, etc.. It's ugly.
     * jQuery Mobile uses this workaround. It's not ideal, but works.
     *
     * Modified to detect IE6
     * ========================= */

    var supportsFixedPosition = (function () {
      var ua = navigator.userAgent
        , platform = navigator.platform
          // Rendering engine is Webkit, and capture major version
        , wkmatch = ua.match( /AppleWebKit\/([0-9]+)/ )
        , wkversion = !!wkmatch && wkmatch[ 1 ]
        , ffmatch = ua.match( /Fennec\/([0-9]+)/ )
        , ffversion = !!ffmatch && ffmatch[ 1 ]
        , operammobilematch = ua.match( /Opera Mobi\/([0-9]+)/ )
        , omversion = !!operammobilematch && operammobilematch[ 1 ]
        , iematch = ua.match( /MSIE ([0-9]+)/ )
        , ieversion = !!iematch && iematch[ 1 ];

      return !(
        // iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
        ((platform.indexOf( "iPhone" ) > -1 || platform.indexOf( "iPad" ) > -1  || platform.indexOf( "iPod" ) > -1 ) && wkversion && wkversion < 534) ||
        
        // Opera Mini
        (window.operamini && ({}).toString.call( window.operamini ) === "[object OperaMini]") ||
        (operammobilematch && omversion < 7458) ||
        
        //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
        (ua.indexOf( "Android" ) > -1 && wkversion && wkversion < 533) ||
        
        // Firefox Mobile before 6.0 -
        (ffversion && ffversion < 6) ||
        
        // WebOS less than 3
        ("palmGetResource" in window && wkversion && wkversion < 534) ||
        
        // MeeGo
        (ua.indexOf( "MeeGo" ) > -1 && ua.indexOf( "NokiaBrowser/8.5.0" ) > -1) ||
        
        // IE6
        (ieversion && ieversion <= 6)
      );
    }());

    var isMobile = navigator.userAgent.match(/Mobi/i);

}(jQuery, window));
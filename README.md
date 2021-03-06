# Backstretch

Backstretch is a simple jQuery plugin that allows you to add a dynamically-resized, slideshow-capable (with lazy-loading) background image to any page or element. The image will stretch to fit the page/element, and will automatically resize as the window/element size changes.
## Demo

Feel free to check out the live examples [on the original project page itself](http://srobbin.com/jquery-plugins/backstretch/).

Further examples can be found within the repository package, which include:

* lazy-loading
* start slideshow at different index
* offset positioning for x and y
* captions
* combined options of images with offsets, and captions

## Setup

Include the jQuery library (version 1.7 or newer) and Backstretch plugin files in your webpage (preferably at the bottom of the page, before the closing BODY tag):

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<script src="jquery.backstretch.min.js"></script>
<script>
  // To attach Backstrech as the body's background
  $.backstretch("path/to/image.jpg");

  // You may also attach Backstretch to a block-level element
  $(".foo").backstretch("path/to/image.jpg");

  // Or, to start a slideshow, just pass in an array of images
  $(".foo").backstretch([
    "path/to/image.jpg",
    "path/to/image2.jpg",
    "path/to/image3.jpg"    
  ], {duration: 4000});
</script>
```
## Per Frame Slideshow Settings

The following examples show per frame slideshow settings.

### Captions and Offset

Each frame can have custom text (or HTML) for each frame. As well each image can have custom image offset settings. You can style the captions

```javascript
// To attach Backstrech as the body's background
$.backstretch(
	 [
        {
            "src" : "path/to/image.jpg",
            "caption" : "<h1>Image caption goes here</h1>"
        }
	 ]
);

// Attach Backstretch to a block-level element and have the image offset
$(".foo").backstretch(
    [
        {
            "src" : "path/to/image.jpg",
            "caption" : "<h1>Image caption goes here</h1>",
            "offsetX" : 0.7,
            "offsetY" : 0.3
        }
    ]
);

// A complex example, slideshow, offsets that appends the captions to a specific element ID 
$(".foo").backstretch(
    [
        {
            "src" : "path/to/image.jpg",
            "caption" : "<h1>Image caption goes here</h1>"
        },
        {
            "src" : "path/to/image2.jpg",
            // no caption!
            "offsetX" : 0,
            "offsetY" : 1
        },
        {
           "src" : "path/to/image3.jpg",
           "caption" : "<h1>Image 3 caption goes here</h1>"
        }
    ],
    {
        fade: 750,
        duration: 4000,
        captionAppendTo: '#wrapper'
    }
);
```

## Options

| Name | Description | Type | Default |
|------|-------------|------|---------|
| `caption` | A block of [**quote-escaped**](http://stackoverflow.com/questions/2004168/escape-quotes-in-javascript) text. Accepts most basic HTML (not tested with iFrames, canvas or media tags).<br><small>Credit (sebastiansulinski): [https://github.com/sebastiansulinski/jquery-backstretch](https://github.com/sebastiansulinski/jquery-backstretch)</small> | String | undefined |
| `captionAppendTo` | Input any standard css selector to target where the captions are appended in place.<br><small>Credit (sebastiansulinski): [https://github.com/sebastiansulinski/jquery-backstretch](https://github.com/sebastiansulinski/jquery-backstretch)</small> | String | body |
| `offsetX` | Accepts a number between 0 and 1. When 0, the image is offset all the way to the left. When 1, it's all the way to right. When the value is 0.5, it's centered exactly in the middle (the same as centeredX = true)<br><small>Credit (null-null-null): [https://github.com/null-null-null/jquery-backstretch](https://github.com/null-null-null/jquery-backstretch)</small> | Integer | undefined |
| `offsetY` | Same as offsetX, only it adjusts the offset along the Y axis (again a value of 0.5 is the same as centeredY = true).<br><small>Credit (null-null-null): [https://github.com/null-null-null/jquery-backstretch](https://github.com/null-null-null/jquery-backstretch)</small> | Integer | undefined |
| `centeredX` | The ratio of the width/height of the image doesn't always jive with the width/height of the window. This parameter controls whether or not we center the image on the X axis to account for the discrepancy. | Boolean | true |
| `centeredY` | This parameter controls whether or not we center the image on the Y axis to account for the aforementioned discrepancy. | Boolean | true |
| `fade` | This is the speed at which the image will fade in. Integers in milliseconds are accepted, as well as standard jQuery speed strings (slow, normal, fast). | Integer or String | 0 |
| `duration` | The amount of time in between slides, when using Backstretch as a slideshow, expressed as the number of milliseconds. | Integer | 5000 |
| `paused` | For slideshows: Disables the change between slides | Boolean | false |
| `lazyload` | Activates the lazy-loading-functionality für slideshows. This means the next slide that is about to be shown, is loaded right before showing. *The time it takes to load the next image will increase the standard set duration between itself and the previous image.* <br><small>Credit (SpazzMarticus): [https://github.com/SpazzMarticus/jquery-backstretch](https://github.com/SpazzMarticus/jquery-backstretch)</small> | Boolean | false |
| `start` | The index of the image in the array you want to start your slideshow with.<br><small>Credit (SpazzMarticus): [https://github.com/SpazzMarticus/jquery-backstretch](https://github.com/SpazzMarticus/jquery-backstretch)</small> | Integer | 0 |

## Slideshow API

Once you've instantiated a Backstretch slideshow, there are many actions that you can perform it:

```javascript
// Start a slideshow
$('.foo').backstretch([
  'path/to/image.jpg',
  'path/to/image2.jpg',
  'path/to/image3.jpg'
]);

// Pause the slideshow
$('.foo').backstretch("pause");

// Advance to the next slide
$('.foo').backstretch("next");
```

| Method | Description |
|------|-------------|
| `.backstretch("show", n)` | Jump to the slide at a given index, where n is the number of the image that you'd like to display. Slide number starts at 0. |
| `.backstretch("prev")` | Display the previous image in a slideshow. |
| `.backstretch("next")` | Advance to the next image in a slideshow. |
| `.backstretch("pause")` | Pause the slideshow. |
| `.backstretch("resume")` | Resume a paused slideshow. |
| `.backstretch("destroy", preserveBackground)` | Destroy the Backstretch instance. Optionally, you can pass in a Boolean parameter, preserveBackground, to determine whether or not you'd like to keep the current image stretched as the background image. |
| `.backstretch("resize")` | This method is called automatically when the container (window or block-level element) is resized, however you can always call this manually if needed. |

## Public Variables

Sometimes, you'll want to access Backstretch's images after you've instantiated the plugin. For example, perhaps you'd like to be able add more images to a slideshow. Doing so is easy. You can access the images array as follows:

```javascript
$('.foo').backstretch([
  'path/to/image.jpg',
  'path/to/image2.jpg',
  'path/to/image3.jpg'
]);

// Access the instance
var instance = $('.foo').data('backstretch');

// Then, you can manipulate the images array directly
instance.images.push('path/to/image4.jpg')
```

Additionally, the current index of a slideshow is available through the instance as well:

```javascript
$("body").data("backstretch").index;
```

## Events

### backstretch.before

Backstretch will fire a "backstretch.before" event before a new image loads, triggering a function that is passed the event, Backstretch instance, and index of the image that will be displayed. If you listen for that event, you can, for example, coordinate other changes to coincide with your slideshow.

```javascript
$(window).on("backstretch.before", function (e, instance, index) {
  // If we wanted to stop the slideshow after it reached the end
  if (index === instance.images.length - 1) {
    instance.pause();
  };
});
```

### backstretch.after

Backstretch will also fire a "backstretch.after" event after the new images has completed loading.

```javascript
$(window).on("backstretch.after", function (e, instance, index) {
  // Do something
});
```

## Changelog

###Version 2.4

* Combined capabilities for lazy-loading, image offset functionality and captions

###Version 2.3

* Added caption functionality.

###Version 2.2

* Added offset functionality


###Version 2.1

* Added lazy-loading functionality

### Version 2.0

* Now accepts an array of images to create a slideshow
* Can attach Backstretch to any block-level element, not just the body
* Deprecated "speed" option in favor of "fade" for fadeIn timing
* Added "duration" option, and Slideshow API

### Version 1.2

* You can now called backstretch twice, and it will replace the existing image.

### Version 1.1

* Added 'centeredX' and 'centeredY' options.
* Removed 'hideUntilReady' option. It looks pretty bad if you don't hide the image until it's fully loaded.
* Fixed IE img onload bug.
* Now supports iPhone/iPad orientation changes.

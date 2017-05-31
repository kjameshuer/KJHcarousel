# KJHcarousel
### Another simple jQuery carousel plugin

___

## Use

  #### HTML:
  ```  
    <div id="shoes">
        <div class="shoe"></div>
        <div class="shoe"></div>
    </div>
  ```  
  #### Javascript:
  
  ```
  var args = {
      autoPlay: true,
      autoDelay: 4000
  }
  var KJH = KJHcarousel(document.getElementById('shoes'),args);
  ```

  ## Options (args)
  **autoDelay** : *number*
  Determines the time a slide remains active before switching to the next slide (default: 4000)

  **autoPlay** : *boolean*
  Determines if carousel cycles through slides automatically (default:false)

 **changeSpeed** : *number*
 Amount of time in ms it takes to transition from one slide to the next (default: 300)

  **clickable** : *boolean*
 Determines if child becomes "active" slide when clicked (default: false)

 **customNext** : *string/object*
 Element used as "next" button (default: '>')

 **customPrev** : *string/object*
 Element used as "previous" button (default: '<')

 **indicatorActive** : *boolean*
 Determines whether an indicator is shown that represents the "count down" time between slides (default: false)

 **afterMove** : *function*
 Callback function after the carousel has finished transitioning to the next slide

 **beforeMove** : *function*
 Callback function before the carousel transitions to the next slide

 **initialFunction** : *function*
 Function that executes after carousel creation but before carousel is active

**onResize** : *function*
Function that fires when window is resized
 
 ## Methods
 **moveBackward()**
Move backward one slide in carousel

 **moveForward()**
 Move forward one slide in carousel

 **resize()**
 Forces the execution of onResize

 **setActiveChild(number)**
 Sets the active slide to the number provided if valid. 0 = first child;
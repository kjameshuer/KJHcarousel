(function ($, global) {

    var KJHcarousel = function (element, clickable) {
        return new KJHcarousel.init(element, clickable);
    };


    // attach KJHcarousel to global object (window)
    global.KJHcarousel = KJHcarousel;

    // set up properties for KJHcarousel
    KJHcarousel.init = function (element, args) {

        if (elementDoesNotExist(element)) throw 'Parent element does not exist';
        if (alreadyACarousel(element)) throw 'Carousel already exists in this element';
        if (elementHasNoChildren(element)) throw 'Parent element has no children to place in carousel';
        

        var self = this;
        var argsExist = (args === undefined) ? false : true;
        //args
        self.clickable = (argsExist && args.clickable !== undefined) ? args.clickable : false;
        self.initialFunction = (argsExist && isExpected(args.init, ['function'], 'init')) ? args.init : undefined;
        self.beforeMove = (argsExist && isExpected(args.beforeMove, ['function'], 'beforeMove')) ? args.beforeMove : undefined;
        self.afterMove = (argsExist &&isExpected(args.afterMove, ['function'], 'afterMove')) ? args.afterMove : undefined;
        self.onResize = (argsExist && isExpected(args.onResize, ['function'], 'onResize')) ? args.onResize : undefined;
        self.changeSpeed = (argsExist && isExpected(args.changeSpeed, ['string','number'], 'changeSpeed')) ? parseInt(args.changeSpeed) : 300;
        self.customPrev = (argsExist && isExpected(args.customPrev, ['string', 'object'], 'customPrev')) ? args.customPrev : undefined;
        self.customNext = (argsExist && isExpected(args.customNext, ['string', 'object'], 'customPrev')) ? args.customNext : undefined;
        self.autoDelay = (argsExist && isExpected(args.autoDelay, ['string','number'], 'autoDelay')) ? parseInt(args.autoDelay) : 4000;
        self.autoPlay = (argsExist && args.autoPlay !== undefined) ? args.autoPlay : false;
        self.autoInterval;
        self.timeIndicator;
        self.indicatorActive = (argsExist && args.indicatorOn !== undefined) ? args.indicatorOn : false;
        self.outer = $(element);
        self.children = $(createChildren(self.outer));
        self.childLength = self.children.length - 1;
        self.wrapper = createWrapper(self);
        self.activeChild = 0;
        self.moving = false;
        self.resizeVar = debounce(function () {
            self.resize();
        }, 150);
        self.width = $(window).width();
        createSlider(self);

    };

    // public methods for KJHcarousel
    KJHcarousel.prototype = {
        setActiveChild: function (num, resize) {

            if (this.beforeMove !== undefined && this.beforeMove !== null) {
                this.beforeMove();
            }

            if (this.autoPlay && this.indicatorActive) {
                resetIndicator(this);
                startIndicator(this);
            }

            var isResizing = resize || false;


            if (num > this.childLength || num < 0) {
                throw('invalid child number for setActiveChild');
            }
            var curActiveChild = this.activeChild;
            var wrapper = this.wrapper;
            this.activeChild = num;


            $(this.children).removeClass('active');
            $($(this.children)[this.activeChild]).addClass('active');

            var curLeft = parseInt(wrapper.css('left').replace('px', ''));


            var diff = findWidthDifference(curActiveChild, num, curLeft, isResizing, this);

            var newLeft = curLeft + diff;

            clearTimeout(waitForChange);
            var that = this;
            var waitForChange = setTimeout(function () {
                that.toggleMoving(false);
                if (that.afterMove !== undefined && that.afterMove !== null) {
                    that.afterMove();
                }
            }, this.changeSpeed);

            wrapper.css({
                left: newLeft + 'px'
            });

            return this;
        },
        moveBackward: function () {
            var curPos = this.activeChild;

            var newPos = (curPos === 0) ? this.childLength : curPos - 1;

            this.setActiveChild(newPos);

            return this;


        },
        moveForward: function () {
            var curPos = this.activeChild;
            var newPos = (curPos === this.childLength) ? 0 : curPos + 1;
            this.setActiveChild(newPos);

            return this;
        },
        toggleMoving: function (val) {

            this.moving = val;

        },
        resize: function () {
            if ($(window).width() !== this.width) {
            $(global).off("resize", this.resizeVar);
            $(global).off("focus", this.resizeVar);
          //$(global).off("blur",blurFunction(this));
            var lastElement = this.outer;
            var lastClickable = this.clickable;
            var lastActive = this.activeChild;
            var lastChildLength = this.childLength;

            if (this.onResize) {
                this.onResize();
            }

            destroySlider(this);
            var self = this;
            self.outer = lastElement;
            self.children = $(createChildren(self.outer));
            self.childLength = lastChildLength;
            self.wrapper = createWrapper(self);
            self.width = $(window).width();
            self.activeChild = 0;
            self.moving = false;
            self.clickable = lastClickable;
            createSlider(this);
            this.setActiveChild(lastActive, true);
        }

        }
    };
    //set the KJHcarousel.init prototype equal to the exposed global KJHcarousel object
    KJHcarousel.init.prototype = KJHcarousel.prototype;

    //private helper functions 

    function alreadyACarousel(el){
        
      if ($(el).find('>').attr('id') === 'KJHcarousel-wrapper') return true
      return false;
    }

    function elementHasNoChildren(el){
       if ($(el).children().length === 0) return true;
       return false;
    }

    function elementDoesNotExist(el){
        if (el === undefined || el === null) return true;
        return false
    }

    function startIndicator(self) {
        self.timeIndicator
                .animate({
                    width: '100%'
                }, self.autoDelay)
    }

    function resetIndicator(self) {
        self.timeIndicator.stop().animate({'width': '0%'}, 0);
    }

    function createChildren(holder) {
        var children = holder.children();

        return $(children);
    }
    
    function createWrapper(self) {
        var width = getWidth(self.children) + 300;
        var startingLeft = ($(global).width() / 2) - ($(self.children[0]).outerWidth(true) / 2);
        var wrapper = $('<div/>').width(width)
                .css({
                    'position': 'absolute',
                    'top': 0,
                    'left': startingLeft + 'px',
                    'height': '100%',
                    'transition-timing-function': self.easing || 'ease-out',
                    'transition': 'all ' + self.changeSpeed + 'ms'
                })
                .attr('id', 'KJHcarousel-wrapper');
        self.children.wrapAll(wrapper);

        return self.children.parent();
    }
    
    function createSlider(self) {

        addParentCss(self.outer, self.children);
        addChildCss(self);
        addControls(self);
        addResizeEventListener(self);

        if (self.autoPlay && self.indicatorActive) {
            addTimeIndicator(self);
        }

        if (self.initialFunction !== undefined && self.initialFunction !== null) {
            self.initialFunction();
        }

        self.autoInterval = (self.autoPlay === true) ? addAutoPlayInterval(self) : undefined;
     
        $($(self.children)[0]).addClass('active');
        self.setActiveChild(0);

    }
    function addParentCss(holder, children) {
        holder.css({
            "position": 'absolute',
            "max-width": '100%',
            'width' : '100%',
            'top': 0,
            'left': 0,
            'overflow-x': 'hidden',
            'height': ($($(children)[0]).outerHeight(true) + 25) + 'px'
        });
    }

    function addChildCss(self) {

        var cursor = (self.clickable) ? 'pointer' : 'default';

        self.children.each(function (i, val) {
            $(val).css({
                'display': 'inline-block',
                'cursor': cursor
            });
        });
    }

    function addControls(self) {

        if (self.clickable) {
            self.children.click(function () {

                if (!self.moving) {
                    clearInterval(self.autoInterval);
                    var childNum = $(this).index();
                    self.toggleMoving(true);
                    self.setActiveChild(childNum);
                    if (self.autoPlay) {
                        self.autoInterval = addAutoPlayInterval(self);
                    }
                }

            });
        }

        
        var customPrev = ((self.customPrev !== undefined) ? self.customPrev : '<');
        var prev = $('<button/>')
                .html(customPrev)
                .attr('id', 'KJHcarousel-prev')
                .addClass('KJHcarousel-controls')
                .css({
                    border: 'none',
                    cursor: 'pointer',
                    left: 0,
                    position: 'absolute',
                    zIndex: 100
                })
                .click(function () {
                    handleControlClick(self, 0);
                });

        var customNext = ((self.customNext !== undefined) ? self.customNext : '>');
        var next = $('<button/>')
                .html(customNext)
                .attr('id', 'KJHcarousel-next')
                .addClass('KJHcarousel-controls')
                .css({
                    border: 'none',
                    cursor: 'pointer',
                    position: 'absolute',
                    right: 0,
                    zIndex: 100
                })
                .click(function () {
                    handleControlClick(self,1);
                });

        self.outer.append(prev, next);
        self.controls = {
            prev: self.outer.find('#KJHcarousel-prev'),
            next: self.outer.find('#KJHcarousel-next')
        };
        var marTop = (self.outer.height() / 2) - prev.height();

        $(self.controls.prev).add(self.controls.next).css({
            marginTop: marTop + 'px',
            transition: 'none'
        });
    }

    function handleControlClick(self, dir) {
        if (!self.moving) {
            clearInterval(self.autoInterval);
            self.toggleMoving(true);
            if (dir === 0){
                self.moveBackward();
            }else{
                self.moveForward();
            }
           
            if (self.autoPlay) {
                self.autoInterval = addAutoPlayInterval(self)
            }
        }
    }

    function addResizeEventListener(self) {
        $(global).on("resize", self.resizeVar);
        $(global).on("focus", self.resizeVar);
    }

    
    function addTimeIndicator(self) {
        var inHolder = $('<div/>').css({
            position: 'absolute',
            width: '100%',
            bottom: 0,
            left: 0,
            height: '10px'
        })
                .attr('id', 'KJHcarousel-inholder');

        var indicator = $('<div/>').css({
            width: 0,
            position: 'absolute',
            height: '100%',
            left: 0,
            background: ' #40bfdc'
        }).attr('id', 'KJHcarousel-indicator')

        inHolder.append(indicator);

        self.wrapper.parent().append(inHolder);
        self.timeIndicator = $('#KJHcarousel-indicator');
    }

    function addAutoPlayInterval(self) {
        
        clearInterval(self.autoInterval);

        return (setInterval(function () {
            if (!self.isMoving) {
                self.toggleMoving(true);
                self.moveForward();
            }
        }, self.autoDelay));

       
    }

    function destroySlider(self) {

        self.children.removeClass('active').unbind('click').css({'width': ''});
        self.wrapper.css({'left': ''});
        if (self.timeIndicator) {
            self.timeIndicator.remove();
        }
        $(self.children[0]).unwrap();
        $(self.controls.prev).add(self.controls.next).unbind('click').remove();
        self.outer.css({height: ''});

        self.outer = undefined;
        self.children = undefined;
        self.childLength = undefined;
        self.wrapper = undefined;
        self.activeChild = undefined;
        self.moving = undefined;
        self.clickable = undefined;
        self.controls = undefined;
        clearInterval(self.autoInterval);

    }

    // determine the total length of child elements including margin/padding
    function getWidth(children) {

        var allWidth = 0;
        children.each(function (i, val) {

            var innerWidth = $(val).width();

            allWidth = allWidth + outerWidth;
            $(val).width(innerWidth);

        });
        return allWidth;
    }



    function findWidthDifference(cur, next, curLeft, isResizing, self) {

        var childNumDif = next - cur;

        var dir = (childNumDif < 0) ? 1 : -1;

        var distance = (childNumDif === 0) ? 0 : ($(self.children[cur]).outerWidth(true) / 2);

        var lastWidth = 0;
        if (childNumDif > 1) {
            for (var i = 0; i < (childNumDif - 1); i++) {
                distance = distance + ($($(self.children)[cur + ((i) + 1)]).outerWidth(true));
            }
        }
        if (childNumDif < -1) {
            for (var i = 0; i > (childNumDif + 1); i--) {
                distance = distance + ($($(self.children)[cur + ((i) - 1)]).outerWidth(true));
            }
        }

        distance = (childNumDif === 0) ? 0 : distance + ($($(self.children)[next]).outerWidth(true) / 2);
        return distance * dir;
    }

    // Underscore.js (debounce)    
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        };
    };


    function isFunction(param, functionName) {
        if (typeof param === "function" || param === undefined) {
            return true;
        } else {
            throw (typeof param + ' is not a function. Check value of ' + functionName)
        }
    }

    function isExpected(param, expectedTypeArray, argName) {
        
        if (param === undefined) return false;
        
        var isGood = false;
        $.each(expectedTypeArray, function (i, val) {
            switch (val) {
                case 'string' :
                    if (typeof param === 'string') {
                        isGood = true;
                    }
                    break;
                case 'number' :
                    if (typeof param === 'number'){
                        isGood = true;
                    }
                    break;
                case 'object':
                    if (typeof param === 'object') {
                        isGood = true;
                    }
                    break;
                case 'function':
                    if (isFunction(param, argName)) {
                        isGood = true;
                    }
                    break;
                default :
                    return false;
            }
        });
        
        if (!isGood){
            console.error('Value given for ' + argName+ ' is not the correct type. Expected ' + expectedTypeArray.join(" or ") + '.');
        }

        return isGood;
    }

}(jQuery, window));
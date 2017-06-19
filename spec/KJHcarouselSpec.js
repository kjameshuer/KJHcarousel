describe('KJHcarousel', function () {

  var c;

  beforeEach(function () {
    $('<div id="parent"></div').appendTo('body');
    for (var i = 0; i < 10; i++) {
      $('<div class="child"></div>').width(300).appendTo('#parent');
    };
  });

  afterEach(function () {
    $('#parent,#tempParent').remove()
  })

  describe('when plugin is initialized', function () {
    it('should throw an error if parent does not exist', function () {
      var err;

      try {
        c = KJHcarousel(document.getElementById('doesnotexist'));
      } catch (e) {
        err = e
      }

      expect(err).toEqual('Parent element does not exist')
    })

    it('should throw an error if parent is already a carousel', function () {
      c = KJHcarousel(document.getElementById('parent'));
      var d;
      var err;
      try {
        d = KJHcarousel(document.getElementById('parent'));
      } catch (e) {
        err = e;
      }
      expect(err).toEqual('Carousel already exists in this element');

    })

    it('should throw an error if parent element has no children', function () {
      var tempDiv = $('<div/>').attr('id', 'tempParent').appendTo('body');
      var err;
      try {
        c = KJHcarousel(tempDiv);
      } catch (e) {
        err = e;
      }

      expect(err).toEqual('Parent element has no children to place in carousel');
    })

    it('should not throw an error when initialized without arguments', function () {

      c = KJHcarousel(document.getElementById('parent'));
      expect(c).toBeTruthy()

    })



    it('should not throw an error when initialized with arguments', function () {

      args = {
        clickable: true
      }

      c = KJHcarousel(document.getElementById('parent'), args);
      expect(c).toBeTruthy()

    })

    it('should throw an error if arguments that except functions are given something else', function () {
      var err;
      args = {
        initialFunction: 5,
        beforeMove: 5,
        afterMove: '5',
        onResize: { 5: 5 }
      }

      try {
        c = KJHcarousel(document.getElementById('parent'), args)
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined()

    });

    it('should coerce arg strings with numbers to numbers if argument is expecting a number', function () {
      var args = {
        changeSpeed: '700',
        autoDelay: '500'
      }
      c = KJHcarousel(document.getElementById('parent'), args);
      expect(c.changeSpeed).toEqual(700)
      expect(c.autoDelay).toEqual(500)
    })

    it('should not remove any of the original children from the parent', function () {
      c = KJHcarousel(document.getElementById('parent'));
      expect($('.child').length).toEqual(10)
    })

    it('should use the args provided', function () {

      var beforeMove = function () { 1 + 1 }
      var afterMove = function () { 2 + 2 }
      var initialFunction = function () { 3 + 3 }
      var onResize = function () { 4 + 4 }


      var args = {
        clickable: true,
        beforeMove: beforeMove,
        afterMove: afterMove,
        init: initialFunction,
        onResize: onResize,
        changeSpeed: 300,
        customNext: '<p>$</p>',
        customPrev: '<p>$</p>',
        autoDelay: 4000,
        autoPlay: true

      }

      c = KJHcarousel(document.getElementById('parent'), args);

      expect(c.clickable).toEqual(true);
      expect(c.beforeMove).toEqual(beforeMove);
      expect(c.afterMove).toEqual(afterMove);
      expect(c.initialFunction).toEqual(initialFunction);
      expect(c.onResize).toEqual(onResize);
      expect(c.changeSpeed).toEqual(300);
      expect(c.customNext).toEqual('<p>$</p>');
      expect(c.customPrev).toEqual('<p>$</p>');
      expect(c.autoDelay).toEqual(4000)
      expect(c.autoPlay).toEqual(true)

    })


  })

  describe('when plugin is active', function () {

    it('should change active child automatically if autoPlay is set to true', function (done) {

      var args = {
        autoPlay: true,
        autoDelay: 200
      }

      c = KJHcarousel(document.getElementById('parent'), args);
      setTimeout(function () {
        done();
        expect(c.activeChild).not.toEqual(0)
      }, 500);

    })
    it('should not change active child automatically if autoPlay is set to false', function (done) {
      var args = {
        autoPlay: false,
        autoDelay: 200
      }

      c = KJHcarousel(document.getElementById('parent'), args);
      setTimeout(function () {
        done();
        expect(c.activeChild).toEqual(0)
      }, 500);

    })

    it('should give the active child the class name "active"', function () {
      var args = {
        autoPlay: false,
        autoDelay: 200
      }

      c = KJHcarousel(document.getElementById('parent'), args);
      c.setActiveChild(3);

      expect($(c.children[3]).attr('class').indexOf('active')).toBeGreaterThan(-1)


    })

    it('should center the active child to the window',function(){
      c = KJHcarousel(document.getElementById('parent'));
           
      var wrapLeft = $('#KJHcarousel-wrapper').position().left;
      var winWidth = $(window).width();
      var childWidth = 300;

      expect(wrapLeft).toEqual((winWidth/2) - (childWidth/2))

    })


  })



  describe('when child element is clicked', function () {

    argsTrue = {
      clickable: true
    }
    argsFalse = {
      clickable: false
    }

    describe('when clickable is set to true', function () {

      it('should set the active child to the element that was clicked', function () {
        c = KJHcarousel(document.getElementById('parent'), argsTrue);
        expect(c.activeChild).toEqual(0);
        $($('#parent').find('.child')[4]).click();
        expect(c.activeChild).toEqual(4);
      })

    })

    describe('when clickable is set to false', function () {
      it('should not change active child to the element that was clicked', function () {
        c = KJHcarousel(document.getElementById('parent'), argsFalse);
        expect(c.activeChild).toEqual(0);
        $($('#parent').find('.child')[4]).click();
        expect(c.activeChild).toEqual(0);
      })

    })

  })

  describe('when next button is clicked', function () {

    it('should not move forward if current transition is active', function () {
      c = KJHcarousel(document.getElementById('parent'), argsFalse);
      $('#KJHcarousel-next').click().click();
      expect(c.activeChild).toEqual(1);
    })

    describe('when not at end of list', function () {
      it('should increase the value of active child', function () {

        c = KJHcarousel(document.getElementById('parent'), argsFalse);
        $('#KJHcarousel-next').click();
        expect(c.activeChild).toEqual(1);

      })
    })

    describe('when at end of list', function () {
      it('should set the active child to 0', function () {

        c = KJHcarousel(document.getElementById('parent'), argsFalse);
        c.setActiveChild(9)
        $('#KJHcarousel-next').click();
        expect(c.activeChild).toEqual(0);
      })
    })


  })

  describe('when previous button is clicked', function () {

    it('should not move backward if current transition is active', function () {
      c = KJHcarousel(document.getElementById('parent'), argsFalse);
      $('#KJHcarousel-prev').click().click();
      expect(c.activeChild).toEqual(9);
    })

    describe('when not at beginning of list', function () {
      it('should decrease the value of active child', function () {

        c = KJHcarousel(document.getElementById('parent'), argsFalse);
        c.setActiveChild(4)
        $('#KJHcarousel-prev').click();
        expect(c.activeChild).toEqual(3);

      })
    })

    describe('when at beginning of list', function () {
      it('should set the active child to last element', function () {

        c = KJHcarousel(document.getElementById('parent'), argsFalse);
        c.setActiveChild(0)
        $('#KJHcarousel-prev').click();
        expect(c.activeChild).toEqual(9);
      })
    })

  })

  describe('public methods', function () {

    describe('setActiveChild', function () {

      it('should set the activeChild value to number provided', function () {
        c = KJHcarousel(document.getElementById('parent'));
        c.setActiveChild(5);
        expect(c.activeChild).toEqual(5)
      })

      it('should throw an error if child does not exist', function () {
        var err;
        c = KJHcarousel(document.getElementById('parent'));
        try {
          c.setActiveChild(100)
        } catch (e) {
          err = e;
        }

        expect(err).toEqual('invalid child number for setActiveChild')

      })

    })
    describe('moveForward', function () {
      it('should cause the child elements to shift forward by one place', function () {
        c = KJHcarousel(document.getElementById('parent'));
        c.moveForward();
        expect(c.activeChild).toEqual(1);
      })
    })

    describe('moveBackward', function () {
      it('should cause the child elements to shift backward by one place', function () {
        c = KJHcarousel(document.getElementById('parent'));
        c.moveBackward();
        expect(c.activeChild).toEqual(9);
      })
    })

  })

})




function waitForTwo(done) {
  // Wait two seconds, then set the flag to true
  setTimeout(function () {


    // Invoke the special done callback
    done();
  }, 500);
}


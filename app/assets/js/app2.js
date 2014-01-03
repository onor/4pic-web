
$(document).on("ready", function () {


  //foundation orbitz settings
	/*
	$(document).foundation({
    orbit: {
      animation: 'slide',
      pause_on_hover: true,
      stack_on_small: false,
      navigation_arrows: true,
      bullets: true,
      next_on_click: true,
      swipe: true,
      slide_number: false,
      timer: false
    }
  });*/

  //parallax effect
  if (!Modernizr.touch && !Modernizr.testAllProps('pointerevents')) {
	/*todo
    skrollr.init({
      easing: {
        //This easing will sure drive you crazy
        wtf: Math.random,
        inverted: function(p) {
            return 1 - p;
        }
      }
    });*/
  }

  //game start screen

  $('.shape').on('click', function(e) {
    var leftChild = $('.left').children(),
        rightChild = $('.right').children(),
        active = $(e.currentTarget);

    if ($(e.target).hasClass('fi-x') && active.hasClass('left')) {
      leftChild.toggleClass('triangle').toggleClass('rectangle');
      var height = $(window).height() / 1.8;
      var height2 = $(window).height() / 2;
      leftChild.children().remove();
      setTimeout(function () {
        leftChild.append('<img src="images/icon-heart-orange-start.png" class="start-screen-icon" style="top: ' + height2 +'px;"><h4 id="giveText" class="show-for-medium-up" style="top: ' + height +'px;">Give</h4>');
      }, 50);

      return;
    } else if ($(e.target).hasClass('fi-x') && active.hasClass('right')) {
      rightChild.toggleClass('triangle').toggleClass('rectangle');
      var height = $(window).height() / 1.8;
      var height2 = $(window).height() / 2;
      rightChild.children().remove();
      setTimeout(function () {
        rightChild.append('<img src="images/icon-reward-orange-start.png" class="start-screen-icon" style="top: ' + height2 +'px;"><h4 id="getText" class="show-for-medium-up" style="top: ' + height +'px;">Get</h4>');
      }, 50);

      return;
    } else if (active.hasClass('left') && rightChild.hasClass('rectangle')) {
      var height = $(window).height() / 1.8;
      var height2 = $(window).height() / 2;
      rightChild.children().remove();
      setTimeout(function () {
        rightChild.append('<img src="images/icon-reward-orange-start.png" class="start-screen-icon" style="top: ' + height2 +'px;"><h4 id="getText" class="show-for-medium-up" style="top: ' + height +'px;">Get</h4>');
      }, 50);
    } else if (active.hasClass('right') && leftChild.hasClass('rectangle')) {
      var height = $(window).height() / 1.8;
      var height2 = $(window).height() / 2;
      leftChild.children().remove();
      setTimeout(function () {
        leftChild.append('<img src="images/icon-heart-orange-start.png" class="start-screen-icon" style="top: ' + height2 +'px;"><h4 id="giveText" class="show-for-medium-up" style="top: ' + height +'px;">Give</h4>');
      }, 50);
    }

    if (active.find('.rectangle').length > 0) return;

    if (active.hasClass('left')) {
      if (rightChild.hasClass('rectangle')) {
        rightChild.removeClass('rectangle').addClass('triangle');
        rightChild.children().remove();
      }
      leftChild.toggleClass('triangle').toggleClass('rectangle');

      if (leftChild.hasClass('rectangle')) {
        leftChild.children().remove();
        // TODO: append json object rather than static code
        leftChild.append('<div class="row"><div class="large-7 medium-7 columns center">' +
                         '<h2 style="margin-top:30px;">Play &amp; Give</h2>' +
                         '<span class="close" id="closeGive"><i class="fi-x"></i></span>' +
                         '<ul class="panel-grid large-block-grid-2 medium-block-grid-2 small-block-grid-1" style="margin-top:50px;">' +
                         '<li><img src="images/logo-charity-fa.jpg" class="circle"><h4>Feeding America</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                         '<li><img src="images/logo-charity-red.jpg" class="circle"><h4>Product Red</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                         '<li><img src="images/logo-charity-wwf.jpg" class="circle"><h4>WWF</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                         '<li><img src="images/logo-charity-unicef.jpg" class="circle"><h4>Unicef</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                         '</ul></div></div></div>');
      }


    } else if (active.hasClass('right')) {
      if (leftChild.hasClass('rectangle')) {
        leftChild.removeClass('rectangle').addClass('triangle');
        leftChild.children().remove();
      }
      rightChild.toggleClass('triangle').toggleClass('rectangle');

      if (rightChild.hasClass('rectangle')) {
        rightChild.children().remove();
        // TODO: append json object rather than static code
        rightChild.append('<div class="row"><div class="large-7 medium-7 columns center">' +
                          '<h2 style="margin-top:30px;">Play &amp; Get</h2>' +
                          '<span class="close" id="closeGet"><i class="fi-x"></i></span>' +
                          '<ul class="panel-grid large-block-grid-2 medium-block-grid-2 small-block-grid-1" style="margin-top:50px;">' +
                          '<li><img src="images/reward-game-mojito.jpg" class="circle"><h4>Philz Mint Mojito</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                          '<li><img src="images/reward-game-mug-white.jpg" class="circle"><h4>Philz Coffee Mug</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                          '<li><img src="images/reward-game-packet-white.jpg" class="circle"><h4>Philz Sooo Good</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                          '<li><img src="images/reward-game-tshirt.jpg" class="circle"><h4>Philz T-Shirt</h4><p class="brown">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, sem sit amet pellentesque dictum.</p></li>' +
                          '</ul></div></div></div>');
      }
    }
  });


  // EVERYTHING THAT NEEDS TO BIND TO WINDOW SIZE
  $(window).on('load resize', function () {

    var windowHeight = $(window).height(),
        documentHeight = $(document).height(),
        videoHeight = $('.videoHeight').height(),
        rectangle = $('.rectangle'),
        gameBackground = $('div.game-background'),
        gameBackgroundBody = $('body.game'),
        nav = $('#headerDesktop'),
        heartMask = $('.heart-mask').width(),
        personContainer = $('.person-container'),
        giveGetPanel = $('body.game .triangle'),
        giveText = $("body.game #giveText"),
        getText = $("body.game #getText"),
        darkMark = $("#darkmask");

    $('.heart-container').css({
      'height': $('.heart-mask').outerHeight() + 10,
      'max-height': $('.heart-mask').outerHeight() + 10
    });
    nav.css({'height':videoHeight, 'max-height':'537px' });
    imageHeight = $(".imageHeight").height();
    $(".header-mobile").css({ 'height':imageHeight, 'min-height':imageHeight });
    darkMark.css({ 'height':videoHeight });


    gameBackground.css({ 'height': windowHeight });
    gameBackgroundBody.css({ 'height':windowHeight });
    rectangle.css({'height': windowHeight, 'min-height': windowHeight });
    giveGetPanel.css({'border-bottom-width': windowHeight + 10, 'height': windowHeight });
    $(".start-screen-icon").css({'top': windowHeight / 2 });
    giveText.css({'top': windowHeight / 1.8 });
    getText.css({'top': windowHeight / 1.8 });

  });

});
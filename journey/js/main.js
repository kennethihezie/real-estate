function timelineInit() {

    var timeline = jQuery('.timeline');
    var menuItems = timeline.find('a');
    
    // CREATE ARRAY FROM TIMELINE ANCHOR TAGS
    var scrollItems = [];
    menuItems.map(function(){
        var item = jQuery(this).attr('href');
        if (item.length) { scrollItems.push(item); }
    });
    scrollItems.unshift('.hero');

    var previousItem;


    function detectMovement(itemList) {

        var fromTop = jQuery(this).scrollTop() + 300;

        // CREATE ARRAY (NON ZERO BASED) OF ACTIVE SECTIONS FROM SCROLLITEMS
        var currentItems = jQuery(itemList).map(function(index, element){
            if (jQuery(element).offset().top < fromTop)
            return element;
        });

        var currentItem = currentItems.length-1;

        if ( currentItem != previousItem ) {

            $(window).trigger('movement', [previousItem,currentItem,itemList, currentItems]);

        }

        previousItem = currentItem;

    }


    function moveGuy(from, to, itemList) {

        var guy = $('#guy');

        var curPosition = guy.position().left;

        var destination = 0;

        if ( to > 0 ) {
            destination = $('a[href="'+itemList[to]+'"]').position().left + $('a[href="'+itemList[to]+'"]').width();
        }

        var direction = curPosition > destination ? 'left' : 'right';


        // MOVING ANIMATION

        guy.addClass('walking');
        guy.removeClass('back');

        if (direction == 'left') {
            guy.addClass('back');
        }

        guy.stop().animate({
            'left':destination
        },{
            'duration': 2000,
            'easing': 'jswing',
            complete: function(){
                guy.removeClass('walking');
                guy.removeClass('back');
            }
        });

    }


    function updateTimeline(currentItems) {
        $('.timeline li').removeClass('active');
        currentItems.map(function(index, element){
            jQuery('.timeline a[href="'+element+'"]').parent().addClass('active');
        });
    }


    jQuery(window).scroll(function(){
        detectMovement(scrollItems);
    });

    $(window).on('movement', function(event, from, to, itemList, currentItems){
        moveGuy(from, to, itemList);
        updateTimeline(currentItems);
    });

}




jQuery(function(){

    timelineInit();

    // Trigger slideshow play when it reaches near the section
    jQuery('#casual-interest').waypoint(function() {
        var slide_dom = jQuery( '#casual-interest .cycle-slideshow.quote' );
        jQuery( slide_dom ).cycle( 'resume' );
    }, {offset: 100 });

    jQuery('#online-research').waypoint(function() {
        var slide_dom = jQuery( '#online-research .cycle-slideshow.quote' );
        jQuery( slide_dom ).cycle( 'resume' );
    }, {offset: 250 });

    jQuery('#active-search').waypoint(function() {
        var slide_dom = jQuery('#active-search .cycle-slideshow.quote');
        jQuery( slide_dom ).cycle( 'resume' );
    }, {offset: 250 });

    jQuery('#transaction').waypoint(function() {
        var slide_dom = jQuery('#transaction .cycle-slideshow.quote');
        jQuery( slide_dom ).cycle( 'resume' );
    }, {offset: 250 });

    jQuery('#post-sale').waypoint(function() {
        var slide_dom = jQuery('#post-sale .cycle-slideshow.quote');
        jQuery( slide_dom ).cycle( 'resume' );
    }, {offset: 250 });

    // jQuery Cycle2 - Quiz Component

    var quiz_slideshow_dom = '#casual-interest .quiz .cycle-slideshow';
    var quiz_slideshow_obj = jQuery(quiz_slideshow_dom);
    var total_quiz_num = jQuery(quiz_slideshow_dom + ' .question').length;

    jQuery('.total_quiz_num').html(total_quiz_num);

    quiz_slideshow_obj.on( 'cycle-before', function( event, optionHash ) {
        setTimeout(function() {
            current_quiz_index = jQuery( quiz_slideshow_dom + ' .cycle-slide-active').data('quizIndex');
            jQuery('.current_quiz_index').html(current_quiz_index);
        },800);
    });

    jQuery('#casual-interest .quiz ul.answer-list li').click(function(){
        var selected_answer = jQuery(this).attr('class');
        if ( selected_answer == 'wrong' ) {
            jQuery(this).find('.result').html('<span style="color:#933434">WRONG!</span>');
        } else if ( selected_answer == 'correct' ) {
            jQuery(this).find('.result').html('<span style="color:#75BB40">CORRECT!</span>');
            setTimeout(function() {
                jQuery('#casual-interest .quiz .cycle-slideshow').cycle('next');
            },400);
        }
    });

    // Menu

    jQuery('.main-menu').waypoint('sticky', {
        stuckClass: 'stuck'
    });

    // Knob

    if (window.attachEvent && !window.addEventListener) {

        $('.knob').each(function(){

            var imgSrc = $(this).parent()[0].getAttribute('data-fallback');
            var img = new Image();
            img.src = 'images/compatibility/'+imgSrc;

            $(this).parent().find('input, div, canvas').hide().end().after().append(img);

        });

    } else {

        jQuery('.knob').knob();

        jQuery('.knob').val(0).trigger('change');

        jQuery('.knob').waypoint(function() {
            $(this).each(function () {

                var $this = $(this);
                var myVal = $this.attr("rel");

                $({value: 0}).animate({
                    value: myVal
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function () {
                        $this.val(Math.ceil(this.value)).trigger('change');
                    }
                });

            });
        }, {offset: 1100, triggerOnce: true });

    }

    // Smooth scroll

    jQuery('.smooth-link').each(function(){

        jQuery(this).click(function(e){
            var href = jQuery(this).attr('href'),
            offsetTop = href === '#' ? 0 : jQuery(href).offset().top - 100;
            noScroll = true;
            jQuery('html, body').stop().animate({
                scrollTop: offsetTop
            },{
                duration: 1000,
                easing: 'easeInOutExpo',
                complete: function() {
                    setTimeout(function(){ noScroll = false; }, 10);
                }
            });
            e.preventDefault();
        });

    });

    // Highcharts

    jQuery('#buying-process').highcharts({
        chart: {
            type: 'column',
            backgroundColor: null
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        legend: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        xAxis: {
            categories: [
            'Found a House They Liked',
            'Family Reason',
            'Retirement / Downsizing',
            'Tired of Paying Rent',
            'Expecting a Child'
            ],
            labels: {
                style: {
                    fontSize: '12px',
                    color: '#333'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            },
            gridLineColor: '#BDDCE6',
            labels: {
                enabled: false
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0,
                borderWidth: 0,
                color: '#1EA6D7',
                dataLabels: {
                    enabled: true,
                    color: '#1EA6D7',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '24px'
                    }
                }
            }
        },
        credits:{
            enabled: false
        },
        series: [{
            name: '',
            data: [14.8, 10.1, 6.7, 4.2, 2.4]

        }]
    });

});

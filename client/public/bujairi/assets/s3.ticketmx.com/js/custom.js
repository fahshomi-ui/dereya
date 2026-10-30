/* Contains

slick.js // sliders
moment.js // date selection
daterangepicker.js // date selection

*/

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
; (function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function ($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function (slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function () {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof (index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof (index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                        duration: _.options.speed,
                        easing: _.options.easing,
                        step: function (now) {
                            now = Math.ceil(now);
                            if (_.options.vertical === false) {
                                animProps[_.animType] = 'translate(' +
                                    now + 'px, 0px)';
                                _.$slideTrack.css(animProps);
                            } else {
                                animProps[_.animType] = 'translate(0px,' +
                                    now + 'px)';
                                _.$slideTrack.css(animProps);
                            }
                        },
                        complete: function () {
                            if (callback) {
                                callback.call();
                            }
                        }
                    });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function () {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function (index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if (asNavFor !== null && typeof asNavFor === 'object') {
            asNavFor.each(function () {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        _.autoPlayClear();

        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if (!_.paused && !_.interrupted && !_.focussed) {

            if (_.options.infinite === false) {

                if (_.direction === 1 && (_.currentSlide + 1) === (_.slideCount - 1)) {
                    _.direction = 0;
                }

                else if (_.direction === 0) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler(slideTo);

        }

    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add(_.$nextArrow)

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function () {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');

        }

    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides =
            _.$slider
                .children(_.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function () {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width': (100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function (initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                            targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function () {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this, originalSlides;

        if (_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function (refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.$prevArrow.length) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }

        if (_.$nextArrow && _.$nextArrow.length) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }
        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function () {
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function (slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function () {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick', '*', function (event) {

                event.stopImmediatePropagation();
                var $sf = $(this);

                setTimeout(function () {

                    if (_.options.pauseOnFocus) {
                        _.focussed = $sf.is(':focus');
                        _.autoPlay();
                    }

                }, 0);

            });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                coef = -1

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2
                    }
                }
                verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function () {

        return this;

    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function (creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if (_.options.autoplay) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function () {
        var _ = this,
            numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
            tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
                return (val >= 0) && (val < _.slideCount);
            });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                    var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex
                    if ($('#' + ariaButtonControl).length) {
                        $(this).attr({
                            'aria-describedby': ariaButtonControl
                        });
                    }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': (i + 1) + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });

            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
            if (_.options.focusOnChange) {
                _.$slides.eq(i).attr({ 'tabindex': '0' });
            } else {
                _.$slides.eq(i).removeAttr('tabindex');
            }
        }

        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'previous'
                }, _.changeSlide);
            _.$nextArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'next'
                }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }

    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function () {

        var _ = this;

        if (_.options.pauseOnHover) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);

    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' : 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function () {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    image
                        .animate({ opacity: 0 }, 100, function () {

                            if (imageSrcSet) {
                                image
                                    .attr('srcset', imageSrcSet);

                                if (imageSizes) {
                                    image
                                        .attr('sizes', imageSizes);
                                }
                            }

                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function () {
                                    image
                                        .removeAttr('data-lazy data-srcset data-sizes')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function () {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
            if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
                loadImages(cloneRange);
            } else if (_.currentSlide === 0) {
                cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
                loadImages(cloneRange);
            }

    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        if (!_.unslicked) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function (event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function (tryCount) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $('img[data-lazy]', _.$slider),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function () {

                if (imageSrcSet) {
                    image
                        .attr('srcset', imageSrcSet);

                    if (imageSizes) {
                        image
                            .attr('sizes', imageSizes);
                    }
                }

                image
                    .attr('src', imageSource)
                    .removeAttr('data-lazy data-srcset data-sizes')
                    .removeClass('slick-loading');

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function () {

                if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout(function () {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);

                } else {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [_]);

        }

    };

    Slick.prototype.refresh = function (initializing) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if (!_.options.infinite && (_.currentSlide > lastVisibleIndex)) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function () {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function (a, b) {
                return (_.options.mobileFirst) ? a - b : b - a;
            });

        }

    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof (index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function () {

        var _ = this,
            targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
        Slick.prototype.slickSetOption = function () {

            /**
             * accepts arguments in format of:
             *
             *  - for changing a single option's value:
             *     .slick("setOption", option, value, refresh )
             *
             *  - for changing a set of responsive options:
             *     .slick("setOption", 'responsive', [{}, ...], refresh )
             *
             *  - for updating multiple values at once (not responsive)
             *     .slick("setOption", { 'option': value, ... }, refresh )
             */

            var _ = this, l, item, option, value, refresh = false, type;

            if ($.type(arguments[0]) === 'object') {

                option = arguments[0];
                refresh = arguments[1];
                type = 'multiple';

            } else if ($.type(arguments[0]) === 'string') {

                option = arguments[0];
                value = arguments[1];
                refresh = arguments[2];

                if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                    type = 'responsive';

                } else if (typeof arguments[1] !== 'undefined') {

                    type = 'single';

                }

            }

            if (type === 'single') {

                _.options[option] = value;


            } else if (type === 'multiple') {

                $.each(option, function (opt, val) {

                    _.options[opt] = val;

                });


            } else if (type === 'responsive') {

                for (item in value) {

                    if ($.type(_.options.responsive) !== 'array') {

                        _.options.responsive = [value[item]];

                    } else {

                        l = _.options.responsive.length - 1;

                        // loop through the responsive object and splice out duplicates.
                        while (l >= 0) {

                            if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

                                _.options.responsive.splice(l, 1);

                            }

                            l--;

                        }

                        _.options.responsive.push(value[item]);

                    }

                }

            }

            if (refresh) {

                _.unload();
                _.reinit();

            }

        };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function () {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides
                        .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                    infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function (toggle) {

        var _ = this;

        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if (_.options.asNavFor) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function () {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = (_.touchObject.swipeLength > 10) ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            direction = _.swipeDirection();

            switch (direction) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable(_.currentSlide + _.getSlideCount()) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable(_.currentSlide - _.getSlideCount()) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if (direction != 'vertical') {

                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction]);

            }

        } else {

            if (_.touchObject.startX !== _.touchObject.curX) {

                _.slideHandler(_.currentSlide);
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function (fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .end();

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active');

        }

    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (_.options.autoplay) {

            if (document[_.hidden]) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function () {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

////////////////////////////////////////////////////////////////////

//! moment.js
//! version : 2.18.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function (a, b) { "object" == typeof exports && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b() }(this, function () {
    "use strict"; function a() { return sd.apply(null, arguments) } function b(a) { sd = a } function c(a) { return a instanceof Array || "[object Array]" === Object.prototype.toString.call(a) } function d(a) { return null != a && "[object Object]" === Object.prototype.toString.call(a) } function e(a) { var b; for (b in a) return !1; return !0 } function f(a) { return void 0 === a } function g(a) { return "number" == typeof a || "[object Number]" === Object.prototype.toString.call(a) } function h(a) { return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a) } function i(a, b) { var c, d = []; for (c = 0; c < a.length; ++c)d.push(b(a[c], c)); return d } function j(a, b) { return Object.prototype.hasOwnProperty.call(a, b) } function k(a, b) { for (var c in b) j(b, c) && (a[c] = b[c]); return j(b, "toString") && (a.toString = b.toString), j(b, "valueOf") && (a.valueOf = b.valueOf), a } function l(a, b, c, d) { return sb(a, b, c, d, !0).utc() } function m() { return { empty: !1, unusedTokens: [], unusedInput: [], overflow: -2, charsLeftOver: 0, nullInput: !1, invalidMonth: null, invalidFormat: !1, userInvalidated: !1, iso: !1, parsedDateParts: [], meridiem: null, rfc2822: !1, weekdayMismatch: !1 } } function n(a) { return null == a._pf && (a._pf = m()), a._pf } function o(a) { if (null == a._isValid) { var b = n(a), c = ud.call(b.parsedDateParts, function (a) { return null != a }), d = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.invalidWeekday && !b.nullInput && !b.invalidFormat && !b.userInvalidated && (!b.meridiem || b.meridiem && c); if (a._strict && (d = d && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour), null != Object.isFrozen && Object.isFrozen(a)) return d; a._isValid = d } return a._isValid } function p(a) { var b = l(NaN); return null != a ? k(n(b), a) : n(b).userInvalidated = !0, b } function q(a, b) { var c, d, e; if (f(b._isAMomentObject) || (a._isAMomentObject = b._isAMomentObject), f(b._i) || (a._i = b._i), f(b._f) || (a._f = b._f), f(b._l) || (a._l = b._l), f(b._strict) || (a._strict = b._strict), f(b._tzm) || (a._tzm = b._tzm), f(b._isUTC) || (a._isUTC = b._isUTC), f(b._offset) || (a._offset = b._offset), f(b._pf) || (a._pf = n(b)), f(b._locale) || (a._locale = b._locale), vd.length > 0) for (c = 0; c < vd.length; c++)d = vd[c], e = b[d], f(e) || (a[d] = e); return a } function r(b) { q(this, b), this._d = new Date(null != b._d ? b._d.getTime() : NaN), this.isValid() || (this._d = new Date(NaN)), wd === !1 && (wd = !0, a.updateOffset(this), wd = !1) } function s(a) { return a instanceof r || null != a && null != a._isAMomentObject } function t(a) { return a < 0 ? Math.ceil(a) || 0 : Math.floor(a) } function u(a) { var b = +a, c = 0; return 0 !== b && isFinite(b) && (c = t(b)), c } function v(a, b, c) { var d, e = Math.min(a.length, b.length), f = Math.abs(a.length - b.length), g = 0; for (d = 0; d < e; d++)(c && a[d] !== b[d] || !c && u(a[d]) !== u(b[d])) && g++; return g + f } function w(b) { a.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + b) } function x(b, c) { var d = !0; return k(function () { if (null != a.deprecationHandler && a.deprecationHandler(null, b), d) { for (var e, f = [], g = 0; g < arguments.length; g++) { if (e = "", "object" == typeof arguments[g]) { e += "\n[" + g + "] "; for (var h in arguments[0]) e += h + ": " + arguments[0][h] + ", "; e = e.slice(0, -2) } else e = arguments[g]; f.push(e) } w(b + "\nArguments: " + Array.prototype.slice.call(f).join("") + "\n" + (new Error).stack), d = !1 } return c.apply(this, arguments) }, c) } function y(b, c) { null != a.deprecationHandler && a.deprecationHandler(b, c), xd[b] || (w(c), xd[b] = !0) } function z(a) { return a instanceof Function || "[object Function]" === Object.prototype.toString.call(a) } function A(a) { var b, c; for (c in a) b = a[c], z(b) ? this[c] = b : this["_" + c] = b; this._config = a, this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source) } function B(a, b) { var c, e = k({}, a); for (c in b) j(b, c) && (d(a[c]) && d(b[c]) ? (e[c] = {}, k(e[c], a[c]), k(e[c], b[c])) : null != b[c] ? e[c] = b[c] : delete e[c]); for (c in a) j(a, c) && !j(b, c) && d(a[c]) && (e[c] = k({}, e[c])); return e } function C(a) { null != a && this.set(a) } function D(a, b, c) { var d = this._calendar[a] || this._calendar.sameElse; return z(d) ? d.call(b, c) : d } function E(a) { var b = this._longDateFormat[a], c = this._longDateFormat[a.toUpperCase()]; return b || !c ? b : (this._longDateFormat[a] = c.replace(/MMMM|MM|DD|dddd/g, function (a) { return a.slice(1) }), this._longDateFormat[a]) } function F() { return this._invalidDate } function G(a) { return this._ordinal.replace("%d", a) } function H(a, b, c, d) { var e = this._relativeTime[c]; return z(e) ? e(a, b, c, d) : e.replace(/%d/i, a) } function I(a, b) { var c = this._relativeTime[a > 0 ? "future" : "past"]; return z(c) ? c(b) : c.replace(/%s/i, b) } function J(a, b) { var c = a.toLowerCase(); Hd[c] = Hd[c + "s"] = Hd[b] = a } function K(a) { return "string" == typeof a ? Hd[a] || Hd[a.toLowerCase()] : void 0 } function L(a) { var b, c, d = {}; for (c in a) j(a, c) && (b = K(c), b && (d[b] = a[c])); return d } function M(a, b) { Id[a] = b } function N(a) { var b = []; for (var c in a) b.push({ unit: c, priority: Id[c] }); return b.sort(function (a, b) { return a.priority - b.priority }), b } function O(b, c) { return function (d) { return null != d ? (Q(this, b, d), a.updateOffset(this, c), this) : P(this, b) } } function P(a, b) { return a.isValid() ? a._d["get" + (a._isUTC ? "UTC" : "") + b]() : NaN } function Q(a, b, c) { a.isValid() && a._d["set" + (a._isUTC ? "UTC" : "") + b](c) } function R(a) { return a = K(a), z(this[a]) ? this[a]() : this } function S(a, b) { if ("object" == typeof a) { a = L(a); for (var c = N(a), d = 0; d < c.length; d++)this[c[d].unit](a[c[d].unit]) } else if (a = K(a), z(this[a])) return this[a](b); return this } function T(a, b, c) { var d = "" + Math.abs(a), e = b - d.length, f = a >= 0; return (f ? c ? "+" : "" : "-") + Math.pow(10, Math.max(0, e)).toString().substr(1) + d } function U(a, b, c, d) { var e = d; "string" == typeof d && (e = function () { return this[d]() }), a && (Md[a] = e), b && (Md[b[0]] = function () { return T(e.apply(this, arguments), b[1], b[2]) }), c && (Md[c] = function () { return this.localeData().ordinal(e.apply(this, arguments), a) }) } function V(a) { return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "") } function W(a) { var b, c, d = a.match(Jd); for (b = 0, c = d.length; b < c; b++)Md[d[b]] ? d[b] = Md[d[b]] : d[b] = V(d[b]); return function (b) { var e, f = ""; for (e = 0; e < c; e++)f += z(d[e]) ? d[e].call(b, a) : d[e]; return f } } function X(a, b) { return a.isValid() ? (b = Y(b, a.localeData()), Ld[b] = Ld[b] || W(b), Ld[b](a)) : a.localeData().invalidDate() } function Y(a, b) { function c(a) { return b.longDateFormat(a) || a } var d = 5; for (Kd.lastIndex = 0; d >= 0 && Kd.test(a);)a = a.replace(Kd, c), Kd.lastIndex = 0, d -= 1; return a } function Z(a, b, c) { ce[a] = z(b) ? b : function (a, d) { return a && c ? c : b } } function $(a, b) { return j(ce, a) ? ce[a](b._strict, b._locale) : new RegExp(_(a)) } function _(a) { return aa(a.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (a, b, c, d, e) { return b || c || d || e })) } function aa(a) { return a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") } function ba(a, b) { var c, d = b; for ("string" == typeof a && (a = [a]), g(b) && (d = function (a, c) { c[b] = u(a) }), c = 0; c < a.length; c++)de[a[c]] = d } function ca(a, b) { ba(a, function (a, c, d, e) { d._w = d._w || {}, b(a, d._w, d, e) }) } function da(a, b, c) { null != b && j(de, a) && de[a](b, c._a, c, a) } function ea(a, b) { return new Date(Date.UTC(a, b + 1, 0)).getUTCDate() } function fa(a, b) { return a ? c(this._months) ? this._months[a.month()] : this._months[(this._months.isFormat || oe).test(b) ? "format" : "standalone"][a.month()] : c(this._months) ? this._months : this._months.standalone } function ga(a, b) { return a ? c(this._monthsShort) ? this._monthsShort[a.month()] : this._monthsShort[oe.test(b) ? "format" : "standalone"][a.month()] : c(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone } function ha(a, b, c) { var d, e, f, g = a.toLocaleLowerCase(); if (!this._monthsParse) for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], d = 0; d < 12; ++d)f = l([2e3, d]), this._shortMonthsParse[d] = this.monthsShort(f, "").toLocaleLowerCase(), this._longMonthsParse[d] = this.months(f, "").toLocaleLowerCase(); return c ? "MMM" === b ? (e = ne.call(this._shortMonthsParse, g), e !== -1 ? e : null) : (e = ne.call(this._longMonthsParse, g), e !== -1 ? e : null) : "MMM" === b ? (e = ne.call(this._shortMonthsParse, g), e !== -1 ? e : (e = ne.call(this._longMonthsParse, g), e !== -1 ? e : null)) : (e = ne.call(this._longMonthsParse, g), e !== -1 ? e : (e = ne.call(this._shortMonthsParse, g), e !== -1 ? e : null)) } function ia(a, b, c) { var d, e, f; if (this._monthsParseExact) return ha.call(this, a, b, c); for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), d = 0; d < 12; d++) { if (e = l([2e3, d]), c && !this._longMonthsParse[d] && (this._longMonthsParse[d] = new RegExp("^" + this.months(e, "").replace(".", "") + "$", "i"), this._shortMonthsParse[d] = new RegExp("^" + this.monthsShort(e, "").replace(".", "") + "$", "i")), c || this._monthsParse[d] || (f = "^" + this.months(e, "") + "|^" + this.monthsShort(e, ""), this._monthsParse[d] = new RegExp(f.replace(".", ""), "i")), c && "MMMM" === b && this._longMonthsParse[d].test(a)) return d; if (c && "MMM" === b && this._shortMonthsParse[d].test(a)) return d; if (!c && this._monthsParse[d].test(a)) return d } } function ja(a, b) { var c; if (!a.isValid()) return a; if ("string" == typeof b) if (/^\d+$/.test(b)) b = u(b); else if (b = a.localeData().monthsParse(b), !g(b)) return a; return c = Math.min(a.date(), ea(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a } function ka(b) { return null != b ? (ja(this, b), a.updateOffset(this, !0), this) : P(this, "Month") } function la() { return ea(this.year(), this.month()) } function ma(a) { return this._monthsParseExact ? (j(this, "_monthsRegex") || oa.call(this), a ? this._monthsShortStrictRegex : this._monthsShortRegex) : (j(this, "_monthsShortRegex") || (this._monthsShortRegex = re), this._monthsShortStrictRegex && a ? this._monthsShortStrictRegex : this._monthsShortRegex) } function na(a) { return this._monthsParseExact ? (j(this, "_monthsRegex") || oa.call(this), a ? this._monthsStrictRegex : this._monthsRegex) : (j(this, "_monthsRegex") || (this._monthsRegex = se), this._monthsStrictRegex && a ? this._monthsStrictRegex : this._monthsRegex) } function oa() { function a(a, b) { return b.length - a.length } var b, c, d = [], e = [], f = []; for (b = 0; b < 12; b++)c = l([2e3, b]), d.push(this.monthsShort(c, "")), e.push(this.months(c, "")), f.push(this.months(c, "")), f.push(this.monthsShort(c, "")); for (d.sort(a), e.sort(a), f.sort(a), b = 0; b < 12; b++)d[b] = aa(d[b]), e[b] = aa(e[b]); for (b = 0; b < 24; b++)f[b] = aa(f[b]); this._monthsRegex = new RegExp("^(" + f.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + e.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + d.join("|") + ")", "i") } function pa(a) { return qa(a) ? 366 : 365 } function qa(a) { return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0 } function ra() { return qa(this.year()) } function sa(a, b, c, d, e, f, g) { var h = new Date(a, b, c, d, e, f, g); return a < 100 && a >= 0 && isFinite(h.getFullYear()) && h.setFullYear(a), h } function ta(a) { var b = new Date(Date.UTC.apply(null, arguments)); return a < 100 && a >= 0 && isFinite(b.getUTCFullYear()) && b.setUTCFullYear(a), b } function ua(a, b, c) { var d = 7 + b - c, e = (7 + ta(a, 0, d).getUTCDay() - b) % 7; return -e + d - 1 } function va(a, b, c, d, e) { var f, g, h = (7 + c - d) % 7, i = ua(a, d, e), j = 1 + 7 * (b - 1) + h + i; return j <= 0 ? (f = a - 1, g = pa(f) + j) : j > pa(a) ? (f = a + 1, g = j - pa(a)) : (f = a, g = j), { year: f, dayOfYear: g } } function wa(a, b, c) { var d, e, f = ua(a.year(), b, c), g = Math.floor((a.dayOfYear() - f - 1) / 7) + 1; return g < 1 ? (e = a.year() - 1, d = g + xa(e, b, c)) : g > xa(a.year(), b, c) ? (d = g - xa(a.year(), b, c), e = a.year() + 1) : (e = a.year(), d = g), { week: d, year: e } } function xa(a, b, c) { var d = ua(a, b, c), e = ua(a + 1, b, c); return (pa(a) - d + e) / 7 } function ya(a) { return wa(a, this._week.dow, this._week.doy).week } function za() { return this._week.dow } function Aa() { return this._week.doy } function Ba(a) { var b = this.localeData().week(this); return null == a ? b : this.add(7 * (a - b), "d") } function Ca(a) { var b = wa(this, 1, 4).week; return null == a ? b : this.add(7 * (a - b), "d") } function Da(a, b) { return "string" != typeof a ? a : isNaN(a) ? (a = b.weekdaysParse(a), "number" == typeof a ? a : null) : parseInt(a, 10) } function Ea(a, b) { return "string" == typeof a ? b.weekdaysParse(a) % 7 || 7 : isNaN(a) ? null : a } function Fa(a, b) { return a ? c(this._weekdays) ? this._weekdays[a.day()] : this._weekdays[this._weekdays.isFormat.test(b) ? "format" : "standalone"][a.day()] : c(this._weekdays) ? this._weekdays : this._weekdays.standalone } function Ga(a) { return a ? this._weekdaysShort[a.day()] : this._weekdaysShort } function Ha(a) { return a ? this._weekdaysMin[a.day()] : this._weekdaysMin } function Ia(a, b, c) { var d, e, f, g = a.toLocaleLowerCase(); if (!this._weekdaysParse) for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], d = 0; d < 7; ++d)f = l([2e3, 1]).day(d), this._minWeekdaysParse[d] = this.weekdaysMin(f, "").toLocaleLowerCase(), this._shortWeekdaysParse[d] = this.weekdaysShort(f, "").toLocaleLowerCase(), this._weekdaysParse[d] = this.weekdays(f, "").toLocaleLowerCase(); return c ? "dddd" === b ? (e = ne.call(this._weekdaysParse, g), e !== -1 ? e : null) : "ddd" === b ? (e = ne.call(this._shortWeekdaysParse, g), e !== -1 ? e : null) : (e = ne.call(this._minWeekdaysParse, g), e !== -1 ? e : null) : "dddd" === b ? (e = ne.call(this._weekdaysParse, g), e !== -1 ? e : (e = ne.call(this._shortWeekdaysParse, g), e !== -1 ? e : (e = ne.call(this._minWeekdaysParse, g), e !== -1 ? e : null))) : "ddd" === b ? (e = ne.call(this._shortWeekdaysParse, g), e !== -1 ? e : (e = ne.call(this._weekdaysParse, g), e !== -1 ? e : (e = ne.call(this._minWeekdaysParse, g), e !== -1 ? e : null))) : (e = ne.call(this._minWeekdaysParse, g), e !== -1 ? e : (e = ne.call(this._weekdaysParse, g), e !== -1 ? e : (e = ne.call(this._shortWeekdaysParse, g), e !== -1 ? e : null))) } function Ja(a, b, c) { var d, e, f; if (this._weekdaysParseExact) return Ia.call(this, a, b, c); for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), d = 0; d < 7; d++) { if (e = l([2e3, 1]).day(d), c && !this._fullWeekdaysParse[d] && (this._fullWeekdaysParse[d] = new RegExp("^" + this.weekdays(e, "").replace(".", ".?") + "$", "i"), this._shortWeekdaysParse[d] = new RegExp("^" + this.weekdaysShort(e, "").replace(".", ".?") + "$", "i"), this._minWeekdaysParse[d] = new RegExp("^" + this.weekdaysMin(e, "").replace(".", ".?") + "$", "i")), this._weekdaysParse[d] || (f = "^" + this.weekdays(e, "") + "|^" + this.weekdaysShort(e, "") + "|^" + this.weekdaysMin(e, ""), this._weekdaysParse[d] = new RegExp(f.replace(".", ""), "i")), c && "dddd" === b && this._fullWeekdaysParse[d].test(a)) return d; if (c && "ddd" === b && this._shortWeekdaysParse[d].test(a)) return d; if (c && "dd" === b && this._minWeekdaysParse[d].test(a)) return d; if (!c && this._weekdaysParse[d].test(a)) return d } } function Ka(a) { if (!this.isValid()) return null != a ? this : NaN; var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay(); return null != a ? (a = Da(a, this.localeData()), this.add(a - b, "d")) : b } function La(a) { if (!this.isValid()) return null != a ? this : NaN; var b = (this.day() + 7 - this.localeData()._week.dow) % 7; return null == a ? b : this.add(a - b, "d") } function Ma(a) { if (!this.isValid()) return null != a ? this : NaN; if (null != a) { var b = Ea(a, this.localeData()); return this.day(this.day() % 7 ? b : b - 7) } return this.day() || 7 } function Na(a) { return this._weekdaysParseExact ? (j(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysStrictRegex : this._weekdaysRegex) : (j(this, "_weekdaysRegex") || (this._weekdaysRegex = ye), this._weekdaysStrictRegex && a ? this._weekdaysStrictRegex : this._weekdaysRegex) } function Oa(a) { return this._weekdaysParseExact ? (j(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (j(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = ze), this._weekdaysShortStrictRegex && a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) } function Pa(a) { return this._weekdaysParseExact ? (j(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (j(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = Ae), this._weekdaysMinStrictRegex && a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) } function Qa() { function a(a, b) { return b.length - a.length } var b, c, d, e, f, g = [], h = [], i = [], j = []; for (b = 0; b < 7; b++)c = l([2e3, 1]).day(b), d = this.weekdaysMin(c, ""), e = this.weekdaysShort(c, ""), f = this.weekdays(c, ""), g.push(d), h.push(e), i.push(f), j.push(d), j.push(e), j.push(f); for (g.sort(a), h.sort(a), i.sort(a), j.sort(a), b = 0; b < 7; b++)h[b] = aa(h[b]), i[b] = aa(i[b]), j[b] = aa(j[b]); this._weekdaysRegex = new RegExp("^(" + j.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + i.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + h.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + g.join("|") + ")", "i") } function Ra() { return this.hours() % 12 || 12 } function Sa() { return this.hours() || 24 } function Ta(a, b) { U(a, 0, 0, function () { return this.localeData().meridiem(this.hours(), this.minutes(), b) }) } function Ua(a, b) { return b._meridiemParse } function Va(a) { return "p" === (a + "").toLowerCase().charAt(0) } function Wa(a, b, c) { return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM" } function Xa(a) { return a ? a.toLowerCase().replace("_", "-") : a } function Ya(a) { for (var b, c, d, e, f = 0; f < a.length;) { for (e = Xa(a[f]).split("-"), b = e.length, c = Xa(a[f + 1]), c = c ? c.split("-") : null; b > 0;) { if (d = Za(e.slice(0, b).join("-"))) return d; if (c && c.length >= b && v(e, c, !0) >= b - 1) break; b-- } f++ } return null } function Za(a) { var b = null; if (!Fe[a] && "undefined" != typeof module && module && module.exports) try { b = Be._abbr, require("./locale/" + a), $a(b) } catch (a) { } return Fe[a] } function $a(a, b) { var c; return a && (c = f(b) ? bb(a) : _a(a, b), c && (Be = c)), Be._abbr } function _a(a, b) { if (null !== b) { var c = Ee; if (b.abbr = a, null != Fe[a]) y("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), c = Fe[a]._config; else if (null != b.parentLocale) { if (null == Fe[b.parentLocale]) return Ge[b.parentLocale] || (Ge[b.parentLocale] = []), Ge[b.parentLocale].push({ name: a, config: b }), null; c = Fe[b.parentLocale]._config } return Fe[a] = new C(B(c, b)), Ge[a] && Ge[a].forEach(function (a) { _a(a.name, a.config) }), $a(a), Fe[a] } return delete Fe[a], null } function ab(a, b) { if (null != b) { var c, d = Ee; null != Fe[a] && (d = Fe[a]._config), b = B(d, b), c = new C(b), c.parentLocale = Fe[a], Fe[a] = c, $a(a) } else null != Fe[a] && (null != Fe[a].parentLocale ? Fe[a] = Fe[a].parentLocale : null != Fe[a] && delete Fe[a]); return Fe[a] } function bb(a) { var b; if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return Be; if (!c(a)) { if (b = Za(a)) return b; a = [a] } return Ya(a) } function cb() { return Ad(Fe) } function db(a) { var b, c = a._a; return c && n(a).overflow === -2 && (b = c[fe] < 0 || c[fe] > 11 ? fe : c[ge] < 1 || c[ge] > ea(c[ee], c[fe]) ? ge : c[he] < 0 || c[he] > 24 || 24 === c[he] && (0 !== c[ie] || 0 !== c[je] || 0 !== c[ke]) ? he : c[ie] < 0 || c[ie] > 59 ? ie : c[je] < 0 || c[je] > 59 ? je : c[ke] < 0 || c[ke] > 999 ? ke : -1, n(a)._overflowDayOfYear && (b < ee || b > ge) && (b = ge), n(a)._overflowWeeks && b === -1 && (b = le), n(a)._overflowWeekday && b === -1 && (b = me), n(a).overflow = b), a } function eb(a) { var b, c, d, e, f, g, h = a._i, i = He.exec(h) || Ie.exec(h); if (i) { for (n(a).iso = !0, b = 0, c = Ke.length; b < c; b++)if (Ke[b][1].exec(i[1])) { e = Ke[b][0], d = Ke[b][2] !== !1; break } if (null == e) return void (a._isValid = !1); if (i[3]) { for (b = 0, c = Le.length; b < c; b++)if (Le[b][1].exec(i[3])) { f = (i[2] || " ") + Le[b][0]; break } if (null == f) return void (a._isValid = !1) } if (!d && null != f) return void (a._isValid = !1); if (i[4]) { if (!Je.exec(i[4])) return void (a._isValid = !1); g = "Z" } a._f = e + (f || "") + (g || ""), lb(a) } else a._isValid = !1 } function fb(a) { var b, c, d, e, f, g, h, i, j = { " GMT": " +0000", " EDT": " -0400", " EST": " -0500", " CDT": " -0500", " CST": " -0600", " MDT": " -0600", " MST": " -0700", " PDT": " -0700", " PST": " -0800" }, k = "YXWVUTSRQPONZABCDEFGHIKLM"; if (b = a._i.replace(/\([^\)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s|\s$/g, ""), c = Ne.exec(b)) { if (d = c[1] ? "ddd" + (5 === c[1].length ? ", " : " ") : "", e = "D MMM " + (c[2].length > 10 ? "YYYY " : "YY "), f = "HH:mm" + (c[4] ? ":ss" : ""), c[1]) { var l = new Date(c[2]), m = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][l.getDay()]; if (c[1].substr(0, 3) !== m) return n(a).weekdayMismatch = !0, void (a._isValid = !1) } switch (c[5].length) { case 2: 0 === i ? h = " +0000" : (i = k.indexOf(c[5][1].toUpperCase()) - 12, h = (i < 0 ? " -" : " +") + ("" + i).replace(/^-?/, "0").match(/..$/)[0] + "00"); break; case 4: h = j[c[5]]; break; default: h = j[" GMT"] }c[5] = h, a._i = c.splice(1).join(""), g = " ZZ", a._f = d + e + f + g, lb(a), n(a).rfc2822 = !0 } else a._isValid = !1 } function gb(b) { var c = Me.exec(b._i); return null !== c ? void (b._d = new Date(+c[1])) : (eb(b), void (b._isValid === !1 && (delete b._isValid, fb(b), b._isValid === !1 && (delete b._isValid, a.createFromInputFallback(b))))) } function hb(a, b, c) { return null != a ? a : null != b ? b : c } function ib(b) { var c = new Date(a.now()); return b._useUTC ? [c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()] : [c.getFullYear(), c.getMonth(), c.getDate()] } function jb(a) { var b, c, d, e, f = []; if (!a._d) { for (d = ib(a), a._w && null == a._a[ge] && null == a._a[fe] && kb(a), null != a._dayOfYear && (e = hb(a._a[ee], d[ee]), (a._dayOfYear > pa(e) || 0 === a._dayOfYear) && (n(a)._overflowDayOfYear = !0), c = ta(e, 0, a._dayOfYear), a._a[fe] = c.getUTCMonth(), a._a[ge] = c.getUTCDate()), b = 0; b < 3 && null == a._a[b]; ++b)a._a[b] = f[b] = d[b]; for (; b < 7; b++)a._a[b] = f[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b]; 24 === a._a[he] && 0 === a._a[ie] && 0 === a._a[je] && 0 === a._a[ke] && (a._nextDay = !0, a._a[he] = 0), a._d = (a._useUTC ? ta : sa).apply(null, f), null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() - a._tzm), a._nextDay && (a._a[he] = 24) } } function kb(a) { var b, c, d, e, f, g, h, i; if (b = a._w, null != b.GG || null != b.W || null != b.E) f = 1, g = 4, c = hb(b.GG, a._a[ee], wa(tb(), 1, 4).year), d = hb(b.W, 1), e = hb(b.E, 1), (e < 1 || e > 7) && (i = !0); else { f = a._locale._week.dow, g = a._locale._week.doy; var j = wa(tb(), f, g); c = hb(b.gg, a._a[ee], j.year), d = hb(b.w, j.week), null != b.d ? (e = b.d, (e < 0 || e > 6) && (i = !0)) : null != b.e ? (e = b.e + f, (b.e < 0 || b.e > 6) && (i = !0)) : e = f } d < 1 || d > xa(c, f, g) ? n(a)._overflowWeeks = !0 : null != i ? n(a)._overflowWeekday = !0 : (h = va(c, d, e, f, g), a._a[ee] = h.year, a._dayOfYear = h.dayOfYear) } function lb(b) { if (b._f === a.ISO_8601) return void eb(b); if (b._f === a.RFC_2822) return void fb(b); b._a = [], n(b).empty = !0; var c, d, e, f, g, h = "" + b._i, i = h.length, j = 0; for (e = Y(b._f, b._locale).match(Jd) || [], c = 0; c < e.length; c++)f = e[c], d = (h.match($(f, b)) || [])[0], d && (g = h.substr(0, h.indexOf(d)), g.length > 0 && n(b).unusedInput.push(g), h = h.slice(h.indexOf(d) + d.length), j += d.length), Md[f] ? (d ? n(b).empty = !1 : n(b).unusedTokens.push(f), da(f, d, b)) : b._strict && !d && n(b).unusedTokens.push(f); n(b).charsLeftOver = i - j, h.length > 0 && n(b).unusedInput.push(h), b._a[he] <= 12 && n(b).bigHour === !0 && b._a[he] > 0 && (n(b).bigHour = void 0), n(b).parsedDateParts = b._a.slice(0), n(b).meridiem = b._meridiem, b._a[he] = mb(b._locale, b._a[he], b._meridiem), jb(b), db(b) } function mb(a, b, c) { var d; return null == c ? b : null != a.meridiemHour ? a.meridiemHour(b, c) : null != a.isPM ? (d = a.isPM(c), d && b < 12 && (b += 12), d || 12 !== b || (b = 0), b) : b } function nb(a) { var b, c, d, e, f; if (0 === a._f.length) return n(a).invalidFormat = !0, void (a._d = new Date(NaN)); for (e = 0; e < a._f.length; e++)f = 0, b = q({}, a), null != a._useUTC && (b._useUTC = a._useUTC), b._f = a._f[e], lb(b), o(b) && (f += n(b).charsLeftOver, f += 10 * n(b).unusedTokens.length, n(b).score = f, (null == d || f < d) && (d = f, c = b)); k(a, c || b) } function ob(a) { if (!a._d) { var b = L(a._i); a._a = i([b.year, b.month, b.day || b.date, b.hour, b.minute, b.second, b.millisecond], function (a) { return a && parseInt(a, 10) }), jb(a) } } function pb(a) { var b = new r(db(qb(a))); return b._nextDay && (b.add(1, "d"), b._nextDay = void 0), b } function qb(a) { var b = a._i, d = a._f; return a._locale = a._locale || bb(a._l), null === b || void 0 === d && "" === b ? p({ nullInput: !0 }) : ("string" == typeof b && (a._i = b = a._locale.preparse(b)), s(b) ? new r(db(b)) : (h(b) ? a._d = b : c(d) ? nb(a) : d ? lb(a) : rb(a), o(a) || (a._d = null), a)) } function rb(b) { var e = b._i; f(e) ? b._d = new Date(a.now()) : h(e) ? b._d = new Date(e.valueOf()) : "string" == typeof e ? gb(b) : c(e) ? (b._a = i(e.slice(0), function (a) { return parseInt(a, 10) }), jb(b)) : d(e) ? ob(b) : g(e) ? b._d = new Date(e) : a.createFromInputFallback(b) } function sb(a, b, f, g, h) { var i = {}; return f !== !0 && f !== !1 || (g = f, f = void 0), (d(a) && e(a) || c(a) && 0 === a.length) && (a = void 0), i._isAMomentObject = !0, i._useUTC = i._isUTC = h, i._l = f, i._i = a, i._f = b, i._strict = g, pb(i) } function tb(a, b, c, d) { return sb(a, b, c, d, !1) } function ub(a, b) { var d, e; if (1 === b.length && c(b[0]) && (b = b[0]), !b.length) return tb(); for (d = b[0], e = 1; e < b.length; ++e)b[e].isValid() && !b[e][a](d) || (d = b[e]); return d } function vb() { var a = [].slice.call(arguments, 0); return ub("isBefore", a) } function wb() { var a = [].slice.call(arguments, 0); return ub("isAfter", a) } function xb(a) { for (var b in a) if (Re.indexOf(b) === -1 || null != a[b] && isNaN(a[b])) return !1; for (var c = !1, d = 0; d < Re.length; ++d)if (a[Re[d]]) { if (c) return !1; parseFloat(a[Re[d]]) !== u(a[Re[d]]) && (c = !0) } return !0 } function yb() { return this._isValid } function zb() { return Sb(NaN) } function Ab(a) { var b = L(a), c = b.year || 0, d = b.quarter || 0, e = b.month || 0, f = b.week || 0, g = b.day || 0, h = b.hour || 0, i = b.minute || 0, j = b.second || 0, k = b.millisecond || 0; this._isValid = xb(b), this._milliseconds = +k + 1e3 * j + 6e4 * i + 1e3 * h * 60 * 60, this._days = +g + 7 * f, this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = bb(), this._bubble() } function Bb(a) { return a instanceof Ab } function Cb(a) { return a < 0 ? Math.round(-1 * a) * -1 : Math.round(a) } function Db(a, b) { U(a, 0, 0, function () { var a = this.utcOffset(), c = "+"; return a < 0 && (a = -a, c = "-"), c + T(~~(a / 60), 2) + b + T(~~a % 60, 2) }) } function Eb(a, b) { var c = (b || "").match(a); if (null === c) return null; var d = c[c.length - 1] || [], e = (d + "").match(Se) || ["-", 0, 0], f = +(60 * e[1]) + u(e[2]); return 0 === f ? 0 : "+" === e[0] ? f : -f } function Fb(b, c) { var d, e; return c._isUTC ? (d = c.clone(), e = (s(b) || h(b) ? b.valueOf() : tb(b).valueOf()) - d.valueOf(), d._d.setTime(d._d.valueOf() + e), a.updateOffset(d, !1), d) : tb(b).local() } function Gb(a) { return 15 * -Math.round(a._d.getTimezoneOffset() / 15) } function Hb(b, c, d) { var e, f = this._offset || 0; if (!this.isValid()) return null != b ? this : NaN; if (null != b) { if ("string" == typeof b) { if (b = Eb(_d, b), null === b) return this } else Math.abs(b) < 16 && !d && (b = 60 * b); return !this._isUTC && c && (e = Gb(this)), this._offset = b, this._isUTC = !0, null != e && this.add(e, "m"), f !== b && (!c || this._changeInProgress ? Xb(this, Sb(b - f, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, a.updateOffset(this, !0), this._changeInProgress = null)), this } return this._isUTC ? f : Gb(this) } function Ib(a, b) { return null != a ? ("string" != typeof a && (a = -a), this.utcOffset(a, b), this) : -this.utcOffset() } function Jb(a) { return this.utcOffset(0, a) } function Kb(a) { return this._isUTC && (this.utcOffset(0, a), this._isUTC = !1, a && this.subtract(Gb(this), "m")), this } function Lb() { if (null != this._tzm) this.utcOffset(this._tzm, !1, !0); else if ("string" == typeof this._i) { var a = Eb($d, this._i); null != a ? this.utcOffset(a) : this.utcOffset(0, !0) } return this } function Mb(a) { return !!this.isValid() && (a = a ? tb(a).utcOffset() : 0, (this.utcOffset() - a) % 60 === 0) } function Nb() { return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset() } function Ob() { if (!f(this._isDSTShifted)) return this._isDSTShifted; var a = {}; if (q(a, this), a = qb(a), a._a) { var b = a._isUTC ? l(a._a) : tb(a._a); this._isDSTShifted = this.isValid() && v(a._a, b.toArray()) > 0 } else this._isDSTShifted = !1; return this._isDSTShifted } function Pb() { return !!this.isValid() && !this._isUTC } function Qb() { return !!this.isValid() && this._isUTC } function Rb() { return !!this.isValid() && (this._isUTC && 0 === this._offset) } function Sb(a, b) { var c, d, e, f = a, h = null; return Bb(a) ? f = { ms: a._milliseconds, d: a._days, M: a._months } : g(a) ? (f = {}, b ? f[b] = a : f.milliseconds = a) : (h = Te.exec(a)) ? (c = "-" === h[1] ? -1 : 1, f = { y: 0, d: u(h[ge]) * c, h: u(h[he]) * c, m: u(h[ie]) * c, s: u(h[je]) * c, ms: u(Cb(1e3 * h[ke])) * c }) : (h = Ue.exec(a)) ? (c = "-" === h[1] ? -1 : 1, f = { y: Tb(h[2], c), M: Tb(h[3], c), w: Tb(h[4], c), d: Tb(h[5], c), h: Tb(h[6], c), m: Tb(h[7], c), s: Tb(h[8], c) }) : null == f ? f = {} : "object" == typeof f && ("from" in f || "to" in f) && (e = Vb(tb(f.from), tb(f.to)), f = {}, f.ms = e.milliseconds, f.M = e.months), d = new Ab(f), Bb(a) && j(a, "_locale") && (d._locale = a._locale), d } function Tb(a, b) { var c = a && parseFloat(a.replace(",", ".")); return (isNaN(c) ? 0 : c) * b } function Ub(a, b) { var c = { milliseconds: 0, months: 0 }; return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c } function Vb(a, b) { var c; return a.isValid() && b.isValid() ? (b = Fb(b, a), a.isBefore(b) ? c = Ub(a, b) : (c = Ub(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c) : { milliseconds: 0, months: 0 } } function Wb(a, b) { return function (c, d) { var e, f; return null === d || isNaN(+d) || (y(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), f = c, c = d, d = f), c = "string" == typeof c ? +c : c, e = Sb(c, d), Xb(this, e, a), this } } function Xb(b, c, d, e) { var f = c._milliseconds, g = Cb(c._days), h = Cb(c._months); b.isValid() && (e = null == e || e, f && b._d.setTime(b._d.valueOf() + f * d), g && Q(b, "Date", P(b, "Date") + g * d), h && ja(b, P(b, "Month") + h * d), e && a.updateOffset(b, g || h)) } function Yb(a, b) { var c = a.diff(b, "days", !0); return c < -6 ? "sameElse" : c < -1 ? "lastWeek" : c < 0 ? "lastDay" : c < 1 ? "sameDay" : c < 2 ? "nextDay" : c < 7 ? "nextWeek" : "sameElse" } function Zb(b, c) { var d = b || tb(), e = Fb(d, this).startOf("day"), f = a.calendarFormat(this, e) || "sameElse", g = c && (z(c[f]) ? c[f].call(this, d) : c[f]); return this.format(g || this.localeData().calendar(f, this, tb(d))) } function $b() { return new r(this) } function _b(a, b) { var c = s(a) ? a : tb(a); return !(!this.isValid() || !c.isValid()) && (b = K(f(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() > c.valueOf() : c.valueOf() < this.clone().startOf(b).valueOf()) } function ac(a, b) { var c = s(a) ? a : tb(a); return !(!this.isValid() || !c.isValid()) && (b = K(f(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() < c.valueOf() : this.clone().endOf(b).valueOf() < c.valueOf()) } function bc(a, b, c, d) { return d = d || "()", ("(" === d[0] ? this.isAfter(a, c) : !this.isBefore(a, c)) && (")" === d[1] ? this.isBefore(b, c) : !this.isAfter(b, c)) } function cc(a, b) { var c, d = s(a) ? a : tb(a); return !(!this.isValid() || !d.isValid()) && (b = K(b || "millisecond"), "millisecond" === b ? this.valueOf() === d.valueOf() : (c = d.valueOf(), this.clone().startOf(b).valueOf() <= c && c <= this.clone().endOf(b).valueOf())) } function dc(a, b) { return this.isSame(a, b) || this.isAfter(a, b) } function ec(a, b) { return this.isSame(a, b) || this.isBefore(a, b) } function fc(a, b, c) { var d, e, f, g; return this.isValid() ? (d = Fb(a, this), d.isValid() ? (e = 6e4 * (d.utcOffset() - this.utcOffset()), b = K(b), "year" === b || "month" === b || "quarter" === b ? (g = gc(this, d), "quarter" === b ? g /= 3 : "year" === b && (g /= 12)) : (f = this - d, g = "second" === b ? f / 1e3 : "minute" === b ? f / 6e4 : "hour" === b ? f / 36e5 : "day" === b ? (f - e) / 864e5 : "week" === b ? (f - e) / 6048e5 : f), c ? g : t(g)) : NaN) : NaN } function gc(a, b) { var c, d, e = 12 * (b.year() - a.year()) + (b.month() - a.month()), f = a.clone().add(e, "months"); return b - f < 0 ? (c = a.clone().add(e - 1, "months"), d = (b - f) / (f - c)) : (c = a.clone().add(e + 1, "months"), d = (b - f) / (c - f)), -(e + d) || 0 } function hc() { return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ") } function ic() { if (!this.isValid()) return null; var a = this.clone().utc(); return a.year() < 0 || a.year() > 9999 ? X(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : z(Date.prototype.toISOString) ? this.toDate().toISOString() : X(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") } function jc() { if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)"; var a = "moment", b = ""; this.isLocal() || (a = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone", b = "Z"); var c = "[" + a + '("]', d = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY", e = "-MM-DD[T]HH:mm:ss.SSS", f = b + '[")]'; return this.format(c + d + e + f) } function kc(b) { b || (b = this.isUtc() ? a.defaultFormatUtc : a.defaultFormat); var c = X(this, b); return this.localeData().postformat(c) } function lc(a, b) { return this.isValid() && (s(a) && a.isValid() || tb(a).isValid()) ? Sb({ to: this, from: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate() } function mc(a) { return this.from(tb(), a) } function nc(a, b) { return this.isValid() && (s(a) && a.isValid() || tb(a).isValid()) ? Sb({ from: this, to: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate() } function oc(a) { return this.to(tb(), a) } function pc(a) { var b; return void 0 === a ? this._locale._abbr : (b = bb(a), null != b && (this._locale = b), this) } function qc() { return this._locale } function rc(a) { switch (a = K(a)) { case "year": this.month(0); case "quarter": case "month": this.date(1); case "week": case "isoWeek": case "day": case "date": this.hours(0); case "hour": this.minutes(0); case "minute": this.seconds(0); case "second": this.milliseconds(0) }return "week" === a && this.weekday(0), "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this } function sc(a) { return a = K(a), void 0 === a || "millisecond" === a ? this : ("date" === a && (a = "day"), this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms")) } function tc() { return this._d.valueOf() - 6e4 * (this._offset || 0) } function uc() { return Math.floor(this.valueOf() / 1e3) } function vc() { return new Date(this.valueOf()) } function wc() { var a = this; return [a.year(), a.month(), a.date(), a.hour(), a.minute(), a.second(), a.millisecond()] } function xc() { var a = this; return { years: a.year(), months: a.month(), date: a.date(), hours: a.hours(), minutes: a.minutes(), seconds: a.seconds(), milliseconds: a.milliseconds() } } function yc() { return this.isValid() ? this.toISOString() : null } function zc() { return o(this) } function Ac() {
        return k({}, n(this))
    } function Bc() { return n(this).overflow } function Cc() { return { input: this._i, format: this._f, locale: this._locale, isUTC: this._isUTC, strict: this._strict } } function Dc(a, b) { U(0, [a, a.length], 0, b) } function Ec(a) { return Ic.call(this, a, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy) } function Fc(a) { return Ic.call(this, a, this.isoWeek(), this.isoWeekday(), 1, 4) } function Gc() { return xa(this.year(), 1, 4) } function Hc() { var a = this.localeData()._week; return xa(this.year(), a.dow, a.doy) } function Ic(a, b, c, d, e) { var f; return null == a ? wa(this, d, e).year : (f = xa(a, d, e), b > f && (b = f), Jc.call(this, a, b, c, d, e)) } function Jc(a, b, c, d, e) { var f = va(a, b, c, d, e), g = ta(f.year, 0, f.dayOfYear); return this.year(g.getUTCFullYear()), this.month(g.getUTCMonth()), this.date(g.getUTCDate()), this } function Kc(a) { return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3) } function Lc(a) { var b = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1; return null == a ? b : this.add(a - b, "d") } function Mc(a, b) { b[ke] = u(1e3 * ("0." + a)) } function Nc() { return this._isUTC ? "UTC" : "" } function Oc() { return this._isUTC ? "Coordinated Universal Time" : "" } function Pc(a) { return tb(1e3 * a) } function Qc() { return tb.apply(null, arguments).parseZone() } function Rc(a) { return a } function Sc(a, b, c, d) { var e = bb(), f = l().set(d, b); return e[c](f, a) } function Tc(a, b, c) { if (g(a) && (b = a, a = void 0), a = a || "", null != b) return Sc(a, b, c, "month"); var d, e = []; for (d = 0; d < 12; d++)e[d] = Sc(a, d, c, "month"); return e } function Uc(a, b, c, d) { "boolean" == typeof a ? (g(b) && (c = b, b = void 0), b = b || "") : (b = a, c = b, a = !1, g(b) && (c = b, b = void 0), b = b || ""); var e = bb(), f = a ? e._week.dow : 0; if (null != c) return Sc(b, (c + f) % 7, d, "day"); var h, i = []; for (h = 0; h < 7; h++)i[h] = Sc(b, (h + f) % 7, d, "day"); return i } function Vc(a, b) { return Tc(a, b, "months") } function Wc(a, b) { return Tc(a, b, "monthsShort") } function Xc(a, b, c) { return Uc(a, b, c, "weekdays") } function Yc(a, b, c) { return Uc(a, b, c, "weekdaysShort") } function Zc(a, b, c) { return Uc(a, b, c, "weekdaysMin") } function $c() { var a = this._data; return this._milliseconds = df(this._milliseconds), this._days = df(this._days), this._months = df(this._months), a.milliseconds = df(a.milliseconds), a.seconds = df(a.seconds), a.minutes = df(a.minutes), a.hours = df(a.hours), a.months = df(a.months), a.years = df(a.years), this } function _c(a, b, c, d) { var e = Sb(b, c); return a._milliseconds += d * e._milliseconds, a._days += d * e._days, a._months += d * e._months, a._bubble() } function ad(a, b) { return _c(this, a, b, 1) } function bd(a, b) { return _c(this, a, b, -1) } function cd(a) { return a < 0 ? Math.floor(a) : Math.ceil(a) } function dd() { var a, b, c, d, e, f = this._milliseconds, g = this._days, h = this._months, i = this._data; return f >= 0 && g >= 0 && h >= 0 || f <= 0 && g <= 0 && h <= 0 || (f += 864e5 * cd(fd(h) + g), g = 0, h = 0), i.milliseconds = f % 1e3, a = t(f / 1e3), i.seconds = a % 60, b = t(a / 60), i.minutes = b % 60, c = t(b / 60), i.hours = c % 24, g += t(c / 24), e = t(ed(g)), h += e, g -= cd(fd(e)), d = t(h / 12), h %= 12, i.days = g, i.months = h, i.years = d, this } function ed(a) { return 4800 * a / 146097 } function fd(a) { return 146097 * a / 4800 } function gd(a) { if (!this.isValid()) return NaN; var b, c, d = this._milliseconds; if (a = K(a), "month" === a || "year" === a) return b = this._days + d / 864e5, c = this._months + ed(b), "month" === a ? c : c / 12; switch (b = this._days + Math.round(fd(this._months)), a) { case "week": return b / 7 + d / 6048e5; case "day": return b + d / 864e5; case "hour": return 24 * b + d / 36e5; case "minute": return 1440 * b + d / 6e4; case "second": return 86400 * b + d / 1e3; case "millisecond": return Math.floor(864e5 * b) + d; default: throw new Error("Unknown unit " + a) } } function hd() { return this.isValid() ? this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * u(this._months / 12) : NaN } function id(a) { return function () { return this.as(a) } } function jd(a) { return a = K(a), this.isValid() ? this[a + "s"]() : NaN } function kd(a) { return function () { return this.isValid() ? this._data[a] : NaN } } function ld() { return t(this.days() / 7) } function md(a, b, c, d, e) { return e.relativeTime(b || 1, !!c, a, d) } function nd(a, b, c) { var d = Sb(a).abs(), e = uf(d.as("s")), f = uf(d.as("m")), g = uf(d.as("h")), h = uf(d.as("d")), i = uf(d.as("M")), j = uf(d.as("y")), k = e <= vf.ss && ["s", e] || e < vf.s && ["ss", e] || f <= 1 && ["m"] || f < vf.m && ["mm", f] || g <= 1 && ["h"] || g < vf.h && ["hh", g] || h <= 1 && ["d"] || h < vf.d && ["dd", h] || i <= 1 && ["M"] || i < vf.M && ["MM", i] || j <= 1 && ["y"] || ["yy", j]; return k[2] = b, k[3] = +a > 0, k[4] = c, md.apply(null, k) } function od(a) { return void 0 === a ? uf : "function" == typeof a && (uf = a, !0) } function pd(a, b) { return void 0 !== vf[a] && (void 0 === b ? vf[a] : (vf[a] = b, "s" === a && (vf.ss = b - 1), !0)) } function qd(a) { if (!this.isValid()) return this.localeData().invalidDate(); var b = this.localeData(), c = nd(this, !a, b); return a && (c = b.pastFuture(+this, c)), b.postformat(c) } function rd() { if (!this.isValid()) return this.localeData().invalidDate(); var a, b, c, d = wf(this._milliseconds) / 1e3, e = wf(this._days), f = wf(this._months); a = t(d / 60), b = t(a / 60), d %= 60, a %= 60, c = t(f / 12), f %= 12; var g = c, h = f, i = e, j = b, k = a, l = d, m = this.asSeconds(); return m ? (m < 0 ? "-" : "") + "P" + (g ? g + "Y" : "") + (h ? h + "M" : "") + (i ? i + "D" : "") + (j || k || l ? "T" : "") + (j ? j + "H" : "") + (k ? k + "M" : "") + (l ? l + "S" : "") : "P0D" } var sd, td; td = Array.prototype.some ? Array.prototype.some : function (a) { for (var b = Object(this), c = b.length >>> 0, d = 0; d < c; d++)if (d in b && a.call(this, b[d], d, b)) return !0; return !1 }; var ud = td, vd = a.momentProperties = [], wd = !1, xd = {}; a.suppressDeprecationWarnings = !1, a.deprecationHandler = null; var yd; yd = Object.keys ? Object.keys : function (a) { var b, c = []; for (b in a) j(a, b) && c.push(b); return c }; var zd, Ad = yd, Bd = { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" }, Cd = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, Dd = "Invalid date", Ed = "%d", Fd = /\d{1,2}/, Gd = { future: "in %s", past: "%s ago", s: "a few seconds", ss: "%d seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" }, Hd = {}, Id = {}, Jd = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, Kd = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, Ld = {}, Md = {}, Nd = /\d/, Od = /\d\d/, Pd = /\d{3}/, Qd = /\d{4}/, Rd = /[+-]?\d{6}/, Sd = /\d\d?/, Td = /\d\d\d\d?/, Ud = /\d\d\d\d\d\d?/, Vd = /\d{1,3}/, Wd = /\d{1,4}/, Xd = /[+-]?\d{1,6}/, Yd = /\d+/, Zd = /[+-]?\d+/, $d = /Z|[+-]\d\d:?\d\d/gi, _d = /Z|[+-]\d\d(?::?\d\d)?/gi, ae = /[+-]?\d+(\.\d{1,3})?/, be = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, ce = {}, de = {}, ee = 0, fe = 1, ge = 2, he = 3, ie = 4, je = 5, ke = 6, le = 7, me = 8; zd = Array.prototype.indexOf ? Array.prototype.indexOf : function (a) { var b; for (b = 0; b < this.length; ++b)if (this[b] === a) return b; return -1 }; var ne = zd; U("M", ["MM", 2], "Mo", function () { return this.month() + 1 }), U("MMM", 0, 0, function (a) { return this.localeData().monthsShort(this, a) }), U("MMMM", 0, 0, function (a) { return this.localeData().months(this, a) }), J("month", "M"), M("month", 8), Z("M", Sd), Z("MM", Sd, Od), Z("MMM", function (a, b) { return b.monthsShortRegex(a) }), Z("MMMM", function (a, b) { return b.monthsRegex(a) }), ba(["M", "MM"], function (a, b) { b[fe] = u(a) - 1 }), ba(["MMM", "MMMM"], function (a, b, c, d) { var e = c._locale.monthsParse(a, d, c._strict); null != e ? b[fe] = e : n(c).invalidMonth = a }); var oe = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, pe = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), qe = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), re = be, se = be; U("Y", 0, 0, function () { var a = this.year(); return a <= 9999 ? "" + a : "+" + a }), U(0, ["YY", 2], 0, function () { return this.year() % 100 }), U(0, ["YYYY", 4], 0, "year"), U(0, ["YYYYY", 5], 0, "year"), U(0, ["YYYYYY", 6, !0], 0, "year"), J("year", "y"), M("year", 1), Z("Y", Zd), Z("YY", Sd, Od), Z("YYYY", Wd, Qd), Z("YYYYY", Xd, Rd), Z("YYYYYY", Xd, Rd), ba(["YYYYY", "YYYYYY"], ee), ba("YYYY", function (b, c) { c[ee] = 2 === b.length ? a.parseTwoDigitYear(b) : u(b) }), ba("YY", function (b, c) { c[ee] = a.parseTwoDigitYear(b) }), ba("Y", function (a, b) { b[ee] = parseInt(a, 10) }), a.parseTwoDigitYear = function (a) { return u(a) + (u(a) > 68 ? 1900 : 2e3) }; var te = O("FullYear", !0); U("w", ["ww", 2], "wo", "week"), U("W", ["WW", 2], "Wo", "isoWeek"), J("week", "w"), J("isoWeek", "W"), M("week", 5), M("isoWeek", 5), Z("w", Sd), Z("ww", Sd, Od), Z("W", Sd), Z("WW", Sd, Od), ca(["w", "ww", "W", "WW"], function (a, b, c, d) { b[d.substr(0, 1)] = u(a) }); var ue = { dow: 0, doy: 6 }; U("d", 0, "do", "day"), U("dd", 0, 0, function (a) { return this.localeData().weekdaysMin(this, a) }), U("ddd", 0, 0, function (a) { return this.localeData().weekdaysShort(this, a) }), U("dddd", 0, 0, function (a) { return this.localeData().weekdays(this, a) }), U("e", 0, 0, "weekday"), U("E", 0, 0, "isoWeekday"), J("day", "d"), J("weekday", "e"), J("isoWeekday", "E"), M("day", 11), M("weekday", 11), M("isoWeekday", 11), Z("d", Sd), Z("e", Sd), Z("E", Sd), Z("dd", function (a, b) { return b.weekdaysMinRegex(a) }), Z("ddd", function (a, b) { return b.weekdaysShortRegex(a) }), Z("dddd", function (a, b) { return b.weekdaysRegex(a) }), ca(["dd", "ddd", "dddd"], function (a, b, c, d) { var e = c._locale.weekdaysParse(a, d, c._strict); null != e ? b.d = e : n(c).invalidWeekday = a }), ca(["d", "e", "E"], function (a, b, c, d) { b[d] = u(a) }); var ve = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), we = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), xe = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), ye = be, ze = be, Ae = be; U("H", ["HH", 2], 0, "hour"), U("h", ["hh", 2], 0, Ra), U("k", ["kk", 2], 0, Sa), U("hmm", 0, 0, function () { return "" + Ra.apply(this) + T(this.minutes(), 2) }), U("hmmss", 0, 0, function () { return "" + Ra.apply(this) + T(this.minutes(), 2) + T(this.seconds(), 2) }), U("Hmm", 0, 0, function () { return "" + this.hours() + T(this.minutes(), 2) }), U("Hmmss", 0, 0, function () { return "" + this.hours() + T(this.minutes(), 2) + T(this.seconds(), 2) }), Ta("a", !0), Ta("A", !1), J("hour", "h"), M("hour", 13), Z("a", Ua), Z("A", Ua), Z("H", Sd), Z("h", Sd), Z("k", Sd), Z("HH", Sd, Od), Z("hh", Sd, Od), Z("kk", Sd, Od), Z("hmm", Td), Z("hmmss", Ud), Z("Hmm", Td), Z("Hmmss", Ud), ba(["H", "HH"], he), ba(["k", "kk"], function (a, b, c) { var d = u(a); b[he] = 24 === d ? 0 : d }), ba(["a", "A"], function (a, b, c) { c._isPm = c._locale.isPM(a), c._meridiem = a }), ba(["h", "hh"], function (a, b, c) { b[he] = u(a), n(c).bigHour = !0 }), ba("hmm", function (a, b, c) { var d = a.length - 2; b[he] = u(a.substr(0, d)), b[ie] = u(a.substr(d)), n(c).bigHour = !0 }), ba("hmmss", function (a, b, c) { var d = a.length - 4, e = a.length - 2; b[he] = u(a.substr(0, d)), b[ie] = u(a.substr(d, 2)), b[je] = u(a.substr(e)), n(c).bigHour = !0 }), ba("Hmm", function (a, b, c) { var d = a.length - 2; b[he] = u(a.substr(0, d)), b[ie] = u(a.substr(d)) }), ba("Hmmss", function (a, b, c) { var d = a.length - 4, e = a.length - 2; b[he] = u(a.substr(0, d)), b[ie] = u(a.substr(d, 2)), b[je] = u(a.substr(e)) }); var Be, Ce = /[ap]\.?m?\.?/i, De = O("Hours", !0), Ee = { calendar: Bd, longDateFormat: Cd, invalidDate: Dd, ordinal: Ed, dayOfMonthOrdinalParse: Fd, relativeTime: Gd, months: pe, monthsShort: qe, week: ue, weekdays: ve, weekdaysMin: xe, weekdaysShort: we, meridiemParse: Ce }, Fe = {}, Ge = {}, He = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Ie = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Je = /Z|[+-]\d\d(?::?\d\d)?/, Ke = [["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/], ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/], ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/], ["GGGG-[W]WW", /\d{4}-W\d\d/, !1], ["YYYY-DDD", /\d{4}-\d{3}/], ["YYYY-MM", /\d{4}-\d\d/, !1], ["YYYYYYMMDD", /[+-]\d{10}/], ["YYYYMMDD", /\d{8}/], ["GGGG[W]WWE", /\d{4}W\d{3}/], ["GGGG[W]WW", /\d{4}W\d{2}/, !1], ["YYYYDDD", /\d{7}/]], Le = [["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/], ["HH:mm:ss", /\d\d:\d\d:\d\d/], ["HH:mm", /\d\d:\d\d/], ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/], ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/], ["HHmmss", /\d\d\d\d\d\d/], ["HHmm", /\d\d\d\d/], ["HH", /\d\d/]], Me = /^\/?Date\((\-?\d+)/i, Ne = /^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d?\d\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:\d\d)?\d\d\s)(\d\d:\d\d)(\:\d\d)?(\s(?:UT|GMT|[ECMP][SD]T|[A-IK-Za-ik-z]|[+-]\d{4}))$/; a.createFromInputFallback = x("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function (a) { a._d = new Date(a._i + (a._useUTC ? " UTC" : "")) }), a.ISO_8601 = function () { }, a.RFC_2822 = function () { }; var Oe = x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function () { var a = tb.apply(null, arguments); return this.isValid() && a.isValid() ? a < this ? this : a : p() }), Pe = x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function () { var a = tb.apply(null, arguments); return this.isValid() && a.isValid() ? a > this ? this : a : p() }), Qe = function () { return Date.now ? Date.now() : +new Date }, Re = ["year", "quarter", "month", "week", "day", "hour", "minute", "second", "millisecond"]; Db("Z", ":"), Db("ZZ", ""), Z("Z", _d), Z("ZZ", _d), ba(["Z", "ZZ"], function (a, b, c) { c._useUTC = !0, c._tzm = Eb(_d, a) }); var Se = /([\+\-]|\d\d)/gi; a.updateOffset = function () { }; var Te = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/, Ue = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/; Sb.fn = Ab.prototype, Sb.invalid = zb; var Ve = Wb(1, "add"), We = Wb(-1, "subtract"); a.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", a.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]"; var Xe = x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (a) { return void 0 === a ? this.localeData() : this.locale(a) }); U(0, ["gg", 2], 0, function () { return this.weekYear() % 100 }), U(0, ["GG", 2], 0, function () { return this.isoWeekYear() % 100 }), Dc("gggg", "weekYear"), Dc("ggggg", "weekYear"), Dc("GGGG", "isoWeekYear"), Dc("GGGGG", "isoWeekYear"), J("weekYear", "gg"), J("isoWeekYear", "GG"), M("weekYear", 1), M("isoWeekYear", 1), Z("G", Zd), Z("g", Zd), Z("GG", Sd, Od), Z("gg", Sd, Od), Z("GGGG", Wd, Qd), Z("gggg", Wd, Qd), Z("GGGGG", Xd, Rd), Z("ggggg", Xd, Rd), ca(["gggg", "ggggg", "GGGG", "GGGGG"], function (a, b, c, d) { b[d.substr(0, 2)] = u(a) }), ca(["gg", "GG"], function (b, c, d, e) { c[e] = a.parseTwoDigitYear(b) }), U("Q", 0, "Qo", "quarter"), J("quarter", "Q"), M("quarter", 7), Z("Q", Nd), ba("Q", function (a, b) { b[fe] = 3 * (u(a) - 1) }), U("D", ["DD", 2], "Do", "date"), J("date", "D"), M("date", 9), Z("D", Sd), Z("DD", Sd, Od), Z("Do", function (a, b) { return a ? b._dayOfMonthOrdinalParse || b._ordinalParse : b._dayOfMonthOrdinalParseLenient }), ba(["D", "DD"], ge), ba("Do", function (a, b) { b[ge] = u(a.match(Sd)[0], 10) }); var Ye = O("Date", !0); U("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), J("dayOfYear", "DDD"), M("dayOfYear", 4), Z("DDD", Vd), Z("DDDD", Pd), ba(["DDD", "DDDD"], function (a, b, c) { c._dayOfYear = u(a) }), U("m", ["mm", 2], 0, "minute"), J("minute", "m"), M("minute", 14), Z("m", Sd), Z("mm", Sd, Od), ba(["m", "mm"], ie); var Ze = O("Minutes", !1); U("s", ["ss", 2], 0, "second"), J("second", "s"), M("second", 15), Z("s", Sd), Z("ss", Sd, Od), ba(["s", "ss"], je); var $e = O("Seconds", !1); U("S", 0, 0, function () { return ~~(this.millisecond() / 100) }), U(0, ["SS", 2], 0, function () { return ~~(this.millisecond() / 10) }), U(0, ["SSS", 3], 0, "millisecond"), U(0, ["SSSS", 4], 0, function () { return 10 * this.millisecond() }), U(0, ["SSSSS", 5], 0, function () { return 100 * this.millisecond() }), U(0, ["SSSSSS", 6], 0, function () { return 1e3 * this.millisecond() }), U(0, ["SSSSSSS", 7], 0, function () { return 1e4 * this.millisecond() }), U(0, ["SSSSSSSS", 8], 0, function () { return 1e5 * this.millisecond() }), U(0, ["SSSSSSSSS", 9], 0, function () { return 1e6 * this.millisecond() }), J("millisecond", "ms"), M("millisecond", 16), Z("S", Vd, Nd), Z("SS", Vd, Od), Z("SSS", Vd, Pd); var _e; for (_e = "SSSS"; _e.length <= 9; _e += "S")Z(_e, Yd); for (_e = "S"; _e.length <= 9; _e += "S")ba(_e, Mc); var af = O("Milliseconds", !1); U("z", 0, 0, "zoneAbbr"), U("zz", 0, 0, "zoneName"); var bf = r.prototype; bf.add = Ve, bf.calendar = Zb, bf.clone = $b, bf.diff = fc, bf.endOf = sc, bf.format = kc, bf.from = lc, bf.fromNow = mc, bf.to = nc, bf.toNow = oc, bf.get = R, bf.invalidAt = Bc, bf.isAfter = _b, bf.isBefore = ac, bf.isBetween = bc, bf.isSame = cc, bf.isSameOrAfter = dc, bf.isSameOrBefore = ec, bf.isValid = zc, bf.lang = Xe, bf.locale = pc, bf.localeData = qc, bf.max = Pe, bf.min = Oe, bf.parsingFlags = Ac, bf.set = S, bf.startOf = rc, bf.subtract = We, bf.toArray = wc, bf.toObject = xc, bf.toDate = vc, bf.toISOString = ic, bf.inspect = jc, bf.toJSON = yc, bf.toString = hc, bf.unix = uc, bf.valueOf = tc, bf.creationData = Cc, bf.year = te, bf.isLeapYear = ra, bf.weekYear = Ec, bf.isoWeekYear = Fc, bf.quarter = bf.quarters = Kc, bf.month = ka, bf.daysInMonth = la, bf.week = bf.weeks = Ba, bf.isoWeek = bf.isoWeeks = Ca, bf.weeksInYear = Hc, bf.isoWeeksInYear = Gc, bf.date = Ye, bf.day = bf.days = Ka, bf.weekday = La, bf.isoWeekday = Ma, bf.dayOfYear = Lc, bf.hour = bf.hours = De, bf.minute = bf.minutes = Ze, bf.second = bf.seconds = $e, bf.millisecond = bf.milliseconds = af, bf.utcOffset = Hb, bf.utc = Jb, bf.local = Kb, bf.parseZone = Lb, bf.hasAlignedHourOffset = Mb, bf.isDST = Nb, bf.isLocal = Pb, bf.isUtcOffset = Qb, bf.isUtc = Rb, bf.isUTC = Rb, bf.zoneAbbr = Nc, bf.zoneName = Oc, bf.dates = x("dates accessor is deprecated. Use date instead.", Ye), bf.months = x("months accessor is deprecated. Use month instead", ka), bf.years = x("years accessor is deprecated. Use year instead", te), bf.zone = x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", Ib), bf.isDSTShifted = x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", Ob); var cf = C.prototype; cf.calendar = D, cf.longDateFormat = E, cf.invalidDate = F, cf.ordinal = G, cf.preparse = Rc, cf.postformat = Rc, cf.relativeTime = H, cf.pastFuture = I, cf.set = A, cf.months = fa, cf.monthsShort = ga, cf.monthsParse = ia, cf.monthsRegex = na, cf.monthsShortRegex = ma, cf.week = ya, cf.firstDayOfYear = Aa, cf.firstDayOfWeek = za, cf.weekdays = Fa, cf.weekdaysMin = Ha, cf.weekdaysShort = Ga, cf.weekdaysParse = Ja, cf.weekdaysRegex = Na, cf.weekdaysShortRegex = Oa, cf.weekdaysMinRegex = Pa, cf.isPM = Va, cf.meridiem = Wa, $a("en", { dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/, ordinal: function (a) { var b = a % 10, c = 1 === u(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th"; return a + c } }), a.lang = x("moment.lang is deprecated. Use moment.locale instead.", $a), a.langData = x("moment.langData is deprecated. Use moment.localeData instead.", bb); var df = Math.abs, ef = id("ms"), ff = id("s"), gf = id("m"), hf = id("h"), jf = id("d"), kf = id("w"), lf = id("M"), mf = id("y"), nf = kd("milliseconds"), of = kd("seconds"), pf = kd("minutes"), qf = kd("hours"), rf = kd("days"), sf = kd("months"), tf = kd("years"), uf = Math.round, vf = { ss: 44, s: 45, m: 45, h: 22, d: 26, M: 11 }, wf = Math.abs, xf = Ab.prototype; return xf.isValid = yb, xf.abs = $c, xf.add = ad, xf.subtract = bd, xf.as = gd, xf.asMilliseconds = ef, xf.asSeconds = ff, xf.asMinutes = gf, xf.asHours = hf, xf.asDays = jf, xf.asWeeks = kf, xf.asMonths = lf, xf.asYears = mf, xf.valueOf = hd, xf._bubble = dd, xf.get = jd, xf.milliseconds = nf, xf.seconds = of, xf.minutes = pf, xf.hours = qf, xf.days = rf, xf.weeks = ld, xf.months = sf, xf.years = tf, xf.humanize = qd, xf.toISOString = rd, xf.toString = rd, xf.toJSON = rd, xf.locale = pc, xf.localeData = qc, xf.toIsoString = x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", rd), xf.lang = Xe, U("X", 0, 0, "unix"), U("x", 0, 0, "valueOf"), Z("x", Zd), Z("X", ae), ba("X", function (a, b, c) { c._d = new Date(1e3 * parseFloat(a, 10)) }), ba("x", function (a, b, c) { c._d = new Date(u(a)) }), a.version = "2.18.1", b(tb), a.fn = bf, a.min = vb, a.max = wb, a.now = Qe, a.utc = l, a.unix = Pc, a.months = Vc, a.isDate = h, a.locale = $a, a.invalid = p, a.duration = Sb, a.isMoment = s, a.weekdays = Xc, a.parseZone = Qc, a.localeData = bb, a.isDuration = Bb, a.monthsShort = Wc, a.weekdaysMin = Zc, a.defineLocale = _a, a.updateLocale = ab, a.locales = cb, a.weekdaysShort = Yc, a.normalizeUnits = K, a.relativeTimeRounding = od, a.relativeTimeThreshold = pd, a.calendarFormat = Yb, a.prototype = bf, a
});

////////////////////////////////////////////////////////////////////

/**
 * Minified by jsDelivr using UglifyJS v3.4.0.
 * Original file: /npm/daterangepicker@3.0.3/daterangepicker.js
 * 
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!function (t, a) { if ("function" == typeof define && define.amd) define(["moment", "jquery"], function (t, e) { return e.fn || (e.fn = {}), a(t, e) }); else if ("object" == typeof module && module.exports) { var e = "undefined" != typeof window ? window.jQuery : void 0; e || (e = require("jquery")).fn || (e.fn = {}); var i = "undefined" != typeof window && void 0 !== window.moment ? window.moment : require("moment"); module.exports = a(i, e) } else t.daterangepicker = a(t.moment, t.jQuery) }(this, function (H, R) { var i = function (t, e, a) { if (this.parentEl = "body", this.element = R(t), this.startDate = H().startOf("day"), this.endDate = H().endOf("day"), this.minDate = !1, this.maxDate = !1, this.maxSpan = !1, this.autoApply = !1, this.singleDatePicker = !1, this.showDropdowns = !1, this.minYear = H().subtract(100, "year").format("YYYY"), this.maxYear = H().add(100, "year").format("YYYY"), this.showWeekNumbers = !1, this.showISOWeekNumbers = !1, this.showCustomRangeLabel = !0, this.timePicker = !1, this.timePicker24Hour = !1, this.timePickerIncrement = 1, this.timePickerSeconds = !1, this.linkedCalendars = !0, this.autoUpdateInput = !0, this.alwaysShowCalendars = !1, this.ranges = {}, this.opens = "right", this.element.hasClass("pull-right") && (this.opens = "left"), this.drops = "down", this.element.hasClass("dropup") && (this.drops = "up"), this.buttonClasses = "btn btn-sm", this.applyButtonClasses = "btn-primary", this.cancelButtonClasses = "btn-default", this.locale = { direction: "ltr", format: H.localeData().longDateFormat("L"), separator: " - ", applyLabel: "Apply", cancelLabel: "Cancel", weekLabel: "W", customRangeLabel: "Custom Range", daysOfWeek: H.weekdaysMin(), monthNames: H.monthsShort(), firstDay: H.localeData().firstDayOfWeek() }, this.callback = function () { }, this.isShowing = !1, this.leftCalendar = {}, this.rightCalendar = {}, "object" == typeof e && null !== e || (e = {}), "string" == typeof (e = R.extend(this.element.data(), e)).template || e.template instanceof R || (e.template = '<div class="daterangepicker"><div class="ranges"></div><div class="drp-calendar left"><div class="calendar-table"></div><div class="calendar-time"></div></div><div class="drp-calendar right"><div class="calendar-table"></div><div class="calendar-time"></div></div><div class="drp-buttons"><span class="drp-selected"></span><button class="cancelBtn" type="button"></button><button class="applyBtn" disabled="disabled" type="button"></button> </div></div>'), this.parentEl = e.parentEl && R(e.parentEl).length ? R(e.parentEl) : R(this.parentEl), this.container = R(e.template).appendTo(this.parentEl), "object" == typeof e.locale && ("string" == typeof e.locale.direction && (this.locale.direction = e.locale.direction), "string" == typeof e.locale.format && (this.locale.format = e.locale.format), "string" == typeof e.locale.separator && (this.locale.separator = e.locale.separator), "object" == typeof e.locale.daysOfWeek && (this.locale.daysOfWeek = e.locale.daysOfWeek.slice()), "object" == typeof e.locale.monthNames && (this.locale.monthNames = e.locale.monthNames.slice()), "number" == typeof e.locale.firstDay && (this.locale.firstDay = e.locale.firstDay), "string" == typeof e.locale.applyLabel && (this.locale.applyLabel = e.locale.applyLabel), "string" == typeof e.locale.cancelLabel && (this.locale.cancelLabel = e.locale.cancelLabel), "string" == typeof e.locale.weekLabel && (this.locale.weekLabel = e.locale.weekLabel), "string" == typeof e.locale.customRangeLabel)) { (d = document.createElement("textarea")).innerHTML = e.locale.customRangeLabel; var i = d.value; this.locale.customRangeLabel = i } if (this.container.addClass(this.locale.direction), "string" == typeof e.startDate && (this.startDate = H(e.startDate, this.locale.format)), "string" == typeof e.endDate && (this.endDate = H(e.endDate, this.locale.format)), "string" == typeof e.minDate && (this.minDate = H(e.minDate, this.locale.format)), "string" == typeof e.maxDate && (this.maxDate = H(e.maxDate, this.locale.format)), "object" == typeof e.startDate && (this.startDate = H(e.startDate)), "object" == typeof e.endDate && (this.endDate = H(e.endDate)), "object" == typeof e.minDate && (this.minDate = H(e.minDate)), "object" == typeof e.maxDate && (this.maxDate = H(e.maxDate)), this.minDate && this.startDate.isBefore(this.minDate) && (this.startDate = this.minDate.clone()), this.maxDate && this.endDate.isAfter(this.maxDate) && (this.endDate = this.maxDate.clone()), "string" == typeof e.applyButtonClasses && (this.applyButtonClasses = e.applyButtonClasses), "string" == typeof e.applyClass && (this.applyButtonClasses = e.applyClass), "string" == typeof e.cancelButtonClasses && (this.cancelButtonClasses = e.cancelButtonClasses), "string" == typeof e.cancelClass && (this.cancelButtonClasses = e.cancelClass), "object" == typeof e.maxSpan && (this.maxSpan = e.maxSpan), "object" == typeof e.dateLimit && (this.maxSpan = e.dateLimit), "string" == typeof e.opens && (this.opens = e.opens), "string" == typeof e.drops && (this.drops = e.drops), "boolean" == typeof e.showWeekNumbers && (this.showWeekNumbers = e.showWeekNumbers), "boolean" == typeof e.showISOWeekNumbers && (this.showISOWeekNumbers = e.showISOWeekNumbers), "string" == typeof e.buttonClasses && (this.buttonClasses = e.buttonClasses), "object" == typeof e.buttonClasses && (this.buttonClasses = e.buttonClasses.join(" ")), "boolean" == typeof e.showDropdowns && (this.showDropdowns = e.showDropdowns), "number" == typeof e.minYear && (this.minYear = e.minYear), "number" == typeof e.maxYear && (this.maxYear = e.maxYear), "boolean" == typeof e.showCustomRangeLabel && (this.showCustomRangeLabel = e.showCustomRangeLabel), "boolean" == typeof e.singleDatePicker && (this.singleDatePicker = e.singleDatePicker, this.singleDatePicker && (this.endDate = this.startDate.clone())), "boolean" == typeof e.timePicker && (this.timePicker = e.timePicker), "boolean" == typeof e.timePickerSeconds && (this.timePickerSeconds = e.timePickerSeconds), "number" == typeof e.timePickerIncrement && (this.timePickerIncrement = e.timePickerIncrement), "boolean" == typeof e.timePicker24Hour && (this.timePicker24Hour = e.timePicker24Hour), "boolean" == typeof e.autoApply && (this.autoApply = e.autoApply), "boolean" == typeof e.autoUpdateInput && (this.autoUpdateInput = e.autoUpdateInput), "boolean" == typeof e.linkedCalendars && (this.linkedCalendars = e.linkedCalendars), "function" == typeof e.isInvalidDate && (this.isInvalidDate = e.isInvalidDate), "function" == typeof e.isCustomDate && (this.isCustomDate = e.isCustomDate), "boolean" == typeof e.alwaysShowCalendars && (this.alwaysShowCalendars = e.alwaysShowCalendars), 0 != this.locale.firstDay) for (var s = this.locale.firstDay; 0 < s;)this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift()), s--; var n, r, o; if (void 0 === e.startDate && void 0 === e.endDate && R(this.element).is(":text")) { var h = R(this.element).val(), l = h.split(this.locale.separator); n = r = null, 2 == l.length ? (n = H(l[0], this.locale.format), r = H(l[1], this.locale.format)) : this.singleDatePicker && "" !== h && (n = H(h, this.locale.format), r = H(h, this.locale.format)), null !== n && null !== r && (this.setStartDate(n), this.setEndDate(r)) } if ("object" == typeof e.ranges) { for (o in e.ranges) { n = "string" == typeof e.ranges[o][0] ? H(e.ranges[o][0], this.locale.format) : H(e.ranges[o][0]), r = "string" == typeof e.ranges[o][1] ? H(e.ranges[o][1], this.locale.format) : H(e.ranges[o][1]), this.minDate && n.isBefore(this.minDate) && (n = this.minDate.clone()); var c = this.maxDate; if (this.maxSpan && c && n.clone().add(this.maxSpan).isAfter(c) && (c = n.clone().add(this.maxSpan)), c && r.isAfter(c) && (r = c.clone()), !(this.minDate && r.isBefore(this.minDate, this.timepicker ? "minute" : "day") || c && n.isAfter(c, this.timepicker ? "minute" : "day"))) { var d; (d = document.createElement("textarea")).innerHTML = o; i = d.value; this.ranges[i] = [n, r] } } var m = "<ul>"; for (o in this.ranges) m += '<li data-range-key="' + o + '">' + o + "</li>"; this.showCustomRangeLabel && (m += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + "</li>"), m += "</ul>", this.container.find(".ranges").prepend(m) } "function" == typeof a && (this.callback = a), this.timePicker || (this.startDate = this.startDate.startOf("day"), this.endDate = this.endDate.endOf("day"), this.container.find(".calendar-time").hide()), this.timePicker && this.autoApply && (this.autoApply = !1), this.autoApply && this.container.addClass("auto-apply"), "object" == typeof e.ranges && this.container.addClass("show-ranges"), this.singleDatePicker && (this.container.addClass("single"), this.container.find(".drp-calendar.left").addClass("single"), this.container.find(".drp-calendar.left").show(), this.container.find(".drp-calendar.right").hide(), this.timePicker || this.container.addClass("auto-apply")), (void 0 === e.ranges && !this.singleDatePicker || this.alwaysShowCalendars) && this.container.addClass("show-calendar"), this.container.addClass("opens" + this.opens), this.container.find(".applyBtn, .cancelBtn").addClass(this.buttonClasses), this.applyButtonClasses.length && this.container.find(".applyBtn").addClass(this.applyButtonClasses), this.cancelButtonClasses.length && this.container.find(".cancelBtn").addClass(this.cancelButtonClasses), this.container.find(".applyBtn").html(this.locale.applyLabel), this.container.find(".cancelBtn").html(this.locale.cancelLabel), this.container.find(".drp-calendar").on("click.daterangepicker", ".prev", R.proxy(this.clickPrev, this)).on("click.daterangepicker", ".next", R.proxy(this.clickNext, this)).on("mousedown.daterangepicker", "td.available", R.proxy(this.clickDate, this)).on("mouseenter.daterangepicker", "td.available", R.proxy(this.hoverDate, this)).on("change.daterangepicker", "select.yearselect", R.proxy(this.monthOrYearChanged, this)).on("change.daterangepicker", "select.monthselect", R.proxy(this.monthOrYearChanged, this)).on("change.daterangepicker", "select.hourselect,select.minuteselect,select.secondselect,select.ampmselect", R.proxy(this.timeChanged, this)), this.container.find(".ranges").on("click.daterangepicker", "li", R.proxy(this.clickRange, this)), this.container.find(".drp-buttons").on("click.daterangepicker", "button.applyBtn", R.proxy(this.clickApply, this)).on("click.daterangepicker", "button.cancelBtn", R.proxy(this.clickCancel, this)), this.element.is("input") || this.element.is("button") ? this.element.on({ "click.daterangepicker": R.proxy(this.show, this), "focus.daterangepicker": R.proxy(this.show, this), "keyup.daterangepicker": R.proxy(this.elementChanged, this), "keydown.daterangepicker": R.proxy(this.keydown, this) }) : (this.element.on("click.daterangepicker", R.proxy(this.toggle, this)), this.element.on("keydown.daterangepicker", R.proxy(this.toggle, this))), this.updateElement() }; return i.prototype = { constructor: i, setStartDate: function (t) { "string" == typeof t && (this.startDate = H(t, this.locale.format)), "object" == typeof t && (this.startDate = H(t)), this.timePicker || (this.startDate = this.startDate.startOf("day")), this.timePicker && this.timePickerIncrement && this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement), this.minDate && this.startDate.isBefore(this.minDate) && (this.startDate = this.minDate.clone(), this.timePicker && this.timePickerIncrement && this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement)), this.maxDate && this.startDate.isAfter(this.maxDate) && (this.startDate = this.maxDate.clone(), this.timePicker && this.timePickerIncrement && this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement)), this.isShowing || this.updateElement(), this.updateMonthsInView() }, setEndDate: function (t) { "string" == typeof t && (this.endDate = H(t, this.locale.format)), "object" == typeof t && (this.endDate = H(t)), this.timePicker || (this.endDate = this.endDate.add(1, "d").startOf("day").subtract(1, "second")), this.timePicker && this.timePickerIncrement && this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement), this.endDate.isBefore(this.startDate) && (this.endDate = this.startDate.clone()), this.maxDate && this.endDate.isAfter(this.maxDate) && (this.endDate = this.maxDate.clone()), this.maxSpan && this.startDate.clone().add(this.maxSpan).isBefore(this.endDate) && (this.endDate = this.startDate.clone().add(this.maxSpan)), this.previousRightTime = this.endDate.clone(), this.container.find(".drp-selected").html(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format)), this.isShowing || this.updateElement(), this.updateMonthsInView() }, isInvalidDate: function () { return !1 }, isCustomDate: function () { return !1 }, updateView: function () { this.timePicker && (this.renderTimePicker("left"), this.renderTimePicker("right"), this.endDate ? this.container.find(".right .calendar-time select").removeAttr("disabled").removeClass("disabled") : this.container.find(".right .calendar-time select").attr("disabled", "disabled").addClass("disabled")), this.endDate && this.container.find(".drp-selected").html(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format)), this.updateMonthsInView(), this.updateCalendars(), this.updateFormInputs() }, updateMonthsInView: function () { if (this.endDate) { if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month && (this.startDate.format("YYYY-MM") == this.leftCalendar.month.format("YYYY-MM") || this.startDate.format("YYYY-MM") == this.rightCalendar.month.format("YYYY-MM")) && (this.endDate.format("YYYY-MM") == this.leftCalendar.month.format("YYYY-MM") || this.endDate.format("YYYY-MM") == this.rightCalendar.month.format("YYYY-MM"))) return; this.leftCalendar.month = this.startDate.clone().date(2), this.linkedCalendars || this.endDate.month() == this.startDate.month() && this.endDate.year() == this.startDate.year() ? this.rightCalendar.month = this.startDate.clone().date(2).add(1, "month") : this.rightCalendar.month = this.endDate.clone().date(2) } else this.leftCalendar.month.format("YYYY-MM") != this.startDate.format("YYYY-MM") && this.rightCalendar.month.format("YYYY-MM") != this.startDate.format("YYYY-MM") && (this.leftCalendar.month = this.startDate.clone().date(2), this.rightCalendar.month = this.startDate.clone().date(2).add(1, "month")); this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate && (this.rightCalendar.month = this.maxDate.clone().date(2), this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, "month")) }, updateCalendars: function () { if (this.timePicker) { var t, e, a, i; if (this.endDate) { if (t = parseInt(this.container.find(".left .hourselect").val(), 10), e = parseInt(this.container.find(".left .minuteselect").val(), 10), a = this.timePickerSeconds ? parseInt(this.container.find(".left .secondselect").val(), 10) : 0, !this.timePicker24Hour) "PM" === (i = this.container.find(".left .ampmselect").val()) && t < 12 && (t += 12), "AM" === i && 12 === t && (t = 0) } else if (t = parseInt(this.container.find(".right .hourselect").val(), 10), e = parseInt(this.container.find(".right .minuteselect").val(), 10), a = this.timePickerSeconds ? parseInt(this.container.find(".right .secondselect").val(), 10) : 0, !this.timePicker24Hour) "PM" === (i = this.container.find(".right .ampmselect").val()) && t < 12 && (t += 12), "AM" === i && 12 === t && (t = 0); this.leftCalendar.month.hour(t).minute(e).second(a), this.rightCalendar.month.hour(t).minute(e).second(a) } this.renderCalendar("left"), this.renderCalendar("right"), this.container.find(".ranges li").removeClass("active"), null != this.endDate && this.calculateChosenLabel() }, renderCalendar: function (t) { var e, a = (e = "left" == t ? this.leftCalendar : this.rightCalendar).month.month(), i = e.month.year(), s = e.month.hour(), n = e.month.minute(), r = e.month.second(), o = H([i, a]).daysInMonth(), h = H([i, a, 1]), l = H([i, a, o]), c = H(h).subtract(1, "month").month(), d = H(h).subtract(1, "month").year(), m = H([d, c]).daysInMonth(), f = h.day(); (e = []).firstDay = h, e.lastDay = l; for (var p = 0; p < 6; p++)e[p] = []; var u = m - f + this.locale.firstDay + 1; m < u && (u -= 7), f == this.locale.firstDay && (u = m - 6); for (var D = H([d, c, u, 12, n, r]), g = (p = 0, 0), y = 0; p < 42; p++ , g++ , D = H(D).add(24, "hour"))0 < p && g % 7 == 0 && (g = 0, y++), e[y][g] = D.clone().hour(s).minute(n).second(r), D.hour(12), this.minDate && e[y][g].format("YYYY-MM-DD") == this.minDate.format("YYYY-MM-DD") && e[y][g].isBefore(this.minDate) && "left" == t && (e[y][g] = this.minDate.clone()), this.maxDate && e[y][g].format("YYYY-MM-DD") == this.maxDate.format("YYYY-MM-DD") && e[y][g].isAfter(this.maxDate) && "right" == t && (e[y][g] = this.maxDate.clone()); "left" == t ? this.leftCalendar.calendar = e : this.rightCalendar.calendar = e; var k = "left" == t ? this.minDate : this.startDate, b = this.maxDate, C = ("left" == t ? this.startDate : this.endDate, this.locale.direction, '<table class="table-condensed">'); C += "<thead>", C += "<tr>", (this.showWeekNumbers || this.showISOWeekNumbers) && (C += "<th></th>"), k && !k.isBefore(e.firstDay) || this.linkedCalendars && "left" != t ? C += "<th></th>" : C += '<th class="prev available"><span></span></th>'; var v = this.locale.monthNames[e[1][1].month()] + e[1][1].format(" YYYY"); if (this.showDropdowns) { for (var Y = e[1][1].month(), w = e[1][1].year(), P = b && b.year() || this.maxYear, x = k && k.year() || this.minYear, M = w == x, S = w == P, I = '<select class="monthselect">', B = 0; B < 12; B++)(!M || B >= k.month()) && (!S || B <= b.month()) ? I += "<option value='" + B + "'" + (B === Y ? " selected='selected'" : "") + ">" + this.locale.monthNames[B] + "</option>" : I += "<option value='" + B + "'" + (B === Y ? " selected='selected'" : "") + " disabled='disabled'>" + this.locale.monthNames[B] + "</option>"; I += "</select>"; for (var A = '<select class="yearselect">', L = x; L <= P; L++)A += '<option value="' + L + '"' + (L === w ? ' selected="selected"' : "") + ">" + L + "</option>"; v = I + (A += "</select>") } if (C += '<th colspan="5" class="month">' + v + "</th>", b && !b.isAfter(e.lastDay) || this.linkedCalendars && "right" != t && !this.singleDatePicker ? C += "<th></th>" : C += '<th class="next available"><span></span></th>', C += "</tr>", C += "<tr>", (this.showWeekNumbers || this.showISOWeekNumbers) && (C += '<th class="week">' + this.locale.weekLabel + "</th>"), R.each(this.locale.daysOfWeek, function (t, e) { C += "<th>" + e + "</th>" }), C += "</tr>", C += "</thead>", C += "<tbody>", null == this.endDate && this.maxSpan) { var E = this.startDate.clone().add(this.maxSpan).endOf("day"); b && !E.isBefore(b) || (b = E) } for (y = 0; y < 6; y++) { C += "<tr>", this.showWeekNumbers ? C += '<td class="week">' + e[y][0].week() + "</td>" : this.showISOWeekNumbers && (C += '<td class="week">' + e[y][0].isoWeek() + "</td>"); for (g = 0; g < 7; g++) { var W = []; e[y][g].isSame(new Date, "day") && W.push("today"), 5 < e[y][g].isoWeekday() && W.push("weekend"), e[y][g].month() != e[1][1].month() && W.push("off"), this.minDate && e[y][g].isBefore(this.minDate, "day") && W.push("off", "disabled"), b && e[y][g].isAfter(b, "day") && W.push("off", "disabled"), this.isInvalidDate(e[y][g]) && W.push("off", "disabled"), e[y][g].format("YYYY-MM-DD") == this.startDate.format("YYYY-MM-DD") && W.push("active", "start-date"), null != this.endDate && e[y][g].format("YYYY-MM-DD") == this.endDate.format("YYYY-MM-DD") && W.push("active", "end-date"), null != this.endDate && e[y][g] > this.startDate && e[y][g] < this.endDate && W.push("in-range"); var O = this.isCustomDate(e[y][g]); !1 !== O && ("string" == typeof O ? W.push(O) : Array.prototype.push.apply(W, O)); var N = "", j = !1; for (p = 0; p < W.length; p++)N += W[p] + " ", "disabled" == W[p] && (j = !0); j || (N += "available"), C += '<td class="' + N.replace(/^\s+|\s+$/g, "") + '" data-title="r' + y + "c" + g + '">' + e[y][g].date() + "</td>" } C += "</tr>" } C += "</tbody>", C += "</table>", this.container.find(".drp-calendar." + t + " .calendar-table").html(C) }, renderTimePicker: function (t) { if ("right" != t || this.endDate) { var e, a, i, s = this.maxDate; if (!this.maxSpan || this.maxDate && !this.startDate.clone().add(this.maxSpan).isAfter(this.maxDate) || (s = this.startDate.clone().add(this.maxSpan)), "left" == t) a = this.startDate.clone(), i = this.minDate; else if ("right" == t) { a = this.endDate.clone(), i = this.startDate; var n = this.container.find(".drp-calendar.right .calendar-time"); if ("" != n.html() && (a.hour(a.hour() || n.find(".hourselect option:selected").val()), a.minute(a.minute() || n.find(".minuteselect option:selected").val()), a.second(a.second() || n.find(".secondselect option:selected").val()), !this.timePicker24Hour)) { var r = n.find(".ampmselect option:selected").val(); "PM" === r && a.hour() < 12 && a.hour(a.hour() + 12), "AM" === r && 12 === a.hour() && a.hour(0) } a.isBefore(this.startDate) && (a = this.startDate.clone()), s && a.isAfter(s) && (a = s.clone()) } e = '<select class="hourselect">'; for (var o = this.timePicker24Hour ? 0 : 1, h = this.timePicker24Hour ? 23 : 12, l = o; l <= h; l++) { var c = l; this.timePicker24Hour || (c = 12 <= a.hour() ? 12 == l ? 12 : l + 12 : 12 == l ? 0 : l); var d = a.clone().hour(c), m = !1; i && d.minute(59).isBefore(i) && (m = !0), s && d.minute(0).isAfter(s) && (m = !0), c != a.hour() || m ? e += m ? '<option value="' + l + '" disabled="disabled" class="disabled">' + l + "</option>" : '<option value="' + l + '">' + l + "</option>" : e += '<option value="' + l + '" selected="selected">' + l + "</option>" } e += "</select> ", e += ': <select class="minuteselect">'; for (l = 0; l < 60; l += this.timePickerIncrement) { var f = l < 10 ? "0" + l : l; d = a.clone().minute(l), m = !1; i && d.second(59).isBefore(i) && (m = !0), s && d.second(0).isAfter(s) && (m = !0), a.minute() != l || m ? e += m ? '<option value="' + l + '" disabled="disabled" class="disabled">' + f + "</option>" : '<option value="' + l + '">' + f + "</option>" : e += '<option value="' + l + '" selected="selected">' + f + "</option>" } if (e += "</select> ", this.timePickerSeconds) { e += ': <select class="secondselect">'; for (l = 0; l < 60; l++) { f = l < 10 ? "0" + l : l, d = a.clone().second(l), m = !1; i && d.isBefore(i) && (m = !0), s && d.isAfter(s) && (m = !0), a.second() != l || m ? e += m ? '<option value="' + l + '" disabled="disabled" class="disabled">' + f + "</option>" : '<option value="' + l + '">' + f + "</option>" : e += '<option value="' + l + '" selected="selected">' + f + "</option>" } e += "</select> " } if (!this.timePicker24Hour) { e += '<select class="ampmselect">'; var p = "", u = ""; i && a.clone().hour(12).minute(0).second(0).isBefore(i) && (p = ' disabled="disabled" class="disabled"'), s && a.clone().hour(0).minute(0).second(0).isAfter(s) && (u = ' disabled="disabled" class="disabled"'), 12 <= a.hour() ? e += '<option value="AM"' + p + '>AM</option><option value="PM" selected="selected"' + u + ">PM</option>" : e += '<option value="AM" selected="selected"' + p + '>AM</option><option value="PM"' + u + ">PM</option>", e += "</select>" } this.container.find(".drp-calendar." + t + " .calendar-time").html(e) } }, updateFormInputs: function () { this.singleDatePicker || this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)) ? this.container.find("button.applyBtn").removeAttr("disabled") : this.container.find("button.applyBtn").attr("disabled", "disabled") }, move: function () { var t, e = { top: 0, left: 0 }, a = R(window).width(); this.parentEl.is("body") || (e = { top: this.parentEl.offset().top - this.parentEl.scrollTop(), left: this.parentEl.offset().left - this.parentEl.scrollLeft() }, a = this.parentEl[0].clientWidth + this.parentEl.offset().left), t = "up" == this.drops ? this.element.offset().top - this.container.outerHeight() - e.top : this.element.offset().top + this.element.outerHeight() - e.top, this.container["up" == this.drops ? "addClass" : "removeClass"]("drop-up"), "left" == this.opens ? (this.container.css({ top: t, right: a - this.element.offset().left - this.element.outerWidth(), left: "auto" }), this.container.offset().left < 0 && this.container.css({ right: "auto", left: 9 })) : "center" == this.opens ? (this.container.css({ top: t, left: this.element.offset().left - e.left + this.element.outerWidth() / 2 - this.container.outerWidth() / 2, right: "auto" }), this.container.offset().left < 0 && this.container.css({ right: "auto", left: 9 })) : (this.container.css({ top: t, left: this.element.offset().left - e.left, right: "auto" }), this.container.offset().left + this.container.outerWidth() > R(window).width() && this.container.css({ left: "auto", right: 0 })) }, show: function (t) { this.isShowing || (this._outsideClickProxy = R.proxy(function (t) { this.outsideClick(t) }, this), R(document).on("mousedown.daterangepicker", this._outsideClickProxy).on("touchend.daterangepicker", this._outsideClickProxy).on("click.daterangepicker", "[data-toggle=dropdown]", this._outsideClickProxy).on("focusin.daterangepicker", this._outsideClickProxy), R(window).on("resize.daterangepicker", R.proxy(function (t) { this.move(t) }, this)), this.oldStartDate = this.startDate.clone(), this.oldEndDate = this.endDate.clone(), this.previousRightTime = this.endDate.clone(), this.updateView(), this.container.show(), this.move(), this.element.trigger("show.daterangepicker", this), this.isShowing = !0) }, hide: function (t) { this.isShowing && (this.endDate || (this.startDate = this.oldStartDate.clone(), this.endDate = this.oldEndDate.clone()), this.startDate.isSame(this.oldStartDate) && this.endDate.isSame(this.oldEndDate) || this.callback(this.startDate.clone(), this.endDate.clone(), this.chosenLabel), this.updateElement(), R(document).off(".daterangepicker"), R(window).off(".daterangepicker"), this.container.hide(), this.element.trigger("hide.daterangepicker", this), this.isShowing = !1) }, toggle: function (t) { this.isShowing ? this.hide() : this.show() }, outsideClick: function (t) { var e = R(t.target); "focusin" == t.type || e.closest(this.element).length || e.closest(this.container).length || e.closest(".calendar-table").length || (this.hide(), this.element.trigger("outsideClick.daterangepicker", this)) }, showCalendars: function () { this.container.addClass("show-calendar"), this.move(), this.element.trigger("showCalendar.daterangepicker", this) }, hideCalendars: function () { this.container.removeClass("show-calendar"), this.element.trigger("hideCalendar.daterangepicker", this) }, clickRange: function (t) { var e = t.target.getAttribute("data-range-key"); if ((this.chosenLabel = e) == this.locale.customRangeLabel) this.showCalendars(); else { var a = this.ranges[e]; this.startDate = a[0], this.endDate = a[1], this.timePicker || (this.startDate.startOf("day"), this.endDate.endOf("day")), this.alwaysShowCalendars || this.hideCalendars(), this.clickApply() } }, clickPrev: function (t) { R(t.target).parents(".drp-calendar").hasClass("left") ? (this.leftCalendar.month.subtract(1, "month"), this.linkedCalendars && this.rightCalendar.month.subtract(1, "month")) : this.rightCalendar.month.subtract(1, "month"), this.updateCalendars() }, clickNext: function (t) { R(t.target).parents(".drp-calendar").hasClass("left") ? this.leftCalendar.month.add(1, "month") : (this.rightCalendar.month.add(1, "month"), this.linkedCalendars && this.leftCalendar.month.add(1, "month")), this.updateCalendars() }, hoverDate: function (t) { if (R(t.target).hasClass("available")) { var e = R(t.target).attr("data-title"), a = e.substr(1, 1), i = e.substr(3, 1), r = R(t.target).parents(".drp-calendar").hasClass("left") ? this.leftCalendar.calendar[a][i] : this.rightCalendar.calendar[a][i], o = this.leftCalendar, h = this.rightCalendar, l = this.startDate; this.endDate || this.container.find(".drp-calendar tbody td").each(function (t, e) { if (!R(e).hasClass("week")) { var a = R(e).attr("data-title"), i = a.substr(1, 1), s = a.substr(3, 1), n = R(e).parents(".drp-calendar").hasClass("left") ? o.calendar[i][s] : h.calendar[i][s]; n.isAfter(l) && n.isBefore(r) || n.isSame(r, "day") ? R(e).addClass("in-range") : R(e).removeClass("in-range") } }) } }, clickDate: function (t) { if (R(t.target).hasClass("available")) { var e = R(t.target).attr("data-title"), a = e.substr(1, 1), i = e.substr(3, 1), s = R(t.target).parents(".drp-calendar").hasClass("left") ? this.leftCalendar.calendar[a][i] : this.rightCalendar.calendar[a][i]; if (this.endDate || s.isBefore(this.startDate, "day")) { if (this.timePicker) { var n = parseInt(this.container.find(".left .hourselect").val(), 10); if (!this.timePicker24Hour) "PM" === (h = this.container.find(".left .ampmselect").val()) && n < 12 && (n += 12), "AM" === h && 12 === n && (n = 0); var r = parseInt(this.container.find(".left .minuteselect").val(), 10), o = this.timePickerSeconds ? parseInt(this.container.find(".left .secondselect").val(), 10) : 0; s = s.clone().hour(n).minute(r).second(o) } this.endDate = null, this.setStartDate(s.clone()) } else if (!this.endDate && s.isBefore(this.startDate)) this.setEndDate(this.startDate.clone()); else { if (this.timePicker) { var h; n = parseInt(this.container.find(".right .hourselect").val(), 10); if (!this.timePicker24Hour) "PM" === (h = this.container.find(".right .ampmselect").val()) && n < 12 && (n += 12), "AM" === h && 12 === n && (n = 0); r = parseInt(this.container.find(".right .minuteselect").val(), 10), o = this.timePickerSeconds ? parseInt(this.container.find(".right .secondselect").val(), 10) : 0; s = s.clone().hour(n).minute(r).second(o) } this.setEndDate(s.clone()), this.autoApply && (this.calculateChosenLabel(), this.clickApply()) } this.singleDatePicker && (this.setEndDate(this.startDate), this.timePicker || this.clickApply()), this.updateView(), t.stopPropagation() } }, calculateChosenLabel: function () { var t = !0, e = 0; for (var a in this.ranges) { if (this.timePicker) { var i = this.timePickerSeconds ? "YYYY-MM-DD hh:mm:ss" : "YYYY-MM-DD hh:mm"; if (this.startDate.format(i) == this.ranges[a][0].format(i) && this.endDate.format(i) == this.ranges[a][1].format(i)) { t = !1, this.chosenLabel = this.container.find(".ranges li:eq(" + e + ")").addClass("active").attr("data-range-key"); break } } else if (this.startDate.format("YYYY-MM-DD") == this.ranges[a][0].format("YYYY-MM-DD") && this.endDate.format("YYYY-MM-DD") == this.ranges[a][1].format("YYYY-MM-DD")) { t = !1, this.chosenLabel = this.container.find(".ranges li:eq(" + e + ")").addClass("active").attr("data-range-key"); break } e++ } t && (this.showCustomRangeLabel ? this.chosenLabel = this.container.find(".ranges li:last").addClass("active").attr("data-range-key") : this.chosenLabel = null, this.showCalendars()) }, clickApply: function (t) { this.hide(), this.element.trigger("apply.daterangepicker", this) }, clickCancel: function (t) { this.startDate = this.oldStartDate, this.endDate = this.oldEndDate, this.hide(), this.element.trigger("cancel.daterangepicker", this) }, monthOrYearChanged: function (t) { var e = R(t.target).closest(".drp-calendar").hasClass("left"), a = e ? "left" : "right", i = this.container.find(".drp-calendar." + a), s = parseInt(i.find(".monthselect").val(), 10), n = i.find(".yearselect").val(); e || (n < this.startDate.year() || n == this.startDate.year() && s < this.startDate.month()) && (s = this.startDate.month(), n = this.startDate.year()), this.minDate && (n < this.minDate.year() || n == this.minDate.year() && s < this.minDate.month()) && (s = this.minDate.month(), n = this.minDate.year()), this.maxDate && (n > this.maxDate.year() || n == this.maxDate.year() && s > this.maxDate.month()) && (s = this.maxDate.month(), n = this.maxDate.year()), e ? (this.leftCalendar.month.month(s).year(n), this.linkedCalendars && (this.rightCalendar.month = this.leftCalendar.month.clone().add(1, "month"))) : (this.rightCalendar.month.month(s).year(n), this.linkedCalendars && (this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, "month"))), this.updateCalendars() }, timeChanged: function (t) { var e = R(t.target).closest(".drp-calendar"), a = e.hasClass("left"), i = parseInt(e.find(".hourselect").val(), 10), s = parseInt(e.find(".minuteselect").val(), 10), n = this.timePickerSeconds ? parseInt(e.find(".secondselect").val(), 10) : 0; if (!this.timePicker24Hour) { var r = e.find(".ampmselect").val(); "PM" === r && i < 12 && (i += 12), "AM" === r && 12 === i && (i = 0) } if (a) { var o = this.startDate.clone(); o.hour(i), o.minute(s), o.second(n), this.setStartDate(o), this.singleDatePicker ? this.endDate = this.startDate.clone() : this.endDate && this.endDate.format("YYYY-MM-DD") == o.format("YYYY-MM-DD") && this.endDate.isBefore(o) && this.setEndDate(o.clone()) } else if (this.endDate) { var h = this.endDate.clone(); h.hour(i), h.minute(s), h.second(n), this.setEndDate(h) } this.updateCalendars(), this.updateFormInputs(), this.renderTimePicker("left"), this.renderTimePicker("right") }, elementChanged: function () { if (this.element.is("input") && this.element.val().length) { var t = this.element.val().split(this.locale.separator), e = null, a = null; 2 === t.length && (e = H(t[0], this.locale.format), a = H(t[1], this.locale.format)), (this.singleDatePicker || null === e || null === a) && (a = e = H(this.element.val(), this.locale.format)), e.isValid() && a.isValid() && (this.setStartDate(e), this.setEndDate(a), this.updateView()) } }, keydown: function (t) { 9 !== t.keyCode && 13 !== t.keyCode || this.hide(), 27 === t.keyCode && (t.preventDefault(), t.stopPropagation(), this.hide()) }, updateElement: function () { if (this.element.is("input") && this.autoUpdateInput) { var t = this.startDate.format(this.locale.format); this.singleDatePicker || (t += this.locale.separator + this.endDate.format(this.locale.format)), t !== this.element.val() && this.element.val(t).trigger("change") } }, remove: function () { this.container.remove(), this.element.off(".daterangepicker"), this.element.removeData() } }, R.fn.daterangepicker = function (t, e) { var a = R.extend(!0, {}, R.fn.daterangepicker.defaultOptions, t); return this.each(function () { var t = R(this); t.data("daterangepicker") && t.data("daterangepicker").remove(), t.data("daterangepicker", new i(t, a, e)) }), this }, i });
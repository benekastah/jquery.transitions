// From https://github.com/benekastah/css3-transitions

(function ($, undefined) {
	
	var supportsWebkitTransitionEnd = "onwebkittransitionend" in window;

	var _keys = Object.keys || function (o) {
		var keys = [];
		for (var p in o) {
			if (o.hasOwnProperty(p)) {
				keys.push(p);
			}
		}
		return keys;
	};

	var transition_prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-', '-khtml-'];

	$.fn.css_transition = function (name, set_val) {
		var set;
		if (name && typeof name === "object") {
			set = name;
		} else if (arguments.length >= 2) {
			set = {};
			set[name != null ? name : ''] = set_val;
		}

		var names;
		var setting;
		if (set) {
			names = _keys(set);
			setting = true;
		} else {
			names = [name];
			set = {};
		}

		for (var n = 0, nlen = names.length; n < nlen; n++) {
			var result;
			name = names[n];

			if (name) {
				name = '-' + name;
			} else {
				name = '';
			}

			set_val = set[name];

			for (var t = 0, tlen = transition_prefixes.length; t < tlen; t++) {
				var prop = transition_prefixes[t] + 'transition' + name;
				if (setting) {
					this.css(prop, set_val);
				} else {
					var val = this.css(prop);

					if (val != null && !result) {
						result = val;
					}

					if (result) {
						break;
					}
				}
			}
		}

		return setting ? this : result;
	};
	
	var default_options = {
		duration: 400,
		easing: 'ease',
		fallbackEasing: 'swing',
		delay: 0
	};

	var re_seconds = /[\d\.]+s$/;
	var get_time = function (time) {
		if (typeof time === "number") {
			return time;
		}
		
		var n = parseFloat(time);
		if (re_seconds.test(time)) {
			n *= 1000;
		}
		return Math.round(n);
	};

	var transitionTimeout = 1000;
	$.fn.transition = function (properties, options) {
		var el = this;
		
		options = $.extend({}, default_options, options);
		options.duration = get_time(options.duration) || get_time(el.css_transition('duration'));
		options.delay = get_time(options.delay) || get_time(el.css_transition('delay'));
		options.easing = options.easing || el.css_transition('timing-function');
		
		// Fallback to jQuery animation if Mozernizr says so.
		var noCssTransitions;
		if ($.fn.transition.FALLBACK || (typeof Modernizr !== "undefined" && !Modernizr.csstransitions)) {
			if (properties) {
				if (!(options.easing in $.easing)) {
					options.easing = options.fallbackEasing;
				}
				return el.animate(properties, options);
			}
			else {
				noCssTransitions = true;
			}
		}
		
		var transition_data = el.data('transition');
		if (!transition_data) {
			transition_data = {};
			el.data('transition', transition_data);
		}
		
		el.queue(function (next) {
			transition_data.old_transition = transition_data.old_transition || el.css_transition();
			el.css_transition(null, 'all ' + options.duration + 'ms ' + options.easing + ' ' + options.delay + 'ms');

			var interval = setInterval(function () {
				var duration, delay;
				duration = get_time(el.css_transition('duration'));
				delay = get_time(el.css_transition('delay'));
				if (noCssTransitions || (duration === options.duration && delay === options.delay)) {
					clearInterval(interval);
					clearTimeout(timeout);
					if (properties) {
						el.css(properties);
					}

					el.one('transitionEnd', function (event) {
						el.css_transition(null, transition_data.old_transition);
						delete transition_data.old_transition;
						next();
					});

					if (options.complete) {
						el.one('transitionEnd', options.complete);
					}

					setTimeout(function () {
						el.trigger('transitionEnd');
					}, noCssTransitions ? 0 : options.delay + options.duration);
				}
			});

			var timeout = setTimeout(function () {
				clearInterval(interval);
			}, transitionTimeout);
		});

		return this;
	};

})(jQuery);

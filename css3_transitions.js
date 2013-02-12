(function ($, undefined) {
	
	var supportsWebkitTransitionEnd = false;
	$(document).ready(function () {
		var div = $("<div>");

		div.transition({ width: 1 }, { duration: 1 });

		// Find out if the webkitTransitionEnd event works.
		div.on('webkitTransitionEnd', function () {
			supportsWebkitTransitionEnd = true;
		});

		// After plenty of time for the transition to occur, remove div.
		setTimeout(function () {
			div.remove();
		}, 5);
	});

	var _keys = Object.keys || function (o) {
		var keys = [];
		for (var p in o) {
			if (o.hasOwnProperty(p)) {
				keys.push(p);
			}
		}
		return keys;
	};

	var transition_prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];

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

	var transitionEndEvent = 'webkitTransitionEnd transitionEnd';
	var transitionTimeout = 1000;

	$.fn.transition = function (properties, options) {
		var el = this;
		var transition_data = el.data('transition');
		if (!transition_data) {
			transition_data = {};
			el.data('transition', transition_data);
		}

		options = $.extend({}, default_options, options);
		options.duration = get_time(options.duration);
		options.delay = get_time(options.delay);
		
		el.queue('transition', function (next) {
			transition_data.old_transition = transition_data.old_transition || el.css_transition();
			el.css_transition(null, 'all ' + options.duration + 'ms ' + options.easing + ' ' + options.delay + 'ms');

			var interval = setInterval(function () {
				var duration, delay;
				duration = get_time(el.css_transition('duration'));
				delay = get_time(el.css_transition('delay'));
				if (
					 duration === options.duration &&
					 delay === options.delay
				) {
					clearInterval(interval);
					clearTimeout(timeout);
					el.css(properties);

					if (options.complete) {
						el.one(transitionEndEvent, options.complete);
					}

					el.one(transitionEndEvent, function () {
						el.css_transition(null, transition_data.old_transition);
						delete transition_data.old_transition;
						if (!el.queue('transition').length) {
							transition_data.dequeued = false;
						}
						next();
					});

					if (!supportsWebkitTransitionEnd) {
						setTimeout(function () {
							el.trigger('transitionEnd');
						}, options.delay + options.duration);
					}
				}
			});

			var timeout = setTimeout(function () {
				clearInterval(interval);
			}, transitionTimeout);
		});

		if (!transition_data.dequeued) {
			el.dequeue('transition');
			transition_data.dequeued = true;
		}

		return this;
	};

})(jQuery);

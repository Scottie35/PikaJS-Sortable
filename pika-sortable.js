/** 
 *	@license PikaJS Sortable plugin 1.0
 *	© 2022 Scott Ogrin
 * 	MIT License
 */

(function($) {

  $.sortable = {
    Version: "1.0",
    defaults: {
    	direction: 'vertical',
    	on_dragstart: null,
			on_dragend: null,
			on_dragenter: null,
			on_dragover: null,
			on_dragleave: null,
			on_drop: null
    },
    active: {}
  }

  // Due to self-executing function, this is 'private':
  function drawTarget(mode, target, el) {
		var droptarget = '<div class="droptarget"></div>';
		var css = {
			width: $.sortable.active.width + 'px',
			height: $.sortable.active.height + 'px',
			margin: $.sortable.active.margin,
			display: $.sortable.active.display
		}
		if (css.display == 'inline-block') {
			css['vertical-align'] = 'bottom';
		}
		$.sortable.active.containers.each(function() {
			this.find('.droptarget').each(function() {
				this.remove();
			});
		});
		if (mode == 'before') {
			el.before(droptarget);
		} else if (mode == 'after') {
			el.after(droptarget);
		} else {
			// Last
			target.append(droptarget);
		}
		target.find('.droptarget').css(css);
	}

	$.extend($.fn, {

		sortable: function(dragexpr, opts) {
			var id = $.R(), cs = this, ds = this.find(dragexpr);
			opts = opts || {};
			opts.direction = opts.direction || $.sortable.defaults.direction;
    	opts.on_dragstart = opts.on_dragstart || $.sortable.defaults.on_dragstart;
			opts.on_dragend = opts.on_dragend || $.sortable.defaults.on_dragend;
			opts.on_dragenter = opts.on_dragenter || $.sortable.defaults.on_dragenter;
			opts.on_dragover = opts.on_dragover || $.sortable.defaults.on_dragover;
			opts.on_dragleave = opts.on_dragleave || $.sortable.defaults.on_dragleave;
			opts.on_drop = opts.on_drop || $.sortable.defaults.on_drop;
			if (cs.length == 0 || ds.length == 0) { return; }

			// Mark each of these containers with the same ID
			cs.each(function() {
				this.data('sortid', id);
			});

			ds.each(function() {
				this.attr('draggable', 'true');
			});

			ds.on('dragstart', function(evt) {
				$.sortable.active = {
					id: id,
					containers: cs,
					dragexpr: dragexpr,
					direction: opts.direction,
					timer: null,
					position: {
						x: 0,
						y: 0
					},
					target: $(evt.currentTarget),
					width: $(evt.currentTarget).width() - 6,
					height: $(evt.currentTarget).height() - 6,
					margin: $(evt.currentTarget).css('margin'),
					display: $(evt.currentTarget).css('display')
				};
				$(this).addClass('dragging');
				// Custom callback:
				if ($.t(opts.on_dragstart, 'f')) {
					opts.on_dragstart.call(this, evt);
				}
			});

			ds.on('dragend', function(evt) {
				$(this).removeClass('dragging');
				$('.droptarget').each(function() {
					this.remove();
				});
				// Custom callback:
				if ($.t(opts.on_dragend, 'f')) {
					opts.on_dragend.call(this, evt);
				}
			});

			cs.on('dragenter', function(evt) {
				// Custom callback:
				if ($.t(opts.on_dragenter, 'f')) {
					opts.on_dragenter.call(this, evt);
				}
			});

			cs.on('dragover', function(evt) {
				var c = $(this);
				// We must do preventDefault or this el is not droppable - unless we're over another inactive sortable area
				if (c.data('sortid') == id && id == $.sortable.active.id) {
					$.S(evt);
				} else {
					return true;
				}
				// Use throttling so we don't listen to EVERY dragover event fired
				if ($.sortable.active.timer == null) {
					// If timer is null, 10ms have elapsed after last droptarget draw
					// First, get x and y (relative to PAGE, not viewport) and current target container:
					var x = evt.pageX, y = evt.pageY, target = $(evt.target), motion = 'H';
					if (Math.abs(y - $.sortable.active.position.y) > Math.abs(x - $.sortable.active.position.x)) {
						motion = 'V';
					}
					$.sortable.active.position.x = x;
					$.sortable.active.position.y = y;
					if (target.length > 0) {
						// We're inside a valid drop container, so carry on
						// Do nothing if we're over the droptarget
						if (!target.hasClass('droptarget')) {
							// Cycle thru draggables inside cont and determine position for droptarget
							// based on if x,y position indicates we're over an actual draggable
							var found = false;
							c.find(dragexpr).each(function() {
								var dpos = this.position();
								var dwd = this.width();
								var dht = this.height();
								var next = this.next(dragexpr);
								if (opts.direction == 'vertical') {
									// Vertical items:
									if (y < dpos.top + dht/2) {
										// y is above top half of this el, place droptarget above this draggable
										drawTarget('before', c, this);
										found = true;
										return false;
									} else if (next.length > 0 && y > dpos.top + dht/2 && y < next.position().top + next.height()/2) {
										// We're between bottom half of this el, and top half of next el. Insert AFTER this el
										drawTarget('after', c, this);
										found = true;
										return false;
									}
								} else if (opts.direction == 'horizontal') {
									// Horizontal items:
									if (x < dpos.left + dwd/2) {
										// x is left of left half of this el, place droptarget BEFORE this draggable
										drawTarget('before', c, this);
										found = true;
										return false;
									} else if (next.length > 0 && x > dpos.left + dwd/2 && x < next.position().left + next.width()/2) {
										// We're between right half of this el, and left half of next el. Insert AFTER this el
										drawTarget('after', c, this);
										found = true;
										return false;
									}
								} else if (opts.direction == 'grid') {
									// Grid of items:
									// We draw droptarget ANYWHERE when x/y is over an existing card (BEFORE),
									// or when over left/top half of first (BEFORE) or right/bottom half of last (AFTER)
									if (x > dpos.left && x < dpos.left + dwd && y > dpos.top && y < dpos.top + dht) {
										if ((motion == 'H' && x < dpos.left + dwd/2) || (motion == 'V' && y < dpos.top + dht/2)) {
											// We switch BEFORE/AFTER based on mouse movement AND which half of draggable we're in
											drawTarget('after', c, this);
										} else {
											drawTarget('before', c, this);
										}
										found = true;
										return false;
									}
								}
							});
							if (!found && opts.direction != 'grid') {
								// Place droptarget after last draggable (default)
								drawTarget('last', c);									
								return false;
							}
						}
					}
					// Custom callback:
					if ($.t(opts.on_dragover, 'f')) {
						opts.on_dragover.call(this, evt);
					}
					// Start the 10ms throttle timer:
					$.sortable.active.timer = setTimeout(function(){
						$.sortable.active.timer = null;
					}, 10);
				}
				return false;
			});

			cs.on('dragleave', function(evt) {
				// Custom callback:
				if ($.t(opts.on_dragleave, 'f')) {
					opts.on_dragleave.call(this, evt);
				}
			});

			cs.on('drop', function(evt) {
		    $.S(evt);
				// For a grid, we want to insert droptarget AFTER the place we're hovering over
				// For the rest, we do a direct replace
		    if ($.sortable.active.direction == 'grid' && $('.droptarget').next($.sortable.active.dragexpr).length > 0) {
		    	// Special case: place element AFTER location of droptarget:
		    	$('.droptarget').next($.sortable.active.dragexpr).before($.sortable.active.target);
		    	$('.droptarget').remove();
		    } else {
			    // Move to dropped location, replacing droptarget:
			    $('.droptarget').replace($.sortable.active.target);
		    }
				// Custom callback:
				if ($.t(opts.on_drop, 'f')) {
					opts.on_drop.call(this, evt);
				}
			});
		},

		removeSortable: function(dragexpr) {
			var cs = this, ds = $(dragexpr);
			if (cs.length == 0 || ds.length == 0) { return; }			

			ds.each(function() {
				this.removeAttr('draggable');
			});

			cs.each(function() {
				this.removeData('sortid');
			});

			ds.off('dragstart');
			ds.off('dragend');
			cs.off('dragenter');
			cs.off('dragover');
			cs.off('dragleave');
			cs.off('drop');
		}
	});

})(Pika);

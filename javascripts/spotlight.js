(function($) {

	$.fn.spotlight = function(options) {

		var settings = $.extend({
			title_html: "Test Title",
			title_max_width: "60vw",
			title_left: "",
			title_top: "100px",
			close_html: "<i class='fa fa-times'></i>",
			allow_close: false,
			onclose: function() {}
		}, options);

		//Collect data about selected element
		width = this.width() + 10;
		height = this.height();
		top_offset = this.offset().top;
		left_offset = this.offset().left - 5;

		//Vertically center spotlight on element
		real_top_offset = top_offset - (width - height)/2;

		//Details about the spotlight's position
		circle_center_x = left_offset + (width/2);
		circle_center_y = real_top_offset + (width/2);
		circle_radius = width/2;

		//Prevent user from scrolling while spotlight is open
		$("body").css("overflow", "hidden");

		//Inject spotlight divs into body
		$("body").append("<div class='spotlight_overlay'><div class='spotlight_title'>" + settings.title_html + "</div><div class='spotlight_close'>" + settings.close_html +"</div></div>");

		//Setting the css options for the title
		$(".spotlight_overlay .spotlight_title").css("max-width", settings.title_max_width);
		if (settings.title_left) {
			$(".spotlight_overlay .spotlight_title").css("left", settings.title_left);
		}
		if (settings.title_top) {
			$(".spotlight_overlay .spotlight_title").css("top", settings.title_top);
		}

		//We can't target pseudoelements with jQuery as they aren't technically in the DOM :(
		//So we add a new rule to the first stylesheet in order to position the spotlight
		document.styleSheets[0].addRule(".spotlight_overlay:before", "width: " + width + "px; height: " + width + "px; top: " + real_top_offset + "px; left:" + left_offset + "px" );

		//User closes, we cleanup!
		if(settings.allow_close) {
			$(".spotlight_close").css("display", "block");
			$(".spotlight_close").click(function(e){
				$(".spotlight_overlay").unbind("click");
				$(".spotlight_overlay").remove();
				$("body").css("overflow", "auto");
				settings.onclose.call(this);
				e.stopImmediatePropagation();
				e.preventDefault();
				return false;
			});
		}

		//Bit of javascript and CSS trickery to allow the user to click through the spotlight.
		//First we check to see if the mouse is in the spotlight with good old Pythagoras.
		//If it is so, we disable pointer-events on the spotlight overlay so the user can click through.
		//We then find the element that the user is hovering over and we trigger a click on the element.
		//Unfortunately jQuery can't trigger clicks on links (why?!) so we have to split into 3 cases:
		//	1. User is hovering directly over a link so we use Javascript to trigger the navigation.
		//	2. Rare case where user might be hovering over element that contains link(s) but not actually
		//		over the link. Here we click the first link that jQuery finds as a child. Hopefully this never gets
		//		executed!
		//	3. Regular old jQuery click trigger incase the element the user is hovering over has been binded
		//to click. Here it's best if we close the overlay because the user isn't navigating away.
		//We also have some error catching just in case we trigger a click on something that doesn't have an event
		//binded to it.
		$(".spotlight_overlay").click(function(e){
			e.stopImmediatePropagation();
			dx = e.pageX - circle_center_x;
			dy = e.pageY - circle_center_y;
			if(dx*dx + dy*dy < circle_radius*circle_radius) {
				$(".spotlight_overlay").css("pointer-events","none");
				element = $(document.elementFromPoint(e.pageX,e.pageY));
				try {
					if( element.is("a") ) {
						element[0].click();
					} else if ( element.has("a") ) {
						element.find("a").first()[0].click();
					} else {
						element.click();
						$("body").css("overflow", "auto");
						if (settings.allow_close) $(".spotlight_close").click();
					}
					$(".spotlight_overlay").css("pointer-events","auto");
				}
				catch (err) {
					$(".spotlight_overlay").css("pointer-events","auto");
				}
			}
		});

	}
}(jQuery));
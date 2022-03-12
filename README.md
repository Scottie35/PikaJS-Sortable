# PikaJS-Sortable

Sortable (drag-n-drop) plugin for PikaJS that is **3.8KB** minified. Yup, that's tiny.

## What is PikaJS?

[PikaJS](https://github.com/Scottie35/PikaJS) is a client-side scripting library like jQuery, but 7 times smaller, faster, and more efficient.

**You must include PikaJS before adding PikaJS Sortable to your page!**

## What does it do?

The Pika Sortable plugin lets you turn any series of elements inside a container into a box with sortable elements - as in, drag-n-drop!

It uses the HTML Drag and Drop API. As such, it may not work so well (yet) with mobile devices which rely on touchstart, touchend, and other touchy events (um, literally and figuratively).

The idea is you call `.sortable` on a container and some or all of its children (the kids are the sortable elements), and voila: You can re-arrange to your heart's content.

Sortable supports horizontal drag-n-drop, vertical drag-n-drop, and grid layout drag-n-drop.

When you're done, simply save the new position of the re-arranged elements however you wish using your own code, and then call `.removeSortable` to remove the sortability.

For a demo, download the whole shebang and load `pika-sortable.html` in your browser. And don't forget to also grab [pika-min.js](https://github.com/Scottie35/PikaJS)!!

### .sortable

Once you have a container with several sub-elements that you'd like to make Sortable, just do this:

		$('.column').sortable('.column .card');

You can pass options as a 2nd object argument to `.sortable` if you want. Any options you pass will override the `defaults`, which are:

		$.sortable.defaults = {
			direction: 'vertical',
			on_dragstart: null,
			on_dragend: null,
			on_dragenter: null,
			on_dragover: null,
			on_dragleave: null,
			on_drop: null
		}

So you can do:

		$('.row').sortable('.row .card', {
			direction: 'horizontal'
		});

Or:

		$('.grid').sortable('.grid .card', {
			direction: 'grid',
			on_drop: function(evt) {
				// this = the object for which the drop event was triggered
				// evt = the event with all its glorious details (optional)
			}
		});

Option details:

- `direction` - 'vertical', 'horizontal', or 'grid' (default = 'vertical')
- `on_dragstart` - callback function to run at end of dragstart event
- `on_dragend` - callback function to run at end of dragend event
- `on_dragenter` - callback function to run on dragenter event
- `on_dragover` - callback function to run at end of dragover event
- `on_dragleave` - callback function to run on dragleave event
- `on_drop` - callback function to run at end of drop event

For all these callback functions, *this* will be the DOM element for which the event was triggered. The first callback function argument (if present) will be the actual `event` so you can do whatever you want with it.

Note that in the example `pika-sortable.html`, you can drag-n-drop boxes *between* the top 3 columns, but you **cannot** drag-n-drop between the top 3 columns and either the horizontal row of *Things* or the grid of *Stuff* boxes.

Every time you call `.sortable`, it automagically groups *all* selected draggable elements in *all* matching container names together as 1 group.

If you wanted to have 3 independent columns, you'd give either the containers or the draggable elements different class names, and then call `.sortable` on each column.

Also, note that the `dragover` event is throttled by Sortable so it never runs more than once every 10ms. That means your `on_dragover` callback will *also* be throttled so it only runs when `dragover` is executed.

### .removeSortable

After the user re-arranges everything, you would obviously do whatever you want: record the new order of dragged elements, save it to your database, or whatever... Then, to remove the Sortable functionality, just call:

		$('.column').removeSortable('.column .card');

You should use the same selectors as when you called `.sortable`. There is no 2nd argument, and you do NOT need to pass in any options as with `.sortable`. Ta-DA! No more Sortability - carry on.
 
### Notes on HTML + CSS

You can call `.sortable` on whatever HTML elements you want. Just keep in mind that it's best to use draggable elements with: `display: flex;`

Whatever you do, avoid using CSS `float`. That makes things pretty wonky, and you shouldn't need/want to use it anymore, anyway.

For other tips on how to do your HTML and CSS, see the files:

- `pika-sortable.html`
- `pika-sortable.css`

### What about mobile?

Touch devices rely on touch events, which unfortunately have not been made 'convertible' by browsers into mouse events. IOW, the Drag and Drop API doesn't yet compensate for touch. This is actually quite ridiculous, but there you have it. I'm planning on adding touch support in the near future - Good Lord willing and the creek don't rise!

**That's all, folks!**

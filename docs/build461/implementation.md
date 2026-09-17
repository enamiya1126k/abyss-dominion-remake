# Build461: replace portrait separation with a shared world camera

Build460's collision avoidance was the wrong interpretation of the requested experience. The live renderer no longer calls `placeCourseRunners460` or `separateRunners460`. Those historical files remain in the cumulative archive, but the active Build459 entry points now delegate to `RaceWorld461`.

`worldPoint461` maps existing progress and the same Build459 centreline/corner geometry into world units. Each entrant keeps a constant lane offset perpendicular to that centreline. Straight courses share the same renderer. A runner's feet are placed at its world position; the generated surface, fixed rails, finish line and all runners live inside the same transformed DOM plane. There is no separate portrait position, tether, collision solver or ranking-dependent display adjustment.

`followCamera461` fits the union of all eight sprite bounds, including number labels. It eases the centre and scale toward that union. A final camera clamp guarantees containment after abrupt state updates or viewport changes. It does not clamp individual sprites. The default is follow; overview is opt-in. The camera state's key includes room ID, viewport dimensions and mode. Gameplay state is never mutated by the camera.

The camera uses the established interpolated live frame and the established photo-finish history for replays. Betting, RNG, simulation, wallet receipts, training, fatigue, course rules and server modules are unchanged from Build460. The package verifies their byte identity.

The three generated images are PNG originals created with the built-in image generator, with browser copies converted to WebP. Prompts and consuming paths are in `asset-prompts.json`. SVG supplies exact route geometry and fences over those painted materials; image content does not determine movement or race results.

Pure tests cover 4 distances × 5 viewport dimensions × 4 pack spreads × 301 frames = 24,080 frames and 192,640 runner containment checks, as well as centreline fidelity and camera easing. Browser checks assert all eight rendered feet equal the projection of the recorded world coordinates through the course plane's actual DOM matrix, allowing only subpixel rounding. Viewport borders are accounted for in that measurement. Screenshots and a short race recording are used for visual review; native iPhone Safari is not available.

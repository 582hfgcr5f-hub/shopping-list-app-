# Clean & modern interface — preview only

Requested by Sam after approval of the blue-and-white Home/calendar visual. Build on the approved reliability preview, not on an older production snapshot. Do not replace production until this interface is reviewed.

## Preserved
- The original index, all product catalogues, the separate-store module, Costco product-photo mappings, and stable recipe/calendar runtime remain byte-identical.
- No new items, migrated storage, reset quantities, new recipe ingredients, Favorites, or Start Shopping.
- Four bottom destinations: Home, Items, Shopping, Suppers. Calendar remains on Home.
- Adding products remains in Items; the Home list panel only opens an existing store list.

## New presentation
- Blue/white responsive styling, consistent outlined navigation icons, supermarket storefront, genuine Costco wordmark image with a readable network-failure fallback.
- Home store cards read actual unpurchased line-item counts (not quantities or fake demo numbers).
- Weekly day cards all fit, with English dates. Quick meal shortcuts open three existing recipes. Thumbnail images are illustrative crops from Sam's approved AI-generated visual, not claims of product identity or recipe accuracy.
- On Your Lists reads the current carts and retains store identity. No unsupported claim of chronological recency.
- Calendar keeps existing holiday calculation and date actions; compact whole-word labels, today highlight, and derived upcoming date shortcuts.
- New DOM layer observes narrow rendering points; it never writes data or replaces rendering functions.

## Assets
Costco Wholesale wordmark source: https://commons.wikimedia.org/wiki/File:Costco_Wholesale_logo_2010-10-26.svg (Costco Wholesale; wordmark used only as a store identifier, no affiliation claimed). The external image has a text fallback. Existing product photos remain unchanged and external.

## Verification
Original 13 regression checks retained unchanged. Seven additional UI checks cover live counts, shortcuts, existing recipes, responsive bounds, calendar actions, read-only data behavior, logo failure, and recipe artwork. Screenshots are captured from the actual running app in disposable browsers; they are not design renderings.

# PBI-banner
A 1 or 2 line banner visual for PowerBI that scales the font to fill the visual height. This was born from the desire to be able to display data at text sizes larger than 40 points.

## Usage
The Values field takes two values (even if you only need a one line banner). The top value becomes the top line of the banner, and the bottom becomes the bottom line. Each item must reduce to a single value (either be a measure or apply a data reduction option such as SUM,  AVERAGE, or FIRST). On the Format pane, the Settings section has four options - the color for the text of each line (top and bottom), the Top Text %, and the Max Height %. The text color options are self explanatory, so let's dive into the others.

### Top Text %
This sets the percentage of the height of the banner that the top row text will consume. The bottom row of text will take up the remainder, so as the top text gets larger, the bottom text gets smaller and vice versa. If you set the top text above 90%, the bottom text is no longer displayed, making the banner consist of only one line. Allowed values are from 10-100.

### Max Height %
This allows additional control over the scaling of the text by artifically restricting the amount of the vertical height of the visual that the text will consume. Allowed values are from 50-100.

## Bugs and Planned Improvement
* The Format pane does not reflect the current values. I'm not sure why this is occuring.
* PBI Desktop occasionally pops up errors when changing the Formatting, which is probably related to the first issue. It seems safe to ignore for now.
* I'd like to add a toggle that forces the text to not grow beyond the width of the banner. Currently, it is quite easy to have the displayed text get clipped by the visual's width.
* Change the Fields pane to have two seperate value fields, one for each text line, with the second one being optional. I don't yet understand the way that the different mapping types (categorical, single, table, etc) work well enough to do this (I started trying to do this using categorical originally, but the values didn't work right).

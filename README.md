# Minecraft to Minetest Skin Converter

This converter supports creating Minetest skins. If you believe that using the upper half of the Minecraft skin is suffient this converter is likely not for you.

The cape, the right or left arm or leg Minecraft body parts may be copied individually.
Also the jacket, right or left sleeves and trousers may be copied with alpha transparency to the Minetest skin.

It renders the skin as an animated 3d character.

It supports standard and HD skins.

Usage
-------

The converters runs in the browser, after download no internet connection is requierd.
First upload a square Minecraft skin from your local drive.
If you have a standard skin you may want to zoom in to see some details, otherwise ignore the zoom buttons.
Play with the "Update ..." buttons to get a first impression of the skin. You need to update again after copying data. There is no live update for the 3d character.
Choose the background color you like or adjust it later.
Start copying body and cloth parts. Left to some buttons is a "0.5" field. This is the alpha/transparency used while copying.
To copy the jacket, the left sleeve or trouser set the alpha/transparency to 1.
There is no "Undo" button, you have to copy another body part to 'undo' things.

Use the "Update ..." buttons again to verify the result.
Right-click on the new skin (upper left image) and select "Save Image As ...".

The screenshot shows a modified vonDoomCraft HD skin.
![N|Solid](https://github.com/godly/minetest-skin-converter/screenshot.png)

Typical skin locations
-------

%AppData%\.minecraft\resourcepacks\entity\steve.png
%ProgramFiles%\minetest\games\minetest_game\mods\default\models\character.png

Supported Browsers
-------

Firefox, Chrome, Edge

Known issues
-------

Edge blurs the images while zooming in.
Internet Explorer (4-11) does not work.

License
-------

GPLv3

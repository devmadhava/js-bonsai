JsBonsai Usage Guide
====================

## Credits

This script is inspired by and based on the original work of: **John Allbritten** [cbonsai on GitLab](https://gitlab.com/jallbrit/cbonsai). Thank you for the amazing script!

## License

JsBonsai is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).

Original concept and logic based on [cbonsai](https://gitlab.com/jallbrit/cbonsai) by John Allbritten.

## Note

This JS Bonsai is not perfect and is work in progress, it would be made more natural looking and streamlied just like the original cbonsai.


1\. Add Canvas Element
----------------------

Add a `<canvas>` element with the `data-bonsai` attributed included to signal automatic detection.. Then either use CSS properties or attributes to define its size with width and height.

Example:

```html
<canvas
  data-bonsai
  data-base-type="2"
  data-repeat="true"
  data-loop="true"
  data-align="center center"
  data-pot-color="brown"
  data-leaves-color="#4caf50"
  data-branch-color="#3e2723"
  width="1000px"
  height="1000px"
></canvas>
```

2\. Canvas Options Reference
----------------------------
| Attribute              | Type                           | Description                                              | Default       | Example  |
|------------------------|--------------------------------|----------------------------------------------------------|---------------|----------|
| data-base-type         | Number (1 or 2)                | Selects tree base style                                  | 1             | 2        |
| data-repeat            | Boolean (true or false)        | Whether to draw multiple trees tiled                     | false         | true     |
| data-loop              | Boolean (true or false)        | Continuously animate trees in a loop                     | false         | true     |
| data-align             | String (vertical + horizontal) | Tree grid alignment inside canvas (e.g. "center center") | center center | top left |
| data-pot-color         | CSS color string               | Color of the tree pot                                    | grey          | brown    |
| data-leaves-color      | CSS color string               | Color of the leaves                                      | #5cbd9b       | #4caf50  |
| data-dead-leaves-color | CSS color string               | Color of dead leaves                                     | #e26554       | #a0522d  |
| data-branch-color      | CSS color string               | Color of branches                                        | #7c5c5c       | #3e2723  |
| data-life              | Number                         | Initial life length of the tree branches                 | 24            | 30       |
| data-size        | Number                         | Control size of bracnh and determines Tree Canvas size                    | 8             | 12        |


3\. Include the Bonsai Script
-----------------------------

Download the bonsai.js [here](https://raw.githubusercontent.com/devmadhava/jsbonsai/main/bonsai.js) here or from github repo and include the bundled `bonsai.js` script in your HTML after the canvas element.

```html
<script src="./bonsai.js"></script>
```

4\. Initialize Bonsai Automatically
-----------------------------------

The script will automatically find all elements with the class `js-bonsai`, create a `JsBonsai` instance for each, and start the animation based on the data attributes.

No extra manual JavaScript initialization is required.

5\. Example Full HTML
---------------------
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JsBonsai Example</title>
  <style>
    canvas.js-bonsai {
      width: 1000px;
      height: 1000px;
      border: 1px solid #ccc;
      background: #111;
      display: block;
      margin: auto;
    }
  </style>
</head>
<body>

  <canvas
    class="js-bonsai"
    data-bonsai
    data-base-type="2"
    data-size="12"
    data-repeat="true"
    data-loop="true"
    data-align="center center"
    data-pot-color="brown"
    data-leaves-color="#4caf50"
    data-branch-color="#3e2723"
  ></canvas>

  <script src="./bonsai.js"></script>

</body>
</html>
```
    

6\. Notes
---------

*   The canvas size will be automatically determined by CSS width/height styles.
*   The script uses `data-` attributes to customize tree appearance and behavior.
*   You can have multiple `<canvas>` elements with class `js-bonsai` on the page to show multiple bonsai trees.
*   Make sure `bonsai.js` is loaded correctly and available in your page folder.
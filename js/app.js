var crosshairs, overlay, tooltip;

var TOOLTIP_MARGIN = +window.getComputedStyle(document.querySelector('.tooltip')).margin.split('px')[0];

var screenshot = new Vue({
    el: '#screenshot',

    data: {
        mouseIsDown: false,
        isDragging: false,
        tookScreenShot: false, // After the mouse is released

        // Used to calculate where to start showing the dragging area
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,

        borderWidth: '',

        // Handling the positioning of the crosshairs
        crossHairsLeft: 0,
        crossHairsTop: 0,

        // The box that contains the border and all required numbers.
        boxTop: 0,
        boxLeft: 0,
        boxEndWidth: 0,
        boxEndHeight: 0,

        // The tooltip's required positioning numbers.
        toolTipLeft: 0,
        toolTipTop: 0,
        toolTipWidth: 0,
        toolTipHeight: 0,

        windowHeight: 0,
        windowWidth: 0,

        croppedImageWidth: '800',
        croppedImageHeight: '600',
        imageUrl: ''
    },

    methods: {
        move(e) {
            this.crossHairsTop = e.clientY;
            this.crossHairsLeft = e.clientX;

            var tooltipBoundingRect = tooltip.getBoundingClientRect();

            this.toolTipWidth = tooltipBoundingRect.width;
            this.toolTipHeight = tooltipBoundingRect.height;

            /*
             * Change how the borderWidth is being calculated based on the x and y values.
             * Calculate the box with the 1px border's positioning and width
             * Calculate the positioning of the tooltip */
            if (this.mouseIsDown) {
                var endY = (this.endY = e.clientY),
                    endX = (this.endX = e.clientX),
                    startX = this.startX,
                    startY = this.startY,
                    windowWidth = this.windowWidth,
                    windowHeight = this.windowHeight;

                // Calculating the values differently depending on how the user start's dragging.
                if (endX >= startX && endY >= startY) {
                    this.isDragging = true;

                    this.borderWidth =
                        startY + 'px ' + (windowWidth - endX) + 'px ' + (windowHeight - endY) + 'px ' + startX + 'px';

                    this.boxTop = startY;
                    this.boxLeft = startX;
                    this.boxEndWidth = endX - startX;
                    this.boxEndHeight = endY - startY;

                    this.toolTipLeft = endX;
                    this.toolTipTop = endY;

                    if (endX + this.toolTipWidth >= windowWidth) {
                        this.toolTipLeft = windowWidth - this.toolTipWidth - TOOLTIP_MARGIN * 2;
                    }

                    if (endY + this.toolTipHeight + TOOLTIP_MARGIN * 2 >= windowHeight) {
                        this.toolTipTop = windowHeight - this.toolTipHeight - TOOLTIP_MARGIN * 2;
                    }
                } else if (endX <= startX && endY >= startY) {
                    this.isDragging = true;

                    this.borderWidth =
                        startY + 'px ' + (windowWidth - startX) + 'px ' + (windowHeight - endY) + 'px ' + endX + 'px';

                    this.boxLeft = endX;
                    this.boxTop = startY;
                    this.boxEndWidth = startX - endX;
                    this.boxEndHeight = endY - startY;

                    this.toolTipLeft = endX - this.toolTipWidth;
                    this.toolTipTop = endY;

                    if (endX - this.toolTipWidth <= 0) {
                        this.toolTipLeft = TOOLTIP_MARGIN;
                    }

                    if (endY + this.toolTipHeight + TOOLTIP_MARGIN * 2 >= windowHeight) {
                        this.toolTipTop = windowHeight - this.toolTipHeight - TOOLTIP_MARGIN * 2;
                    }
                } else if (endX >= startX && endY <= startY) {
                    this.isDragging = true;

                    this.boxLeft = startX;
                    this.boxTop = endY;
                    this.boxEndWidth = endX - startX;
                    this.boxEndHeight = startY - endY;

                    this.toolTipLeft = endX;
                    this.toolTipTop = endY - this.toolTipHeight;

                    this.borderWidth =
                        endY + 'px ' + (windowWidth - endX) + 'px ' + (windowHeight - startY) + 'px ' + startX + 'px';

                    if (endX + this.toolTipWidth >= windowWidth) {
                        this.toolTipLeft = windowWidth - this.toolTipWidth - TOOLTIP_MARGIN * 2;
                    }

                    if (endY - this.toolTipHeight <= 0) {
                        this.toolTipTop = TOOLTIP_MARGIN;
                    }
                } else if (endX <= startX && endY <= startY) {
                    this.isDragging = true;

                    this.boxLeft = endX;
                    this.boxTop = endY;
                    this.boxEndWidth = startX - endX;
                    this.boxEndHeight = startY - endY;

                    this.borderWidth =
                        endY + 'px ' + (windowWidth - startX) + 'px ' + (windowHeight - startY) + 'px ' + endX + 'px';

                    this.toolTipLeft = endX - this.toolTipWidth;
                    this.toolTipTop = endY - this.toolTipHeight;

                    if (endX - this.toolTipWidth <= 0) {
                        this.toolTipLeft = TOOLTIP_MARGIN;
                    }

                    if (endY - this.toolTipHeight <= 0) {
                        this.toolTipTop = TOOLTIP_MARGIN;
                    }
                } else {
                    this.isDragging = false;
                }
            }
        },

        mouseDown(e) {
            this.borderWidth = this.windowWidth + 'px ' + this.windowHeight + 'px';

            this.startX = e.clientX;
            this.startY = e.clientY;

            this.toolTipWidth = tooltip.getBoundingClientRect().width;

            this.mouseIsDown = true;
            this.tookScreenShot = false;
        },

        mouseUp(e) {
            this.borderWidth = 0;

            if (this.isDragging) {
                // Don't take the screenshot unless the mouse moved somehow.
                this.tookScreenShot = true;
            }

            this.isDragging = false;
            this.mouseIsDown = false;

            this.takeScreenshot();
        },

        takeScreenshot() {
            html2canvas(document.querySelector('body')).then((canvas) => {
                // console.log(canvas);

                let croppedCanvas = document.createElement('canvas'),
                    croppedCanvasContext = croppedCanvas.getContext('2d');

                croppedCanvas.width = this.endX - this.startX;
                croppedCanvas.height = this.endY - this.startY;

                croppedCanvasContext.drawImage(canvas, this.startX, this.startY, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height)

                document.body.appendChild(croppedCanvas);

                this.imageUrl = croppedCanvas.toDataURL();

                console.log(this.imageUrl);
            });
        },

        download(url) {
            var a = $("<a style='display:none' id='js-downloder'>")
                .attr('href', url)
                .attr('download', 'test.png')
                .appendTo('body');

            a[0].click();

            a.remove();
        },

        saveCapture(element) {
            html2canvas(element).then((canvas) => {
                this.download(canvas.toDataURL('image/png'));
            });
        }
    },

    mounted() {
        // this.takeScreenshot();
        // this.saveCapture(document.querySelector("#screenshot"))

        crosshairs = document.querySelector('.crosshairs');
        overlay = document.querySelector('.overlay');
        tooltip = document.querySelector('.tooltip');

        var self = this;

        this.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        this.toolTipWidth = tooltip.getBoundingClientRect().width;

        // To recalculate the width and height if the screen size changes.
        window.onresize = function () {
            self.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            self.windowHeight =
                window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        };
    }
});

import { select } from 'd3-selection';

export class Textmark {
    constructor (container, options) {
        this.parent = select(container || document.body).node();

        this.options = Object.assign({
            text: [],
            fontSize: 16,
            fontWeight: 'normal',
            lineHeight: 1.25,
            bias: -30,
            spacingX: 100,
            spacingY: 25,
            opacity: 0.25,
            color: '#000000'
        }, options);

        let canvas = document.createElement('canvas');
        this.ctx = canvas.getContext('2d');

        this.generate();
    }

    generate () {
        if (!this.mark) {
            this.mark = select(document.createElement('div'))
                .classed('textmark', true)
                .style('position', 'absolute')
                .style('top', '0')
                .style('bottom', '0')
                .style('left', '0')
                .style('right', '0')
                .style('pointer-events', 'none')
                .style('z-index', '9999')
                .style('background-color', 'transparent')
                .style('background-repeat', 'repeat');

            this.parent.appendChild(this.mark.node());
        }

        this._generateMark();

        return this;
    }

    _generateMark (options = this.options) {
        if (!this.mark) return;
        let width, height;
        let text = options.text;
        let ctx = this.ctx;
        let bias = Math.PI / 180 * Number(options.bias);
        let font = `${options.fontWeight} ${options.fontSize}px arial`;

        if (!Array.isArray(text)) {
            text = [text];
        }

        ctx.font = font;
        width = text.reduce((a, b) => {
            return Math.max(a, ctx.measureText(b).width);
        }, 0);

        height = Math.abs(Math.sin(bias) * width) + text.length * options.fontSize;
        width = Math.abs(Math.cos(bias)) * width + Math.abs(Math.sin(bias)) * height;

        height += Number(options.spacingY);
        width += Number(options.spacingX);

        ctx.canvas.width = width;
        ctx.canvas.height = height;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.font = font;
        ctx.globalAlpha = Number(options.opacity);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = options.color;
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.rotate(bias);
        text.forEach((item, i) => {
            ctx.fillText(item, 0, (-(text.length - 1) / 2 + i) * options.fontSize * options.lineHeight);
        });
        ctx.restore();

        this.markImage = ctx.canvas.toDataURL('image/png');
        this.mark
            .style('background-image', `url(${this.markImage})`)
            .style('background-position', `-${options.spacingX}px -${options.spacingY}px`);
    }

    container (container) {
        this.parent = select(container || document.body).node();
        this.parent.appendChild(this.mark.node());

        return this;
    }

    setOptions (options) {
        this.options = Object.assign(this.options, options);
        this._generateMark();

        return this;
    }

    remove () {
        this.mark.remove();
        this.mark = null;

        return this;
    }
}

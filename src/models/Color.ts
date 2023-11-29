import { ConvertOptions } from '../@types/main';
import { Solver } from './Solver';

export class Color {
  private _r = 0;
  private _g = 0;
  private _b = 0;

  get r() {
    return this._r;
  }

  set r(value) {
    this._r = this.clamp(value);
  }

  get g() {
    return this._g;
  }

  set g(value) {
    this._g = this.clamp(value);
  }

  get b() {
    return this._b;
  }

  set b(value) {
    this._b = this.clamp(value);
  }

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toString() {
    return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
  }

  set(r: number, g: number, b: number) {
    this.r = this.clamp(r);
    this.g = this.clamp(g);
    this.b = this.clamp(b);
    return this;
  }

  hueRotate(angle = 0) {
    angle = (angle / 180) * Math.PI;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    this.multiply([
      0.213 + cos * 0.787 - sin * 0.213,
      0.715 - cos * 0.715 - sin * 0.715,
      0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143,
      0.715 + cos * 0.285 + sin * 0.14,
      0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787,
      0.715 - cos * 0.715 + sin * 0.715,
      0.072 + cos * 0.928 + sin * 0.072,
    ]);
  }

  grayscale(value = 1) {
    this.multiply([
      0.2126 + 0.7874 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 + 0.2848 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 + 0.9278 * (1 - value),
    ]);
  }

  sepia(value = 1) {
    this.multiply([
      0.393 + 0.607 * (1 - value),
      0.769 - 0.769 * (1 - value),
      0.189 - 0.189 * (1 - value),
      0.349 - 0.349 * (1 - value),
      0.686 + 0.314 * (1 - value),
      0.168 - 0.168 * (1 - value),
      0.272 - 0.272 * (1 - value),
      0.534 - 0.534 * (1 - value),
      0.131 + 0.869 * (1 - value),
    ]);
  }

  saturate(value = 1) {
    this.multiply([
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value,
    ]);
  }

  multiply(matrix: number[]) {
    const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
    const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
    const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
    this.r = newR;
    this.g = newG;
    this.b = newB;
  }

  brightness(value = 1) {
    this.linear(value);
  }
  contrast(value = 1) {
    this.linear(value, -(0.5 * value) + 0.5);
  }

  linear(slope = 1, intercept = 0) {
    this.r = this.clamp(this.r * slope + intercept * 255);
    this.g = this.clamp(this.g * slope + intercept * 255);
    this.b = this.clamp(this.b * slope + intercept * 255);
  }

  invert(value = 1) {
    this.r = this.clamp((value + (this.r / 255) * (1 - 2 * value)) * 255);
    this.g = this.clamp((value + (this.g / 255) * (1 - 2 * value)) * 255);
    this.b = this.clamp((value + (this.b / 255) * (1 - 2 * value)) * 255);
  }

  hsl() {
    // Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;

        case g:
          h = (b - r) / d + 2;
          break;

        case b:
          h = (r - g) / d + 4;
          break;
      }
      (h as number) /= 6;
    }

    return {
      h: (h as number) * 100,
      s: s * 100,
      l: l * 100,
    };
  }

  clamp(value: number) {
    if (value > 255) {
      value = 255;
    } else if (value < 0) {
      value = 0;
    }
    return value;
  }
  public static hexToRgb(hex: string) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
  }

  public static convert(colorArgument: string, { precision, iterations }: ConvertOptions) {
    const rgb = Color.hexToRgb(colorArgument);

    if (!rgb) throw new Error('Invalid color');
    if (rgb.length !== 3) {
      throw new Error('Invalid color');
    }
    const color = new Color(rgb[0], rgb[1], rgb[2]);
    const solver = new Solver(color);
    let result = solver.solve();

    if (precision && result.loss > +precision) {
      let bestResult = result;

      for (let i = 0; i < +iterations; i++) {
        if (i !== 0 && i % 50 === 0) console.info(`Trying to find a better result... (attempt ${i})`);

        result = solver.solve();
        result.loss = +result.loss.toFixed(1);

        if (i + 1 === +iterations) {
          console.info('The iteration limit has been reached. Returning the best result found.');
          result = bestResult;
        }

        if (result.loss === +precision) {
          console.info(`\x1b[32mFound an exact match in ${i + 1} iterations.\x1b[0m`);

          break;
        }

        if (result.loss < bestResult.loss) {
          bestResult = result;
        }

        if (result.loss <= +precision) break;
      }
    }

    let lossMsg;
    let msgColor;

    if (result.loss < 1) {
      lossMsg = 'This is a perfect result.';
      msgColor = '\x1b[32m';
    } else if (result.loss < 5) {
      lossMsg = 'The color is close enough.';
      msgColor = '\x1b[32m';
    } else if (result.loss < 15) {
      lossMsg = 'The color is somewhat off. Consider running it again.';
      msgColor = '\x1b[33m';
    } else {
      lossMsg = 'The color is extremely off. Run it again!';
      msgColor = '\x1b[31m';
    }

    // console.clear();

    console.info(`${msgColor}Loss: ${result.loss.toFixed(1)}. ${lossMsg} \x1b[0m`);
    console.info('\n');
    console.info(result.filter);
    console.info('\n');
  }
}

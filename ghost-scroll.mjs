/* eslint-disable import/prefer-default-export */

import { Bezier } from 'bezier-js';

const randomInteger = async (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const humanScroll = async (page) => {
  const PIXELPERWHEEL = 100;
  let direction = 1;

  const scroller = async (pixel) => {
    // eslint-disable-next-line no-shadow
    await page.evaluate((pixel, direction) => {
      window.scrollBy(0, direction * pixel);
    }, pixel, direction);
  };

  const decideScrollLength = (wheelCount) => {
    const minLength = 3 * wheelCount + 7;

    const scrollLength = randomInteger(minLength, minLength + 2); // 3n+7
    return scrollLength;
  };

  const fixFirstThreeScrolls = (lut) => {
    const coords = lut;

    const firstThreeScrolls = [1, 5, 7];

    const middleOfArray = Math.floor(lut.length / 2);

    coords[middleOfArray - 2].x -= firstThreeScrolls[0];
    coords[middleOfArray].x -= firstThreeScrolls[1];
    coords[middleOfArray + 2].x -= firstThreeScrolls[2];

    coords.forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.x = Math.floor(element.x);
    });

    // eslint-disable-next-line prefer-destructuring
    coords[1].x = firstThreeScrolls[0];
    // eslint-disable-next-line prefer-destructuring
    coords[2].x = firstThreeScrolls[1];
    // eslint-disable-next-line prefer-destructuring
    coords[3].x = firstThreeScrolls[2];

    return coords;
  };

  let counter = 2;
  let total = 0;
  let scrollPixel = 0;
  const midScrollsLoop = async (fixedLut, scrollLength) => {
    const fixedFixedLut = fixedLut;
    // eslint-disable-next-line consistent-return
    setTimeout(() => {
      if (counter === fixedFixedLut.length - 1) {
        return total;
      }
      scrollPixel = Math.floor(fixedFixedLut[counter + 1].x) - Math.floor(fixedFixedLut[counter].x);
      scroller(scrollPixel);
      total += scrollPixel;
      if (counter === scrollLength - 2) {
        counter = 2;
        return total;
      }
      counter += 1;
      midScrollsLoop(fixedFixedLut, scrollLength);
    }, await randomInteger(30, 45));
  };

  const midScrolls = async (wheelCount) => {
    const endScroll = PIXELPERWHEEL * wheelCount;

    const curve = await new Bezier(0, 0, 0, endScroll, endScroll, 0, endScroll, endScroll);
    const scrollLength = await decideScrollLength(wheelCount);
    const lut = await curve.getLUT(scrollLength);

    const fixedLut = await fixFirstThreeScrolls(lut);
    counter = 2;
    return midScrollsLoop(fixedLut, scrollLength);
  };

  const oneWheelScroller = async () => {
    // list of prerecorded scrolls in Chrome 121
    let distances = [
      [ 1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16, 17, 19, 19, 20, 22, 22, 24, 24, 25, 25, 24, 24, 22, 20, 18, 16, 13, 10, 8, 6, 3, 2], // 500
      [ 1, 1, 2, 3, 4, 5, 7, 9, 11, 13, 15, 17, 22, 26, 30, 33, 37, 37, 36, 36, 34, 33, 31, 29, 26, 23, 20, 16, 13, 11, 7, 6, 3, 2, 1], // 600
      [ 1, 1, 2, 2, 3, 4, 4, 6, 8, 10, 12, 14, 16, 17, 19, 22, 23, 25, 27, 29, 31, 30, 31, 30, 29, 27, 27, 24, 23, 20, 18, 16, 13, 11, 8, 7, 4, 3, 2, 1], // 600
      [ 1, 1, 2, 2, 3, 4, 4, 7, 8, 11, 13, 15, 18, 22, 25, 30, 33, 34, 36, 36, 36, 35, 35, 34, 31, 28, 25, 20, 17, 13, 10, 6, 4, 1], // 600
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 11, 12, 14, 16, 18, 20, 23, 26, 28, 30, 31, 31, 31, 30, 27, 23, 20, 16, 12, 8, 5, 1], // 500
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 5, 7, 7, 7, 9, 9, 10, 12, 13, 15, 17, 19, 20, 21, 23, 24, 26, 27, 29, 29, 31, 30, 30, 28, 27, 24, 20, 18, 16, 15, 15, 14, 12, 12, 11, 9, 8, 7, 5, 5, 3, 2, 1, 1, 1], // 700
      [ 1, 1, 2, 2, 3, 5, 6, 9, 10, 13, 15, 18, 20, 23, 25, 29, 31, 33, 34, 33, 33, 32, 31, 29, 28, 26, 26, 24, 23, 21, 20, 18, 16, 14, 12, 9, 8, 6, 4, 3, 2, 1, 1], // 700
      [ 1, 1, 3, 3, 5, 6, 8, 11, 13, 17, 20, 24, 27, 31, 33, 36, 39, 41, 42, 43, 40, 38, 33, 28, 22, 17, 14, 14, 12, 13, 11, 10, 10, 8, 7, 5, 5, 3, 2, 2, 1, 1], // 700
      [ 1, 1, 2, 2, 3, 4, 5, 7, 9, 12, 15, 19, 22, 26, 29, 32, 35, 37, 38, 37, 36, 34, 32, 30, 27, 24, 21, 17, 14, 10, 8, 5, 3, 2, 1], // 600
      [ 1, 1, 3, 3, 5, 7, 11, 14, 18, 22, 25, 30, 31, 31, 31, 31, 29, 29, 27, 26, 23, 21, 18, 16, 13, 10, 8, 6, 5, 3, 1, 1], // 500
      [ 1, 1, 2, 2, 3, 4, 5, 7, 9, 11, 14, 16, 22, 27, 32, 37, 37, 39, 39, 38, 39, 37, 35, 32, 30, 29, 27, 25, 23, 19, 16, 14, 10, 7, 5, 3, 2, 1], // 700
      [ 1, 1, 2, 3, 4, 5, 8, 9, 11, 13, 15, 17, 19, 19, 19, 20, 21, 21, 22, 22, 22, 23, 22, 22, 22, 21, 20, 18, 17, 14, 12, 11, 8, 6, 5, 3, 2], // 500
      [ 1, 1, 2, 3, 3, 5, 7, 10, 11, 13, 15, 18, 19, 21, 23, 25, 25, 27, 26, 25, 25, 23, 23, 21, 21, 18, 17, 14, 13, 11, 9, 7, 5, 5, 3, 2, 2, 1], // 500
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 12, 13, 13, 13, 12, 12, 11, 11, 9, 8, 7, 6, 5, 4, 3, 2, 2], // 300
      [ 1, 1, 2, 2, 3, 3, 4, 5, 4, 6, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 10, 10, 11, 12, 11, 13, 12, 13, 12, 13, 12, 11, 10, 10, 8, 8, 6, 5, 4, 3, 2, 2], // 300
      [ 1, 1, 2, 2, 3, 5, 5, 6, 8, 10, 13, 15, 18, 23, 27, 34, 40, 45, 50, 53, 52, 49, 43, 35, 31, 28, 26, 22, 18, 14, 10, 6, 3, 2], // 700
      [ 2, 2, 2, 3, 5, 5, 6, 10, 12, 17, 21, 27, 33, 39, 45, 49, 53, 54, 51, 47, 40, 31, 23, 15, 7, 1], // 600
      [ 1, 1, 2, 3, 4, 6, 8, 11, 15, 21, 26, 33, 37, 40, 44, 46, 46, 45, 45, 44, 41, 38, 34, 29, 25, 19, 14, 11, 6, 4, 1], // 700
      [ 1, 1, 2, 2, 3, 4, 7, 9, 13, 18, 25, 30, 36, 40, 45, 50, 51, 52, 50, 45, 39, 31, 22, 15, 8, 1], // 600
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 5, 6, 6, 7, 8, 10, 14, 18, 26, 32, 39, 45, 49, 53, 54, 57, 57, 56, 52, 47, 41, 32, 24, 17, 10, 4], // 800
      [ 1, 1, 2, 2, 3, 5, 6, 8, 10, 14, 19, 26, 32, 37, 43, 46, 47, 46, 42, 36, 29, 22, 14, 8, 1], // 500
      [ 2, 2, 2, 3, 4, 5, 8, 12, 17, 25, 32, 39, 42, 43, 44, 46, 45, 44, 41, 37, 31, 26, 20, 15, 9, 5, 1], // 600
      [ 1, 1, 2, 3, 5, 6, 10, 11, 14, 16, 18, 20, 23, 25, 27, 30, 31, 33, 33, 33, 31, 29, 26, 22, 18, 13, 10, 6, 3], // 500
      [ 1, 1, 2, 2, 3, 3, 4, 5, 6, 8, 9, 12, 15, 18, 21, 24, 25, 27, 28, 29, 30, 31, 30, 31, 30, 30, 28, 27, 25, 21, 19, 16, 13, 10, 7, 5, 3, 1], // 600
      [ 1, 1, 2, 4, 5, 7, 10, 18, 25, 31, 38, 42, 47, 51, 54, 57, 56, 55, 51, 44, 36, 28, 20, 11, 6], // 700
      [ 1, 1, 2, 3, 5, 7, 11, 17, 23, 31, 35, 40, 45, 49, 52, 52, 51, 47, 40, 33, 25, 17, 10, 3], // 600
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 8, 9, 14, 19, 25, 30, 36, 40, 45, 47, 46, 47, 45, 44, 42, 38, 33, 29, 23, 18, 13, 9, 6, 3], // 700
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 7, 7, 10, 11, 12, 14, 16, 16, 18, 18, 19, 18, 18, 19, 17, 18, 17, 16, 15, 14, 13, 12, 10, 9, 8, 6, 5, 4, 3, 2, 1, 1], // 400
      [ 1, 1, 2, 2, 3, 3, 4, 6, 7, 9, 12, 15, 21, 26, 31, 36, 41, 43, 44, 43, 40, 34, 28, 22, 15, 8, 3], // 500
      [ 2, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 9, 10, 12, 11, 13, 14, 15, 16, 17, 17, 19, 19, 19, 19, 19, 17, 17, 14, 13, 12, 9, 7, 6, 4, 2, 1], // 400
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 8, 9, 11, 13, 14, 16, 16, 18, 18, 20, 20, 21, 21, 21, 20, 20, 19, 17, 15, 14, 11, 9, 7, 5, 3, 2], // 400
      [ 1, 1, 2, 2, 3, 3, 4, 5, 6, 8, 10, 12, 15, 19, 25, 30, 35, 36, 38, 39, 40, 39, 39, 39, 37, 35, 33, 31, 26, 23, 19, 15, 11, 9, 5, 4, 1], // 700
      [ 1, 1, 2, 3, 4, 7, 10, 14, 19, 23, 26, 28, 30, 33, 34, 35, 36, 35, 34, 32, 30, 28, 27, 23, 21, 17, 14, 11, 9, 5, 4, 2, 2], // 600
      [ 1, 1, 2, 2, 4, 4, 7, 10, 16, 23, 30, 35, 40, 45, 48, 49, 49, 48, 47, 44, 41, 37, 32, 26, 20, 16, 11, 7, 4, 1], // 700
      [ 1, 1, 2, 3, 4, 5, 8, 12, 15, 20, 26, 33, 40, 46, 50, 51, 51, 50, 49, 45, 42, 37, 31, 26, 19, 15, 9, 6, 3], // 700
      [ 1, 1, 2, 2, 3, 3, 4, 5, 4, 6, 5, 6, 6, 6, 6, 6, 5, 5, 5, 4, 4, 3, 3, 2, 1, 1, 1, 1, 1, 3, 3, 4, 6, 7, 8, 9, 11, 14, 16, 18, 22, 26, 28, 31, 34, 36, 37, 35, 34, 30, 26, 22, 16, 12, 7, 3], // 600
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8, 9, 9, 11, 11, 12, 13, 14, 16, 17, 19, 19, 20, 21, 22, 23, 23, 24, 25, 25, 25, 24, 24, 23, 21, 19, 17, 15, 12, 10, 7, 6, 3, 2], // 600
      [ 1, 1, 2, 2, 3, 4, 4, 6, 7, 7, 9, 9, 11, 12, 13, 15, 17, 18, 20, 21, 22, 24, 24, 25, 25, 26, 25, 25, 23, 21, 19, 16, 13, 11, 8, 6, 3, 2], // 500
      [ 1, 1, 2, 2, 3, 3, 4, 5, 4, 6, 5, 7, 7, 7, 9, 9, 11, 11, 13, 13, 14, 15, 16, 16, 17, 17, 18, 18, 18, 17, 17, 16, 15, 13, 12, 10, 8, 7, 5, 4, 3, 1], // 400
      [ 1, 1, 2, 3, 3, 7, 10, 14, 20, 27, 32, 39, 44, 48, 50, 52, 52, 53, 50, 47, 41, 34, 27, 20, 17, 16, 16, 14, 13, 11, 10, 8, 6, 4, 4, 2, 1, 1], // 800
      [ 1, 1, 2, 3, 4, 6, 7, 12, 15, 22, 27, 34, 40, 45, 49, 52, 54, 56, 57, 56, 54, 50, 44, 36, 28, 21, 14, 8, 2], // 800
      [ 1, 1, 2, 2, 3, 5, 7, 11, 16, 23, 31, 38, 45, 52, 57, 56, 54, 50, 47, 43, 37, 32, 26, 20, 15, 11, 7, 4, 2, 2], // 700
      [ 1, 1, 2, 2, 3, 5, 7, 9, 12, 18, 24, 31, 37, 40, 41, 43, 44, 43, 42, 41, 40, 37, 34, 31, 27, 23, 18, 15, 11, 8, 5, 3, 2], // 700
      [ 2, 2, 3, 4, 7, 10, 17, 24, 32, 39, 43, 44, 45, 46, 44, 43, 41, 37, 32, 26, 22, 15, 11, 7, 4], // 600
      [ 2, 2, 2, 3, 3, 4, 4, 5, 6, 5, 6, 6, 6, 6, 5, 6, 5, 5, 6, 6, 5, 6, 7, 6, 6, 7, 6, 7, 6, 7, 8, 7, 8, 8, 9, 8, 9, 9, 8, 8, 9, 7, 7, 7, 6, 6, 4, 4, 4, 3, 2, 1, 1, 1], // 300
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 5, 6, 6, 6, 6, 6, 5, 5, 5, 5, 4, 6, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 2, 2, 1, 1, 1], // 200
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 5, 6, 6, 6, 7, 8, 7, 8, 8, 8, 9, 8, 9, 8, 9, 8, 7, 7, 7, 5, 5, 5, 4, 3, 2, 2, 1, 1], // 200
      [ 1, 1, 2, 2, 3, 3, 4, 5, 4, 6, 5, 6, 6, 6, 6, 6, 5, 5, 5, 4, 4, 3, 3, 2, 1, 1, 1], // 100
      [ 1, 1, 2, 2, 3, 3, 4, 5, 6, 6, 7, 9, 10, 12, 13, 14, 16, 16, 17, 18, 18, 18, 18, 18, 19, 18, 17, 17, 15, 14, 13, 12, 9, 9, 6, 5, 4, 3, 1, 1], // 400
      [ 1, 1, 2, 2, 3, 5, 6, 9, 11, 14, 16, 21, 25, 30, 33, 36, 37, 38, 39, 38, 38, 36, 33, 30, 26, 25, 22, 22, 20, 18, 15, 13, 11, 9, 6, 4, 3, 1, 1], // 700
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 7, 7, 7, 9, 9, 10, 11, 11, 12, 12, 12, 13, 14, 13, 14, 13, 13, 13, 12, 11, 10, 9, 8, 7, 5, 4, 4, 2, 1, 1], // 300
      [ 1, 1, 2, 2, 3, 3, 4, 5, 7, 8, 10, 12, 13, 16, 17, 18, 21, 21, 24, 24, 24, 24, 24, 23, 22, 22, 21, 19, 19, 16, 15, 13, 11, 9, 7, 6, 5, 3, 3, 1, 1], // 500
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 6, 8, 8, 8, 9, 9, 10, 10, 10, 10, 10, 10, 9, 9, 9, 9, 9, 9, 9, 9, 8, 9, 7, 8, 7, 7, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1], // 300
      [ 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 10, 12, 13, 15, 16, 17, 18, 18, 18, 19, 19, 19, 18, 19, 18, 19, 18, 18, 18, 16, 17, 15, 14, 13, 12, 10, 9, 7, 7, 5, 4, 3, 4, 5, 4, 5, 4, 5, 6, 5, 5, 6, 5, 6, 5, 5, 5, 5, 4, 4, 4, 5, 5, 5, 5, 6, 6, 5, 6, 7, 6, 6, 6, 5, 6, 5, 5, 4, 4, 3, 3, 3, 2, 1, 2, 1], // 700
      [ 1, 1, 2, 2, 4, 5, 5, 8, 9, 13, 15, 19, 24, 30, 37, 43, 47, 48, 50, 50, 50, 48, 48, 45, 42, 37, 32, 26, 21, 16, 10, 7, 4, 1, 1, 1, 2, 2, 3, 3, 4, 5, 5, 5, 6, 5, 6, 6, 6, 6, 6, 5, 4, 5, 3, 3, 3, 2, 1, 1, 1], // 900
      [ 1, 1, 2, 2, 3, 3, 5, 5, 6, 9, 10, 12, 15, 18, 20, 24, 26, 29, 32, 32, 34, 35, 35, 35, 34, 33, 30, 27, 24, 22, 22, 20, 18, 17, 14, 13, 10, 7, 6, 4, 3, 1, 1], // 700
      [ 1, 1, 2, 2, 4, 6, 8, 11, 12, 15, 17, 19, 22, 25, 28, 30, 32, 33, 35, 37, 37, 37, 35, 33, 30, 25, 21, 17, 12, 8, 4, 1], // 600
      [ 1, 1, 2, 3, 4, 5, 7, 9, 12, 15, 19, 24, 29, 36, 42, 47, 49, 48, 49, 46, 46, 43, 41, 38, 35, 32, 28, 24, 20, 15, 12, 8, 5, 3, 1, 1], // 800
      [ 1, 1, 2, 2, 3, 5, 5, 6, 8, 12, 14, 19, 21, 26, 30, 33, 35, 37, 39, 41, 41, 40, 38, 36, 34, 31, 28, 25, 22, 18, 14, 11, 8, 6, 4, 2, 1, 1], // 700
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 6, 8, 9, 10, 12, 14, 17, 21, 24, 29, 31, 33, 33, 34, 33, 34, 32, 32, 29, 26, 24, 20, 16, 13, 10, 7, 4, 2], // 600
      [ 2, 2, 2, 3, 3, 5, 5, 6, 8, 11, 14, 17, 20, 24, 26, 30, 33, 37, 40, 43, 43, 44, 41, 38, 32, 26, 20, 14, 8, 3], // 600
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 5, 8, 10, 13, 16, 20, 23, 26, 26, 28, 30, 32, 33, 35, 36, 37, 35, 33, 31, 27, 22, 18, 13, 10, 5, 2], // 600
      [ 2, 2, 2, 3, 5, 5, 8, 10, 12, 17, 21, 27, 32, 37, 41, 42, 42, 40, 37, 36, 33, 29, 27, 22, 18, 15, 12, 8, 6, 4, 3, 1, 1], // 600
      [ 1, 1, 2, 2, 4, 6, 9, 12, 15, 20, 23, 26, 28, 30, 32, 36, 37, 40, 41, 41, 40, 36, 33, 27, 22, 16, 12, 6, 2], // 600
      [ 1, 1, 3, 3, 5, 6, 8, 11, 15, 21, 28, 33, 39, 45, 46, 45, 42, 41, 37, 34, 30, 27, 21, 18, 14, 10, 7, 4, 3, 1, 1], // 600
      [ 1, 1, 2, 2, 3, 5, 7, 9, 12, 14, 17, 23, 28, 35, 42, 47, 52, 54, 54, 51, 44, 38, 33, 31, 27, 23, 18, 12, 8, 5, 1, 1], // 700
      [ 1, 1, 3, 3, 7, 10, 14, 22, 29, 34, 40, 45, 50, 54, 55, 53, 49, 42, 34, 26, 17, 9, 2], // 600
      [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 5, 6, 8, 11, 14, 17, 23, 29, 36, 43, 48, 52, 54, 53, 49, 45, 42, 37, 31, 25, 18, 11, 7, 4, 1], // 700
      [ 1, 1, 2, 2, 3, 5, 6, 9, 13, 20, 27, 33, 38, 44, 49, 53, 58, 59, 59, 55, 49, 41, 31, 22, 14, 6], // 700
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 7, 9, 13, 17, 24, 30, 36, 41, 47, 51, 56, 60, 61, 62, 60, 54, 46, 38, 28, 20, 10, 4], // 800
      [ 1, 1, 2, 4, 4, 9, 12, 19, 24, 31, 38, 44, 49, 50, 52, 52, 52, 49, 47, 41, 36, 28, 22, 16, 10, 6, 1], // 700
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 7, 7, 8, 9, 9, 10, 11, 11, 12, 13, 13, 13, 14, 14, 14, 14, 13, 13, 12, 11, 9, 9, 7, 7, 5, 4, 2, 2, 1], // 300
      [ 1, 1, 2, 2, 3, 3, 5, 5, 7, 9, 12, 18, 25, 30, 35, 40, 44, 47, 47, 47, 45, 43, 41, 37, 33, 29, 24, 20, 15, 12, 8, 5, 3, 2], // 700
      [ 1, 1, 2, 3, 4, 6, 8, 11, 14, 20, 25, 31, 37, 41, 45, 46, 46, 42, 37, 36, 32, 29, 25, 20, 15, 11, 6, 4, 2], // 600
      [ 2, 3, 4, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 3], // 93
      [ 1, 1, 2, 3, 5, 6, 9, 12, 15, 19, 22, 26, 29, 31, 31, 30, 30, 29, 27, 26, 24, 23, 19, 18, 15, 12, 10, 8, 6, 4, 3, 2, 2], // 500
      [ 2, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 7, 9, 9, 10, 11, 12, 12, 13, 14, 15, 14, 15, 15, 14, 13, 13, 11, 10, 9, 7, 6, 5, 3, 2, 1], // 300
      [ 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 7, 9, 9, 9, 11, 10, 11, 12, 12, 13, 12, 13, 14, 13, 13, 12, 12, 12, 10, 10, 8, 7, 6, 5, 4, 3, 2, 2], // 300
    ];

    await page.evaluate(
      (direction, oneWheelSmoothScrolls) => {
        return new Promise((resolve, reject) => {
          let i = 0;
          setInterval(() => {
            window.scrollBy(0, direction * oneWheelSmoothScrolls[i]);
            i += 1;
            if (i === (oneWheelSmoothScrolls.length - 1)) {
              clearInterval();
              resolve();
            }
          }, 50);
        });
      },
      direction,
      distances[Math.floor(Math.random() * distances.length)]
    );
  };

  const actions = {
    scroll: async (wheelCount, where = 'down') => {
      direction = ('down' === where) ? 1 : -1;
      if (wheelCount === 1) {
        console.log('one wheel:', wheelCount, direction)
        await oneWheelScroller();
        return;
      }

      const middleScrollCount = await midScrolls(wheelCount, direction);
    },
  };
  return actions;
};

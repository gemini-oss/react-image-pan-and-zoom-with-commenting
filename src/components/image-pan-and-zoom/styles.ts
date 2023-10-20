import styled from "@emotion/styled";
import { ZINDEX } from "../../constants";

type ContainerProps = {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
};

const StyledMainContainer = styled("div")<ContainerProps>(
  ({ primaryColor, secondaryColor, tertiaryColor }) => `
    &.is-fullscreen {
      background-color: ${secondaryColor};
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }

    .wrapper {
      box-sizing: border-box;
      position: relative;
      width: 100%;
      user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      touch-action: auto;
      overflow: hidden;

      &.pan-and-zoom {
        cursor: default;
        touch-action: none;
      }

      &.is-panning {
        cursor: move !important;
      }
    }

    .click-canvas {
      transform-origin: 0 0;
      will-change: transform;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      background-color: transparent;

      &.pan-and-zoom {
        opacity: 0;
      }
    }

    .container--loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.85);
      z-index: ${ZINDEX.panAndZoomLoader};
      position: absolute;
      top: 0;
      left: 0;

      > div:first-of-type {
        flex-grow: 0;
      }

      .image-loading-text,
      .image-error-text {
        margin-top: 12px;
        font-weight: 900;
        color: ${tertiaryColor};
        width: 100%;
        text-align: center;
      }
    }

    .container--img-preview {
      position: absolute;
      display: none;
      top: 125px;
      right: 20px;
      width: 100px;
      height: 56px;
      background-color: transparent;
      align-items: center;
      justify-content: center;
      opacity: 0;

      &.show {
        display: flex;
      }

      &.loaded {
        opacity: 1;
      }

      .wrapper--img-preview {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .zoom-box {
        will-change: transform;
        position: absolute;
        top: 0;
        left: 0;
        width: 100px;
        outline: 2px solid #fff;
        border-radius: 5px;
      }

      img {
        border-radius: 5px;
        width: 100%;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
      }
    }

    .container--image {
      width: 100%;
      will-change: transform;
      outline: none;
      border: none;
      box-sizing: border-box;

      img {
        transform-origin: 0 0;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        opacity: 0;
        -webkit-touch-callout: none;
        touch-callout: none;
        border-radius: 5px;
        will-change: unset;
        box-sizing: border-box;

        &.pan-and-zoom {
          border-radius: 0;
          position: absolute;
          top: 0;
          left: 0;
        }

        &.zoom-support-image {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 1;
          display: block;
          width: 100%;
        }
      }
    }

    .zoom-support-scaled {
      position: fixed;
      top: 0;
      left: 0;
      opacity: 0.01;
      z-index: -1;
      display: none;
    }

    .zoom-percent {
      user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.25);
      color: ${primaryColor};
      padding: 8px 15px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      transition: opacity 250ms;
      text-align: center;

      opacity: 0;
      pointer-events: none;

      &.is-zooming {
        opacity: 1;
      }
    }

    .container--cta-pan-and-zoom {
      box-sizing: border-box;
      position: absolute;
      bottom: 25px;
      right: 15px;
      display: flex;
      align-items: flex-end;
      flex-direction: column;
      justify-content: end;
      gap: 10px;
    }

    .button--close-pan-zoom {
      position: absolute;
      top: 15px;
      right: 15px;
    }

    .button--activate-pan-zoom {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 105px;
      height: 40px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      cursor: zoom-in;
      padding: 12px 24px;
      text-transform: uppercase;
      font-weight: 900;
      font-size: 14px;
      font-family: inherit;
      line-height: 20px;
      background-color: ${secondaryColor};
      outline: 2px solid ${primaryColor};
      color: ${primaryColor};
      border: none;
      padding: 0 12px;
      border-radius: 5px;

      &:focus-visible {
        outline: 2px solid ${tertiaryColor};
        background-color: ${tertiaryColor};
        color: ${primaryColor};
      }

      &:hover {
        background-color: ${primaryColor};
        outline: 2px solid ${tertiaryColor};
        color: ${secondaryColor};
      }

      &:active {
        outline: 2px solid ${primaryColor};
        background-color: ${tertiaryColor};
        color: ${primaryColor};
      }

      &:disabled {
        opacity: 0.5;
        cursor: default;
      }
    }
  `
);

export default StyledMainContainer;

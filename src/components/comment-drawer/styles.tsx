import styled from "@emotion/styled";
import { COMMENT_DRAWER_WIDTH, ZINDEX } from "../../constants";

type ContainerProps = {
  primaryColor: string;
  tertiaryColor: string;
};

export const StyledBackDrop = styled("div")`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0px;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-tap-highlight-color: transparent;

  &.closed {
    display: none;
  }
`;

const StyledDrawer = styled("div")<ContainerProps>(
  ({ primaryColor, tertiaryColor }) => `
    z-index: ${ZINDEX.commentDrawer};
    position: fixed;
    top: 0;
    left: 0;
    right: auto;
    bottom: auto;
    overflow-y: auto;
    height: 100%;
    transform: none;
    transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
    background-color: ${primaryColor};
    width: ${COMMENT_DRAWER_WIDTH}px;

    &.closed {
      overflow-y: unset !important;
      pointer-events: none;
      transform: translateX(-${COMMENT_DRAWER_WIDTH}px);
    }

    .content--list-item {
      width: 100%;
      padding: 0;
      margin: 0;
      box-sizing: border-box;

      .title {
        font-size: 12px;
        line-height: 16px;
        font-weight: 900;
        margin-bottom: 4px;
      }

      p {
        color: #000;
        font-family: inherit;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
        margin: 0;
        padding: 0;
        word-wrap: break-word;
        white-space: pre-wrap;
      }
    }

    hr {
      position: absolute;
      bottom: -10px;
      padding: 0;
      left: 5%;
      width: 90%;
      height: 0.5px;
      background: #cccdcd;
      opacity: 0.25;
    }

    .button--list-item {
      box-sizing: border-box;
      width: 100%;
      cursor: pointer;
      display: flex;
      margin: 0;
      padding: 15px;
      transition: background-color 250ms;

      &:focus-visible {
        background-color: rgba(238, 230, 217, 0.18);
      }

      &.selected {
        background-color: ${tertiaryColor};
      }

      &.disabled {
        cursor: default;
        opacity: 0.5;
      }
    }

    .container--close {
      display: block;
      z-index: ${ZINDEX.commentDrawerClose};
      position: sticky;
      top: 0;
      left: 0;
      width: 100%;
      height: 65px;
      background-color: ${primaryColor};

      button {
        position: absolute;
        top: 15px;
        left: 15px;
        width: 40px;
        height: 40px;
      }
    }
  `
);

export default StyledDrawer;

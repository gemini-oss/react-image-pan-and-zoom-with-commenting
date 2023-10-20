import styled from "@emotion/styled";
import { ZINDEX } from "../../constants";

type ContainerProps = {
  tertiaryColor: string;
};

const StyledContainer = styled("div")<ContainerProps>(
  ({ tertiaryColor }) => `
    width: 58px;
    height: 38px;
    overflow: hidden;
    padding: 12px;
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    left: 12px;

    &.disabled {
      opacity: 0.5;
    }

    .wrapper--thumb {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background-color: transparent;
      outline: 0;
      border: 0;
      margin: 0;
      cursor: pointer;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      vertical-align: middle;
      color: inherit;
      padding: 9px;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      color: #fff;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

      &.checked {
        transform: translateX(20px);
      }
    }

    .thumb {
      box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
        0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
      background-color: currentColor;
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .track {
      height: 100%;
      width: 100%;
      border-radius: 7px;
      transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
        background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      background-color: ${tertiaryColor};
    }

    input {
      left: -100%;
      width: 300%;
      cursor: inherit;
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      margin: 0;
      padding: 0;
      z-index: ${ZINDEX.commentToggleSwitch};
    }
  `
);

export default StyledContainer;

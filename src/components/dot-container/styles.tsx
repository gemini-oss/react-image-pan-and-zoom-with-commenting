import styled from "@emotion/styled";
import { ZINDEX } from "../../constants";

const StyledContainer = styled("div")`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  pointer-events: none;
  opacity: 1;
  transform-origin: 0 0;
  will-change: transform;
  display: none;
  z-index: ${ZINDEX.dotContainer};

  .button--dot {
    position: absolute;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    cursor: default;
    outline: none;
    border: none;
    transition: opacity 250ms;

    &.enable {
      pointer-events: auto;
      cursor: pointer;
    }

    &.disabled {
      cursor: default;
    }
  }
`;

export default StyledContainer;

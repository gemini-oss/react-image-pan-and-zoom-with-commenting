import styled from "@emotion/styled";
import { ZINDEX } from "./constants";

const StyledContainer = styled("div")`
  .button--comment-drawer {
    position: fixed;
    top: 15px;
    left: 15px;
  }

  .badge--make-observation {
    pointer-events: none;
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 12px 10px 10px;
    background-color: rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    padding: 8px 12px;
    font-weight: 600;
  }
`;

type ActiveDotProps = {
  size: number;
  primaryColor: string;
};

export const ActiveDot = styled("div")<ActiveDotProps>(
  ({ primaryColor, size }) => `
    width: ${size}px;
    height: ${size}px;
    background-color: ${primaryColor};
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    display: none;
    z-index: ${ZINDEX.activeDot};
  `
);

export default StyledContainer;

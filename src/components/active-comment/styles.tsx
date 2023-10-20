import styled from "@emotion/styled";
import { ZINDEX, ACTIVE_COMMENT_MAX_WIDTH } from "../../constants";

type ContainerProps = {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
};

const StyledContainer = styled("div")<ContainerProps>(
  ({ primaryColor, secondaryColor, tertiaryColor }) => `
    position: fixed;
    top: 0;
    left: 0;
    border-radius: 8px;
    border: 1px solid ${tertiaryColor};
    z-index: ${ZINDEX.activeComment};
    background-color: ${primaryColor};
    padding: 10px 15px 15px 20px;
    width: 100%;
    max-width: ${ACTIVE_COMMENT_MAX_WIDTH}px;
    overflow-y: auto;
    display: none;
    pointer-events: auto;
    max-height: 340px;
    box-sizing: border-box;

    .title {
      font-size: 12px;
      line-height: 16px;
      font-weight: 900;
      margin-bottom: 4px;
    }

    p {
      max-height: 100%;
      overflow-y: auto;
      margin: 0;
      padding: 0;
      font-size: 12px;
      font-weight: 600;
      color: ${secondaryColor};
      white-space: pre-wrap;
    }

    .button--close {
      margin-left: auto;
    }
  `
);

export default StyledContainer;

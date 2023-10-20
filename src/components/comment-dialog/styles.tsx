import styled from "@emotion/styled";
import { COMMENT_DIALOG_WIDTH, ZINDEX } from "../../constants";

type ContainerProps = {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
};

const StyledMainContainer = styled("div")<ContainerProps>(
  ({ primaryColor, secondaryColor, tertiaryColor }) => `
  pointer-events: auto;
  display: none;
  box-sizing: border-box;
  width: ${COMMENT_DIALOG_WIDTH}px;
  color: ${secondaryColor};
  background-color: ${primaryColor};
  border: 2px solid ${tertiaryColor};
  position: absolute;
  box-shadow: rgb(0 0 0 / 20%) 0px 11px 15px -7px,
    rgb(0 0 0 / 14%) 0px 24px 38px 3px, rgb(0 0 0 / 12%) 0px 9px 46px 8px;
  border-radius: 8px;
  z-index: ${ZINDEX.commentDialog};

  .wrapper {
    position: relative;
    padding: 15px;

    > span:first-of-type {
      display: block;
      margin: 0;
      padding: 0;
      font-family: inherit;
      font-size: 24px;
      font-weight: 900;
    }
  }

  .button--close {
    margin: 0 0 0 auto;
    position: relative;
    top: 10px;
    right: 10px;
  }

  .secondary-heading {
    margin: 0;
    padding: 0;
    font-family: inherit;
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
  }

  .container--textarea {
    position: relative;

    .comment-textarea {
      margin-top: 10px;
      height: 187px;
      overflow-y: auto;
      resize: none;
      padding: 12px 12px;
      border: 1px dashed ${tertiaryColor} !important;
      color: inherit;
      font-family: inherit;
      font-size: 16px;
      font-weight: 600;
      width: 100%;
      background-color: inherit;
      border-radius: 4px;
      line-height: 20px;
      box-sizing: border-box;

      &.confirmation {
        height: 127px;
      }

      &:read-only {
        border-color: transparent !important;
      }

      &:disabled {
        border: 1px dashed ${primaryColor} !important;
      }

      &::placeholder {
        font-size: 12px;
        color: rgba(238, 230, 217, 0.4);
      }

      &:focus,
      &:focus-visible {
        outline: none;
      }
    }

    .character-count {
      position: absolute;
      bottom: -15px;
      right: 0px;
      font-family: inherit;
      display: inline-flex;
      justify-content: end;
      width: 100%;
      font-size: 12px;
      padding-right: 4px;

      &.limitReached {
        color: red;
        font-weight: 900;
      }
    }
  }

  .container--checkbox {
    color: inherit;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;

    input {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }
  }

  .container--cta-dialog {
    margin-top: 24px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;

    button {
      height: 38px;
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
      cursor: pointer;

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
        background-color: ${secondaryColor};
        outline: 2px solid ${primaryColor};
        color: ${primaryColor};
        opacity: 0.5;
      }
    }
  }
`
);

export default StyledMainContainer;

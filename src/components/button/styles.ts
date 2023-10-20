import styled from "@emotion/styled";

type ButtonProps = {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
};

const StyledButton = styled("button")<ButtonProps>(
  ({ primaryColor, secondaryColor, tertiaryColor }) => `
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    background-color: ${primaryColor};
    outline: 2px solid ${tertiaryColor};
    border-radius: 50%;
    width: 35px;
    height: 35px;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;

    svg {
      color: ${secondaryColor};
    }

    &:focus-visible {
      outline-offset: -2px;
      outline: 2px solid ${tertiaryColor};
    }

    &:hover {
      background: ${secondaryColor};
      color: ${primaryColor};

      svg {
        color: ${primaryColor};
      }
    }

    &:active {
      outline: 2px solid transparent;
      background: ${tertiaryColor};
      color: ${primaryColor};

      svg {
        color: ${primaryColor};
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  `
);

export default StyledButton;

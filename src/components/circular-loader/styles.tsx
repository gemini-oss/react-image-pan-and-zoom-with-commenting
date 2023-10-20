import styled from "@emotion/styled";

type ContainerProps = {
  size: number;
  primaryColor: string;
};

const StyledMainContainer = styled("span")<ContainerProps>(
  ({ size, primaryColor }) => `
  @keyframes rotateAnimation {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dashAnimation {
    0% {
      stroke-dasharray: 1px, 200px;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -15px;
    }

    100% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -125px;
    }
  }

  animation: rotateAnimation 1.4s linear infinite;
  width: ${size}px;
  height: ${size}px;
  display: block;
  
  .circular-svg {
    color: ${primaryColor};
    stroke: ${primaryColor};
    animation: dashAnimation 1.4s ease-in-out infinite;
  }

  .svg-circle {
    color: ${primaryColor};
    stroke: ${primaryColor};
  }
`
);

export default StyledMainContainer;

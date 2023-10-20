import React from "react";
import StyledMainContainer from "./styles";

type CircularLoaderProps = {
  size?: number;
  primaryColor: string;
};

const CircularLoader = ({ size = 30, primaryColor }: CircularLoaderProps) => {
  return (
    <StyledMainContainer size={size} primaryColor={primaryColor}>
      <svg className="circular-svg css-13o7eu2" viewBox="22 22 44 44">
        <circle
          className="svg-circle"
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          strokeWidth="3.6"
        ></circle>
      </svg>
    </StyledMainContainer>
  );
};

export default CircularLoader;

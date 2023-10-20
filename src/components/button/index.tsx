import React from "react";
import StyledButton from "./styles";

type ButtonProps = {
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  dataTestId?: string;
  children: React.ReactElement | string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  onClick?: () => void;
};

const Button = ({
  disabled = false,
  ariaLabel,
  className,
  dataTestId,
  children,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  onClick,
}: ButtonProps) => {
  return (
    <StyledButton
      disabled={disabled}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      className={className}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      tertiaryColor={tertiaryColor}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};

export default Button;

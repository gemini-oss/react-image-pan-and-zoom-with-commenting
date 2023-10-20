import React from "react";
import clsx from "clsx";
import StyledContainer from "./styles";

type CommentDisplaySwitchProps = {
  disabled?: boolean;
  checked: boolean;
  tertiaryColor: string;
  onChange: () => void;
};

const CommentDisplaySwitch = ({
  disabled = false,
  checked,
  tertiaryColor,
  onChange,
}: CommentDisplaySwitchProps) => {
  const containerClassName = clsx({
    "comment-display-switch": true,
    disabled,
  });
  const wrapperThumbClassName = clsx({
    "wrapper--thumb": true,
    checked,
  });

  return (
    <StyledContainer
      className={containerClassName}
      tertiaryColor={tertiaryColor}
    >
      <span className={wrapperThumbClassName}>
        <span className="thumb" />
        <input
          data-testid="commentDisplaySwitch"
          type="checkbox"
          onChange={onChange}
          checked={checked}
          disabled={disabled}
        />
      </span>
      <span className="track" />
    </StyledContainer>
  );
};

export default CommentDisplaySwitch;

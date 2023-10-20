import React from "react";
import { X } from "react-feather";
import Button from "../button";
import StyledContainer from "./styles";

type ActiveCommentProps = {
  title: string;
  disabled?: boolean;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  comment: string | null;
  onClose: () => void;
};

const ActiveComment = React.forwardRef(
  (props: ActiveCommentProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const {
      title,
      disabled,
      comment,
      primaryColor,
      secondaryColor,
      tertiaryColor,
      onClose,
    } = props;

    return (
      <StyledContainer
        ref={ref}
        className="active-comment"
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
        data-testid='activeComment'
      >
        <Button
          disabled={disabled}
          dataTestId='activeCommentCloseButton'
          ariaLabel="close active comment"
          className="button--close"
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          tertiaryColor={tertiaryColor}
          onClick={onClose}
        >
          <X />
        </Button>
        <div data-testid='activeCommentTitle' className="title">{title}</div>
        <p>{comment}</p>
      </StyledContainer>
    );
  }
);

export default ActiveComment;

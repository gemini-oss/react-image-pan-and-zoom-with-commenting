import React from "react";
import clsx from "clsx";
import { X } from "react-feather";
import Button from "../button";
import StyledMainContainer from "./styles";
import CircularLoader from "../circular-loader";

type CommentDialogProps = {
  value: string;
  maxLimit?: number;
  disabled?: boolean;
  isCommentSubmitLoading?: boolean;
  commentConfirmed: boolean;
  commentDialogHeadingText?: string;
  commentDialogSecondaryHeadingText?: string;
  commentDialogConfirmHeadingText?: string;
  commentDialogConfirmSecondaryHeadingText?: string;
  commentDialogConfirmCheckboxText?: string;
  commentDialogTextAreaPlaceholderText?: string;
  commentDialogBackButtonText?: string;
  commentDialogCancelButtonText?: string;
  commentDialogSubmitButtonText?: string;
  commentDialogReviewButtonText?: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  onChange: (val: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onCommentConfirm: (val: boolean) => void;
};

const CommentDialog = (
  props: CommentDialogProps,
  ref: React.Ref<HTMLDivElement> | undefined
) => {
  const {
    value,
    maxLimit = 512,
    disabled = false,
    isCommentSubmitLoading = false,
    commentConfirmed = false,
    commentDialogHeadingText = "What Do You See?",
    commentDialogSecondaryHeadingText = "Make an observation.",
    commentDialogConfirmHeadingText = "Confirmation",
    commentDialogConfirmSecondaryHeadingText = `As a last step please confirm your submission. Once it's submitted, it can't be undone.`,
    commentDialogConfirmCheckboxText = `I understand this can't be undone`,
    commentDialogTextAreaPlaceholderText = "",
    commentDialogBackButtonText = "Back",
    commentDialogCancelButtonText = "Cancel",
    commentDialogSubmitButtonText = "Submit",
    commentDialogReviewButtonText = "Review",
    primaryColor,
    secondaryColor,
    tertiaryColor,
    onChange,
    onCancel,
    onSubmit,
    onCommentConfirm,
  } = props;
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [displayConfirmation, setDisplayConfirmation] = React.useState(false);
  const textAreaClassName = clsx({
    "comment-textarea": true,
    confirmation: displayConfirmation,
  });
  const characterCntClassName = clsx({
    "character-count": true,
    limitReached: value?.length === maxLimit,
  });

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLimit) return;

    if (onChange) onChange(e.target.value);
  };

  const handleCloseDialog = () => {
    setDisplayConfirmation(false);

    if (onCancel) onCancel();
    onCommentConfirm(false);
  };

  const handleCancelBtnClick = () => {
    if (displayConfirmation) {
      setDisplayConfirmation(false);

      textAreaRef.current?.focus();
      onCommentConfirm(false);
    } else {
      setDisplayConfirmation(false);

      if (onChange) onChange("");
      if (onCancel) onCancel();
    }
  };

  const handleSubmitBtnClick = () => {
    if (displayConfirmation) {
      setDisplayConfirmation(false);
      onCommentConfirm(false);

      if (onSubmit) onSubmit();
    } else {
      setDisplayConfirmation(true);
    }
  };

  return (
    <StyledMainContainer
      ref={ref}
      className="comment-dialog"
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      tertiaryColor={tertiaryColor}
      data-testid="commentDialog"
    >
      <Button
        ariaLabel="close dialog"
        className="button--close"
        data-testid="commentDialogCloseButton"
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
        disabled={disabled || isCommentSubmitLoading}
        onClick={handleCloseDialog}
      >
        <X />
      </Button>
      <section className="wrapper">
        <span data-testid="commentDialogHeading">
          {!displayConfirmation
            ? commentDialogHeadingText
            : commentDialogConfirmHeadingText}
        </span>
        <p className="secondary-heading" data-testid="commentDialogSecHeading">
          {!displayConfirmation
            ? commentDialogSecondaryHeadingText
            : commentDialogConfirmSecondaryHeadingText}
        </p>
        <section className="container--textarea">
          <textarea
            data-testid="commentDialogTextarea"
            ref={textAreaRef}
            className={textAreaClassName}
            readOnly={displayConfirmation}
            disabled={disabled || isCommentSubmitLoading}
            placeholder={commentDialogTextAreaPlaceholderText}
            onChange={handleCommentChange}
            value={value}
          />
          {displayConfirmation ? null : (
            <span
              className={characterCntClassName}
            >{`${value?.length}/${maxLimit}`}</span>
          )}
        </section>
        {displayConfirmation && (
          <section className="container--checkbox">
            <input
              data-testid="commentDialogCheckbox"
              id="confirm-checkbox"
              type="checkbox"
              checked={commentConfirmed}
              onChange={() => onCommentConfirm(!commentConfirmed)}
            />
            <label htmlFor="confirm-checkbox">
              {commentDialogConfirmCheckboxText}
            </label>
          </section>
        )}
        <div className="container--cta-dialog">
          <button
            data-testid="commentDialogCancelButton"
            className="button--cancel"
            disabled={disabled || isCommentSubmitLoading}
            onClick={handleCancelBtnClick}
          >
            {displayConfirmation
              ? commentDialogBackButtonText
              : commentDialogCancelButtonText}
          </button>
          <button
            data-testid="commentDialogSubmitButton"
            className="button--submit"
            disabled={
              (!commentConfirmed && displayConfirmation) ||
              value?.trim()?.length === 0 ||
              disabled ||
              isCommentSubmitLoading
            }
            onClick={handleSubmitBtnClick}
          >
            {isCommentSubmitLoading ? (
              <CircularLoader size={25} primaryColor={primaryColor} />
            ) : displayConfirmation ? (
              commentDialogSubmitButtonText
            ) : (
              commentDialogReviewButtonText
            )}
          </button>
        </div>
      </section>
    </StyledMainContainer>
  );
};

export default React.forwardRef(CommentDialog);

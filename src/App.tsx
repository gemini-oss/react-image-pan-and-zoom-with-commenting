import React from "react";
import { List } from "react-feather";
import ImagePanAndZoom, {
  ImageZoomCallBackProps,
} from "./components/image-pan-and-zoom";
import CommentDialog from "./components/comment-dialog";
import CommentDrawer from "./components/comment-drawer";
import DotContainer, {
  CommentDotProps,
  DotContainerMethodProps,
} from "./components/dot-container";
import Button from "./components/button";
import CommentDisplaySwitch from "./components/comment-display-switch";
import ActiveComment from "./components/active-comment";
import reducer, { ActionType, getInitialState } from "./reducers/core";
import { calcDistance, isNumeric } from "./utils";
import {
  ACTIVE_COMMENT_MAX_WIDTH,
  COMMENT_DRAWER_WIDTH,
  DOT_DISTANCE_ALLOWANCE,
  ZOOM_TO_COMMENT_YOFFSET,
} from "./constants";
import StyledContainer, { ActiveDot } from "./styles";

type AppProps = {
  panAndZoomEnabledOnMount?: boolean;
  src: string | undefined;
  previewBoxSrc: string;
  smallerSrc?: string;
  comments?: CommentDotProps[];
  isLoading?: boolean;
  isCommentSubmitLoading?: boolean;
  enableCommentDrop?: boolean;
  enablePanAndZoomControls?: boolean;
  enablePanAndZoomPreview?: boolean;
  persistCommentDrawerWhenOpen?: boolean;
  addingCommentsToTheFront?: boolean;
  zoomToPercent?:
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36
    | 37
    | 38
    | 39
    | 40
    | 41
    | 42
    | 43
    | 44
    | 45
    | 46
    | 47
    | 48
    | 49
    | 50;
  dotSize?: number;
  buttonEnablePanZoomText?: string;
  makeObservationText?: string;
  commentDialogHeadingText?: string;
  commentDialogSecondaryHeadingText?: string;
  commentDialogConfirmHeadingText?: string;
  commentDialogConfirmSecondaryHeadingText?: string;
  commentDialogConfirmCheckboxText?: string;
  commentDialogTextAreaPlaceholderText?: string;
  commentDialogCancelButtonText?: string;
  commentDialogBackButtonText?: string;
  commentDialogReviewButtonText?: string;
  commentDialogSubmitButtonText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  dotColor?: string;
  activeDotColor?: string;
  imgLoader?: React.ReactElement | string | undefined;
  zoomSupportLoader?: React.ReactElement | string | undefined;
  errorDisplay?: React.ReactElement | string | undefined;
  onCommentSubmit?: (comment: CommentDotProps) => void;
  onImageLoad?: () => void;
  onTogglePanAndZoom?: (enabled: boolean) => void;
};

function App({
  panAndZoomEnabledOnMount = false,
  src,
  previewBoxSrc,
  smallerSrc,
  comments = [],
  isLoading = false,
  isCommentSubmitLoading = false,
  enableCommentDrop = true,
  persistCommentDrawerWhenOpen = true,
  addingCommentsToTheFront = false,
  enablePanAndZoomControls = true,
  enablePanAndZoomPreview = true,
  zoomToPercent = 50,
  dotSize = 20,
  buttonEnablePanZoomText = "Observe",
  makeObservationText = "Make Observation",
  commentDialogHeadingText = "What Do You See?",
  commentDialogSecondaryHeadingText = "Make an observation.",
  commentDialogConfirmHeadingText = "Confirmation",
  commentDialogConfirmSecondaryHeadingText = `As a last step please confirm your submission. Once it's submitted, it can't be undone.`,
  commentDialogConfirmCheckboxText = `I understand this can't be undone`,
  commentDialogTextAreaPlaceholderText = "",
  commentDialogCancelButtonText = "Cancel",
  commentDialogBackButtonText = "Back",
  commentDialogReviewButtonText = "Review",
  commentDialogSubmitButtonText = "Submit",
  primaryColor = "#fff",
  secondaryColor = "#000",
  tertiaryColor = "#aaa",
  dotColor = "red",
  activeDotColor = "orange",
  imgLoader,
  zoomSupportLoader,
  errorDisplay,
  onCommentSubmit,
  onImageLoad,
  onTogglePanAndZoom,
}: AppProps) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const validQueryParams =
    enableCommentDrop &&
    isNumeric(urlSearchParams.get("x")) &&
    isNumeric(urlSearchParams.get("y"));
  const [state, dispatch] = React.useReducer(reducer, getInitialState());
  const [hasMainImageLoaded, setHasMainImageLoaded] = React.useState(false);
  const activeCommentRef = React.useRef<HTMLDivElement>(null);
  const actveDotRef = React.useRef<HTMLDivElement>(null);
  const dotContainerRef = React.useRef<DotContainerMethodProps>(null);
  const zoomToTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const commentDialogRef = React.useRef<HTMLDivElement>(null);
  const imgPanZoomRef = React.useRef<ImagePanAndZoom>(null);
  const currentCommentDialogPos = React.useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const currentDotContainerSize = React.useRef<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const isDisabled = isLoading || isCommentSubmitLoading || false;

  const handleOpenCommentDialog = ({
    x,
    y,
    width,
    height,
  }: ImageZoomCallBackProps) => {
    if (!enableCommentDrop) return;
    for (const drop of comments) {
      if (
        calcDistance(x * width, y * height, drop.x * width, drop.y * height) <=
        DOT_DISTANCE_ALLOWANCE
      ) {
        return;
      }
    }

    if (commentDialogRef.current && actveDotRef.current) {
      handleCloseActiveComment();

      if (!state.displayComments)
        dispatch({ type: ActionType.TOGGLE_COMMENT_DISPLAY, payload: true });

      if (dotContainerRef.current) {
        dotContainerRef.current.toggleContainerDisplay(true);
      }

      setCommentDialogPos(x, y, width, height);
    }
  };

  const handleCloseCommentDialog = () => {
    if (commentDialogRef.current && actveDotRef.current) {
      commentDialogRef.current.style.display = "none";
      actveDotRef.current.style.display = "none";
    }
  };

  const handleSubmitComment = () => {
    if (onCommentSubmit)
      onCommentSubmit({
        x: currentCommentDialogPos.current.x,
        y: currentCommentDialogPos.current.y,
        comment: state.commentDialogValue,
      });
  };

  const handleZoomToLocation = (drop: CommentDotProps, index: number) => () => {
    if (imgPanZoomRef.current) {
      handleCloseCommentDialog();

      const { x, y, width, height, animate } =
        imgPanZoomRef.current.zoomToLocation({
          x: drop.x,
          y: drop.y,
          xOffset: !persistCommentDrawerWhenOpen
            ? -ACTIVE_COMMENT_MAX_WIDTH
            : COMMENT_DRAWER_WIDTH - ACTIVE_COMMENT_MAX_WIDTH,
          yOffset: ZOOM_TO_COMMENT_YOFFSET,
          xValMin: !persistCommentDrawerWhenOpen ? 0 : COMMENT_DRAWER_WIDTH,
        });

      if (dotContainerRef.current) {
        dispatch({
          type: ActionType.SET_ACTIVE_COMMENT,
          payload: {
            value: comments[index].comment as string,
            index,
          },
        });

        if (!state.displayComments) {
          dispatch({
            type: ActionType.TOGGLE_COMMENT_DISPLAY,
            payload: true,
          });
        }

        if (!persistCommentDrawerWhenOpen)
          dispatch({ type: ActionType.TOGGLE_DRAWER, payload: false });

        if (animate) dotContainerRef.current.toggleContainerDisplay(false);

        handleClearZoomToTimeout();

        if (dotContainerRef.current) {
          dotContainerRef.current.updateDimensions({ x, y, width, height });
          currentDotContainerSize.current.width = width;
          currentDotContainerSize.current.height = height;
        }

        if (animate) {
          zoomToTimeoutRef.current = setTimeout(() => {
            if (dotContainerRef.current)
              dotContainerRef.current.toggleContainerDisplay(true);

            setActiveCommentPos(index, width, height);
          }, 1000);
        } else {
          if (dotContainerRef.current)
            dotContainerRef.current.toggleContainerDisplay(true);

          setActiveCommentPos(index, width, height);
        }
      }
    }
  };

  const handleClearZoomToTimeout = () => {
    if (zoomToTimeoutRef.current) {
      clearTimeout(zoomToTimeoutRef.current);
      zoomToTimeoutRef.current = null;
    }
  };

  const handleCloseActiveComment = () => {
    dispatch({
      type: ActionType.SET_ACTIVE_COMMENT,
      payload: {
        index: -1,
        value: "",
      },
    });

    if (activeCommentRef.current)
      activeCommentRef.current.style.display = "none";
  };

  const setCommentDialogPos = (x: number, y: number, w: number, h: number) => {
    if (commentDialogRef.current && actveDotRef.current) {
      let commentLocX = w * x;
      let commentLocY = h * y;

      currentCommentDialogPos.current.x = x;
      currentCommentDialogPos.current.y = y;

      commentDialogRef.current.style.opacity = "0";
      commentDialogRef.current.style.display = "block";
      commentDialogRef.current.style.top = "auto";
      commentDialogRef.current.style.left = "auto";
      commentDialogRef.current.style.transform = `translate(${commentLocX}px, ${commentLocY}px)`;

      requestAnimationFrame(() => {
        if (commentDialogRef.current && actveDotRef.current) {
          const commentDialogRect =
            commentDialogRef.current.getBoundingClientRect();

          if (
            commentDialogRect.y + commentDialogRect.height >
            window.innerHeight
          ) {
            commentLocY = h * y - commentDialogRect.height;
          }

          if (
            commentDialogRect.x + commentDialogRect.width >
            window.innerWidth
          ) {
            commentLocX -= Math.abs(
              commentDialogRect.right - window.innerWidth
            );
          }

          commentDialogRef.current.style.transform = `translate(${commentLocX}px, ${commentLocY}px)`;
          commentDialogRef.current.querySelector("textarea")?.focus();
          commentDialogRef.current.style.opacity = "1";

          actveDotRef.current.style.display = "block";
          actveDotRef.current.style.left = `${w * x}px`;
          actveDotRef.current.style.top = `${h * y}px`;
        }
      });
    }
  };

  const setActiveCommentPos = (index: number, w: number, h: number) => {
    if (activeCommentRef.current && imgPanZoomRef.current) {
      const comment = comments[index];
      const x = comment.x * w;
      const y = comment.y * h;

      activeCommentRef.current.style.opacity = "0";
      activeCommentRef.current.style.display = "block";
      activeCommentRef.current.style.top = "auto";
      activeCommentRef.current.style.left = "auto";
      activeCommentRef.current.style.transform = `translate(${x}px, ${y}px)`;

      requestAnimationFrame(() => {
        if (activeCommentRef.current) {
          const activeCommentRect =
            activeCommentRef.current.getBoundingClientRect();
          let activeLocX = x;
          let activeLocY = y;

          if (
            activeCommentRect.y + activeCommentRect.height >
            window.innerHeight
          ) {
            activeLocY = y - activeCommentRect.height;
          }

          if (
            activeCommentRect.x + activeCommentRect.width >
            window.innerWidth
          ) {
            activeLocX = x - activeCommentRect.width;
          }

          activeCommentRef.current.style.transform = `translate(${activeLocX}px, ${activeLocY}px)`;
          activeCommentRef.current.style.opacity = "1";
        }
      });
    }
  };

  React.useEffect(() => {
    if (panAndZoomEnabledOnMount && dotContainerRef.current)
      dotContainerRef.current.toggleContainerDisplay(true);

    // Prevent default browser zoom
    const handleGestureStart = (e: Event) => e.preventDefault();
    const handlePreventDefaultZoom = (e: WheelEvent) => {
      const { ctrlKey } = e;
      if (ctrlKey) {
        e.preventDefault();
      }
    };

    document.body.addEventListener("wheel", handlePreventDefaultZoom, {
      passive: false,
    });

    document.addEventListener("gesturestart", handleGestureStart);

    return () => {
      document.removeEventListener("gesturestart", handleGestureStart);
      document.body.removeEventListener("wheel", handlePreventDefaultZoom);
    };
  }, []);

  React.useEffect(() => {
    if (
      state.panAndZoomEnabled &&
      Array.isArray(comments) &&
      comments.length > 0
    ) {
      const commentIndex = addingCommentsToTheFront ? 0 : comments.length - 1;

      setActiveCommentPos(
        commentIndex,
        currentDotContainerSize.current.width,
        currentDotContainerSize.current.height
      );

      dispatch({
        type: ActionType.COMMENT_DIALOG_CHANGE,
        payload: "",
      });

      dispatch({
        type: ActionType.SET_ACTIVE_COMMENT,
        payload: {
          value: comments[commentIndex].comment as string,
          index: commentIndex,
        },
      });

      handleCloseCommentDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  React.useEffect(() => {
    if (
      validQueryParams &&
      Array.isArray(comments) &&
      comments.length > 0 &&
      hasMainImageLoaded
    ) {
      if (imgPanZoomRef.current) {
        const xCoordParamValue = urlSearchParams.get("x") as unknown as number;
        const yCoordParamValue = urlSearchParams.get("y") as unknown as number;
        const commentIndex = comments.findIndex((comment) => {
          return (
            Number(comment.x) === Number(xCoordParamValue) &&
            Number(comment.y) === Number(yCoordParamValue)
          );
        });

        dispatch({ type: ActionType.TOGGLE_COMMENT_DISPLAY, payload: true });
        dispatch({ type: ActionType.TOGGLE_PAN_AND_ZOOM, payload: true });
        dispatch({
          type: ActionType.SET_ACTIVE_COMMENT,
          payload: {
            value: comments[commentIndex].comment as string,
            index: commentIndex,
          },
        });

        if (imgPanZoomRef.current && commentIndex !== -1) {
          const commentDetails = comments[commentIndex];
          const { x, y, width, height } = imgPanZoomRef.current.zoomToLocation({
            x: commentDetails.x,
            y: commentDetails.y,
            xOffset: -ACTIVE_COMMENT_MAX_WIDTH,
            yOffset: ZOOM_TO_COMMENT_YOFFSET,
          });

          if (dotContainerRef.current) {
            handleClearZoomToTimeout();

            dotContainerRef.current.toggleContainerDisplay(true);
            dotContainerRef.current.updateDimensions({ x, y, width, height });

            currentDotContainerSize.current = { width, height };

            setActiveCommentPos(commentIndex, width, height);
          }
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMainImageLoaded]);

  return (
    <StyledContainer>
      <ImagePanAndZoom
        ref={imgPanZoomRef}
        disabled={isDisabled}
        enableControls={enablePanAndZoomControls}
        enableZoomPreview={enablePanAndZoomPreview}
        src={src}
        smallerSrc={smallerSrc}
        previewBoxSrc={previewBoxSrc}
        isPanZoomActive={panAndZoomEnabledOnMount ?? validQueryParams}
        imgLoader={imgLoader}
        zoomSupportLoader={zoomSupportLoader}
        errorDisplay={errorDisplay}
        buttonEnablePanZoomText={buttonEnablePanZoomText}
        zoomToPercent={zoomToPercent}
        isAndroid={/Android/i.test(navigator.userAgent)}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
        elementBlockPanAndZoom={[activeCommentRef, commentDialogRef]}
        limitXOffset={
          state.drawerOpen && persistCommentDrawerWhenOpen
            ? COMMENT_DRAWER_WIDTH
            : 0
        }
        controls={
          <>
            {enableCommentDrop && (
              <span
                data-testid='makeObservationBadge'
                className="badge--make-observation"
                style={{ color: primaryColor }}
              >
                {makeObservationText}
              </span>
            )}
            {enableCommentDrop && (
              <CommentDisplaySwitch
                checked={state.displayComments}
                disabled={isDisabled}
                tertiaryColor={tertiaryColor}
                onChange={() => {
                  dispatch({
                    type: ActionType.TOGGLE_COMMENT_DISPLAY,
                    payload: !state.displayComments,
                  });
                }}
              />
            )}
            {enableCommentDrop && state.panAndZoomEnabled && comments.length > 0 ? (
              <Button
                ariaLabel="open comment drawer"
                dataTestId="commentDrawerButton"
                className="button--comment-drawer"
                disabled={isDisabled}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
                onClick={() => {
                  dispatch({
                    type: ActionType.TOGGLE_DRAWER,
                    payload: !state.drawerOpen,
                  });

                  if (!state.displayComments)
                    dispatch({
                      type: ActionType.TOGGLE_COMMENT_DISPLAY,
                      payload: true,
                    });
                }}
              >
                <List />
              </Button>
            ) : null}
          </>
        }
        onPanZoomActivate={(val: boolean) => {
          dispatch({ type: ActionType.TOGGLE_PAN_AND_ZOOM, payload: val });

          if (!val) {
            dispatch({ type: ActionType.TOGGLE_DRAWER, payload: false });
          }

          if (dotContainerRef.current) {
            dotContainerRef.current.toggleContainerDisplay(val);
          }

          if (onTogglePanAndZoom) {
            onTogglePanAndZoom(val);
          }
        }}
        onImageLoad={() => {
          if (onImageLoad) onImageLoad();
          setHasMainImageLoaded(true);
        }}
        onCanvasClick={handleOpenCommentDialog}
        onResize={({ x, y, width, height, fromWindowEvent }) => {
          handleCloseActiveComment();
          if (!isCommentSubmitLoading) {
            handleCloseCommentDialog();
          } else {
            setCommentDialogPos(
              currentCommentDialogPos.current.x,
              currentCommentDialogPos.current.y,
              width,
              height
            );
          }
          handleClearZoomToTimeout();

          if (dotContainerRef.current) {
            dotContainerRef.current.updateDimensions({ x, y, width, height });

            currentDotContainerSize.current.width = width;
            currentDotContainerSize.current.height = height;
          }

          if (fromWindowEvent && state.drawerOpen)
            dispatch({ type: ActionType.TOGGLE_DRAWER, payload: false });

          dispatch({
            type: ActionType.TOGGLE_COMMENT_CONFIRMATION,
            payload: false,
          });
        }}
        onZoom={() => {
          handleCloseCommentDialog();
          handleClearZoomToTimeout();

          if (dotContainerRef.current) {
            dotContainerRef.current.toggleContainerDisplay(false);
          }
        }}
        onZoomEnd={({ x, y, width, height }) => {
          if (state.activeComment.index !== -1) {
            setActiveCommentPos(state.activeComment.index, width, height);
          }

          if (dotContainerRef.current) {
            dotContainerRef.current.toggleContainerDisplay(true);
            dotContainerRef.current.updateDimensions({ x, y, width, height });

            currentDotContainerSize.current.width = width;
            currentDotContainerSize.current.height = height;
          }
        }}
        onPanStart={handleClearZoomToTimeout}
        onPanMove={({ x, y, width, height }) => {
          if (dotContainerRef.current) {
            dotContainerRef.current.toggleContainerDisplay(false);
            dotContainerRef.current.updateDimensions({ x, y, width, height });
            currentDotContainerSize.current.width = width;
            currentDotContainerSize.current.height = height;
          }
        }}
        onPanEnd={() => {
          if (dotContainerRef.current) {
            dotContainerRef.current.toggleContainerDisplay(true);
          }

          if (state.activeComment.index !== -1) {
            setActiveCommentPos(
              state.activeComment.index,
              currentDotContainerSize.current.width,
              currentDotContainerSize.current.height
            );
          }
        }}
      >
        {enableCommentDrop ? (
          <DotContainer
            ref={dotContainerRef}
            displayDots={state.displayComments}
            disabled={isDisabled}
            activeDotIndex={state.activeComment.index}
            dotSize={dotSize}
            dotColor={dotColor}
            dots={comments}
            onDotClick={(comment, index) => {
              handleCloseCommentDialog();

              dispatch({
                type: ActionType.SET_ACTIVE_COMMENT,
                payload: {
                  index,
                  value: comment,
                },
              });

              setActiveCommentPos(
                index,
                currentDotContainerSize.current.width,
                currentDotContainerSize.current.height
              );
            }}
          >
            <>
              <CommentDialog
                ref={commentDialogRef}
                value={state.commentDialogValue}
                isCommentSubmitLoading={isCommentSubmitLoading}
                commentConfirmed={state.commentConfirmed}
                commentDialogHeadingText={commentDialogHeadingText}
                commentDialogSecondaryHeadingText={
                  commentDialogSecondaryHeadingText
                }
                commentDialogConfirmHeadingText={
                  commentDialogConfirmHeadingText
                }
                commentDialogConfirmSecondaryHeadingText={
                  commentDialogConfirmSecondaryHeadingText
                }
                commentDialogConfirmCheckboxText={
                  commentDialogConfirmCheckboxText
                }
                commentDialogTextAreaPlaceholderText={
                  commentDialogTextAreaPlaceholderText
                }
                commentDialogBackButtonText={commentDialogBackButtonText}
                commentDialogCancelButtonText={commentDialogCancelButtonText}
                commentDialogSubmitButtonText={commentDialogSubmitButtonText}
                commentDialogReviewButtonText={commentDialogReviewButtonText}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
                onChange={(val: string) => {
                  dispatch({
                    type: ActionType.COMMENT_DIALOG_CHANGE,
                    payload: val,
                  });
                }}
                onCancel={handleCloseCommentDialog}
                onSubmit={handleSubmitComment}
                onCommentConfirm={(val) =>
                  dispatch({
                    type: ActionType.TOGGLE_COMMENT_CONFIRMATION,
                    payload: val,
                  })
                }
              />
              <ActiveDot
                ref={actveDotRef}
                className="active-dot"
                size={dotSize}
                primaryColor={activeDotColor}
                data-testid='activeDot'
              />
              <ActiveComment
                ref={activeCommentRef}
                disabled={isDisabled}
                title={`Comment #${state.activeComment.index + 1}`}
                comment={state.activeComment.value as string | null}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tertiaryColor={tertiaryColor}
                onClose={handleCloseActiveComment}
              />
            </>
          </DotContainer>
        ) : null}
      </ImagePanAndZoom>
      {enableCommentDrop ? (
        <CommentDrawer
          open={state.drawerOpen}
          enableTint={!persistCommentDrawerWhenOpen}
          disabled={isDisabled}
          comments={comments}
          activeCommentIndex={state.activeComment.index}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          tertiaryColor={tertiaryColor}
          onDrawerClose={() => {
            if (isDisabled) return;

            handleClearZoomToTimeout();

            dispatch({ type: ActionType.TOGGLE_DRAWER, payload: false });

            if (imgPanZoomRef.current) {
              const newValues = imgPanZoomRef.current.resetZoomLocation();

              if (newValues !== null) {
                if (dotContainerRef.current) {
                  dotContainerRef.current.updateDimensions({
                    x: newValues.x,
                    y: newValues.y,
                    width: currentDotContainerSize.current.width,
                    height: currentDotContainerSize.current.height,
                  });
                }
              }
            }
          }}
          onListItemClick={handleZoomToLocation}
        />
      ) : null}
    </StyledContainer>
  );
}

export default App;

import React, { CSSProperties } from "react";
import clsx from "clsx";
import { VariableSizeList } from "react-window";
import { List as ListIcon } from "react-feather";
import AutoSizer from "react-virtualized-auto-sizer";
import { COMMENT_DRAWER_WIDTH } from "../../constants";
import Button from "../button";
import { CommentDotProps } from "../dot-container";
import StyledDrawer, { StyledBackDrop } from "./styles";

type CommentDrawerProps = {
  commentTitlePrefix?: string;
  open: boolean;
  comments: CommentDotProps[];
  activeCommentIndex: number;
  disabled?: boolean;
  enableTint?: boolean;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  onDrawerClose?: () => void;
  onListItemClick?: (drop: CommentDotProps, index: number) => () => void;
};

type RowHeightProps = {
  [index: number]: number;
};

const ROW_DEFAULT_HEIGHT = 125;

const CommentDrawer = (props: CommentDrawerProps, ref: React.Ref<unknown>) => {
  const listRef = React.useRef<VariableSizeList<unknown> | null>(null);
  const rowHeights = React.useRef<RowHeightProps>({});
  const {
    commentTitlePrefix = "Comment #",
    open,
    comments,
    activeCommentIndex,
    disabled = false,
    enableTint = false,
    primaryColor,
    secondaryColor,
    tertiaryColor,
    onDrawerClose,
    onListItemClick,
  } = props;

  const handleKeyUpHandler = (e: KeyboardEvent) => {
    if (open && e.key === "Escape" && onDrawerClose) {
      onDrawerClose();
    }
  };

  const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const rowRef = React.useRef<HTMLDivElement>(null);
    const drop = comments[index];
    const listItemlassName = clsx({
      "button--list-item": true,
      selected: index === activeCommentIndex,
      disabled,
    });

    React.useEffect(() => {
      const curRowHeight = rowHeights.current?.[index];
      if (rowRef.current) rowRef.current.style.height = "auto";
      if (
        rowRef.current &&
        curRowHeight !== rowRef.current.getBoundingClientRect().height
      ) {
        // @ts-ignore
        listRef.current.resetAfterIndex(index);
        rowHeights.current[index] =
          rowRef.current.getBoundingClientRect().height;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (drop === undefined) return null;

    return (
      <div
        data-testid={`commentDrawerListItem_${index}`}
        ref={rowRef}
        role="button"
        tabIndex={0}
        className={listItemlassName}
        style={style}
        onClick={() => {
          if (onListItemClick) {
            onListItemClick(drop, index)();
          }
        }}
      >
        <div className="content--list-item">
          <div className="title">
            {commentTitlePrefix}&nbsp;{index + 1}
          </div>
          <p>{drop?.comment}</p>
        </div>
        <hr />
      </div>
    );
  };

  React.useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      // Calling this twice ensures that it will scroll to the item position
      // @ts-ignore
      listRef.current.scrollToItem(index, "center");
      setTimeout(() => {
        // @ts-ignore
        listRef.current.scrollToItem(index, "center");
      }, 0);
    },
  }));

  React.useEffect(() => {
    document.addEventListener("keyup", handleKeyUpHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {enableTint && (
        <StyledBackDrop
          className={clsx({
            "comment-drawer-tint": true,
            closed: !open,
          })}
          onClick={onDrawerClose}
        />
      )}
      <StyledDrawer
        className={clsx({
          "comment-drawer": true,
          closed: !open,
        })}
        primaryColor={primaryColor}
        tertiaryColor={tertiaryColor}
        data-testid="commentDrawer"
      >
        <section className="container--close">
          <Button
            disabled={disabled}
            dataTestId="commentDrawerCloseButton"
            ariaLabel="close comment drawer"
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tertiaryColor={tertiaryColor}
            onClick={onDrawerClose}
          >
            <ListIcon />
          </Button>
        </section>
        <AutoSizer disableWidth>
          {({ height }: { height: number }) => {
            return (
              <VariableSizeList
                ref={listRef}
                height={height - 80}
                itemCount={(comments.length ?? 0) + 1}
                itemSize={(index: number) =>
                  rowHeights?.current?.[index] ?? ROW_DEFAULT_HEIGHT
                }
                width={COMMENT_DRAWER_WIDTH}
                innerElementType={React.forwardRef(
                  (
                    innerProps: { style: React.CSSProperties; rest: unknown },
                    innerRef: React.LegacyRef<HTMLDivElement>
                  ) => {
                    const { style, ...rest } = innerProps;
                    return (
                      <div
                        ref={innerRef}
                        style={{
                          ...style,
                          height: `${parseFloat(style.height as string)}px`,
                        }}
                        {...rest}
                      />
                    );
                  }
                )}
              >
                {Row}
              </VariableSizeList>
            );
          }}
        </AutoSizer>
      </StyledDrawer>
    </>
  );
};

export default React.forwardRef(CommentDrawer);

import clsx from "clsx";
import React from "react";
import { ZINDEX } from "../../constants";
import StyledContainer from "./styles";

export type CommentDotProps = {
  x: number;
  y: number;
  comment: string;
};

export type DotContainerDimensionProps = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DotContainerMethodProps = {
  updateDimensions: ({
    x,
    y,
    width,
    height,
  }: DotContainerDimensionProps) => void;
  toggleContainerDisplay: (val: boolean) => void;
};

type DotContainerProps = {
  activeDotIndex: number;
  displayDots: boolean;
  disabled?: boolean;
  dotSize?: number;
  dotColor?: string;
  dots: CommentDotProps[];
  children?: React.ReactElement;
  onDotClick: (comment: string, index: number) => void;
};

const DotContainer = React.forwardRef(
  (
    props: DotContainerProps,
    ref: React.ForwardedRef<DotContainerMethodProps>
  ) => {
    const {
      activeDotIndex,
      disabled,
      displayDots,
      dots,
      children,
      dotSize = 20,
      dotColor = "red",
      onDotClick,
    } = props;
    const [dotContainerWidth, setDotContainerWidth] = React.useState(0);
    const [dotContainerHeight, setDotContainerHeight] = React.useState(0);
    const dotContainerRef = React.useRef<HTMLDivElement>(null);
    const buttonDotClassName = clsx({
      "button--dot": true,
      enable: displayDots,
      disabled,
    });

    React.useImperativeHandle(
      ref,
      () => {
        return {
          updateDimensions({
            x,
            y,
            width,
            height,
          }: DotContainerDimensionProps) {
            if (dotContainerRef.current) {
              dotContainerRef.current.style.width = `${width}px`;
              dotContainerRef.current.style.height = `${height}px`;
              dotContainerRef.current.style.transform = `translate(${x}px, ${y}px)`;

              if (width !== dotContainerWidth) setDotContainerWidth(width);
              if (height !== dotContainerHeight) setDotContainerHeight(height);
            }
          },

          toggleContainerDisplay(show: boolean = true) {
            if (dotContainerRef.current) {
              if (!show && dotContainerRef.current.style.display !== "none") {
                dotContainerRef.current.style.display = "none";
              } else if (
                show &&
                dotContainerRef.current.style.display !== "block"
              ) {
                dotContainerRef.current.style.display = "block";
              }
            }
          },
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return (
      <StyledContainer ref={dotContainerRef} className="dot-container" data-testid='dotContainer'>
        {displayDots &&
          dots.map((comment, index) => {
            return (
              <button
                key={index}
                className={buttonDotClassName}
                disabled={disabled}
                data-testid={`commentDot_${index}`}
                style={{
                  zIndex: activeDotIndex === index ? ZINDEX.activeDot : "auto",
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  left: dotContainerWidth * comment.x,
                  top: dotContainerHeight * comment.y,
                  opacity: disabled
                    ? 0.5
                    : activeDotIndex === index || activeDotIndex === -1
                    ? 1
                    : 0.25,
                  backgroundColor: dotColor,
                }}
                onClick={() => {
                  onDotClick(comment.comment as string, index);
                }}
              />
            );
          })}
        {children}
      </StyledContainer>
    );
  }
);

export default DotContainer;
